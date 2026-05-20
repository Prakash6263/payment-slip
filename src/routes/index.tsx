import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import logo from "@/assets/technorizen-logo.png";
import { Plus, Pencil, Copy, Trash2, FileSignature } from "lucide-react";

export const Route = createFileRoute("/")({
  component: SlipsListPage,
  head: () => ({ meta: [{ title: "Saved Salary Slips — Technorizen" }] }),
});

type Slip = {
  id: string; month: string; employee_name: string; employee_id: string;
  emp: Record<string, string>; earnings: Record<string, string>; deductions: Record<string, string>;
  updated_at: string;
};

function bumpMonth(label: string): string {
  if (!label) return "";
  const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const short = months.map((m) => m.slice(0, 3));
  const parts = label.trim().split(/\s+/);
  if (parts.length < 2) return label;
  const [m, y] = [parts[0], parts[parts.length - 1]];
  const year = parseInt(y, 10);
  if (!year) return label;
  const idxLong = months.findIndex((mm) => mm.toLowerCase() === m.toLowerCase());
  const idxShort = short.findIndex((mm) => mm.toLowerCase() === m.slice(0, 3).toLowerCase());
  const idx = idxLong >= 0 ? idxLong : idxShort;
  if (idx < 0) return label;
  const nextIdx = (idx + 1) % 12;
  const nextYear = idx === 11 ? year + 1 : year;
  const useShort = idxLong < 0;
  return `${useShort ? short[nextIdx] : months[nextIdx]} ${nextYear}`;
}

function fmtAmount(slip: Slip) {
  const g = Object.values(slip.earnings || {}).reduce((s, v) => s + (parseFloat(v) || 0), 0);
  const d = Object.values(slip.deductions || {}).reduce((s, v) => s + (parseFloat(v) || 0), 0);
  return (g - d).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function SlipsListPage() {
  const navigate = useNavigate();
  const [slips, setSlips] = useState<Slip[] | null>(null);
  const [q, setQ] = useState("");

  const load = async () => {
    const { data, error } = await supabase
      .from("salary_slips")
      .select("id, month, employee_name, employee_id, emp, earnings, deductions, updated_at")
      .order("updated_at", { ascending: false });
    if (error) { toast.error(error.message); return; }
    setSlips((data ?? []) as unknown as Slip[]);
  };
  useEffect(() => { load(); }, []);

  const onDuplicate = async (slip: Slip) => {
    const { data, error } = await supabase.from("salary_slips").insert({
      month: bumpMonth(slip.month),
      employee_name: slip.employee_name,
      employee_id: slip.employee_id,
      emp: slip.emp, earnings: slip.earnings, deductions: slip.deductions,
    }).select("id").single();
    if (error) { toast.error(error.message); return; }
    toast.success("Copied for next month");
    navigate({ to: "/slips/$id", params: { id: data.id } });
  };

  const onDelete = async (id: string) => {
    if (!confirm("Delete this salary slip?")) return;
    const { error } = await supabase.from("salary_slips").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    setSlips((s) => (s ?? []).filter((x) => x.id !== id));
    toast.success("Deleted");
  };

  const filtered = (slips ?? []).filter((s) =>
    !q || [s.employee_name, s.employee_id, s.month].join(" ").toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border/60 bg-card/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Technorizen" className="h-8 w-auto" />
            <span className="text-sm font-medium text-foreground">Salary Slips</span>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/offers"
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-2 text-sm font-medium hover:bg-muted">
              <FileSignature className="h-4 w-4" /> Offer Letters
            </Link>
            <Link to="/slips/new"
              className="inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold text-white"
              style={{ background: "var(--gradient-brand)" }}>
              <Plus className="h-4 w-4" /> New slip
            </Link>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-5 flex items-center justify-between gap-3">
          <input value={q} onChange={(e) => setQ(e.target.value)}
            placeholder="Search by employee, ID, or month…"
            className="w-full max-w-md rounded-md border border-border bg-card px-3 py-2 text-sm outline-none focus:border-primary" />
          <span className="text-xs text-muted-foreground">{filtered.length} slip{filtered.length === 1 ? "" : "s"}</span>
        </div>

        {slips === null ? (
          <p className="py-10 text-center text-sm text-muted-foreground">Loading…</p>
        ) : filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-10 text-center">
            <p className="text-sm text-muted-foreground">No saved slips yet.</p>
            <Link to="/slips/new" className="mt-3 inline-block text-sm font-semibold text-primary">Create your first slip →</Link>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Employee</th>
                  <th className="px-4 py-3">Emp ID</th>
                  <th className="px-4 py-3">Month</th>
                  <th className="px-4 py-3 text-right">Net Salary (₹)</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium text-foreground">{s.employee_name || "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{s.employee_id || "—"}</td>
                    <td className="px-4 py-3">{s.month}</td>
                    <td className="px-4 py-3 text-right tabular-nums font-semibold">{fmtAmount(s)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link to="/slips/$id" params={{ id: s.id }}
                          className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-2.5 py-1.5 text-xs font-medium hover:bg-muted">
                          <Pencil className="h-3.5 w-3.5" /> Edit
                        </Link>
                        <button onClick={() => onDuplicate(s)}
                          className="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-semibold text-white"
                          style={{ background: "var(--gradient-accent)" }}>
                          <Copy className="h-3.5 w-3.5" /> Next month
                        </button>
                        <button onClick={() => onDelete(s.id)}
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
