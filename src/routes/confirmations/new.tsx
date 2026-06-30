import { createFileRoute, redirect } from "@tanstack/react-router";

// Route disabled — redirects to home. Uncomment the original implementation below when ready.
export const Route = createFileRoute("/confirmations/new")({
  beforeLoad: () => { throw redirect({ to: "/" }); },
  component: () => null,
});

/* ORIGINAL IMPLEMENTATION — uncomment to restore
import { createFileRoute } from "@tanstack/react-router";
import { ConfirmationLetterForm } from "@/components/ConfirmationLetterForm";

export const Route = createFileRoute("/confirmations/new")({
  component: () => <ConfirmationLetterForm />,
  head: () => ({ meta: [{ title: "New Confirmation Letter — Technorizen" }] }),
});
*/
