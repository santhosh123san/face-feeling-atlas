import { createFileRoute } from "@tanstack/react-router";
import { Activity, Camera, ScanFace, Smile } from "lucide-react";
import { useFer } from "@/lib/fer/FerProvider";
import { CameraPanel } from "@/components/fer/CameraPanel";
import { EmotionResultCard, PipelineSummaryCard, ProbabilityPanel } from "@/components/fer/AnalysisPanels";
import { AlertCard, EmotionTimeline, HistoryTable } from "@/components/fer/HistoryPanels";
import { PageHeader, StatCard } from "@/components/fer/ui";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — AI Facial Emotion Recognition Prototype" },
      {
        name: "description",
        content:
          "System, camera, face detection and current emotion status for the facial emotion recognition prototype.",
      },
      { property: "og:title", content: "Dashboard — AI Facial Emotion Recognition" },
      {
        property: "og:description",
        content: "Live status overview of the YOLOv8 + Swin Transformer emotion recognition prototype.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { cameraActive, faceStatus, faceCount, currentEmotion, confidence, analyzing, history } =
    useFer();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Overview"
        title="Dashboard"
        description="Current session status. Values are empty until you start the camera and run analysis — no results are pre-filled."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="System status"
          value={analyzing ? "ANALYSING" : "READY"}
          hint={`${history.length} observation(s) this session`}
          icon={Activity}
          tone={analyzing ? "success" : "primary"}
        />
        <StatCard
          label="Camera"
          value={cameraActive ? "ACTIVE" : "INACTIVE"}
          hint={cameraActive ? "Video stream running" : "Camera released"}
          icon={Camera}
          tone={cameraActive ? "success" : "muted"}
        />
        <StatCard
          label="Face detection"
          value={
            faceStatus === "single"
              ? "DETECTED"
              : faceStatus === "multiple"
                ? `MULTIPLE (${faceCount})`
                : "NOT DETECTED"
          }
          hint="Detector: YOLOv8 (planned)"
          icon={ScanFace}
          tone={faceStatus === "none" ? "muted" : faceStatus === "multiple" ? "warning" : "success"}
        />
        <StatCard
          label="Current emotion"
          value={currentEmotion ? currentEmotion.toUpperCase() : "—"}
          hint={
            confidence === null
              ? "Prediction confidence: —"
              : `Prediction confidence: ${(confidence * 100).toFixed(0)}%`
          }
          icon={Smile}
          tone="accent"
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-2">
          <CameraPanel compact />
          <EmotionTimeline />
        </div>
        <div className="space-y-4">
          <EmotionResultCard />
          <ProbabilityPanel />
          <PipelineSummaryCard />
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <HistoryTable limit={8} />
        <AlertCard />
      </div>
    </div>
  );
}
