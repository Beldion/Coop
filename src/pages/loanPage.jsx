import { useState, useMemo } from "react";
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
import { useStore } from "@/store/useStore";

export function LoansPage() {
  const { loans, addLoan, updateLoan, deleteLoan } = useStore();

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
    return loans.filter((loan) => {
      const matchesSearch =
        loan.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        loan.loan_name?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || loan.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [loans, searchQuery, statusFilter]);

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

  const handleSubmit = (e) => {
    e.preventDefault();

    const loanData = {
      loan_type: formData.loan_type,
      loan_name: formData.loan_name,
      loan_amount: parseFloat(formData.loan_amount),
      interest_rate: parseFloat(formData.interest_rate),
      term_months: parseInt(formData.term_months),
      service_fee: parseInt(formData.service_fee),
    };

    if (editingLoan) {
      updateLoan(editingLoan.id, loanData);
      toast.success("Loan updated successfully");
    } else {
      addLoan(loanData);
      toast.success("Loan created successfully");
    }

    handleCloseDialog();
  };

  const handleDelete = (loan) => {
    if (window.confirm(`Are you sure you want to delete loan ${loan.id}?`)) {
      deleteLoan(loan.id);
      toast.success("Loan deleted successfully");
    }
  };

  // ✅ ALWAYS 15th & LAST DAY OF MONTH + YEAR
  function generateDates(term) {
    if (!term || term <= 0) return [];

    const dates = [];
    let current = new Date();

    for (let i = 0; i < term; i++) {
      const year = current.getFullYear();
      const month = current.getMonth();

      const lastDayOfMonth = new Date(year, month + 1, 0).getDate();

      let nextDate;

      if (current.getDate() < 15) {
        nextDate = new Date(year, month, 15);
      } else if (current.getDate() < lastDayOfMonth) {
        nextDate = new Date(year, month, lastDayOfMonth);
      } else {
        nextDate = new Date(year, month + 1, 15);
      }

      dates.push(
        nextDate.toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        }),
      );

      current = new Date(nextDate);
      current.setDate(current.getDate() + 1);
    }

    return dates;
  }

  // ✅ Reactive update
  const generatedDates = useMemo(() => {
    return generateDates(parseInt(formData.term_months));
  }, [formData.term_months]);

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
                    <TableHead>Loan ID</TableHead>
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
                      <TableCell>{loan.id}</TableCell>
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
                          <Link to={`/loans/${loan.id}`}>
                            <Button size="icon" variant="ghost">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>

                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleOpenDialog(loan)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>

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
        <DialogContent>
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
                  onValueChange={(value) =>
                    setFormData({ ...formData, loan_type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select loan type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Member Regular Loan">
                      Member Regular Loan
                    </SelectItem>
                    <SelectItem value="Associate Regular Loan">
                      Associate Regular Loan
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Loan Name</Label>
                <Input
                  value={formData.loan_name}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      loan_name: e.target.value,
                    })
                  }
                />
              </div>

              <Label>Loan Amount</Label>
              <Input
                type="number"
                value={formData.loan_amount}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    loan_amount: e.target.value,
                  })
                }
              />

              <Label>Interest</Label>
              <Input
                type="number"
                value={formData.interest_rate}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    interest_rate: e.target.value,
                  })
                }
              />

              <Label>Terms</Label>
              <Input
                type="number"
                value={formData.term_months}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    term_months: e.target.value,
                  })
                }
              />

              {/* ✅ Payment Dates */}
              {generatedDates.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  Payment Dates: {generatedDates.join(", ")}
                </p>
              )}

              <Label>Service Fee %</Label>
              <Input
                type="number"
                value={formData.service_fee}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    service_fee: e.target.value,
                  })
                }
              />
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
