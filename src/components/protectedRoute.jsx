import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useQueryClient } from "@tanstack/react-query";
export default function ProtectedRoute({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    // initial session
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);

      // 🔥 Refetch auth profile when login/logout happens
      queryClient.invalidateQueries(["auth-profile"]);
    });

    // listen to changes (login/logout)
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      },
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  if (loading) return <div className="p-6">Loading...</div>;

  if (!session) return <Navigate to="/login" replace />;

  return children;
}
