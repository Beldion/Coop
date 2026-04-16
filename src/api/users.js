import { supabase } from "@/lib/supabase";

export async function fetchUsers() {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function getUserProfile(session) {
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
