import { createFileRoute } from "@tanstack/react-router";
import { RelievingLetterForm } from "@/components/RelievingLetterForm";

export const Route = createFileRoute("/relieving/new")({
  component: () => <RelievingLetterForm />,
  head: () => ({ meta: [
    { title: "New Relieving Letter — Technorizen" },
    { name: "description", content: "Create a Technorizen employee relieving letter." },
    { property: "og:title", content: "New Relieving Letter — Technorizen" },
    { property: "og:description", content: "Create a Technorizen employee relieving letter." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
});
