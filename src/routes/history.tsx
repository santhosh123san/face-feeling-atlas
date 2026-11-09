import { createFileRoute } from "@tanstack/react-router";
import { AlertCard, EmotionTimeline, HistoryTable } from "@/components/fer/HistoryPanels";
import { PageHeader } from "@/components/fer/ui";
import { useFer } from "@/lib/fer/FerProvider";
import { EMOTION_META } from "@/lib/fer/emotionMeta";
import { EMOTIONS } from "@/lib/fer/types";
import { cn } from "@/lib/utils";
import { Panel } from "@/components/fer/ui";
import { PieChart as PieChartIcon } from "lucide-react";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title: "Emotion History — Facial Emotion Recognition Prototype" },
      {
        name: "description",
        content:
          "Session emotion history table, transition timeline and per-emotion observation counts for the current demo session.",
      },
      { property: "og:title", content: "Emotion History — Facial Emotion Recognition" },
      {
        property: "og:description",
        content: "Latest 20 observations with timestamp, emotion, prediction confidence and status.",
      },
    ],
  }),
  component: HistoryPage,
});

function HistoryPage() {
  const { history } = useFer();
  const counts = EMOTIONS.map((emotion) => ({
    emotion,
    count: history.filter((o) => o.emotion === emotion).length,
  }));
  const max = Math.max(1, ...counts.map((c) => c.count));

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Session log"
        title="Emotion History"
        description="Observations recorded during the current session only. History resets when the page reloads."
      />

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <HistoryTable />
        </div>
        <Panel title="Observation distribution" icon={PieChartIcon}>
          <div className="space-y-3">
            {counts.map(({ emotion, count }) => {
              const meta = EMOTION_META[emotion];
              return (
                <div key={emotion}>
                  <div className="mb-1.5 flex items-center justify-between gap-2 text-xs">
                    <span className="flex items-center gap-2">
                      <meta.icon className={cn("h-3.5 w-3.5", meta.tone)} />
                      {emotion}
                    </span>
                    <span className="font-mono text-muted-foreground">{count}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-surface-2">
                    <div
                      className={cn("h-full rounded-full", meta.bar)}
                      style={{ width: `${(count / max) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <EmotionTimeline />
        <AlertCard />
      </div>
    </div>
  );
}
