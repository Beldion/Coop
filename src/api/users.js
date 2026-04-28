import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
// Fetch All users
export function useFetchAllUsers() {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: ["all-users"],
    queryFn: async () => {
      const authProfile = queryClient.getQueryData(["auth-profile"]);

      const user = authProfile?.user;

      if (!user) throw new Error("No user");
      if (!user) return null;

      // 2. get profile from your users table
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .neq("role", "admin")
        .neq("id", user.id);

      if (error) throw error;

      return data;
    },
    staleTime: 1000 * 60 * 5,
  });
}

// update single member admin only
export function useUpdateUsers() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (user) => {
      const { data, error } = await supabase
        .from("users")
        .update(user)
        .eq("id", user.id)
        .select()
        .single();

      console.log("mutatte:::", user);
      if (error) throw error;

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-users"] });
    },
  });
}

//get Auth + Profile users table
export function useAuthProfile() {
  return useQuery({
    queryKey: ["auth-profile"],
    queryFn: async () => {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) throw authError;

      if (!user) {
        return {
          user: null,
          profile: null,
        };
      }

      const { data: profile, error: profileError } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) throw profileError;

      return {
        user,
        profile,
      };
    },
    staleTime: 1000 * 60 * 5,
  });
}

// update profile
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updatedProfile) => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;
      if (!user) throw new Error("No logged-in user");

      const { data, error } = await supabase
        .from("users")
        .update(updatedProfile)
        .eq("id", user.id)
        .select()
        .single();

      if (error) throw error;

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth-profile"] });
    },
  });
}
// export async function getUserProfile(session) {
//   console.log("SESSION:", session);

//   const user = session ?? null;

//   // ✅ set user correctly

//   if (user) {
//     // ✅ check if user already exists
//     const { data: existingUser } = await supabase
//       .from("users")
//       .select("*")
//       .eq("id", user.id)
//       .single();
//     console.log("users table", existingUser);
//     return existingUser;
//   }
//   return null;
// }
