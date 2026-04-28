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
        .select("*")
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
        .select();

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
