import { Download, UserRound } from "lucide-react";
import { DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from "@/components/ui/table";
import { money, exportToCSV } from "@/lib/utils";

export default function LoanPackageDetails({ loan, generatedDates, onClose }) {
  if (!loan) return null;
  const principal = Number(loan.loan_amount) || 0;
  const rate = Number(loan.interest_rate) || 0;
  const feeRate = Number(loan.service_fee) || 0;
  const fee = principal * feeRate / 100;
  const special = loan.special_dates || [];
  const dates = Array.isArray(generatedDates) ? generatedDates : [];
  const interest = loan.loan_type === "Member" ? principal * rate / 100 : 0;
  const total = special.length ? special.reduce((sum, row) => sum + Number(row.amount || 0), 0) : principal + interest;
  const count = special.length || dates.length;
  let cumulative = 0;
  const rows = (special.length ? special : dates).map((item, index) => {
    const due = special.length ? Number(item.amount || 0) : (Math.round(total * 100 * (index + 1) / count) - Math.round(total * 100 * index / count)) / 100;
    cumulative += due;
    const principalPart = special.length ? null : (Math.round(principal * 100 * (index + 1) / count) - Math.round(principal * 100 * index / count)) / 100;
    return { number: index + 1, date: special.length ? item.term_date : String(item).split(" - ")[0], principal: principalPart, interest: principalPart === null ? null : due - principalPart, due, balance: Math.max(0, total - cumulative) };
  });
  return <>
    <DialogHeader className="border-b border-slate-100 px-5 py-6 pr-12 sm:px-8 dark:border-slate-800">
      <div className="flex flex-wrap items-center gap-2 text-[10px]"><span className="font-semibold uppercase tracking-wide text-emerald-600">Loan package details</span><span className="size-1.5 rounded-full bg-emerald-500" /><span className="text-slate-400">Cooperative loan terms</span></div>
      <div className="flex flex-wrap items-center gap-3"><DialogTitle className="text-2xl font-semibold tracking-tight sm:text-3xl">{loan.loan_name}</DialogTitle><span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-100 px-3 py-1 text-xs text-emerald-800"><UserRound className="size-3" />{loan.loan_type}</span>{loan.archive === false && <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">Active Product</span>}</div>
      <DialogDescription className="text-xs sm:text-sm">Review the package terms, deductions, and estimated repayment schedule.</DialogDescription>
    </DialogHeader>

    <div className="space-y-5 bg-slate-50/60 p-5 sm:p-8 dark:bg-slate-950/20">
      <section className="flex flex-col justify-between gap-5 rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50/30 p-5 shadow-sm sm:flex-row sm:items-center dark:border-emerald-900 dark:from-emerald-950/40 dark:to-teal-950/20">
        <div><h3 className="text-[11px] font-semibold uppercase tracking-wide text-emerald-800 dark:text-emerald-400">Loan principal amount</h3><p className="mt-1 text-3xl font-bold tracking-tight tabular-nums sm:text-4xl">{money(principal)}</p><p className="mt-2 text-xs text-slate-500">Principal before interest and service fees.</p></div>
        <div className="rounded-xl border border-emerald-100 bg-background/90 p-4 sm:text-right dark:border-emerald-900"><p className="text-[10px] font-semibold uppercase text-slate-400">Estimated net disbursement</p><p className="mt-1 text-xl font-bold text-emerald-700 tabular-nums dark:text-emerald-400">{money(principal - fee)}</p><p className="mt-1 text-[10px] text-slate-400">After {money(fee)} upfront fee ({feeRate}%)</p></div>
      </section>

      <section className="rounded-2xl border border-slate-200/80 bg-card p-5 shadow-sm dark:border-slate-800"><h3 className="mb-4 flex items-center gap-3 text-[11px] font-semibold uppercase text-slate-400">Package parameters &amp; rates<span className="h-px flex-1 bg-slate-100 dark:bg-slate-800" /></h3>
        <dl className="grid grid-cols-2 gap-5 lg:grid-cols-4 lg:divide-x lg:divide-slate-100 dark:lg:divide-slate-800 [&>div]:min-w-0 lg:[&>div:not(:first-child)]:pl-4">
          <div><dt className="text-xs text-slate-500">Interest rate</dt><dd className="mt-2 text-2xl font-semibold">{rate}%</dd><p className="mt-1 text-[10px] text-slate-400">{special.length ? "Custom payment schedule" : `Total added: ${money(interest)}`}</p></div>
          <div><dt className="text-xs text-slate-500">Service fee</dt><dd className="mt-2 text-2xl font-semibold">{feeRate}% <span className="text-xs font-normal text-slate-500">Upfront</span></dd><p className="mt-1 text-[10px] text-slate-400">Deducted on release</p></div>
          <div><dt className="text-xs text-slate-500">Repayment term</dt><dd className="mt-2 text-2xl font-semibold">{loan.term_months}</dd><p className="mt-1 text-[10px] text-slate-400">{count} scheduled installments</p></div>
          <div><dt className="text-xs text-slate-500">Installment due</dt><dd className="mt-2 break-words text-xl font-semibold text-emerald-700 dark:text-emerald-400">{special.length ? "Custom" : count ? money(rows[0].due) : "N/A"}</dd><p className="mt-1 text-[10px] text-slate-400">{special.length ? "See amounts below" : "Based on the current schedule"}</p></div>
        </dl>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-card shadow-sm dark:border-slate-800"><div className="flex flex-wrap items-center justify-between gap-3 p-5"><div><div className="flex flex-wrap items-center gap-2"><h3 className="text-sm font-semibold">Sample Payment Computations &amp; Schedule</h3><span className="rounded-full border border-emerald-100 bg-emerald-50 px-2 py-0.5 text-[10px] text-emerald-700 dark:bg-emerald-950">{count} Scheduled Cutoffs</span></div><p className="mt-1 text-xs text-slate-400">{special.length ? "Custom payment dates and amounts for this package." : "Estimated breakdown using the package’s current repayment rules."}</p></div><p className="rounded-lg border bg-muted/30 px-3 py-2 text-xs text-slate-500">Total contract: <strong className="text-foreground">{money(total)}</strong></p></div>
        <div className="max-h-80 overflow-auto"><Table className="min-w-[680px] text-xs [&_th]:px-4 [&_th]:text-[9px] [&_th]:uppercase [&_th]:tracking-wide [&_th]:text-slate-500 [&_td]:px-4 [&_td]:py-3 [&_tr]:border-slate-100 dark:[&_tr]:border-slate-800"><TableHeader className="sticky top-0 bg-slate-50 dark:bg-slate-900"><TableRow><TableHead>#</TableHead><TableHead>Payment due date</TableHead><TableHead className="text-right">Principal portion</TableHead><TableHead className="text-right">Interest</TableHead><TableHead className="text-right">Cutoff due</TableHead><TableHead className="text-right">Est. balance</TableHead></TableRow></TableHeader><TableBody>{rows.map((row) => <TableRow key={row.number}><TableCell className="text-slate-400">{String(row.number).padStart(2, "0")}</TableCell><TableCell className="font-medium">{row.date}</TableCell><TableCell className="text-right text-slate-500 tabular-nums">{row.principal === null ? "—" : money(row.principal)}</TableCell><TableCell className="text-right text-slate-500 tabular-nums">{row.interest === null ? "—" : money(row.interest)}</TableCell><TableCell className="text-right font-semibold text-emerald-700 tabular-nums dark:text-emerald-400">{money(row.due)}</TableCell><TableCell className="text-right text-slate-500 tabular-nums">{money(row.balance)}</TableCell></TableRow>)}{!count && <TableRow><TableCell colSpan={6} className="h-24 text-center text-muted-foreground">No payment schedule available.</TableCell></TableRow>}</TableBody></Table></div>
      </section>
    </div>
    <DialogFooter className="sticky bottom-0 m-0 flex-row justify-between rounded-b-2xl bg-background px-5 py-4 sm:justify-between sm:px-8"><Button variant="outline" className="rounded-lg text-xs" disabled={!count} onClick={() => exportToCSV(rows, "loan-payment-schedule.csv")}><Download className="size-3.5" />Export Schedule</Button><Button onClick={onClose} className="rounded-lg bg-emerald-600 px-6 text-xs text-white hover:bg-emerald-700">Close Details</Button></DialogFooter>
  </>;
}
