import { createFileRoute, redirect } from "@tanstack/react-router";

// Route disabled — redirects to home. Uncomment the original implementation below when ready.
export const Route = createFileRoute("/confirmations/$id")({
  beforeLoad: () => { throw redirect({ to: "/" }); },
  component: () => null,
});

/* ORIGINAL IMPLEMENTATION — uncomment to restore
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ConfirmationLetterForm, type ConfirmationData } from "@/components/ConfirmationLetterForm";

export const Route = createFileRoute("/confirmations/$id")({
  component: EditConfirmationPage,
  head: () => ({ meta: [{ title: "Edit Confirmation Letter — Technorizen" }] }),
});

function EditConfirmationPage() {
  const { id } = Route.useParams();
  const [data, setData] = useState<ConfirmationData | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    supabase.from("confirmation_letters").select("*").eq("id", id).maybeSingle().then(({ data, error }) => {
      if (error) { setErr(error.message); return; }
      if (!data) { setErr("Confirmation letter not found"); return; }
      setData({
        id: data.id,
        employee_name: data.employee_name,
        designation: data.designation,
        letter_date: data.letter_date,
        joining_date: data.joining_date,
        data: (data.data as Record<string, string>) ?? {},
      });
    });
  }, [id]);

  if (err) return (
    <div className="flex min-h-screen items-center justify-center text-sm">
      <div className="text-center">
        <p className="text-destructive">{err}</p>
        <Link to="/confirmations" className="mt-3 inline-block text-primary underline">Back to list</Link>
      </div>
    </div>
  );
  if (!data) return <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">Loading…</div>;
  return <ConfirmationLetterForm initial={data} />;
}
*/
