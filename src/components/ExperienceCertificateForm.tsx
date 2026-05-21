import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import logo from "@/assets/technorizen-logo.png";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { exportToPDF, exportToDOC } from "@/lib/export-helpers";

export type ExperienceData = {
  id?: string;
  employee_name: string;
  designation: string;
  joining_date: string;
  last_working_date: string;
  tenure: string;
  certificate_date: string;
  data: Record<string, string>;
};

const defaultData: Record<string, string> = {
  body:
    "During his tenure of work, the employee remained involved in his work with dedication. We found him pretty active in whatever task we provided him. He is a confident person, professionally sound, and hard-working. He has the motivation to take initiative in tasks, and we are gratified that he has been helpful in the advancement of our organization.\n\nMoreover, I would like to reflect on his conduct during his stay with us. During his service, he has been found sincere, reliable, trustworthy, sociable, pleasant, and open to challenges. He has a genial temperament and can efficiently work in a team. He is leaving his job only on his own decision and for attempting opportunities with a better profile.\n\nWe wish him all the best in his future endeavours.",
  director_name: "Mr. Shesh Pratap Singh",
  director_role: "Co-Founder & Director",
  hr_name: "Mrs. Sukrati Singh Thakur",
  hr_role: "Sr. Human Resource Manager",
};

export function ExperienceCertificateForm({ initial }: { initial?: ExperienceData }) {
  const navigate = useNavigate();
  const [name, setName] = useState(initial?.employee_name ?? "");
  const [designation, setDesignation] = useState(initial?.designation ?? "");
  const [joining, setJoining] = useState(initial?.joining_date ?? "");
  const [last, setLast] = useState(initial?.last_working_date ?? "");
  const [tenure, setTenure] = useState(initial?.tenure ?? "");
  const [certDate, setCertDate] = useState(initial?.certificate_date ?? "");
  const [data, setData] = useState<Record<string, string>>({ ...defaultData, ...(initial?.data ?? {}) });
  const [letterId, setLetterId] = useState<string | undefined>(initial?.id);
  const ref = useRef<HTMLElement>(null);
  const [busy, setBusy] = useState<"pdf" | "doc" | "save" | null>(null);

  useEffect(() => {
    if (!initial) return;
    setName(initial.employee_name);
    setDesignation(initial.designation);
    setJoining(initial.joining_date);
    setLast(initial.last_working_date);
    setTenure(initial.tenure);
    setCertDate(initial.certificate_date);
    setData({ ...defaultData, ...initial.data });
    setLetterId(initial.id);
  }, [initial]);

  const set = (k: string, v: string) => setData((p) => ({ ...p, [k]: v }));
  const filename = useMemo(
    () => `Technorizen-Experience${name ? "-" + name.replace(/\s+/g, "_") : ""}`,
    [name],
  );

  const save = async () => {
    if (!name.trim()) { toast.error("Please enter the employee name."); return; }
    setBusy("save");
    try {
      const payload = {
        employee_name: name, designation, joining_date: joining,
        last_working_date: last, tenure, certificate_date: certDate, data,
      };
      if (letterId) {
        const { error } = await supabase.from("experience_certificates").update(payload).eq("id", letterId);
        if (error) throw error;
        toast.success("Experience certificate updated");
      } else {
        const { data: row, error } = await supabase.from("experience_certificates").insert(payload).select("id").single();
        if (error) throw error;
        setLetterId(row.id);
        toast.success("Experience certificate saved");
        navigate({ to: "/experience/$id", params: { id: row.id }, replace: true });
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
            <Link to="/experience" className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-2 text-sm font-medium hover:bg-muted">← All Experience Certificates</Link>
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
            Experience Certificate
          </div>

          <p className="mb-3"><strong>Date:</strong> <input value={certDate} onChange={(e) => setCertDate(e.target.value)} placeholder="DD/MM/YYYY" className={`${inputCls} w-32`} /></p>

          <p className="text-center font-semibold underline">TO WHOM-SO-EVER IT MAY CONCERN</p>

          <p className="mt-4">
            It is our pleasure to write on behalf of <strong><input value={name} onChange={(e) => setName(e.target.value)} placeholder="Employee name" className={`${inputCls} w-72`} /></strong>, who has worked with Technorizen Software Solutions Pvt. Ltd. in the capacity of <strong><input value={designation} onChange={(e) => setDesignation(e.target.value)} placeholder="Designation" className={`${inputCls} w-60`} /></strong> for <strong><input value={tenure} onChange={(e) => setTenure(e.target.value)} placeholder="e.g. 5 years 5 months" className={`${inputCls} w-56`} /></strong> (from <input value={joining} onChange={(e) => setJoining(e.target.value)} placeholder="Joining date" className={`${inputCls} w-36`} /> to <input value={last} onChange={(e) => setLast(e.target.value)} placeholder="Last working date" className={`${inputCls} w-36`} />).
          </p>

          <textarea
            value={data.body ?? ""}
            onChange={(e) => set("body", e.target.value)}
            rows={10}
            className="mt-4 w-full resize-y rounded border border-dashed border-primary/40 bg-primary/5 px-2 py-1.5 text-[13px] leading-[1.7] outline-none focus:border-primary print:border-0 print:bg-transparent"
          />

          <p className="mt-6 font-semibold">With Warm Regards,</p>
          <p className="font-semibold">For Technorizen Software Solutions Pvt. Ltd.</p>

          <div className="mt-10 grid grid-cols-2 gap-8 text-[12.5px]">
            <div>
              <div className="border-b border-foreground/40" />
              <p className="mt-1"><input value={data.director_name ?? ""} onChange={(e) => set("director_name", e.target.value)} className={`${inputCls} w-60`} /></p>
              <p className="font-semibold"><input value={data.director_role ?? ""} onChange={(e) => set("director_role", e.target.value)} className={`${inputCls} w-60`} /></p>
            </div>
            <div className="text-right">
              <div className="border-b border-foreground/40" />
              <p className="mt-1"><input value={data.hr_name ?? ""} onChange={(e) => set("hr_name", e.target.value)} className={`${inputCls} w-60`} /></p>
              <p className="font-semibold"><input value={data.hr_role ?? ""} onChange={(e) => set("hr_role", e.target.value)} className={`${inputCls} w-60`} /></p>
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