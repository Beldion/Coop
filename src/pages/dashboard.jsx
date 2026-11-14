import { ApplyLoanSummary, ApplyLoanSchedule } from "@/components/applyLoanSummary";
import DashboardOverview from "@/components/dashboardOverview";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Plus, Search, Pencil, Trash2, Edit, Save, X, Eye } from "lucide-react";

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

import { generateDates, money } from "@/lib/utils";
import { toast } from "sonner";
import { format } from "date-fns";
import { Label } from "@/components/ui/label";
import {
  useCreateUserLoan,
  useUserLoans,
  useUserLoanTypes,
  useCreateLoanPayments,
} from "@/api/loans";
import UserSearch from "@/components/userSearch";
import { TableSkeleton } from "@/components/TableSkeleton";
import { Link } from "react-router-dom";
export default function Dashboard() {
  const createUserLoan = useCreateUserLoan();
  const createLoanPayment = useCreateLoanPayments();
  const { data, isError, isLoading } = useUserLoanTypes();

  const {
    data: loans,
    isLoading: loansLoading,
    isError: loansError,
  } = useUserLoans();
  const [selectedLoanType, setSelectedLoanType] = useState(null);
  const [saveConfirm, setSaveConfirm] = useState(false);

  const handleCloseDialog = () => {
    setSelectedLoanType(null);
  };

  const handleOpenDialog = (item) => {
    setSelectedLoanType({
      loan_id: item.id,
      loan_name: item.loan_name,
      loan_type: item.loan_type,
      loan_amount: item.loan_amount,
      interest_rate: item.interest_rate,
      service_fee: item.service_fee,
      term_months: item.term_months,
      special_dates: item.special_payment_date,
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

      console.log("test", term_months);
      return generateDates(
        service_fee,
        loan_amount,
        interest_rate,
        term_months,
        loan_type,
      );
    }
  }, [selectedLoanType]);

  const handleApplyLoan = async () => {
    if (!selectedLoanType) return;

    if (selectedLoanType.accepted !== true) {
      toast.error(
        "You must accept the terms and conditions to apply for this loan",
      );
      return;
    }
    const res = await createUserLoan.mutateAsync(selectedLoanType);

    console.log("create loan res", res);
    if (res.error) {
      toast.error(res.error.message || "Failed to create loan");
      return;
    } else {
      toast.success("Loan created successfully");
      setSelectedLoanType(null);
      setSaveConfirm(false);
    }

    // closed dialog and reset selected loan type
  };

  if (isLoading) return <TableSkeleton />;

  if (isError) return <p>Something went wrong.</p>;

  return (
    <div className="w-full">
      <DashboardOverview
        packages={data}
        loans={loans}
        loansLoading={loansLoading}
        loansError={loansError}
        onApply={handleOpenDialog}
      />

      <Dialog
        open={Boolean(selectedLoanType)}
        onOpenChange={(open) => {
          if (!open) handleCloseDialog();
        }}
      >
        <DialogContent className="flex max-h-[92dvh] flex-col gap-0 overflow-hidden rounded-2xl p-0 md:max-w-2xl">
          <DialogHeader className="shrink-0 gap-2 border-b border-slate-100 px-5 py-5 pr-12 text-left sm:px-6 sm:pr-12 dark:border-slate-800">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded border border-emerald-100 bg-emerald-50 px-2 py-1 text-[9px] font-semibold uppercase tracking-wide text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-400">
                Loan application confirmation
              </span>
              <span className="text-[10px] text-slate-400">Cooperative Credit Scheme</span>
            </div>
            <DialogTitle className="text-xl font-semibold leading-snug tracking-tight sm:text-2xl">
              Are you sure you want to apply for this loan?
            </DialogTitle>
            <DialogDescription className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              Please review the loan terms, deduction breakdown, and payment schedule before proceeding.
            </DialogDescription>
          </DialogHeader>

          <div className="min-h-0 space-y-5 overflow-y-auto p-6">
            <ApplyLoanSummary loan={selectedLoanType} />
            <div className="space-y-4">
              <Label htmlFor="search" className="text-[10px] font-semibold uppercase tracking-wide">
                Search for co-borrower (optional)
              </Label>

              <UserSearch setSelectedLoanType={setSelectedLoanType} />
            </div>
            <ApplyLoanSchedule loan={selectedLoanType} dates={generatedDates} />

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="terms"
                  required
                  checked={selectedLoanType?.accepted || false}
                  onCheckedChange={(checked) =>
                    setSelectedLoanType((prev) => ({
                      ...prev,
                      accepted: checked,
                    }))
                  }
                />

                <label htmlFor="terms" className="text-xs leading-5 text-slate-500">
                  I agree to the
                  <Dialog>
                    <DialogTrigger>
                      <button
                        type="button"
                        className="text-blue-600 underline hover:text-blue-800"
                      >
                        Terms and Conditions
                      </button>
                    </DialogTrigger>

                    <DialogContent className="max-w-lg">
                      <DialogHeader>
                        <DialogTitle>Terms and Conditions</DialogTitle>
                        <DialogDescription>
                          Please read these terms carefully before continuing.
                        </DialogDescription>
                      </DialogHeader>

                      <div className="max-h-[400px] overflow-y-auto text-sm text-gray-700 space-y-3">
                        <p>
                          By using this service, you agree to comply with all
                          applicable rules and policies.
                        </p>
                        <p>
                          Your information will be handled according to our
                          privacy policy.
                        </p>
                        <p>
                          We may update these terms from time to time without
                          prior notice.
                        </p>
                      </div>
                    </DialogContent>
                  </Dialog>
                </label>
              </div>
            </div>

          </div>
            <DialogFooter className="m-0 shrink-0 rounded-b-2xl border-t bg-slate-50 px-6 py-4 dark:bg-slate-900">
              <Button type="button" className="rounded-xl" variant="outline" onClick={handleCloseDialog}>
                Cancel
              </Button>

              <Button
                onClick={() => {
                  if (selectedLoanType.accepted !== true) {
                    toast.error(
                      "You must accept the terms and conditions to apply for this loan",
                    );

                    return;
                  }
                  setSaveConfirm(true);
                }}
                disabled={createUserLoan.isPending}
                className="rounded-xl bg-emerald-600 px-6 text-white hover:bg-emerald-700"
              >
                {createUserLoan.isPending ? "Applying..." : "Apply this Loan"}
              </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={saveConfirm} onOpenChange={setSaveConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Save?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to save these changes?
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogAction
              disabled={createUserLoan.isPending}
              onClick={handleApplyLoan}
              className="grey:bg-green-600 bg-green-500 hover:bg-green-600 focus:ring-green-600"
            >
              {createUserLoan.isPending ? "Applying..." : "Yes"}
            </AlertDialogAction>
            <AlertDialogCancel>No</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
