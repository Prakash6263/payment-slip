import { createFileRoute, redirect } from "@tanstack/react-router";

// Route disabled — redirects to home. Uncomment the original implementation below when ready.
export const Route = createFileRoute("/experience/new")({
  beforeLoad: () => { throw redirect({ to: "/" }); },
  component: () => null,
});

/* ORIGINAL IMPLEMENTATION — uncomment to restore
import { createFileRoute } from "@tanstack/react-router";
import { ExperienceCertificateForm } from "@/components/ExperienceCertificateForm";

export const Route = createFileRoute("/experience/new")({
  component: () => <ExperienceCertificateForm />,
  head: () => ({ meta: [{ title: "New Experience Certificate — Technorizen" }] }),
});
*/
