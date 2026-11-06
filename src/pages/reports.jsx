import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";
import { exportToCSV } from "@/lib/utils";
import { useLoans } from "@/api/loans";
import { Printer } from "lucide-react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const PAGE_SIZE = 10;

export default function ReportsPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(100);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

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
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Paid Loans</CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-3xl font-bold">{`totalPaid`}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Upcoming Due</CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-3xl font-bold">{`totalUpcoming`}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Overdue Loans</CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-3xl font-bold">{`totalOverdue`}</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between items-center w-full">
        <div>
          <h1 className="text-2xl font-semibold">Loan Payments</h1>

          <p className="text-sm text-muted-foreground">
            {total} result{total !== 1 ? "s" : ""}
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          disabled={!hasFilters}
          onClick={clearFilters}
        >
          <X className="mr-2 size-4" />
          Clear
        </Button>
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-[1fr_auto_180px_180px_auto]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            type="search"
            className="pl-9"
            placeholder="Search member, employee ID, loan type..."
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Filter status" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="upcoming">Upcoming Due</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
          </SelectContent>
        </Select>

        <Input
          type="date"
          aria-label="Start date"
          value={startDate}
          max={endDate || undefined}
          onChange={(event) => setStartDate(event.target.value)}
        />

        <Input
          type="date"
          aria-label="End date"
          value={endDate}
          min={startDate || undefined}
          onChange={(event) => setEndDate(event.target.value)}
        />
      </div>

      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Member</TableHead>
              <TableHead>Loan Type</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {payments.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-28 text-center text-muted-foreground"
                >
                  No loan payments found.
                </TableCell>
              </TableRow>
            ) : (
              payments.map((payment) => {
                const member = payment.loan?.member;
                const loanType = payment.loan?.loan_type;

                return (
                  <TableRow key={payment.id}>
                    <TableCell>
                      <p className="font-medium">
                        {[
                          member?.first_name,
                          member?.middle_name,
                          member?.last_name,
                        ]
                          .filter(Boolean)
                          .join(" ")}
                      </p>

                      <p className="text-xs text-muted-foreground">
                        {member?.employee_id ?? "No employee ID"}
                      </p>
                    </TableCell>

                    <TableCell>
                      {loanType?.loan_name ?? loanType?.loan_type ?? "N/A"}
                    </TableCell>

                    <TableCell>
                      {payment.payment_date
                        ? new Date(payment.payment_date).toLocaleDateString()
                        : "N/A"}
                    </TableCell>

                    <TableCell>
                      ₱{Number(payment.amount ?? 0).toLocaleString()}
                    </TableCell>

                    <TableCell>{payment.payment_category}</TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Page {totalPages === 0 ? 0 : page} of {totalPages}
          {isFetching ? " — Updating..." : ""}
        </p>

        <div className="flex gap-2">
          <Button
            variant="outline"
            disabled={page <= 1 || isFetching}
            onClick={() => setPage((current) => Math.max(current - 1, 1))}
          >
            Previous
          </Button>

          <Button
            variant="outline"
            disabled={
              totalPages === 0 || page >= totalPages || isPlaceholderData
            }
            onClick={() => setPage((current) => current + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
