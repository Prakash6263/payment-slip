import { createFileRoute } from "@tanstack/react-router";
import { RelievingLetterForm } from "@/components/RelievingLetterForm";

export const Route = createFileRoute("/relieving/new")({
  component: () => <RelievingLetterForm />,
  head: () => ({ meta: [{ title: "New Relieving Letter — Technorizen" }] }),
});