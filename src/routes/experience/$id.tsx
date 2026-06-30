import { createFileRoute, redirect } from "@tanstack/react-router";

// Route disabled — redirects to home. Uncomment the original implementation below when ready.
export const Route = createFileRoute("/experience/$id")({
  beforeLoad: () => { throw redirect({ to: "/" }); },
  component: () => null,
});

/* ORIGINAL IMPLEMENTATION — uncomment to restore
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ExperienceCertificateForm, type ExperienceData } from "@/components/ExperienceCertificateForm";

export const Route = createFileRoute("/experience/$id")({
  component: EditExperiencePage,
  head: () => ({ meta: [{ title: "Edit Experience Certificate — Technorizen" }] }),
});

function EditExperiencePage() {
  const { id } = Route.useParams();
  const [data, setData] = useState<ExperienceData | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    supabase.from("experience_certificates").select("*").eq("id", id).maybeSingle().then(({ data, error }) => {
      if (error) { setErr(error.message); return; }
      if (!data) { setErr("Experience certificate not found"); return; }
      setData({
        id: data.id,
        employee_name: data.employee_name,
        designation: data.designation,
        joining_date: data.joining_date,
        last_working_date: data.last_working_date,
        tenure: data.tenure,
        certificate_date: data.certificate_date,
        data: (data.data as Record<string, string>) ?? {},
      });
    });
  }, [id]);

  if (err) return (
    <div className="flex min-h-screen items-center justify-center text-sm">
      <div className="text-center">
        <p className="text-destructive">{err}</p>
        <Link to="/experience" className="mt-3 inline-block text-primary underline">Back to list</Link>
      </div>
    </div>
  );
  if (!data) return <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">Loading…</div>;
  return <ExperienceCertificateForm initial={data} />;
}
*/
