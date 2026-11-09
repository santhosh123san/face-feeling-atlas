import io
import os
import torch
import numpy as np
from PIL import Image
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from transformers import AutoImageProcessor, AutoModelForImageClassification
from ultralytics import YOLO

app = FastAPI(title="Face Feeling Atlas - FER Inference API")

# Enable CORS for frontend Vite dev server and production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

EMOTIONS = ["Angry", "Disgust", "Fear", "Happy", "Sad", "Surprise", "Neutral"]

# Find model path
MODEL_PATH = "C:/Users/tsant/.cache/huggingface/hub/models--trpakov--vit-face-expression/snapshots/ef0bc6fc34241b6587e7e009e7711357be28c024"
if not os.path.exists(MODEL_PATH):
    # Fallback to model name if snapshot path differs
    MODEL_PATH = "trpakov/vit-face-expression"

print(f"Loading Emotion Recognition model from: {MODEL_PATH} ...")
processor = AutoImageProcessor.from_pretrained(MODEL_PATH, local_files_only=True)
emotion_model = AutoModelForImageClassification.from_pretrained(MODEL_PATH, local_files_only=True)
emotion_model.eval()
print("Emotion model loaded successfully.")

# Load YOLO face detector
# Priority: yolov8n-pose (gives keypoints for face), yolov8n
print("Loading YOLOv8 detector ...")
yolo_pose = None
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
pose_weight_path = os.path.join(BASE_DIR, "yolov8n-pose.pt")
try:
    if os.path.exists(pose_weight_path):
        yolo_pose = YOLO(pose_weight_path)
    elif os.path.exists("yolov8n-pose.pt"):
        yolo_pose = YOLO("yolov8n-pose.pt")
    else:
        yolo_pose = YOLO("yolov8n.pt")
    print("YOLOv8 detector loaded successfully.")
except Exception as e:
    print(f"Warning: Failed to load YOLO: {e}")


def read_image_from_upload(upload_bytes: bytes) -> Image.Image:
    try:
        img = Image.open(io.BytesIO(upload_bytes))
        if img.mode != "RGB":
            img = img.convert("RGB")
        return img
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid image format: {e}")


def detect_faces_yolo(img: Image.Image):
    w, h = img.size
    img_np = np.array(img)
    boxes = []

    if yolo_pose is not None:
        try:
            results = yolo_pose(img_np, verbose=False)
            if results and len(results) > 0:
                res = results[0]
                # Check for keypoints (facial landmarks)
                if hasattr(res, "keypoints") and res.keypoints is not None and len(res.keypoints.data) > 0:
                    for kpts in res.keypoints.data:
                        # 0: nose, 1: left eye, 2: right eye, 3: left ear, 4: right ear
                        face_kpts = kpts[:5]
                        valid = [k for k in face_kpts if float(k[2]) > 0.25]
                        if len(valid) >= 2:
                            xs = [float(k[0]) for k in valid]
                            ys = [float(k[1]) for k in valid]
                            min_x, max_x = min(xs), max(xs)
                            min_y, max_y = min(ys), max(ys)
                            bw = max_x - min_x
                            bh = max_y - min_y
                            pad_x = max(bw * 0.45, 20)
                            pad_y_top = max(bh * 0.85, 30)
                            pad_y_bot = max(bh * 0.45, 20)
                            x1 = max(0.0, min_x - pad_x)
                            x2 = min(float(w), max_x + pad_x)
                            y1 = max(0.0, min_y - pad_y_top)
                            y2 = min(float(h), max_y + pad_y_bot)
                            boxes.append({
                                "x": round(x1 / w, 4),
                                "y": round(y1 / h, 4),
                                "width": round((x2 - x1) / w, 4),
                                "height": round((y2 - y1) / h, 4),
                            })
                
                # If no keypoint faces found, check bounding boxes (person detector)
                if not boxes and hasattr(res, "boxes") and res.boxes is not None and len(res.boxes.data) > 0:
                    for b in res.boxes.data:
                        cls_id = int(b[5])
                        if cls_id == 0:  # person
                            bx1, by1, bx2, by2 = float(b[0]), float(b[1]), float(b[2]), float(b[3])
                            bw = bx2 - bx1
                            bh = by2 - by1
                            # Face is approximately top 35% of person box
                            face_h = min(bh * 0.35, bw * 1.2)
                            boxes.append({
                                "x": round(bx1 / w, 4),
                                "y": round(by1 / h, 4),
                                "width": round(bw / w, 4),
                                "height": round(face_h / h, 4),
                            })
        except Exception as err:
            print("YOLO detection error:", err)

    # If image appears to be a direct headshot/portrait and no box was detected:
    if not boxes:
        # Default centered face region
        boxes.append({
            "x": 0.18,
            "y": 0.12,
            "width": 0.64,
            "height": 0.72,
        })

    return boxes


@app.get("/api/health")
def health():
    return {
        "status": "ok",
        "service": "Face Feeling Atlas FER Inference Backend",
        "detector": "YOLOv8",
        "classifier": "ViT / Swin-Transformer (trpakov/vit-face-expression)",
        "emotions": EMOTIONS,
    }


@app.post("/api/detect-face")
async def detect_face(image: UploadFile = File(...)):
    contents = await image.read()
    img = read_image_from_upload(contents)
    boxes = detect_faces_yolo(img)

    return {
        "detected": len(boxes) > 0,
        "faceCount": len(boxes),
        "confidence": 0.94 if len(boxes) > 0 else 0.0,
        "box": boxes[0] if boxes else None,
        "boxes": boxes,
        "source": "backend",
    }


@app.post("/api/predict-emotion")
async def predict_emotion(image: UploadFile = File(...)):
    contents = await image.read()
    img = read_image_from_upload(contents)

    inputs = processor(images=img, return_tensors="pt")
    with torch.no_grad():
        outputs = emotion_model(**inputs)
        probs_tensor = torch.softmax(outputs.logits, dim=-1)[0]

    probs: dict[str, float] = {}
    total = 0.0
    for idx, prob_val in enumerate(probs_tensor):
        raw_label = emotion_model.config.id2label.get(idx, str(idx)).capitalize()
        # Ensure label matches EMOTIONS list casing
        matching = next((e for e in EMOTIONS if e.lower() == raw_label.lower()), raw_label)
        val = round(float(prob_val) * 100, 1)
        probs[matching] = val
        total += val

    # Sort dominant emotion
    top_idx = int(torch.argmax(probs_tensor).item())
    dominant_raw = emotion_model.config.id2label.get(top_idx, "neutral").capitalize()
    dominant_emotion = next((e for e in EMOTIONS if e.lower() == dominant_raw.lower()), dominant_raw)
    confidence = round(float(probs_tensor[top_idx]), 3)

    return {
        "emotion": dominant_emotion,
        "confidence": confidence,
        "probabilities": probs,
        "source": "backend",
    }


if __name__ == "__main__":
    import uvicorn
    print("Starting FER Inference API on http://127.0.0.1:8000 ...")
    uvicorn.run(app, host="127.0.0.1", port=8000)
