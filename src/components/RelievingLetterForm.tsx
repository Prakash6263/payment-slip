import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import logo from "@/assets/technorizen-logo.png";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { exportToPDF, exportToDOC } from "@/lib/export-helpers";

export type RelievingData = {
  id?: string;
  employee_name: string;
  designation: string;
  relieving_date: string;
  data: Record<string, string>;
};

const defaultData: Record<string, string> = {
  body:
    "This is to confirm that you have been relieved from your duties with Technorizen Software Solutions Pvt Ltd, effective from the date mentioned above. You will hand over all the credentials to the HR Department.\n\nYour exit formalities shall be done in accordance with the laid-down process of the Company and your full and final settlement will be completed by our human resource team.\n\nWe wish you all the best in your future endeavors and success in your career.",
  signed_by: "Mrs. Sukrati Thakur",
  signed_role: "HR Manager",
};

export function RelievingLetterForm({ initial }: { initial?: RelievingData }) {
  const navigate = useNavigate();
  const [name, setName] = useState(initial?.employee_name ?? "");
  const [designation, setDesignation] = useState(initial?.designation ?? "");
  const [relievingDate, setRelievingDate] = useState(initial?.relieving_date ?? "");
  const [data, setData] = useState<Record<string, string>>({ ...defaultData, ...(initial?.data ?? {}) });
  const [letterId, setLetterId] = useState<string | undefined>(initial?.id);
  const ref = useRef<HTMLElement>(null);
  const [busy, setBusy] = useState<"pdf" | "doc" | "save" | null>(null);

  useEffect(() => {
    if (!initial) return;
    setName(initial.employee_name);
    setDesignation(initial.designation);
    setRelievingDate(initial.relieving_date);
    setData({ ...defaultData, ...initial.data });
    setLetterId(initial.id);
  }, [initial]);

  const set = (k: string, v: string) => setData((p) => ({ ...p, [k]: v }));
  const filename = useMemo(
    () => `Technorizen-Relieving${name ? "-" + name.replace(/\s+/g, "_") : ""}`,
    [name],
  );

  const save = async () => {
    if (!name.trim()) { toast.error("Please enter the employee name."); return; }
    setBusy("save");
    try {
      const payload = { employee_name: name, designation, relieving_date: relievingDate, data };
      if (letterId) {
        const { error } = await supabase.from("relieving_letters").update(payload).eq("id", letterId);
        if (error) throw error;
        toast.success("Relieving letter updated");
      } else {
        const { data: row, error } = await supabase.from("relieving_letters").insert(payload).select("id").single();
        if (error) throw error;
        setLetterId(row.id);
        toast.success("Relieving letter saved");
        navigate({ to: "/relieving/$id", params: { id: row.id }, replace: true });
      }
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to save");
    } finally { setBusy(null); }
  };

  const onPDF = async () => { if (!ref.current) return; setBusy("pdf"); try { await exportToPDF(ref.current, `${filename}.pdf`); } finally { setBusy(null); } };
  const onDOC = async () => { if (!ref.current) return; setBusy("doc"); try { await exportToDOC(ref.current, `${filename}.docx`); } finally { setBusy(null); } };

  const inputCls = "rounded border border-dashed border-primary/40 bg-primary/5 px-2 py-0.5 font-medium outline-none focus:border-primary print:border-0 print:bg-transparent";

  return (
    <div className="min-h-screen bg-background">
      <div className="no-print sticky top-0 z-10 border-b border-border/60 bg-card/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Technorizen" className="h-8 w-auto" />
            <Link to="/relieving" className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-2 text-sm font-medium hover:bg-muted">← All Relieving Letters</Link>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={save} disabled={!!busy} className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60">
              {busy === "save" ? "Saving…" : letterId ? "Update" : "Save"}
            </button>
            <button onClick={onDOC} disabled={!!busy} className="rounded-md px-4 py-2 text-sm font-semibold text-white disabled:opacity-60" style={{ background: "var(--gradient-accent)" }}>{busy === "doc" ? "Preparing…" : "DOC"}</button>
            <button onClick={onPDF} disabled={!!busy} className="rounded-md px-4 py-2 text-sm font-semibold text-white disabled:opacity-60" style={{ background: "var(--gradient-brand)" }}>{busy === "pdf" ? "Generating…" : "PDF"}</button>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-5xl px-4 py-8">
        <article ref={ref} className="print-page mx-auto rounded-2xl bg-card p-10 text-[13px] leading-[1.7] text-foreground shadow-[var(--shadow-elegant)]" style={{ borderTop: "6px solid transparent", borderImage: "var(--gradient-brand) 1" }}>
          <div className="mb-4 flex items-center justify-between gap-6">
            <img src={logo} alt="Technorizen" className="h-16 w-auto" />
            <div className="text-right text-[11px] text-muted-foreground">
              <p className="font-bold text-foreground">Technorizen Software Solutions Pvt. Ltd.</p>
              <p>402, Sapphire House, Sapna Sangeeta Road, Indore (M.P.)</p>
              <p>0731-4279840 · info@technorizen.com</p>
            </div>
          </div>

          <div className="my-4 rounded-md px-3 py-2 text-center text-base font-bold uppercase tracking-[0.25em] text-white" style={{ background: "var(--gradient-brand)" }}>
            Relieving Letter
          </div>

          <p className="mb-1"><strong>Mr./Ms.</strong> <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Employee name" className={`${inputCls} w-72`} /></p>
          <p><input value={designation} onChange={(e) => setDesignation(e.target.value)} placeholder="Designation" className={`${inputCls} w-60`} /></p>
          <p className="mt-2">Relieving Date: <input value={relievingDate} onChange={(e) => setRelievingDate(e.target.value)} placeholder="DD MMM YYYY" className={`${inputCls} w-40`} /></p>

          <p className="mt-4">Dear <input value={name} onChange={(e) => setName(e.target.value)} className={`${inputCls} w-60`} />,</p>

          <textarea
            value={data.body ?? ""}
            onChange={(e) => set("body", e.target.value)}
            rows={8}
            className="mt-3 w-full resize-y rounded border border-dashed border-primary/40 bg-primary/5 px-2 py-1.5 text-[13px] leading-[1.7] outline-none focus:border-primary print:border-0 print:bg-transparent"
          />

          <p className="mt-6">Thanking You.</p>

          <div className="mt-10 text-[12.5px]">
            <p className="font-semibold"><input value={data.signed_by ?? ""} onChange={(e) => set("signed_by", e.target.value)} className={`${inputCls} w-60`} /></p>
            <p><input value={data.signed_role ?? ""} onChange={(e) => set("signed_role", e.target.value)} className={`${inputCls} w-60`} /></p>
            <p className="font-semibold">Technorizen Software Solutions Pvt. Ltd.</p>
          </div>

          <div className="mt-8 border-t border-border pt-3 text-center text-[11px] leading-relaxed text-muted-foreground">
            <p className="font-bold text-foreground">Technorizen Software Solutions Pvt. Ltd.</p>
            <p>Address: 402, Sapphire House, Sapna Sangeeta Road, Indore (M.P.)</p>
            <p>Contact No: 0731-4279840 · Mail: info@technorizen.com · Website: www.technorizen.com</p>
          </div>
        </article>
      </main>
    </div>
  );
}