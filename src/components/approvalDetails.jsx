import { Check, X, CircleDollarSign } from "lucide-react";
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { money } from "@/lib/utils";

const name = (member) =>
  [member?.first_name, member?.middle_name, member?.last_name]
    .filter(Boolean)
    .join(" ") || "N/A";
const date = (value) =>
  value && !Number.isNaN(new Date(value).getTime())
    ? new Date(value).toLocaleDateString("en-US")
    : "N/A";

function Status({ value }) {
  return (
    <span
      className={`inline-flex rounded-full border px-2 py-0.5 text-sm font-medium ${value === "approved" ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-950" : value === "rejected" ? "border-rose-200 bg-rose-50 text-rose-600 dark:bg-rose-950" : "border-amber-200 bg-amber-50 text-amber-700 dark:bg-amber-950"}`}
    >
      {value || "pending"}
    </span>
  );
}

function Information({ title, status, rows }) {
  return (
    <section className="rounded-xl border border-slate-200/80 p-4 shadow-sm dark:border-slate-800">
      <div className="mb-1 flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
        <h3 className="flex items-center gap-2 text-xs font-semibold">
          <span
            className={`size-1.5 rounded-full ${status === "approved" ? "bg-emerald-500" : "bg-amber-400"}`}
          />
          {title}
        </h3>
        <Status value={status} />
      </div>
      <dl className="divide-y divide-slate-50 dark:divide-slate-800">
        {rows.map(([label, value]) => (
          <div
            key={label}
            className="flex items-start justify-between gap-4 py-3 text-sm"
          >
            <dt className="text-slate-500 dark:text-slate-400">{label}</dt>
            <dd className="max-w-[60%] break-words text-right font-medium">
              {value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export default function ApprovalDetails({ loan, steps, generatedDates }) {
  const type = loan?.type ?? {};
  const principal = Number(type.loan_amount ?? 0);
  const fee = (principal * Number(type.service_fee ?? 0)) / 100;
  const interest =
    type.loan_type === "Member"
      ? (principal * Number(type.interest_rate ?? 0)) / 100
      : 0;
  const special = type.special_payment_date ?? [];
  const schedule = special.length
    ? special.map((item) => ({
        date: item.term_date,
        amount: money(item.amount),
      }))
    : (Array.isArray(generatedDates) ? generatedDates : []).map((item) => {
        const [due, amount] = String(item).split(" - ");
        return { date: due, amount: amount?.trim() ?? "N/A" };
      });
  const total = special.length
    ? special.reduce((sum, item) => sum + Number(item.amount || 0), 0)
    : principal + interest;

  return (
    <>
      <ol
        aria-label="Approval progress"
        className="grid grid-cols-4 border-b border-slate-100 px-5 py-6 sm:px-16 dark:border-slate-800"
      >
        {(steps ?? []).map((step, index) => (
          <li
            key={step.step}
            className="relative flex flex-col items-center gap-2 text-center"
          >
            {index < steps.length - 1 && (
              <span
                aria-hidden="true"
                className={`absolute left-1/2 top-4 h-px w-full ${step.status === "approved" ? "bg-emerald-500" : "bg-slate-200 dark:bg-slate-700"}`}
              />
            )}
            <span
              className={`relative flex size-8 items-center justify-center rounded-full border-[3px] text-xs font-semibold ${step.status === "approved" ? "border-emerald-100 bg-emerald-500 text-white" : step.status === "rejected" ? "border-rose-100 bg-rose-500 text-white" : "border-amber-100 bg-amber-500 text-white"}`}
            >
              {step.status === "approvedsss" ? (
                <Check className="size-4" />
              ) : step.status === "rejectedsss" ? (
                <X className="size-4" />
              ) : (
                step.step
              )}
            </span>
            <span className="text-sm text-slate-600 dark:text-slate-400">
              {
                ["Co-Borrower", "Approver 1", "Approver 2", "Final Approval"][
                  index
                ]
              }
            </span>
            <span className="sr-only">{step.status}</span>
          </li>
        ))}
      </ol>
      <div className="px-5 pb-5 sm:px-6">
        <DialogHeader className="flex-row flex-wrap items-center justify-between gap-4 border-b border-slate-100 py-5 dark:border-slate-800">
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <DialogTitle className="text-xl font-semibold tracking-tight">
                {type.loan_name || "Loan Application"}
              </DialogTitle>
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-sm text-emerald-800">
                {type.loan_type || "Loan"}
              </span>
            </div>
            <DialogDescription className="break-all text-sm">
              Loan Type: {type.loan_type || "N/A"} · Ref ID: {loan?.id}
            </DialogDescription>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-slate-200/70 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
                Net proceeds
              </p>
              <p className="mt-1 text-sm font-bold tabular-nums">
                {money(principal - fee)}
              </p>
            </div>
            <CircleDollarSign className="size-8 rounded-lg bg-emerald-100 p-2 text-emerald-700" />
          </div>
        </DialogHeader>
        <div className="grid gap-4 pt-5 md:grid-cols-2">
          <div className="space-y-4">
            <Information
              title="Loan Information"
              status={loan?.status}
              rows={[
                ["Member", name(loan?.member)],
                ["Loan Amount", money(principal)],
                ["Interest Rate", `${type.interest_rate ?? 0}%`],
                ["Service Fee", `${type.service_fee ?? 0}% (${money(fee)})`],
                [
                  "Term",
                  `${type.term_months ?? "N/A"} · ${schedule.length} scheduled payments`,
                ],
                ["Apply Date", date(loan?.created_at)],
                [
                  "Approval Status",
                  <Status key="status" value={loan?.status} />,
                ],
              ]}
            />
            {loan?.coborrowers ? (
              <Information
                title="Co-borrower Information"
                status={loan.coborrower_status}
                rows={[
                  ["Full Name", name(loan.coborrowers)],
                  ["Employee ID", loan.coborrowers.employee_id || "N/A"],
                  [
                    "Approved / Rejected Date",
                    date(loan.coborrower_status_date),
                  ],
                  [
                    "Verification Status",
                    <Status key="status" value={loan.coborrower_status} />,
                  ],
                ]}
              />
            ) : (
              <div className="rounded-xl border p-4 text-xs text-muted-foreground">
                No co-borrower required for this application.
              </div>
            )}
          </div>
          <section className="flex min-w-0 flex-col rounded-xl border border-slate-200/80 p-4 shadow-sm dark:border-slate-800">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3">
              <div>
                <h3 className="text-xs font-semibold">
                  Payment Sample Computation
                </h3>
                <p className="mt-1 text-sm text-slate-400">
                  Estimated amortization breakdown
                </p>
              </div>
              {!special.length && schedule.length > 0 && (
                <span className="rounded border border-emerald-100 bg-emerald-50 px-2 py-1 text-sm font-semibold text-emerald-700 dark:bg-emerald-950">
                  {schedule[0].amount} / cutoff
                </span>
              )}
            </div>
            <div className="max-h-80 overflow-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-background text-[9px] uppercase text-slate-400">
                  <tr>
                    <th className="py-3 text-left font-medium">No.</th>
                    <th className="py-3 text-left font-medium">Due date</th>
                    <th className="py-3 text-right font-medium">
                      Amortization
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {schedule.map((item, index) => (
                    <tr
                      key={index}
                      className="border-t border-slate-50 dark:border-slate-800"
                    >
                      <td className="py-2.5 text-slate-400">
                        #{String(index + 1).padStart(2, "0")}
                      </td>
                      <td className="px-2 py-2.5">{item.date}</td>
                      <td className="py-2.5 text-right font-semibold tabular-nums">
                        {item.amount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!schedule.length && (
                <p className="py-8 text-center text-xs text-muted-foreground">
                  No payment schedule available.
                </p>
              )}
            </div>
            <dl className="mt-auto space-y-2 rounded-lg bg-slate-50 p-3 text-sm dark:bg-slate-900">
              <div className="flex justify-between gap-2">
                <dt className="text-slate-500">Principal + interest:</dt>
                <dd className="tabular-nums">{money(principal + interest)}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-slate-500">Total deductions (fee):</dt>
                <dd className="text-rose-500 tabular-nums">−{money(fee)}</dd>
              </div>
              <div className="flex justify-between gap-2 border-t pt-2 font-semibold">
                <dt>Total amortization payable:</dt>
                <dd className="text-emerald-700 tabular-nums dark:text-emerald-400">
                  {money(total)}
                </dd>
              </div>
            </dl>
          </section>
        </div>
      </div>
    </>
  );
}
