import { createElement } from "react";
import {
  Banknote,
  Wallet,
  CreditCard,
  Receipt,
  ArrowRight,
  FileDown,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { money } from "@/lib/utils";

function Row({ label, value, accent = "" }) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span
        className={`shrink-0 font-mono font-semibold tabular-nums ${accent}`}
      >
        {value}
      </span>
    </div>
  );
}

export default function SummaryView({
  open,
  onOpenChange,
  loan,
  data,
  dates,
  onBack,
  onConfirm,
  pending,
}) {
  const schedule = Array.isArray(dates) ? dates : [];
  const member = loan?.loan_type?.loan_type === "Member";
  const associate = loan?.loan_type?.loan_type === "Associate";
  const panel = "flex flex-col rounded-xl border bg-background p-4 shadow-sm";
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="restructure-summary flex max-h-[94dvh] flex-col gap-0 overflow-hidden rounded-2xl p-0 md:max-w-5xl">
        <div className="h-1 shrink-0 bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600" />
        <DialogHeader className="shrink-0 gap-2 border-b px-5 py-5 pr-12">
          <div className="flex flex-wrap items-center gap-2 text-[12px]">
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 font-medium uppercase text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300">
              • Loan restructuring • Re-amortization proposal
            </span>
            <span className="break-all font-mono text-slate-400">
              Note Ref: {loan?.id ?? "—"}
            </span>
            <span className="rounded bg-muted px-2 py-1 text-muted-foreground">
              Member:{" "}
              {[
                loan?.member?.first_name,
                loan?.member?.middle_name,
                loan?.member?.last_name,
              ]
                .filter(Boolean)
                .join(" ") || "—"}
            </span>
          </div>
          <DialogTitle className="text-xl font-semibold tracking-tight">
            Loan Restructuring Summary &amp; New Schedule
          </DialogTitle>
          <DialogDescription className="max-w-3xl text-xs leading-relaxed">
            Review the updated capital terms, cash-out offset adjustments,
            deduction breakdowns, and proposed semi-monthly amortization
            schedule.
          </DialogDescription>
        </DialogHeader>
        <div className="summary-scroll min-h-0 space-y-5 overflow-y-auto bg-slate-50/60 p-5 dark:bg-slate-950/30">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              [
                Banknote,
                "Approved loan",
                data.approvedLoan,
                "text-slate-700 dark:text-slate-200",
                "border-slate-200 dark:border-slate-700",
              ],
              [
                Wallet,
                "Net cash released",
                data.netCash,
                "text-emerald-600 dark:text-emerald-400",
                "border-emerald-200 dark:border-emerald-900",
              ],
              [
                CreditCard,
                "Semi-monthly payment",
                data.monthlyPayment,
                "text-indigo-600 dark:text-indigo-400",
                "border-indigo-200 dark:border-indigo-900",
              ],
              [
                Receipt,
                "Total to repay",
                data.totalRepay,
                "text-amber-600 dark:text-amber-400",
                "border-amber-200 dark:border-amber-900",
              ],
            ].map(([Icon, title, value, color, border]) => (
              <div
                key={title}
                className={`flex items-center gap-3 rounded-xl border bg-background p-3.5 shadow-sm ${border} ${color}`}
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-current/10 bg-current/5">
                  {createElement(Icon, { className: "size-5" })}
                </div>
                <div className="min-w-0">
                  <p className="text-[12px] font-semibold uppercase tracking-wide">
                    {title}
                  </p>
                  <p className="mt-1 break-words font-mono text-2xl font-semibold tabular-nums">
                    {money(value ?? 0)}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <section className={panel}>
              <div className="mb-3 border-b pb-3">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-md font-semibold">
                    <span className="mr-2 text-emerald-500">●</span>Cash Out
                    Deductions
                  </h3>
                  <span className="rounded bg-muted px-2 py-0.5 text-[12px] text-muted-foreground">
                    Disbursement Offset
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  These deductions reduce the amount released to you.
                </p>
              </div>
              <div className="space-y-3">
                <Row
                  label="Approved Loan Amount"
                  value={money(data.approvedLoan)}
                />
                <div className="rounded-lg border border-rose-100 bg-rose-50/60 p-2.5 dark:border-rose-900 dark:bg-rose-950/30">
                  <Row
                    label="Old Loan Settlement (Principal Rollover)"
                    value={`− ${money(data.oldLoan)}`}
                    accent="text-rose-600"
                  />
                </div>
                {associate && (
                  <>
                    <Row
                      label="Interest Charge"
                      value={`− ${money(data.interest)}`}
                      accent="text-rose-600"
                    />
                    <Row
                      label="Documentation & Service Fee"
                      value={`− ${money(data.serviceFee)}`}
                      accent="text-rose-600"
                    />
                  </>
                )}
              </div>
              <div className="mt-auto pt-6">
                <div className="border-t pt-4">
                  <Row
                    label="Net Cash Released"
                    value={money(data.netCash)}
                    accent="text-lg text-emerald-600"
                  />
                  <p className="mt-1 text-sm text-slate-400">
                    Amount available after cash-out deductions.
                  </p>
                </div>
              </div>
            </section>
            <section className={panel}>
              <div className="mb-3 border-b pb-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-md font-semibold">
                    <span className="mr-2 text-indigo-500">●</span>Amount to
                    Repay
                  </h3>
                  <span className="rounded bg-indigo-50 px-2 py-0.5 text-[12px] text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300">
                    {data.term} Terms
                  </span>
                </div>
                <p className="mt-1 text- text-muted-foreground">
                  Capital and charges used in the repayment calculation.
                </p>
              </div>
              <div className="space-y-3">
                <Row label="Principal Amount" value={money(data.principal)} />
                {member && (
                  <>
                    <Row
                      label="Old Loan Settlement Offset"
                      value={`− ${money(data.oldLoan)}`}
                    />
                    <Row
                      label="Restructured Interest Charge"
                      value={`+ ${money(data.interest)}`}
                    />
                    <Row
                      label="Documentation & Service Fee"
                      value={`+ ${money(data.serviceFee)}`}
                    />
                  </>
                )}
              </div>
              <div className="mt-5 border-t pt-4">
                <Row
                  label="Total Amount to Repay"
                  value={money(data.totalRepay)}
                  accent="text-lg"
                />
              </div>
              <div className="mt-2 rounded-lg border border-indigo-100 bg-indigo-50/70 p-2.5 dark:border-indigo-900 dark:bg-indigo-950/40">
                <Row
                  label={`Semi-Monthly Payment (${data.term} Cutoffs)`}
                  value={`${money(data.monthlyPayment)} / cutoff`}
                  accent="text-indigo-600 dark:text-indigo-400"
                />
              </div>
            </section>
          </div>
          <section className="overflow-hidden rounded-xl border bg-background">
            <div className="border-b bg-slate-50/70 p-4 dark:bg-slate-900/60">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg font-semibold">
                  New Restructured Payment Schedule
                </h3>
                <span className="rounded-full bg-emerald-100 px-2 py-1 text-[11px] font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                  {schedule.length} Semi-Monthly Cycles
                </span>
              </div>
              <p className="mt-1 text-md text-muted-foreground">
                Proposed amortization calendar with revised due dates and
                installment obligations.
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[540px] text-left text-sm">
                <thead className="border-b bg-slate-50 text-sm uppercase tracking-wide text-slate-500 dark:bg-slate-900">
                  <tr>
                    <th className="px-4 py-3">#</th>
                    <th className="px-4 py-3">Due date</th>
                    <th className="px-4 py-3">Installment due</th>
                    <th className="px-4 py-3 text-right">Cutoff status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {schedule.map((entry, index) => {
                    const [date, amount] = String(entry).split(" - ");
                    return (
                      <tr key={index}>
                        <td className="px-4 py-3 font-mono text-slate-400">
                          {String(index + 1).padStart(2, "0")}
                        </td>
                        <td className="px-4 py-3">{date}</td>
                        <td className="px-4 py-3 font-mono font-semibold tabular-nums">
                          {amount?.trim() || "—"}
                        </td>
                        <td className="px-4 py-2 text-right">
                          <span className="inline-block rounded border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300">
                            Scheduled Term
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {!schedule.length && (
                    <tr>
                      <td
                        colSpan={4}
                        className="p-8 text-center text-muted-foreground"
                      >
                        No proposed schedule available.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
        <div className="summary-actions flex shrink-0 flex-wrap items-center justify-between gap-3 border-t bg-background px-5 py-3">
          <div className="ml-auto flex flex-wrap gap-2">
            <Button
              variant="outline"
              className="h-9 rounded-xl text-sm"
              onClick={() => {
                onOpenChange(false);
                onBack?.();
              }}
            >
              Back to Review
            </Button>
            <Button
              disabled={!loan || pending}
              className="h-9 rounded-xl bg-emerald-600 text-sm text-white hover:bg-emerald-700"
              onClick={onConfirm}
            >
              Confirm &amp; Apply Restructuring
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </div>
        <style>{`@media print { body:has(.restructure-summary) * { visibility: hidden; } body:has(.restructure-summary) .restructure-summary, body:has(.restructure-summary) .restructure-summary * { visibility: visible; } .restructure-summary { position: absolute !important; inset: 0 !important; transform: none !important; width: 100% !important; max-width: none !important; max-height: none !important; overflow: visible !important; } .restructure-summary .summary-scroll { overflow: visible !important; } .restructure-summary .summary-actions, .restructure-summary [data-slot="dialog-close"] { display: none !important; } }`}</style>
      </DialogContent>
    </Dialog>
  );
}
