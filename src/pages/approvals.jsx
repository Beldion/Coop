import ApprovalsTable from "@/components/approvalsTable";
import ApprovalDetails from "@/components/approvalDetails";
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

import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Edit,
  Save,
  X,
  Eye,
  Clock,
  Loader,
  CircleDashed,
  Hourglass,
  Check,
} from "lucide-react";

import { generateDates } from "@/lib/utils";
import { toast } from "sonner";
import { format } from "date-fns";

import { TableSkeleton } from "@/components/TableSkeleton";
import {
  useApproveAsApprover,
  useFetchLoansAsApprover,
  useRejectAsApprover,
} from "@/api/approver";
import { useAuthProfile } from "@/api/users";
import { Label } from "@/components/ui/label";
export default function ApprovalsPage() {
  const { data: loans, isLoading, isError } = useFetchLoansAsApprover();
  const {
    data: { profile },
  } = useAuthProfile();

  const approveLoan = useApproveAsApprover();
  const rejectLoan = useRejectAsApprover();
  const [selectedLoanType, setSelectedLoanType] = useState(null);
  const [rejectConfirm, setRejectConfirm] = useState(false);
  const [approveConfirm, setApproveConfirm] = useState(false);
  const [steps, setSteps] = useState(null);

  console.log("loans", loans);

  const handleOpenDialog = (item) => {
    setSelectedLoanType(item);

    console.log("selected loan type", item);
    setSteps([
      {
        step: 1,
        status: item.coborrowers == null ? "approved" : item.coborrower_status,
        date: item.coborrower_status_date,
        isCompleted: item.coborrower_status == "approved" || item.coborrowers,
      },
      {
        step: 2,
        status: item.approver_1_status,
        date: item.approver_1_status_date,
        isCompleted: item.approver_1_status == "approved",
      },
      {
        step: 3,
        status: item.approver_2_status,
        date: item.approver_2_status_date,
        isCompleted: item.approver_2_status == "approved",
      },
      {
        step: 4,
        status: item.status,
        date: item.status_date,
        isCompleted: item.status == "approved",
      },
    ]);

    setTimeout(() => {
      console.log(steps, "steps");
    }, 1000);
  };

  const generatedDates = useMemo(() => {
    if (selectedLoanType) {
      const {
        service_fee,
        loan_amount,
        interest_rate,
        term_months,
        loan_type,
      } = selectedLoanType?.type || {};

      console.log("test", selectedLoanType);
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
        loanId: selectedLoanType.id,
        status: "approved",
      });

      console.log(res, "res in handle approve");
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
        loanId: selectedLoanType.id,
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
  if (isError) return <p>{isError?.message || "Something went wrong."}</p>;
  return (
    <div className="w-full">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">
            Loan Approvals
          </h1>
          <p className="text-muted-foreground mt-1 max-w-md ">
            Review loan applications and manage the approval process.
          </p>
        </div>

        <ApprovalsTable loans={loans} onReview={handleOpenDialog} />
      </div>

      <Dialog open={Boolean(selectedLoanType)} onOpenChange={(open) => { if (!open) setSelectedLoanType(null); }}>
        <DialogContent className="max-h-[92dvh] overflow-y-auto gap-0 rounded-2xl p-0 md:max-w-3xl">
          <ApprovalDetails loan={selectedLoanType} steps={steps} generatedDates={generatedDates} />

          {((profile.role === "approver-1" &&
            selectedLoanType?.approver_1_status === "pending") ||
            (profile.role === "approver-2" &&
              selectedLoanType?.approver_1_status === "approved" &&
              selectedLoanType?.approver_2_status === "pending") ||
            (profile.role === "admin" &&
              selectedLoanType?.approver_1_status === "approved" &&
              selectedLoanType?.approver_2_status === "approved" &&
              selectedLoanType?.status === "pending")) && (
            <DialogFooter>
              <Button
                variant="destructive"
                size="lg"
                onClick={() => setRejectConfirm(true)}
              >
                Reject Application
              </Button>

              <Button
                variant="default"
                size="lg"
                onClick={() => setApproveConfirm(true)}
              >
                <Check className="mr-1 size-4" /> Approve Loan Application
              </Button>
            </DialogFooter>
          )}

          {/* Loan Details end*/}
        </DialogContent>
      </Dialog>

      {/* ALERT DIALOG (OUTSIDE but controlled) */}
      <AlertDialog open={rejectConfirm} onOpenChange={setRejectConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Reject?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reject this loan application? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>No</AlertDialogCancel>

            <AlertDialogAction
              disabled={rejectLoan.isPending}
              onClick={handleReject}
              className="bg-red-600 hover:bg-red-700"
            >
              {rejectLoan.isPending ? "Rejecting loan as Coborrower" : "Yes"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ALERT DIALOG (OUTSIDE but controlled) */}
      <AlertDialog open={approveConfirm} onOpenChange={setApproveConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Reject?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to approve this loan application? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>No</AlertDialogCancel>

            <AlertDialogAction
              disabled={approveLoan.isPending}
              onClick={handleApprove}
              className="bg-green-600 hover:bg-green-700"
            >
              {approveLoan.isPending ? "Approving loan as Coborrower" : "Yes"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
