import LoanCatalog from "@/components/loanCatalog";
import CreateLoanForm from "@/components/createLoanForm";
import LoanPackageDetails from "@/components/loanPackageDetails";
import { useState, useMemo, useEffect } from "react";
import Decimal from "decimal.js";

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
import { generateDates, money } from "@/lib/utils";
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
  const [selectedLoanTypeId, setSelectedLoanTypeId] = useState(null);
  const selectedLoanType = useMemo(() => {
    const loan = loanTypes?.find((item) => item.id === selectedLoanTypeId);
    return loan
      ? { ...loan, loan_id: loan.id, special_dates: loan.special_payment_date || [] }
      : null;
  }, [loanTypes, selectedLoanTypeId]);
  const [saveConfirm, setSaveConfirm] = useState(false);

  const initialData = {
    loan_type: "",
    loan_name: "",
    loan_amount: "",
    interest_rate: "",
    term_months: "",
    service_fee: "",
    // total_payable: "",
    // special_dates: [],
  };

  const [formData, setFormData] = useState(initialData);

  useEffect(() => {
    if (formData.loan_type !== "Special") {
      setFormData((prev) => ({
        ...prev,
        special_dates: [],
      }));
      return;
    }

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
        total_payable: monthlyPayment * count,
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

  const handleOpenDialog = () => {
    setDialogOpen(true);
  };

  const handleViewDialog = (item) => {
    setSelectedLoanTypeId(item.id);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
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
  const saveConfirmHandler = () => {
    const toggleErrorBorder = (name, hasError) => {
      document.querySelectorAll(`[name="${name}"]`).forEach((el) => {
        el.classList.toggle("border-red-500", hasError);
      });
    };

    const isEmpty = (value) => {
      return !value?.toString().trim();
    };

    const hasEmptyField = (formData) => {
      Object.entries(formData).forEach(([key, value]) => {
        if (key === "special_dates") {
          value.forEach((item, index) => {
            const emptyValue = isEmpty(item.value);
            const emptyAmount = isEmpty(item.amount);
            toggleErrorBorder(`date-${index}`, emptyValue);
            toggleErrorBorder(`amount-${index}`, emptyAmount);
          });
        } else {
          const empty = isEmpty(value);
          toggleErrorBorder(key, empty);
        }
      });

      return Object.entries(formData).some(([key, value]) => {
        if (key === "special_dates") {
          console.log("special Date", value);
          return value.some((item) => {
            const empty = isEmpty(item.value);
            // console.log("key", key, value);
            return empty;
          });
        }

        const empty = isEmpty(value);
        return empty;
      });
    };

    if (hasEmptyField(formData)) {
      console.log(
        "Form data has empty fields:",
        formData,
        hasEmptyField(formData),
      );
      toast.error("Please fill in all required fields");
      return;
    }
    const total = formData.special_dates.reduce(
      (acc, item) => acc.plus(new Decimal(item.amount)),
      new Decimal(0),
    );

    console.log("Computed total:", formData?.total_payable);
    if (
      formData?.total_payable &&
      formData.loan_type == "Special" &&
      formData?.total_payable?.toFixed(2) !== total.toFixed(2)
    ) {
      toast.error(
        `${formData.loan_type} "Total payable does not match sum of special payment amounts"}`,
      );
      return;
    }
    setSaveConfirm(true);
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

  //confirm Handler

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

  const getTodayDate = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().split("T")[0];
  };

  const today = getTodayDate();

  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p>Something went wrong</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Loans</h1>
          <p className="text-muted-foreground mt-1">
            Manage loan packages, interest terms, service fees, and disbursements
          </p>
        </div>
        <Button className="rounded-lg bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900" onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Create Loan
        </Button>
      </div>

      <LoanCatalog loans={loanTypes} onView={handleViewDialog} onDelete={handleDelete} pending={updateArchive.isPending} />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="flex max-h-[92dvh] flex-col gap-0 overflow-hidden rounded-2xl p-0 md:max-w-2xl">
          <CreateLoanForm data={formData} onChange={handleOnChange} setData={setFormData} dates={generatedDates} today={today} onSubmit={handleSubmit} onConfirm={saveConfirmHandler} onCancel={handleCloseDialog} pending={createLoanType.isPending || createSpecialPaymentDates.isPending} />
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(selectedLoanType)}
        onOpenChange={(open) => {
          if (!open) setSelectedLoanTypeId(null);
        }}
      >
        <DialogContent className="max-h-[94dvh] overflow-y-auto gap-0 rounded-2xl p-0 md:max-w-5xl">
          <LoanPackageDetails loan={selectedLoanType} generatedDates={generatedDates} onClose={() => setSelectedLoanTypeId(null)} />
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
