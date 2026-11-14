import ApprovalsTable from "@/components/approvalsTable";
import CoborrowerDetails from "@/components/coborrowerDetails";
import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Plus, Search, Pencil, Trash2, Edit, Save, X, Eye, ShieldCheck, CircleX } from "lucide-react";

import { generateDates, money } from "@/lib/utils";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  useApproveAsCoborrower,
  useFetchLoansAsCoborrower,
  useRejectAsCoborrower,
} from "@/api/coborrowers";
import { TableSkeleton } from "@/components/TableSkeleton";
import { Label } from "@/components/ui/label";
export default function CoBorrowersPage() {
  const { data: coBorrowers, isLoading, isError } = useFetchLoansAsCoborrower();

  const approveLoan = useApproveAsCoborrower();
  const rejectLoan = useRejectAsCoborrower();
  const [selectedLoanType, setSelectedLoanType] = useState(null);
  const [rejectConfirm, setRejectConfirm] = useState(false);
  const [approveConfirm, setApproveConfirm] = useState(false);

  const handleOpenDialog = (item) => {
    setSelectedLoanType({
      name: [item?.member?.first_name, item?.member?.middle_name, item?.member?.last_name].filter(Boolean).join(" "),
      loan_id: item?.id,
      loan_name: item?.loan_type?.loan_name,
      loan_type: item?.loan_type?.loan_type,
      loan_amount: item?.loan_type?.loan_amount,
      interest_rate: item?.loan_type?.interest_rate,
      service_fee: item?.loan_type?.service_fee,
      term_months: item?.loan_type?.term_months,
      coborrower_status: item?.coborrower_status,
      apply_date: item?.created_at && !Number.isNaN(new Date(item.created_at).getTime()) ? format(new Date(item.created_at), "MMM dd, yyyy") : "N/A",
      loan_status: item?.status,
      special_dates: item?.loan_type?.special_payment_date,
    });
  };

  const generatedDates = useMemo(() => {
    if (selectedLoanType) {
      const {
        service_fee,
        loan_amount,
        interest_rate,
        term_months,
        loan_type,
      } = selectedLoanType;
      return generateDates(
        service_fee,
        loan_amount,
        interest_rate,
        term_months,
        loan_type,
      );
    }
  }, [selectedLoanType]);

  const handleApprove = async () => {
    if (selectedLoanType) {
      const res = await approveLoan.mutateAsync({
        loanId: selectedLoanType.loan_id,
        status: "approved",
      });

      if (res.error) {
        toast.error("Failed to approve loan application. Please try again. ");
      } else {
        toast.success("Loan application approved successfully.");
        setSelectedLoanType(null);
        setRejectConfirm(false);
        setApproveConfirm(false);
      }
    }
  };

  const handleReject = async () => {
    if (selectedLoanType) {
      const res = rejectLoan.mutateAsync({
        loanId: selectedLoanType.loan_id,
        status: "rejected",
      });

      if (res.error) {
        toast.error("Failed to reject loan application. Please try again. ");
      } else {
        toast.success("Loan application rejected successfully.");
        setSelectedLoanType(null);
        setRejectConfirm(false);
      }
    }
  };
  if (isLoading) return <TableSkeleton />;
  if (isError) return <p>Something went wrong.</p>;
  return (
    <div className="w-full">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Co-borrowers</h1>
          <p className="text-muted-foreground mt-1 max-w-md ">
            Review and respond to loan applications that name you as a co-borrower.
          </p>
        </div>

        <ApprovalsTable
          loans={(coBorrowers || []).map((loan) => ({ ...loan, type: loan.loan_type, status: loan.coborrower_status, created_at: loan.coborrower_status_date }))}
          title="Co-borrower Requests" description="Review applications that name you as a co-borrower" dateLabel="Responded" statusLabel="Your Response"
          onReview={(row) => handleOpenDialog(coBorrowers.find((loan) => loan.id === row.id))}
        />
      </div>

      <Dialog open={Boolean(selectedLoanType)} onOpenChange={(open) => { if (!open) setSelectedLoanType(null); }}>
        <DialogContent className="max-h-[92dvh] overflow-y-auto gap-0 rounded-2xl p-0 md:max-w-3xl">
          <CoborrowerDetails loan={selectedLoanType} dates={generatedDates} />
          {selectedLoanType?.coborrower_status !== "pending" && <DialogFooter className="m-0 rounded-b-2xl px-6 py-4"><Button variant="outline" onClick={() => setSelectedLoanType(null)}>Close</Button></DialogFooter>}
          {selectedLoanType?.coborrower_status === "pending" && (
            <DialogFooter className="sticky bottom-0 m-0 rounded-b-2xl border-t bg-background px-6 py-4">
              <Button
                variant="destructive"
                size="lg"
                onClick={() => setRejectConfirm(true)}
              >
                Reject Request
              </Button>

              <Button
                variant="default"
                size="lg"
                onClick={() => setApproveConfirm(true)}
              >
                Approve Request
              </Button>
            </DialogFooter>
          )}

          {/* Loan Details end*/}
        </DialogContent>
      </Dialog>

      {/* ALERT DIALOG (OUTSIDE but controlled) */}
      <AlertDialog open={rejectConfirm} onOpenChange={setRejectConfirm}>
        <AlertDialogContent className="gap-5 rounded-2xl p-6 data-[size=default]:max-w-[calc(100%-2rem)] data-[size=default]:sm:max-w-md">
          <AlertDialogHeader className="gap-3">
            <span className="flex size-12 items-center justify-center rounded-2xl border border-rose-100 bg-rose-50 text-rose-600 dark:border-rose-900 dark:bg-rose-950"><CircleX className="size-6" aria-hidden="true" /></span>
            <AlertDialogTitle className="text-xl font-semibold tracking-tight">Decline this request?</AlertDialogTitle>
            <AlertDialogDescription className="text-xs leading-5">You are declining to act as co-borrower for this application. Review the details before confirming.</AlertDialogDescription>
          </AlertDialogHeader>
          <dl className="space-y-3 rounded-xl border border-slate-200/80 bg-slate-50/70 p-4 text-xs dark:border-slate-800 dark:bg-slate-900/40">
            <div className="flex justify-between gap-4"><dt className="text-slate-500">Borrower</dt><dd className="max-w-[65%] break-words text-right font-medium">{selectedLoanType?.name || "N/A"}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-slate-500">Loan package</dt><dd className="max-w-[65%] break-words text-right font-medium">{selectedLoanType?.loan_name || "N/A"}</dd></div>
            <div className="flex justify-between gap-4 border-t border-slate-200/70 pt-3 dark:border-slate-800"><dt className="text-slate-500">Principal amount</dt><dd className="font-semibold tabular-nums">{money(Number(selectedLoanType?.loan_amount) || 0)}</dd></div>
          </dl>
          <AlertDialogFooter className="-mx-6 -mb-6 rounded-b-2xl px-6 py-4">
            <AlertDialogCancel disabled={rejectLoan.isPending} className="rounded-lg text-xs">Go Back</AlertDialogCancel>
            <AlertDialogAction disabled={rejectLoan.isPending} onClick={handleReject} className="rounded-lg bg-rose-600 text-xs text-white hover:bg-rose-700">
              {rejectLoan.isPending ? "Submitting?" : "Reject Request"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ALERT DIALOG (OUTSIDE but controlled) */}
      <AlertDialog open={approveConfirm} onOpenChange={setApproveConfirm}>
        <AlertDialogContent className="gap-5 rounded-2xl p-6 data-[size=default]:max-w-[calc(100%-2rem)] data-[size=default]:sm:max-w-md">
          <AlertDialogHeader className="gap-3">
            <span className="flex size-12 items-center justify-center rounded-2xl border border-emerald-100 bg-emerald-50 text-emerald-600 dark:border-emerald-900 dark:bg-emerald-950"><ShieldCheck className="size-6" aria-hidden="true" /></span>
            <AlertDialogTitle className="text-xl font-semibold tracking-tight">Approve this request?</AlertDialogTitle>
            <AlertDialogDescription className="text-xs leading-5">You are confirming your participation as co-borrower for this application. Review the details before confirming.</AlertDialogDescription>
          </AlertDialogHeader>
          <dl className="space-y-3 rounded-xl border border-slate-200/80 bg-slate-50/70 p-4 text-xs dark:border-slate-800 dark:bg-slate-900/40">
            <div className="flex justify-between gap-4"><dt className="text-slate-500">Borrower</dt><dd className="max-w-[65%] break-words text-right font-medium">{selectedLoanType?.name || "N/A"}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-slate-500">Loan package</dt><dd className="max-w-[65%] break-words text-right font-medium">{selectedLoanType?.loan_name || "N/A"}</dd></div>
            <div className="flex justify-between gap-4 border-t border-slate-200/70 pt-3 dark:border-slate-800"><dt className="text-slate-500">Principal amount</dt><dd className="font-semibold tabular-nums">{money(Number(selectedLoanType?.loan_amount) || 0)}</dd></div>
          </dl>
          <AlertDialogFooter className="-mx-6 -mb-6 rounded-b-2xl px-6 py-4">
            <AlertDialogCancel disabled={approveLoan.isPending} className="rounded-lg text-xs">Go Back</AlertDialogCancel>
            <AlertDialogAction disabled={approveLoan.isPending} onClick={handleApprove} className="rounded-lg bg-emerald-600 text-xs text-white hover:bg-emerald-700">
              {approveLoan.isPending ? "Submitting?" : "Approve Request"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
