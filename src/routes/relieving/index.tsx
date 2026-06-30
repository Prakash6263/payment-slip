import { createFileRoute, redirect } from "@tanstack/react-router";

// Route disabled — redirects to home. Uncomment the original implementation below when ready.
export const Route = createFileRoute("/relieving/")({
  beforeLoad: () => { throw redirect({ to: "/" }); },
  component: () => null,
});

/* ORIGINAL IMPLEMENTATION — uncomment to restore
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import logo from "@/assets/technorizen-logo.png";
import { Plus, Pencil, Trash2, Home } from "lucide-react";

export const Route = createFileRoute("/relieving/")({
  component: RelievingListPage,
  head: () => ({ meta: [{ title: "Saved Relieving Letters — Technorizen" }] }),
});

type Row = { id: string; employee_name: string; designation: string; relieving_date: string; updated_at: string; };

function RelievingListPage() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<Row[] | null>(null);
  const [q, setQ] = useState("");

  const load = async () => {
    const { data, error } = await supabase
      .from("relieving_letters")
      .select("id, employee_name, designation, relieving_date, updated_at")
      .order("updated_at", { ascending: false });
    if (error) { toast.error(error.message); return; }
    setRows((data ?? []) as Row[]);
  };
  useEffect(() => { load(); }, []);

  const onDelete = async (id: string) => {
    if (!confirm("Delete this relieving letter?")) return;
    const { error } = await supabase.from("relieving_letters").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    setRows((r) => (r ?? []).filter((x) => x.id !== id));
    toast.success("Deleted");
  };

  const filtered = (rows ?? []).filter((r) =>
    !q || [r.employee_name, r.designation, r.relieving_date].join(" ").toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border/60 bg-card/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Technorizen" className="h-8 w-auto" />
            <span className="text-sm font-medium">Relieving Letters</span>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/" className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-2 text-sm font-medium hover:bg-muted">
              <Home className="h-4 w-4" /> Home
            </Link>
            <Link to="/relieving/new" className="inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold text-white" style={{ background: "var(--gradient-brand)" }}>
              <Plus className="h-4 w-4" /> New letter
            </Link>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-5 flex items-center justify-between gap-3">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by employee, designation, or date…"
            className="w-full max-w-md rounded-md border border-border bg-card px-3 py-2 text-sm outline-none focus:border-primary" />
          <span className="text-xs text-muted-foreground">{filtered.length} letter{filtered.length === 1 ? "" : "s"}</span>
        </div>

        {rows === null ? (
          <p className="py-10 text-center text-sm text-muted-foreground">Loading…</p>
        ) : filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-10 text-center">
            <p className="text-sm text-muted-foreground">No saved relieving letters yet.</p>
            <Link to="/relieving/new" className="mt-3 inline-block text-sm font-semibold text-primary">Create your first letter →</Link>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Employee</th>
                  <th className="px-4 py-3">Designation</th>
                  <th className="px-4 py-3">Relieving Date</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-muted/30 cursor-pointer" onClick={() => navigate({ to: "/relieving/$id", params: { id: r.id } })}>
                    <td className="px-4 py-3 font-medium">{r.employee_name || "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{r.designation || "—"}</td>
                    <td className="px-4 py-3">{r.relieving_date || "—"}</td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <Link to="/relieving/$id" params={{ id: r.id }}
                          className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-2.5 py-1.5 text-xs font-medium hover:bg-muted">
                          <Pencil className="h-3.5 w-3.5" /> Edit
                        </Link>
                        <button onClick={() => onDelete(r.id)}
                          className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/10">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
*/
