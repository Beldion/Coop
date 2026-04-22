import React, { useEffect, useMemo, useState } from "react";
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
import { useCoBorrowerStore } from "@/store/useStore";
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
import { format, set } from "date-fns";
import { Label } from "@/components/ui/label";
import { se } from "date-fns/locale";
export default function CoBorrowersPage() {
  const { coBorrowers, rejectLoans, approveLoans, fetchCoborrowerLoan } =
    useCoBorrowerStore();
  const [selectedLoanType, setSelectedLoanType] = useState(null);
  const [rejectConfirm, setRejectConfirm] = useState(false);
  const [approveConfirm, setApproveConfirm] = useState(false);

  useEffect(() => {
    fetchCoborrowerLoan();
  }, [fetchCoborrowerLoan, rejectLoans, approveLoans]);

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
      const res = approveLoans(selectedLoanType.loan_id, "approved");

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
      const res = rejectLoans(selectedLoanType.loan_id, "rejected");

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
            {coBorrowers.length === 0 ? (
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
                    {coBorrowers.map((item) => (
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
                            {item.coborrower_status == "pending" ? (
                              <p className="flex rounded-full px-2.5 py-0.5 text-xs gap-1 bg-yellow-100 text-yellow-700 border-yellow-300">
                                {item.coborrower_status}
                              </p>
                            ) : item.coborrower_status == "approved" ? (
                              <p className="flex rounded-full px-2.5 py-0.5 text-xs gap-1 bg-green-100 text-green-700 border-green-300">
                                {item.coborrower_status}
                              </p>
                            ) : item.coborrower_status == "rejected" ? (
                              <p className="flex rounded-full px-2.5 py-0.5 text-xs gap-1 bg-red-100 text-red-700 border-red-300">
                                ✘ {item.coborrower_status}
                              </p>
                            ) : (
                              ""
                            )}
                          </div>
                        </TableCell>

                        <TableCell>
                          {format(new Date(item.created_at), "MMM dd, yyyy")}
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
              onClick={handleReject}
              className="bg-red-600 hover:bg-red-700"
            >
              YES
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
              onClick={handleApprove}
              className="bg-green-600 hover:bg-green-700"
            >
              YES
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
