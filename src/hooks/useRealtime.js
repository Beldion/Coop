import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { subscribeToAppChanges } from "../lib/realtime";

export function useRealtime(userId) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!userId) return;
    return subscribeToAppChanges(supabase, queryClient, userId);
  }, [queryClient, userId]);
}
