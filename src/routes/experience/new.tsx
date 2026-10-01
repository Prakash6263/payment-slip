import { createFileRoute } from "@tanstack/react-router";
import { ExperienceCertificateForm } from "@/components/ExperienceCertificateForm";

export const Route = createFileRoute("/experience/new")({
  component: () => <ExperienceCertificateForm />,
  head: () => ({ meta: [
    { title: "New Experience Certificate — Technorizen" },
    { name: "description", content: "Create a Technorizen employee experience certificate." },
    { property: "og:title", content: "New Experience Certificate — Technorizen" },
    { property: "og:description", content: "Create a Technorizen employee experience certificate." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
});
