import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

// Fetch All loans with you as coborrowers
export function useFetchLoansAsCoborrower() {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: ["loans-as-coborrowers"],
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
      loan_type:loan_type_id (*)
    `,
        )
        .eq("coborrower_id", user.id);

      if (userLoanError) throw userLoanError;

      return userLoan;
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useRejectAsCoborrower() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ loanId, status }) => {
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["loans-as-coborrowers"] });
    },
  });
}

export function useApproveAsCoborrower() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ loanId, status }) => {
      const { data, error } = await supabase
        .from("loans")
        .update({
          coborrower_status: status,
          coborrower_status_date: new Date().toISOString(),
        })
        .eq("id", loanId)
        .select();

      if (error) throw error;

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["loans-as-coborrowers"] });
    },
  });
}
