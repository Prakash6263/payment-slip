import { createFileRoute } from "@tanstack/react-router";
import { ConfirmationLetterForm } from "@/components/ConfirmationLetterForm";

export const Route = createFileRoute("/confirmations/new")({
  component: () => <ConfirmationLetterForm />,
  head: () => ({ meta: [{ title: "New Confirmation Letter — Technorizen" }] }),
});