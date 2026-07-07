import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export function useUserLoanTypes() {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: ["user-loan-types"],
    queryFn: async () => {
      const authProfile = queryClient.getQueryData(["auth-profile"]);

      const user = authProfile?.user;

      if (!user) throw new Error("No user");

      const { data: userLoan, error: userLoanError } = await supabase
        .from("loans")
        .select("*")
        .eq("member_id", user.id);

      if (userLoanError) throw userLoanError;

      const { data, error } = await supabase
        .from("loan_type")
        .select(`*,  special_payment_date (*)`)
        .eq("archive", false);

      if (error) throw error;

      const updatedData = data.map((item) => {
        const status = userLoan.find((l) => l.loan_type_id === item.id);
        return {
          ...item,
          isStatus: status ? status.status : null,
        };
      });

      console.log("data", updatedData);
      return updatedData;
    },
    staleTime: 1000 * 60 * 5,
  });
}

//GET USER LOANS
export function useUserLoans() {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: ["loans"],
    queryFn: async () => {
      const authProfile = queryClient.getQueryData(["auth-profile"]);

      const user = authProfile?.user;

      if (!user) throw new Error("No user");

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

      if (userLoanError) throw userLoanError;

      return userLoan;
    },
  });
}

// CREATE USER LOAN
export function useCreateUserLoan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload) => {
      const authProfile = queryClient.getQueryData(["auth-profile"]);

      const user = authProfile?.user;

      if (!user) throw new Error("No user");
      const { data, error } = await supabase
        .from("loans")
        .insert([
          {
            member_id: user.id,
            loan_type_id: payload.loan_id,
            status: "pending",
            coborrower_status: "pending",

            coborrower_id: payload.coborrower,
            terms_and_conditions: payload.accepted,
          },
        ])
        .select(`*,  loan_type:loan_type_id (*)  `);

      console.log("Create user loan response:", { data, error });

      if (error) throw error;

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-loan-types"] });
      queryClient.invalidateQueries({ queryKey: ["loans"] });
    },
  });
}

// CREATE special payment dates
export function useCreateLoanPayments() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload) => {
      const { data, error } = await supabase
        .from("loan_payments")
        .insert(payload)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["loan-payments"]);
    },
  });
}

// FETCH SINGLE LOAN
export function useFetchSingleLoan(loanId) {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: ["loan", loanId],
    enabled: !!loanId,
    queryFn: async () => {
      const authProfile = queryClient.getQueryData(["auth-profile"]);

      const user = authProfile?.user;

      if (!user) throw new Error("No user");

      const { data, error } = await supabase
        .from("loans")
        .select(
          `
          *,
          member:member_id (*),
          coborrower:coborrower_id (*),
          loan_type:loan_type_id (*),
            loan_payments (*)
        `,
        )
        .eq("member_id", user.id)
        .eq("id", loanId)
        .single();
      if (error) throw error;
      return data;
    },
  });
}

// GET All loans for restructuring
// export function useFetchAllLoans({ search, page = 1, pageSize = 10 }) {
//   const queryClient = useQueryClient();

//   return useQuery({
//     queryKey: ["restructure-loans", search, page, pageSize],
//     queryFn: async () => {
//       const authProfile = queryClient.getQueryData(["auth-profile"]);
//       const user = authProfile?.user;

//       if (!user) throw new Error("No user");

//       const from = (page - 1) * pageSize;
//       const to = from + pageSize - 1;

//       let query = supabase
//         .from("loans")
//         .select(
//           `
//           *,
//           member:users!loans_member_id_fkey!inner (*),
//           coborrower:coborrower_id (*),
//           loan_type:loan_type_id (*),
//           loan_payments (*)
//         `,
//           { count: "exact" },
//         )
//         .eq("status", "approved")
//         .neq("member_id", user.id)
//         .order("created_at", { ascending: false })
//         .range(from, to);

//       if (search) {
//         query = query.or(
//           `first_name.ilike.%${search}%,middle_name.ilike.%${search}%,last_name.ilike.%${search}%`,
//           {
//             referencedTable: "users",
//           },
//         );
//       }

//       const { data, error, count } = await query;

//       if (error) throw error;

//       return {
//         loans: data || [],
//         count: count || 0,
//         totalPages: Math.ceil((count || 0) / pageSize),
//       };
//     },
//     placeholderData: (previousData) => previousData,
//   });
// }

// GET All loans for restructuring
export function useFetchAllLoans({ search, page = 1, pageSize = 10 }) {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ["restructure-loans", search, page, pageSize],
    queryFn: async () => {
      const authProfile = queryClient.getQueryData(["auth-profile"]);
      const user = authProfile?.user;

      if (!user) throw new Error("No user");

      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      const { data, error } = await supabase.rpc("get_loans_over_50_percent", {
        p_user_id: user.id,
        p_search: search || null,
      });

      if (error) throw error;

      return {
        loans: data || [],
        count: data?.length || 0,
        totalPages: Math.ceil((data?.length || 0) / pageSize),
      };
    },
    placeholderData: (previousData) => previousData,
  });
}
export function useRestructureLoan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ loanId }) => {
      const authProfile = queryClient.getQueryData(["auth-profile"]);

      const user = authProfile?.profile;

      if (!user) throw new Error("No user");

      const { data, error } = await supabase
        .from("loans")
        .update({
          restructured: true,
          restructured_date: new Date().toISOString(),
        })
        .eq("id", loanId)
        // .eq("restructured", false)
        .select();

      if (error) throw error;

      // if (!data || data.length === 0) {
      //   throw new Error("This loan has already been restructured.");
      // }

      console.log("Restructure loan response:", { data, error });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["restructure-loans"] });
    },
  });
}
