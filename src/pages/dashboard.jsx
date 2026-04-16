import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { userLoanStore } from "@/store/useStore";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Search, Pencil, Trash2, Edit, Save, X, Eye } from "lucide-react";

import { generateDates } from "@/lib/utils";
import { toast } from "sonner";
import { format } from "date-fns";
export default function Dashboard() {
  const {
    userLoans,
    fetchUserLoan,
    userLoanTypes,
    createUserLoan,
    fetchUserLoanTypes,
  } = userLoanStore();

  const [selectedLoanType, setSelectedLoanType] = useState(null);

  useEffect(() => {
    fetchUserLoanTypes();
    fetchUserLoan();
  }, [fetchUserLoanTypes, fetchUserLoan, userLoans]);

  const handleCloseDialog = () => {
    setSelectedLoanType(null);
  };

  const handleOpenDialog = (item) => {
    console.log(item);
    setSelectedLoanType({
      loan_id: item.id,
      loan_name: item.loan_name,
      loan_type: item.loan_type,
      loan_amount: item.loan_amount,
      interest_rate: item.interest_rate,
      service_fee: item.service_fee,
      term_months: item.term_months,
    });
  };

  const generatedDates = useMemo(() => {
    if (selectedLoanType) {
      const {
        service_fee,
        loan_amount,
        interest_rate,
        term_months,
        loan_type,
      } = selectedLoanType;

      console.log("test", term_months);
      return generateDates(
        service_fee,
        loan_amount,
        interest_rate,
        term_months,
        loan_type,
      );
    }
  }, [selectedLoanType]);

  const handleApplyLoan = async () => {
    if (!selectedLoanType) return;
    const res = await createUserLoan(selectedLoanType.loan_id);

    console.log("create loan res", res);
    if (res.error) {
      toast.error(res.error.message || "Failed to create loan");
      return;
    } else {
      toast.success("Loan created successfully");
      setSelectedLoanType(null);
    }

    // closed dialog and reset selected loan type
  };

  return (
    <div className="w-full">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Overview of your cooperative lending operations
          </p>
        </div>

        {/* Available Loans */}

        <Card>
          <CardHeader>
            <CardTitle>Available Loans</CardTitle>
          </CardHeader>

          <CardContent>
            {userLoanTypes.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No available loans</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                {userLoanTypes.map((loanType) => (
                  <Card key={loanType.id} className="border">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-2xl font-medium text-muted-foreground">
                        {loanType.loan_name}
                      </CardTitle>
                      <CardTitle className="text-lg font-medium text-muted-foreground">
                        {loanType.loan_type}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        ₱{loanType.loan_amount.toLocaleString()}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Loan Amount
                      </p>
                    </CardContent>
                    <CardFooter className="mt-auto">
                      {loanType.isApplied ? (
                        <Button
                          variant="outline"
                          size="lg"
                          className="w-full bg-orange-100 text-orange-800"
                          disabled
                        >
                          Already Applied
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="lg"
                          className="w-full"
                          onClick={() => handleOpenDialog(loanType)}
                        >
                          Apply Loan
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>Loans</CardTitle>
          </CardHeader>
          <CardContent>
            {userLoans.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No loans available</p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Loan Name</TableHead>
                      <TableHead>Loan Type</TableHead>
                      <TableHead>Approve By</TableHead>
                      <TableHead>Co-borrower</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created at</TableHead>

                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {userLoans.map((loan) => (
                      <TableRow key={loan.id}>
                        <TableCell className="font-medium">Loan Name</TableCell>

                        <TableCell className="font-medium">
                          loan type name
                        </TableCell>
                        <TableCell>{loan.approver_id}</TableCell>
                        <TableCell>Co borrower name</TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              loan.status === "admin"
                                ? "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400"
                                : loan.status === "staff"
                                  ? "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                                  : "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                            }`}
                          >
                            {loan.status}
                          </span>
                        </TableCell>

                        <TableCell>
                          {format(new Date(loan.created_at), "MMM dd, yyyy")}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              // onClick={() => handleOpenDialog(user)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {/* <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(user)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button> */}
                          </div>
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

      <Dialog open={selectedLoanType} onOpenChange={setSelectedLoanType}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-3xl">
              Are you sure you want to apply for this loan?{" "}
            </DialogTitle>
          </DialogHeader>

          <div className="flex gap-4 flex-col">
            <p className="text-lg pb-2 border-b boder-muted-foreground">
              Loan Name: {selectedLoanType?.loan_name}
            </p>
            <p className="text-lg pb-2 border-b boder-muted-foreground">
              Loan Type: {selectedLoanType?.loan_type}
            </p>
            <p className="text-lg pb-2 border-b boder-muted-foreground">
              Loan Amount: ₱{selectedLoanType?.loan_amount?.toLocaleString()}
            </p>
            <p className="text-lg pb-2 border-b boder-muted-foreground ">
              Loan Interest: {selectedLoanType?.interest_rate}%
            </p>
            <p className="text-lg pb-2 border-b boder-muted-foreground">
              Service Fee: {selectedLoanType?.service_fee}%
            </p>

            {generatedDates && generatedDates.length > 0 && (
              <div className="text-sm text-muted-foreground">
                <p className="mb-2 text-md">Sample Computations:</p>

                {generatedDates.length === 1 ? (
                  <p>{generatedDates[0]}</p>
                ) : (
                  generatedDates
                    .reduce((acc, curr, i) => {
                      if (i % 2 === 0) {
                        const next = generatedDates[i + 1];
                        acc.push(next ? `${curr}, ${next}` : curr); // fallback if odd
                      }
                      return acc;
                    }, [])
                    .map((range, index) => (
                      <p className="py-0.5" key={index}>
                        {range}
                      </p>
                    ))
                )}
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={handleCloseDialog}>
                Cancel
              </Button>

              <Button onClick={handleApplyLoan}>Apply this Loan</Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
