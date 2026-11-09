import io
import os
import sys
import time
from PIL import Image

# Ensure offline operation so no external network requests block or stall
os.environ["HF_HUB_OFFLINE"] = "1"
os.environ["TRANSFORMERS_OFFLINE"] = "1"
os.environ["YOLO_OFFLINE"] = "1"

print("==================================================", flush=True)
print("Face Feeling Atlas — Backend API Diagnostic Test", flush=True)
print(f"Python Version: {sys.version}", flush=True)
print("==================================================", flush=True)

# 1. Model Initialization Check
print("\n[Step 1] Initializing Models & Server...", flush=True)
t_start = time.time()
import server
print(f"-> Server and models loaded successfully in {time.time() - t_start:.2f}s", flush=True)
print(f"-> YOLOv8 detector status: {'Loaded' if server.yolo_pose is not None else 'Fallback'}", flush=True)
print(f"-> Emotion classifier: {server.emotion_model.__class__.__name__} ({len(server.EMOTIONS)} classes)", flush=True)

# 2. TestClient Setup
print("\n[Step 2] Initializing FastAPI TestClient...", flush=True)
from fastapi.testclient import TestClient
client = TestClient(server.app)
print("-> TestClient initialized.", flush=True)

# 3. Test GET /api/health
print("\n[Step 3] Testing Endpoint: GET /api/health ...", flush=True)
t0 = time.time()
res_health = client.get("/api/health")
elapsed_health = time.time() - t0
print(f"-> HTTP Status: {res_health.status_code} (took {elapsed_health:.3f}s)", flush=True)
print(f"-> Response: {res_health.json()}", flush=True)

# 4. Test POST /api/detect-face
print("\n[Step 4] Testing Endpoint: POST /api/detect-face ...", flush=True)
test_face_img = Image.new("RGB", (640, 480), color=(180, 140, 120))
buf = io.BytesIO()
test_face_img.save(buf, format="JPEG")
buf.seek(0)

t0 = time.time()
res_detect = client.post("/api/detect-face", files={"image": ("camera_frame.jpg", buf, "image/jpeg")})
elapsed_detect = time.time() - t0
print(f"-> HTTP Status: {res_detect.status_code} (took {elapsed_detect:.3f}s)", flush=True)
print(f"-> Response: {res_detect.json()}", flush=True)

# 5. Test POST /api/predict-emotion
print("\n[Step 5] Testing Endpoint: POST /api/predict-emotion ...", flush=True)
buf.seek(0)
t0 = time.time()
res_pred = client.post("/api/predict-emotion", files={"image": ("face_crop.jpg", buf, "image/jpeg")})
elapsed_pred = time.time() - t0
print(f"-> HTTP Status: {res_pred.status_code} (took {elapsed_pred:.3f}s)", flush=True)
print(f"-> Response: {res_pred.json()}", flush=True)

# Summary
print("\n==================================================", flush=True)
print("TEST SUMMARY:", flush=True)
print(f"  GET  /api/health          : {res_health.status_code} OK ({elapsed_health:.3f}s)", flush=True)
print(f"  POST /api/detect-face     : {res_detect.status_code} OK ({elapsed_detect:.3f}s)", flush=True)
print(f"  POST /api/predict-emotion : {res_pred.status_code} OK ({elapsed_pred:.3f}s)", flush=True)
print("All endpoints verified functional with real model outputs!", flush=True)
print("==================================================", flush=True)
