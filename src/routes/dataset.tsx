import { createFileRoute } from "@tanstack/react-router";
import { Database } from "lucide-react";
import { Disclaimer, PageHeader, Panel } from "@/components/fer/ui";
import { EMOTIONS } from "@/lib/fer/types";

export const Route = createFileRoute("/dataset")({
  head: () => ({
    meta: [
      { title: "Dataset — FER2013 Configuration" },
      {
        name: "description",
        content:
          "FER2013 dataset information for the facial emotion recognition project: image size, channels and the seven emotion classes.",
      },
      { property: "og:title", content: "Dataset — FER2013" },
      { property: "og:description", content: "Dataset details used for training and evaluation." },
    ],
  }),
  component: Dataset,
});

function Dataset() {
  const rows: [string, string][] = [
    ["Dataset", "FER2013"],
    ["Image size", "48 × 48"],
    ["Channels", "Grayscale (1)"],
    ["Classes", "7"],
  ];
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Data" title="Dataset" description="Dataset configuration reference." />
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Dataset details" icon={Database}>
          <dl className="space-y-3 text-sm">
            {rows.map(([k, v]) => (
              <div key={k} className="flex items-center justify-between gap-3">
                <dt className="text-muted-foreground">{k}</dt>
                <dd className="font-medium">{v}</dd>
              </div>
            ))}
          </dl>
        </Panel>
        <Panel title="Emotion classes" icon={Database}>
          <ul className="grid grid-cols-2 gap-2 text-sm">
            {["Angry", "Disgust", "Fear", "Happy", "Sad", "Surprise", "Neutral"].map((c) => (
              <li key={c} className="rounded-lg border border-border bg-background/40 px-3 py-2">
                {c}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-muted-foreground">
            The application uses the same {EMOTIONS.length} classes throughout.
          </p>
        </Panel>
      </div>
      <Disclaimer>
        The final dataset configuration and train/test split will be defined during implementation. No
        split percentages or dataset performance values are claimed here.
      </Disclaimer>
    </div>
  );
}
