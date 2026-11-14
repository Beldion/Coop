import SummaryView from "./summaryView";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
// import { Badge } from "@/components/ui/badge";
import { generateDates, money } from "@/lib/utils";
import {
  ArrowRight,
  CircleAlert,
  LoaderCircle,
  RotateCcw,
  UserRound,
} from "lucide-react";
import Decimal from "decimal.js";
import { useMemo, useState } from "react";
import { useRestructureLoan } from "@/api/loans";
import { toast } from "sonner";

export default function LoanSummary({ open, onOpenChange, loan, onBack }) {
  const restructureLoan = useRestructureLoan();
  const [approveConfirm, setApproveConfirm] = useState(false);

  //     const res = await restructureLoan.mutateAsync({
  //   loanId: loan.id,

  // });

  const approveLoandata = loan?.loan_type?.loan_amount;
  const oldLoan = loan?.loan_payments
    .reduce(
      (sum, payment) =>
        sum.plus(payment.amount || 0).minus(payment.amount_paid || 0),
      new Decimal(0),
    )
    .toNumber();

  const netCash =
    loan?.loan_type?.loan_type == "Associate"
      ? approveLoandata -
        oldLoan -
        (approveLoandata * loan?.loan_type?.interest_rate) / 100 -
        (approveLoandata * loan?.loan_type?.service_fee) / 100
      : loan?.loan_type?.loan_type == "Member"
        ? approveLoandata - oldLoan
        : 0;

  const totalRepay =
    loan?.loan_type?.loan_type == "Member"
      ? approveLoandata -
        oldLoan +
        (approveLoandata * loan?.loan_type?.interest_rate) / 100 +
        (approveLoandata * loan?.loan_type?.service_fee) / 100
      : loan?.loan_type?.loan_type == "Associate"
        ? approveLoandata
        : 0;

  const monthlyPayment =
    loan?.loan_type?.loan_type == "Member"
      ? (approveLoandata +
          (approveLoandata * loan?.loan_type?.interest_rate) / 100 +
          (approveLoandata * loan?.loan_type?.service_fee) / 100) /
        loan?.loan_type?.term_months
      : loan?.loan_type?.loan_type == "Associate"
        ? approveLoandata / loan?.loan_type?.term_months
        : 0;

  // console.log("loan summary", loan.loan_type.loan_type);
  const loanData = {
    approvedLoan: approveLoandata,
    oldLoan: oldLoan,
    netCash: netCash,
    principal: approveLoandata,
    interest: loan?.loan_type?.interest_rate
      ? (approveLoandata * loan?.loan_type?.interest_rate) / 100
      : 0,

    serviceFee: loan?.loan_type?.service_fee
      ? (approveLoandata * loan?.loan_type?.service_fee) / 100
      : 0,
    totalRepay: totalRepay,
    monthlyPayment: monthlyPayment,
    term: Number(loan?.loan_type?.term_months) || 0,
  };

  const generatedDates = useMemo(() => {
    if (loan) {
      const {
        service_fee,
        loan_amount,
        interest_rate,
        term_months,
        loan_type,
      } = loan?.loan_type || {};

      console.log("test", loan);
      return generateDates(
        service_fee,
        loan_amount,
        interest_rate,
        term_months,
        loan_type,
      );
    }
  }, [loan]);

  console.log("loan summary", loan, generatedDates);

  const handleApprove = async () => {
    if (!loan || restructureLoan.isPending) return;

    console.log("loandasdadasdasdasd", loan);
    try {
      await restructureLoan.mutateAsync({
        loanId: loan.loan.id,
      });
      toast.success("Loan restructuring applied successfully.");
      setApproveConfirm(false);
      onOpenChange(false);
    } catch (error) {
      toast.error(
        error?.message || "Unable to apply restructuring. Please try again.",
      );
    }
  };
  return (
    <>
      <SummaryView
        open={open}
        onOpenChange={onOpenChange}
        loan={loan}
        data={loanData}
        dates={generatedDates}
        onBack={onBack}
        onConfirm={() => setApproveConfirm(true)}
        pending={restructureLoan.isPending}
      />

      {/* ALERT DIALOG (OUTSIDE but controlled) */}
      <AlertDialog
        open={approveConfirm}
        onOpenChange={(nextOpen) => {
          if (!restructureLoan.isPending) setApproveConfirm(nextOpen);
        }}
      >
        <AlertDialogContent
          className="max-h-[92dvh] gap-0 overflow-y-auto rounded-2xl p-0 data-[size=default]:max-w-[calc(100%-2rem)] data-[size=default]:sm:max-w-lg"
          aria-busy={restructureLoan.isPending}
        >
          <div className="h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-500" />
          <AlertDialogHeader className="flex flex-col items-start gap-3 px-6 pt-6 text-left">
            <div className="flex w-full items-center justify-between gap-3">
              <div className="flex size-12 items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-400">
                <RotateCcw className="size-5" />
              </div>
              <span className="rounded-full border bg-slate-50 px-2.5 py-1 text-[9px] font-medium uppercase tracking-wider text-slate-500 dark:bg-slate-900">
                Final confirmation
              </span>
            </div>
            <AlertDialogTitle className="text-xl font-semibold tracking-tight">
              Apply loan restructuring?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs leading-relaxed">
              Confirm the proposal below to apply the revised repayment terms to
              this member’s loan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4 px-6 py-5">
            <div className="overflow-hidden rounded-xl border">
              <div className="flex items-center gap-3 border-b bg-slate-50/70 px-4 py-3 dark:bg-slate-900/60">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-full border bg-background text-slate-400">
                  <UserRound className="size-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold">
                    {[
                      loan?.member?.first_name,
                      loan?.member?.middle_name,
                      loan?.member?.last_name,
                    ]
                      .filter(Boolean)
                      .join(" ") || "Member account"}
                  </p>
                  <p className="mt-1 break-all font-mono text-[10px] text-slate-400">
                    Loan #{loan?.id ?? "—"}
                  </p>
                </div>
              </div>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-4 p-4">
                {[
                  ["Approved loan", loanData.approvedLoan],
                  ["Old loan settlement", loanData.oldLoan],
                  ["Net cash released", loanData.netCash],
                  ["Total to repay", loanData.totalRepay],
                ].map(([label, value]) => (
                  <div key={label}>
                    <dt className="text-[9px] uppercase tracking-wide text-slate-500">
                      {label}
                    </dt>
                    <dd
                      className={`mt-1 break-words font-mono text-sm font-semibold tabular-nums ${label === "Net cash released" ? "text-emerald-600 dark:text-emerald-400" : ""}`}
                    >
                      {money(value ?? 0)}
                    </dd>
                  </div>
                ))}
              </dl>
              <div className="flex flex-wrap items-center justify-between gap-2 border-t bg-indigo-50/60 px-4 py-3 text-[11px] dark:bg-indigo-950/30">
                <span className="text-muted-foreground">
                  Semi-monthly • {loanData.term} cutoffs
                </span>
                <span className="font-mono font-semibold text-indigo-600 dark:text-indigo-400">
                  {money(loanData.monthlyPayment)} / cutoff
                </span>
              </div>
            </div>
            <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50/70 p-3 text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300">
              <CircleAlert className="mt-0.5 size-4 shrink-0" />
              <p className="text-sm leading-relaxed">
                <span className="font-semibold">
                  This action cannot be undone.
                </span>{" "}
                Review the amounts and repayment schedule before applying the
                restructuring.
              </p>
            </div>
            {restructureLoan.isError && (
              <p
                role="alert"
                className="text-xs text-rose-600 dark:text-rose-400"
              >
                Restructuring could not be applied. Please try again.
              </p>
            )}
          </div>
          <AlertDialogFooter className="m-0 rounded-b-2xl px-6 py-4">
            <AlertDialogCancel
              disabled={restructureLoan.isPending}
              className="h-10 rounded-xl text-xs"
            >
              Back to Summary
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={!loan || restructureLoan.isPending}
              onClick={handleApprove}
              className="h-10 rounded-xl bg-emerald-600 px-4 text-xs text-white hover:bg-emerald-700"
            >
              {restructureLoan.isPending ? (
                <>
                  <LoaderCircle className="size-4 animate-spin" />
                  Applying restructuring…
                </>
              ) : (
                <>
                  Confirm &amp; Apply
                  <ArrowRight className="size-4" />
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
