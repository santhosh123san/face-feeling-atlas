import { createFileRoute } from "@tanstack/react-router";
import { CameraPanel } from "@/components/fer/CameraPanel";
import {
  EmotionResultCard,
  FaceDetectionCard,
  PreprocessingCard,
  ProbabilityPanel,
  SwinTransformerCard,
} from "@/components/fer/AnalysisPanels";
import { AlertCard, EmotionTimeline, HistoryTable } from "@/components/fer/HistoryPanels";
import { PageHeader } from "@/components/fer/ui";
import { UploadImagePanel } from "@/components/fer/UploadImagePanel";

export const Route = createFileRoute("/live")({
  head: () => ({
    meta: [
      { title: "Live Analysis — Facial Emotion Recognition Demo" },
      {
        name: "description",
        content:
          "Live webcam demo screen: face detection overlay, preprocessing pipeline states, Swin Transformer panel, emotion probabilities and monitoring alerts.",
      },
      { property: "og:title", content: "Live Analysis — Facial Emotion Recognition Demo" },
      {
        property: "og:description",
        content:
          "Run the webcam pipeline demo with clearly-labelled simulated predictions or a connected inference backend.",
      },
    ],
  }),
  component: LiveAnalysis,
});

function LiveAnalysis() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Main demo screen"
        title="Live Analysis"
        description="Start the camera, then run Analyze to execute a capture → detect → crop → preprocess → classify cycle every few seconds."
      />

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-2">
          <CameraPanel />
          <UploadImagePanel />
          <div className="grid gap-4 md:grid-cols-2">
            <FaceDetectionCard />
            <PreprocessingCard />
          </div>
          <SwinTransformerCard />
        </div>
        <div className="space-y-4">
          <EmotionResultCard />
          <ProbabilityPanel />
          <AlertCard />
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <HistoryTable />
        <EmotionTimeline />
      </div>
    </div>
  );
}
