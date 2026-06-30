import { createFileRoute, redirect } from "@tanstack/react-router";

// Route disabled — redirects to home. Uncomment the original implementation below when ready.
export const Route = createFileRoute("/offers/new")({
  beforeLoad: () => { throw redirect({ to: "/" }); },
  component: () => null,
});

/* ORIGINAL IMPLEMENTATION — uncomment to restore
import { createFileRoute } from "@tanstack/react-router";
import { OfferLetterForm } from "@/components/OfferLetterForm";

export const Route = createFileRoute("/offers/new")({
  component: () => <OfferLetterForm />,
  head: () => ({ meta: [{ title: "New Offer Letter — Technorizen" }] }),
});
*/
