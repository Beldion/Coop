import { useState, useMemo } from "react";
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
import { Search, Eye, TrendingUp, TrendingDown, BookOpen } from "lucide-react";
import { format } from "date-fns";

export function LedgerPage() {
  const { ledger, loans } = useStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const filteredLedger = useMemo(() => {
    return ledger.filter((entry) => {
      const matchesSearch =
        entry.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.loan_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = typeFilter === "all" || entry.type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [ledger, searchQuery, typeFilter]);

  const stats = useMemo(() => {
    const totalDebit = ledger
      .filter((e) => e.type === "debit")
      .reduce((sum, e) => sum + e.amount, 0);
    const totalCredit = ledger
      .filter((e) => e.type === "credit")
      .reduce((sum, e) => sum + e.amount, 0);
    return {
      totalDebit,
      totalCredit,
      balance: totalCredit - totalDebit,
    };
  }, [ledger]);

  const getLoanInfo = (loanId) => {
    return loans.find((l) => l.id === loanId);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Ledger</h1>
        <p className="text-muted-foreground mt-1">
          Complete transaction history and accounting records
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Debits
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              ₱{stats.totalDebit.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Loans disbursed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Credits
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              ₱{stats.totalCredit.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Payments received
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Net Balance
            </CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                stats.balance >= 0
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              ₱{Math.abs(stats.balance).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.balance >= 0 ? "Surplus" : "Outstanding"}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Transactions</CardTitle>
          <div className="flex items-center gap-2 mt-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by ID, loan, or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="debit">Debit</SelectItem>
                <SelectItem value="credit">Credit</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {filteredLedger.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {searchQuery || typeFilter !== "all"
                  ? "No transactions found"
                  : "No transactions yet"}
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Entry ID</TableHead>
                    <TableHead>Loan ID</TableHead>
                    <TableHead>Member</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLedger
                    .sort(
                      (a, b) =>
                        new Date(b.created_at).getTime() -
                        new Date(a.created_at).getTime(),
                    )
                    .map((entry) => {
                      const loan = getLoanInfo(entry.loan_id);
                      return (
                        <TableRow key={entry.id}>
                          <TableCell className="font-medium">
                            {entry.id}
                          </TableCell>
                          <TableCell>{entry.loan_id}</TableCell>
                          <TableCell>{loan?.member_name || "N/A"}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {entry.type === "credit" ? (
                                <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                              ) : (
                                <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
                              )}
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  entry.type === "credit"
                                    ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                                    : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                                }`}
                              >
                                {entry.type}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell
                            className={`font-semibold ${
                              entry.type === "credit"
                                ? "text-green-600 dark:text-green-400"
                                : "text-red-600 dark:text-red-400"
                            }`}
                          >
                            {entry.type === "credit" ? "+" : "-"}₱
                            {entry.amount.toLocaleString()}
                          </TableCell>
                          <TableCell className="max-w-xs truncate">
                            {entry.description}
                          </TableCell>
                          <TableCell>
                            {format(
                              new Date(entry.created_at),
                              "MMM dd, yyyy HH:mm",
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <Link to={`/loans/${entry.loan_id}`}>
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
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
