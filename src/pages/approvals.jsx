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
import { Plus, Search, Pencil, Trash2, Edit, Save, X, Eye } from "lucide-react";

import { generateDates } from "@/lib/utils";
import { toast } from "sonner";
import { format } from "date-fns";

import {
  useApproveAsApprover,
  useFetchLoansAsApprover,
  useRejectAsApprover,
} from "@/api/approver";
export default function CoBorrowersPage() {
  const { data: loans, isLoading, isError } = useFetchLoansAsApprover();

  const approveLoan = useApproveAsApprover();
  const rejectLoan = useRejectAsApprover();
  const [selectedLoanType, setSelectedLoanType] = useState(null);
  const [rejectConfirm, setRejectConfirm] = useState(false);
  const [approveConfirm, setApproveConfirm] = useState(false);

  const handleCloseDialog = () => {
    setSelectedLoanType(null);
  };

  const handleOpenDialog = (item) => {
    setSelectedLoanType({
      loan_id: item?.id,
      loan_name: item?.loan_type.loan_name,
      loan_type: item?.loan_type.loan_type,
      loan_amount: item?.loan_type.loan_amount,
      interest_rate: item?.loan_type.interest_rate,
      service_fee: item?.loan_type.service_fee,
      term_months: item?.loan_type.term_months,
      coborrower_status: item?.coborrower_status,
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
            {loans?.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No loans available</p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Loan Amount</TableHead>

                      <TableHead>Borrower Name</TableHead>
                      <TableHead>Loan Name</TableHead>
                      <TableHead>Loan Type</TableHead>

                      <TableHead>Co-borrower status</TableHead>
                      <TableHead>Co-borrower Approve date</TableHead>

                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loans?.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">
                          {item?.loan_type?.loan_amount?.toLocaleString()}
                        </TableCell>

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
                            {item?.approver_1_status == "pending" ? (
                              <p className="flex rounded-full px-2.5 py-0.5 text-xs gap-1 bg-yellow-100 text-yellow-700 border-yellow-300">
                                {item?.approver_1_status}
                              </p>
                            ) : item?.approver_1_status == "approved" ? (
                              <p className="flex rounded-full px-2.5 py-0.5 text-xs gap-1 bg-green-100 text-green-700 border-green-300">
                                {item?.approver_1_status}
                              </p>
                            ) : item?.approver_1_status == "rejected" ? (
                              <p className="flex rounded-full px-2.5 py-0.5 text-xs gap-1 bg-red-100 text-red-700 border-red-300">
                                ✘ {item?.approver_1_status}
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
            <div className="flex items-center w-full p-5 py-7">
              <div className="flex items-center justify-between w-full">
                {steps?.map((step, index) => {
                  console.log(index, "step in rendering");

                  return (
                    <div
                      key={step.step}
                      className={`flex items-center  ${index == 3 ? "w-auto" : "w-full"}`}
                    >
                      {/* Circle */}
                      <div
                        className={`
                flex items-center justify-center w-10 h-10 rounded-full border-2 text-sm font-medium
              

                  ${
                    step.status == "approved"
                      ? "bg-green-100 px-3 text-green-600 border-green-300"
                      : step.status == "rejected"
                        ? "bg-red-100 px-3 text-red-600 border-red-300"
                        : "bg-yellow-100 px-3 text-yellow-600"
                  }
              `}
                      >
                        {step.status == "approved" ? (
                          <Check />
                        ) : step.status == "rejected" ? (
                          <X />
                        ) : (
                          step.step
                        )}
                      </div>
                      {/* Line */}
                      {index !== steps.length - 1 && (
                        <div className="flex-1 h-[2px] mx-2 bg-gray-300 relative">
                          <div
                            className={`
                    absolute top-0 left-0 h-[2px]
                 
                  `}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            <DialogTitle className="">
              <div className="flex items-center gap-4">
                <div>
                  <h1 className="text-3xl font-bold">
                    {selectedLoanType?.type?.loan_name}
                  </h1>
                  <p className="text-muted-foreground mt-1">
                    Loan Type: {selectedLoanType?.type?.loan_type}
                  </p>
                </div>
              </div>
            </DialogTitle>
          </DialogHeader>

          {/* Loan Details */}
          <div className="space-y-6">
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
                      {selectedLoanType?.member?.first_name}{" "}
                      {selectedLoanType?.member?.middle_name}{" "}
                      {selectedLoanType?.member?.last_name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground text-lg">
                      Loan Amount
                    </span>
                    <span className="font-medium text-lg">
                      ₱{selectedLoanType?.type?.loan_amount?.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground text-lg">
                      Interest Rate
                    </span>
                    <span className="font-medium text-lg">
                      {selectedLoanType?.type?.interest_rate}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground text-lg">
                      Service Fee
                    </span>
                    <span className="font-medium text-lg">
                      {selectedLoanType?.type?.service_fee}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground text-lg">Term</span>
                    <span className="font-medium text-lg">
                      {selectedLoanType?.type?.term_months}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-muted-foreground text-lg">
                      Apply Date
                    </span>
                    <span className="font-medium text-lg">
                      <span className="font-medium text-lg">
                        {selectedLoanType?.created_at
                          ? format(
                              new Date(selectedLoanType?.created_at),
                              "MM/dd/yyyy",
                            )
                          : "N/A"}
                      </span>
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground text-lg">
                      Status
                    </span>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        selectedLoanType?.status === "approved"
                          ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                          : selectedLoanType?.status === "pending"
                            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
                            : selectedLoanType?.status === "rejected"
                              ? "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                              : "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                      }`}
                    >
                      {selectedLoanType?.status}
                    </span>
                  </div>
                  <div className="w-full h-[1px] my-4 bg-gray-200 dark:bg-gray-700"></div>

                  <CardTitle className="text-xl">
                    Co-borrowers Information
                  </CardTitle>

                  <div className="flex justify-between">
                    <span className="text-muted-foreground text-lg">Name</span>
                    <span className="font-medium text-lg">
                      {selectedLoanType?.member?.first_name}{" "}
                      {selectedLoanType?.member?.middle_name}{" "}
                      {selectedLoanType?.member?.last_name}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-muted-foreground text-lg">
                      Approved / Rejected Date
                    </span>
                    <span className="font-medium text-lg">
                      {selectedLoanType?.coborrower_status_date
                        ? format(
                            new Date(selectedLoanType?.coborrower_status_date),
                            "MM/dd/yyyy",
                          )
                        : "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground text-lg">
                      Status
                    </span>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        selectedLoanType?.coborrower_status === "approved"
                          ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                          : selectedLoanType?.coborrower_status === "pending"
                            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
                            : selectedLoanType?.coborrower_status === "rejected"
                              ? "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                              : "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                      }`}
                    >
                      {selectedLoanType?.coborrower_status}
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
            <DialogTitle className="text-3xl">
              {selectedLoanType?.coborrower_status === "pending"
                ? "Approve or Reject Loan Application"
                : "You friend's Loan Application Details"}
            </DialogTitle>
          </DialogHeader>

          <div className="flex gap-4 flex-col">
            <p className="text-lg pb-2 border-b boder-muted-foreground">
              Loan Name: {selectedLoanType?.loan_name}
            </p>
            <p className="text-lg pb-2 border-b boder-muted-foreground">
              Loan Type: {selectedLoanType?.loan_type}
            </p>
            <p className="text-lg pb-2 border-b boder-muted-foreground">
              Loan Amount: ₱{selectedLoanType?.loan_amount?.toLocaleString()}
            </p>
            <p className="text-lg pb-2 border-b boder-muted-foreground ">
              Loan Interest: {selectedLoanType?.interest_rate}%
            </p>
            <p className="text-lg pb-2 border-b boder-muted-foreground">
              Service Fee: {selectedLoanType?.service_fee}%
            </p>

            {generatedDates && generatedDates.length > 0 && (
              <div className="text-sm text-muted-foreground">
                <p className="mb-2 text-md">Sample Computations:</p>

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
          </div>
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
