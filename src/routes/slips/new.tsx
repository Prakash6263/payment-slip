import { createFileRoute } from "@tanstack/react-router";
import { SalarySlipForm } from "@/components/SalarySlipForm";

export const Route = createFileRoute("/slips/new")({
  component: () => <SalarySlipForm />,
  head: () => ({ meta: [
    { title: "New Salary Slip — Technorizen" },
    { name: "description", content: "Create a Technorizen employee salary slip for a selected month." },
    { property: "og:title", content: "New Salary Slip — Technorizen" },
    { property: "og:description", content: "Create a Technorizen employee salary slip for a selected month." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
});
