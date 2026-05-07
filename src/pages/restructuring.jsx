import { useState, useMemo, useEffect } from "react";
import { Input } from "@/components/ui/input";
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
import { Search, Plus } from "lucide-react";
import { format } from "date-fns";

// 🔹 Replace with your actual store later
const mockRestructures = [
  {
    id: 1,
    borrower: "Juan Dela Cruz",
    loan_id: "LN-001",
    original_amount: 50000,
    new_amount: 55000,
    term: 12,
    status: "approved",
    created_at: new Date(),
  },
  {
    id: 2,
    borrower: "Maria Santos",
    loan_id: "LN-002",
    original_amount: 30000,
    new_amount: 32000,
    term: 10,
    status: "pending",
    created_at: new Date(),
  },
];

export function RestructuringPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [restructures, setRestructures] = useState([]);

  useEffect(() => {
    // 🔹 Replace with fetchRestructures()
    setRestructures(mockRestructures);
  }, []);

  const filteredData = useMemo(() => {
    return restructures.filter(
      (item) =>
        item.borrower?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.loan_id?.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [restructures, searchQuery]);

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Loan Restructuring</h1>
          <p className="text-muted-foreground mt-1">
            Manage and review loan restructuring requests
          </p>
        </div>

        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Request
        </Button>
      </div>

      {/* Card */}
      <Card>
        <CardHeader>
          <CardTitle>All Restructuring Requests</CardTitle>

          {/* Search */}
          <div className="flex items-center gap-2 mt-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search borrower or loan ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {filteredData.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {searchQuery
                  ? "No restructuring requests found"
                  : "No restructuring requests yet"}
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Loan ID</TableHead>
                    <TableHead>Borrower</TableHead>
                    <TableHead>Original Amount</TableHead>
                    <TableHead>New Amount</TableHead>
                    <TableHead>Term (Months)</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date Requested</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {filteredData.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        {item.loan_id}
                      </TableCell>

                      <TableCell>{item.borrower}</TableCell>

                      <TableCell>
                        ₱ {item.original_amount.toLocaleString()}
                      </TableCell>

                      <TableCell>
                        ₱ {item.new_amount.toLocaleString()}
                      </TableCell>

                      <TableCell>{item.term}</TableCell>

                      <TableCell>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            item.status === "approved"
                              ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                              : item.status === "rejected"
                                ? "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                                : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
                          }`}
                        >
                          {item.status}
                        </span>
                      </TableCell>

                      <TableCell>
                        {format(new Date(item.created_at), "MMM dd, yyyy")}
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
}
