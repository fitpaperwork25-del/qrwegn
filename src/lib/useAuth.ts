import { useState, useEffect } from "react";
import type { Session, AuthError } from "@supabase/supabase-js";
import { supabase } from "./supabase";

export type AuthStatus = "loading" | "authenticated" | "unauthenticated" | "expired";

function hasStaleTokens(): boolean {
  return Object.keys(localStorage).some(
    (k) => k.startsWith("sb-") && k.endsWith("-auth-token")
  );
}

function isPublicScanPath(): boolean {
  return window.location.pathname.startsWith("/scan");
}

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  // Scan pages are fully public — skip the loading state so nothing on a
  // scan path ever renders a redirect before the session resolves.
  const [status, setStatus] = useState<AuthStatus>(
    isPublicScanPath() ? "unauthenticated" : "loading"
  );

  useEffect(() => {
    // Don't wire up the auth session machinery on public scan pages at all.
    // The anonSupabase client in those pages never carries a token, so the
    // shared supabase client's auth events are irrelevant there.
    if (isPublicScanPath()) return;

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setSession(data.session);
        setStatus("authenticated");
      } else {
        setStatus(hasStaleTokens() ? "expired" : "unauthenticated");
      }
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

  const signIn = async (email: string, password: string): Promise<AuthError | null> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error;
  };

  const signOut = async (): Promise<void> => {
    await supabase.auth.signOut();
    setSession(null);
    setStatus("unauthenticated");
  };

  return { session, status, signIn, signOut };
}
