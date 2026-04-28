// import { createContext, useContext, useEffect, useState } from "react";
// import { supabase } from "../lib/supabase";

// const AuthContext = createContext();

// export function AuthProvider({ children }) {
//   const [session, setSession] = useState(undefined);
//   const [userAuth, setUserAuth] = useState(undefined);

//   useEffect(() => {
//     let mounted = true;

//     supabase.auth.getSession().then(({ data }) => {
//       if (!mounted) return;

//       setSession(data.session);
//       setUserAuth(data.session?.user ?? null);
//     });

//     const {
//       data: { subscription },
//     } = supabase.auth.onAuthStateChange((_event, session) => {
//       setSession(session);
//       setUserAuth(session?.user ?? null);
//     });

//     return () => {
//       mounted = false;
//       subscription.unsubscribe();
//     };
//   }, []);

//   const loading = session === undefined;

//   return (
//     <AuthContext.Provider value={{ session, userAuth, loading }}>
//       {children}
//     </AuthContext.Provider>
//   );
// }

// export function useAuth() {
//   return useContext(AuthContext);
// }
