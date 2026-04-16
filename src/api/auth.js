import { supabase } from "@/lib/supabase";

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
export async function signUpUser(email, password) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) throw new Error(error);
  return await getUserProfile(data.user);
}

export async function loginUser(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw new Error(error);
  return await getUserProfile(data.user);
}

export async function updateUser(updates) {
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

  return {
    data: data,
    success: true,
    error: false,
  };
}
