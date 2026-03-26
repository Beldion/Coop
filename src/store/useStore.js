import { create } from "zustand";
import { persist } from "zustand/middleware";
import { supabase } from "@/lib/supabase";
import { AwardIcon } from "lucide-react";
// MOCK DATA
const mockUsers = [
  {
    id: "1",
    name: "Admin User",
    email: "admin@coop.com",
    role: "admin",
    phone: "+1234567890",
    created_at: new Date("2024-01-01").toISOString(),
  },
  {
    id: "2",
    name: "John Doe",
    email: "john@example.com",
    role: "member",
    phone: "+1234567891",
    created_at: new Date("2024-01-15").toISOString(),
  },
  {
    id: "3",
    name: "Jane Smith",
    email: "jane@example.com",
    role: "member",
    phone: "+1234567892",
    created_at: new Date("2024-02-01").toISOString(),
  },
];

const mockLoans = [
  {
    id: "L001",
    member_id: "2",
    member_name: "John Doe",
    loan_amount: 50000,
    interest_rate: 5,
    term_months: 12,
    start_date: new Date("2024-02-01").toISOString(),
    status: "approved",
    created_at: new Date("2024-02-01").toISOString(),
  },
  {
    id: "L002",
    member_id: "3",
    member_name: "Jane Smith",
    loan_amount: 100000,
    interest_rate: 4.5,
    term_months: 24,
    start_date: new Date("2024-03-01").toISOString(),
    status: "approved",
    created_at: new Date("2024-03-01").toISOString(),
  },
];

const mockPayments = [
  {
    id: "P001",
    loan_id: "L001",
    amount: 5000,
    payment_date: new Date("2024-03-01").toISOString(),
    payment_method: "gcash",
    created_at: new Date("2024-03-01").toISOString(),
  },
  {
    id: "P002",
    loan_id: "L001",
    amount: 5000,
    payment_date: new Date("2024-04-01").toISOString(),
    payment_method: "bank",
    created_at: new Date("2024-04-01").toISOString(),
  },
];

const mockLedger = [
  {
    id: "LE001",
    loan_id: "L001",
    type: "debit",
    amount: 50000,
    description: "Loan disbursement for John Doe",
    created_at: new Date("2024-02-01").toISOString(),
  },
  {
    id: "LE002",
    loan_id: "L001",
    type: "credit",
    amount: 5000,
    description: "Payment received via GCash",
    created_at: new Date("2024-03-01").toISOString(),
  },
  {
    id: "LE003",
    loan_id: "L001",
    type: "credit",
    amount: 5000,
    description: "Payment received via Bank",
    created_at: new Date("2024-04-01").toISOString(),
  },
];

// AUTH STORE

async function getUserProfile(session) {
  console.log("SESSION:", session);

  const user = session ?? null;

  // ✅ set user correctly

  if (user) {
    // ✅ check if user already exists
    const { data: existingUser } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single();
    console.log("users table", existingUser);
    return existingUser;
  }

  return null;
}

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      // ✅ LOGIN (Supabase)
      login: async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) return { success: false, error: error };
        set({
          user: await getUserProfile(data.user),
          isAuthenticated: true,
        });

        return { success: true };
      },

      // ✅ SIGNUP
      signup: async (email, password) => {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) return { success: false, error: error };

        set({
          user: await getUserProfile(data.user),
          isAuthenticated: true,
        });

        return { success: true };
      },

      // ✅ LOGOUT
      logout: async () => {
        await supabase.auth.signOut();

        set({
          user: null,
          isAuthenticated: false,
        });
      },

      //Update user

      updateUser: async (updates) => {
        const { data, error } = await supabase
          .from("users")
          .update(updates)
          .eq("id", updates.id)
          .select()
          .single();

        if (error) {
          console.error(error);
          return { success: false, error: error };
        }

        // ✅ update Zustand state after DB update
        set({ user: data });

        return {
          success: true,
          error: false,
        };
      },

      // ✅ SET USER (important for refresh)
      setUser: (user) => {
        set({
          user: user,
          isAuthenticated: true,
        });
      },
    }),
    {
      name: "auth-storage",
    },
  ),
);

export const useUserStore = create((set) => ({
  allUsers: [],
  loading: false,

  fetchUsers: async () => {
    set({ loading: true });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      set({ loading: false });
      return;
    }

    const { data, error } = await supabase
      .from("users")
      .select("*")
      .neq("id", user.id);

    if (error) return { error: error };

    set({
      allUsers: data || [],
      loading: false,
    });
  },

  updateSingleUser: async (user) => {
    const { data, error } = await supabase
      .from("users")
      .update(user)
      .eq("id", user.id)
      .select()
      .single();

    if (error) {
      console.error(error);
      return { success: false, error: error };
    }

    // ✅ update Zustand state after DB update
    set((state) => ({
      allUsers: state.allUsers.map((user) =>
        user.id === data.id ? { ...user, ...data } : user,
      ),
    }));
    return {
      success: true,
      error: false,
    };
  },
}));

// MAIN STORE
export const useStore = create(
  persist(
    (set) => ({
      users: mockUsers,
      loans: mockLoans,
      payments: mockPayments,
      ledger: mockLedger,

      // USER
      addUser: (user) =>
        set((state) => ({
          users: [...state.users, user],
        })),

      updateUser: (id, updatedUser) =>
        set((state) => ({
          users: state.users.map((user) =>
            user.id === id ? { ...user, ...updatedUser } : user,
          ),
        })),

      deleteUser: (id) =>
        set((state) => ({
          users: state.users.filter((user) => user.id !== id),
        })),

      // LOANS
      addLoan: (loan) =>
        set((state) => {
          const newLoan = {
            ...loan,
            id: `L${String(state.loans.length + 1).padStart(3, "0")}`,
            created_at: new Date().toISOString(),
          };

          const ledgerEntry = {
            id: `LE${String(state.ledger.length + 1).padStart(3, "0")}`,
            loan_id: newLoan.id,
            type: "debit",
            amount: loan.loan_amount,
            description: `Loan disbursement for ${
              loan.member_name || "member"
            }`,
            created_at: new Date().toISOString(),
          };

          return {
            loans: [...state.loans, newLoan],
            ledger: [...state.ledger, ledgerEntry],
          };
        }),

      updateLoan: (id, updatedLoan) =>
        set((state) => ({
          loans: state.loans.map((loan) =>
            loan.id === id ? { ...loan, ...updatedLoan } : loan,
          ),
        })),

      deleteLoan: (id) =>
        set((state) => ({
          loans: state.loans.filter((loan) => loan.id !== id),
          payments: state.payments.filter((payment) => payment.loan_id !== id),
          ledger: state.ledger.filter((entry) => entry.loan_id !== id),
        })),

      // PAYMENTS
      addPayment: (payment) =>
        set((state) => {
          const newPayment = {
            ...payment,
            id: `P${String(state.payments.length + 1).padStart(3, "0")}`,
            created_at: new Date().toISOString(),
          };

          const ledgerEntry = {
            id: `LE${String(state.ledger.length + 1).padStart(3, "0")}`,
            loan_id: payment.loan_id,
            type: "credit",
            amount: payment.amount,
            description: `Payment received via ${payment.payment_method}`,
            created_at: new Date().toISOString(),
          };

          return {
            payments: [...state.payments, newPayment],
            ledger: [...state.ledger, ledgerEntry],
          };
        }),

      deletePayment: (id) =>
        set((state) => ({
          payments: state.payments.filter((p) => p.id !== id),
        })),

      // LEDGER
      addLedgerEntry: (entry) =>
        set((state) => ({
          ledger: [
            ...state.ledger,
            {
              ...entry,
              id: `LE${String(state.ledger.length + 1).padStart(3, "0")}`,
              created_at: new Date().toISOString(),
            },
          ],
        })),
    }),
    {
      name: "coop-storage",
    },
  ),
);
