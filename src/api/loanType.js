import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
// fetch all loan types
export function useAllLoanTypes() {
  return useQuery({
    queryKey: ["loan-types"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("loan_type")
        .select(`*,  special_payment_date (*)`)
        .eq("archive", false);

      if (error) throw error;

      console.log("loan types", data);
      return data;
    },
    staleTime: 1000 * 60 * 5,
  });
}

// archive loan type
export function useArchiveLoanTypes() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      const { data, error } = await supabase
        .from("loan_type")
        .update({ archive: true })
        .eq("id", id)
        .select();

      if (error) throw error;

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["loan-types"] });
    },
  });
}

export function useCreateLoanTypes() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload) => {
      // ✅ Get current authenticated user
      const authProfile = queryClient.getQueryData(["auth-profile"]);

      const user = authProfile?.user;

      if (!user) throw new Error("No user");
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
      if (error) throw error;

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["loan-types"] });
    },
  });
}

// CREATE special payment dates
export function useCreateSpecialPaymentDates() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload) => {
      const { data, error } = await supabase
        .from("special_payment_date")
        .insert(payload)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["special-payment-dates"]);
      queryClient.invalidateQueries({ queryKey: ["loan-types"] });
    },
  });
}
