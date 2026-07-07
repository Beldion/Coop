import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { Separator } from "@/components/ui/separator";
// import { Badge } from "@/components/ui/badge";
import { Banknote, Wallet, Receipt, CreditCard } from "lucide-react";
import { generateDates, money } from "@/lib/utils";
import Decimal from "decimal.js";
import { useMemo, useState } from "react";
import { useRestructureLoan } from "@/api/loans";
import { toast } from "sonner";

export default function LoanSummary({ open, onOpenChange, loan }) {
  const restructureLoan = useRestructureLoan();
  const [approveConfirm, setApproveConfirm] = useState(false);

  //     const res = await restructureLoan.mutateAsync({
  //   loanId: loan.id,

  // });

  const approveLoandata = loan?.loan_type?.loan_amount;
  const oldLoan = loan?.loan_payments
    .reduce(
      (sum, payment) =>
        sum.plus(payment.amount || 0).minus(payment.amount_paid || 0),
      new Decimal(0),
    )
    .toNumber();

  const netCash =
    loan?.loan_type?.loan_type == "Associate"
      ? approveLoandata -
        oldLoan -
        (approveLoandata * loan?.loan_type?.interest_rate) / 100 -
        (approveLoandata * loan?.loan_type?.service_fee) / 100
      : loan?.loan_type?.loan_type == "Member"
        ? approveLoandata - oldLoan
        : 0;

  const totalRepay =
    loan?.loan_type?.loan_type == "Member"
      ? approveLoandata -
        oldLoan +
        (approveLoandata * loan?.loan_type?.interest_rate) / 100 +
        (approveLoandata * loan?.loan_type?.service_fee) / 100
      : loan?.loan_type?.loan_type == "Associate"
        ? approveLoandata
        : 0;

  const monthlyPayment =
    loan?.loan_type?.loan_type == "Member"
      ? (approveLoandata +
          (approveLoandata * loan?.loan_type?.interest_rate) / 100 +
          (approveLoandata * loan?.loan_type?.service_fee) / 100) /
        loan?.loan_type?.term_months
      : loan?.loan_type?.loan_type == "Associate"
        ? approveLoandata / loan?.loan_type?.term_months
        : 0;

  // console.log("loan summary", loan.loan_type.loan_type);
  const loanData = {
    approvedLoan: approveLoandata,
    oldLoan: oldLoan,
    netCash: netCash,
    principal: approveLoandata,
    interest: loan?.loan_type?.interest_rate
      ? (approveLoandata * loan?.loan_type?.interest_rate) / 100
      : 0,

    serviceFee: loan?.loan_type?.service_fee
      ? (approveLoandata * loan?.loan_type?.service_fee) / 100
      : 0,
    totalRepay: totalRepay,
    monthlyPayment: monthlyPayment,
    term: 12,
  };

  const generatedDates = useMemo(() => {
    if (loan) {
      const {
        service_fee,
        loan_amount,
        interest_rate,
        term_months,
        loan_type,
      } = loan?.loan_type || {};

      console.log("test", loan);
      return generateDates(
        service_fee,
        loan_amount,
        interest_rate,
        term_months,
        loan_type,
      );
    }
  }, [loan]);

  console.log("loan summary", loan, generatedDates);

  const handleApprove = async () => {
    if (loan) {
      restructureLoan.mutateAsync({
        loanId: loan.id,
      });

      if (restructureLoan.isError) {
        toast.error(`${restructureLoan.error}`);

        console.log("teststs", restructureLoan.error);
      } else {
        toast.success("Restructure Loan application approved successfully.");
        onOpenChange(false);
        setApproveConfirm(false);
      }
    }
  };
  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Loan Restructuring Summary</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Top Cards */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardContent className="flex items-center gap-4 pt-6">
                  <Banknote className="h-10 w-10 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Approved Loan
                    </p>
                    <p className="text-2xl font-bold">
                      {money(loanData.approvedLoan)}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="flex items-center gap-4 pt-6">
                  <Wallet className="h-10 w-10 text-green-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Net Cash Released
                    </p>
                    <p className="text-2xl font-bold text-green-600">
                      {money(loanData.netCash)}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="flex items-center gap-4 pt-6">
                  <CreditCard className="h-10 w-10 text-violet-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Semi-Monthly Payment
                    </p>
                    <p className="text-2xl font-bold text-violet-600">
                      {money(loanData.monthlyPayment)}
                    </p>
                    {/* <Badge className="mt-2" variant="secondary">
                    Semi-Monthly • {loanData.term} months
                  </Badge> */}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="flex items-center gap-4 pt-6">
                  <Receipt className="h-10 w-10 text-orange-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Total to Repay
                    </p>
                    <p className="text-2xl font-bold text-orange-500">
                      {money(loanData.totalRepay)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Details */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* Cash Out */}
              <Card>
                <CardHeader>
                  <CardTitle>Cash Out Deductions</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    These deductions reduce the amount released to you.
                  </p>
                </CardHeader>

                <CardContent className="space-y-4">
                  <Row
                    label="Approved Loan Amount"
                    value={money(loanData.approvedLoan)}
                  />

                  <Row
                    label="Old Loan Settlement"
                    value={`- ${money(loanData.oldLoan)}`}
                    className="text-red-600"
                  />
                  {loan?.loan_type?.loan_type == "Associate" && (
                    <>
                      <Row
                        label="interest"
                        value={`- ${money(loanData.interest)}`}
                        className="text-red-600"
                      />

                      <Row
                        label="service fee"
                        value={`- ${money(loanData.serviceFee)}`}
                        className="text-red-600"
                      />
                    </>
                  )}
                  <Separator />

                  <Row
                    label="Net Cash Released"
                    value={money(loanData.netCash)}
                    className="font-bold text-green-600 text-lg"
                  />
                </CardContent>
              </Card>

              {/* Repayment */}
              <Card>
                <CardHeader>
                  <CardTitle>Amount to Repay</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    These charges are included in your repayment.
                  </p>
                </CardHeader>

                <CardContent className="space-y-4">
                  <Row label="Principal" value={money(loanData.principal)} />
                  {loan?.loan_type?.loan_type == "Member" && (
                    <>
                      <Row
                        label="interest"
                        value={`- ${money(loanData.interest)}`}
                      />

                      <Row
                        label="service fee"
                        value={`- ${money(loanData.serviceFee)}`}
                      />
                    </>
                  )}
                  <Separator />
                  <Row
                    label="Total Amount to Repay"
                    value={money(loanData.totalRepay)}
                    className="font-bold text-lg text-primary"
                  />
                  <Separator />
                  <Row
                    label={`Semi-Monthly Payment (${loanData.term} terms)`}
                    value={money(loanData.monthlyPayment)}
                    className="font-semibold text-violet-600"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Payment Schedule</CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
                  {generatedDates && generatedDates.length > 0 && (
                    <div className="flex flex-col gap-2 text-lg text-muted-foreground">
                      {generatedDates.length === 1 ? (
                        <p>{generatedDates[0]}</p>
                      ) : (
                        generatedDates.map((range, index) => (
                          <p key={index} className="py-0.5">
                            {range}
                          </p>
                        ))
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                onOpenChange(false);
                // setDetailsOpen(true);
              }}
            >
              Back
            </Button>

            <Button onClick={() => setApproveConfirm(true)}>
              Confirm Restructure
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ALERT DIALOG (OUTSIDE but controlled) */}
      <AlertDialog open={approveConfirm} onOpenChange={setApproveConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm loan restructure?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to approve this loan restructure? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>No</AlertDialogCancel>

            <AlertDialogAction
              disabled={restructureLoan.isPending}
              onClick={handleApprove}
              className="bg-green-600 hover:bg-green-700"
            >
              {restructureLoan.isPending
                ? "Approving loan as Coborrower"
                : "Yes"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function Row({ label, value, className = "" }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>

      <span className={className}>{value}</span>
    </div>
  );
}
