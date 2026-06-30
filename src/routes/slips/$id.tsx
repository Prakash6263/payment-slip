import { createFileRoute, redirect } from "@tanstack/react-router";

// Route disabled — redirects to home. Uncomment the original implementation below when ready.
export const Route = createFileRoute("/slips/$id")({
  beforeLoad: () => { throw redirect({ to: "/" }); },
  component: () => null,
});

/* ORIGINAL IMPLEMENTATION — uncomment to restore
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SalarySlipForm, type SlipData } from "@/components/SalarySlipForm";

export const Route = createFileRoute("/slips/$id")({
  component: EditSlipPage,
  head: () => ({ meta: [{ title: "Edit Salary Slip — Technorizen" }] }),
});

function EditSlipPage() {
  const { id } = Route.useParams();
  const [data, setData] = useState<SlipData | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    supabase.from("salary_slips").select("*").eq("id", id).maybeSingle().then(({ data, error }) => {
      if (error) { setErr(error.message); return; }
      if (!data) { setErr("Slip not found"); return; }
      setData({
        id: data.id, month: data.month,
        emp: (data.emp as Record<string, string>) ?? {},
        earnings: (data.earnings as Record<string, string>) ?? {},
        deductions: (data.deductions as Record<string, string>) ?? {},
      });
    });
  }, [id]);

  if (err) return (
    <div className="flex min-h-screen items-center justify-center text-sm">
      <div className="text-center">
        <p className="text-destructive">{err}</p>
        <Link to="/" className="mt-3 inline-block text-primary underline">Back to list</Link>
      </div>
    </div>
  );
  if (!data) return <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">Loading slip…</div>;
  return <SalarySlipForm initial={data} />;
}

*/
