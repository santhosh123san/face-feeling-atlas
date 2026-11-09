import { createFileRoute } from "@tanstack/react-router";
import { ImageIcon, Ruler, Sparkles, SlidersHorizontal, Boxes } from "lucide-react";
import { Disclaimer, PageHeader, Panel } from "@/components/fer/ui";

export const Route = createFileRoute("/image-processing")({
  head: () => ({
    meta: [
      { title: "Image Processing — Preprocessing Stages Explained" },
      {
        name: "description",
        content:
          "Explanation of the preprocessing stages used before emotion classification: noise reduction, resize, color conversion, normalization and input preparation.",
      },
      { property: "og:title", content: "Image Processing — Preprocessing Stages" },
      {
        property: "og:description",
        content: "What each preprocessing stage does and which stages are actually implemented here.",
      },
    ],
  }),
  component: ImageProcessing,
});

const CARDS = [
  {
    icon: Sparkles,
    title: "Noise reduction",
    body: "Noise is unwanted variation in image intensity that is not part of the underlying scene. Reducing it can stabilise features before classification.",
    status: "Not implemented in this prototype — no specific filter is applied in the browser.",
  },
  {
    icon: Ruler,
    title: "Resize",
    body: "Converts images to the fixed dimensions required by the selected model, so every input tensor has the same shape.",
    status: "Implemented: the cropped face patch is drawn to a fixed square canvas.",
  },
  {
    icon: ImageIcon,
    title: "Grayscale / colour conversion",
    body: "Some models expect single-channel grayscale input, others expect three-channel colour. Conversion is applied only where the model requires it.",
    status: "Reference: the base-paper CNN uses 48 × 48 × 1 grayscale input.",
  },
  {
    icon: SlidersHorizontal,
    title: "Normalization",
    body: "Scales pixel values to a model-compatible range so training and inference statistics match.",
    status: "Performed on the inference side; the browser only prepares the image patch.",
  },
  {
    icon: Boxes,
    title: "Input preparation",
    body: "Assembles the processed image into the batch/tensor layout the classifier expects.",
    status: "Handled by the inference backend when one is connected.",
  },
];

function ImageProcessing() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Preprocessing"
        title="Image Processing"
        description="What happens between face detection and emotion classification, and which of these stages this prototype actually performs."
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {CARDS.map((card) => (
          <Panel key={card.title} title={card.title} icon={card.icon} footer={card.status}>
            <p className="text-sm text-muted-foreground">{card.body}</p>
          </Panel>
        ))}
      </div>
      <Disclaimer>
        No specific denoising filter is claimed to be implemented. Stage descriptions explain the intended
        pipeline; the honest implementation status is stated on each card.
      </Disclaimer>
    </div>
  );
}
