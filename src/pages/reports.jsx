import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Printer, Search } from "lucide-react";

const reportData = [
  {
    id: "LN-1001",
    member_name: "Juan Dela Cruz",
    loan_name: "Personal Loan",
    amount: 25000,
    due_date: "2026-05-10",
    status: "paid",
  },
  {
    id: "LN-1002",
    member_name: "Maria Santos",
    loan_name: "Business Loan",
    amount: 50000,
    due_date: "2026-05-25",
    status: "upcoming",
  },
  {
    id: "LN-1003",
    member_name: "Pedro Reyes",
    loan_name: "Emergency Loan",
    amount: 12000,
    due_date: "2026-05-01",
    status: "overdue",
  },
];

function StatusBadge({ status }) {
  const styles = {
    paid: "bg-green-100 text-green-700",
    upcoming: "bg-yellow-100 text-yellow-700",
    overdue: "bg-red-100 text-red-700",
  };

  const labels = {
    paid: "Paid",
    upcoming: "Upcoming Due",
    overdue: "Overdue",
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}

function formatCurrency(amount) {
  return `₱${amount.toLocaleString()}`;
}

const ReportsPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [printModalOpen, setPrintModalOpen] = useState(false);

  const filteredReports = useMemo(() => {
    return reportData.filter((loan) => {
      const matchesSearch =
        loan.member_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        loan.loan_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        loan.id.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || loan.status === statusFilter;

      const loanDate = new Date(loan.due_date);
      const fromDate = startDate ? new Date(startDate) : null;
      const toDate = endDate ? new Date(endDate) : null;

      const matchesStartDate = fromDate ? loanDate >= fromDate : true;
      const matchesEndDate = toDate ? loanDate <= toDate : true;

      return (
        matchesSearch && matchesStatus && matchesStartDate && matchesEndDate
      );
    });
  }, [searchQuery, statusFilter, startDate, endDate]);

  const totalPaid = filteredReports.filter(
    (loan) => loan.status === "paid",
  ).length;

  const totalUpcoming = filteredReports.filter(
    (loan) => loan.status === "upcoming",
  ).length;

  const totalOverdue = filteredReports.filter(
    (loan) => loan.status === "overdue",
  ).length;

  const handleClearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setStartDate("");
    setEndDate("");
  };

  const handlePrint = () => {
    const printContent = document.getElementById("print-report-area");

    if (!printContent) return;

    const printWindow = window.open("", "_blank");

    printWindow.document.write(`
      <html>
        <head>
          <title>Loan Reports</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 24px;
              color: #111827;
            }

            table {
              width: 100%;
              border-collapse: collapse;
            }

            th,
            td {
              border: 1px solid #e5e7eb;
              padding: 10px;
              text-align: left;
              font-size: 13px;
            }

            th {
              background: #f9fafb;
            }

            @media print {
              body {
                padding: 0;
              }
            }
          </style>
        </head>

        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">Reports</h1>

          <p className="text-muted-foreground mt-1">
            Track loan payment reports and statuses
          </p>
        </div>

        <Button onClick={() => setPrintModalOpen(true)}>
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
            <p className="text-3xl font-bold">{totalPaid}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Upcoming Due</CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-3xl font-bold">{totalUpcoming}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Overdue Loans</CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-3xl font-bold">{totalOverdue}</p>
          </CardContent>
        </Card>
      </div>

      {/* Reports Table */}
      <Card>
        <CardHeader>
          <CardTitle>Loan Reports</CardTitle>

          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-3 mt-4">
            {/* Search + Status Filter */}
            <div className="flex flex-col md:flex-row gap-3 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />

                <Input
                  placeholder="Search member, loan, or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-10"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[200px] !h-10">
                  <SelectValue placeholder="Filter status" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="upcoming">Upcoming Due</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date Filters + Clear */}
            <div className="flex flex-col md:flex-row gap-3 lg:ml-auto">
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full md:w-[200px] h-10"
              />

              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full md:w-[200px] h-10"
              />

              <Button
                type="button"
                variant="outline"
                onClick={handleClearFilters}
                className="h-10"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {filteredReports.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No reports found</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Loan ID</TableHead>
                    <TableHead>Member</TableHead>
                    <TableHead>Loan Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {filteredReports.map((loan) => (
                    <TableRow key={loan.id}>
                      <TableCell>{loan.id}</TableCell>
                      <TableCell>{loan.member_name}</TableCell>
                      <TableCell>{loan.loan_name}</TableCell>
                      <TableCell>{formatCurrency(loan.amount)}</TableCell>
                      <TableCell>{loan.due_date}</TableCell>
                      <TableCell>
                        <StatusBadge status={loan.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Print Modal */}
      <Dialog open={printModalOpen} onOpenChange={setPrintModalOpen}>
        <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Download CSV Report</DialogTitle>
          </DialogHeader>

          <div id="print-report-area">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Loan ID</TableHead>
                    <TableHead>Member</TableHead>
                    <TableHead>Loan Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {filteredReports.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6}>No reports found</TableCell>
                    </TableRow>
                  ) : (
                    filteredReports.map((loan) => (
                      <TableRow key={loan.id}>
                        <TableCell>{loan.id}</TableCell>
                        <TableCell>{loan.member_name}</TableCell>
                        <TableCell>{loan.loan_name}</TableCell>
                        <TableCell>{formatCurrency(loan.amount)}</TableCell>
                        <TableCell>{loan.due_date}</TableCell>
                        <TableCell>
                          {loan.status === "paid"
                            ? "Paid"
                            : loan.status === "upcoming"
                              ? "Upcoming Due"
                              : "Overdue"}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setPrintModalOpen(false)}>
              Cancel
            </Button>

            <Button onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReportsPage;
