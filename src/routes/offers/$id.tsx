import { createFileRoute, redirect } from "@tanstack/react-router";

// Route disabled — redirects to home. Uncomment the original implementation below when ready.
export const Route = createFileRoute("/offers/$id")({
  beforeLoad: () => { throw redirect({ to: "/" }); },
  component: () => null,
});

/* ORIGINAL IMPLEMENTATION — uncomment to restore
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { OfferLetterForm, type OfferData } from "@/components/OfferLetterForm";

export const Route = createFileRoute("/offers/$id")({
  component: EditOfferPage,
  head: () => ({ meta: [{ title: "Edit Offer Letter — Technorizen" }] }),
});

function EditOfferPage() {
  const { id } = Route.useParams();
  const [data, setData] = useState<OfferData | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    supabase.from("offer_letters").select("*").eq("id", id).maybeSingle().then(({ data, error }) => {
      if (error) { setErr(error.message); return; }
      if (!data) { setErr("Offer letter not found"); return; }
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
        <Link to="/offers" className="mt-3 inline-block text-primary underline">Back to list</Link>
      </div>
    </div>
  );
  if (!data) return <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">Loading offer letter…</div>;
  return <OfferLetterForm initial={data} />;
}
*/
