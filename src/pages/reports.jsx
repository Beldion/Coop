import { useMemo, useState } from "react";

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

import { Search } from "lucide-react";

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

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${styles[status]}`}
    >
      {status}
    </span>
  );
}

const ReportsPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredReports = useMemo(() => {
    return reportData.filter((loan) => {
      const matchesSearch =
        loan.member_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        loan.loan_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        loan.id.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || loan.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [searchQuery, statusFilter]);

  const totalPaid = filteredReports.filter(
    (loan) => loan.status === "paid",
  ).length;

  const totalUpcoming = filteredReports.filter(
    (loan) => loan.status === "upcoming",
  ).length;

  const totalOverdue = filteredReports.filter(
    (loan) => loan.status === "overdue",
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Reports</h1>

        <p className="text-muted-foreground mt-1">
          Track loan payment reports and statuses
        </p>
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

          <div className="flex flex-col md:flex-row gap-3 mt-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />

              <Input
                placeholder="Search member, loan, or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[200px]">
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

                      <TableCell>₱{loan.amount.toLocaleString()}</TableCell>

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
    </div>
  );
};

export default ReportsPage;
