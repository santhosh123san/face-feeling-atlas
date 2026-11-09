import { createFileRoute } from "@tanstack/react-router";
import { BarChart3, Grid3x3, Percent, Target } from "lucide-react";
import { Chip, Disclaimer, PageHeader, Panel } from "@/components/fer/ui";
import { EMOTIONS } from "@/lib/fer/types";

export const Route = createFileRoute("/metrics")({
  head: () => ({
    meta: [
      { title: "Evaluation Metrics — Accuracy, Precision, Recall, F1" },
      {
        name: "description",
        content:
          "Definitions and formulas for accuracy, precision, recall and F1-score, plus an empty seven-class confusion matrix awaiting real evaluation data.",
      },
      { property: "og:title", content: "Evaluation Metrics — FER Project" },
      {
        property: "og:description",
        content: "Metric definitions and formulas. No fabricated experimental results.",
      },
    ],
  }),
  component: Metrics,
});

const METRICS = [
  {
    icon: Target,
    name: "Accuracy",
    definition: "Overall proportion of correct predictions.",
    formula: "Accuracy = (TP + TN) / (TP + TN + FP + FN)",
  },
  {
    icon: Percent,
    name: "Precision",
    definition: "Among predicted positive cases, how many are actually positive.",
    formula: "Precision = TP / (TP + FP)",
  },
  {
    icon: BarChart3,
    name: "Recall",
    definition: "Among actual positive cases, how many are correctly identified.",
    formula: "Recall = TP / (TP + FN)",
  },
  {
    icon: Grid3x3,
    name: "F1-Score",
    definition: "Harmonic mean of precision and recall.",
    formula: "F1 = 2 × Precision × Recall / (Precision + Recall)",
  },
];

function Metrics() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Evaluation"
        title="Evaluation Metrics"
        description="Metric definitions used to compare the proposed Swin Transformer pipeline against the base-paper CNN."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {METRICS.map((m) => (
          <Panel key={m.name} title={m.name} icon={m.icon}>
            <p className="text-sm text-muted-foreground">{m.definition}</p>
            <p className="mt-3 rounded-lg border border-border bg-background/50 p-2.5 font-mono text-[11px] break-words">
              {m.formula}
            </p>
            <p className="mt-3 text-xs font-semibold text-warning">
              Results will be populated after model evaluation.
            </p>
          </Panel>
        ))}
      </div>

      <Panel
        title="Confusion matrix (7 classes)"
        icon={Grid3x3}
        badge={<Chip tone="warning">Evaluation data required</Chip>}
        footer="Rows: true label. Columns: predicted label. Cells stay empty until real evaluation output is supplied."
      >
        <div className="overflow-x-auto">
          <table className="min-w-[620px] border-collapse text-xs">
            <thead>
              <tr>
                <th className="border border-border bg-surface-2 px-2 py-2 text-left text-[10px] tracking-widest text-muted-foreground uppercase">
                  True \ Pred
                </th>
                {EMOTIONS.map((e) => (
                  <th
                    key={e}
                    className="border border-border bg-surface-2 px-2 py-2 text-[10px] tracking-widest text-muted-foreground uppercase"
                  >
                    {e}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {EMOTIONS.map((row) => (
                <tr key={row}>
                  <th className="border border-border bg-surface-2 px-2 py-2 text-left text-[11px] font-medium">
                    {row}
                  </th>
                  {EMOTIONS.map((col) => (
                    <td
                      key={col}
                      className="border border-border px-2 py-2 text-center font-mono text-muted-foreground"
                    >
                      —
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <Disclaimer>
        No accuracy, precision, recall, F1-score or benchmark figures are provided in this prototype.
        Prediction confidence shown on the live pages is a per-frame classifier score, not an evaluation
        result.
      </Disclaimer>
    </div>
  );
}
