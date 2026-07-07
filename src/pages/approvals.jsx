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
                      <TableHead>Borrower Name</TableHead>
                      <TableHead>Loan Name</TableHead>
                      <TableHead>Loan Type</TableHead>

                      {/* <TableHead>Co-borrower status</TableHead>
                      <TableHead>Co-borrower Approve date</TableHead> */}
                      <TableHead>Status</TableHead>

                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loans?.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">
                          {item?.member?.first_name} {item?.member?.middle_name}{" "}
                          {item?.member?.last_name}
                        </TableCell>

                        <TableCell className="font-medium">
                          {item?.type?.loan_name}
                        </TableCell>
                        <TableCell className="font-medium">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              item?.type?.loan_type === "Member"
                                ? "bg-green-100 text-green-700 border-green-300"
                                : item?.type?.loan_type === "Associate"
                                  ? "bg-blue-100 text-blue-700 border-blue-300"
                                  : "bg-purple-100 text-purple-700 border-purple-300"
                            }`}
                          >
                            {item?.type?.loan_type}
                          </span>
                        </TableCell>

                        {/* <TableCell>
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
                        </TableCell> */}

                        {/* <TableCell>
                          {item?.coborrower_status_date ? (
                            <p className="text-sm text-muted-foreground">
                              {format(
                                new Date(item?.coborrower_status_date),
                                "MMM dd, yyyy",
                              )}
                            </p>
                          ) : (
                            "N/A"
                          )}
                        </TableCell> */}

                        <TableCell>
                          <div className="flex  gap-2">
                            {item?.status == "pending" ? (
                              <p className="flex rounded-full px-2.5 py-0.5 text-xs gap-1 bg-yellow-100 text-yellow-700 border-yellow-300">
                                {item?.status}
                              </p>
                            ) : item?.status == "approved" ? (
                              <p className="flex rounded-full px-2.5 py-0.5 text-xs gap-1 bg-green-100 text-green-700 border-green-300">
                                {item?.status}
                              </p>
                            ) : item?.status == "rejected" ? (
                              <p className="flex rounded-full px-2.5 py-0.5 text-xs gap-1 bg-red-100 text-red-700 border-red-300">
                                ✘ {item?.status}
                              </p>
                            ) : (
                              ""
                            )}
                          </div>
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
                  {selectedLoanType?.coborrowers && (
                    <>
                      <div className="w-full h-[1px] my-4 bg-gray-200 dark:bg-gray-700"></div>

                      <CardTitle className="text-xl">
                        Co-borrowers Information
                      </CardTitle>

                      <div className="flex justify-between">
                        <span className="text-muted-foreground text-lg">
                          Name
                        </span>
                        <span className="font-medium text-lg">
                          {selectedLoanType?.coborrowers?.first_name}{" "}
                          {selectedLoanType?.coborrowers?.middle_name}{" "}
                          {selectedLoanType?.coborrowers?.last_name}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-muted-foreground text-lg">
                          Approved / Rejected Date
                        </span>
                        <span className="font-medium text-lg">
                          {selectedLoanType?.coborrower_status_date
                            ? format(
                                new Date(
                                  selectedLoanType?.coborrower_status_date,
                                ),
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
                              : selectedLoanType?.coborrower_status ===
                                  "pending"
                                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
                                : selectedLoanType?.coborrower_status ===
                                    "rejected"
                                  ? "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                                  : "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                          }`}
                        >
                          {selectedLoanType?.coborrower_status}
                        </span>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">
                    Payment Sample Computation
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedLoanType?.type?.special_payment_date?.length > 0 && (
                    <>
                      <p className="text-lg font-semibold">Payment Schedule</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {selectedLoanType?.type?.special_payment_date?.map(
                          (item) => (
                            <div
                              key={item.id}
                              className="grid grid-cols-2 gap-4 "
                            >
                              <div className="space-y-2 ">
                                <Label className="text-sm">Payment Date</Label>
                                <p>{item.term_date}</p>
                              </div>
                              <div className="space-y-2 ">
                                <Label className="text-sm">Amount</Label>
                                <p>₱{item.amount?.toLocaleString()}</p>
                              </div>
                            </div>
                          ),
                        )}
                      </div>
                    </>
                  )}
                  {!selectedLoanType?.type?.special_payment_date.length > 0 &&
                    generatedDates &&
                    generatedDates.length > 0 && (
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
