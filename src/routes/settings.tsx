import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Camera, Server, Settings as SettingsIcon } from "lucide-react";
import { PageHeader, Panel, Disclaimer } from "@/components/fer/ui";
import { useFer } from "@/lib/fer/FerProvider";
import { emotionService } from "@/lib/fer/emotionService";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Camera, Alerts and Demo Mode" },
      {
        name: "description",
        content:
          "Configure camera selection, confidence threshold, consecutive observation count, alert toggle, demo mode and the future inference backend URL.",
      },
      { property: "og:title", content: "Settings — Facial Emotion Recognition Prototype" },
      { property: "og:description", content: "Preferences persist locally in your browser." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { settings, updateSettings, resetSettings, cameras, refreshCameras } = useFer();
  const [testingBackend, setTestingBackend] = useState(false);
  const [backendStatus, setBackendStatus] = useState<string | null>(null);

  const testConnection = async () => {
    setTestingBackend(true);
    setBackendStatus(null);
    try {
      const ok = await emotionService.checkBackendHealth(settings.backendUrl);
      if (ok) {
        setBackendStatus("online");
      } else {
        setBackendStatus("offline");
      }
    } catch {
      setBackendStatus("offline");
    } finally {
      setTestingBackend(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Configuration"
        title="Settings"
        description="All settings persist in your browser's local storage."
        actions={
          <button
            type="button"
            onClick={resetSettings}
            className="rounded-lg border border-border bg-surface-2 px-3.5 py-2 text-[10px] font-semibold tracking-widest uppercase hover:bg-secondary"
          >
            Reset defaults
          </button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Camera" icon={Camera}>
          <label className="block text-sm">
            <span className="text-[11px] tracking-widest text-muted-foreground uppercase">
              Camera selection
            </span>
            <select
              value={settings.cameraDeviceId}
              onChange={(e) => updateSettings({ cameraDeviceId: e.target.value })}
              className="mt-2 w-full rounded-lg border border-border bg-background/60 px-3 py-2 text-sm"
            >
              <option value="">Default camera</option>
              {cameras.map((device, i) => (
                <option key={device.deviceId || i} value={device.deviceId}>
                  {device.label || `Camera ${i + 1}`}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            onClick={() => void refreshCameras()}
            className="mt-3 rounded-lg border border-border bg-surface-2 px-3 py-2 text-[10px] font-semibold tracking-widest uppercase hover:bg-secondary"
          >
            Refresh device list
          </button>
          <p className="mt-3 text-[11px] text-muted-foreground">
            Device labels are only available after camera permission has been granted once.
          </p>
        </Panel>

        <Panel title="Analysis & alerts" icon={SettingsIcon}>
          <label className="block">
            <span className="text-[11px] tracking-widest text-muted-foreground uppercase">
              Confidence threshold: {settings.confidenceThreshold}%
            </span>
            <input
              type="range"
              min={50}
              max={99}
              value={settings.confidenceThreshold}
              onChange={(e) => updateSettings({ confidenceThreshold: Number(e.target.value) })}
              className="mt-2 w-full accent-[var(--color-primary)]"
            />
          </label>
          <label className="mt-4 block">
            <span className="text-[11px] tracking-widest text-muted-foreground uppercase">
              Consecutive observations: {settings.consecutiveObservations}
            </span>
            <input
              type="range"
              min={2}
              max={10}
              value={settings.consecutiveObservations}
              onChange={(e) => updateSettings({ consecutiveObservations: Number(e.target.value) })}
              className="mt-2 w-full accent-[var(--color-primary)]"
            />
          </label>
          <label className="mt-4 block">
            <span className="text-[11px] tracking-widest text-muted-foreground uppercase">
              Analysis interval: {(settings.intervalMs / 1000).toFixed(1)}s
            </span>
            <input
              type="range"
              min={1000}
              max={6000}
              step={500}
              value={settings.intervalMs}
              onChange={(e) => updateSettings({ intervalMs: Number(e.target.value) })}
              className="mt-2 w-full accent-[var(--color-primary)]"
            />
          </label>
          <label className="mt-4 flex items-center justify-between gap-3 rounded-lg border border-border bg-background/40 px-3 py-2.5 text-sm">
            <span>Alerts enabled</span>
            <input
              type="checkbox"
              checked={settings.alertsEnabled}
              onChange={(e) => updateSettings({ alertsEnabled: e.target.checked })}
              className="h-4 w-8 accent-[var(--color-primary)]"
            />
          </label>
          <label className="mt-3 flex items-center justify-between gap-3 rounded-lg border border-warning/30 bg-warning/5 px-3 py-2.5 text-sm">
            <span>Demo mode (simulated output)</span>
            <input
              type="checkbox"
              checked={settings.demoMode}
              onChange={(e) => updateSettings({ demoMode: e.target.checked })}
              className="h-4 w-8 accent-[var(--color-warning)]"
            />
          </label>
        </Panel>

        <Panel
          title="Model mode / inference backend"
          icon={Server}
          className="lg:col-span-2"
          footer="Add your Python inference service URL to enable backend analysis. Image requests are sent as multipart/form-data using the image field to /api/detect-face and /api/predict-emotion."
        >
          <label className="block text-sm">
            <span className="text-[11px] tracking-widest text-muted-foreground uppercase">
              Backend base URL
            </span>
            <input
              type="url"
              value={settings.backendUrl}
              onChange={(e) => updateSettings({ backendUrl: e.target.value })}
              placeholder="http://localhost:8000"
              className="mt-2 w-full rounded-lg border border-border bg-background/60 px-3 py-2 font-mono text-sm"
            />
          </label>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => void testConnection()}
              disabled={testingBackend || !settings.backendUrl}
              className="rounded-lg border border-border bg-surface-2 px-3.5 py-2 text-[10px] font-semibold tracking-widest uppercase hover:bg-secondary disabled:opacity-50"
            >
              {testingBackend ? "Checking..." : "Test backend connection"}
            </button>
            {backendStatus === "online" ? (
              <span className="text-xs font-medium text-success">
                ✓ Backend Connected: YOLOv8 Face Detector & ViT Emotion Classifier Online
              </span>
            ) : backendStatus === "offline" ? (
              <span className="text-xs font-medium text-destructive">
                ✗ Could not connect. Run backend/start_backend.bat to launch the server.
              </span>
            ) : null}
          </div>
        </Panel>
      </div>

      <Disclaimer>
        With Demo Mode on, or with no backend URL configured, every prediction shown in this application
        is simulated and labelled as such.
      </Disclaimer>
    </div>
  );
}
