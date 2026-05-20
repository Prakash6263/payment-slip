import { createFileRoute } from "@tanstack/react-router";
import { OfferLetterForm } from "@/components/OfferLetterForm";

export const Route = createFileRoute("/offers/new")({
  component: () => <OfferLetterForm />,
  head: () => ({ meta: [{ title: "New Offer Letter — Technorizen" }] }),
});