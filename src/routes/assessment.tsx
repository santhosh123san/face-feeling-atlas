import { createFileRoute } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";
import { CameraPanel } from "@/components/fer/CameraPanel";
import { EmotionResultCard } from "@/components/fer/AnalysisPanels";
import { AlertCard, EmotionTimeline } from "@/components/fer/HistoryPanels";
import { Disclaimer, PageHeader, Panel } from "@/components/fer/ui";
import { useFer } from "@/lib/fer/FerProvider";

export const Route = createFileRoute("/assessment")({
  head: () => ({
    meta: [
      { title: "Assessment Monitoring Demo — Conceptual Demonstration" },
      {
        name: "description",
        content:
          "Conceptual demonstration of expression monitoring during an online assessment, with candidate camera, expression timeline and descriptive monitoring alerts.",
      },
      { property: "og:title", content: "Assessment Monitoring Demo" },
      {
        property: "og:description",
        content:
          "A conceptual demo only: facial emotion cannot independently determine cheating or misconduct.",
      },
    ],
  }),
  component: AssessmentDemo,
});

function AssessmentDemo() {
  const { currentEmotion, confidence } = useFer();
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Conceptual application"
        title="Assessment Monitoring Demo"
        description="An illustrative layout showing how expression observations could support a human proctor."
      />
      <Disclaimer>
        Facial emotion recognition is an additional observation signal and cannot independently determine
        cheating, lying, or misconduct.
      </Disclaimer>
      <div className="grid gap-4 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-2">
          <CameraPanel compact />
          <EmotionTimeline />
        </div>
        <div className="space-y-4">
          <Panel title="Candidate signal" icon={ShieldCheck}>
            <dl className="space-y-3 text-sm">
              <div className="flex items-center justify-between gap-3">
                <dt className="text-muted-foreground">Current expression</dt>
                <dd className="font-medium">{currentEmotion ?? "—"}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-muted-foreground">Prediction confidence</dt>
                <dd className="font-medium">
                  {confidence === null ? "—" : `${(confidence * 100).toFixed(0)}%`}
                </dd>
              </div>
            </dl>
          </Panel>
          <EmotionResultCard />
          <AlertCard />
        </div>
      </div>
    </div>
  );
}
