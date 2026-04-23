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

export const useLoanTypeStore = create((set, get) => ({
  loanTypes: [],
  loading: false,

  // FETCH
  fetchLoanTypes: async () => {
    set({ loading: true });

    const { data, error } = await supabase
      .from("loan_type")
      .select("*")
      .eq("archive", false);

    if (error) {
      set({ loading: false });
      return { error };
    }

    const updatedData = data.map((item) => ({
      ...item,
      isApplied: false,
    }));
    set({
      loanTypes: updatedData,
      loading: false,
    });
  },

  // CREATE
  createLoanType: async (payload) => {
    set({ loading: true });

    console.log("Creating loan type with payload:", payload);

    // ✅ Get current authenticated user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      set({ loading: false });
      return { error: { message: "User not authenticated" } };
    }
    const { data, error } = await supabase
      .from("loan_type")
      .insert([
        {
          loan_type: payload.loan_type,
          loan_name: payload.loan_name,
          loan_amount: Number(payload.loan_amount),
          interest_rate: Number(payload.interest_rate),
          term_months: Number(payload.term_months),
          service_fee: Number(payload.service_fee),
          created_by: user.id,
        },
      ])
      .select();

    if (error) {
      set({ loading: false });
      return { error };
    }

    // ✅ Option 1: optimistic update (no refetch)
    set((state) => ({
      loanTypes: data,
      loading: false,
    }));

    // ✅ Option 2 (alternative): refetch
    // await get().fetchLoanTypes();

    return { data };
  },

  // UPDATE ARCHIVE
  updateArchive: async (id) => {
    set({ loading: true });

    const { data, error } = await supabase
      .from("loan_type")
      .update({ archive: true })
      .eq("id", id) // or "id" if you didn’t migrate yet
      .select();

    if (error) {
      set({ loading: false });
      console.log("Error archiving loan type:", error);
      return { error };
    }

    console.log("Archiving loan type with ID:", id, "Response:", data);
    // ✅ update local state
    set((state) => ({
      loanTypes: state.loanTypes.filter((item) => item.id !== id),
      loading: false,
    }));

    return { data };
  },
}));

export const useSearchUsersStore = create((set) => ({
  users: [],
  search: "",
  loading: false,

  setSearch: (value) => set({ search: value }),

  fetchUsers: async (value = "") => {
    if (value.trim() === "") {
      set({ users: [], loading: false });
      return;
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      set({ loading: false });

      return { error: { message: "User not authenticated" } };
    }

    set({ loading: true });
    let query = supabase
      .from("users")
      .select("id, first_name, last_name, middle_name, role")
      .neq("id", user.id)
      .neq("role", "admin")
      .neq("role", "approver-1")
      .neq("role", "approver-2")
      .order("first_name", { ascending: true });

    if (value.trim()) {
      query = query.or(`first_name.ilike.%${value}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.log("Error fetching users:", error.message);
      set({ users: [], loading: false });
      return;
    }

    set({ users: data || [], loading: false });
  },
}));

export const userLoanStore = create((set) => ({
  userLoans: [],
  userLoanTypes: [],
  loading: false,

  fetchUserLoan: async () => {
    set({ loading: true });

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      set({ loading: false });

      return { error: { message: "User not authenticated" } };
    }

    const { data: userLoan, error: userLoanError } = await supabase
      .from("loans")
      .select(
        `
      *,
      member:member_id (*),
      coborrower:coborrower_id (*),
      loan_type:loan_type_id (*)
    `,
      )
      .eq("member_id", user.id);

    if (userLoanError) {
      set({ loading: false });
      return { error: userLoanError };
    }

    console.log("User loans fetched:", userLoan);

    set({
      userLoans: userLoan,
      loading: false,
    });
  },

  fetchUserLoanTypes: async () => {
    set({ loading: true });

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      set({ loading: false });

      return { error: { message: "User not authenticated" } };
    }

    const { data: userLoan, error: userLoanError } = await supabase
      .from("loans")
      .select("*")
      .eq("member_id", user.id);

    if (userLoanError) {
      set({ loading: false });
      console.log("User not authenticated:", userLoanError);
      return { error: userLoanError };
    }
    const { data, error } = await supabase
      .from("loan_type")
      .select("*")
      .eq("archive", false);

    if (error) {
      set({ loading: false });
      return { error };
    }

    const updatedData = data.map((item) => {
      const status = userLoan.find((l) => l.loan_type_id === item.id);
      return {
        ...item,
        isStatus: status ? status.status : null,
      };
    });

    console.log("Updated loan types with user applications:", updatedData);
    set({
      userLoanTypes: updatedData,
      loading: false,
    });
  },
  createUserLoan: async (loanTypeid, coborrowerId = null, termsAccepted) => {
    set({ loading: true });
    // get current logged-in user
    console.log("Creating user loan for loan type ID:", loanTypeid);
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { error: { message: "User not authenticated" } };
    }

    const { data, error } = await supabase
      .from("loans")
      .insert([
        {
          member_id: user.id,
          loan_type_id: loanTypeid,
          status: "pending",
          coborrower_status: "pending",

          coborrower_id: coborrowerId,
          terms_and_conditions: termsAccepted,
        },
      ])
      .select();

    console.log("Create user loan response:", { data, error });

    if (error) {
      set({ loading: false });
      return { error };
    }

    set({
      userLoans: data,
      loading: false,
    });

    return data;
  },
}));

export const useCoBorrowerStore = create((set) => ({
  coBorrowers: [],
  loading: false,

  fetchCoborrowerLoan: async () => {
    set({ loading: true });

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      set({ loading: false });
      console.log("Error fetching co-borrower loans:", userLoanError);

      return { error: { message: "User not authenticated" } };
    }

    const { data: userLoan, error: userLoanError } = await supabase
      .from("loans")
      .select(
        `
      *,
      member:member_id (*),
      loan_type:loan_type_id (*)
    `,
      )
      .eq("coborrower_id", user.id);

    if (userLoanError) {
      set({ loading: false });
      return { error: userLoanError };
    }
    console.log("Coborrower loans fetched:", userLoan);
    set({
      coBorrowers: userLoan,
      loading: false,
    });
  },

  rejectLoans: async (loanId, status) => {
    set({ loading: true });

    const { data, error } = await supabase
      .from("loans")
      .update({
        coborrower_status: status,
        coborrower_status_date: new Date().toISOString(),
      })
      .eq("id", loanId)
      .select();

    if (error) {
      console.error("Update error:", error);
      return error;
    }

    return data;
  },
  approveLoans: async (loanId, status) => {
    set({ loading: true });

    const { data, error } = await supabase
      .from("loans")
      .update({
        coborrower_status: status,
        coborrower_status_date: new Date().toISOString(),
      })
      .eq("id", loanId)
      .select();

    if (error) {
      console.error("Update error:", error);
      return error;
    }

    return data;
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
