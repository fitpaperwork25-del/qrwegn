import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../lib/useAuth";
import SessionExpired from "./SessionExpired";
import { BG, ACCENT, MUTED } from "../constants/theme";

interface Props {
  children: ReactNode;
}

function hasStoredSession(): boolean {
  try {
    return Object.keys(localStorage).some(
      (k) => k.startsWith("sb-") && k.endsWith("-auth-token")
    );
  } catch {
    return false;
  }
}

export default function AuthGuard({ children }: Props) {
  const location = useLocation();
  const { status } = useAuth();

  // Safety net: if we're somehow still "loading" after a long delay,
  // stop showing a bare spinner and offer the user a way out.
  const [stuck, setStuck] = useState(false);
  useEffect(() => {
    if (status !== "loading") {
      setStuck(false);
      return;
    }
    const timer = setTimeout(() => setStuck(true), 10000);
    return () => clearTimeout(timer);
  }, [status]);

  // Scan pages are always public.
  if (location.pathname.startsWith("/scan")) {
    return <>{children}</>;
  }

  if (status === "loading") {
    // If the browser has stored auth tokens, the user is almost certainly
    // still authenticated — render the dashboard immediately instead of
    // showing a blank dark screen while getSession() resolves.
    // If the session turns out to be invalid, the unauthenticated branch
    // below will redirect to /login once status settles.
    if (hasStoredSession()) {
      return <>{children}</>;
    }

    // No stored tokens: genuinely unauthenticated or first visit.
    // Show a visible spinner so the screen is never blank.
    return (
      <div
        style={{
          minHeight: "100vh",
          background: BG,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
          fontFamily: "sans-serif",
        }}
      >
        {!stuck && (
          <div
            style={{
              width: 36,
              height: 36,
              border: `3px solid rgba(255,255,255,0.08)`,
              borderTop: `3px solid ${ACCENT}`,
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
            }}
          />
        )}
        <span style={{ color: MUTED, fontSize: 14 }}>
          {stuck ? "Still checking your session…" : "Loading…"}
        </span>
        {stuck && (
          <button
            onClick={() => window.location.reload()}
            style={{
              background: ACCENT,
              color: BG,
              border: "none",
              borderRadius: 8,
              padding: "10px 20px",
              fontWeight: 700,
              cursor: "pointer",
              fontSize: 14,
            }}
          >
            Reload
          </button>
        )}
      </div>
    );
  }

  if (status === "expired") return <SessionExpired />;

  if (status === "unauthenticated") {
    return (
      <Navigate
        to="/login"
        state={{ from: location.pathname + location.search }}
        replace
      />
    );
  }

  return <>{children}</>;
}
