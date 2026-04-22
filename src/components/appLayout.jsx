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
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard, isAdmin: false },
  {
    name: "Co-Borrowers",
    href: "/coborrowers",
    icon: LayoutDashboard,
    isAdmin: false,
  },

  { name: "Users", href: "/users", icon: Users, isAdmin: true },
  { name: "Reports", href: "/reports", icon: BarChart3, isAdmin: true },
  {
    name: "Restructuring",
    href: "/restructuring",
    icon: ClipboardList,
    isAdmin: true,
  },
  { name: "Approvals", href: "/approvals", icon: Files, isAdmin: true },

  { name: "Loan Types", href: "/loans/types", icon: CreditCard, isAdmin: true },

  { name: "Payments", href: "/payments", icon: CreditCard, isAdmin: true },
  { name: "Ledger", href: "/ledger", icon: BookOpen, isAdmin: true },
];

export function AppLayout({ children }) {
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="w-full lg:pl-[16rem] min-h-screen bg-background">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen w-64 bg-card border-r border-border transition-transform lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-border">
            <h1 className="text-xl font-bold text-primary">Coop Lending</h1>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;

              if (
                user?.role == "member" &&
                item.isAdmin == true
                // (user?.role == "admin" && item.name == "Loan Types")
              )
                return true;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-md font-medium transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-border">
            <Link to="/profile">
              <div className="flex items-center gap-3 mb-4 p-3 rounded-sm hover:bg-gray-200">
                <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-primary">
                    {user?.first_name &&
                      user?.first_name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-lg font-medium truncate">{user?.name}</p>
                  <p className="text-md text-muted-foreground truncate">
                    {user?.email}
                  </p>
                </div>
              </div>
            </Link>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={logout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
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
