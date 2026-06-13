import { useState, useMemo, useEffect } from "react";

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
import { generateDates } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  useAllLoanTypes,
  useArchiveLoanTypes,
  useCreateLoanTypes,
  useCreateSpecialPaymentDates,
} from "@/api/loanType";

export function LoanType() {
  const { data: loanTypes, isError, isLoading } = useAllLoanTypes();
  const updateArchive = useArchiveLoanTypes();
  const createLoanType = useCreateLoanTypes();
  const createSpecialPaymentDates = useCreateSpecialPaymentDates();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedLoanType, setSelectedLoanType] = useState(null);
  const [saveConfirm, setSaveConfirm] = useState(false);
  const [editingLoan, setEditingLoan] = useState(null);

  const [formData, setFormData] = useState({
    loan_type: "",
    loan_name: "",
    loan_amount: "",
    interest_rate: "",
    term_months: "",
    service_fee: "",
    special_dates: [],
  });

  const filteredLoans = useMemo(() => {
    return loanTypes?.filter((loan) => {
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
        special_dates: loan?.special_dates || [],
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
        special_dates: [],
      });
    }
    setDialogOpen(true);
  };

  const handleViewDialog = (item) => {
    console.log(item);
    setSelectedLoanType({
      loan_id: item.id,
      loan_name: item.loan_name,
      loan_type: item.loan_type,
      loan_amount: item.loan_amount,
      interest_rate: item.interest_rate,
      service_fee: item.service_fee,
      term_months: item.term_months,
      special_dates: item?.special_payment_date || [],
    });
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

    const res = await createLoanType.mutateAsync(loanData);

    if (res.error) {
      toast.error(res.error.message || "Failed to create loan");
      return;
    } else {
      if (res[0].loan_type === "Special") {
        const payload = formData.special_dates.map((item, index) => ({
          loan_type: res[0].id, // FK from newly created loan type
          term_number: index + 1,
          term_date: item.value,
          amount: item.amount, // fallback to computed if not set
        }));

        const resSpecial = await createSpecialPaymentDates.mutateAsync(payload);

        if (resSpecial.error) {
          toast.error(
            resSpecial.error.message ||
              "Failed to create special payment dates",
          );

          console.log(resSpecial.error);
          return;
        }
      }
      toast.success("Loan created successfully");
    }
    handleCloseDialog();
    setSaveConfirm(false);
  };

  const handleDelete = async (loan) => {
    if (
      window.confirm(`Are you sure you want to delete loan ${loan.loan_name}?`)
    ) {
      const res = await updateArchive.mutateAsync(loan.id);
      if (res.error) {
        toast.error(res.error.message || "Failed to delete loan");
        return;
      } else {
        toast.success("Loan deleted successfully");
      }
    }
  };

  useEffect(() => {
    if (formData.loan_type !== "Special") return;

    const count = Number(formData.term_months);

    const monthlyPayment =
      (Number(formData.loan_amount) * (Number(formData.interest_rate) / 100) +
        Number(formData.loan_amount)) /
      count;

    const newSpecialDates = Array.from({ length: count }, (_, index) => ({
      index,
      value: formData.special_dates?.[index]?.value || "",
      amount: monthlyPayment,
    }));

    setFormData((prev) => {
      // Only update if the array actually changed
      if (
        JSON.stringify(prev.special_dates) === JSON.stringify(newSpecialDates)
      ) {
        return prev; // No change, skip re-render
      }

      return {
        ...prev,
        special_dates: newSpecialDates,
      };
    });
  }, [
    formData.loan_type,
    formData.term_months,
    formData.loan_amount,
    formData.interest_rate,
  ]);

  // ✅ Reactive update

  const handleOnChange = (field, value) => {
    const updatedFormData = { ...formData, [field]: value };

    setFormData(updatedFormData);
  };

  //confirm Handler

  const saveConfirmHandler = () => {
    const hasEmptyField = (formData) => {
      return Object.entries(formData).some(([key, value]) => {
        if (key === "special_dates") {
          return value.some((item) => !item.value?.toString().trim());
        }

        return !value?.toString().trim();
      });
    };

    if (hasEmptyField(formData)) {
      console.log("Form data has empty fields:", formData);
      toast.error("Please fill in all required fields");
      return;
    }
    console.log("Form data is valid:", formData);
    setSaveConfirm(true);
  };

  const generatedDates = useMemo(() => {
    const { service_fee, loan_amount, interest_rate, term_months, loan_type } =
      selectedLoanType || formData;
    if (loan_type === "Special") return [];
    return generateDates(
      service_fee,
      loan_amount,
      interest_rate,
      term_months,
      loan_type,
    );
  }, [
    selectedLoanType,
    formData.loan_type,
    formData.service_fee,
    formData.loan_amount,
    formData.interest_rate,
    formData.term_months,
  ]);

  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p>Something went wrong</p>;

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
          {filteredLoans?.length === 0 ? (
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
                  {filteredLoans?.map((loan) => (
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
                            disabled={updateArchive.isPending}
                            onClick={() => handleViewDialog(loan)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>

                          <Button
                            size="icon"
                            variant="ghost"
                            disabled={updateArchive.isPending}
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

          <form onSubmit={handleSubmit} id="loan-type-form">
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
              {/* Special Dates */}
              {formData?.special_dates?.length > 0 && (
                <>
                  <p className="text-lg font-semibold">Payment Schedule</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {formData?.special_dates?.map((item, index) => (
                      <div className="grid grid-cols-2 gap-4 ">
                        <div key={`item-${index}`} className="space-y-2 ">
                          <Label className="text-sm">
                            Term {item.index + 1} - Payment Date
                          </Label>

                          <Input
                            key={index}
                            type="date"
                            value={item.value}
                            onChange={(e) => {
                              setFormData((prev) => ({
                                ...prev,
                                special_dates: prev.special_dates.map(
                                  (date, i) =>
                                    i === index
                                      ? { ...date, value: e.target.value }
                                      : date,
                                ),
                              }));
                            }}
                          />
                        </div>

                        <div key={item.index} className="space-y-2 ">
                          <Label className="text-sm">Amount</Label>
                          <p className="flex items-center text-xl font-medium">
                            {`₱${item.amount.toLocaleString()}`}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleCloseDialog}>
                Cancel
              </Button>
              <Button onClick={() => saveConfirmHandler()}>Create Loan</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={selectedLoanType} onOpenChange={setSelectedLoanType}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-3xl">Loan Type Details? </DialogTitle>
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

            {selectedLoanType?.special_dates?.length > 0 && (
              <>
                <p className="text-lg font-semibold">Payment Schedule</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedLoanType?.special_dates?.map((item) => (
                    <div key={item.id} className="grid grid-cols-2 gap-4 ">
                      <div className="space-y-2 ">
                        <Label className="text-sm">
                          Term {item.term_number} - Payment Date
                        </Label>
                        <p>{item.term_date}</p>
                      </div>
                      <div className="space-y-2 ">
                        <Label className="text-sm">Amount</Label>
                        <p>₱{item.amount?.toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
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
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={saveConfirm} onOpenChange={setSaveConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Save?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to save these changes?
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogAction
              disabled={createLoanType.isPending}
              type="submit"
              form="loan-type-form"
              className="grey:bg-green-600 bg-green-500 hover:bg-green-600 focus:ring-green-600"
            >
              {createLoanType.isPending ? "Applying..." : "Yes"}
            </AlertDialogAction>
            <AlertDialogCancel>No</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
