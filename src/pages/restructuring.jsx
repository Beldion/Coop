import { useState, useEffect } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
} from "@/components/ui/dialog";
import Decimal from "decimal.js";
import { useDebounce } from "@/hooks/useDebounce";
import { format } from "date-fns";
import { Search, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { useFetchAllLoans } from "@/api/loans";
import LoanSummary from "@/components/restructuring/loanSummary";

export default function Restructuring() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [isDebouncing, setIsDebouncing] = useState(false);

  const pageSize = 10;
  const debouncedSearch = useDebounce(search, 500);

  const { data, isLoading, isFetching } = useFetchAllLoans({
    search: debouncedSearch,
    page,
    pageSize,
  });

  useEffect(() => {
    setIsDebouncing(true);

    const timer = setTimeout(() => {
      setIsDebouncing(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  const loans = data?.loans || [];
  const totalPages = data?.totalPages || 1;
  console.log("loans for restructuring", loans, isLoading);

  const [selectedLoan, setSelectedLoan] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  {
    isDebouncing && (
      <p className="text-sm text-muted-foreground">Waiting to search...</p>
    );
  }

  {
    !isDebouncing && isFetching && (
      <p className="text-sm text-muted-foreground">Searching...</p>
    );
  }
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Loan Restructuring</h1>
        <p className="text-muted-foreground mt-1">
          Reset active loans for restructuring
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Restructuring List</CardTitle>

          <div className="relative mt-4 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />

            <Input
              placeholder="Search member or loan ID..."
              className="pl-9"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
        </CardHeader>

        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Original Amount</TableHead>
                  <TableHead>Member</TableHead>
                  <TableHead>Loan Type</TableHead>

                  <TableHead>Remaining Balance</TableHead>
                  <TableHead>Term</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center py-10 text-muted-foreground"
                    >
                      Loading loans...
                    </TableCell>
                  </TableRow>
                ) : (
                  <>
                    {loans &&
                      loans.map((loan) => (
                        <TableRow key={loan?.id}>
                          <TableCell>
                            ₱{loan?.loan_type?.loan_amount?.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            {loan?.member?.first_name}{" "}
                            {loan?.member?.middle_name}{" "}
                            {loan?.member?.last_name}
                          </TableCell>
                          <TableCell>{loan?.loan_type?.loan_name}</TableCell>

                          <TableCell>
                            ₱
                            {loan.loan_payments
                              .reduce(
                                (sum, payment) =>
                                  sum
                                    .plus(payment.amount || 0)
                                    .minus(payment.amount_paid || 0),
                                new Decimal(0),
                              )
                              .toNumber()
                              .toLocaleString()}
                          </TableCell>
                          <TableCell>{loan?.loan_type?.term_months} </TableCell>
                          <TableCell>{loan?.loan?.status}</TableCell>

                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              onClick={() => {
                                setSelectedLoan(loan);
                                setDetailsOpen(true);
                              }}
                            >
                              <RotateCcw className="h-4 w-4 mr-2" />
                              Restructure Loan
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}

                    {loans && loans.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={8}
                          className="text-center py-10 text-muted-foreground"
                        >
                          No loans found
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Loan Details Modal */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Loan Details</DialogTitle>
            <DialogDescription>
              Review the loan information before restructuring.
            </DialogDescription>
          </DialogHeader>

          {selectedLoan && (
            <div className="space-y-4">
              <div className="border-b pb-2">
                <span className="font-medium">Loan name:</span>{" "}
                {selectedLoan?.loan_type?.loan_name}
              </div>

              <div className="border-b pb-2">
                <span className="font-medium">Member:</span>{" "}
                {selectedLoan?.member?.first_name}{" "}
                {selectedLoan?.member?.middle_name}{" "}
                {selectedLoan?.member?.last_name}
              </div>

              <div className="border-b pb-2">
                <span className="font-medium">Loan Type:</span>{" "}
                {selectedLoan?.loan_type?.loan_type}
              </div>

              <div className="border-b pb-2">
                <span className="font-medium">Original Amount:</span> ₱
                {selectedLoan?.loan_type?.loan_amount?.toLocaleString()}
              </div>

              <div className="border-b pb-2">
                <span className="font-medium">Remaining Balance:</span>₱
                {selectedLoan?.loan_payments
                  .reduce(
                    (sum, payment) =>
                      sum
                        .plus(payment.amount || 0)
                        .minus(payment.amount_paid || 0),
                    new Decimal(0),
                  )
                  .toNumber()
                  .toLocaleString()}
              </div>

              <div className="border-b pb-2">
                <span className="font-medium">Term:</span>{" "}
                {selectedLoan?.loan_type?.term_months}
              </div>

              <div className="border-b pb-2">
                <span className="font-medium">Status:</span>{" "}
                {selectedLoan?.status}
              </div>

              {/* Payment History */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Payment Schedule</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  {selectedLoan?.loan_payments.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground">
                        No payments schedule yet
                      </p>
                    </div>
                  ) : (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="font-bold">Amount</TableHead>
                            <TableHead className="font-bold">
                              Payment Method
                            </TableHead>
                            <TableHead className="font-bold">
                              Payment Reference
                            </TableHead>
                            <TableHead className="font-bold">
                              Paid Date
                            </TableHead>

                            <TableHead className="font-bold">
                              Due Date
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedLoan?.loan_payments.map((payment) => (
                            <TableRow key={payment.id}>
                              <TableCell className="text-xl font-medium">
                                {payment.amount.toLocaleString()}
                              </TableCell>
                              <TableCell>
                                <span className="capitalize">
                                  {payment?.payment_method}
                                </span>
                              </TableCell>
                              <TableCell>
                                <span className="capitalize">
                                  {payment?.reference}
                                </span>
                              </TableCell>

                              <TableCell>
                                {payment?.paid_date &&
                                  format(
                                    new Date(payment?.paid_date),
                                    "MMM dd, yyyy",
                                  )}
                              </TableCell>
                              <TableCell>
                                {format(
                                  new Date(payment?.payment_date),
                                  "MMM dd, yyyy",
                                )}
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
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailsOpen(false)}>
              Cancel
            </Button>

            <Button
              onClick={() => {
                setDetailsOpen(false);
                setConfirmOpen(true);
              }}
            >
              Continue Restructuring
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Modal */}
      <LoanSummary
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        loan={selectedLoan}
      />
      {/* <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Restructuring</DialogTitle>
            <DialogDescription>This action cannot be undone.</DialogDescription>
          </DialogHeader>

          {selectedLoan && (
            <div className="space-y-4 py-2">
              <p>Are you sure you want to restructure this loan?</p>

              <div className="rounded-lg border p-4 bg-muted/50">
                <p>Approved Loan Amount ₱100,000.00</p>
                <p>Cash Out Deductions</p>

                <p>Old Loan remaining balance ₱65,000.00</p>
                <p>Net Cash Released ₱64,000.00</p>
                <p>Principal ₱100,000.00</p>
                <p>Interest ₱5,000.00</p>
                <p>Service Fee ₱2,000.00</p>
                <p>Total Amount to Repay ₱114,000.00</p>
                <p>Semi-Monthly Payment (12 months)</p>
              </div>

              <p className="text-sm text-muted-foreground">
                The current loan schedule will be reset and a new restructuring
                record will be created based on the remaining balance.
              </p>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setConfirmOpen(false);
                setDetailsOpen(true);
              }}
            >
              Back
            </Button>

            <Button
              onClick={() => {
                console.log("Restructuring Loan:", selectedLoan);

                setConfirmOpen(false);

                toast.success("Loan restructured successfully");
              }}
            >
              Confirm Restructure
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog> */}
    </div>
  );
}
