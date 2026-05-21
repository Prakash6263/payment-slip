import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { RelievingLetterForm, type RelievingData } from "@/components/RelievingLetterForm";

export const Route = createFileRoute("/relieving/$id")({
  component: EditRelievingPage,
  head: () => ({ meta: [{ title: "Edit Relieving Letter — Technorizen" }] }),
});

function EditRelievingPage() {
  const { id } = Route.useParams();
  const [data, setData] = useState<RelievingData | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    supabase.from("relieving_letters").select("*").eq("id", id).maybeSingle().then(({ data, error }) => {
      if (error) { setErr(error.message); return; }
      if (!data) { setErr("Relieving letter not found"); return; }
      setData({
        id: data.id,
        employee_name: data.employee_name,
        designation: data.designation,
        relieving_date: data.relieving_date,
        data: (data.data as Record<string, string>) ?? {},
      });
    });
  }, [id]);

  if (err) return (
    <div className="flex min-h-screen items-center justify-center text-sm">
      <div className="text-center">
        <p className="text-destructive">{err}</p>
        <Link to="/relieving" className="mt-3 inline-block text-primary underline">Back to list</Link>
      </div>
    </div>
  );
  if (!data) return <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">Loading…</div>;
  return <RelievingLetterForm initial={data} />;
}