import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import logo from "@/assets/technorizen-logo.png";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Row = { label: string; key: string };

const employeeFields: Row[] = [
  { label: "Employee Name", key: "name" },
  { label: "Employee ID", key: "id" },
  { label: "Designation", key: "designation" },
  { label: "Department", key: "department" },
  { label: "Date of Joining", key: "doj" },
  { label: "Paid Days", key: "paidDays" },
  { label: "Leave Days", key: "leaveDays" },
];

const earningsFields = [
  { label: "Basic Salary", key: "basic" },
  { label: "House Rent Allowance (HRA)", key: "hra" },
  { label: "Conveyance Allowance", key: "conveyance" },
  { label: "Medical Allowance", key: "medical" },
  { label: "Special Allowance", key: "special" },
  { label: "Bonus / Incentive", key: "bonus" },
];

const deductionsFields = [
  { label: "Provident Fund (PF)", key: "pf" },
  { label: "ESIC", key: "esic" },
  { label: "Professional Tax (PT)", key: "pt" },
  { label: "Leave Deduction", key: "leave" },
  { label: "Other Deduction", key: "other" },
];

const numberToWords = (num: number): string => {
  if (!num || isNaN(num)) return "";
  const a = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  const inWords = (n: number): string => {
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 ? " " + a[n % 10] : "");
    if (n < 1000) return a[Math.floor(n / 100)] + " Hundred" + (n % 100 ? " " + inWords(n % 100) : "");
    if (n < 100000) return inWords(Math.floor(n / 1000)) + " Thousand" + (n % 1000 ? " " + inWords(n % 1000) : "");
    if (n < 10000000) return inWords(Math.floor(n / 100000)) + " Lakh" + (n % 100000 ? " " + inWords(n % 100000) : "");
    return inWords(Math.floor(n / 10000000)) + " Crore" + (n % 10000000 ? " " + inWords(n % 10000000) : "");
  };
  return inWords(Math.floor(num)) + " Rupees Only";
};

export type SlipData = {
  id?: string;
  month: string;
  emp: Record<string, string>;
  earnings: Record<string, string>;
  deductions: Record<string, string>;
};

export function SalarySlipForm({ initial }: { initial?: SlipData }) {
  const navigate = useNavigate();
  const [month, setMonth] = useState(initial?.month ?? "");
  const [emp, setEmp] = useState<Record<string, string>>(initial?.emp ?? {});
  const [earnings, setEarnings] = useState<Record<string, string>>(initial?.earnings ?? {});
  const [deductions, setDeductions] = useState<Record<string, string>>(initial?.deductions ?? {});
  const [slipId, setSlipId] = useState<string | undefined>(initial?.id);
  const slipRef = useRef<HTMLElement>(null);
  const [busy, setBusy] = useState<"pdf" | "doc" | "save" | null>(null);

  useEffect(() => {
    if (initial) {
      setMonth(initial.month);
      setEmp(initial.emp);
      setEarnings(initial.earnings);
      setDeductions(initial.deductions);
      setSlipId(initial.id);
    }
  }, [initial]);

  const grossEarnings = useMemo(
    () => earningsFields.reduce((s, f) => s + (parseFloat(earnings[f.key]) || 0), 0),
    [earnings]
  );
  const totalDeductions = useMemo(
    () => deductionsFields.reduce((s, f) => s + (parseFloat(deductions[f.key]) || 0), 0),
    [deductions]
  );
  const netSalary = grossEarnings - totalDeductions;

  const fmt = (n: number) =>
    n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const saveSlip = async () => {
    if (!month.trim()) {
      toast.error("Please enter the month before saving.");
      return;
    }
    setBusy("save");
    try {
      const { data: userRes } = await supabase.auth.getUser();
      const userId = userRes.user?.id ?? null;
      const payload = {
        month,
        employee_name: emp.name ?? "",
        employee_id: emp.id ?? "",
        emp,
        earnings,
        deductions,
      };
      if (slipId) {
        const { error } = await supabase.from("salary_slips").update(payload).eq("id", slipId);
        if (error) throw error;
        toast.success("Slip updated");
      } else {
        const { data, error } = await supabase
          .from("salary_slips")
          .insert({ ...payload, created_by: userId })
          .select("id")
          .single();
        if (error) throw error;
        setSlipId(data.id);
        toast.success("Slip saved");
        navigate({ to: "/slips/$id", params: { id: data.id }, replace: true });
      }
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to save");
    } finally {
      setBusy(null);
    }
  };

  const downloadPDF = async () => {
    if (!slipRef.current) return;
    setBusy("pdf");
    try {
      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import("html2canvas-pro"),
        import("jspdf"),
      ]);
      const canvas = await html2canvas(slipRef.current, { scale: 2, backgroundColor: "#ffffff", useCORS: true });
      const img = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ unit: "pt", format: "a4", orientation: "portrait" });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const margin = 18;
      const maxW = pageW - margin * 2;
      const maxH = pageH - margin * 2;
      const ratio = Math.min(maxW / canvas.width, maxH / canvas.height);
      const w = canvas.width * ratio;
      const h = canvas.height * ratio;
      pdf.addImage(img, "PNG", (pageW - w) / 2, (pageH - h) / 2, w, h);
      pdf.save(`Technorizen-Salary-Slip${month ? "-" + month.replace(/\s+/g, "_") : ""}.pdf`);
    } finally {
      setBusy(null);
    }
  };

  const downloadDOC = async () => {
    if (!slipRef.current) return;
    setBusy("doc");
    try {
      const [{ default: html2canvas }, { Document, ImageRun, Packer, Paragraph }] = await Promise.all([
        import("html2canvas-pro"),
        import("docx"),
      ]);
      const canvas = await html2canvas(slipRef.current, { scale: 2, backgroundColor: "#ffffff", useCORS: true });
      const pngBytes = await new Promise<Uint8Array>((resolve) => {
        canvas.toBlob(async (blob) => {
          const buffer = await blob!.arrayBuffer();
          resolve(new Uint8Array(buffer));
        }, "image/png");
      });
      const scale = Math.min(736 / canvas.width, 1064 / canvas.height);
      const imageWidth = Math.floor(canvas.width * scale);
      const imageHeight = Math.floor(canvas.height * scale);
      const doc = new Document({
        sections: [{
          properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 432, right: 432, bottom: 432, left: 432 } } },
          children: [new Paragraph({ children: [new ImageRun({
            type: "png", data: pngBytes,
            transformation: { width: imageWidth, height: imageHeight },
            altText: { title: "Salary Slip", description: "Salary slip", name: "Salary Slip" },
          })] })],
        }],
      });
      const blob = await Packer.toBlob(doc);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Technorizen-Salary-Slip${month ? "-" + month.replace(/\s+/g, "_") : ""}.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="no-print sticky top-0 z-10 border-b border-border/60 bg-card/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Technorizen" className="h-8 w-auto" />
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
              ← All Slips
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={saveSlip}
              disabled={!!busy}
              className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
            >
              {busy === "save" ? "Saving…" : slipId ? "Update" : "Save"}
            </button>
            <button
              onClick={() => window.print()}
              className="rounded-md border border-border bg-card px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              Print
            </button>
            <button
              onClick={downloadDOC}
              disabled={!!busy}
              className="rounded-md px-4 py-2 text-sm font-semibold text-white transition-transform hover:scale-[1.02] disabled:opacity-60"
              style={{ background: "var(--gradient-accent)" }}
            >
              {busy === "doc" ? "Preparing…" : "DOC"}
            </button>
            <button
              onClick={downloadPDF}
              disabled={!!busy}
              className="rounded-md px-4 py-2 text-sm font-semibold text-white transition-transform hover:scale-[1.02] disabled:opacity-60"
              style={{ background: "var(--gradient-brand)" }}
            >
              {busy === "pdf" ? "Generating…" : "PDF"}
            </button>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-5xl px-4 py-8">
        <article
          ref={slipRef}
          className="print-page mx-auto overflow-hidden rounded-2xl bg-card shadow-[var(--shadow-elegant)]"
          style={{ borderTop: "6px solid transparent", borderImage: "var(--gradient-brand) 1" }}
        >
          <header className="relative px-8 pt-7 pb-0 text-white" style={{ background: "var(--gradient-brand)" }}>
            <div className="absolute inset-y-0 right-0 w-1/3 opacity-30"
              style={{ background: "var(--gradient-accent)", clipPath: "polygon(30% 0, 100% 0, 100% 100%, 0% 100%)" }} />
            <div className="relative flex items-center justify-between gap-6">
              <div className="rounded-lg bg-white/95 px-4 py-2.5 shadow-sm">
                <img src={logo} alt="Technorizen" className="h-12 w-auto" />
              </div>
              <div className="text-right leading-tight">
                <h1 className="text-lg sm:text-xl font-bold tracking-tight">Technorizen Software Solutions Pvt. Ltd.</h1>
                <p className="mt-1 text-[11px] sm:text-xs text-white/85">402, Sapphire House, Sapna Sangeeta Road, Indore (M.P.) 452002</p>
                <p className="text-[11px] sm:text-xs font-medium text-white/95">www.technorizen.com</p>
              </div>
            </div>
            <div className="relative mt-5 -mx-8 flex items-center justify-between gap-4 border-t border-white/20 bg-black/15 px-8 py-3">
              <h2 className="text-base sm:text-lg font-bold uppercase tracking-[0.35em]">Salary Slip</h2>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-white/80">Month:</span>
                <input value={month} onChange={(e) => setMonth(e.target.value)} placeholder="e.g. November 2025"
                  className="w-48 rounded-md border border-white/30 bg-white/10 px-2 py-1 text-sm text-white placeholder:text-white/60 outline-none focus:bg-white/20 print:border-0 print:bg-transparent" />
              </div>
            </div>
          </header>

          <Section title="Employee Details" accent="blue">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
              {employeeFields.map((f) => (
                <Field key={f.key} label={f.label} value={emp[f.key] || ""} onChange={(v) => setEmp({ ...emp, [f.key]: v })} />
              ))}
            </div>
          </Section>

          <Section title="Earnings & Deductions" accent="red">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SlipTable title="Earnings" color="blue" rows={earningsFields} values={earnings}
                onChange={(k, v) => setEarnings({ ...earnings, [k]: v })} totalLabel="Gross Earnings" total={grossEarnings} />
              <SlipTable title="Deductions" color="red" rows={deductionsFields} values={deductions}
                onChange={(k, v) => setDeductions({ ...deductions, [k]: v })} totalLabel="Total Deductions" total={totalDeductions} />
            </div>
          </Section>

          <Section title="Net Salary" accent="blue">
            <div className="overflow-hidden rounded-xl border border-border">
              <SummaryRow label="Gross Salary" value={fmt(grossEarnings)} />
              <SummaryRow label="Less: Total Deductions" value={fmt(totalDeductions)} />
              <div className="flex items-center justify-between px-5 py-4 text-white" style={{ background: "var(--gradient-brand)" }}>
                <span className="text-sm font-semibold uppercase tracking-wider">Net Salary / In-Hand</span>
                <span className="text-2xl font-bold">₹ {fmt(netSalary)}</span>
              </div>
            </div>
            <p className="mt-4 text-sm">
              <span className="font-semibold text-foreground">Net Salary in Words: </span>
              <span className="italic text-muted-foreground">{netSalary > 0 ? numberToWords(netSalary) : "—"}</span>
            </p>
          </Section>

          <section className="px-8 pb-10 pt-2">
            <div className="grid grid-cols-2 gap-8 pt-12">
              {["Employer Signature", "Employee Signature"].map((s) => (
                <div key={s} className="text-center">
                  <div className="mx-auto h-px w-3/4 bg-foreground/40" />
                  <p className="mt-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">{s}</p>
                </div>
              ))}
            </div>
            <p className="mt-10 text-center text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              This is a system-generated salary slip — Technorizen
            </p>
          </section>
        </article>
      </main>
    </div>
  );
}

function Section({ title, children, accent }: { title: string; children: React.ReactNode; accent: "blue" | "red" }) {
  return (
    <section className="px-8 py-6">
      <div className="mb-4 flex items-center gap-3">
        <span className="block h-5 w-1.5 rounded-full"
          style={{ background: accent === "blue" ? "var(--gradient-brand)" : "var(--gradient-accent)" }} />
        <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-foreground">{title}</h3>
        <div className="h-px flex-1 bg-border" />
      </div>
      {children}
    </section>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="flex items-baseline gap-3">
      <span className="w-40 shrink-0 text-sm text-muted-foreground">{label}</span>
      <input value={value} onChange={(e) => onChange(e.target.value)}
        className="flex-1 border-b border-dashed border-border/80 bg-transparent px-1 py-1 text-sm text-foreground outline-none transition-colors focus:border-primary print:border-solid print:border-foreground/40" />
    </label>
  );
}

function SlipTable({ title, color, rows, values, onChange, totalLabel, total }: {
  title: string; color: "blue" | "red"; rows: { label: string; key: string }[];
  values: Record<string, string>; onChange: (k: string, v: string) => void;
  totalLabel: string; total: number;
}) {
  const bg = color === "blue" ? "var(--gradient-brand)" : "var(--gradient-accent)";
  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <div className="flex items-center justify-between px-4 py-2.5 text-white" style={{ background: bg }}>
        <span className="text-xs font-bold uppercase tracking-widest">{title}</span>
        <span className="text-xs font-medium uppercase tracking-widest text-white/80">Amount (₹)</span>
      </div>
      <ul className="divide-y divide-border">
        {rows.map((r) => (
          <li key={r.key} className="flex items-center justify-between gap-3 px-4 py-2">
            <span className="text-sm text-foreground/90">{r.label}</span>
            <input type="number" inputMode="decimal" value={values[r.key] || ""}
              onChange={(e) => onChange(r.key, e.target.value)} placeholder="0.00"
              className="w-28 rounded border border-transparent bg-muted/60 px-2 py-1 text-right text-sm tabular-nums outline-none transition-colors focus:border-primary focus:bg-card print:bg-transparent" />
          </li>
        ))}
      </ul>
      <div className="flex items-center justify-between border-t-2 border-foreground/10 bg-muted/40 px-4 py-2.5">
        <span className="text-sm font-semibold text-foreground">{totalLabel}</span>
        <span className="text-sm font-bold tabular-nums text-foreground">
          {total.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      </div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border bg-card px-5 py-3">
      <span className="text-sm text-foreground/90">{label}</span>
      <span className="text-sm font-semibold tabular-nums text-foreground">₹ {value}</span>
    </div>
  );
}
