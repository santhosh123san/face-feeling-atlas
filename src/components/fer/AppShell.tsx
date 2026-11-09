import { useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  Activity,
  BarChart3,
  Boxes,
  Brain,
  Camera,
  Database,
  Grid2x2Check,
  History,
  Home,
  ImageIcon,
  Menu,
  Settings as SettingsIcon,
  ShieldCheck,
  Workflow as WorkflowIcon,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useFer } from "@/lib/fer/FerProvider";

const NAV = [
  { to: "/", label: "Home", icon: Home },
  { to: "/dashboard", label: "Dashboard", icon: Activity },
  { to: "/live", label: "Live Analysis", icon: Camera },
  { to: "/history", label: "Emotion History", icon: History },
  { to: "/architecture", label: "Model Architecture", icon: Brain },
  { to: "/workflow", label: "Workflow", icon: WorkflowIcon },
  { to: "/image-processing", label: "Image Processing", icon: ImageIcon },
  { to: "/metrics", label: "Evaluation Metrics", icon: BarChart3 },
  { to: "/dataset", label: "Dataset", icon: Database },
  { to: "/assessment", label: "Assessment Demo", icon: ShieldCheck },
  { to: "/applications", label: "Applications", icon: Boxes },
  { to: "/settings", label: "Settings", icon: SettingsIcon },
] as const;

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  return (
    <nav className="flex flex-col gap-1">
      {NAV.map((item) => {
        const active = pathname === item.to;
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
              active
                ? "bg-sidebar-accent text-primary shadow-[inset_2px_0_0_0_var(--color-primary)]"
                : "text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
            )}
          >
            <item.icon className="h-4 w-4 shrink-0" />
            <span className="truncate">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

function Brand() {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/30">
        <Grid2x2Check className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="truncate font-display text-sm font-semibold">
          AI Facial Emotion Recognition
        </p>
        <p className="truncate text-[11px] text-muted-foreground">
          YOLOv8 • Swin Transformer • CNN Baseline
        </p>
      </div>
    </div>
  );
}

export function DemoModeBanner() {
  const { settings, inferenceSource } = useFer();
  if (inferenceSource === "backend") {
    return (
      <div className="flex items-center justify-center gap-2 border-b border-success/30 bg-success/10 px-4 py-2 text-center text-[11px] font-semibold tracking-widest text-success uppercase">
        Model mode — inference backend configured
      </div>
    );
  }
  return (
    <div className="flex items-center justify-center gap-2 border-b border-warning/30 bg-warning/10 px-4 py-2 text-center text-[11px] font-semibold tracking-widest text-warning uppercase">
      Demo mode — simulated AI output
      {!settings.demoMode ? " (no backend URL configured)" : ""}
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen w-full">
      <DemoModeBanner />
      <div className="flex w-full">
        <aside className="sticky top-0 hidden h-screen w-72 shrink-0 flex-col border-r border-sidebar-border bg-sidebar/80 backdrop-blur-xl lg:flex">
          <div className="border-b border-sidebar-border px-5 py-5">
            <Brand />
            <span className="mt-3 inline-flex rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-[10px] font-semibold tracking-widest text-primary uppercase">
              Academic project prototype
            </span>
          </div>
          <div className="flex-1 overflow-y-auto px-3 py-4">
            <NavList />
          </div>
          <div className="border-t border-sidebar-border px-5 py-4 text-[11px] leading-relaxed text-muted-foreground">
            <p className="font-semibold text-foreground/80">Academic Project Prototype</p>
            <p>YOLOv8 + Swin Transformer + CNN Baseline</p>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-border bg-background/85 px-4 py-3 backdrop-blur-xl sm:px-6">
            <div className="min-w-0">
              <div className="lg:hidden">
                <Brand />
              </div>
              <div className="hidden lg:block">
                <h2 className="truncate font-display text-base font-semibold">
                  AI Facial Emotion Recognition
                </h2>
                <p className="truncate text-xs text-muted-foreground">
                  YOLOv8 Face Detection • Swin Transformer • CNN Baseline
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-label="Toggle navigation"
              className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-border bg-surface-2 text-foreground lg:hidden"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </header>

          {open ? (
            <div className="border-b border-border bg-sidebar/95 px-3 py-3 lg:hidden">
              <NavList onNavigate={() => setOpen(false)} />
            </div>
          ) : null}

          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto w-full max-w-7xl">{children}</div>
          </main>

          <footer className="border-t border-border px-4 py-6 text-center text-xs text-muted-foreground sm:px-6">
            <p className="font-semibold text-foreground/80">Academic Project Prototype</p>
            <p className="mt-1">YOLOv8 + Swin Transformer + CNN Baseline</p>
          </footer>
        </div>
      </div>
    </div>
  );
}
