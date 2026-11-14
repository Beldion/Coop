import { useState } from "react";
import {
  BadgeCheck,
  CalendarDays,
  CircleDollarSign,
  Clock,
  Eye,
  Search,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { money } from "@/lib/utils";

function Badge({ status }) {
  const color =
    status === "approved"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-950"
      : status === "pending"
        ? "border-amber-200 bg-amber-50 text-amber-700 dark:bg-amber-950"
        : status === "rejected"
          ? "border-rose-200 bg-rose-50 text-rose-600 dark:bg-rose-950"
          : "border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-sm ${color}`}
    >
      {status && status !== "Available" && (
        <span className="size-1 rounded-full bg-current" />
      )}
      {status || "Available"}
    </span>
  );
}

const panel =
  "overflow-hidden rounded-2xl border border-slate-200/80 bg-card shadow-sm dark:border-slate-800";
const table =
  "min-w-[680px] text-xs [&_th]:h-12 [&_th]:px-5 [&_th]:text-sm [&_th]:font-medium [&_th]:uppercase [&_th]:tracking-wide [&_th]:text-slate-500 [&_td]:px-5 [&_td]:py-4 [&_tr]:border-slate-100 dark:[&_tr]:border-slate-800";

export default function DashboardOverview({
  packages = [],
  loans = [],
  loansLoading,
  loansError,
  onApply,
}) {
  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const approved = loans.filter((loan) => loan.status === "approved");
  const pendingCo = loans.filter(
    (loan) =>
      loan.coborrower &&
      loan.coborrower_status === "pending" &&
      !["rejected", "completed"].includes(loan.status),
  );
  const filteredPackages = packages.filter(
    (item) =>
      (type === "all" || item.loan_type === type) &&
      `${item.loan_name} ${item.loan_type}`
        .toLowerCase()
        .includes(search.trim().toLowerCase()),
  );
  const filteredLoans = loans.filter(
    (loan) => status === "all" || loan.status === status,
  );
  const pages = Math.max(1, Math.ceil(filteredLoans.length / 5));
  const currentPage = Math.min(page, pages);
  const visibleLoans = filteredLoans.slice(
    (currentPage - 1) * 5,
    currentPage * 5,
  );
  const unavailable = loansLoading
    ? "Loading…"
    : loansError
      ? "Unavailable"
      : null;
  const summaries = [
    {
      title: "Approved Loan Amount",
      value:
        unavailable ||
        money(
          approved.reduce(
            (sum, loan) => sum + Number(loan.loan_type?.loan_amount || 0),
            0,
          ),
        ),
      detail: "Original principal of approved loans",
      Icon: CircleDollarSign,
      color: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950",
    },
    {
      title: "Approved Loans",
      value: unavailable || approved.length,
      detail: "Approved applications",
      Icon: BadgeCheck,
      color: "bg-blue-50 text-blue-600 dark:bg-blue-950",
    },
    {
      title: "Pending Co-borrowers",
      value:
        unavailable ||
        `${pendingCo.length} ${pendingCo.length === 1 ? "Action" : "Actions"}`,
      detail: "Awaiting co-borrower confirmation",
      Icon: Clock,
      color: "bg-amber-50 text-amber-600 dark:bg-amber-950",
    },
    {
      title: "Pending Applications",
      value:
        unavailable || loans.filter((loan) => loan.status === "pending").length,
      detail: "Awaiting loan approval",
      Icon: CalendarDays,
      color: "bg-purple-50 text-purple-600 dark:bg-purple-950",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaries.map(({ title, value, detail, Icon, color }) => (
          <section key={title} className={`${panel} min-w-0 p-4`}>
            <div className="mb-3 flex items-start justify-between gap-3">
              <h2 className="max-w-32 text-sm uppercase tracking-wide text-slate-500 dark:text-slate-400">
                {title}
              </h2>
              <span className={`rounded-lg p-1.5 ${color}`}>
                <Icon className="size-3.5" />
              </span>
            </div>
            <p className="break-words text-xl font-semibold tracking-tight tabular-nums">
              {value}
            </p>
            <p className="mt-1 text-sm text-slate-400">{detail}</p>
          </section>
        ))}
      </div>

      <section className={panel}>
        <div className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-xl font-semibold">Available Loans</h2>
            <p className="mt-1 text-md text-slate-500">
              Explore cooperative loan packages for your next application
            </p>
          </div>
          <div className="flex gap-2">
            <div className="relative min-w-0 flex-1">
              <Search className="absolute left-3 top-2.5 size-3 text-slate-400" />
              <Input
                aria-label="Search loan packages"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search packages..."
                className="h-8 rounded-full pl-8 text-xs lg:w-52"
              />
            </div>
            <select
              aria-label="Filter loan type"
              className="h-8 rounded-full border bg-background px-3 text-sm"
              value={type}
              onChange={(event) => setType(event.target.value)}
            >
              <option value="all">All Types</option>
              {[
                ...new Set(
                  packages.map((item) => item.loan_type).filter(Boolean),
                ),
              ].map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </div>
        </div>
        <Table className={table}>
          <TableHeader className="bg-slate-50/70 dark:bg-slate-900/50">
            <TableRow>
              <TableHead>Amount</TableHead>
              <TableHead>Loan name</TableHead>
              <TableHead>Loan type</TableHead>
              <TableHead>Interest &amp; term</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPackages.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="text-sm font-semibold tabular-nums">
                  {money(item.loan_amount)}
                </TableCell>
                <TableCell className="max-w-40 whitespace-normal font-medium">
                  {item.loan_name}
                </TableCell>
                <TableCell>
                  <span
                    className={`rounded-full border px-2 py-0.5 text-sm ${item.loan_type === "Member" ? "border-emerald-100 bg-emerald-50 text-emerald-700 dark:bg-emerald-950" : "border-blue-100 bg-blue-50 text-blue-600 dark:bg-blue-950"}`}
                  >
                    {item.loan_type}
                  </span>
                </TableCell>
                <TableCell className="text-sm text-slate-500">
                  {item.interest_rate}% interest
                  <br />
                  Term: {item.term_months}
                </TableCell>
                <TableCell>
                  <Badge status={item.isStatus} />
                </TableCell>
                <TableCell className="text-right">
                  {(!item.isStatus || item.isStatus === "rejected") && (
                    <Button
                      onClick={() => onApply(item)}
                      className="h-7 rounded-lg bg-emerald-600 px-3 text-sm text-white hover:bg-emerald-700"
                    >
                      Apply Now
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {!filteredPackages.length && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-24 text-center text-muted-foreground"
                >
                  No loan packages found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </section>

      <section className={panel}>
        <div className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-xl font-semibold">Your Loans</h2>
            <p className="mt-1 text-md text-slate-500">
              Track your submitted loan requests and their approval progress
            </p>
          </div>
          <div
            aria-label="Filter your loans"
            className="flex flex-wrap gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-900"
          >
            {["all", "approved", "pending", "rejected"].map((value) => (
              <button
                type="button"
                key={value}
                aria-pressed={status === value}
                onClick={() => {
                  setStatus(value);
                  setPage(1);
                }}
                className={`rounded-lg px-2.5 py-1.5 text-sm capitalize ${status === value ? "bg-background text-foreground shadow-sm" : "text-slate-500"}`}
              >
                {value} (
                {value === "all"
                  ? loans.length
                  : loans.filter((loan) => loan.status === value).length}
                )
              </button>
            ))}
          </div>
        </div>
        <Table className={table}>
          <TableHeader className="bg-slate-50/70 dark:bg-slate-900/50">
            <TableRow>
              {[
                "Amount",
                "Loan name",
                "Loan type",
                "Co-borrower",
                "Co-borrower status",
                "Status",
                "Created at",
                "Actions",
              ].map((title) => (
                <TableHead key={title}>{title}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {!unavailable &&
              visibleLoans.map((loan) => (
                <TableRow key={loan.id}>
                  <TableCell className="text-sm font-semibold tabular-nums">
                    {money(loan.loan_type?.loan_amount || 0)}
                  </TableCell>
                  <TableCell className="max-w-36 whitespace-normal font-medium">
                    {loan.loan_type?.loan_name}
                  </TableCell>
                  <TableCell>
                    <span className="rounded bg-slate-100 px-2 py-0.5 text-sm dark:bg-slate-800">
                      {loan.loan_type?.loan_type}
                    </span>
                  </TableCell>
                  <TableCell>
                    {loan.coborrower ? (
                      <div className="flex items-center gap-2">
                        <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[9px] text-slate-500 dark:bg-slate-800">
                          {[
                            loan.coborrower.first_name,
                            loan.coborrower.last_name,
                          ]
                            .filter(Boolean)
                            .map((part) => part[0])
                            .join("")}
                        </span>
                        <span className="max-w-28 whitespace-normal">
                          {[
                            loan.coborrower.first_name,
                            loan.coborrower.middle_name,
                            loan.coborrower.last_name,
                          ]
                            .filter(Boolean)
                            .join(" ")}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm italic text-slate-400">
                        Not Assigned
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {loan.coborrower ? (
                      <Badge status={loan.coborrower_status} />
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge status={loan.status} />
                  </TableCell>
                  <TableCell className="text-sm text-slate-500">
                    {loan.created_at &&
                    !Number.isNaN(new Date(loan.created_at).getTime())
                      ? new Date(loan.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "N/A"}
                  </TableCell>
                  <TableCell>
                    <Link
                      to={`/loans/${loan.id}`}
                      aria-label={`View ${loan.loan_type?.loan_name || "loan"} details`}
                      className="inline-flex size-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <Eye className="size-3.5" />
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            {(unavailable || !visibleLoans.length) && (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="h-24 text-center text-muted-foreground"
                >
                  {loansLoading
                    ? "Loading your loans…"
                    : loansError
                      ? "Unable to load your loans. Please refresh to try again."
                      : "No loan applications found."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <div className="flex items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/50 px-5 py-3 dark:border-slate-800 dark:bg-slate-900/30">
          <p className="text-sm text-slate-500">
            Showing {unavailable ? 0 : visibleLoans.length} of{" "}
            {filteredLoans.length} loan applications
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="h-6 rounded-lg text-sm"
              disabled={currentPage === 1 || Boolean(unavailable)}
              onClick={() => setPage(currentPage - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              className="h-6 rounded-lg text-sm"
              disabled={currentPage >= pages || Boolean(unavailable)}
              onClick={() => setPage(currentPage + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
