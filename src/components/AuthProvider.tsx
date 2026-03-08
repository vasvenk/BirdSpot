"use client";

import {
  createContext,
  startTransition,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { Session, SupabaseClient } from "@supabase/supabase-js";

import { fetchJson } from "@/lib/fetcher";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { AppUser, CurrentUserResponse } from "@/types";

type AuthContextValue = {
  appUser: AppUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  session: Session | null;
  supabase: SupabaseClient;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [supabase] = useState(() => getSupabaseBrowserClient());
  const [session, setSession] = useState<Session | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = useCallback(async () => {
    try {
      const data = await fetchJson<CurrentUserResponse>("/api/users/me", {
        credentials: "include",
      });

      startTransition(() => {
        setAppUser(data.user);
      });
    } catch {
      startTransition(() => {
        setAppUser(null);
      });
    }
  }, []);

  useEffect(() => {
    let active = true;

    const initialize = async () => {
      const {
        data: { session: currentSession },
      } = await supabase.auth.getSession();

      if (!active) {
        return;
      }

      setSession(currentSession);

      if (currentSession) {
        await refreshProfile();
      } else {
        setAppUser(null);
      }

      if (active) {
        setLoading(false);
      }
    };

    void initialize();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_, nextSession) => {
      startTransition(() => {
        setSession(nextSession);
      });

      void (async () => {
        if (nextSession) {
          await refreshProfile();
        } else {
          startTransition(() => {
            setAppUser(null);
          });
        }
      })();
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [refreshProfile, supabase]);

  const value: AuthContextValue = {
    appUser,
    isAuthenticated: Boolean(session),
    loading,
    session,
    supabase,
    refreshProfile,
    signOut: async () => {
      await supabase.auth.signOut();
      setAppUser(null);
      setSession(null);
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }

  return context;
}
