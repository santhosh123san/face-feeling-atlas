import { Camera, CameraOff, CircleDot, Play, ScanFace, Square } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFer } from "@/lib/fer/FerProvider";
import { Chip } from "./ui";

export function CameraPanel({ compact = false }: { compact?: boolean }) {
  const {
    videoRef,
    cameraActive,
    cameraError,
    cameraMessage,
    startCamera,
    stopCamera,
    analyzing,
    toggleAnalyzing,
    captureOnce,
    faceStatus,
    box,
    settings,
    updateSettings,
    inferenceSource,
  } = useFer();

  const faceLabel =
    faceStatus === "multiple"
      ? "Multiple Faces Detected"
      : faceStatus === "single"
        ? "Face Detected"
        : "No Face Detected";

  return (
    <div className="panel overflow-hidden">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-border px-4 py-3">
        <div className="flex min-w-0 items-center gap-2">
          <ScanFace className="h-4 w-4 shrink-0 text-primary" />
          <h3 className="truncate text-xs font-semibold tracking-widest text-muted-foreground uppercase">
            Live camera
          </h3>
        </div>
        <Chip tone={cameraActive ? "success" : "muted"}>
          <CircleDot className={cn("h-3 w-3", cameraActive && "pulse-soft")} />
          {cameraActive ? "Camera Active" : (cameraMessage ?? "Inactive")}
        </Chip>
      </div>

      <div
        className={cn(
          "relative w-full overflow-hidden bg-background/70 grid-lines",
          compact ? "aspect-4/3" : "aspect-video",
        )}
      >
        <video
          ref={videoRef}
          playsInline
          muted
          autoPlay
          className={cn(
            "h-full w-full object-cover transition-opacity duration-300",
            cameraActive ? "opacity-100" : "opacity-0",
          )}
        />

        {/* corner markers */}
        <div className="pointer-events-none absolute inset-4">
          {["left-0 top-0 border-l-2 border-t-2", "right-0 top-0 border-r-2 border-t-2", "left-0 bottom-0 border-l-2 border-b-2", "right-0 bottom-0 border-r-2 border-b-2"].map(
            (pos) => (
              <span
                key={pos}
                className={cn("absolute h-6 w-6 border-primary/70 rounded-[3px]", pos)}
              />
            ),
          )}
        </div>

        {cameraActive && analyzing ? <span className="scanline" /> : null}

        {cameraActive && box && faceStatus !== "none" ? (
          <div
            className="pointer-events-none absolute rounded-md border-2 border-primary/90 shadow-[0_0_0_9999px_transparent]"
            style={{
              left: `${box.x * 100}%`,
              top: `${box.y * 100}%`,
              width: `${box.width * 100}%`,
              height: `${box.height * 100}%`,
            }}
          >
            <span className="absolute -top-6 left-0 rounded bg-primary px-1.5 py-0.5 text-[10px] font-semibold tracking-wider text-primary-foreground uppercase">
              YOLOv8 • Face Detection
            </span>
          </div>
        ) : null}

        <div className="pointer-events-none absolute bottom-3 left-3 flex flex-wrap gap-2">
          <Chip tone={faceStatus === "none" ? "muted" : faceStatus === "multiple" ? "warning" : "success"}>
            {faceLabel}
          </Chip>
          <Chip tone={inferenceSource === "demo" ? "warning" : "success"}>
            {inferenceSource === "demo" ? "Demo mode" : "Model mode"}
          </Chip>
        </div>

        {!cameraActive ? (
          <div className="absolute inset-0 grid place-items-center px-6 text-center">
            <div>
              <Camera className="mx-auto h-10 w-10 text-muted-foreground" />
              <p className="mt-3 text-sm font-medium">
                {cameraError ?? cameraMessage ?? "Camera inactive"}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Start the camera to begin live facial analysis.
              </p>
            </div>
          </div>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-2 border-t border-border px-4 py-3">
        <button
          type="button"
          onClick={() => void startCamera()}
          disabled={cameraActive}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-3.5 py-2 text-xs font-semibold tracking-wide text-primary-foreground uppercase transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          <Camera className="h-4 w-4" /> Start camera
        </button>
        <button
          type="button"
          onClick={stopCamera}
          disabled={!cameraActive}
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface-2 px-3.5 py-2 text-xs font-semibold tracking-wide uppercase transition-colors hover:bg-secondary disabled:opacity-40"
        >
          <CameraOff className="h-4 w-4" /> Stop camera
        </button>
        <button
          type="button"
          onClick={() => void captureOnce()}
          disabled={!cameraActive}
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface-2 px-3.5 py-2 text-xs font-semibold tracking-wide uppercase transition-colors hover:bg-secondary disabled:opacity-40"
        >
          <Square className="h-4 w-4" /> Capture frame
        </button>
        <button
          type="button"
          onClick={toggleAnalyzing}
          disabled={!cameraActive}
          className={cn(
            "inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold tracking-wide uppercase transition-colors disabled:opacity-40",
            analyzing
              ? "bg-destructive text-destructive-foreground"
              : "bg-accent text-accent-foreground",
          )}
        >
          <Play className="h-4 w-4" /> {analyzing ? "Stop analysis" : "Analyze"}
        </button>
        <button
          type="button"
          onClick={() => updateSettings({ demoMode: !settings.demoMode })}
          className={cn(
            "inline-flex items-center gap-2 rounded-lg border px-3.5 py-2 text-xs font-semibold tracking-wide uppercase transition-colors",
            settings.demoMode
              ? "border-warning/40 bg-warning/10 text-warning"
              : "border-border bg-surface-2 text-muted-foreground",
          )}
        >
          Demo mode {settings.demoMode ? "ON" : "OFF"}
        </button>
      </div>

      {cameraError ? (
        <p className="border-t border-destructive/30 bg-destructive/10 px-4 py-3 text-xs text-destructive">
          {cameraError}
        </p>
      ) : null}
    </div>
  );
}
