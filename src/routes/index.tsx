import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Brain,
  Camera,
  Cpu,
  ScanFace,
  Workflow as WorkflowIcon,
} from "lucide-react";
import { Chip, Disclaimer, Panel } from "@/components/fer/ui";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Improved Facial Emotion Recognition — Swin Transformer & YOLOv8" },
      {
        name: "description",
        content:
          "An AI-based facial emotion recognition prototype that detects faces and analyses facial expressions using YOLOv8, a Swin Transformer classifier and a CNN baseline comparison.",
      },
      {
        property: "og:title",
        content: "Improved Facial Emotion Recognition — Swin Transformer & YOLOv8",
      },
      {
        property: "og:description",
        content:
          "Academic prototype demonstrating a modern deep-learning facial emotion recognition pipeline with a live webcam demo mode.",
      },
    ],
  }),
  component: Home,
});

const PIPELINE = [
  "Webcam",
  "Frame capture",
  "YOLOv8 face detection",
  "Face crop",
  "Preprocessing",
  "Swin Transformer",
  "Emotion classification",
  "History & alerts",
];

function Home() {
  return (
    <div className="space-y-8">
      <section className="panel-glow overflow-hidden p-6 sm:p-10">
        <Chip tone="primary">Academic project prototype</Chip>
        <h1 className="mt-4 font-display text-3xl font-bold sm:text-5xl">
          Improved Facial Emotion Recognition
        </h1>
        <p className="mt-3 max-w-2xl font-display text-base text-primary sm:text-lg">
          Using Swin Transformer and YOLOv8 in Comparison with CNN
        </p>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          An AI-based facial emotion recognition system that detects faces and analyses facial
          expressions using a modern deep-learning pipeline.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link
            to="/live"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-xs font-semibold tracking-widest text-primary-foreground uppercase transition-opacity hover:opacity-90"
          >
            <Camera className="h-4 w-4" /> Start live analysis
          </Link>
          <Link
            to="/workflow"
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface-2 px-5 py-3 text-xs font-semibold tracking-widest uppercase transition-colors hover:bg-secondary"
          >
            <WorkflowIcon className="h-4 w-4" /> View workflow
          </Link>
        </div>
        <div className="mt-8 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
          {PIPELINE.map((step, i) => (
            <span key={step} className="flex items-center gap-2">
              {i > 0 ? <ArrowRight className="h-3 w-3 text-primary/70" /> : null}
              <span className="rounded-full border border-border bg-background/50 px-2.5 py-1">
                {step}
              </span>
            </span>
          ))}
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        <Panel title="Face detection" icon={ScanFace}>
          <p className="text-sm text-muted-foreground">
            YOLOv8 is the proposed detector, replacing the base paper's Haar Cascade stage. The demo
            simulates a centre-region bounding box until a detector API is connected.
          </p>
        </Panel>
        <Panel title="Emotion classifier" icon={Cpu}>
          <p className="text-sm text-muted-foreground">
            A Swin Transformer performs feature extraction and seven-class emotion classification.
            No weights run in the browser.
          </p>
        </Panel>
        <Panel title="Baseline comparison" icon={Brain}>
          <p className="text-sm text-muted-foreground">
            The base paper's CNN on 48 × 48 × 1 grayscale FER images serves as the comparison
            baseline. Metrics are populated only after real evaluation.
          </p>
        </Panel>
      </div>

      <Disclaimer>
        This is an academic prototype. Demo mode produces clearly-labelled simulated predictions for
        presentation purposes only — no accuracy, precision, recall or F1 values are claimed anywhere
        in this application without real evaluation data.
      </Disclaimer>
    </div>
  );
}
