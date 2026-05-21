import { createFileRoute } from "@tanstack/react-router";
import { ExperienceCertificateForm } from "@/components/ExperienceCertificateForm";

export const Route = createFileRoute("/experience/new")({
  component: () => <ExperienceCertificateForm />,
  head: () => ({ meta: [{ title: "New Experience Certificate — Technorizen" }] }),
});