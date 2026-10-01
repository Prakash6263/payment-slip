import { createFileRoute } from "@tanstack/react-router";
import { ConfirmationLetterForm } from "@/components/ConfirmationLetterForm";

export const Route = createFileRoute("/confirmations/new")({
  component: () => <ConfirmationLetterForm />,
  head: () => ({ meta: [
    { title: "New Confirmation Letter — Technorizen" },
    { name: "description", content: "Create a Technorizen employee confirmation letter." },
    { property: "og:title", content: "New Confirmation Letter — Technorizen" },
    { property: "og:description", content: "Create a Technorizen employee confirmation letter." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
});
