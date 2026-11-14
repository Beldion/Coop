import { useState } from "react";
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
import { useRecordLoanPayment } from "@/api/loans";
import { toast } from "sonner";

import { money } from "@/lib/utils";

export default function PaymentDialog({ payment, onClose, readOnly = false }) {
  const { recordPayment, isLoading, isError, isPending } =
    useRecordLoanPayment();
  const [paymentFields, setPaymentFields] = useState({
    method: "",
    reference: "",
    amount: Number(payment.amount ?? 0),
  });

  const member = payment.loan?.member;
  const loanType = payment.loan?.loan_type;
  const dueDate = payment.payment_date ? new Date(payment.payment_date) : null;
  const details = [
    [
      "Member",
      [member?.first_name, member?.middle_name, member?.last_name]
        .filter(Boolean)
        .join(" ") || "N/A",
    ],
    ["Employee ID", member?.employee_id ?? "N/A"],
    ["Loan type", loanType?.loan_name ?? loanType?.loan_type ?? "N/A"],
    ["Status", payment.payment_category ?? "N/A"],
    [
      "Due date",
      dueDate && !Number.isNaN(dueDate.getTime())
        ? dueDate.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })
        : "N/A",
    ],
    ["Scheduled amount", money(Number(payment.amount ?? 0))],
    ["Previously paid", money(Number(payment.amount_paid ?? 0))],
    [
      "Payment method",
      { cash: "Cash", gcash: "GCash", bank: "Bank Transfer" }[
        payment.payment_method
      ] ??
        payment.payment_method ??
        "N/A",
    ],
    ["Reference", payment.reference || "N/A"],
    ["Payment ID", payment.id ?? "N/A"],
    ["Loan ID", payment.loan?.id ?? payment.loan_id ?? "N/A"],
  ];

  const handleSubmit = async (event) => {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);

    console.log("Submitting payment:", {
      installmentId: payment.id,
      method: fields.get("method"),
      reference: fields.get("reference"),
      amount: fields.get("amount_paid").trim(),
    });
    try {
      await recordPayment.mutateAsync({
        installmentId: payment.id,
        method: fields.get("method"),
        reference: fields.get("reference"),
        amount: fields.get("amount_paid").trim(),
      });

      toast.success("Profile updated successfully!");
      onClose();
    } catch (error) {
      toast.error(error.message);
      console.log("Error recording payment:", error);
    }
  };

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="max-h-[90dvh] overflow-y-auto rounded-2xl p-6 md:max-w-xl">
        <DialogHeader className="pr-6">
          <DialogTitle className="text-xl font-semibold">
            {readOnly ? "Payment Details" : "Add Payment"}
          </DialogTitle>
          <DialogDescription className="text-xs">
            {readOnly
              ? "Member, loan, and recorded payment information."
              : "Review the loan details and enter the payment information."}
          </DialogDescription>
        </DialogHeader>

        <dl className="grid grid-cols-1 gap-x-6 gap-y-4 rounded-xl border bg-muted/30 p-4 sm:grid-cols-2">
          {details.map(([label, value]) => (
            <div key={label} className="min-w-0">
              <dt className="text-sm text-muted-foreground">{label}</dt>
              <dd className="mt-1 break-words text-xs font-medium">{value}</dd>
            </div>
          ))}
        </dl>

        {!readOnly && (
          <form id="payment-form" className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="report-payment-method">Payment method</Label>
              <Input
                id="report-payment-amount"
                name="method"
                className="rounded-lg"
                type="text"
                required
                placeholder="Payment method (cash, gcash, bank)"
                value={paymentFields.method}
                onChange={(event) =>
                  setPaymentFields({
                    ...paymentFields,
                    method: event.target.value,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="report-payment-reference">Reference</Label>
              <Input
                id="report-payment-reference"
                name="reference"
                className="rounded-lg"
                required
                type="text"
                placeholder="Receipt or transaction number"
                value={paymentFields.reference}
                onChange={(event) =>
                  setPaymentFields({
                    ...paymentFields,
                    reference: event.target.value,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="report-payment-amount">Amount paid (PHP)</Label>
              <Input
                id="report-payment-amount"
                name="amount_paid"
                className="rounded-lg"
                type="number"
                required
                inputMode="decimal"
                min="0.01"
                step="0.01"
                placeholder="0.00"
                value={paymentFields.amount}
                onChange={(event) =>
                  setPaymentFields({
                    ...paymentFields,
                    amount: event.target.value,
                  })
                }
              />
            </div>
          </form>
        )}
        <DialogFooter className="-mx-6 -mb-6 mt-2 px-6">
          <Button
            type="button"
            variant="outline"
            className="rounded-lg"
            onClick={onClose}
          >
            Close
          </Button>
          {!readOnly && (
            <Button
              form="payment-form"
              type="submit"
              className="rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
              disabled={isLoading || isError || isPending}
            >
              Save payment
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
