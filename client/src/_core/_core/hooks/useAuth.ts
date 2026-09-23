import { trpc } from "@/lib/trpc";
import { useCallback, useEffect, useState, useMemo } from "react";

export interface UserSession {
  name: string;
  email: string;
  role: string;
  avatarUrl?: string;
}

export function useAuth() {
  const [localUser, setLocalUser] = useState<UserSession | null>(() => {
    try {
      const stored = localStorage.getItem("mendsync-auth-user");
      return stored ? JSON.parse(stored) : {
        name: "Dr. Alex Rivera, MD",
        email: "alex.rivera@mendsync.in",
        role: "Clinical Specialist"
      };
    } catch {
      return null;
    }
  });

  const meQuery = trpc.auth.me.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
    enabled: false,
  });

  const logout = useCallback(async () => {
    try {
      localStorage.removeItem("mendsync-auth-user");
      setLocalUser(null);
    } catch (e) {
      console.error("Logout error", e);
    }
  }, []);

  const loginUser = useCallback((user: UserSession) => {
    localStorage.setItem("mendsync-auth-user", JSON.stringify(user));
    setLocalUser(user);
  }, []);

  return {
    user: localUser,
    loading: meQuery.isLoading,
    isAuthenticated: Boolean(localUser),
    loginUser,
    logout,
    refresh: () => meQuery.refetch(),
  };
}
