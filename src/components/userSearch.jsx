import { useState, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Search,
  User,
  X,
  CheckCircle2,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

// ─── Fetch helper ────────────────────────────────────────────────────────────
async function searchUsers(query, queryClient) {
  const authProfile = queryClient.getQueryData(["auth-profile"]);

  const user = authProfile?.user;

  if (!user) throw new Error("No user");
  if (!query.trim()) return [];

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .or(
      `email.ilike.%${query}%,first_name.ilike.%${query}%,middle_name.ilike.%${query}%,last_name.ilike.%${query}%`,
    )
    .neq("coop_status", "inactive")
    .neq("id", user.id)
    .order("created_at", { ascending: false })

    .limit(20);

  if (error) throw new Error(error.message);
  return data ?? [];
}

// ─── Utility ─────────────────────────────────────────────────────────────────
function getInitials(name, email) {
  if (name) {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }
  return email?.[0]?.toUpperCase() ?? "?";
}

// function formatDate(iso) {
//   if (!iso) return "—";
//   return new Intl.DateTimeFormat("en-PH", {
//     year: "numeric",
//     month: "short",
//     day: "numeric",
//   }).format(new Date(iso));
// }

// ─── Avatar ───────────────────────────────────────────────────────────────────
function Avatar({ user }) {
  const initials = getInitials(user.full_name, user.email);
  const colors = [
    "bg-sky-500",
    "bg-violet-500",
    "bg-emerald-500",
    "bg-amber-500",
    "bg-rose-500",
    "bg-indigo-500",
  ];
  const color = colors[user.id.charCodeAt(0) % colors.length];

  if (user.avatar_url) {
    return (
      <img
        src={user.avatar_url}
        alt={user.full_name ?? user.email}
        className="w-10 h-10 rounded-full object-cover ring-2 ring-white"
      />
    );
  }
  return (
    <div
      className={`w-10 h-10 rounded-full ${color} flex items-center justify-center text-white text-sm font-bold ring-2 ring-white select-none`}
    >
      {initials}
    </div>
  );
}

// ─── Selected User Card ───────────────────────────────────────────────────────
function SelectedUserCard({ user, onClear }) {
  return (
    <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 flex items-start gap-4 animate-in fade-in slide-in-from-top-2 duration-200">
      <div className="relative">
        <Avatar user={user} />
        <CheckCircle2 className="absolute -bottom-1 -right-1 w-4 h-4 text-emerald-500 bg-white rounded-full" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-slate-800 truncate">
          {user.first_name} {user.middle_name} {user.last_name}
        </p>
        <p className="text-sm text-slate-500 truncate">{user.email}</p>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {user.role && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-violet-100 text-violet-700">
              {user.role}
            </span>
          )}
          {/* {user.created_at && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
              Joined {formatDate(user.created_at)}
            </span>
          )}
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-mono bg-slate-100 text-slate-500">
            {user.id.slice(0, 8)}…
          </span> */}
        </div>
      </div>
      <button
        onClick={onClear}
        className="text-slate-400 hover:text-slate-600 transition-colors mt-0.5"
        aria-label="Clear selection"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

// ─── Result Row ────────────────────────────────────────────────────────────────
function ResultRow({ user, isSelected, onSelect }) {
  return (
    <button
      onClick={() => onSelect(user)}
      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-50 focus:outline-none focus:bg-slate-50 ${
        isSelected ? "bg-sky-50 border-l-2 border-sky-500" : ""
      }`}
    >
      <Avatar user={user} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-800 truncate">
          {user.first_name} {user.middle_name} {user.last_name}
        </p>
        <p className="text-xs text-slate-500 truncate">{user.email}</p>
      </div>
      <div className="flex flex-col items-end gap-1 shrink-0">
        {user.role && (
          <span className="text-xs px-1.5 py-0.5 rounded bg-violet-100 text-violet-600 font-medium">
            {user.role}
          </span>
        )}
        {isSelected && <CheckCircle2 className="w-4 h-4 text-sky-500" />}
      </div>
    </button>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function UserSearch({ setSelectedLoanType }) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [debounceTimer, setDebounceTimer] = useState(null);

  // Debounce input
  const handleInput = useCallback(
    (e) => {
      const val = e.target.value;
      setQuery(val);
      if (debounceTimer) clearTimeout(debounceTimer);
      const t = setTimeout(() => setDebouncedQuery(val), 350);
      setDebounceTimer(t);
    },
    [debounceTimer],
  );

  const clearSearch = () => {
    setQuery("");
    setDebouncedQuery("");
    setSelectedLoanType((prev) => ({
      ...prev,
      coborrower: null,
    }));
  };
  const queryClient = useQueryClient();

  const {
    data: users,
    isFetching,
    isError,
    error,
  } = useQuery({
    queryKey: ["coborrowers", debouncedQuery],
    queryFn: () => searchUsers(debouncedQuery, queryClient),
    enabled: debouncedQuery.trim().length > 0,
    staleTime: 30_000,
  });

  const showDropdown =
    debouncedQuery.trim().length > 0 &&
    (isFetching || isError || users !== undefined);

  return (
    <div className="">
      <div className="w-full max-w-lg">
        {/* Search Box */}
        <div className="relative">
          <div className="relative flex items-center">
            <Search className="absolute left-4 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={handleInput}
              placeholder="Search by name or email…"
              className="w-full pl-11 pr-10 py-3.5 rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-100 text-sm text-slate-800 placeholder-slate-400 outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent transition-all"
            />
            {query && (
              <button
                onClick={clearSearch}
                className="absolute right-3 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Dropdown */}
          {showDropdown && (
            <div className="absolute z-10 mt-2 w-full rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
              {isFetching && (
                <div className="flex items-center gap-2 px-4 py-4 text-sm text-slate-500">
                  <Loader2 className="w-4 h-4 animate-spin text-sky-400" />
                  Searching…
                </div>
              )}

              {isError && !isFetching && (
                <div className="flex items-center gap-2 px-4 py-4 text-sm text-rose-600">
                  <AlertCircle className="w-4 h-4" />
                  {error.message ?? "Something went wrong"}
                </div>
              )}

              {!isFetching && !isError && users?.length === 0 && (
                <div className="px-4 py-5 text-sm text-slate-400 text-center">
                  No users found for &ldquo;{debouncedQuery}&rdquo;
                </div>
              )}

              {!isFetching && !isError && users && users.length > 0 && (
                <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                  {users.map((u) => (
                    <ResultRow
                      key={u.id}
                      user={u}
                      isSelected={selectedUser?.id === u.id}
                      onSelect={(picked) => {
                        setSelectedUser(picked);
                        clearSearch();

                        console.log("user selecteed", u);
                        setSelectedLoanType((prev) => ({
                          ...prev,
                          coborrower: u.id,
                        }));
                      }}
                    />
                  ))}
                </div>
              )}

              {!isFetching && users && users.length > 0 && (
                <div className="px-4 py-2 border-t border-slate-100 bg-slate-50 text-xs text-slate-400">
                  {users.length} result{users.length !== 1 ? "s" : ""}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Selected user */}
        {selectedUser && (
          <SelectedUserCard
            user={selectedUser}
            onClear={() => setSelectedUser(null)}
          />
        )}

        {/* Empty state hint */}
        {!selectedUser && !query && (
          <p className="mt-6 text-center text-xs text-slate-400">
            Start typing to search your users table
          </p>
        )}
      </div>
    </div>
  );
}
