import {
  Angry,
  Frown,
  Laugh,
  Meh,
  ShieldAlert,
  Smile,
  Zap,
  type LucideIcon,
} from "lucide-react";
import type { Emotion } from "./types";

export interface EmotionMeta {
  icon: LucideIcon;
  /** Tailwind text color class built on design tokens. */
  tone: string;
  bar: string;
  chart: string;
}

export const EMOTION_META: Record<Emotion, EmotionMeta> = {
  Happy: {
    icon: Laugh,
    tone: "text-success",
    bar: "bg-success",
    chart: "var(--chart-4)",
  },
  Sad: {
    icon: Frown,
    tone: "text-primary",
    bar: "bg-primary",
    chart: "var(--chart-1)",
  },
  Angry: {
    icon: Angry,
    tone: "text-destructive",
    bar: "bg-destructive",
    chart: "var(--chart-5)",
  },
  Fear: {
    icon: ShieldAlert,
    tone: "text-warning",
    bar: "bg-warning",
    chart: "var(--chart-3)",
  },
  Surprise: {
    icon: Zap,
    tone: "text-accent",
    bar: "bg-accent",
    chart: "var(--chart-2)",
  },
  Disgust: {
    icon: Smile,
    tone: "text-accent",
    bar: "bg-accent",
    chart: "var(--chart-2)",
  },
  Neutral: {
    icon: Meh,
    tone: "text-muted-foreground",
    bar: "bg-muted-foreground",
    chart: "var(--muted-foreground)",
  },
};

export function formatPct(value: number, digits = 0) {
  return `${(value * 100).toFixed(digits)}%`;
}

export function timeLabel(at: number) {
  return new Date(at).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}
