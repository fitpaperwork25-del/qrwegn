import { useState, useEffect } from "react";
import type { Session, AuthError } from "@supabase/supabase-js";
import { supabase } from "./supabase";

export type AuthStatus = "loading" | "authenticated" | "unauthenticated" | "expired";

// ── Sync helpers ──────────────────────────────────────────────────────────────

// Read the Supabase session synchronously from localStorage so that both
// `session` and `status` are set correctly on the FIRST render — before any
// async getSession() call resolves. This eliminates the blank-dark-page that
// occurs on mobile while the async check is in flight.
//
// Supabase v2 stores the session as a JSON object under the key
//   sb-{projectRef}-auth-token
// The object IS the Session: it contains access_token, refresh_token, user, …
function readStoredSession(): Session | null {
  try {
    const key = Object.keys(localStorage).find(
      (k) => k.startsWith("sb-") && k.endsWith("-auth-token")
    );
    if (!key) return null;
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (data?.access_token && data?.user) return data as Session;
    return null;
  } catch {
    return null;
  }
}

function hasStaleTokens(): boolean {
  try {
    return Object.keys(localStorage).some(
      (k) => k.startsWith("sb-") && k.endsWith("-auth-token")
    );
  } catch {
    return false;
  }
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth() {
  // Lazy initialisers run once, synchronously, before the first paint.
  // If a stored session exists the dashboard can start rendering and fetching
  // data immediately — no async gap, no blank screen on mobile.
  const [session, setSession] = useState<Session | null>(readStoredSession);
  const [status, setStatus] = useState<AuthStatus>(() =>
    readStoredSession() ? "authenticated" : "loading"
  );

  useEffect(() => {
    // Validate / refresh the session with Supabase's server.
    // This may trigger a token refresh (network call) — which is why we
    // don't block the initial render on it.
    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (data.session) {
          setSession(data.session);
          setStatus("authenticated");
        } else {
          setSession(null);
          setStatus(hasStaleTokens() ? "expired" : "unauthenticated");
        }
      })
      .catch(() => {
        // Network failure during token refresh — clear loading state so the
        // user isn't stuck on a blank screen; redirect to login if needed.
        setSession(null);
        setStatus(hasStaleTokens() ? "expired" : "unauthenticated");
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        setSession(session);
        setStatus("authenticated");
      } else if (event === "SIGNED_OUT") {
        setSession(null);
        setStatus("unauthenticated");
      } else {
        setSession(null);
        setStatus(hasStaleTokens() ? "expired" : "unauthenticated");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (
    email: string,
    password: string
  ): Promise<AuthError | null> => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return error;
  };

  const signOut = async (): Promise<void> => {
    await supabase.auth.signOut();
    setSession(null);
    setStatus("unauthenticated");
  };

  return { session, status, signIn, signOut };
}
