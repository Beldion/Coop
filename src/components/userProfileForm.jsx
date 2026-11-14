import { UserRound, MapPin, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

function Field({ field, label, data, onChange, disabled, required = false, type = "text", className = "" }) {
  return <div className={`space-y-2 ${className}`}><Label htmlFor={`profile-${field}`} className="text-xs font-medium text-slate-600 dark:text-slate-300">{label}{required && <span className="text-rose-500">*</span>}</Label><Input id={`profile-${field}`} name={field} type={type} value={data[field] ?? ""} disabled={disabled} onChange={(event) => onChange(field, event.target.value)} className="h-10 rounded-lg border-slate-300/70 bg-background text-sm shadow-sm dark:border-slate-700" /></div>;
}

export default function UserProfileForm({ data, editing, setData, onCancel, onSave, pending }) {
  const onChange = (field, value) => setData((previous) => ({ ...previous, [field]: value }));
  const initials = [data.first_name, data.last_name].filter(Boolean).map((name) => name.charAt(0)).join("").toUpperCase() || "?";
  const fieldProps = { data, onChange, disabled: !editing };
  const sectionClass = "rounded-xl border border-slate-200/80 bg-slate-50/60 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-900/30";
  return <>
    <DialogHeader className="shrink-0 border-b border-slate-100 px-5 py-5 pr-12 sm:px-6 dark:border-slate-800">
      <div className="flex items-start gap-4"><span aria-hidden="true" className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-emerald-100 text-lg font-semibold text-emerald-700">{initials}</span><div className="min-w-0 space-y-1.5"><div className="flex flex-wrap items-center gap-2"><span className="text-[10px] font-semibold uppercase tracking-wide text-emerald-600">User management · Profile</span><span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] capitalize ${data.coop_status === "active" ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-950" : "border-slate-200 bg-slate-100 text-slate-500 dark:bg-slate-800"}`}><span className="size-1.5 rounded-full bg-current" />{data.coop_status || "Unknown status"}{data.role ? ` · ${data.role.replaceAll("-", " ")}` : ""}</span></div><div className="flex flex-wrap items-center gap-2"><DialogTitle className="text-xl font-semibold tracking-tight">Edit User Profile</DialogTitle><span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-[10px] text-slate-400 dark:bg-slate-800">ID: #{data.employee_id || "N/A"}</span></div><DialogDescription className="text-xs">Update personal information, cooperative identity, and residential address.</DialogDescription></div></div>
    </DialogHeader>
    <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-5 sm:p-6">
      <section className={sectionClass}><div className="mb-4 flex items-center justify-between gap-3 border-b border-slate-100 pb-3 dark:border-slate-800"><h3 className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide"><UserRound className="size-6 rounded bg-emerald-100/60 p-1 text-emerald-700" />1. Personal &amp; cooperative identity</h3></div>
        <div className="space-y-4"><div className="grid gap-4 sm:grid-cols-3"><Field {...fieldProps} field="first_name" label="First Name" /><Field {...fieldProps} field="middle_name" label="Middle Name" /><Field {...fieldProps} field="last_name" label="Last Name" /></div>
          <div className="grid gap-4 sm:grid-cols-2"><Field {...fieldProps} field="employee_id" label="Employee ID" /><div className="space-y-2"><Label htmlFor="profile-status" className="text-xs font-medium text-slate-600 dark:text-slate-300">Membership Status</Label><Select value={data.coop_status || ""} onValueChange={(value) => onChange("coop_status", value)}><SelectTrigger id="profile-status" className="h-10 w-full rounded-lg border-slate-300/70 bg-background text-sm shadow-sm dark:border-slate-700"><SelectValue placeholder="Select status" /></SelectTrigger><SelectContent><SelectItem value="active">Active</SelectItem><SelectItem value="inactive">Inactive</SelectItem></SelectContent></Select></div><Field {...fieldProps} field="birthdate" label="Birthdate" type="date" /><Field {...fieldProps} field="phone" label="Phone Number" type="tel" /></div>
          <Field {...fieldProps} field="tin" label="Tax Identification Number (TIN)" />
        </div>
      </section>
      <section className={sectionClass}><div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3 dark:border-slate-800"><h3 className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide"><MapPin className="size-6 rounded bg-emerald-100/60 p-1 text-emerald-700" />2. Complete residential address</h3><span className="rounded border border-emerald-100 bg-emerald-50 px-2 py-1 text-[10px] text-emerald-700 dark:bg-emerald-950">PH Address</span></div>
        <div className="space-y-4"><Field {...fieldProps} field="address_line_1" label="House#, block, lot, apt, suite, unit, building, floor, etc." /><Field {...fieldProps} field="address_street" label="Street address, village, etc." /><div className="grid gap-4 sm:grid-cols-2"><Field {...fieldProps} field="address_barangay" label="Barangay" /><Field {...fieldProps} field="address_city" label="City / Municipality" /><Field {...fieldProps} field="address_province" label="Province / Administrative Region" /><Field {...fieldProps} field="address_zip_code" label="Zip Code" /></div></div>
      </section>
    </div>
    <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 rounded-b-2xl border-t border-slate-200/70 bg-slate-50 px-6 py-4 dark:border-slate-800 dark:bg-slate-900"><Button type="button" variant="outline" className="h-9 rounded-lg text-xs" onClick={onCancel}>Cancel</Button><Button type="button" className="h-9 rounded-lg bg-emerald-600 px-5 text-xs text-white hover:bg-emerald-700" disabled={pending} onClick={onSave}><Check className="size-4" />{pending ? "Saving…" : "Save Changes"}</Button></div>
  </>;
}
