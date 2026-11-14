import Decimal from "decimal.js";
import { format, isValid, parseISO } from "date-fns";
import { ArrowRight, Download, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { money, exportToCSV } from "@/lib/utils";

function displayDate(value, pattern = "MMM dd, yyyy") {
  if (!value) return "—";
  const date = parseISO(String(value));
  return isValid(date) ? format(date, pattern) : "—";
}

export default function ScheduleReview({
  open,
  onOpenChange,
  loan,
  onContinue,
}) {
  const payments = loan?.loan_payments ?? [];
  const total = payments.reduce(
    (sum, item) => sum.plus(item.amount || 0),
    new Decimal(0),
  );
  const paid = payments.reduce(
    (sum, item) => sum.plus(item.amount_paid || 0),
    new Decimal(0),
  );
  const settled = payments.filter((item) =>
    new Decimal(item.amount_paid || 0).gte(item.amount || 0),
  ).length;
  const today = format(new Date(), "yyyy-MM-dd");
  const rows = payments.map((payment, index) => {
    const isSettled = new Decimal(payment.amount_paid || 0).gte(
      payment.amount || 0,
    );
    const due =
      payment.payment_date &&
      String(payment.payment_date).slice(0, 10) <= today;
    return {
      cutoff: index + 1,
      amount: payment.amount || 0,
      amount_paid: payment.amount_paid || 0,
      payment_method: payment.payment_method || "—",
      reference: payment.reference || "—",
      paid_date: displayDate(payment.paid_date, "yyyy-MM-dd"),
      due_date: displayDate(payment.payment_date),
      status: isSettled
        ? "Settled"
        : due
          ? "Unpaid / Due"
          : "Restructure Candidate",
    };
  });
  const label =
    "text-sm font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[92dvh] flex-col gap-0 overflow-hidden rounded-2xl p-0 md:max-w-5xl">
        <DialogHeader className="shrink-0 gap-2 border-b border-slate-100 px-5 py-5 pr-12 dark:border-slate-800">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 font-medium uppercase text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              Loan restructuring • Schedule review
            </span>
            <span className="break-all text-slate-400">
              • Note Ref: {loan?.id ?? "—"}
            </span>
          </div>
          <DialogTitle className="text-lg font-semibold tracking-tight">
            Payment Schedule &amp; Repayment History
          </DialogTitle>
          <DialogDescription className="text-xs leading-relaxed">
            Review posted remittances, historical reference logs, and remaining
            unpaid amortization cutoffs before finalizing loan restructuring.
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 overflow-y-auto">
          <div className="grid grid-cols-2 gap-y-5 border-b border-slate-200/70 bg-slate-50/80 px-5 py-4 md:grid-cols-4 dark:border-slate-800 dark:bg-slate-900/60">
            {[
              [
                "Total obligation",
                money(total.toNumber()),
                `${payments.length} scheduled cutoffs`,
                "text-slate-900 dark:text-slate-100",
              ],
              [
                "Total settled to date",
                money(paid.toNumber()),
                `${settled} of ${payments.length} cutoffs settled`,
                "text-emerald-600 dark:text-emerald-400",
              ],
              [
                "Remaining unpaid",
                money(Decimal.max(total.minus(paid), 0).toNumber()),
                `${payments.length - settled} installments with a balance`,
                "text-amber-600 dark:text-amber-400",
              ],
            ].map(([title, value, detail, color], index) => (
              <div
                key={title}
                className={`min-w-0 pr-3 ${index ? "border-l border-slate-200/70 pl-3 dark:border-slate-800" : ""}`}
              >
                <p className={label}>{title}</p>
                <p
                  className={`mt-1.5 break-words font-mono text-base font-semibold tabular-nums ${color}`}
                >
                  {value}
                </p>
                <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
                  {detail}
                </p>
              </div>
            ))}
            <div className="border-l border-slate-200/70 pl-3 dark:border-slate-800">
              <p className={label}>Target action</p>
              <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium">
                <span className="size-1.5 shrink-0 rounded-full bg-indigo-500" />
                Pending Re-amortization
              </p>
              <p className="mt-2 text-sm text-slate-500">
                Review remaining cutoffs
              </p>
            </div>
          </div>

          <div className="space-y-3 p-5 pt-3">
            <div className="overflow-x-auto rounded-xl border border-slate-200/80 dark:border-slate-800">
              <table className="w-full min-w-[850px] text-left text-xs">
                <thead className="border-b border-slate-200/80 bg-slate-50 dark:border-slate-800 dark:bg-slate-900">
                  <tr>
                    {[
                      "#",
                      "Scheduled amount",
                      "Amount paid",
                      "Payment method",
                      "Payment reference",
                      "Paid date",
                      "Due date",
                      "Status",
                    ].map((heading) => (
                      <th
                        key={heading}
                        className="whitespace-nowrap px-3 py-3 text-sm font-semibold uppercase tracking-wide text-slate-500"
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y text-sm divide-slate-100 dark:divide-slate-800">
                  {rows.map((row) => {
                    const settledRow = row.status === "Settled";
                    const dueRow = row.status === "Unpaid / Due";
                    const tone = settledRow
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                      : dueRow
                        ? "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300"
                        : "border-indigo-200 bg-indigo-50 text-indigo-600 dark:border-indigo-800 dark:bg-indigo-950 dark:text-indigo-300";
                    return (
                      <tr
                        key={row.cutoff}
                        className={
                          settledRow
                            ? ""
                            : dueRow
                              ? "bg-amber-50/40 dark:bg-amber-950/20"
                              : "bg-indigo-50/25 dark:bg-indigo-950/20"
                        }
                      >
                        <td className="px-3 py-3 font-mono  text-slate-400">
                          {String(row.cutoff).padStart(2, "0")}
                        </td>
                        <td className="whitespace-nowrap px-3 py-3 font-mono font-medium tabular-nums">
                          {money(row.amount)}
                        </td>
                        <td
                          className={`whitespace-nowrap px-3 py-3 font-mono font-medium tabular-nums ${Number(row.amount_paid) > 0 ? "text-emerald-600 dark:text-emerald-400" : dueRow ? "text-amber-600" : "text-slate-400"}`}
                        >
                          {money(row.amount_paid)}
                        </td>
                        <td className="max-w-36 break-words px-3 py-3">
                          {row.payment_method}
                        </td>
                        <td className="max-w-40 break-all px-3 py-3 font-mono text-sm text-slate-500 dark:text-slate-400">
                          {row.reference}
                        </td>
                        <td className="whitespace-nowrap px-3 py-3 font-mono text-sm text-slate-500 dark:text-slate-400">
                          {row.paid_date}
                        </td>
                        <td className="whitespace-nowrap px-3 py-3 ">
                          {row.due_date}
                        </td>
                        <td className="px-3 py-2 text-center">
                          <span
                            className={`inline-block whitespace-nowrap rounded border px-2 py-0.5 text-sm ${tone}`}
                          >
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {!rows.length && (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-4 py-12 text-center text-muted-foreground"
                      >
                        No payment schedule available.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="flex gap-2 rounded-xl border border-blue-200 bg-blue-50/60 p-3 text-sm leading-relaxed text-blue-700 dark:border-blue-900 dark:bg-blue-950/30 dark:text-blue-300">
              <Info className="mt-0.5 size-4 shrink-0" />
              <p>
                Review unpaid cutoffs and payment references before continuing.
                The next step shows the proposed restructuring terms for this
                loan.
              </p>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-slate-200/80 bg-slate-50/70 px-5 py-3 dark:border-slate-800 dark:bg-slate-900/60">
          {/* <Button
            variant="outline"
            className="h-8 rounded-lg text-sm"
            disabled={!rows.length}
            onClick={() =>
              exportToCSV(rows, `loan-${loan?.id}-audit-ledger.csv`)
            }
          >
            <Download className="size-3.5" />
            Download Audit Ledger (CSV)
          </Button> */}
          <div className="ml-auto flex gap-2">
            <Button
              variant="outline"
              className="h-8 rounded-lg text-sm"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              className="h-8 rounded-lg bg-emerald-600 text-sm text-white hover:bg-emerald-700"
              disabled={!loan}
              onClick={onContinue}
            >
              Continue Restructuring
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
