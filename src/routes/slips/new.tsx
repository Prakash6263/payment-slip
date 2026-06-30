import { createFileRoute, redirect } from "@tanstack/react-router";

// Route disabled — redirects to home. Uncomment the original implementation below when ready.
export const Route = createFileRoute("/slips/new")({
  beforeLoad: () => { throw redirect({ to: "/" }); },
  component: () => null,
});

/* ORIGINAL IMPLEMENTATION — uncomment to restore
import { createFileRoute } from "@tanstack/react-router";
import { SalarySlipForm } from "@/components/SalarySlipForm";

export const Route = createFileRoute("/slips/new")({
  component: () => <SalarySlipForm />,
  head: () => ({ meta: [{ title: "New Salary Slip — Technorizen" }] }),
});

*/
