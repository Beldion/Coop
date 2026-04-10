import { Routes, Route } from "react-router-dom";
import Login from "./pages/login";
import Signup from "./pages/signup";
import Dashboard from "./pages/dashboard";
import ForgotPassword from "./pages/forgot-password";
import ResetPassword from "./pages/reset-password";
import ProtectedRoute from "./components/protectedRoute";

import "./App.css";
import { UsersPage } from "./pages/usersPage";
import { LoansPage } from "./pages/loanPage";
import { PaymentsPage } from "./pages/paymentsPage";
import { LedgerPage } from "./pages/ledgerPage";
import { AppLayout } from "./components/appLayout";
import { LoanDetailsPage } from "./pages/loanDetails";

import { Toaster } from "sonner";
import ProfilePage from "./pages/profilePage";
import { LoanType } from "./pages/loanType";
import RestructuringPage from "./pages/restructuring";
import ApprovalsPage from "./pages/approvals";
import ReportsPage from "./pages/reports";

function App() {
  return (
    <>
      <div className="w-full flex justify-center align-items">
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Dashboard />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/users"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <UsersPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/loans"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <LoansPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/loans/types"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <LoanType />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <ReportsPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/restructuring"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <RestructuringPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/approvals"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <ApprovalsPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/loans/:loanId"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <LoanDetailsPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/payments"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <PaymentsPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/ledger"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <LedgerPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <ProfilePage />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* <Route path="/signup" element={<Signup />} /> */}
        </Routes>
        <Toaster position="top-right" richColors />
      </div>
    </>
  );
}

export default App;
