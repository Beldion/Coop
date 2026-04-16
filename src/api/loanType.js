import { supabase } from "@/lib/supabase";

export async function fetchLoanType() {
  const { data, error } = await supabase
    .from("loan_type")
    .select("*")
    .eq("archive", false);

  if (error) {
    throw new Error(error);
  }

  return data;
}
