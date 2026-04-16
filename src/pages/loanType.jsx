import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { Plus, Search, Eye, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useLoanTypeStore } from "@/store/useStore";
import { generateDates } from "@/lib/utils";

export function LoanType() {
  const { loanTypes, fetchLoanTypes, updateArchive, createLoanType } =
    useLoanTypeStore();

  useEffect(() => {
    fetchLoanTypes();
  }, [fetchLoanTypes]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLoan, setEditingLoan] = useState(null);

  const [formData, setFormData] = useState({
    loan_type: "",
    loan_name: "",
    loan_amount: "",
    interest_rate: "",
    term_months: "",
    service_fee: "",
  });

  const filteredLoans = useMemo(() => {
    return loanTypes.filter((loan) => {
      const matchesSearch = loan.loan_name
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || loan.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [loanTypes, searchQuery, statusFilter]);

  const handleOpenDialog = (loan) => {
    if (loan) {
      setEditingLoan(loan);
      setFormData({
        loan_type: loan.loan_type || "",
        loan_name: loan.loan_name || "",
        loan_amount: loan.loan_amount.toString(),
        interest_rate: loan.interest_rate.toString(),
        term_months: loan.term_months.toString(),
        service_fee: loan.service_fee.toString(),
      });
    } else {
      setEditingLoan(null);
      setFormData({
        loan_type: "",
        loan_name: "",
        loan_amount: "",
        interest_rate: "",
        term_months: "",
        service_fee: "",
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingLoan(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const loanData = {
      loan_type: formData.loan_type,
      loan_name: formData.loan_name,
      loan_amount: parseFloat(formData.loan_amount),
      interest_rate: parseFloat(formData.interest_rate),
      term_months: parseInt(formData.term_months),
      service_fee: parseInt(formData.service_fee),
    };

    const res = await createLoanType(loanData);

    if (res.error) {
      toast.error(res.error.message || "Failed to create loan");
      return;
    } else {
      toast.success("Loan created successfully");
    }
    handleCloseDialog();
  };

  const handleDelete = async (loan) => {
    if (
      window.confirm(`Are you sure you want to delete loan ${loan.loan_name}?`)
    ) {
      const res = await updateArchive(loan.id);
      if (res.error) {
        toast.error(res.error.message || "Failed to delete loan");
        return;
      } else {
        toast.success("Loan deleted successfully");
      }
    }
  };

  // ✅ Reactive update

  const handleOnChange = (field, value) => {
    const updatedFormData = { ...formData, [field]: value };
    setFormData(updatedFormData);
  };

  const generatedDates = useMemo(() => {
    const { service_fee, loan_amount, interest_rate, term_months, loan_type } =
      formData;
    return generateDates(
      service_fee,
      loan_amount,
      interest_rate,
      term_months,
      loan_type,
    );
  }, [formData]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Loans</h1>
          <p className="text-muted-foreground mt-1">
            Manage loan applications and disbursements
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Create Loan
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Loans</CardTitle>

          <div className="flex items-center gap-2 mt-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                required
                placeholder="Search by loan ID or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {filteredLoans.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {searchQuery || statusFilter !== "all"
                  ? "No loans found"
                  : "No loans yet"}
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Interest</TableHead>
                    <TableHead>Term</TableHead>
                    <TableHead>Service fee</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {filteredLoans.map((loan) => (
                    <TableRow key={loan.id}>
                      <TableCell>{loan.loan_name}</TableCell>
                      <TableCell>{loan.loan_type}</TableCell>
                      <TableCell>
                        ₱{loan.loan_amount.toLocaleString()}
                      </TableCell>
                      <TableCell>{loan.interest_rate}%</TableCell>
                      <TableCell>{loan.term_months} months</TableCell>
                      <TableCell>{loan.service_fee}%</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleDelete(loan)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingLoan ? "Edit Loan" : "Create Loan"}
            </DialogTitle>
            <DialogDescription>Fill in loan details</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Loan Type</Label>
                <Select
                  value={formData.loan_type}
                  onValueChange={(value) => handleOnChange("loan_type", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select loan type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Member">Member </SelectItem>
                    <SelectItem value="Associate">Associate</SelectItem>
                    <SelectItem value="Special">Special</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Loan Name</Label>
                <Input
                  required
                  value={formData.loan_name}
                  onChange={(e) => handleOnChange("loan_name", e.target.value)}
                />
              </div>

              <Label>Loan Amount</Label>
              <Input
                type="number"
                min="0"
                required
                value={formData.loan_amount}
                onChange={(e) => handleOnChange("loan_amount", e.target.value)}
              />

              <Label>Interest</Label>
              <Input
                type="number"
                min="0"
                required
                value={formData.interest_rate}
                onChange={(e) =>
                  handleOnChange("interest_rate", e.target.value)
                }
              />

              <Label>Terms</Label>
              <Input
                type="number"
                min="0"
                required
                value={formData.term_months}
                onChange={(e) => handleOnChange("term_months", e.target.value)}
              />

              <Label>Service Fee %</Label>
              <Input
                type="number"
                min="0"
                required
                value={formData.service_fee}
                onChange={(e) => handleOnChange("service_fee", e.target.value)}
              />

              {/* ✅ Payment Dates */}
              {generatedDates.length > 0 && (
                <div className="text-sm text-muted-foreground">
                  <p>Sample Computations:</p>

                  {generatedDates.length === 1 ? (
                    <p>{generatedDates[0]}</p>
                  ) : (
                    generatedDates
                      .reduce((acc, curr, i) => {
                        if (i % 2 === 0) {
                          const next = generatedDates[i + 1];
                          acc.push(next ? `${curr} - ${next}` : curr); // fallback if odd
                        }
                        return acc;
                      }, [])
                      .map((range, index) => <p key={index}>{range}</p>)
                  )}
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleCloseDialog}>
                Cancel
              </Button>
              <Button type="submit">{editingLoan ? "Update" : "Create"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
