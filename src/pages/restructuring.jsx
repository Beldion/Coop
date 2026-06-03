import { useState } from "react";

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

import { Search, RotateCcw } from "lucide-react";
import { toast } from "sonner";

export default function Restructuring() {
  const [searchQuery, setSearchQuery] = useState("");

  const [selectedLoan, setSelectedLoan] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const restructuringLoans = [
    {
      id: "LN-001",
      member: "Juan Dela Cruz",
      loanName: "Personal Loan",
      amount: 50000,
      balance: 22500,
      term: 12,
      status: "Active",
    },
    {
      id: "LN-002",
      member: "Maria Santos",
      loanName: "Emergency Loan",
      amount: 30000,
      balance: 12000,
      term: 6,
      status: "Active",
    },
    {
      id: "LN-003",
      member: "Pedro Reyes",
      loanName: "Business Loan",
      amount: 100000,
      balance: 65000,
      term: 24,
      status: "Active",
    },
  ];

  const filteredLoans = restructuringLoans.filter(
    (loan) =>
      loan.member.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loan.id.toLowerCase().includes(searchQuery.toLowerCase()),
  );

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
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardHeader>

        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Loan ID</TableHead>
                  <TableHead>Member</TableHead>
                  <TableHead>Loan Type</TableHead>
                  <TableHead>Original Amount</TableHead>
                  <TableHead>Remaining Balance</TableHead>
                  <TableHead>Term</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredLoans.map((loan) => (
                  <TableRow key={loan.id}>
                    <TableCell>{loan.id}</TableCell>
                    <TableCell>{loan.member}</TableCell>
                    <TableCell>{loan.loanName}</TableCell>
                    <TableCell>₱{loan.amount.toLocaleString()}</TableCell>
                    <TableCell>₱{loan.balance.toLocaleString()}</TableCell>
                    <TableCell>{loan.term} months</TableCell>
                    <TableCell>{loan.status}</TableCell>

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

                {filteredLoans.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center py-10 text-muted-foreground"
                    >
                      No loans found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Loan Details Modal */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Loan Details</DialogTitle>
            <DialogDescription>
              Review the loan information before restructuring.
            </DialogDescription>
          </DialogHeader>

          {selectedLoan && (
            <div className="space-y-4">
              <div className="border-b pb-2">
                <span className="font-medium">Loan ID:</span> {selectedLoan.id}
              </div>

              <div className="border-b pb-2">
                <span className="font-medium">Member:</span>{" "}
                {selectedLoan.member}
              </div>

              <div className="border-b pb-2">
                <span className="font-medium">Loan Type:</span>{" "}
                {selectedLoan.loanName}
              </div>

              <div className="border-b pb-2">
                <span className="font-medium">Original Amount:</span> ₱
                {selectedLoan.amount.toLocaleString()}
              </div>

              <div className="border-b pb-2">
                <span className="font-medium">Remaining Balance:</span> ₱
                {selectedLoan.balance.toLocaleString()}
              </div>

              <div className="border-b pb-2">
                <span className="font-medium">Term:</span> {selectedLoan.term}{" "}
                months
              </div>

              <div className="border-b pb-2">
                <span className="font-medium">Status:</span>{" "}
                {selectedLoan.status}
              </div>
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
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Restructuring</DialogTitle>
            <DialogDescription>This action cannot be undone.</DialogDescription>
          </DialogHeader>

          {selectedLoan && (
            <div className="space-y-4 py-2">
              <p>Are you sure you want to restructure this loan?</p>

              <div className="rounded-lg border p-4 bg-muted/50">
                <p>
                  <strong>Loan ID:</strong> {selectedLoan.id}
                </p>

                <p>
                  <strong>Member:</strong> {selectedLoan.member}
                </p>

                <p>
                  <strong>Remaining Balance:</strong> ₱
                  {selectedLoan.balance.toLocaleString()}
                </p>
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
      </Dialog>
    </div>
  );
}
