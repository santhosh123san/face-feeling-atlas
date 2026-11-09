import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <header className="mb-6 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4 sm:flex sm:flex-wrap sm:justify-between">
      <div className="min-w-0">
        {eyebrow ? (
          <p className="text-[11px] font-semibold tracking-widest text-primary uppercase">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="mt-1 font-display text-2xl font-bold sm:text-3xl">{title}</h1>
        {description ? (
          <p className="mt-2 max-w-3xl text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="shrink-0">{actions}</div> : null}
    </header>
  );
}

export function Panel({
  title,
  icon: Icon,
  badge,
  className,
  children,
  footer,
}: {
  title?: string;
  icon?: LucideIcon;
  badge?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <section className={cn("panel p-5", className)}>
      {title ? (
        <div className="mb-4 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
          <div className="flex min-w-0 items-center gap-2">
            {Icon ? <Icon className="h-4 w-4 shrink-0 text-primary" /> : null}
            <h3 className="truncate text-xs font-semibold tracking-widest text-muted-foreground uppercase">
              {title}
            </h3>
          </div>
          {badge ? <div className="shrink-0">{badge}</div> : null}
        </div>
      ) : null}
      {children}
      {footer ? (
        <div className="mt-4 border-t border-border pt-3 text-[11px] text-muted-foreground">
          {footer}
        </div>
      ) : null}
    </section>
  );
}

export function Chip({
  tone = "muted",
  children,
  className,
}: {
  tone?: "muted" | "primary" | "success" | "warning" | "destructive" | "accent";
  children: React.ReactNode;
  className?: string;
}) {
  const tones: Record<string, string> = {
    muted: "border-border bg-surface-2 text-muted-foreground",
    primary: "border-primary/30 bg-primary/10 text-primary",
    success: "border-success/30 bg-success/10 text-success",
    warning: "border-warning/30 bg-warning/10 text-warning",
    destructive: "border-destructive/40 bg-destructive/10 text-destructive",
    accent: "border-accent/30 bg-accent/10 text-accent",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold tracking-widest uppercase",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "primary",
}: {
  label: string;
  value: string;
  hint?: string;
  icon: LucideIcon;
  tone?: "primary" | "success" | "warning" | "muted" | "accent";
}) {
  const tones: Record<string, string> = {
    primary: "text-primary bg-primary/10 ring-primary/25",
    success: "text-success bg-success/10 ring-success/25",
    warning: "text-warning bg-warning/10 ring-warning/25",
    accent: "text-accent bg-accent/10 ring-accent/25",
    muted: "text-muted-foreground bg-surface-2 ring-border",
  };
  return (
    <div className="panel p-4">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold tracking-widest text-muted-foreground uppercase">
            {label}
          </p>
          <p className="mt-2 truncate font-display text-xl font-bold sm:text-2xl">{value}</p>
          {hint ? <p className="mt-1 truncate text-xs text-muted-foreground">{hint}</p> : null}
        </div>
        <div className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-xl ring-1", tones[tone])}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

export function Disclaimer({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-xl border border-warning/25 bg-warning/5 p-4 text-xs leading-relaxed text-warning">
      {children}
    </p>
  );
}
