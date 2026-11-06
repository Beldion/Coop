import { supabase } from "@/lib/supabase";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

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

  console.log("loginUser data:", await getUserProfile(data.user));
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

export function useAuthLogin() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (authLogin) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: authLogin.email,
        password: authLogin.password,
      });

      if (error) throw error;

      console.log("loginUse312312312312r data:", data);
      // Get user record from users table
      const { data: profile, error: profileError } = await supabase
        .from("users")
        .select("coop_status")
        .eq("id", data.user.id)
        .single();

      if (profileError) {
        await supabase.auth.signOut();
        throw profileError;
      }

      if (profile.coop_status !== "active") {
        await supabase.auth.signOut();
        throw new Error(
          "Your account is inactive. Please contact the administrator.",
        );
      }

      console.log("loginUser data:", profile);

      return data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries(["auth-profile"]);
      navigate("/");
    },
  });
}
