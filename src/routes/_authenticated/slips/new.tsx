import { createFileRoute } from "@tanstack/react-router";
import { SalarySlipForm } from "@/components/SalarySlipForm";

export const Route = createFileRoute("/_authenticated/slips/new")({
  component: () => <SalarySlipForm />,
  head: () => ({ meta: [{ title: "New Salary Slip — Technorizen" }] }),
});
