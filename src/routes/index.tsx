import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import logo from "@/assets/technorizen-logo.png";

export const Route = createFileRoute("/")({
  component: SalarySlipPage,
  head: () => ({
    meta: [
      { title: "Salary Slip — Technorizen" },
      { name: "description", content: "Professional salary slip generator for Technorizen employees." },
    ],
  }),
});

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

function SalarySlipPage() {
  const [month, setMonth] = useState("");
  const [emp, setEmp] = useState<Record<string, string>>({});
  const [earnings, setEarnings] = useState<Record<string, string>>({});
  const [deductions, setDeductions] = useState<Record<string, string>>({});

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

  return (
    <div className="min-h-screen bg-background">
      {/* Top toolbar */}
      <div className="no-print sticky top-0 z-10 border-b border-border/60 bg-card/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Technorizen" className="h-8 w-auto" />
            <span className="text-sm text-muted-foreground hidden sm:inline">
              Salary Slip Generator
            </span>
          </div>
          <button
            onClick={() => window.print()}
            className="rounded-md px-4 py-2 text-sm font-medium text-primary-foreground shadow-[var(--shadow-soft)] transition-transform hover:scale-[1.02]"
            style={{ background: "var(--gradient-brand)" }}
          >
            Print / Save PDF
          </button>
        </div>
      </div>

      <main className="mx-auto max-w-5xl px-4 py-8">
        <article
          className="print-page mx-auto overflow-hidden rounded-2xl bg-card shadow-[var(--shadow-elegant)]"
          style={{ borderTop: "6px solid transparent", borderImage: "var(--gradient-brand) 1" }}
        >
          {/* Header */}
          <header
            className="relative px-8 py-7 text-white"
            style={{ background: "var(--gradient-brand)" }}
          >
            <div
              className="absolute inset-y-0 right-0 w-1/3 opacity-30"
              style={{ background: "var(--gradient-accent)", clipPath: "polygon(30% 0, 100% 0, 100% 100%, 0% 100%)" }}
            />
            <div className="relative flex items-center justify-between gap-6">
              <div className="rounded-lg bg-white/95 px-4 py-2.5 shadow-sm">
                <img src={logo} alt="Technorizen" className="h-12 w-auto" />
              </div>
              <div className="text-right">
                <h2 className="text-xl font-bold uppercase tracking-widest">Salary Slip</h2>
                <div className="mt-2 flex items-center justify-end gap-2 text-sm">
                  <span className="text-white/80">Month:</span>
                  <input
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                    placeholder="e.g. November 2025"
                    className="w-44 rounded-md border border-white/30 bg-white/10 px-2 py-1 text-sm text-white placeholder:text-white/60 outline-none focus:bg-white/20 print:border-0 print:bg-transparent"
                  />
                </div>
              </div>
            </div>
          </header>

          {/* Employee Details */}
          <Section title="Employee Details" accent="blue">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
              {employeeFields.map((f) => (
                <Field
                  key={f.key}
                  label={f.label}
                  value={emp[f.key] || ""}
                  onChange={(v) => setEmp({ ...emp, [f.key]: v })}
                />
              ))}
            </div>
          </Section>

          {/* Earnings & Deductions */}
          <Section title="Earnings & Deductions" accent="red">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Table
                title="Earnings"
                color="blue"
                rows={earningsFields}
                values={earnings}
                onChange={(k, v) => setEarnings({ ...earnings, [k]: v })}
                totalLabel="Gross Earnings"
                total={grossEarnings}
              />
              <Table
                title="Deductions"
                color="red"
                rows={deductionsFields}
                values={deductions}
                onChange={(k, v) => setDeductions({ ...deductions, [k]: v })}
                totalLabel="Total Deductions"
                total={totalDeductions}
              />
            </div>
          </Section>

          {/* Net Salary */}
          <Section title="Net Salary" accent="blue">
            <div className="overflow-hidden rounded-xl border border-border">
              <SummaryRow label="Gross Salary" value={fmt(grossEarnings)} />
              <SummaryRow label="Less: Total Deductions" value={fmt(totalDeductions)} />
              <div
                className="flex items-center justify-between px-5 py-4 text-white"
                style={{ background: "var(--gradient-brand)" }}
              >
                <span className="text-sm font-semibold uppercase tracking-wider">
                  Net Salary / In-Hand
                </span>
                <span className="text-2xl font-bold">₹ {fmt(netSalary)}</span>
              </div>
            </div>
            <p className="mt-4 text-sm">
              <span className="font-semibold text-foreground">Net Salary in Words: </span>
              <span className="italic text-muted-foreground">
                {netSalary > 0 ? numberToWords(netSalary) : "—"}
              </span>
            </p>
          </Section>

          {/* Signatures */}
          <section className="px-8 pb-10 pt-2">
            <div className="grid grid-cols-2 gap-8 pt-12">
              {["Employer Signature", "Employee Signature"].map((s) => (
                <div key={s} className="text-center">
                  <div className="mx-auto h-px w-3/4 bg-foreground/40" />
                  <p className="mt-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {s}
                  </p>
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

function Section({
  title,
  children,
  accent,
}: {
  title: string;
  children: React.ReactNode;
  accent: "blue" | "red";
}) {
  return (
    <section className="px-8 py-6">
      <div className="mb-4 flex items-center gap-3">
        <span
          className="block h-5 w-1.5 rounded-full"
          style={{
            background:
              accent === "blue" ? "var(--gradient-brand)" : "var(--gradient-accent)",
          }}
        />
        <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-foreground">
          {title}
        </h3>
        <div className="h-px flex-1 bg-border" />
      </div>
      {children}
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="flex items-baseline gap-3">
      <span className="w-40 shrink-0 text-sm text-muted-foreground">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 border-b border-dashed border-border/80 bg-transparent px-1 py-1 text-sm text-foreground outline-none transition-colors focus:border-primary print:border-solid print:border-foreground/40"
      />
    </label>
  );
}

function Table({
  title,
  color,
  rows,
  values,
  onChange,
  totalLabel,
  total,
}: {
  title: string;
  color: "blue" | "red";
  rows: { label: string; key: string }[];
  values: Record<string, string>;
  onChange: (k: string, v: string) => void;
  totalLabel: string;
  total: number;
}) {
  const bg = color === "blue" ? "var(--gradient-brand)" : "var(--gradient-accent)";
  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <div
        className="flex items-center justify-between px-4 py-2.5 text-white"
        style={{ background: bg }}
      >
        <span className="text-xs font-bold uppercase tracking-widest">{title}</span>
        <span className="text-xs font-medium uppercase tracking-widest text-white/80">
          Amount (₹)
        </span>
      </div>
      <ul className="divide-y divide-border">
        {rows.map((r) => (
          <li key={r.key} className="flex items-center justify-between gap-3 px-4 py-2">
            <span className="text-sm text-foreground/90">{r.label}</span>
            <input
              type="number"
              inputMode="decimal"
              value={values[r.key] || ""}
              onChange={(e) => onChange(r.key, e.target.value)}
              placeholder="0.00"
              className="w-28 rounded border border-transparent bg-muted/60 px-2 py-1 text-right text-sm tabular-nums outline-none transition-colors focus:border-primary focus:bg-card print:bg-transparent"
            />
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
