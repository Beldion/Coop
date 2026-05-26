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

const restructuringData = [
  {
    id: "RS-1001",
    member_name: "Juan Dela Cruz",
    loan_name: "Personal Loan",
    original_amount: 25000,
    new_amount: 22000,
    request_date: "2026-05-10",
    status: "approved",
  },
  {
    id: "RS-1002",
    member_name: "Maria Santos",
    loan_name: "Business Loan",
    original_amount: 50000,
    new_amount: 45000,
    request_date: "2026-05-15",
    status: "pending",
  },
  {
    id: "RS-1003",
    member_name: "Pedro Reyes",
    loan_name: "Emergency Loan",
    original_amount: 12000,
    new_amount: 10000,
    request_date: "2026-05-18",
    status: "rejected",
  },
];

function StatusBadge({ status }) {
  const styles = {
    approved: "bg-green-100 text-green-700",
    pending: "bg-yellow-100 text-yellow-700",
    rejected: "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${styles[status]}`}
    >
      {status}
    </span>
  );
}

const RestructuringPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredRequests = useMemo(() => {
    return restructuringData.filter((request) => {
      const matchesSearch =
        request.member_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.loan_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.id.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || request.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [searchQuery, statusFilter]);

  const totalApproved = filteredRequests.filter(
    (request) => request.status === "approved",
  ).length;

  const totalPending = filteredRequests.filter(
    (request) => request.status === "pending",
  ).length;

  const totalRejected = filteredRequests.filter(
    (request) => request.status === "rejected",
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Loan Restructuring</h1>

        <p className="text-muted-foreground mt-1">
          Manage and track loan restructuring requests
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Approved Requests
            </CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-3xl font-bold">{totalApproved}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Pending Requests
            </CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-3xl font-bold">{totalPending}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Rejected Requests
            </CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-3xl font-bold">{totalRejected}</p>
          </CardContent>
        </Card>
      </div>

      {/* Restructuring Table */}
      <Card>
        <CardHeader>
          <CardTitle>Restructuring Requests</CardTitle>

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
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent>
          {filteredRequests.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No restructuring requests found
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Request ID</TableHead>
                    <TableHead>Member</TableHead>
                    <TableHead>Loan Type</TableHead>
                    <TableHead>Original Amount</TableHead>
                    <TableHead>New Amount</TableHead>
                    <TableHead>Request Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {filteredRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell>{request.id}</TableCell>

                      <TableCell>{request.member_name}</TableCell>

                      <TableCell>{request.loan_name}</TableCell>

                      <TableCell>
                        ₱{request.original_amount.toLocaleString()}
                      </TableCell>

                      <TableCell>
                        ₱{request.new_amount.toLocaleString()}
                      </TableCell>

                      <TableCell>{request.request_date}</TableCell>

                      <TableCell>
                        <StatusBadge status={request.status} />
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

export default RestructuringPage;
