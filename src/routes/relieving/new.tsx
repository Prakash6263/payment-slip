import { createFileRoute, redirect } from "@tanstack/react-router";

// Route disabled — redirects to home. Uncomment the original implementation below when ready.
export const Route = createFileRoute("/relieving/new")({
  beforeLoad: () => { throw redirect({ to: "/" }); },
  component: () => null,
});

/* ORIGINAL IMPLEMENTATION — uncomment to restore
import { createFileRoute } from "@tanstack/react-router";
import { RelievingLetterForm } from "@/components/RelievingLetterForm";

export const Route = createFileRoute("/relieving/new")({
  component: () => <RelievingLetterForm />,
  head: () => ({ meta: [{ title: "New Relieving Letter — Technorizen" }] }),
});
*/
