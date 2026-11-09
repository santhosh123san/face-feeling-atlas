import { Boxes, Cpu, Layers, Percent, ScanFace, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFer } from "@/lib/fer/FerProvider";
import { EMOTION_META } from "@/lib/fer/emotionMeta";
import { EMOTIONS, type PipelineStage, type StageStatus } from "@/lib/fer/types";
import { Chip, Panel } from "./ui";

/* ------------------------------------------------------- face detection */

export function FaceDetectionCard() {
  const { faceStatus, faceCount, box, detectionConfidence, inferenceSource } = useFer();
  const rows: [string, string][] = [
    ["x", box ? box.x.toFixed(3) : "—"],
    ["y", box ? box.y.toFixed(3) : "—"],
    ["width", box ? box.width.toFixed(3) : "—"],
    ["height", box ? box.height.toFixed(3) : "—"],
  ];

  return (
    <Panel
      title="Face detection"
      icon={ScanFace}
      badge={
        <Chip tone={inferenceSource === "demo" ? "warning" : "success"}>
          {inferenceSource === "demo" ? "Simulated detection" : "Backend detection"}
        </Chip>
      }
      footer="Bounding box values are normalized to the frame (0–1) so they scale across resolutions."
    >
      <dl className="space-y-3 text-sm">
        <div className="flex items-center justify-between gap-3">
          <dt className="text-muted-foreground">Detector</dt>
          <dd className="font-medium">YOLOv8 (planned)</dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-muted-foreground">Status</dt>
          <dd className="font-medium">
            {faceStatus === "single"
              ? "Face Detected"
              : faceStatus === "multiple"
                ? `Multiple Faces Detected (${faceCount})`
                : "No Face Detected"}
          </dd>
        </div>
        <div className="rounded-lg border border-border bg-background/40 p-3">
          <p className="mb-2 text-[11px] font-semibold tracking-widest text-muted-foreground uppercase">
            Bounding box
          </p>
          <div className="grid grid-cols-2 gap-2 font-mono text-xs">
            {rows.map(([k, v]) => (
              <div key={k} className="flex items-center justify-between gap-2">
                <span className="text-muted-foreground">{k}</span>
                <span>{v}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-muted-foreground">Detector confidence</dt>
          <dd className="font-medium">
            {detectionConfidence === null
              ? "— (no detector connected)"
              : `${(detectionConfidence * 100).toFixed(1)}%`}
          </dd>
        </div>
      </dl>
    </Panel>
  );
}

/* --------------------------------------------------------- preprocessing */

const PIPELINE: { key: PipelineStage; label: string; detail: string }[] = [
  { key: "crop", label: "Face crop", detail: "Detected region extracted from the frame" },
  { key: "resize", label: "Resize", detail: "Scaled to the selected model input size" },
  { key: "normalize", label: "Normalization", detail: "Pixel values scaled to a model-compatible range" },
  { key: "inputPrep", label: "Input preparation", detail: "Tensor batch prepared for the classifier" },
];

function StatusChip({ status }: { status: StageStatus }) {
  const tone = status === "completed" ? "success" : status === "processing" ? "primary" : "muted";
  const label = status === "completed" ? "Completed" : status === "processing" ? "Processing" : "Waiting";
  return <Chip tone={tone}>{label}</Chip>;
}

export function PreprocessingCard() {
  const { stages, facePreview } = useFer();
  return (
    <Panel
      title="Image preprocessing"
      icon={Layers}
      footer="Base-paper CNN input: 48 × 48 × 1 grayscale (reference only — the Swin input size is defined by the trained model)."
    >
      <ol className="space-y-2">
        {PIPELINE.map((step, i) => (
          <li
            key={step.key}
            className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-lg border border-border bg-background/40 px-3 py-2.5"
          >
            <div className="flex min-w-0 items-center gap-3">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-primary/10 font-mono text-xs text-primary">
                {i + 1}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{step.label}</p>
                <p className="truncate text-[11px] text-muted-foreground">{step.detail}</p>
              </div>
            </div>
            <StatusChip status={stages[step.key]} />
          </li>
        ))}
      </ol>
      {facePreview ? (
        <div className="mt-4 flex items-center gap-3">
          <img
            src={facePreview}
            alt="Cropped face patch prepared for classification"
            className="h-20 w-20 rounded-lg border border-border object-cover"
          />
          <p className="text-xs text-muted-foreground">
            Cropped and resized face patch from the latest captured frame.
          </p>
        </div>
      ) : null}
    </Panel>
  );
}

/* ------------------------------------------------------ swin transformer */

export function SwinTransformerCard() {
  const { stages, inferenceSource } = useFer();
  const featureState =
    stages.features === "completed" ? "Complete" : stages.features === "processing" ? "Active" : "Waiting";

  return (
    <Panel
      title="Swin Transformer"
      icon={Cpu}
      badge={
        <Chip tone={inferenceSource === "demo" ? "warning" : "success"}>
          {inferenceSource === "demo" ? "Demo inference" : "Backend inference"}
        </Chip>
      }
      footer="No Swin Transformer weights run in the browser. When an inference API is configured, these states reflect real backend calls."
    >
      <p className="text-sm text-muted-foreground">
        Purpose: feature extraction and emotion classification from the preprocessed face patch.
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-border bg-background/40 p-3">
          <p className="text-[11px] tracking-widest text-muted-foreground uppercase">Status</p>
          <p className="mt-1 text-sm font-semibold text-primary">Ready</p>
        </div>
        <div className="rounded-lg border border-border bg-background/40 p-3">
          <p className="text-[11px] tracking-widest text-muted-foreground uppercase">
            Feature extraction
          </p>
          <p className="mt-1 text-sm font-semibold">{featureState}</p>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {["Patch partition", "Window attention", "Shifted window attention", "Patch merging", "Classification head"].map(
          (stage, i) => (
            <div key={stage} className="flex items-center gap-3">
              <span className="w-24 shrink-0 text-[11px] text-muted-foreground">Stage {i + 1}</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-2">
                <div
                  className={cn(
                    "h-full rounded-full bg-linear-to-r from-primary to-primary-glow transition-all duration-700",
                    stages.features === "completed"
                      ? "w-full"
                      : stages.features === "processing"
                        ? "w-2/3"
                        : "w-0",
                  )}
                />
              </div>
              <span className="w-40 shrink-0 truncate text-[11px] text-muted-foreground">{stage}</span>
            </div>
          ),
        )}
      </div>
    </Panel>
  );
}

/* ------------------------------------------------------- emotion result */

export function EmotionResultCard() {
  const { currentEmotion, confidence, inferenceSource } = useFer();
  const meta = currentEmotion ? EMOTION_META[currentEmotion] : null;
  const Icon = meta?.icon ?? Sparkles;

  return (
    <div className="panel-glow p-5">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
        <h3 className="truncate text-xs font-semibold tracking-widest text-muted-foreground uppercase">
          Current emotion
        </h3>
        <Chip tone={inferenceSource === "demo" ? "warning" : "success"}>
          {inferenceSource === "demo" ? "Demo mode" : "Model mode"}
        </Chip>
      </div>
      <div className="mt-5 flex items-center gap-4">
        <div
          className={cn(
            "grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-surface-2 ring-1 ring-border",
            meta?.tone,
          )}
        >
          <Icon className="h-8 w-8" />
        </div>
        <div className="min-w-0">
          <p className="truncate font-display text-3xl font-bold sm:text-4xl">
            {currentEmotion ? currentEmotion.toUpperCase() : "—"}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Prediction confidence:{" "}
            <span className="font-semibold text-foreground">
              {confidence === null ? "—" : `${(confidence * 100).toFixed(0)}%`}
            </span>
          </p>
        </div>
      </div>
      <p className="mt-4 border-t border-border pt-3 text-[11px] leading-relaxed text-muted-foreground">
        Prediction confidence is the classifier's per-frame score. It is not model accuracy and not an
        evaluation result.
      </p>
    </div>
  );
}

/* ------------------------------------------------- emotion probabilities */

export function ProbabilityPanel() {
  const { probabilities, inferenceSource } = useFer();
  return (
    <Panel
      title="Emotion probabilities"
      icon={Percent}
      badge={
        <Chip tone={inferenceSource === "demo" ? "warning" : "success"}>
          {inferenceSource === "demo" ? "Demo mode — simulated" : "Backend output"}
        </Chip>
      }
      footer="Values sum to approximately 100%. In demo mode these are simulated distributions, not measured results."
    >
      <div className="space-y-3">
        {EMOTIONS.map((emotion) => {
          const value = probabilities?.[emotion] ?? 0;
          const meta = EMOTION_META[emotion];
          return (
            <div key={emotion}>
              <div className="mb-1.5 flex items-center justify-between gap-3 text-xs">
                <span className="flex min-w-0 items-center gap-2">
                  <meta.icon className={cn("h-3.5 w-3.5 shrink-0", meta.tone)} />
                  <span className="truncate font-medium">{emotion}</span>
                </span>
                <span className="shrink-0 font-mono text-muted-foreground">
                  {probabilities ? `${value.toFixed(1)}%` : "—"}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-surface-2">
                <div
                  className={cn("h-full rounded-full transition-all duration-500", meta.bar)}
                  style={{ width: `${value}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}

/* --------------------------------------------------------- misc summary */

export function PipelineSummaryCard() {
  const { stages } = useFer();
  const items: { key: PipelineStage; label: string }[] = [
    { key: "capture", label: "Frame capture" },
    { key: "detect", label: "Face detection" },
    { key: "crop", label: "Face crop" },
    { key: "normalize", label: "Preprocessing" },
    { key: "features", label: "Feature extraction" },
    { key: "classify", label: "Classification" },
  ];
  return (
    <Panel title="Pipeline state" icon={Boxes}>
      <div className="grid gap-2 sm:grid-cols-2">
        {items.map((item) => (
          <div
            key={item.key}
            className="flex items-center justify-between gap-2 rounded-lg border border-border bg-background/40 px-3 py-2 text-xs"
          >
            <span className="truncate">{item.label}</span>
            <StatusChip status={stages[item.key]} />
          </div>
        ))}
      </div>
    </Panel>
  );
}
