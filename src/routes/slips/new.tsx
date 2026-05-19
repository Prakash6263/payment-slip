import { createFileRoute } from "@tanstack/react-router";
import { SalarySlipForm } from "@/components/SalarySlipForm";

export const Route = createFileRoute("/slips/new")({
  component: () => <SalarySlipForm />,
  head: () => ({ meta: [{ title: "New Salary Slip — Technorizen" }] }),
});
