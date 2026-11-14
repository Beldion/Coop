const loanQueries = [
  "loans", "loan", "user-loan-types", "loans-as-approver",
  "loans-as-coborrowers", "restructure-loans", "reports",
];

export const realtimeQueries = {
  users: ["all-users", "auth-profile", "coborrowers", ...loanQueries],
  loans: loanQueries,
  loan_payments: ["loan", "loan-payments", "restructure-loans", "reports"],
  loan_type: ["loan-types", ...loanQueries],
  special_payment_date: ["loan-types", "user-loan-types", "special-payment-dates"],
};

// Refetch through existing queries so joins, RPC totals and RLS remain authoritative.
export function subscribeToAppChanges(supabase, queryClient, userId) {
  let disposed = false;
  let timer;
  const pending = new Set();
  const schedule = (keys) => {
    if (disposed) return;
    keys.forEach((key) => pending.add(key));
    if (timer) return;
    timer = setTimeout(() => {
      timer = undefined;
      const keysToRefresh = new Set(pending);
      pending.clear();
      void queryClient.invalidateQueries({
        predicate: (query) => keysToRefresh.has(query.queryKey[0]),
      });
    }, 150);
  };

  const channel = supabase.channel(`app-changes:${userId}`);
  for (const [table, keys] of Object.entries(realtimeQueries)) {
    channel.on("postgres_changes", { event: "*", schema: "public", table }, () => {
      schedule(keys);
    });
  }
  channel.subscribe((status, error) => {
    if (disposed) return;
    if (status === "SUBSCRIBED") {
      // Covers changes between the initial fetch and subscription, and missed events offline.
      schedule(Object.values(realtimeQueries).flat());
    } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
      console.warn("Realtime connection interrupted; waiting for reconnection.", error?.message);
    }
  });

  return () => {
    disposed = true;
    clearTimeout(timer);
    pending.clear();
    void supabase.removeChannel(channel);
  };
}
