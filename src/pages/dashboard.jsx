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
import { userLoanStore, useSearchUsersStore } from "@/store/useStore";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Search, Pencil, Trash2, Edit, Save, X, Eye } from "lucide-react";

import { generateDates } from "@/lib/utils";
import { toast } from "sonner";
import { format } from "date-fns";
import { Label } from "@/components/ui/label";
export default function Dashboard() {
  const {
    userLoans,
    fetchUserLoan,
    userLoanTypes,
    createUserLoan,
    fetchUserLoanTypes,
  } = userLoanStore();

  const { users, search, loading, setSearch, fetchUsers } =
    useSearchUsersStore();
  const [selectedLoanType, setSelectedLoanType] = useState(null);

  useEffect(() => {
    fetchUserLoanTypes();
    fetchUserLoan();
  }, [fetchUserLoanTypes, fetchUserLoan, userLoans]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers(search);
    }, 500);

    return () => clearTimeout(timer);
  }, [search, fetchUsers]);

  useEffect(() => {
    fetchUsers("");
  }, [fetchUsers]);

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

    if (selectedLoanType.accepted !== true) {
      toast.error(
        "You must accept the terms and conditions to apply for this loan",
      );
      return;
    }
    const res = await createUserLoan(
      selectedLoanType.loan_id,
      selectedLoanType.coborrower,
      selectedLoanType.accepted,
    );

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
                <p className="text-muted-foreground">No loans available</p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Amount</TableHead>
                      <TableHead>Loan Name</TableHead>
                      <TableHead>Loan Type</TableHead>

                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {userLoanTypes.map((item) => (
                      <TableRow key={item.loan_id}>
                        <TableCell className="font-medium text-lg">
                          ₱{item.loan_amount.toLocaleString()}
                        </TableCell>
                        <TableCell className="font-medium">
                          {item.loan_name}
                        </TableCell>

                        <TableCell className="font-medium">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              item.loan_type === "Member"
                                ? "bg-green-100 text-green-700 border-green-300"
                                : item.loan_type === "Associate"
                                  ? "bg-blue-100 text-blue-700 border-blue-300"
                                  : "bg-purple-100 text-purple-700 border-purple-300"
                            }`}
                          >
                            {item.loan_type}
                          </span>
                        </TableCell>

                        <TableCell>
                          <div className="flex  gap-2">
                            {item.isStatus == "pending" ? (
                              <p className="flex rounded-full px-2.5 py-0.5 text-xs gap-1 bg-yellow-100 text-yellow-700 border-yellow-300">
                                {item.isStatus}
                              </p>
                            ) : item.isStatus == "approved" ? (
                              <p className="flex rounded-full px-2.5 py-0.5 text-xs gap-1 bg-green-100 text-green-700 border-green-300">
                                {item.isStatus}
                              </p>
                            ) : item.isStatus == "rejected" ? (
                              <p className="flex rounded-full px-2.5 py-0.5 text-xs gap-1 bg-red-100 text-red-700 border-red-300">
                                ✘ {item.isStatus}
                              </p>
                            ) : (
                              ""
                            )}
                          </div>
                        </TableCell>

                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            {item.isStatus ? (
                              ""
                            ) : (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleOpenDialog(item)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            )}
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
        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>Your Loans</CardTitle>
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
            <div className="space-y-4">
              <Label htmlFor="search" className="text-sm">
                Search for co-borrower (optional)
              </Label>
              <Input
                placeholder="Search user..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              {loading ? (
                <p>Loading...</p>
              ) : (
                <div className="space-y-2">
                  {users.map((user) => (
                    <div
                      key={user.id}
                      className={`flex items-center gap-4 border rounded-lg p-3 cursor-pointer hover:bg-muted ${user.id === selectedLoanType?.coborrower ? "bg-muted" : ""}`}
                      onClick={() => {
                        setSelectedLoanType((prev) => ({
                          ...prev,
                          coborrower: user.id,
                        }));
                        console.log("selected coborrower", selectedLoanType);
                      }}
                    >
                      <p>
                        {user.first_name} {user.middle_name} {user.last_name}
                      </p>
                      <p>{user.email}</p>
                      <p>{user.role}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
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
                      <p key={index} className="py-0.5">
                        {range}
                      </p>
                    ))
                )}
              </div>
            )}

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Checkbox
                  id="terms"
                  required
                  checked={selectedLoanType?.accepted || false}
                  onCheckedChange={(checked) =>
                    setSelectedLoanType((prev) => ({
                      ...prev,
                      accepted: checked,
                    }))
                  }
                />

                <label htmlFor="terms" className="text-md ">
                  I agree to the
                  <Dialog>
                    <DialogTrigger>
                      <button
                        type="button"
                        className="text-blue-600 underline hover:text-blue-800"
                      >
                        Terms and Conditions
                      </button>
                    </DialogTrigger>

                    <DialogContent className="max-w-lg">
                      <DialogHeader>
                        <DialogTitle>Terms and Conditions</DialogTitle>
                        <DialogDescription>
                          Please read these terms carefully before continuing.
                        </DialogDescription>
                      </DialogHeader>

                      <div className="max-h-[400px] overflow-y-auto text-sm text-gray-700 space-y-3">
                        <p>
                          By using this service, you agree to comply with all
                          applicable rules and policies.
                        </p>
                        <p>
                          Your information will be handled according to our
                          privacy policy.
                        </p>
                        <p>
                          We may update these terms from time to time without
                          prior notice.
                        </p>
                      </div>
                    </DialogContent>
                  </Dialog>
                </label>
              </div>
            </div>

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
