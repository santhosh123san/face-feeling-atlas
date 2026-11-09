import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { AlertTriangle, History as HistoryIcon, LineChart as LineChartIcon, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFer } from "@/lib/fer/FerProvider";
import { EMOTION_META } from "@/lib/fer/emotionMeta";
import { EMOTIONS } from "@/lib/fer/types";
import { Chip, Panel } from "./ui";

export function HistoryTable({ limit = 20 }: { limit?: number }) {
  const { history, clearHistory } = useFer();
  const rows = history.slice(0, limit);

  return (
    <Panel
      title="Emotion history"
      icon={HistoryIcon}
      badge={
        <button
          type="button"
          onClick={clearHistory}
          disabled={rows.length === 0}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface-2 px-2.5 py-1.5 text-[10px] font-semibold tracking-widest uppercase transition-colors hover:bg-secondary disabled:opacity-40"
        >
          <Trash2 className="h-3 w-3" /> Clear history
        </button>
      }
      footer={`Keeps the latest ${limit} observations from the current session only.`}
    >
      {rows.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
          No observations yet. Start the camera and run analysis to populate history.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-[11px] tracking-widest text-muted-foreground uppercase">
                <th className="pb-2 font-semibold">Timestamp</th>
                <th className="pb-2 font-semibold">Emotion</th>
                <th className="pb-2 font-semibold">Confidence</th>
                <th className="pb-2 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((o) => {
                const meta = EMOTION_META[o.emotion];
                return (
                  <tr key={o.id} className="border-b border-border/60 last:border-0">
                    <td className="py-2.5 font-mono text-xs text-muted-foreground">{o.time}</td>
                    <td className="py-2.5">
                      <span className="flex items-center gap-2">
                        <meta.icon className={cn("h-4 w-4", meta.tone)} />
                        {o.emotion}
                      </span>
                    </td>
                    <td className="py-2.5 font-mono text-xs">{(o.confidence * 100).toFixed(0)}%</td>
                    <td className="py-2.5">
                      <Chip tone={o.status === "Simulated" ? "warning" : "success"}>{o.status}</Chip>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Panel>
  );
}

export function EmotionTimeline() {
  const { history } = useFer();
  const data = [...history]
    .reverse()
    .map((o) => ({
      time: o.time,
      confidence: Number((o.confidence * 100).toFixed(1)),
      index: EMOTIONS.indexOf(o.emotion) + 1,
      emotion: o.emotion,
    }));

  const transitions = [...history]
    .reverse()
    .map((o) => o.emotion)
    .filter((e, i, arr) => i === 0 || arr[i - 1] !== e);

  return (
    <Panel
      title="Emotion timeline"
      icon={LineChartIcon}
      footer="Only observations generated during the current session are plotted."
    >
      {data.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground">
          Timeline will populate as observations are generated.
        </p>
      ) : (
        <>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
                <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" />
                <XAxis
                  dataKey="time"
                  tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }}
                  stroke="var(--color-border)"
                />
                <YAxis
                  yAxisId="emotion"
                  domain={[0, EMOTIONS.length + 1]}
                  ticks={EMOTIONS.map((_, i) => i + 1)}
                  tickFormatter={(v: number) => EMOTIONS[v - 1] ?? ""}
                  tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }}
                  stroke="var(--color-border)"
                  width={78}
                />
                <YAxis
                  yAxisId="confidence"
                  orientation="right"
                  domain={[0, 100]}
                  tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }}
                  stroke="var(--color-border)"
                  width={34}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-popover)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 12,
                    fontSize: 12,
                    color: "var(--color-popover-foreground)",
                  }}
                />
                <Line
                  yAxisId="emotion"
                  type="stepAfter"
                  dataKey="index"
                  name="Emotion"
                  stroke="var(--chart-1)"
                  strokeWidth={2}
                  dot={{ r: 2 }}
                />
                <Line
                  yAxisId="confidence"
                  type="monotone"
                  dataKey="confidence"
                  name="Confidence %"
                  stroke="var(--chart-2)"
                  strokeWidth={1.5}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-3 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
            {transitions.map((e, i) => (
              <span key={`${e}-${i}`} className="flex items-center gap-1.5">
                {i > 0 ? <span className="text-primary">→</span> : null}
                <span className="text-foreground">{e}</span>
              </span>
            ))}
          </p>
        </>
      )}
    </Panel>
  );
}

export function AlertCard() {
  const { alert, dismissAlert, settings, updateSettings } = useFer();

  return (
    <Panel title="Alert & monitoring" icon={AlertTriangle}>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-[11px] tracking-widest text-muted-foreground uppercase">
            Confidence threshold: {settings.confidenceThreshold}%
          </span>
          <input
            type="range"
            min={50}
            max={99}
            step={1}
            value={settings.confidenceThreshold}
            onChange={(e) => updateSettings({ confidenceThreshold: Number(e.target.value) })}
            className="mt-2 w-full accent-[var(--color-primary)]"
          />
        </label>
        <label className="block">
          <span className="text-[11px] tracking-widest text-muted-foreground uppercase">
            Consecutive observations: {settings.consecutiveObservations}
          </span>
          <input
            type="range"
            min={2}
            max={10}
            step={1}
            value={settings.consecutiveObservations}
            onChange={(e) => updateSettings({ consecutiveObservations: Number(e.target.value) })}
            className="mt-2 w-full accent-[var(--color-primary)]"
          />
        </label>
      </div>

      <label className="mt-4 flex items-center justify-between gap-3 rounded-lg border border-border bg-background/40 px-3 py-2.5 text-sm">
        <span>Alerts enabled</span>
        <input
          type="checkbox"
          checked={settings.alertsEnabled}
          onChange={(e) => updateSettings({ alertsEnabled: e.target.checked })}
          className="h-4 w-8 accent-[var(--color-primary)]"
        />
      </label>

      {alert ? (
        <div className="mt-4 rounded-xl border border-warning/40 bg-warning/10 p-4">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
            <div className="min-w-0">
              <p className="flex items-center gap-2 text-sm font-semibold text-warning">
                <AlertTriangle className="h-4 w-4 shrink-0" /> Emotion Monitoring Alert
              </p>
              <p className="mt-1 text-sm">{alert.message}</p>
              <p className="mt-1 text-[11px] text-muted-foreground">
                {alert.count} consecutive observations above {alert.threshold}% prediction confidence.
              </p>
            </div>
            <button
              type="button"
              onClick={dismissAlert}
              className="shrink-0 rounded-lg border border-border bg-surface-2 px-2.5 py-1.5 text-[10px] font-semibold tracking-widest uppercase hover:bg-secondary"
            >
              Dismiss
            </button>
          </div>
        </div>
      ) : (
        <p className="mt-4 rounded-lg border border-dashed border-border px-4 py-6 text-center text-xs text-muted-foreground">
          No monitoring alerts. An alert appears when the same non-neutral expression is observed above
          the threshold for the configured number of consecutive observations.
        </p>
      )}

      <p className="mt-4 border-t border-border pt-3 text-[11px] leading-relaxed text-muted-foreground">
        Alerts describe the observed expression only. Facial emotion cannot determine cheating, lying or
        misconduct.
      </p>
    </Panel>
  );
}
