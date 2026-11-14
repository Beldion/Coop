import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/useStore";

import { Button } from "./ui/button";
import {
  LayoutDashboard,
  Users,
  Wallet,
  CreditCard,
  BookOpen,
  LogOut,
  Menu,
  X,
  FileText,
  BarChart3,
  ClipboardList,
  Files,
  Building2,
} from "lucide-react";

const navigation = [
  {
    name: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
    role: "all",
  },
  {
    name: "Co-Borrowers",
    href: "/coborrowers",
    icon: Users,
    role: "member",
  },

  {
    name: "Users",
    href: "/users",
    icon: Users,
    role: "admin",
  },
  {
    name: "Reports",
    href: "/reports",
    icon: BarChart3,
    role: ["admin", "approver-2"],
  },
  {
    name: "Restructuring",
    href: "/restructuring",
    icon: ClipboardList,
    role: "admin",
  },
  {
    name: "Loan Applications",
    href: "/approvals",
    icon: Files,
    role: "approver",
  },
  // {
  //   name: "Payments",
  //   href: "/payments",
  //   icon: Wallet,
  //   role: ["admin", "approver-2"],
  // },

  {
    name: "Loan Types",
    href: "/loans/types",
    icon: CreditCard,
    role: "admin",
  },
];

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import { useAuthProfile } from "@/api/users";

export function AppLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useAuthProfile();

  console.log("user 11212", data);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    },
    onSuccess: () => {
      // 🔥 clear + refetch
      queryClient.removeQueries(["auth-profile"]);
      queryClient.invalidateQueries(["auth-profile"]);
      navigate("/login");
    },
  });

  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p>Something went wrong.</p>;

  if (!data?.profile) return <p>No user found.</p>;
  return (
    <div className="w-full lg:pl-[18rem] min-h-screen bg-background">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        id="app-sidebar"
        aria-label="Main sidebar"
        className={`fixed top-0 left-0 z-40 h-dvh w-[18rem] bg-card border-r border-slate-200/70 transition-transform dark:border-slate-800 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="mx-4 flex min-h-20 items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800">
            <Link
              to="/"
              onClick={() => setSidebarOpen(false)}
              className="flex min-w-0 items-center gap-2.5"
            >
              <span className="flex size-13 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-slate-600 to-slate-950 text-white shadow-sm">
                <Building2 className="size-8" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="text-lg font-semibold tracking-tight">
                  Coop Lending
                </p>
                <p className="mt-0.5 text-sm text-slate-400">
                  Member Financial Portal
                </p>
              </div>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="size-6 shrink-0 text-slate-400 lg:hidden"
              aria-label="Close navigation"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav
            aria-label="Main navigation"
            className="min-h-0 flex-1 overflow-y-auto px-4 py-5 space-y-1.5"
          >
            {navigation.map((item) => {
              const isActive =
                location.pathname === item.href ||
                (item.href !== "/" &&
                  location.pathname.startsWith(`${item.href}/`));

              if (
                (data?.profile?.role == "member" && item.role == "member") ||
                (data?.profile?.role == "admin" &&
                  item.role.includes("admin")) ||
                (data?.profile?.role == "approver-2" &&
                  item.role.includes("approver-2")) ||
                (data?.profile?.role != "member" && item.role == "approver") ||
                item.role == "all"
              )
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    aria-current={isActive ? "page" : undefined}
                    className={`flex min-h-9 items-center gap-3 px-3 py-2 rounded-sm text-md font-medium transition-colors ${
                      isActive
                        ? "bg-slate-900 text-white shadow-sm dark:bg-slate-100 dark:text-slate-950"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-slate-100"
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon
                      aria-hidden="true"
                      className={`size-5 shrink-0 ${isActive ? "" : "text-slate-400"}`}
                    />
                    {item.name}
                  </Link>
                );
            })}
          </nav>

          {/* User section */}
          <div className="shrink-0 space-y-2 border-t border-slate-100 p-3 dark:border-slate-800">
            <Link
              to="/profile"
              onClick={() => setSidebarOpen(false)}
              className="block rounded-xl border border-slate-200/70 shadow-sm transition-colors hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900"
            >
              <div className="flex items-center gap-2.5 p-2">
                <div className="flex-shrink-0 size-10 bg-slate-200 rounded-full flex items-center justify-center dark:bg-slate-800">
                  <span className="text-md font-medium text-slate-600 dark:text-slate-300">
                    {(
                      data.profile.first_name ||
                      data.profile.name ||
                      data.profile.email ||
                      "U"
                    )
                      .charAt(0)
                      .toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className="text-sm font-medium truncate"
                    title={data.profile.email}
                  >
                    {data.profile.email ||
                      data.profile.name ||
                      data.profile.first_name}
                  </p>
                  <p className="mt-1 inline-block max-w-full truncate rounded bg-emerald-50 px-1.5 py-0.5 text-sm capitalize text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                    {data.profile.role?.replaceAll("-", " ") || "Account"}
                  </p>
                </div>
              </div>
            </Link>
            <Button
              variant="outline"
              size="lg"
              className="h-10 w-full rounded-lg border-slate-200/70 bg-slate-50/50 text-md font-normal text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400"
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
            >
              <LogOut className="size-3" />
              {logoutMutation.isPending ? "Logging out..." : "Logout Account"}
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="w-full">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex items-center h-16 px-6 bg-card border-b border-border">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label="Open navigation"
            aria-expanded={sidebarOpen}
            aria-controls="app-sidebar"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex-1" />
        </header>

        {/* Page content */}
        <main className="w-full p-6">{children}</main>
      </div>
    </div>
  );
}
