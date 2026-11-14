import { useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { money } from "@/lib/utils";

export default function AddPaymentDialog({ loans, onClose, onSave }) {
  const [loanId, setLoanId] = useState("");
  const [method, setMethod] = useState("");
  const [reference, setReference] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(() =>
    new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Manila",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date()),
  );
  const saving = useRef(false);
  const [error, setError] = useState("");
  const loan = loans.find((item) => String(item.id) === loanId);
  function submit(event) {
    event.preventDefault();
    if (saving.current) return;
    if (!loan || !Number.isFinite(Number(amount)) || Number(amount) <= 0) {
      setError("Select a loan and enter a valid amount greater than zero.");
      return;
    }
    saving.current = true;
    try {
      onSave({
        loan_id: loan.id,
        payment_method: method,
        reference: reference.trim(),
        amount: Number(amount),
        payment_date: date,
      });
      onClose();
    } catch {
      setError("Unable to save this payment. Please try again.");
      saving.current = false;
    }
  }
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="max-h-[92dvh] overflow-y-auto rounded-2xl p-6 md:max-w-lg">
        <DialogHeader className="border-b pb-4 pr-6">
          <DialogTitle className="text-xl font-semibold">
            Add Payment
          </DialogTitle>
          <DialogDescription className="text-xs">
            Record a payment against a loan. Entries on this page are stored
            locally in this browser.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="add-payment-loan">Loan / Member</Label>
            <select
              id="add-payment-loan"
              required
              value={loanId}
              onChange={(event) => setLoanId(event.target.value)}
              className="h-10 w-full rounded-xl border bg-background px-3 text-sm"
            >
              <option value="">Select a loan</option>
              {loans.map((item) => (
                <option key={item.id} value={String(item.id)}>
                  {item.id} — {item.member_name || "Unknown member"}
                </option>
              ))}
            </select>
          </div>
          {loan && (
            <dl className="grid grid-cols-2 gap-3 rounded-xl border bg-muted/30 p-4 text-xs">
              <div>
                <dt className="text-muted-foreground">Member</dt>
                <dd className="mt-1 font-medium">
                  {loan.member_name || "N/A"}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Loan amount</dt>
                <dd className="mt-1 font-semibold">
                  {money(Number(loan.loan_amount) || 0)}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Status</dt>
                <dd className="mt-1 capitalize">{loan.status || "N/A"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Loan ID</dt>
                <dd className="mt-1 break-all">{loan.id}</dd>
              </div>
            </dl>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="add-payment-method">Payment method</Label>
              <select
                id="add-payment-method"
                required
                value={method}
                onChange={(event) => setMethod(event.target.value)}
                className="h-10 w-full rounded-xl border bg-background px-3 text-sm"
              >
                <option value="">Select method</option>
                <option value="cash">Cash</option>
                <option value="gcash">GCash</option>
                <option value="bank">Bank Transfer</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-payment-date">Payment date</Label>
              <Input
                id="add-payment-date"
                type="date"
                required
                value={date}
                onChange={(event) => setDate(event.target.value)}
                className="h-10 rounded-xl"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="add-payment-reference">
              Reference{" "}
              <span className="text-xs text-muted-foreground">(optional)</span>
            </Label>
            <Input
              id="add-payment-reference"
              value={reference}
              onChange={(event) => setReference(event.target.value)}
              placeholder="Receipt or transaction number"
              className="h-10 rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="add-payment-amount">Amount paid (PHP)</Label>
            <Input
              id="add-payment-amount"
              type="number"
              inputMode="decimal"
              min="0.01"
              step="0.01"
              required
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="0.00"
              className="h-10 rounded-xl"
            />
          </div>
          {!loans.length && (
            <p className="text-xs text-muted-foreground">
              No loans available to record a payment.
            </p>
          )}
          {error && (
            <p role="alert" className="text-xs text-destructive">
              {error}
            </p>
          )}
          <div className="flex justify-end gap-2 border-t pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="rounded-lg"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!loans.length}
              className="rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
            >
              Save Payment
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
