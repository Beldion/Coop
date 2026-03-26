import { useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { useStore } from "@/store/useStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export function LoanDetailsPage() {
  const { loanId } = useParams();
  const { loans, users, payments, addPayment, deletePayment } = useStore();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    amount: "",
    payment_date: new Date().toISOString().split("T")[0],
    payment_method: "cash",
  });

  const loan = useMemo(() => {
    return loans.find((l) => l.id === loanId);
  }, [loans, loanId]);

  const member = useMemo(() => {
    return users.find((u) => u.id === loan?.member_id);
  }, [users, loan]);

  const loanPayments = useMemo(() => {
    return payments
      .filter((p) => p.loan_id === loanId)
      .sort(
        (a, b) =>
          new Date(b.payment_date).getTime() -
          new Date(a.payment_date).getTime(),
      );
  }, [payments, loanId]);

  const totalPaid = useMemo(() => {
    return loanPayments.reduce((sum, payment) => sum + payment.amount, 0);
  }, [loanPayments]);

  const remainingBalance = useMemo(() => {
    if (!loan) return 0;
    const totalWithInterest =
      loan.loan_amount + (loan.loan_amount * loan.interest_rate) / 100;
    return totalWithInterest - totalPaid;
  }, [loan, totalPaid]);

  const handleOpenDialog = () => {
    setFormData({
      amount: "",
      payment_date: new Date().toISOString().split("T")[0],
      payment_method: "cash",
    });
    setDialogOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!loanId) return;

    addPayment({
      loan_id: loanId,
      amount: parseFloat(formData.amount),
      payment_date: new Date(formData.payment_date).toISOString(),
      payment_method: formData.payment_method,
    });

    toast.success("Payment added successfully");
    setDialogOpen(false);
  };

  const handleDeletePayment = (paymentId) => {
    if (window.confirm("Are you sure you want to delete this payment?")) {
      deletePayment(paymentId);
      toast.success("Payment deleted successfully");
    }
  };

  if (!loan) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link to="/loans">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Loan Not Found</h1>
        </div>
      </div>
    );
  }

  const totalWithInterest =
    loan.loan_amount + (loan.loan_amount * loan.interest_rate) / 100;
  const monthlyPayment = totalWithInterest / loan.term_months;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/loans">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Loan Details</h1>
          <p className="text-muted-foreground mt-1">Loan ID: {loan.id}</p>
        </div>
      </div>

      {/* Loan Information */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Loan Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Member</span>
              <span className="font-medium">{member?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Loan Amount</span>
              <span className="font-medium">
                ₱{loan.loan_amount.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Interest Rate</span>
              <span className="font-medium">{loan.interest_rate}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Term</span>
              <span className="font-medium">{loan.term_months} months</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Monthly Payment</span>
              <span className="font-medium">
                ₱
                {monthlyPayment.toLocaleString(undefined, {
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Start Date</span>
              <span className="font-medium">
                {format(new Date(loan.start_date), "MMM dd, yyyy")}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status</span>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  loan.status === "approved"
                    ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                    : loan.status === "pending"
                      ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
                      : loan.status === "rejected"
                        ? "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                        : "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                }`}
              >
                {loan.status}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Principal Amount</span>
              <span className="font-medium">
                ₱{loan.loan_amount.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Interest Amount</span>
              <span className="font-medium">
                ₱
                {(
                  (loan.loan_amount * loan.interest_rate) /
                  100
                ).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Amount Due</span>
              <span className="font-medium">
                ₱{totalWithInterest.toLocaleString()}
              </span>
            </div>
            <div className="border-t pt-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Paid</span>
                <span className="font-medium text-green-600 dark:text-green-400">
                  ₱{totalPaid.toLocaleString()}
                </span>
              </div>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Remaining Balance</span>
              <span className="font-bold text-lg">
                ₱
                {remainingBalance.toLocaleString(undefined, {
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">
                {((totalPaid / totalWithInterest) * 100).toFixed(1)}%
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment History */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Payment History</CardTitle>
            <Button onClick={handleOpenDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Add Payment
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loanPayments.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No payments yet</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Payment ID</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loanPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">
                        {payment.id}
                      </TableCell>
                      <TableCell>₱{payment.amount.toLocaleString()}</TableCell>
                      <TableCell>
                        <span className="capitalize">
                          {payment.payment_method}
                        </span>
                      </TableCell>
                      <TableCell>
                        {format(new Date(payment.payment_date), "MMM dd, yyyy")}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeletePayment(payment.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Payment Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Payment</DialogTitle>
            <DialogDescription>
              Record a new payment for this loan
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (₱)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Remaining balance: ₱
                  {remainingBalance.toLocaleString(undefined, {
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="payment_date">Payment Date</Label>
                <Input
                  id="payment_date"
                  type="date"
                  value={formData.payment_date}
                  onChange={(e) =>
                    setFormData({ ...formData, payment_date: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="payment_method">Payment Method</Label>
                <Select
                  value={formData.payment_method}
                  onValueChange={(value) =>
                    setFormData({ ...formData, payment_method: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="gcash">GCash</SelectItem>
                    <SelectItem value="bank">Bank Transfer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Add Payment</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
