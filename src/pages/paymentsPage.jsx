import { useState, useMemo } from "react";
import AddPaymentDialog from "@/components/addPaymentDialog";
import { Link } from "react-router-dom";
import { useStore } from "@/store/useStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Eye, CreditCard, Download, CalendarDays, Wallet, X } from "lucide-react";
import { format } from "date-fns";
import { money, exportToCSV } from "@/lib/utils";

export function PaymentsPage() {
  const { payments, loans, addPayment } = useStore();
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [methodFilter, setMethodFilter] = useState("all");

  const filteredPayments = useMemo(() => {
    return payments.filter((payment) => {
      const loan = loans.find((l) => l.id === payment.loan_id);
      const matchesSearch =
        String(payment.id ?? "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(payment.loan_id ?? "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        loan?.member_name?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesMethod =
        methodFilter === "all" || payment.payment_method === methodFilter;
      return matchesSearch && matchesMethod;
    });
  }, [payments, loans, searchQuery, methodFilter]);

  const totalAmount = useMemo(() => {
    return filteredPayments.reduce((sum, payment) => sum + (Number(payment.amount) || 0), 0);
  }, [filteredPayments]);

  const getLoanInfo = (loanId) => {
    return loans.find((l) => l.id === loanId);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Payments</h1>
        <p className="text-muted-foreground mt-1">
          View all loan payment transactions
        </p>
        <Button className="mt-3 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700" onClick={() => setPaymentDialogOpen(true)}>Add Payment</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="gap-0 rounded-2xl border border-slate-200/80 py-0 shadow-sm ring-0 dark:border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between gap-3 px-5 pt-5 pb-3">
            <CardTitle className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
              Total Payments
            </CardTitle>
            <span className="rounded-full bg-emerald-50 p-2 text-emerald-600 dark:bg-emerald-950"><CreditCard className="size-4" aria-hidden="true" /></span>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <div className="text-2xl font-semibold tracking-tight tabular-nums">{payments.length}</div>
            <p className="text-xs text-muted-foreground mt-1">All time</p>
          </CardContent>
        </Card>

        <Card className="gap-0 rounded-2xl border border-slate-200/80 py-0 shadow-sm ring-0 dark:border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between gap-3 px-5 pt-5 pb-3">
            <CardTitle className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
              Total Amount
            </CardTitle>
            <span className="rounded-full bg-blue-50 p-2 text-blue-600 dark:bg-blue-950"><Wallet className="size-4" aria-hidden="true" /></span>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <div className="text-2xl font-semibold tracking-tight tabular-nums">
              ₱{totalAmount.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Filtered view</p>
          </CardContent>
        </Card>

        <Card className="gap-0 rounded-2xl border border-slate-200/80 py-0 shadow-sm ring-0 dark:border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between gap-3 px-5 pt-5 pb-3">
            <CardTitle className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
              This Month
            </CardTitle>
            <span className="rounded-full bg-purple-50 p-2 text-purple-600 dark:bg-purple-950"><CalendarDays className="size-4" aria-hidden="true" /></span>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <div className="text-2xl font-semibold tracking-tight tabular-nums">
              {
                payments.filter((p) => {
                  const date = new Date(p.payment_date);
                  const now = new Date();
                  return (
                    date.getMonth() === now.getMonth() &&
                    date.getFullYear() === now.getFullYear()
                  );
                }).length
              }
            </div>
            <p className="text-xs text-muted-foreground mt-1">Payments</p>
          </CardContent>
        </Card>
      </div>

      <Card className="gap-0 rounded-2xl border border-slate-200/80 py-0 shadow-sm ring-0 dark:border-slate-800">
        <CardHeader>
          <CardTitle>All Payments</CardTitle>
          <div className="flex flex-wrap items-center gap-3 xl:flex-1 xl:justify-end">
            <div className="relative min-w-48 flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                aria-label="Search payments"
                placeholder="Search payment, loan, or member..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 rounded-xl pl-9 text-xs"
              />
            </div>
            <Select value={methodFilter} onValueChange={setMethodFilter}>
              <SelectTrigger aria-label="Filter payment method" className="w-[150px] h-9 rounded-xl text-xs">
                <SelectValue placeholder="Filter by method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Methods</SelectItem>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="gcash">GCash</SelectItem>
                <SelectItem value="bank">Bank Transfer</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="ghost" size="icon" aria-label="Clear filters" disabled={!searchQuery && methodFilter === "all"} onClick={() => { setSearchQuery(""); setMethodFilter("all"); }} className="size-9 rounded-xl text-slate-400"><X className="size-4" /></Button>
          </div>
        </CardHeader>
        <CardContent className="px-5 pb-5">
          {filteredPayments.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {searchQuery || methodFilter !== "all"
                  ? "No payments found"
                  : "No payments yet"}
              </p>
            </div>
          ) : (
            <div className="overflow-hidden">
              <Table className="min-w-[760px] text-xs [&_th]:h-12 [&_th]:px-5 [&_th]:text-[10px] [&_th]:uppercase [&_th]:tracking-wide [&_th]:text-slate-400 [&_td]:px-5 [&_td]:py-4 [&_tr]:border-slate-100 dark:[&_tr]:border-slate-800">
                <TableHeader className="bg-slate-50/70 dark:bg-slate-900/50">
                  <TableRow>
                    <TableHead>Payment ID</TableHead>
                    <TableHead>Loan ID</TableHead>
                    <TableHead>Member</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.map((payment) => {
                    const loan = getLoanInfo(payment.loan_id);
                    return (
                      <TableRow key={payment.id}>
                        <TableCell className="font-medium">
                          {payment.id}
                        </TableCell>
                        <TableCell>{payment.loan_id}</TableCell>
                        <TableCell><div className="flex items-center gap-3"><span aria-hidden="true" className="flex size-8 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-[10px] text-slate-500 dark:border-slate-700 dark:bg-slate-800">{(loan?.member_name || "?").split(" ").filter(Boolean).slice(0, 2).map((name) => name.charAt(0)).join("").toUpperCase()}</span><span className="font-medium">{loan?.member_name || "N/A"}</span></div></TableCell>
                        <TableCell className="font-semibold tabular-nums">
                          ₱{payment.amount.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              payment.payment_method === "cash"
                                ? "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                                : payment.payment_method === "gcash"
                                  ? "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400"
                                  : "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                            }`}
                          >
                            {({ cash: "Cash", gcash: "GCash", bank: "Bank Transfer" })[payment.payment_method] || payment.payment_method || "N/A"}
                          </span>
                        </TableCell>
                        <TableCell>
                          {format(
                            new Date(payment.payment_date),
                            "MMM dd, yyyy",
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Link to={`/loans/${payment.loan_id}`}>
                            <Button variant="ghost" size="icon">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              <p aria-live="polite" className="border-t border-slate-100 px-5 py-4 text-[11px] text-slate-500 dark:border-slate-800">Showing {filteredPayments.length} of {payments.length} payments</p>
            </div>
          )}
        </CardContent>
      </Card>
      {paymentDialogOpen && <AddPaymentDialog loans={loans} onClose={() => setPaymentDialogOpen(false)} onSave={addPayment} />}
    </div>
  );
}
