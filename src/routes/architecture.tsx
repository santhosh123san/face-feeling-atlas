import { createFileRoute } from "@tanstack/react-router";
import { ArrowDown, Brain, Cpu, GitCompare } from "lucide-react";
import { Chip, Disclaimer, PageHeader, Panel } from "@/components/fer/ui";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/architecture")({
  head: () => ({
    meta: [
      { title: "Model Architecture — Base Paper CNN vs Proposed Swin Transformer" },
      {
        name: "description",
        content:
          "Side-by-side architecture diagrams: the base paper's Haar Cascade + CNN pipeline and the proposed YOLOv8 + Swin Transformer pipeline, with a feature comparison table.",
      },
      { property: "og:title", content: "Model Architecture — CNN vs Swin Transformer" },
      {
        property: "og:description",
        content: "Architecture diagrams and base-paper comparison for the FER project.",
      },
    ],
  }),
  component: Architecture,
});

const BASE = [
  "FER Image Dataset",
  "Haar Cascade",
  "CNN",
  "Feature Extraction",
  "Classification",
  "Evaluation",
];

const PROPOSED = [
  "Image / Webcam",
  "YOLOv8",
  "Face Detection",
  "Face Crop",
  "Preprocessing",
  "Swin Transformer",
  "Feature Extraction",
  "Emotion Classification",
  "Evaluation",
];

function Flow({ steps, highlight }: { steps: string[]; highlight?: boolean }) {
  return (
    <ol className="space-y-2">
      {steps.map((step, i) => (
        <li key={step}>
          <div
            className={cn(
              "rounded-xl border px-4 py-3 text-sm font-medium",
              highlight
                ? "border-primary/40 bg-primary/10 text-foreground"
                : "border-border bg-background/40 text-muted-foreground",
            )}
          >
            <span className="mr-2 font-mono text-[11px] text-primary">{i + 1}</span>
            {step}
          </div>
          {i < steps.length - 1 ? (
            <div className="flex justify-center py-1">
              <ArrowDown className={cn("h-4 w-4", highlight ? "text-primary" : "text-border")} />
            </div>
          ) : null}
        </li>
      ))}
    </ol>
  );
}

const COMPARISON: { label: string; base: string; proposed: string }[] = [
  { label: "Face detection", base: "Haar Cascade", proposed: "YOLOv8" },
  { label: "Emotion model", base: "CNN", proposed: "Swin Transformer" },
  { label: "Dataset", base: "FER image dataset", proposed: "FER2013 / selected FER dataset" },
  { label: "Input", base: "48 × 48 × 1 grayscale", proposed: "Defined by the trained Swin configuration" },
  {
    label: "Evaluation",
    base: "Accuracy, Precision, Recall, F1-score",
    proposed: "Accuracy, Precision, Recall, F1-score",
  },
];

function Architecture() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="System design"
        title="Model Architecture"
        description="The base paper pipeline and the proposed pipeline for this project. The proposed system is highlighted."
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Base paper" icon={Brain} badge={<Chip>Reference</Chip>}>
          <Flow steps={BASE} />
        </Panel>
        <Panel
          title="Proposed system"
          icon={Cpu}
          badge={<Chip tone="primary">This project</Chip>}
          className="panel-glow"
        >
          <Flow steps={PROPOSED} highlight />
        </Panel>
      </div>

      <Panel title="Base paper comparison" icon={GitCompare}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-[11px] tracking-widest text-muted-foreground uppercase">
                <th className="pb-2 font-semibold">Aspect</th>
                <th className="pb-2 font-semibold">Base paper</th>
                <th className="pb-2 font-semibold text-primary">Proposed</th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON.map((row) => (
                <tr key={row.label} className="border-b border-border/60 last:border-0">
                  <td className="py-3 pr-4 text-muted-foreground">{row.label}</td>
                  <td className="py-3 pr-4">{row.base}</td>
                  <td className="py-3 font-medium text-primary">{row.proposed}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <Disclaimer>
        No numerical performance values are stated for either pipeline. Comparative results can only be
        reported after both models are trained and evaluated on the selected dataset.
      </Disclaimer>
    </div>
  );
}
