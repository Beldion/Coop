import { createElement, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  RotateCcw,
  Download,
  RefreshCw,
  Users,
  Wallet,
  FileClock,
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
  X,
  ArrowUpDown,
} from "lucide-react";
import Decimal from "decimal.js";
import { useDebounce } from "@/hooks/useDebounce";
import { useFetchAllLoans } from "@/api/loans";
import { money, exportToCSV } from "@/lib/utils";
import ScheduleReview from "@/components/restructuring/scheduleReview";
import LoanSummary from "@/components/restructuring/loanSummary";

const fullName = (loan) =>
  [loan.member?.first_name, loan.member?.middle_name, loan.member?.last_name]
    .filter(Boolean)
    .join(" ") || "Unnamed member";
const balance = (loan) =>
  (loan.loan_payments ?? [])
    .reduce(
      (sum, item) => sum.plus(item.amount || 0).minus(item.amount_paid || 0),
      new Decimal(0),
    )
    .toNumber();
const status = (loan) => loan.status || loan.loan?.status || "Unknown";

export default function Restructuring() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [type, setType] = useState("");
  const [state, setState] = useState("");
  const [term, setTerm] = useState("");
  const [sort, setSort] = useState({ key: "", direction: 1 });
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const debouncedSearch = useDebounce(search, 500);
  const { data, isLoading, isFetching, isError, refetch } = useFetchAllLoans({
    search: debouncedSearch,
  });
  const loans = data?.loans ?? [];
  const filtered = loans.filter(
    (loan) =>
      (!type || loan.loan_type?.loan_name === type) &&
      (!state || status(loan) === state) &&
      (!term || String(loan.loan_type?.term_months) === term),
  );
  const sorted = [...filtered].sort((a, b) => {
    if (!sort.key) return 0;
    const value = (loan) =>
      sort.key === "member"
        ? fullName(loan)
        : sort.key === "balance"
          ? balance(loan)
          : Number(loan.loan_type?.loan_amount || 0);
    return (
      (sort.key === "member"
        ? value(a).localeCompare(value(b))
        : value(a) - value(b)) * sort.direction
    );
  });
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * pageSize;
  const visible = sorted.slice(start, start + pageSize);
  const totalBalance = filtered
    .reduce((sum, loan) => sum.plus(balance(loan)), new Decimal(0))
    .toNumber();
  const totalPrincipal = filtered
    .reduce(
      (sum, loan) => sum.plus(loan.loan_type?.loan_amount || 0),
      new Decimal(0),
    )
    .toNumber();
  const approved = filtered.filter(
    (loan) => status(loan).toLowerCase() === "approved",
  ).length;
  const changeFilter = (setter) => (event) => {
    setter(event.target.value);
    setPage(1);
  };
  const toggleSort = (key) => {
    setSort({ key, direction: sort.key === key ? -sort.direction : 1 });
    setPage(1);
  };
  const selectClass =
    "h-10 min-w-36 rounded-lg border bg-background px-3 text-xs text-slate-600 dark:text-slate-300";
  const openReview = (loan) => {
    setSelectedLoan(loan);
    setDetailsOpen(true);
  };
  const metrics = [
    {
      label: "Restructuring candidates",
      value: filtered.length,
      detail: "Loans in the filtered queue",
      Icon: Users,
      tone: "text-slate-600 bg-slate-100 dark:bg-slate-800 dark:text-slate-300",
    },
    {
      label: "Remaining queue balance",
      value: money(totalBalance),
      detail: "Across the filtered accounts",
      Icon: Wallet,
      tone: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950",
    },
    {
      label: "Approved accounts",
      value: `${approved} loans`,
      detail: "With approved loan status",
      Icon: BadgeCheck,
      tone: "text-teal-600 bg-teal-50 dark:bg-teal-950",
    },
    {
      label: "Original loan amounts",
      value: money(totalPrincipal),
      detail: "Total principal in this queue",
      Icon: FileClock,
      tone: "text-amber-600 bg-amber-50 dark:bg-amber-950",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">
              Loan Restructuring
            </h1>
            <span className="rounded-full border bg-slate-50 px-2 py-0.5 text-[10px] text-slate-500 dark:bg-slate-900">
              Active Queue
            </span>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Review active loans for restructuring, term re-amortization, and
            revised repayment terms.
          </p>
        </div>
        <Button
          variant="outline"
          disabled={isFetching || isError || !filtered.length}
          className="h-9 rounded-lg text-xs"
          onClick={() =>
            exportToCSV(
              sorted.map((loan) => ({
                loan_id: loan.id,
                member: fullName(loan),
                original_amount: loan.loan_type?.loan_amount,
                loan_type: loan.loan_type?.loan_name,
                remaining_balance: balance(loan),
                term: loan.loan_type?.term_months,
                status: status(loan),
              })),
              "restructuring-queue.csv",
            )
          }
        >
          <Download className="size-3.5" />
          Export Queue (CSV)
        </Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map(({ label, value, detail, Icon, tone }) => (
          <section
            key={label}
            className="flex items-center justify-between gap-3 rounded-xl border bg-background p-4"
          >
            <div className="min-w-0">
              <p className="max-w-40 text-[10px] uppercase tracking-wider text-slate-500">
                {label}
              </p>
              <p className="mt-2 break-words text-2xl font-semibold tracking-tight tabular-nums">
                {isLoading || isError ? "—" : value}
              </p>
              <p className="mt-2 text-[10px] text-slate-400">{detail}</p>
            </div>
            <div
              className={`flex size-9 shrink-0 items-center justify-center rounded-lg border border-current/10 ${tone}`}
            >
              {createElement(Icon, { className: "size-4" })}
            </div>
          </section>
        ))}
      </div>
      <section className="overflow-hidden rounded-xl border bg-background">
        <div className="space-y-5 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base font-semibold tracking-tight">
                  Restructuring List
                </h2>
                <span className="rounded-full border bg-slate-50 px-2 py-0.5 text-[10px] text-slate-500 dark:bg-slate-900">
                  {filtered.length} candidates
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Select a member loan to review the schedule and prepare revised
                repayment terms.
              </p>
            </div>
            <Button
              variant="outline"
              className="h-8 rounded-lg text-[11px]"
              disabled={isFetching}
              onClick={() => refetch()}
            >
              <RefreshCw
                className={`size-3 ${isFetching ? "animate-spin" : ""}`}
              />
              Refresh Queue
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="relative min-w-56 flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <Input
                aria-label="Search member or loan ID"
                placeholder="Search member or loan ID..."
                value={search}
                onChange={changeFilter(setSearch)}
                className="h-10 rounded-lg pl-9 text-xs"
              />
            </div>
            <select
              aria-label="Filter loan type"
              className={selectClass}
              value={type}
              onChange={changeFilter(setType)}
            >
              <option value="">All loan types</option>
              {[
                ...new Set(
                  loans
                    .map((loan) => loan.loan_type?.loan_name)
                    .filter(Boolean),
                ),
              ].map((name) => (
                <option key={name}>{name}</option>
              ))}
            </select>
            <select
              aria-label="Filter status"
              className={selectClass}
              value={state}
              onChange={changeFilter(setState)}
            >
              <option value="">All statuses</option>
              {[...new Set(loans.map(status))].map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
            <select
              aria-label="Filter term"
              className={selectClass}
              value={term}
              onChange={changeFilter(setTerm)}
            >
              <option value="">All terms</option>
              {[
                ...new Set(
                  loans
                    .map((loan) => loan.loan_type?.term_months)
                    .filter(Boolean),
                ),
              ]
                .sort((a, b) => a - b)
                .map((value) => (
                  <option key={value} value={value}>
                    {value} terms
                  </option>
                ))}
            </select>
            <Button
              variant="ghost"
              className="h-10 text-xs text-slate-500"
              onClick={() => {
                setSearch("");
                setType("");
                setState("");
                setTerm("");
                setSort({ key: "", direction: 1 });
                setPage(1);
              }}
            >
              <X className="size-3" />
              Reset
            </Button>
          </div>
        </div>
        <div className="overflow-x-auto" aria-busy={isFetching}>
          <table className="w-full min-w-[950px] text-left text-xs">
            <thead className="border-y bg-slate-50/80 dark:bg-slate-900/60">
              <tr>
                {[
                  ["Original amount", "amount"],
                  ["Member", "member"],
                  ["Loan type", ""],
                  ["Remaining balance", "balance"],
                  ["Term", ""],
                  ["Status", ""],
                  ["Action", ""],
                ].map(([label, key]) => (
                  <th
                    key={label}
                    className="px-5 py-4 text-[10px] font-medium uppercase tracking-wide text-slate-500"
                    aria-sort={
                      key && sort.key === key
                        ? sort.direction === 1
                          ? "ascending"
                          : "descending"
                        : undefined
                    }
                  >
                    {key ? (
                      <button
                        className="flex items-center gap-2 text-left uppercase"
                        onClick={() => toggleSort(key)}
                      >
                        {label}
                        <ArrowUpDown className="size-3" />
                      </button>
                    ) : (
                      label
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {isLoading || isError ? (
                <tr>
                  <td
                    colSpan={7}
                    className="p-12 text-center text-muted-foreground"
                  >
                    {isError
                      ? "Unable to load the queue. Use Refresh Queue to try again."
                      : "Loading restructuring queue…"}
                  </td>
                </tr>
              ) : (
                visible.map((loan, index) => {
                  const remaining = balance(loan);
                  const original = Number(loan.loan_type?.loan_amount || 0);
                  const percent =
                    original > 0
                      ? Math.max(0, (remaining / original) * 100)
                      : 0;
                  const name = fullName(loan);
                  const initials = name
                    .split(" ")
                    .filter(Boolean)
                    .map((part) => part[0])
                    .filter((_, i, all) => i === 0 || i === all.length - 1)
                    .join("");
                  const colors = [
                    "bg-slate-900 text-white",
                    "border-indigo-200 bg-indigo-50 text-indigo-600",
                    "border-amber-200 bg-amber-50 text-amber-700",
                    "border-violet-200 bg-violet-50 text-violet-600",
                  ];
                  return (
                    <tr
                      key={loan.id}
                      className="transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-900/50"
                    >
                      <td className="px-5 py-5">
                        <p className="whitespace-nowrap text-sm font-semibold tabular-nums">
                          {money(original)}
                        </p>
                        <p
                          className="mt-1 max-w-36 truncate font-mono text-[9px] text-slate-400"
                          title={String(loan.id)}
                        >
                          ID: #{loan.id}
                        </p>
                      </td>
                      <td className="px-5 py-5">
                        <div className="flex items-center gap-3">
                          <span
                            className={`flex size-8 shrink-0 items-center justify-center rounded-full border text-[10px] font-semibold ${colors[index % colors.length]}`}
                          >
                            {initials}
                          </span>
                          <div>
                            <p className="min-w-40 font-medium">{name}</p>
                            <p className="mt-1 text-[10px] text-slate-400">
                              {loan.member?.employee_id || "Member account"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-5">
                        <span className="inline-block whitespace-nowrap rounded border border-indigo-100 bg-indigo-50/60 px-2 py-1 text-[10px] text-indigo-700 dark:border-indigo-900 dark:bg-indigo-950 dark:text-indigo-300">
                          {loan.loan_type?.loan_name || "—"}
                        </span>
                      </td>
                      <td className="px-5 py-5">
                        <p className="font-semibold tabular-nums">
                          {money(remaining)}
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                          <div className="h-1.5 w-20 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                            <div
                              className={`h-full rounded-full ${percent > 35 ? "bg-amber-400" : "bg-emerald-500"}`}
                              style={{ width: `${Math.min(100, percent)}%` }}
                            />
                          </div>
                          <span className="whitespace-nowrap font-mono text-[9px] text-slate-400">
                            {original > 0 ? `${percent.toFixed(1)}% rem.` : "—"}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-5 text-center">
                        <p>{loan.loan_type?.term_months ?? "—"}</p>
                        <p className="mt-1 text-[10px] text-slate-400">terms</p>
                      </td>
                      <td className="px-5 py-5">
                        <span className="rounded-full bg-muted px-2 py-1 text-[10px] capitalize text-muted-foreground">
                          {status(loan)}
                        </span>
                      </td>
                      <td className="px-5 py-5">
                        <Button
                          variant="outline"
                          className="h-8 rounded-lg text-[10px]"
                          onClick={() => openReview(loan)}
                        >
                          <RotateCcw className="size-3" />
                          Restructure
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
              {!isLoading && !isError && !visible.length && (
                <tr>
                  <td
                    colSpan={7}
                    className="p-12 text-center text-muted-foreground"
                  >
                    No loans match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4 border-t bg-slate-50/60 px-4 py-3 dark:bg-slate-900/40">
          <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500">
            <p>
              Showing{" "}
              <span className="font-medium text-foreground">
                {sorted.length ? start + 1 : 0}–
                {Math.min(start + pageSize, sorted.length)}
              </span>{" "}
              of {sorted.length} candidates
            </p>
            <label className="flex items-center gap-2">
              Rows per page
              <select
                className="rounded border bg-background p-1 text-foreground"
                value={pageSize}
                onChange={(event) => {
                  setPageSize(Number(event.target.value));
                  setPage(1);
                }}
              >
                {[5, 10, 20, 50].map((size) => (
                  <option key={size}>{size}</option>
                ))}
              </select>
            </label>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              className="h-8 text-[11px]"
              disabled={currentPage === 1 || isFetching}
              onClick={() => setPage(currentPage - 1)}
            >
              <ChevronLeft className="size-3" />
              Previous
            </Button>
            {Array.from(
              { length: Math.min(3, totalPages) },
              (_, i) =>
                Math.max(1, Math.min(currentPage - 1, totalPages - 2)) + i,
            ).map((number) => (
              <Button
                key={number}
                variant={number === currentPage ? "default" : "outline"}
                aria-current={number === currentPage ? "page" : undefined}
                className="size-8 rounded text-[11px]"
                onClick={() => setPage(number)}
              >
                {number}
              </Button>
            ))}
            <Button
              variant="outline"
              className="h-8 text-[11px]"
              disabled={currentPage === totalPages || isFetching}
              onClick={() => setPage(currentPage + 1)}
            >
              Next
              <ChevronRight className="size-3" />
            </Button>
          </div>
        </div>
      </section>
      <ScheduleReview
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        loan={selectedLoan}
        onContinue={() => {
          setDetailsOpen(false);
          setConfirmOpen(true);
        }}
      />
      <LoanSummary
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        loan={selectedLoan}
        onBack={() => setDetailsOpen(true)}
      />
    </div>
  );
}
