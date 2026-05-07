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
import { Plus, Search, Pencil, Trash2, Edit, Save, X, Eye } from "lucide-react";

import { generateDates } from "@/lib/utils";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  useApproveAsCoborrower,
  useFetchLoansAsCoborrower,
  useRejectAsCoborrower,
} from "@/api/coborrowers";
import { TableSkeleton } from "@/components/TableSkeleton";
export default function CoBorrowersPage() {
  const { data: coBorrowers, isLoading, isError } = useFetchLoansAsCoborrower();

  const approveLoan = useApproveAsCoborrower();
  const rejectLoan = useRejectAsCoborrower();
  const [selectedLoanType, setSelectedLoanType] = useState(null);
  const [rejectConfirm, setRejectConfirm] = useState(false);
  const [approveConfirm, setApproveConfirm] = useState(false);

  const handleOpenDialog = (item) => {
    setSelectedLoanType({
      name: item?.member?.first_name + " " + item?.member?.last_name,
      loan_id: item?.id,
      loan_name: item?.loan_type.loan_name,
      loan_type: item?.loan_type.loan_type,
      loan_amount: item?.loan_type.loan_amount,
      interest_rate: item?.loan_type.interest_rate,
      service_fee: item?.loan_type.service_fee,
      term_months: item?.loan_type.term_months,
      coborrower_status: item?.coborrower_status,
      apply_date: format(new Date(item?.created_at), "MMM dd, yyyy"),
      loan_status: item?.status,
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
            Overview of your yours friends and family who are co-borrowing with
            you. You can manage your co-borrowers and view their loan details
            here.
          </p>
        </div>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>Your Loans</CardTitle>
          </CardHeader>
          <CardContent>
            {coBorrowers?.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No loans available</p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Borrower Name</TableHead>
                      <TableHead>Loan Name</TableHead>
                      <TableHead>Loan Type</TableHead>

                      <TableHead>Co-borrower status</TableHead>
                      <TableHead>Co-borrower Approve date</TableHead>

                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {coBorrowers?.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">
                          {item?.member?.first_name} {item?.member?.middle_name}{" "}
                          {item?.member?.last_name}
                        </TableCell>

                        <TableCell className="font-medium">
                          {item?.loan_type?.loan_name}
                        </TableCell>
                        <TableCell className="font-medium">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              item.loan_type.loan_type === "Member"
                                ? "bg-green-100 text-green-700 border-green-300"
                                : item.loan_type.loan_type === "Associate"
                                  ? "bg-blue-100 text-blue-700 border-blue-300"
                                  : "bg-purple-100 text-purple-700 border-purple-300"
                            }`}
                          >
                            {item.loan_type.loan_type}
                          </span>
                        </TableCell>

                        <TableCell>
                          <div className="flex  gap-2">
                            {item?.coborrower_status == "pending" ? (
                              <p className="flex rounded-full px-2.5 py-0.5 text-xs gap-1 bg-yellow-100 text-yellow-700 border-yellow-300">
                                {item?.coborrower_status}
                              </p>
                            ) : item?.coborrower_status == "approved" ? (
                              <p className="flex rounded-full px-2.5 py-0.5 text-xs gap-1 bg-green-100 text-green-700 border-green-300">
                                {item?.coborrower_status}
                              </p>
                            ) : item?.coborrower_status == "rejected" ? (
                              <p className="flex rounded-full px-2.5 py-0.5 text-xs gap-1 bg-red-100 text-red-700 border-red-300">
                                ✘ {item?.coborrower_status}
                              </p>
                            ) : (
                              ""
                            )}
                          </div>
                        </TableCell>

                        <TableCell>
                          {format(
                            new Date(item?.coborrower_status_date),
                            "MMM dd, yyyy",
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenDialog(item)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>

                            {/* <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(user)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button> */}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={selectedLoanType} onOpenChange={setSelectedLoanType}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-3xl text-center  py-5">
              {selectedLoanType?.coborrower_status === "pending"
                ? "Approve or Reject Loan Application"
                : "You friend's Loan Application Details"}
            </DialogTitle>
          </DialogHeader>

          {/* Loan Details */}
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold">
                  {selectedLoanType?.loan_name}
                </h1>
                <p className="text-muted-foreground mt-1">
                  Loan Type: {selectedLoanType?.loan_type}
                </p>
              </div>
            </div>

            {/* Loan Information */}
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Loan Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground text-lg">
                      Member
                    </span>
                    <span className="font-medium text-lg">
                      {selectedLoanType?.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground text-lg">
                      Loan Amount
                    </span>
                    <span className="font-medium text-lg">
                      ₱{selectedLoanType?.loan_amount?.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground text-lg">
                      Interest Rate
                    </span>
                    <span className="font-medium text-lg">
                      {selectedLoanType?.interest_rate}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground text-lg">
                      Service Fee
                    </span>
                    <span className="font-medium text-lg">
                      {selectedLoanType?.service_fee}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground text-lg">Term</span>
                    <span className="font-medium text-lg">
                      {selectedLoanType?.term_months}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-muted-foreground text-lg">
                      Apply Date
                    </span>
                    <span className="font-medium text-lg">
                      {selectedLoanType?.apply_date}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground text-lg">
                      Status
                    </span>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        selectedLoanType?.loan_status === "approved"
                          ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                          : selectedLoanType?.loan_status === "pending"
                            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
                            : selectedLoanType?.loan_status === "rejected"
                              ? "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                              : "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                      }`}
                    >
                      {selectedLoanType?.loan_status}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">
                    Payment Sample Computation
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {generatedDates && generatedDates.length > 0 && (
                    <div className="flex flex-col gap-2 text-lg text-muted-foreground">
                      {generatedDates.length === 1 ? (
                        <p>{generatedDates[0]}</p>
                      ) : (
                        generatedDates
                          .reduce((acc, curr, i) => {
                            if (i % 2 === 0) {
                              const next = generatedDates[i + 1];
                              acc.push(next ? `${curr}, ${next}` : curr); // fallback if odd
                            }
                            return acc;
                          }, [])
                          .map((range, index) => (
                            <p key={index} className="py-0.5">
                              {range}
                            </p>
                          ))
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {selectedLoanType?.coborrower_status === "pending" && (
            <DialogFooter>
              <Button
                variant="destructive"
                size="lg"
                onClick={() => setRejectConfirm(true)}
              >
                REJECT
              </Button>

              <Button
                variant="default"
                size="lg"
                onClick={() => setApproveConfirm(true)}
              >
                APPROVE
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
