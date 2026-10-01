import { createFileRoute } from "@tanstack/react-router";
import { OfferLetterForm } from "@/components/OfferLetterForm";

export const Route = createFileRoute("/offers/new")({
  component: () => <OfferLetterForm />,
  head: () => ({ meta: [
    { title: "New Offer Letter — Technorizen" },
    { name: "description", content: "Create a Technorizen employee offer letter." },
    { property: "og:title", content: "New Offer Letter — Technorizen" },
    { property: "og:description", content: "Create a Technorizen employee offer letter." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
});
