// // context/AuthContext.jsx
// import { createContext, useContext, useEffect, useState } from "react";
// import { supabase } from "../lib/supabase";
// import { useAuthStore } from "@/store/useStore";

// const AuthContext = createContext();

// export function AuthProvider({ children }) {
//   const [loading, setLoading] = useState(true);

//   const [userSession, setUserSession] = useState(null);

//   const handleSession = async (session) => {
//     console.log("SESSION:", session);

//     const user = session?.user ?? null;

//     // ✅ set user correctly

//     if (user) {
//       // ✅ check if user already exists
//       const { data: existingUser } = await supabase
//         .from("users")
//         .select("*")
//         .eq("id", user.id)
//         .single();
//       setUser({ user: existingUser });
//     }

//     console.log(session?.user);

//     setUserSession(session?.user);
//     // setSession(session?.user);
//   };

//   const setUser = useAuthStore((state) => state.setUser);
//   useEffect(() => {
//     // get current session
//     supabase.auth.getSession().then(({ data: { session } }) => {
//       handleSession(session);
//       setLoading(false);
//     });

//     // listen to auth changes
//     const { data: listener } = supabase.auth.onAuthStateChange(
//       (_event, session) => {
//         console.log(session, _event);
//         handleSession(session);
//       },
//     );

//     return () => {
//       listener.subscription.unsubscribe();
//     };
//   }, []);

//   // useEffect(() => {
//   //   if (session) {
//   //     navigate("/");
//   //   } else {
//   //     console.log(session);
//   //   }
//   // }, [session, navigate]);

//   // useEffect(() => {
//   //   // get current session
//   //   supabase.auth.getSession().then(({ data }) => {
//   //     console.log(data);
//   //     setUser(data.session?.user ?? null);
//   //     setLoading(false);
//   //   });

//   //   // listen to changes
//   //   const { data: listener } = supabase.auth.onAuthStateChange((_, session) => {
//   //     setUser(session?.user ?? null);
//   //   });

//   //   return () => listener.subscription.unsubscribe();
//   // }, []);

//   return (
//     <AuthContext.Provider value={{ userSession, loading }}>
//       {children}
//     </AuthContext.Provider>
//   );
// }

// export const useAuth = () => useContext(AuthContext);
