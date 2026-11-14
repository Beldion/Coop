import { useNavigate } from "react-router-dom";
import { RefreshCw, Download, Wallet, CheckCircle2, Clock, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TableSkeleton } from "@/components/TableSkeleton";
import ApprovalsTable from "@/components/approvalsTable";
import { useLoanDirectory } from "@/api/loans";
import { money, exportToCSV } from "@/lib/utils";

export function LoansPage() {
  const navigate = useNavigate();
  const { data: loans = [], isLoading, isError, isFetching, refetch } = useLoanDirectory();
  if (isLoading) return <TableSkeleton />;
  const approved = loans.filter((loan) => loan.status === "approved");
  const cards = [
    { title: "Total Loans", value: loans.length, detail: "All accessible loan applications", Icon: Users, color: "bg-blue-50 text-blue-600 dark:bg-blue-950" },
    { title: "Approved Loans", value: approved.length, detail: "Approved applications", Icon: CheckCircle2, color: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950" },
    { title: "Pending Applications", value: loans.filter((loan) => loan.status === "pending").length, detail: "Awaiting approval", Icon: Clock, color: "bg-amber-50 text-amber-600 dark:bg-amber-950" },
    { title: "Approved Principal", value: money(approved.reduce((sum, loan) => sum + (Number(loan.type?.loan_amount) || 0), 0)), detail: "Original approved loan amounts", Icon: Wallet, color: "bg-purple-50 text-purple-600 dark:bg-purple-950" },
  ];
  return <div className="space-y-6">
    <div className="flex flex-wrap items-center justify-between gap-4"><div><h1 className="text-3xl font-bold tracking-tight">Loans</h1><p className="mt-1 text-sm text-muted-foreground">Browse loan applications, borrowers, and approval status.</p></div><div className="flex gap-2"><Button variant="outline" className="rounded-xl" disabled={isFetching} onClick={() => refetch()}><RefreshCw className={`size-4 ${isFetching ? "animate-spin" : ""}`} />Refresh</Button><Button variant="outline" className="rounded-xl" disabled={isError || !loans.length} onClick={() => exportToCSV(loans.map((loan) => ({ id: loan.id, member: [loan.member?.first_name, loan.member?.middle_name, loan.member?.last_name].filter(Boolean).join(" "), employee_id: loan.member?.employee_id, package: loan.type?.loan_name, type: loan.type?.loan_type, principal: loan.type?.loan_amount, status: loan.status, created_at: loan.created_at })), "all-loans.csv")}><Download className="size-4" />Export Loans</Button></div></div>
    {isError ? <div role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700 dark:bg-rose-950">Unable to load loans. Use Refresh to try again.</div> : <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map(({ title, value, detail, Icon, color }) => <section key={title} className="min-w-0 rounded-2xl border border-slate-200/80 bg-card p-5 shadow-sm dark:border-slate-800"><div className="flex items-center justify-between gap-2"><h2 className="text-[10px] font-medium uppercase tracking-wide text-slate-500">{title}</h2><span className={`rounded-lg p-2 ${color}`}><Icon className="size-4" /></span></div><p className="mt-3 break-words text-2xl font-semibold tracking-tight tabular-nums">{value}</p><p className="mt-1 text-[10px] text-slate-400">{detail}</p></section>)}</div>
      <ApprovalsTable loans={loans} title="All Loans" description="Search the loan directory and open an application for full details" actionLabel="View Details" onReview={(loan) => navigate(`/loans/${loan.id}`)} />
    </>}
  </div>;
}
