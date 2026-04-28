import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

// Fetch All loans with you as coborrowers
export function useFetchLoansAsApprover() {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: ["loans-as-approver"],
    queryFn: async () => {
      const authProfile = queryClient.getQueryData(["auth-profile"]);

      const user = authProfile?.profile;

      if (!user) throw new Error("No user");

      let query = supabase
        .from("loans")
        .select(
          `
      *,
      member:member_id (*),
      loan_type:loan_type_id (*)
    `,
        )
        .neq("coborrower_id", user.id)
        .neq("member_id", user.id);

      if (user.role == "approver-2") {
        query = query.eq("approver_1_status", "approved");
      }

      if (user.role == "admin") {
        query = query
          .eq("approver_1_status", "approved")
          .query.eq("approver_2_status", "approved");
      }
      const { data: userLoan, error: userLoanError } = await query;
      if (userLoanError) throw userLoanError;

      console.log("user loans fin approer", user.role, userLoan);
      return userLoan;
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useRejectAsApprover() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ loanId, status }) => {
      const authProfile = queryClient.getQueryData(["auth-profile"]);

      const user = authProfile?.user;

      if (!user) throw new Error("No user");

      let updateData = null;

      if (user.role == "approver-1") {
        updateData = {
          status: status,
          approver_1_status: status,
          approver_1_status_date: new Date().toISOString(),
          approver_1: user.id,
        };
      }

      if (user.role == "approver-2") {
        updateData = {
          status: status,
          approver_2_status: status,
          approver_2_status_date: new Date().toISOString(),
          approver_2: user.id,
        };
      }

      if (user.role == "admin") {
        updateData = {
          status: status,
          admin_status_date: new Date().toISOString(),
          approver_admin: user.id,
        };
      }
      const { data, error } = await supabase
        .from("loans")
        .update(updateData)
        .eq("id", loanId)
        .select();

      if (error) {
        console.error("Update error:", error);
        return error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["loans-as-approver"] });
    },
  });
}

export function useApproveAsApprover() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ loanId, status }) => {
      const authProfile = queryClient.getQueryData(["auth-profile"]);

      const user = authProfile?.user;

      if (!user) throw new Error("No user");

      let updateData = null;

      if (user.role == "approver-1") {
        updateData = {
          approver_1_status: status,
          approver_1_status_date: new Date().toISOString(),
          approver_1: user.id,
        };
      }

      if (user.role == "approver-2") {
        updateData = {
          approver_2_status: status,
          approver_2_status_date: new Date().toISOString(),
          approver_2: user.id,
        };
      }

      if (user.role == "admin") {
        updateData = {
          status: status,
          admin_status_date: new Date().toISOString(),
          approver_admin: user.id,
        };
      }
      const { data, error } = await supabase
        .from("loans")
        .update(updateData)
        .eq("id", loanId)
        .select();

      if (error) throw error;

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["loans-as-approver"] });
    },
  });
}
