import { createFileRoute } from "@tanstack/react-router";
import {
  Boxes,
  GraduationCap,
  HeartPulse,
  MonitorSmartphone,
  ShieldCheck,
  Users,
} from "lucide-react";
import { Disclaimer, PageHeader, Panel } from "@/components/fer/ui";

export const Route = createFileRoute("/applications")({
  head: () => ({
    meta: [
      { title: "Applications — Where Facial Emotion Recognition Helps" },
      {
        name: "description",
        content:
          "Assistive application areas for facial emotion recognition: healthcare support, education, human-computer interaction, interview and assessment support, and intelligent interfaces.",
      },
      { property: "og:title", content: "Applications — Facial Emotion Recognition" },
      {
        property: "og:description",
        content: "Assistive use cases, with clear limitations on what emotion signals can imply.",
      },
    ],
  }),
  component: Applications,
});

const APPS = [
  {
    icon: HeartPulse,
    title: "Healthcare support",
    body: "Assists clinicians by logging observable expression changes during sessions as supplementary context.",
  },
  {
    icon: GraduationCap,
    title: "Education",
    body: "Gives instructors aggregate signals about engagement or confusion during a lesson.",
  },
  {
    icon: MonitorSmartphone,
    title: "Human-computer interaction",
    body: "Lets interfaces adapt pacing, prompts or help content to the user's visible expression.",
  },
  {
    icon: Users,
    title: "Online interview support",
    body: "Provides interviewers with an optional expression timeline for later human review.",
  },
  {
    icon: ShieldCheck,
    title: "Online assessment monitoring support",
    body: "Adds one observation signal among many for human proctors — never an automated verdict.",
  },
  {
    icon: Boxes,
    title: "Intelligent interfaces",
    body: "Enables responsive kiosks, tutoring tools and assistive systems that react to expression.",
  },
];

function Applications() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Use cases"
        title="Applications"
        description="Application areas where facial emotion recognition can act as an assistive signal."
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {APPS.map((app) => (
          <Panel key={app.title} title={app.title} icon={app.icon}>
            <p className="text-sm text-muted-foreground">{app.body}</p>
          </Panel>
        ))}
      </div>
      <Disclaimer>
        Emotion recognition should be treated as an assistive signal and not as definitive evidence of a
        person's mental state, honesty, or behavior.
      </Disclaimer>
    </div>
  );
}
