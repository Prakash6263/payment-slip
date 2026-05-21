import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import logo from "@/assets/technorizen-logo.png";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { exportToPDF, exportToDOC } from "@/lib/export-helpers";

export type ConfirmationData = {
  id?: string;
  employee_name: string;
  designation: string;
  letter_date: string;
  joining_date: string;
  data: Record<string, string>;
};

const defaultData: Record<string, string> = {
  confirmation_from: "",
  reporting_to: "Mr. Shesh Pratap Singh, Director",
  remarks:
    "Based on the satisfactory performance review of your probation period, we are pleased to confirm your services with Technorizen Software Solutions Pvt. Ltd. as a permanent employee, effective from the date mentioned above. All other terms and conditions of your appointment letter shall continue to apply.",
};

export function ConfirmationLetterForm({ initial }: { initial?: ConfirmationData }) {
  const navigate = useNavigate();
  const [name, setName] = useState(initial?.employee_name ?? "");
  const [designation, setDesignation] = useState(initial?.designation ?? "");
  const [letterDate, setLetterDate] = useState(initial?.letter_date ?? "");
  const [joining, setJoining] = useState(initial?.joining_date ?? "");
  const [data, setData] = useState<Record<string, string>>({ ...defaultData, ...(initial?.data ?? {}) });
  const [letterId, setLetterId] = useState<string | undefined>(initial?.id);
  const ref = useRef<HTMLElement>(null);
  const [busy, setBusy] = useState<"pdf" | "doc" | "save" | null>(null);

  useEffect(() => {
    if (!initial) return;
    setName(initial.employee_name);
    setDesignation(initial.designation);
    setLetterDate(initial.letter_date);
    setJoining(initial.joining_date);
    setData({ ...defaultData, ...initial.data });
    setLetterId(initial.id);
  }, [initial]);

  const set = (k: string, v: string) => setData((p) => ({ ...p, [k]: v }));
  const filename = useMemo(
    () => `Technorizen-Confirmation${name ? "-" + name.replace(/\s+/g, "_") : ""}`,
    [name],
  );

  const save = async () => {
    if (!name.trim()) { toast.error("Please enter the employee name."); return; }
    setBusy("save");
    try {
      const payload = { employee_name: name, designation, letter_date: letterDate, joining_date: joining, data };
      if (letterId) {
        const { error } = await supabase.from("confirmation_letters").update(payload).eq("id", letterId);
        if (error) throw error;
        toast.success("Confirmation letter updated");
      } else {
        const { data: row, error } = await supabase.from("confirmation_letters").insert(payload).select("id").single();
        if (error) throw error;
        setLetterId(row.id);
        toast.success("Confirmation letter saved");
        navigate({ to: "/confirmations/$id", params: { id: row.id }, replace: true });
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
            <Link to="/confirmations" className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-2 text-sm font-medium hover:bg-muted">← All Confirmation Letters</Link>
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
            Letter of Confirmation of Employment
          </div>

          <div className="mb-3 flex items-center justify-between gap-4">
            <p><strong>Date:</strong> <input value={letterDate} onChange={(e) => setLetterDate(e.target.value)} placeholder="DD/MM/YYYY" className={`${inputCls} w-32`} /></p>
          </div>

          <p className="mb-2"><strong>To,</strong></p>
          <p><input value={name} onChange={(e) => setName(e.target.value)} placeholder="Employee name" className={`${inputCls} w-72`} /></p>
          <p><input value={designation} onChange={(e) => setDesignation(e.target.value)} placeholder="Designation" className={`${inputCls} w-60`} /></p>
          <p>Technorizen Software Solutions Pvt. Ltd.</p>

          <p className="mt-4 mb-2">Dear <input value={name} onChange={(e) => setName(e.target.value)} className={`${inputCls} w-60`} />,</p>

          <p>
            With reference to your appointment with Technorizen Software Solutions Pvt. Ltd. dated{" "}
            <input value={joining} onChange={(e) => setJoining(e.target.value)} placeholder="Joining date" className={`${inputCls} w-40`} />, we are pleased to confirm your services as a permanent employee in the position of{" "}
            <input value={designation} onChange={(e) => setDesignation(e.target.value)} className={`${inputCls} w-60`} />, with effect from{" "}
            <input value={data.confirmation_from ?? ""} onChange={(e) => set("confirmation_from", e.target.value)} placeholder="Confirmation date" className={`${inputCls} w-40`} />.
          </p>

          <textarea
            value={data.remarks ?? ""}
            onChange={(e) => set("remarks", e.target.value)}
            rows={5}
            className="mt-4 w-full resize-y rounded border border-dashed border-primary/40 bg-primary/5 px-2 py-1.5 text-[13px] leading-[1.7] outline-none focus:border-primary print:border-0 print:bg-transparent"
          />

          <p className="mt-3">You will continue to report to <input value={data.reporting_to ?? ""} onChange={(e) => set("reporting_to", e.target.value)} className={`${inputCls} w-72`} />, or any person designated by the management.</p>

          <p className="mt-3">We take this opportunity to thank you for your contribution and wish you continued success at Technorizen.</p>

          <div className="mt-10 grid grid-cols-2 gap-8 text-[12.5px]">
            <div>
              <p className="font-semibold">Acknowledged by Employee:</p>
              <div className="mt-6 border-b border-foreground/40" />
              <p className="mt-1">Date: ______________</p>
            </div>
            <div className="text-right">
              <p className="font-semibold">For Technorizen Software Solutions Pvt. Ltd.</p>
              <div className="mt-6 border-b border-foreground/40" />
              <p className="mt-1">Mrs. Sukrati Thakur — HR Manager</p>
            </div>
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