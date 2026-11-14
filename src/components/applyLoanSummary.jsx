import { money } from "@/lib/utils";

export function ApplyLoanSummary({ loan }) {
  const principal = Number(loan?.loan_amount) || 0;
  const fee = (principal * (Number(loan?.service_fee) || 0)) / 100;
  const interest =
    loan?.loan_type === "Associate"
      ? 0
      : (principal * (Number(loan?.interest_rate) || 0)) / 100;
  return (
    <section className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-900/30">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/60 pb-4 dark:border-slate-800">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold">{loan?.loan_name}</h3>
            <span className="rounded border border-emerald-200 bg-emerald-100 px-2 py-0.5 text-[10px] text-emerald-800">
              {loan?.loan_type}
            </span>
          </div>
          <p className="mt-1 break-all text-[10px] text-slate-400">
            Package ID: {loan?.loan_id}
          </p>
        </div>
        <div className="sm:text-right">
          <p className="text-[10px] font-semibold uppercase text-slate-400">
            Principal amount
          </p>
          <p className="text-2xl font-bold tabular-nums">{money(principal)}</p>
        </div>
      </div>
      <dl className="mt-3 grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border bg-background p-3 shadow-sm">
          <dt className="text-[10px] text-slate-500">Interest Rate</dt>
          <dd className="text-xs font-semibold">{loan?.interest_rate}%</dd>
          <p className="mt-1 text-[9px] text-slate-400">
            {money(interest)} total interest
          </p>
        </div>
        <div className="rounded-lg border bg-background p-3 shadow-sm">
          <dt className="text-[10px] text-slate-500">
            Service Fee ({loan?.service_fee}%)
          </dt>
          <dd className="text-xs font-semibold">{money(fee)}</dd>
          <p className="mt-1 text-[9px] text-amber-600">Upfront deduction</p>
        </div>
        <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-3 shadow-sm dark:border-emerald-900 dark:bg-emerald-950">
          <dt className="text-[10px] text-emerald-700 dark:text-emerald-400">
            Estimated net proceeds
          </dt>
          <dd className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
            {money(principal - fee)}
          </dd>
          <p className="mt-1 text-[9px] text-emerald-600">After service fee</p>
        </div>
      </dl>
    </section>
  );
}

export function ApplyLoanSchedule({ loan, dates }) {
  const special = loan?.special_dates || [];
  const rows = special.length
    ? special.map((item) => [item.term_date, money(item.amount)])
    : Array.isArray(dates)
      ? dates.map((item) => String(item).split(" - "))
      : [];
  const principal = Number(loan?.loan_amount) || 0;
  const total = special.length
    ? special.reduce((sum, item) => sum + (Number(item.amount) || 0), 0)
    : principal *
      (loan?.loan_type === "Member"
        ? 1 + (Number(loan?.interest_rate) || 0) / 100
        : 1);
  return (
    <section>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-[10px] font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
            Sample computations &amp; schedule
          </h3>
          <span className="rounded border bg-muted/40 px-2 py-1 text-[9px] text-slate-500">
            {rows.length} Cutoffs
          </span>
        </div>
        <p className="text-[10px] text-slate-500">
          Contract total:{" "}
          <strong className="text-foreground">{money(total)}</strong>
        </p>
      </div>
      <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-3 dark:border-slate-800 dark:bg-slate-900/30">
        <div className="grid max-h-64 gap-2 overflow-y-auto sm:grid-cols-2">
          {rows.map(([date, amount], index) => (
            <div
              key={index}
              className="flex items-center justify-between gap-2 rounded-lg border border-slate-100 bg-background px-2 py-2 text-[10px] dark:border-slate-800"
            >
              <span className="text-slate-500">{date}</span>
              <strong className="whitespace-nowrap font-medium tabular-nums">
                {amount}
              </strong>
            </div>
          ))}
        </div>
        {!rows.length && (
          <p className="p-4 text-center text-xs text-muted-foreground">
            No schedule available.
          </p>
        )}
        <p className="mt-3 border-t pt-3 text-[10px] text-slate-400">
          {special.length
            ? "Custom payment schedule for this package."
            : "Estimated payment dates based on the current loan terms."}
        </p>
      </div>
    </section>
  );
}
