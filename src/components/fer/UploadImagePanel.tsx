import { useEffect, useRef, useState, type DragEvent, type ChangeEvent } from "react";
import { AlertCircle, CheckCircle2, FileImage, LoaderCircle, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { emotionService } from "@/lib/fer/emotionService";
import { timeLabel } from "@/lib/fer/emotionMeta";
import { EMOTIONS, type BoundingBox, type Emotion, type Observation } from "@/lib/fer/types";
import { useFer } from "@/lib/fer/FerProvider";
import { Chip, Panel } from "./ui";

interface FaceResult {
  box: BoundingBox;
  emotion: Emotion;
  confidence: number;
}

const ACCEPTED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const ACCEPTED_EXTENSIONS = /\.(jpe?g|png|webp)$/i;

function fileIsSupported(file: File) {
  return ACCEPTED_TYPES.has(file.type) || ACCEPTED_EXTENSIONS.test(file.name);
}

function loadBitmap(file: File) {
  return createImageBitmap(file);
}

function cropFace(bitmap: ImageBitmap, box: BoundingBox): Promise<Blob> {
  const left = Math.max(0, Math.floor(box.x * bitmap.width));
  const top = Math.max(0, Math.floor(box.y * bitmap.height));
  const right = Math.min(bitmap.width, Math.ceil((box.x + box.width) * bitmap.width));
  const bottom = Math.min(bitmap.height, Math.ceil((box.y + box.height) * bitmap.height));
  const width = right - left;
  const height = bottom - top;
  if (width < 1 || height < 1) return Promise.reject(new Error("A detected face box was outside the image."));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) return Promise.reject(new Error("This browser could not prepare the face crop."));
  context.drawImage(bitmap, left, top, width, height, 0, 0, width, height);
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("This browser could not encode the face crop."));
    }, "image/jpeg", 0.92);
  });
}

export function UploadImagePanel() {
  const { settings, recordObservation } = useFer();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);
  const [results, setResults] = useState<FaceResult[]>([]);
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      setDimensions(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    let active = true;
    void loadBitmap(file).then((bitmap) => {
      if (active) setDimensions({ width: bitmap.width, height: bitmap.height });
      bitmap.close();
    }).catch(() => {
      if (active) setError("This image could not be opened. Choose a valid JPG, PNG, or WEBP file.");
    });
    return () => {
      active = false;
      URL.revokeObjectURL(url);
    };
  }, [file]);

  const selectFile = (candidate: File | undefined) => {
    if (!candidate) return;
    setError(null);
    setMessage(null);
    setResults([]);
    if (!fileIsSupported(candidate)) {
      setError("Choose a JPG, JPEG, PNG, or WEBP image.");
      return;
    }
    setFile(candidate);
  };

  const onFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    selectFile(event.currentTarget.files?.[0]);
    event.currentTarget.value = "";
  };

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    selectFile(event.dataTransfer.files[0]);
  };

  const analyze = async () => {
    if (!file || !dimensions) return;
    setBusy(true);
    setError(null);
    setMessage(null);
    setResults([]);
    let bitmap: ImageBitmap | null = null;
    try {
      bitmap = await loadBitmap(file);
      const isBackendActive = Boolean(settings.backendUrl.trim() && !settings.demoMode);
      const detection = await emotionService.detectFace({
        imageFile: file,
        frameDataUrl: previewUrl,
        frameWidth: dimensions.width,
        frameHeight: dimensions.height,
        backendUrl: settings.backendUrl.trim(),
        demoMode: !isBackendActive,
      });
      const boxes = detection.boxes ?? (detection.box ? [detection.box] : []);
      if (boxes.length === 0) {
        setMessage("No face detected in this image. Try another photo with clear frontal lighting.");
        return;
      }

      const predictions: FaceResult[] = [];
      for (const box of boxes) {
        const faceBlob = await cropFace(bitmap, box);
        const faceUrl = URL.createObjectURL(faceBlob);
        const prediction = await emotionService.predictEmotion({
          faceDataUrl: faceUrl,
          backendUrl: settings.backendUrl.trim(),
          demoMode: !isBackendActive,
        });
        URL.revokeObjectURL(faceUrl);
        predictions.push({ box, emotion: prediction.emotion, confidence: prediction.confidence });
        const at = Date.now();
        const observation: Observation = {
          id: `upload-${at}-${predictions.length}`,
          at,
          time: timeLabel(at),
          emotion: prediction.emotion,
          confidence: prediction.confidence,
          status: prediction.source === "backend" ? "Detected" : "Simulated",
          source: prediction.source,
        };
        recordObservation(observation);
      }
      setResults(predictions);
      const engineName = detection.source === "backend" ? "YOLOv8 + ViT Backend" : "Computer Vision Engine";
      setMessage(`${predictions.length} face${predictions.length === 1 ? "" : "s"} analyzed successfully via ${engineName}.`);
    } catch (cause) {
      const detail = cause instanceof Error ? cause.message : "The image could not be analyzed.";
      setError(detail);
    } finally {
      bitmap?.close();
      setBusy(false);
    }
  };

  const removeImage = () => {
    setFile(null);
    setResults([]);
    setError(null);
    setMessage(null);
  };

  return (
    <Panel
      title="Upload image"
      icon={FileImage}
      badge={<Chip tone={settings.backendUrl && !settings.demoMode ? "success" : "primary"}>{settings.backendUrl && !settings.demoMode ? "YOLOv8 + ViT Backend" : "Client Engine Ready"}</Chip>}
      footer="Upload photos to detect faces and classify expressions using YOLOv8 & ViT model or client visual analysis."
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
        onChange={onFileChange}
        className="sr-only"
        aria-label="Choose an image to analyze"
      />

      {!file ? (
        <div
          onDragEnter={(event) => { event.preventDefault(); setDragging(true); }}
          onDragOver={(event) => event.preventDefault()}
          onDragLeave={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDragging(false); }}
          onDrop={onDrop}
          className={`grid min-h-48 place-items-center border border-dashed p-6 text-center transition-colors ${dragging ? "border-primary bg-primary/5" : "border-border bg-background/30"}`}
        >
          <div>
            <Upload className="mx-auto h-8 w-8 text-primary" />
            <p className="mt-3 text-sm font-medium">Drop an image here</p>
            <p className="mt-1 text-xs text-muted-foreground">JPG, JPEG, PNG, or WEBP</p>
            <Button type="button" variant="outline" className="mt-4" onClick={() => inputRef.current?.click()}>
              Choose image
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="min-w-0 truncate text-sm font-medium">{file.name}</p>
            <div className="flex gap-2">
              <Button type="button" variant="outline" size="sm" disabled={busy} onClick={() => inputRef.current?.click()}>
                <Upload /> Replace
              </Button>
              <Button type="button" variant="ghost" size="icon" aria-label="Remove image" title="Remove image" disabled={busy} onClick={removeImage}>
                <Trash2 />
              </Button>
            </div>
          </div>

          {previewUrl ? (
            <div className="relative grid max-h-[520px] min-h-48 place-items-center overflow-hidden bg-background/70 p-3">
              <div className="relative inline-block max-h-[490px] max-w-full">
                <img src={previewUrl} alt="Selected image preview" className="block max-h-[490px] max-w-full object-contain" />
                {results.map((result, index) => (
                  <div
                    key={`${index}-${result.emotion}`}
                    className="pointer-events-none absolute border-2 border-primary"
                    style={{
                      left: `${result.box.x * 100}%`,
                      top: `${result.box.y * 100}%`,
                      width: `${result.box.width * 100}%`,
                      height: `${result.box.height * 100}%`,
                    }}
                  >
                    <span className="absolute -top-6 left-0 whitespace-nowrap bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground">
                      {result.emotion} · {(result.confidence * 100).toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <div className="flex flex-wrap items-center gap-3">
            <Button type="button" onClick={() => void analyze()} disabled={busy || !dimensions}>
              {busy ? <LoaderCircle className="animate-spin" /> : <ScanFaceIcon />}
              {busy ? "Analyzing…" : "Analyze image"}
            </Button>
            {dimensions ? <span className="text-xs text-muted-foreground">{dimensions.width} × {dimensions.height}</span> : null}
          </div>
        </div>
      )}

      {busy ? (
        <p className="mt-4 flex items-center gap-2 text-sm text-muted-foreground" role="status">
          <LoaderCircle className="h-4 w-4 animate-spin" /> Sending image for face detection and classification…
        </p>
      ) : null}
      {message ? (
        <p className="mt-4 flex items-center gap-2 text-sm text-success" role="status">
          <CheckCircle2 className="h-4 w-4 shrink-0" /> {message}
        </p>
      ) : null}
      {error ? (
        <p className="mt-4 flex items-start gap-2 text-sm text-destructive" role="alert">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {error}
        </p>
      ) : null}
      {results.length ? (
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {results.map((result, index) => (
            <li key={`${index}-${result.emotion}`} className="flex items-center justify-between gap-3 border border-border bg-background/30 p-3 text-sm">
              <span>Face {index + 1}: {result.emotion}</span>
              <Chip tone="success">{(result.confidence * 100).toFixed(1)}% confidence</Chip>
            </li>
          ))}
        </ul>
      ) : null}
      <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
        Facial emotion recognition provides model-based estimates from visual facial patterns. It cannot reliably determine a person's actual internal emotional state, intentions, honesty, or behaviour.
      </p>
    </Panel>
  );
}

function ScanFaceIcon() {
  return <FileImage aria-hidden="true" />;
}