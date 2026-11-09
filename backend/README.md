# Face Feeling Atlas — Inference Backend

This backend provides real-time Deep Learning inference for the Face Feeling Atlas project:
- **Face Detection:** YOLOv8 Pose / YOLOv8 Detection (`yolov8n-pose.pt` / `yolov8n.pt`)
- **Emotion Recognition:** Vision Transformer / Swin Architecture (`trpakov/vit-face-expression`)

---

## Quick Start

### 1. Launch the server
Double-click `start_backend.bat` or run in your terminal:
```bash
python server.py
```

The API will start at:
```
http://127.0.0.1:8000
```

### 2. Endpoints
- `GET  /api/health` — Checks status and loaded models
- `POST /api/detect-face` — Accepts image upload and returns YOLOv8 normalized bounding boxes
- `POST /api/predict-emotion` — Accepts image upload and returns emotion label, confidence, and class probabilities
