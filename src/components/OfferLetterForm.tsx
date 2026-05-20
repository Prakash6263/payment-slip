import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import logo from "@/assets/technorizen-logo.png";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { exportToPDF, exportToDOC } from "@/lib/export-helpers";

export type OfferData = {
  id?: string;
  employee_name: string;
  designation: string;
  letter_date: string;
  joining_date: string;
  data: Record<string, string>;
};

const defaultData: Record<string, string> = {
  reporting_to: "Mr. Shesh Pratap Singh, Director",
  office_address: "402, Sapphire House, Sapna Sangeeta Road, Indore (M.P.) – 452002",
  gross_amount: "15,000",
  gross_words: "Fifteen Thousand Only",
  basic: "6,000",
  hra: "4,500",
  conveyance: "2,000",
  medical: "1,000",
  other: "1,500",
  total: "15,000",
  cl_per_annum: "12",
  increment_range: "",
  bond_years: "2",
  security_cheque: "30,000",
  probation_months: "6",
  notice_days: "3",
  resign_eligible_after: "1",
  resign_notice_months: "2",
  non_compete_months: "6",
};

export function OfferLetterForm({ initial }: { initial?: OfferData }) {
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
    () => `Technorizen-Offer-Letter${name ? "-" + name.replace(/\s+/g, "_") : ""}`,
    [name],
  );

  const save = async () => {
    if (!name.trim()) { toast.error("Please enter the employee name."); return; }
    setBusy("save");
    try {
      const payload = { employee_name: name, designation, letter_date: letterDate, joining_date: joining, data };
      if (letterId) {
        const { error } = await supabase.from("offer_letters").update(payload).eq("id", letterId);
        if (error) throw error;
        toast.success("Offer letter updated");
      } else {
        const { data: row, error } = await supabase.from("offer_letters").insert(payload).select("id").single();
        if (error) throw error;
        setLetterId(row.id);
        toast.success("Offer letter saved");
        navigate({ to: "/offers/$id", params: { id: row.id }, replace: true });
      }
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to save");
    } finally { setBusy(null); }
  };

  const onPDF = async () => {
    if (!ref.current) return;
    setBusy("pdf");
    try { await exportToPDF(ref.current, `${filename}.pdf`); }
    finally { setBusy(null); }
  };
  const onDOC = async () => {
    if (!ref.current) return;
    setBusy("doc");
    try { await exportToDOC(ref.current, `${filename}.docx`); }
    finally { setBusy(null); }
  };

  // Inline editable field — looks like text, edits inline.
  const F = ({ k, w = "w-48", placeholder }: { k: string; w?: string; placeholder?: string }) => (
    <input
      value={data[k] ?? ""}
      onChange={(e) => set(k, e.target.value)}
      placeholder={placeholder ?? "—"}
      className={`${w} inline-block rounded border border-dashed border-primary/40 bg-primary/5 px-1.5 py-0.5 text-[13px] font-medium text-foreground outline-none focus:border-primary focus:bg-primary/10 print:border-0 print:bg-transparent`}
    />
  );

  const Footer = () => (
    <div className="mt-8 border-t border-border pt-3 text-center text-[11px] leading-relaxed text-muted-foreground">
      <p className="font-bold text-foreground">Technorizen Software Solutions Pvt. Ltd.</p>
      <p>Address: 402, Sapphire House, Sapna Sangeeta Road, Indore (M.P.)</p>
      <p>Contact No: 0731-4279840 · Mail: info@technorizen.com · Website: www.technorizen.com</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="no-print sticky top-0 z-10 border-b border-border/60 bg-card/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Technorizen" className="h-8 w-auto" />
            <Link to="/offers" className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-2 text-sm font-medium hover:bg-muted">
              ← All Offer Letters
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={save} disabled={!!busy} className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60">
              {busy === "save" ? "Saving…" : letterId ? "Update" : "Save"}
            </button>
            <button onClick={() => window.print()} className="rounded-md border border-border bg-card px-3 py-2 text-sm font-medium hover:bg-muted">Print</button>
            <button onClick={onDOC} disabled={!!busy} className="rounded-md px-4 py-2 text-sm font-semibold text-white disabled:opacity-60" style={{ background: "var(--gradient-accent)" }}>
              {busy === "doc" ? "Preparing…" : "DOC"}
            </button>
            <button onClick={onPDF} disabled={!!busy} className="rounded-md px-4 py-2 text-sm font-semibold text-white disabled:opacity-60" style={{ background: "var(--gradient-brand)" }}>
              {busy === "pdf" ? "Generating…" : "PDF"}
            </button>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-5xl px-4 py-8">
        <article ref={ref} className="print-page mx-auto rounded-2xl bg-card p-10 text-[13px] leading-[1.6] text-foreground shadow-[var(--shadow-elegant)]"
          style={{ borderTop: "6px solid transparent", borderImage: "var(--gradient-brand) 1" }}>

          <div className="mb-4 flex items-center justify-between gap-6">
            <img src={logo} alt="Technorizen" className="h-16 w-auto" />
            <div className="text-right text-[11px] text-muted-foreground">
              <p className="font-bold text-foreground">Technorizen Software Solutions Pvt. Ltd.</p>
              <p>402, Sapphire House, Sapna Sangeeta Road, Indore (M.P.)</p>
              <p>0731-4279840 · info@technorizen.com</p>
            </div>
          </div>

          <div className="my-4 rounded-md px-3 py-2 text-center text-base font-bold uppercase tracking-[0.25em] text-white"
            style={{ background: "var(--gradient-brand)" }}>
            Letter of Confirmation of Employment
          </div>

          <div className="mb-3 flex items-center justify-between gap-4">
            <p><strong>Name:</strong> <input value={name} onChange={(e)=>setName(e.target.value)} placeholder="Employee name"
              className="w-72 rounded border border-dashed border-primary/40 bg-primary/5 px-2 py-0.5 font-medium outline-none focus:border-primary print:border-0 print:bg-transparent" /></p>
            <p className="text-muted-foreground"><strong>Date:</strong> <input value={letterDate} onChange={(e)=>setLetterDate(e.target.value)} placeholder="DD/MM/YYYY"
              className="w-32 rounded border border-dashed border-primary/40 bg-primary/5 px-2 py-0.5 outline-none focus:border-primary print:border-0 print:bg-transparent" /></p>
          </div>

          <p className="mb-3">Dear <input value={name} onChange={(e)=>setName(e.target.value)} placeholder="—"
            className="w-60 rounded border border-dashed border-primary/40 bg-primary/5 px-2 py-0.5 font-medium outline-none focus:border-primary print:border-0 print:bg-transparent" />,</p>

          <p className="mb-3">
            With reference to your application and the subsequent interview you had with us, we are pleased to issue this Appointment Letter for the position of {" "}
            <input value={designation} onChange={(e)=>setDesignation(e.target.value)} placeholder="Designation"
              className="w-60 rounded border border-dashed border-primary/40 bg-primary/5 px-2 py-0.5 font-medium outline-none focus:border-primary print:border-0 print:bg-transparent" />
            {" "} under the following terms and conditions:
          </p>

          <h3 className="mt-4 font-bold">1. Effective Date of Appointment</h3>
          <p>Your joining date at Technorizen Software Solutions Pvt. Ltd. shall be {" "}
            <input value={joining} onChange={(e)=>setJoining(e.target.value)} placeholder="DD/MM/YYYY"
              className="w-40 rounded border border-dashed border-primary/40 bg-primary/5 px-2 py-0.5 font-medium outline-none focus:border-primary print:border-0 print:bg-transparent" />.
            {" "}You are required to report to the HR Department at <F k="office_address" w="w-[28rem]" />.</p>

          <h3 className="mt-3 font-bold">2. Job Assignment / Reporting</h3>
          <p>You will perform duties as defined in your Job Description. You will report to <F k="reporting_to" w="w-72" />, or any person he may designate.</p>

          <h3 className="mt-3 font-bold">3. Place of Posting</h3>
          <p>Your initial posting shall be at the above address. However, your services may be transferred to any location of Technorizen Software Solutions Pvt. Ltd. across India, as per company requirements.</p>

          <h3 className="mt-3 font-bold">4. Remuneration</h3>
          <p>Your monthly gross salary shall be ₹<F k="gross_amount" w="w-24" />/- (<strong>Rupees <F k="gross_words" w="w-64" /></strong>), with the following break-up:</p>
          <table className="mt-2 w-full border-collapse text-[12.5px]">
            <thead>
              <tr className="bg-muted">
                <th className="border border-border px-2 py-1 text-left">Component</th>
                <th className="border border-border px-2 py-1 text-right">Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Basic Salary","basic"],
                ["House Rent Allowance","hra"],
                ["Conveyance Allowance","conveyance"],
                ["Medical Allowance","medical"],
                ["Special/Other Allowance","other"],
              ].map(([label,k])=>(
                <tr key={k}>
                  <td className="border border-border px-2 py-1">{label}</td>
                  <td className="border border-border px-2 py-1 text-right"><F k={k} w="w-28" /></td>
                </tr>
              ))}
              <tr className="bg-muted/60 font-semibold">
                <td className="border border-border px-2 py-1">Total Earnings</td>
                <td className="border border-border px-2 py-1 text-right"><F k="total" w="w-28" /></td>
              </tr>
            </tbody>
          </table>

          <h3 className="mt-3 font-bold">5. Leave Entitlement</h3>
          <p>You are entitled to <F k="cl_per_annum" w="w-16" /> days of Casual Leave per annum, along with other leaves as per company policies amended from time to time.</p>

          <h3 className="mt-3 font-bold">6. (a) Salary Increment</h3>
          <p>Your performance shall be reviewed after 6 months. Based on your performance in areas such as efficiency, regularity, punctuality, and discipline, your salary may be revised within the range of ₹<F k="increment_range" w="w-32" placeholder="range" />/-. Exceptional performance may lead to earlier increments.</p>

          <p className="mt-2"><strong>(b) Bond Period &amp; Salary Revision Clause:</strong> Any revision in salary during the service bond term shall result in a proportional extension of the bond period beyond the duration originally stated in the offer letter. The extended bond term shall be binding upon the employee in the same manner as the original bond.</p>

          <h3 className="mt-3 font-bold">7. Probation</h3>
          <p>You shall be on probation for a period of <F k="probation_months" w="w-16" /> months from your date of joining. During the probation period, no casual leaves will be applicable. Any leave taken will be treated as Leave Without Pay (LWP) unless approved in writing for emergencies. You will be required to work 6 days a week (Monday to Saturday). Termination during probation may be carried out with a <F k="notice_days" w="w-16" />-day notice or on an immediate basis at the company&apos;s discretion.</p>

          <h3 className="mt-3 font-bold">8. Service Bond</h3>
          <p>A <F k="bond_years" w="w-12" />-year service bond shall be applicable from the date of joining, supported by a security cheque of ₹<F k="security_cheque" w="w-24" />/-. In the event of early resignation or failure to complete the committed service period, the employee shall be liable to pay the bond amount.</p>

          <h3 className="mt-3 font-bold">9. Termination / Resignation</h3>
          <p><strong>9.a) Termination by Company:</strong> The employee has signed a <F k="bond_years" w="w-12" />-year service commitment. If the employee resigns before completing twelve (12) months of continuous service, the Company reserves the right to forfeit the security cheque, deduct the equivalent from final dues, or initiate legal recovery.</p>
          <p className="mt-1"><strong>9.b) Resignation by Employee:</strong> An employee shall be eligible to resign only after completing <F k="resign_eligible_after" w="w-12" /> year of continuous service with the Company. Resignation must be submitted in writing with <F k="resign_notice_months" w="w-12" /> months&apos; prior notice or salary in lieu thereof.</p>

          <h3 className="mt-3 font-bold">10. Additional Company Policies</h3>
          <ul className="ml-5 list-disc space-y-1">
            <li><strong>Provident Fund (PF):</strong> Based on your written declaration, PF will not be deducted; you will receive full in-hand salary.</li>
            <li><strong>Social Media Consent:</strong> You consent to the use of your image and name in company media unless you opt out in writing.</li>
            <li><strong>Leave Policy:</strong> Holidays follow the official company calendar. Other leaves are deducted from CL or treated as LWP.</li>
            <li><strong>Sandwich Leave:</strong> A paid leave taken before/after a weekly off or holiday will include those days as leave.</li>
            <li><strong>Background Verification, Non-Compete ({" "}<F k="non_compete_months" w="w-12" /> months), IP Rights, and Device Security</strong> apply as per company policy.</li>
          </ul>

          <h3 className="mt-3 font-bold">11. Acceptance</h3>
          <p>If you accept the above terms, please sign and return a duplicate copy of this letter within 24 hours. Failure to do so will result in withdrawal of the offer.</p>

          <p className="mt-6">I, <input value={name} onChange={(e)=>setName(e.target.value)}
            className="w-60 rounded border border-dashed border-primary/40 bg-primary/5 px-2 py-0.5 font-medium outline-none focus:border-primary print:border-0 print:bg-transparent" />, have read, understood, and accepted the terms and conditions mentioned above.</p>

          <div className="mt-6 grid grid-cols-2 gap-8 text-[12.5px]">
            <div>
              <p className="font-semibold">Signature of Employee:</p>
              <div className="mt-6 border-b border-foreground/40" />
              <p className="mt-1">Date: ______________</p>
            </div>
            <div className="text-right">
              <p className="font-semibold">For Technorizen Software Solutions Pvt. Ltd.</p>
              <div className="mt-6 border-b border-foreground/40" />
              <p className="mt-1">Shesh Pratap Singh — Co-Founder &amp; Director</p>
              <p>+91-8085004047</p>
            </div>
          </div>

          <Footer />
        </article>
      </main>
    </div>
  );
}