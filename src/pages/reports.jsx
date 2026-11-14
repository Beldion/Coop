import { useEffect, useState } from "react";
import { CalendarDays, Check, CircleAlert, Eye, Search, X } from "lucide-react";
import { exportToCSV } from "@/lib/utils";
import { useLoans } from "@/api/loans";
import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PaymentDialog from "@/components/paymentDialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { money } from "@/lib/utils";
const PAGE_SIZE = 10;

const summaryCards = [
  {
    status: "paid",
    title: "Paid Loans",
    icon: Check,
    accent:
      "bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400",
    description: "Settled payments",
  },
  {
    status: "upcoming",
    title: "Upcoming Due",
    icon: CalendarDays,
    accent: "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400",
    description: "Scheduled payments",
  },
  {
    status: "overdue",
    title: "Overdue Loans",
    icon: CircleAlert,
    accent: "bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-400",
    description: "Requires collection follow-up",
  },
];

export default function ReportsPage() {
  const [page, setPage] = useState(1);
  const pageSize = PAGE_SIZE;
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [viewedPayment, setViewedPayment] = useState(null);

  // Debounce search
  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 500);

    return () => window.clearTimeout(timeout);
  }, [searchInput]);

  // Return to page 1 whenever dates change
  useEffect(() => {
    setPage(1);
  }, [search, startDate, endDate, pageSize, statusFilter]);

  const { data, error, isError, isLoading, isFetching, isPlaceholderData } =
    useLoans({
      page,
      pageSize,
      search,
      startDate,
      endDate,
      paymentFilter: statusFilter,
    });

  const payments = data?.payments ?? [];
  const total = data?.pagination?.total ?? 0;
  const totalPages = data?.pagination?.totalPages ?? 0;

  console.log("ReportsPage data:", { payments, total, totalPages, error });
  function clearFilters() {
    setSearchInput("");
    setSearch("");
    setStartDate("");
    setEndDate("");
    setPage(1);
    setStatusFilter("all");
  }

  const hasFilters =
    statusFilter !== "all" ||
    searchInput !== "" ||
    startDate !== "" ||
    endDate !== "";

  if (isLoading) {
    return <div className="p-6">Loading payments...</div>;
  }

  if (isError) {
    return <div className="p-6 text-destructive">{error.message}</div>;
  }

  return (
    <div className="space-y-5 p-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">Reports</h1>

          <p className="text-muted-foreground mt-1">
            Track loan payment reports and statuses
          </p>
        </div>

        <Button onClick={() => exportToCSV(payments, "loan_payments.csv")}>
          <Printer className="h-4 w-4 mr-2" />
          Print CSV
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="space-y-2">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {summaryCards.map(
            ({ status, title, icon: Icon, accent, description }) => {
              const matchingPayments = payments.filter((payment) => {
                const category = String(payment.payment_category ?? "")
                  .trim()
                  .toLowerCase();
                return (
                  category === status ||
                  (status === "upcoming" && category === "upcoming due")
                );
              });
              const amount = matchingPayments.reduce((sum, payment) => {
                const value = Number(payment.amount ?? 0);
                return sum + (Number.isFinite(value) ? value : 0);
              }, 0);

              return (
                <Card
                  key={status}
                  className="min-w-0 gap-4 rounded-2xl border border-slate-200/80 py-5 shadow-sm ring-0 dark:border-slate-800"
                >
                  <CardHeader className="flex flex-row items-center justify-between gap-3 px-5">
                    <CardTitle className="text-[11px] font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      {title}
                    </CardTitle>
                    <span
                      className={`flex size-7 shrink-0 items-center justify-center rounded-full ${accent}`}
                    >
                      <Icon className="size-3.5" aria-hidden="true" />
                    </span>
                  </CardHeader>
                  <CardContent className="space-y-2 px-5">
                    <p className="break-words text-[clamp(1.25rem,2.2vw,1.875rem)] font-bold leading-tight tracking-tight text-slate-950 tabular-nums dark:text-slate-50">
                      {money(amount)}
                    </p>
                    <div className="flex items-start gap-2 text-[11px] leading-4">
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 font-medium tabular-nums ${accent}`}
                      >
                        {matchingPayments.length}{" "}
                        {matchingPayments.length === 1 ? "item" : "items"}
                      </span>
                      <span className="pt-0.5 text-slate-500 dark:text-slate-400">
                        {description}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            },
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          Summary of payments on this page.
        </p>
      </div>

      <section
        aria-label="Loan payments"
        className="overflow-hidden rounded-2xl border border-slate-200/80 bg-card shadow-sm dark:border-slate-800"
      >
        <div className="flex justify-between items-center gap-4 px-5 pt-6">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">
              Loan Payments
            </h2>

            <p className="mt-1 text-xs text-muted-foreground">
              {total} result{total !== 1 ? "s" : ""} found across repayment
              schedules
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            disabled={!hasFilters}
            onClick={clearFilters}
            className="h-7 rounded-lg bg-slate-50 px-3 text-[11px] font-normal text-slate-500 dark:bg-slate-900 dark:text-slate-400"
          >
            <X className="size-3" />
            Clear Filters
          </Button>
        </div>

        <div className="grid gap-3 px-5 py-5 sm:grid-cols-2 xl:grid-cols-[minmax(240px,1fr)_145px_285px] [&_input]:h-9 [&_input]:rounded-xl [&_input]:border-slate-200 [&_input]:bg-slate-50/50 [&_input]:text-xs dark:[&_input]:border-slate-800 dark:[&_input]:bg-slate-900/50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

            <Input
              type="search"
              aria-label="Search loan payments"
              className="pl-9"
              placeholder="Search member, employee ID, loan type..."
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger
              aria-label="Filter payment status"
              className="h-9 w-full rounded-xl border-slate-200 bg-slate-50/50 text-xs dark:border-slate-800 dark:bg-slate-900/50"
            >
              <SelectValue placeholder="Filter status" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="upcoming">Upcoming Due</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex min-w-0 items-center gap-2 sm:col-span-2 xl:col-span-1 [&_input]:min-w-0 [&_input]:flex-1">
            <Input
              type="date"
              aria-label="Start date"
              value={startDate}
              max={endDate || undefined}
              onChange={(event) => setStartDate(event.target.value)}
            />

            <span className="text-xs text-slate-400">to</span>
            <Input
              type="date"
              aria-label="End date"
              value={endDate}
              min={startDate || undefined}
              onChange={(event) => setEndDate(event.target.value)}
            />
          </div>
        </div>

        <div>
          <Table aria-busy={isFetching} className="min-w-[760px] text-xs">
            <TableHeader className="bg-slate-50/80 dark:bg-slate-900/50 [&_th]:h-11 [&_th]:px-5 [&_th]:text-[10px] [&_th]:font-semibold [&_th]:uppercase [&_th]:tracking-wider [&_th]:text-slate-500">
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Loan Type</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody className="[&_td]:px-5 [&_td]:py-4 [&_tr]:border-slate-100 dark:[&_tr]:border-slate-800">
              {payments.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-28 text-center text-muted-foreground"
                  >
                    No loan payments found.
                  </TableCell>
                </TableRow>
              ) : (
                payments.map((payment) => {
                  const member = payment.loan?.member;
                  const loanType = payment.loan?.loan_type;
                  const status = String(payment.payment_category ?? "")
                    .trim()
                    .toLowerCase();
                  const statusClass =
                    status === "paid"
                      ? "border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-900 dark:bg-emerald-950"
                      : status === "overdue"
                        ? "border-rose-200 bg-rose-50 text-rose-600 dark:border-rose-900 dark:bg-rose-950"
                        : status === "upcoming" || status === "upcoming due"
                          ? "border-amber-200 bg-amber-50 text-amber-600 dark:border-amber-900 dark:bg-amber-950"
                          : "border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-900";

                  return (
                    <TableRow key={payment.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <span
                            aria-hidden="true"
                            className="flex size-8 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-[10px] text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                          >
                            {[member?.first_name, member?.last_name]
                              .filter(Boolean)
                              .map((name) => name.charAt(0))
                              .join("")
                              .toUpperCase() || "?"}
                          </span>
                          <div>
                            <p className="font-semibold">
                              {[
                                member?.first_name,
                                member?.middle_name,
                                member?.last_name,
                              ]
                                .filter(Boolean)
                                .join(" ")}
                            </p>

                            <p className="mt-1 text-[10px] text-slate-400">
                              {member?.employee_id ?? "No employee ID"}
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <span className="inline-flex rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-[11px] text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-400">
                          {loanType?.loan_name ?? loanType?.loan_type ?? "N/A"}
                        </span>
                      </TableCell>

                      <TableCell className="text-[11px] tabular-nums text-muted-foreground">
                        {payment.payment_date
                          ? new Date(payment.payment_date).toLocaleDateString(
                              "en-US",
                              {
                                month: "2-digit",
                                day: "2-digit",
                                year: "numeric",
                              },
                            )
                          : "N/A"}
                      </TableCell>

                      <TableCell className="font-semibold tabular-nums">
                        {money(Number(payment.amount ?? 0))}
                      </TableCell>

                      <TableCell>
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-1 text-[11px] leading-none ${statusClass}`}
                        >
                          <span
                            aria-hidden="true"
                            className="size-1.5 rounded-full bg-current"
                          />
                          <span className="capitalize">
                            {status === "upcoming due"
                              ? "Upcoming"
                              : status || "Unknown"}
                          </span>
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          {status !== "paid" && (
                            <Button
                              size="sm"
                              type="button"
                              variant="ghost"
                              className="h-7 rounded-lg px-2 text-[11px] font-normal text-slate-500"
                              onClick={() => setSelectedPayment(payment)}
                            >
                              Add Payment
                            </Button>
                          )}

                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label="View payment"
                              onClick={() => setViewedPayment(payment)}
                              className="size-7 rounded-lg text-slate-400"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
          <p aria-live="polite" className="text-[11px] text-muted-foreground">
            Showing {payments.length ? (page - 1) * pageSize + 1 : 0} to{" "}
            {Math.min((page - 1) * pageSize + payments.length, total)} of{" "}
            {total} results
            {isFetching ? " — Updating..." : ""}
          </p>

          <nav
            aria-label="Payments pagination"
            className="flex gap-1.5 [&_button]:h-7 [&_button]:rounded-lg [&_button]:text-[11px] [&_button]:font-normal"
          >
            <Button
              variant="outline"
              disabled={page <= 1 || isFetching}
              onClick={() => setPage((current) => Math.max(current - 1, 1))}
            >
              Previous
            </Button>
            {Array.from(
              { length: Math.min(5, totalPages) },
              (_, index) =>
                Math.max(1, Math.min(page - 2, totalPages - 4)) + index,
            ).map((pageNumber) => (
              <Button
                key={pageNumber}
                variant="ghost"
                aria-label={`Go to page ${pageNumber}`}
                aria-current={page === pageNumber ? "page" : undefined}
                disabled={isFetching}
                onClick={() => setPage(pageNumber)}
                className={`w-7 p-0 ${page === pageNumber ? "bg-slate-900 text-white hover:bg-slate-800 hover:text-white dark:bg-slate-100 dark:text-slate-900" : ""}`}
              >
                {pageNumber}
              </Button>
            ))}

            <Button
              variant="outline"
              disabled={
                totalPages === 0 ||
                page >= totalPages ||
                isPlaceholderData ||
                isFetching
              }
              onClick={() => setPage((current) => current + 1)}
            >
              Next
            </Button>
          </nav>
        </div>
      </section>
      {selectedPayment && (
        <PaymentDialog
          key={selectedPayment.id}
          payment={selectedPayment}
          onClose={() => setSelectedPayment(null)}
        />
      )}
      {viewedPayment && (
        <PaymentDialog
          key={`view-${viewedPayment.id}`}
          payment={viewedPayment}
          readOnly
          onClose={() => setViewedPayment(null)}
        />
      )}
    </div>
  );
}
