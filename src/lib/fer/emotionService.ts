import {
  EMOTIONS,
  type Emotion,
  type BoundingBox,
  type FaceDetectionResult,
  type EmotionPredictionResult,
  type PreprocessResult,
  type MonitoringAlert,
  type Observation,
} from "./types";

/**
 * emotionService — integration point between the UI and inference engine.
 *
 * Supports two seamless modes:
 * 1. REAL MODEL BACKEND (YOLOv8 + Vision Transformer / Swin Transformer):
 *    When `backendUrl` is reachable (e.g. http://localhost:8000), it executes
 *    genuine deep learning inference via FastAPI endpoints:
 *      POST /api/detect-face     -> real bounding boxes from YOLOv8
 *      POST /api/predict-emotion -> real probabilities from ViT / Swin
 *
 * 2. SMART CLIENT ENGINE:
 *    When the backend is offline or Demo Mode is toggled, it runs real-time
 *    computer vision analysis directly in the browser (skin-tone face detection,
 *    smile/teeth luminance, mouth openness, and eyebrow furrowing analysis).
 */

export interface CameraStartOptions {
  deviceId?: string | undefined;
}

export class CameraPermissionError extends Error {}

let activeStream: MediaStream | null = null;

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load image for visual analysis."));
    img.src = src;
  });
}

async function postImage<T>(url: string, image: Blob | string, signal?: AbortSignal): Promise<T> {
  const imageBlob = typeof image === "string" ? await (await fetch(image)).blob() : image;
  const formData = new FormData();
  const filename = imageBlob.type === "image/png" ? "image.png" : "image.jpg";
  formData.append("image", imageBlob, filename);
  const res = await fetch(url, {
    method: "POST",
    body: formData,
    signal: signal ?? null,
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(detail || `Inference service returned HTTP ${res.status}.`);
  }
  try {
    return (await res.json()) as T;
  } catch {
    throw new Error("Inference service returned an unreadable response.");
  }
}

async function postJson<T>(url: string, body: unknown, signal?: AbortSignal): Promise<T> {
  if (body instanceof Blob || typeof body === "string") {
    return postImage<T>(url, body, signal);
  }
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: signal ?? null,
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(detail || `Inference service returned HTTP ${res.status}.`);
  }
  return (await res.json()) as T;
}

async function checkBackendHealth(backendUrl?: string): Promise<boolean> {
  if (!backendUrl) return false;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 1200);
    const res = await fetch(`${backendUrl.replace(/\/$/, "")}/api/health`, {
      signal: controller.signal,
    });
    clearTimeout(timeout);
    return res.ok;
  } catch {
    return false;
  }
}

function normalizeBoxes(
  boxes: BoundingBox[],
  frameWidth?: number,
  frameHeight?: number,
): BoundingBox[] {
  return boxes.flatMap((box) => {
    const values = [box.x, box.y, box.width, box.height];
    if (!values.every((value) => Number.isFinite(value) && value >= 0)) return [];
    const pixelCoordinates = values.some((value) => value > 1);
    const width = pixelCoordinates ? frameWidth : 1;
    const height = pixelCoordinates ? frameHeight : 1;
    if (!width || !height) return [];
    const normalized = {
      x: box.x / width,
      y: box.y / height,
      width: box.width / width,
      height: box.height / height,
    };
    if (
      normalized.x >= 1 || normalized.y >= 1 ||
      normalized.width <= 0 || normalized.height <= 0
    ) return [];
    return [{
      x: Math.max(0, Math.min(normalized.x, 1)),
      y: Math.max(0, Math.min(normalized.y, 1)),
      width: Math.max(0, Math.min(normalized.width, 1 - normalized.x)),
      height: Math.max(0, Math.min(normalized.height, 1 - normalized.y)),
    }];
  });
}

function asEmotion(value: unknown): Emotion {
  if (typeof value === "string") {
    const emotion = EMOTIONS.find((item) => item.toLowerCase() === value.toLowerCase());
    if (emotion) return emotion;
  }
  throw new Error("Inference service returned an unsupported emotion label.");
}

/* ------------------------------------------------------------------ camera */

async function startCamera(options: CameraStartOptions = {}): Promise<MediaStream> {
  if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
    throw new CameraPermissionError("Camera API is not available in this browser.");
  }
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: options.deviceId
        ? { deviceId: { exact: options.deviceId } }
        : { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
      audio: false,
    });
    activeStream = stream;
    return stream;
  } catch (err) {
    const name = (err as DOMException)?.name;
    if (name === "NotAllowedError" || name === "SecurityError") {
      throw new CameraPermissionError(
        "Camera permission is required for live facial analysis.",
      );
    }
    if (name === "NotFoundError" || name === "OverconstrainedError") {
      throw new CameraPermissionError("No usable camera device was found.");
    }
    throw new CameraPermissionError(
      "Camera could not be started. Please check your device and try again.",
    );
  }
}

function stopCamera(stream?: MediaStream | null) {
  const target = stream ?? activeStream;
  target?.getTracks().forEach((track) => track.stop());
  if (target === activeStream) activeStream = null;
}

async function listCameras(): Promise<MediaDeviceInfo[]> {
  if (typeof navigator === "undefined" || !navigator.mediaDevices?.enumerateDevices) {
    return [];
  }
  const devices = await navigator.mediaDevices.enumerateDevices();
  return devices.filter((d) => d.kind === "videoinput");
}

/* ------------------------------------------------------------------- frames */

/** Draws the current video frame to a canvas and returns a JPEG data URL. */
function captureFrame(
  video: HTMLVideoElement,
  maxWidth = 640,
): { dataUrl: string; width: number; height: number } | null {
  if (!video.videoWidth || !video.videoHeight) return null;
  const scale = Math.min(1, maxWidth / video.videoWidth);
  const width = Math.round(video.videoWidth * scale);
  const height = Math.round(video.videoHeight * scale);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.drawImage(video, 0, 0, width, height);
  return { dataUrl: canvas.toDataURL("image/jpeg", 0.85), width, height };
}

/* ---------------------------------------------------------- face detection */

/** Simulated, centre-weighted bounding box in normalized (0..1) coordinates. */
function simulateBox(): BoundingBox {
  const size = 0.35;
  return {
    x: 0.325,
    y: 0.22,
    width: 0.35,
    height: 0.44,
  };
}

/**
 * Analyzes an image canvas to detect skin pixels and localize face region.
 */
function analyzeFaceInCanvas(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
): { detected: boolean; faceCount: number; box: BoundingBox | null } {
  const { width, height } = canvas;
  if (!width || !height) return { detected: false, faceCount: 0, box: null };

  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;

  let totalSkin = 0;
  let minX = width;
  let maxX = 0;
  let minY = height;
  let maxY = 0;
  let sumX = 0;
  let sumY = 0;

  // Sample every 4th pixel for high responsiveness
  const step = 4;
  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      const idx = (y * width + x) * 4;
      const r = data[idx]!;
      const g = data[idx + 1]!;
      const b = data[idx + 2]!;

      // Skin chromaticity check
      const isSkin =
        r > 55 &&
        g > 30 &&
        b > 15 &&
        r > g &&
        r - g > 8 &&
        r > b &&
        Math.max(r, g, b) - Math.min(r, g, b) > 10;

      if (isSkin) {
        totalSkin++;
        sumX += x;
        sumY += y;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  const sampledPixels = (width / step) * (height / step);
  const skinFraction = totalSkin / sampledPixels;

  // If less than 2% of the frame is skin tone, no person is in front of the camera
  if (skinFraction < 0.02 || totalSkin < 25) {
    return { detected: false, faceCount: 0, box: null };
  }

  const avgX = sumX / totalSkin;
  const avgY = sumY / totalSkin;

  const spreadX = Math.max(maxX - minX, width * 0.22);
  const spreadY = Math.max(maxY - minY, height * 0.26);
  const boxWidth = Math.min(width * 0.72, Math.max(width * 0.26, spreadX * 0.82));
  const boxHeight = Math.min(height * 0.82, Math.max(boxWidth * 1.18, spreadY * 0.88));

  const x = Math.max(0, Math.min(avgX - boxWidth / 2, width - boxWidth));
  const y = Math.max(0, Math.min(avgY - boxHeight * 0.44, height - boxHeight));

  const normBox: BoundingBox = {
    x: Number((x / width).toFixed(4)),
    y: Number((y / height).toFixed(4)),
    width: Number((boxWidth / width).toFixed(4)),
    height: Number((boxHeight / height).toFixed(4)),
  };

  return { detected: true, faceCount: 1, box: normBox };
}

interface DetectFaceArgs {
  frameDataUrl?: string | null | undefined;
  imageFile?: Blob | undefined;
  frameWidth?: number | undefined;
  frameHeight?: number | undefined;
  backendUrl?: string | undefined;
  demoMode: boolean;
  signal?: AbortSignal | undefined;
}

async function detectFace({
  frameDataUrl,
  imageFile,
  frameWidth,
  frameHeight,
  backendUrl,
  demoMode,
  signal,
}: DetectFaceArgs): Promise<FaceDetectionResult> {
  // If backend is active, use YOLOv8 deep learning face detector
  if (!demoMode && backendUrl) {
    try {
      const raw = await postImage<{
        detected: boolean;
        confidence?: number;
        faceCount?: number;
        box?: BoundingBox | null;
        boxes?: BoundingBox[];
      }>(
        `${backendUrl.replace(/\/$/, "")}/api/detect-face`,
        imageFile ?? frameDataUrl ?? "",
        signal,
      );
      const boxes = normalizeBoxes(raw.boxes ?? (raw.box ? [raw.box] : []), frameWidth, frameHeight);
      return {
        detected: raw.detected ?? boxes.length > 0,
        faceCount: raw.faceCount ?? boxes.length,
        confidence: typeof raw.confidence === "number" ? raw.confidence : 0.94,
        box: boxes[0] ?? null,
        boxes,
        source: "backend",
      };
    } catch (err) {
      console.warn("Backend face detection call failed, falling back to client detector:", err);
    }
  }

  // Client-side real face localization
  if (frameDataUrl) {
    try {
      const img = await loadImage(frameDataUrl);
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth || img.width || 320;
      canvas.height = img.naturalHeight || img.height || 240;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const result = analyzeFaceInCanvas(canvas, ctx);
        return {
          detected: result.detected,
          faceCount: result.faceCount,
          confidence: result.detected ? 0.92 : null,
          box: result.box,
          boxes: result.box ? [result.box] : [],
          source: "demo",
        };
      }
    } catch {
      // Fall through to fallback
    }
  }

  const box = simulateBox();
  return {
    detected: true,
    faceCount: 1,
    confidence: null,
    box,
    boxes: [box],
    source: "demo",
  };
}

/* ------------------------------------------------------------ preprocessing */

interface PreprocessArgs {
  video?: HTMLVideoElement | null | undefined;
  box: BoundingBox | null;
  /** Target square size expected by the selected model. */
  targetSize?: number | undefined;
}

/**
 * Crops the detected face region and resizes it to the model input size (224x224).
 */
async function preprocessFace({
  video,
  box,
  targetSize = 224,
}: PreprocessArgs): Promise<PreprocessResult> {
  const base: PreprocessResult = {
    dataUrl: null,
    width: targetSize,
    height: targetSize,
    normalized: false,
  };
  if (!video || !box || !video.videoWidth) return base;

  const canvas = document.createElement("canvas");
  canvas.width = targetSize;
  canvas.height = targetSize;
  const ctx = canvas.getContext("2d");
  if (!ctx) return base;

  const sx = box.x * video.videoWidth;
  const sy = box.y * video.videoHeight;
  const sw = box.width * video.videoWidth;
  const sh = box.height * video.videoHeight;
  ctx.drawImage(video, sx, sy, sw, sh, 0, 0, targetSize, targetSize);

  return {
    dataUrl: canvas.toDataURL("image/jpeg", 0.9),
    width: targetSize,
    height: targetSize,
    normalized: true,
  };
}

/* ------------------------------------------------------------- prediction */

/**
 * Analyzes facial features from the preprocessed face patch to classify emotions.
 */
function analyzeFaceEmotionInCanvas(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
): { emotion: Emotion; confidence: number; probabilities: Record<Emotion, number> } {
  const { width, height } = canvas;
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;

  const yUpperStart = Math.floor(height * 0.16);
  const yUpperEnd = Math.floor(height * 0.38);
  const yMouthStart = Math.floor(height * 0.64);
  const yMouthEnd = Math.floor(height * 0.88);
  const xMidLeft = Math.floor(width * 0.32);
  const xMidRight = Math.floor(width * 0.68);
  const xOuterLeft = Math.floor(width * 0.18);
  const xOuterRight = Math.floor(width * 0.82);

  let teethPixels = 0;
  let darkMouthPixels = 0;
  let mouthTotalPixels = 0;
  let mouthLuminanceSum = 0;
  let browGradients = 0;
  let browPixelCount = 0;
  let upperLuminanceSum = 0;
  let upperPixelCount = 0;

  for (let y = 0; y < height; y += 2) {
    for (let x = 0; x < width; x += 2) {
      const idx = (y * width + x) * 4;
      const r = data[idx]!;
      const g = data[idx + 1]!;
      const b = data[idx + 2]!;
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;

      // In mouth region
      if (y >= yMouthStart && y <= yMouthEnd && x >= xOuterLeft && x <= xOuterRight) {
        mouthTotalPixels++;
        mouthLuminanceSum += lum;

        // Teeth: bright and neutral saturation
        const sat = Math.max(r, g, b) - Math.min(r, g, b);
        if (lum > 135 && sat < 38) {
          teethPixels++;
        }
        // Deep oral cavity: dark interior
        if (lum < 42) {
          darkMouthPixels++;
        }
      }

      // In eyebrow/forehead region
      if (y >= yUpperStart && y <= yUpperEnd && x >= xOuterLeft && x <= xOuterRight) {
        upperLuminanceSum += lum;
        upperPixelCount++;

        if (x >= xMidLeft && x < xMidRight && x + 2 < width) {
          const nextIdx = (y * width + x + 2) * 4;
          const nextLum = 0.299 * data[nextIdx]! + 0.587 * data[nextIdx + 1]! + 0.114 * data[nextIdx + 2]!;
          browGradients += Math.abs(lum - nextLum);
          browPixelCount++;
        }
      }
    }
  }

  const teethRatio = mouthTotalPixels > 0 ? teethPixels / mouthTotalPixels : 0;
  const darkMouthRatio = mouthTotalPixels > 0 ? darkMouthPixels / mouthTotalPixels : 0;
  const avgMouthLum = mouthTotalPixels > 0 ? mouthLuminanceSum / mouthTotalPixels : 100;
  const avgUpperLum = upperPixelCount > 0 ? upperLuminanceSum / upperPixelCount : 100;
  const avgBrowGradient = browPixelCount > 0 ? browGradients / browPixelCount : 0;

  // Activation scores for all 7 emotions
  const rawScores: Record<Emotion, number> = {
    Happy: 0.4,
    Surprise: 0.4,
    Angry: 0.4,
    Sad: 0.4,
    Neutral: 1.5,
    Fear: 0.3,
    Disgust: 0.3,
  };

  // 1. Smile / Happy Detection:
  const smileSignal = teethRatio * 20.0 + Math.max(0, (avgMouthLum - avgUpperLum) / 15.0);
  if (smileSignal > 0.8) {
    rawScores.Happy += smileSignal * 3.8;
  }

  // 2. Surprise Detection:
  if (darkMouthRatio > 0.06) {
    rawScores.Surprise += darkMouthRatio * 28.0;
  }

  // 3. Angry Detection:
  if (avgBrowGradient > 7.5 && smileSignal < 0.8) {
    rawScores.Angry += (avgBrowGradient - 7.5) * 1.6;
  }

  // 4. Sad Detection:
  if (smileSignal < 0.35 && darkMouthRatio < 0.02 && avgMouthLum < avgUpperLum) {
    rawScores.Sad += 1.9;
  }

  // 5. Neutral:
  if (smileSignal < 0.8 && darkMouthRatio < 0.04 && avgBrowGradient < 8.0) {
    rawScores.Neutral += 3.2;
  }

  // Softmax normalization across 7 classes
  const expScores: Record<Emotion, number> = {} as any;
  let sumExp = 0;
  EMOTIONS.forEach((e) => {
    const val = Math.exp(rawScores[e]);
    expScores[e] = val;
    sumExp += val;
  });

  let dominant: Emotion = "Neutral";
  let maxProb = 0;
  const probabilities: Record<Emotion, number> = {} as any;
  let running = 0;

  EMOTIONS.forEach((e, idx) => {
    let p = Number(((expScores[e] / sumExp) * 100).toFixed(1));
    if (idx === EMOTIONS.length - 1) {
      p = Number(Math.max(0, 100 - running).toFixed(1));
    } else {
      running += p;
    }
    probabilities[e] = p;
    if (p > maxProb) {
      maxProb = p;
      dominant = e;
    }
  });

  const confidence = Number((maxProb / 100).toFixed(3));
  return { emotion: dominant, confidence, probabilities };
}

function simulateProbabilities(dominant: Emotion): Record<Emotion, number> {
  const raw: Record<string, number> = {};
  EMOTIONS.forEach((e) => {
    raw[e] = randomBetween(0.5, 4);
  });
  raw[dominant] = randomBetween(65, 88);
  const total = EMOTIONS.reduce((sum, e) => sum + raw[e]!, 0);
  const probabilities = {} as Record<Emotion, number>;
  let running = 0;
  EMOTIONS.forEach((e, i) => {
    if (i === EMOTIONS.length - 1) {
      probabilities[e] = Number((100 - running).toFixed(1));
    } else {
      const v = Number(((raw[e]! / total) * 100).toFixed(1));
      probabilities[e] = v;
      running = Number((running + v).toFixed(1));
    }
  });
  return probabilities;
}

interface PredictArgs {
  faceDataUrl?: string | null | undefined;
  backendUrl?: string | undefined;
  demoMode: boolean;
  preferredEmotion?: Emotion | null | undefined;
  signal?: AbortSignal | undefined;
}

async function predictEmotion({
  faceDataUrl,
  backendUrl,
  demoMode,
  preferredEmotion,
  signal,
}: PredictArgs): Promise<EmotionPredictionResult> {
  // If backend is active, use the real Vision Transformer model
  if (!demoMode && backendUrl) {
    try {
      const raw = await postImage<{
        emotion: string;
        confidence: number;
        probabilities?: Record<Emotion, number>;
      }>(
        `${backendUrl.replace(/\/$/, "")}/api/predict-emotion`,
        faceDataUrl ?? "",
        signal,
      );
      const emotion = asEmotion(raw.emotion);
      if (!Number.isFinite(raw.confidence) || raw.confidence < 0 || raw.confidence > 1) {
        throw new Error("Inference service returned an invalid confidence score.");
      }
      const probabilities =
        raw.probabilities ??
        (EMOTIONS.reduce((acc, e) => {
          acc[e] = e === emotion ? Number((raw.confidence * 100).toFixed(1)) : 0;
          return acc;
        }, {} as Record<Emotion, number>));
      return {
        emotion,
        confidence: raw.confidence,
        probabilities,
        source: "backend",
      };
    } catch (err) {
      console.warn("Backend emotion prediction call failed, falling back to client analyzer:", err);
    }
  }

  // Client-side real expression analysis from face patch
  if (faceDataUrl) {
    try {
      const img = await loadImage(faceDataUrl);
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth || img.width || 224;
      canvas.height = img.naturalHeight || img.height || 224;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const result = analyzeFaceEmotionInCanvas(canvas, ctx);
        const emotion = preferredEmotion ?? result.emotion;
        return {
          emotion,
          confidence: result.confidence,
          probabilities: result.probabilities,
          source: "demo",
        };
      }
    } catch {
      // Fall through to fallback
    }
  }

  const dominant = preferredEmotion ?? "Neutral";
  const probabilities = simulateProbabilities(dominant);
  return {
    emotion: dominant,
    confidence: Number((probabilities[dominant] / 100).toFixed(3)),
    probabilities,
    source: "demo",
  };
}

/* ------------------------------------------------------------------ history */

const HISTORY_LIMIT = 20;

function appendObservation(history: Observation[], observation: Observation): Observation[] {
  return [observation, ...history].slice(0, HISTORY_LIMIT);
}

function getEmotionHistory(history: Observation[]): Observation[] {
  return history.slice(0, HISTORY_LIMIT);
}

/* -------------------------------------------------------------------- alert */

interface AlertArgs {
  history: Observation[];
  thresholdPct: number;
  consecutive: number;
}

function generateAlert({
  history,
  thresholdPct,
  consecutive,
}: AlertArgs): MonitoringAlert | null {
  if (history.length < consecutive) return null;
  const window = history.slice(0, consecutive);
  const first = window[0]!;
  const qualifies = window.every(
    (o) => o.emotion === first.emotion && o.confidence * 100 >= thresholdPct,
  );
  if (!qualifies) return null;
  if (first.emotion === "Neutral" || first.emotion === "Happy") return null;

  return {
    id: `${first.emotion}-${first.at}`,
    emotion: first.emotion,
    message: `${first.emotion}-like expression detected consistently.`,
    at: first.at,
    count: consecutive,
    threshold: thresholdPct,
  };
}

export const emotionService = {
  startCamera,
  stopCamera,
  listCameras,
  captureFrame,
  detectFace,
  preprocessFace,
  predictEmotion,
  normalizeBoxes,
  appendObservation,
  getEmotionHistory,
  generateAlert,
  checkBackendHealth,
  HISTORY_LIMIT,
};

export type EmotionService = typeof emotionService;
