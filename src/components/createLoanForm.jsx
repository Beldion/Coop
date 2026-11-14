import { ArrowRight, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { money, exportToCSV } from "@/lib/utils";

export default function CreateLoanForm({ data, onChange, setData, dates, today, onSubmit, onConfirm, onCancel, pending }) {
  const principal = Number(data.loan_amount) || 0;
  const rate = Number(data.interest_rate) || 0;
  const interest = data.loan_type === "Associate" ? 0 : principal * rate / 100;
  const fee = principal * (Number(data.service_fee) || 0) / 100;
  const total = principal + interest;
  const terms = Math.max(0, Number(data.term_months) || 0);
  const schedule = data.loan_type === "Special" ? data.special_dates || [] : Array.isArray(dates) ? dates : [];
  const updateDate = (index, field, value) => setData((previous) => ({ ...previous, special_dates: previous.special_dates.map((item, i) => i === index ? { ...item, [field]: value } : item) }));
  return <>
    <DialogHeader className="shrink-0 border-b border-slate-100 px-6 py-5 pr-12 dark:border-slate-800">
      <span className="mb-1 inline-flex w-fit items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[9px] font-medium uppercase tracking-wide text-emerald-700 dark:bg-emerald-950"><span className="size-1 rounded-full bg-emerald-500" />Loan configuration &amp; creation</span>
      <DialogTitle className="text-xl font-semibold tracking-tight">Create Loan</DialogTitle>
      <DialogDescription className="text-xs">Fill in loan parameters, terms, and configure the repayment schedule.</DialogDescription>
    </DialogHeader>
    <form id="loan-type-form" onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 space-y-5 overflow-y-auto px-6 py-5">
        <div className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2 [&_input]:h-10 [&_input]:rounded-xl [&_input]:bg-slate-50 [&_input]:text-xs dark:[&_input]:bg-slate-900 [&_label]:text-[10px] [&_label]:font-semibold [&_label]:uppercase [&_label]:tracking-wide [&_label]:text-slate-600 dark:[&_label]:text-slate-400">
          <div className="space-y-2"><Label htmlFor="loan-type">Loan Type</Label><Select value={data.loan_type} onValueChange={(value) => onChange("loan_type", value)}><SelectTrigger id="loan-type" name="loan_type" className="h-10 w-full rounded-xl bg-slate-50 text-xs dark:bg-slate-900"><SelectValue placeholder="Select loan type" /></SelectTrigger><SelectContent><SelectItem value="Member">Member</SelectItem><SelectItem value="Associate">Associate</SelectItem><SelectItem value="Special">Special</SelectItem></SelectContent></Select></div>
          <div className="space-y-2"><Label htmlFor="loan-name">Loan Name</Label><Input id="loan-name" name="loan_name" required placeholder="Enter package name" value={data.loan_name} onChange={(event) => onChange("loan_name", event.target.value)} /></div>
          <div className="space-y-2"><Label htmlFor="loan-amount">Loan Amount (PHP)</Label><Input id="loan-amount" name="loan_amount" type="number" min="0" step="0.01" required placeholder="0.00" value={data.loan_amount} onChange={(event) => onChange("loan_amount", event.target.value)} /><div className="flex flex-wrap gap-1">{[20000, 50000, 100000].map((amount) => <button key={amount} type="button" aria-pressed={principal === amount} onClick={() => onChange("loan_amount", String(amount))} className={`rounded border px-1.5 py-0.5 text-[9px] ${principal === amount ? "border-emerald-300 bg-emerald-100 text-emerald-800" : "border-transparent bg-slate-100 text-slate-500 dark:bg-slate-800"}`}>{money(amount).replace(".00", "")}</button>)}</div></div>
          <div className="space-y-2"><Label htmlFor="loan-interest">Interest (%)</Label><Input id="loan-interest" name="interest_rate" type="number" min="0" step="0.01" required value={data.interest_rate} onChange={(event) => onChange("interest_rate", event.target.value)} /><p className="text-[10px] text-slate-400">Yields {money(interest)} total interest</p></div>
          <div className="space-y-2"><div className="flex items-center justify-between"><Label htmlFor="loan-term">Term (cycles/months)</Label><span className="text-[9px] text-emerald-600">{terms} installments</span></div><Input id="loan-term" name="term_months" type="number" min="1" step="1" required value={data.term_months} onChange={(event) => onChange("term_months", event.target.value)} /></div>
          <div className="space-y-2"><Label htmlFor="loan-fee">Service Fee (%)</Label><Input id="loan-fee" name="service_fee" type="number" min="0" required value={data.service_fee} onChange={(event) => onChange("service_fee", event.target.value)} /><p className="text-[10px] text-slate-400">{money(fee)} upfront deduction from disbursement</p></div>
        </div>
        <section aria-label="Loan computation preview" className="rounded-2xl border border-slate-700 bg-slate-900 p-4 text-white shadow-lg">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3"><div><h3 className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Total payable</h3><p className="mt-1 text-3xl font-bold tracking-tight text-emerald-400 tabular-nums">{money(total)}</p></div><div className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-right"><p className="text-[9px] uppercase text-slate-400">Installment / term</p><p className="text-sm font-semibold tabular-nums">{terms ? money(total / terms) : "—"}</p></div></div>
          <dl className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">{[["Principal", money(principal)], [`Interest (${data.loan_type === "Associate" ? 0 : rate}%)`, money(interest)], ["Net disbursed", money(principal - fee)]].map(([label, value]) => <div key={label} className="rounded-lg border border-slate-800 bg-slate-800/40 px-2 py-2"><dt className="text-[9px] uppercase text-slate-400">{label}</dt><dd className="text-xs font-semibold tabular-nums">{value}</dd></div>)}</dl>
        </section>
        <section><div className="mb-3 flex items-center gap-2"><h3 className="text-sm font-semibold">Payment Schedule</h3><span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-500 dark:bg-slate-800">{schedule.length} Scheduled Terms</span></div><div className="space-y-2">
          {schedule.map((item, index) => <div key={index} className="grid grid-cols-1 gap-3 rounded-xl border border-slate-200/70 bg-slate-50/70 p-3 sm:grid-cols-2 dark:border-slate-800 dark:bg-slate-900/40">
            <div className="space-y-1.5"><Label htmlFor={`date-${index}`} className="text-[10px]">Term {index + 1} - Payment Date</Label>{data.loan_type === "Special" ? <Input id={`date-${index}`} name={`date-${index}`} type="date" min={today} required className="h-9 rounded-lg bg-background text-xs" value={item.value} onChange={(event) => updateDate(index, "value", event.target.value)} /> : <p className="text-xs">{String(item).split(" - ")[0]}</p>}</div>
            <div className="space-y-1.5"><Label htmlFor={`amount-${index}`} className="text-[10px] text-slate-500">Amount (PHP)</Label>{data.loan_type === "Special" ? <Input id={`amount-${index}`} name={`amount-${index}`} type="number" min="0" step="any" required className="h-9 rounded-lg bg-background text-xs" value={item.amount} onChange={(event) => updateDate(index, "amount", event.target.value)} /> : <p className="text-xs font-semibold">{String(item).split(" - ")[1]}</p>}</div>
          </div>)}{!schedule.length && <p className="rounded-xl border border-dashed p-5 text-center text-xs text-muted-foreground">Enter the loan type, amount, and term to preview the schedule.</p>}
        </div></section>
      </div>
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 rounded-b-2xl border-t bg-slate-50 px-6 py-4 dark:bg-slate-900"><Button type="button" variant="ghost" className="h-9 px-0 text-[10px] text-slate-500" disabled={!schedule.length} onClick={() => exportToCSV(schedule.map((item, index) => ({ term: index + 1, date: data.loan_type === "Special" ? item.value : String(item).split(" - ")[0], amount: data.loan_type === "Special" ? item.amount : String(item).split(" - ")[1]?.trim() })), "loan-preview.csv")}><Download className="size-3" />Export Preview</Button><div className="flex gap-2"><Button type="button" variant="outline" className="rounded-xl" onClick={onCancel}>Cancel</Button><Button type="button" className="rounded-xl bg-emerald-600 px-5 text-white hover:bg-emerald-700" disabled={pending} onClick={onConfirm}>{pending ? "Creating…" : "Create Loan"}<ArrowRight className="size-4" /></Button></div></div>
    </form>
  </>;
}
