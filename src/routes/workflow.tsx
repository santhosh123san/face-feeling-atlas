import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Workflow as WorkflowIcon } from "lucide-react";
import { PageHeader, Panel } from "@/components/fer/ui";
import { cn } from "@/lib/utils";
import { useFer } from "@/lib/fer/FerProvider";

export const Route = createFileRoute("/workflow")({
  head: () => ({
    meta: [
      { title: "Workflow — Facial Emotion Recognition Pipeline Steps" },
      {
        name: "description",
        content:
          "Interactive ten-step workflow from webcam input through YOLOv8 detection, preprocessing, Swin Transformer classification, history and optional alerts.",
      },
      { property: "og:title", content: "Workflow — Facial Emotion Recognition Pipeline" },
      {
        property: "og:description",
        content: "Click any step to see its purpose, input and output in the FER pipeline.",
      },
    ],
  }),
  component: WorkflowPage,
});

interface Step {
  title: string;
  purpose: string;
  input: string;
  output: string;
}

const STEPS: Step[] = [
  {
    title: "Webcam Input",
    purpose: "Provide a live video source for analysis using the browser MediaDevices API.",
    input: "User camera permission and a selected video device.",
    output: "A MediaStream rendered in the video element.",
  },
  {
    title: "Frame Capture",
    purpose: "Sample a single still frame from the live stream at a fixed interval.",
    input: "Active video element.",
    output: "A JPEG frame encoded as a data URL.",
  },
  {
    title: "YOLOv8 Face Detection",
    purpose: "Locate faces in the captured frame (planned backend detector).",
    input: "Captured frame image.",
    output: "Detection flag, face count and bounding box coordinates.",
  },
  {
    title: "Face Crop",
    purpose: "Extract only the detected face region so background pixels are discarded.",
    input: "Frame plus bounding box.",
    output: "Cropped face patch.",
  },
  {
    title: "Image Preprocessing",
    purpose: "Resize the patch and prepare pixel values in a model-compatible range.",
    input: "Cropped face patch.",
    output: "Fixed-size, normalized model input.",
  },
  {
    title: "Swin Transformer",
    purpose: "Extract hierarchical features using windowed self-attention (planned backend model).",
    input: "Preprocessed face tensor.",
    output: "Feature representation for the classification head.",
  },
  {
    title: "Emotion Classification",
    purpose: "Map extracted features to one of the seven emotion classes.",
    input: "Feature representation.",
    output: "Predicted emotion label and class probability distribution.",
  },
  {
    title: "Confidence Score",
    purpose: "Report the per-frame prediction confidence for the winning class.",
    input: "Probability distribution.",
    output: "Confidence value in the range 0–1 (not model accuracy).",
  },
  {
    title: "History",
    purpose: "Record timestamped observations so expression changes can be reviewed.",
    input: "Emotion label plus confidence.",
    output: "The latest 20 session observations and a transition timeline.",
  },
  {
    title: "Optional Alert",
    purpose:
      "Flag repeated high-confidence non-neutral expressions for human review only.",
    input: "Recent observations, confidence threshold and consecutive count.",
    output: "A descriptive expression alert, or nothing.",
  },
];

function WorkflowPage() {
  const [active, setActive] = useState(0);
  const { stages, analyzing } = useFer();
  const step = STEPS[active]!;

  const liveStageForIndex = (i: number) => {
    const map = ["capture", "capture", "detect", "crop", "normalize", "features", "classify"] as const;
    const key = map[i];
    if (!key) return null;
    return stages[key];
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Pipeline"
        title="Workflow"
        description="Select any step to inspect its purpose, input and output. Live stage indicators animate while analysis is running."
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
        <Panel title="Ten-step pipeline" icon={WorkflowIcon}>
          <ol className="grid gap-2 sm:grid-cols-2">
            {STEPS.map((s, i) => {
              const stage = liveStageForIndex(i);
              return (
                <li key={s.title}>
                  <button
                    type="button"
                    onClick={() => setActive(i)}
                    className={cn(
                      "w-full rounded-xl border px-3 py-3 text-left transition-colors",
                      active === i
                        ? "border-primary/50 bg-primary/10"
                        : "border-border bg-background/40 hover:bg-secondary/60",
                    )}
                  >
                    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
                      <span className="min-w-0">
                        <span className="mr-2 font-mono text-[11px] text-primary">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span className="text-sm font-medium">{s.title}</span>
                      </span>
                      <span
                        className={cn(
                          "h-2 w-2 shrink-0 rounded-full",
                          stage === "completed"
                            ? "bg-success"
                            : stage === "processing" && analyzing
                              ? "bg-primary pulse-soft"
                              : "bg-border",
                        )}
                      />
                    </div>
                  </button>
                  {i < STEPS.length - 1 ? null : null}
                </li>
              );
            })}
          </ol>
        </Panel>

        <Panel title={`Step ${active + 1} details`} icon={ArrowRight}>
          <h3 className="font-display text-lg font-semibold">{step.title}</h3>
          <dl className="mt-4 space-y-4 text-sm">
            <div>
              <dt className="text-[11px] tracking-widest text-muted-foreground uppercase">Purpose</dt>
              <dd className="mt-1">{step.purpose}</dd>
            </div>
            <div>
              <dt className="text-[11px] tracking-widest text-muted-foreground uppercase">Input</dt>
              <dd className="mt-1 text-muted-foreground">{step.input}</dd>
            </div>
            <div>
              <dt className="text-[11px] tracking-widest text-muted-foreground uppercase">Output</dt>
              <dd className="mt-1 text-muted-foreground">{step.output}</dd>
            </div>
          </dl>
        </Panel>
      </div>
    </div>
  );
}
