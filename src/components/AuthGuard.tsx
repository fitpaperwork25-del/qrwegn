import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../lib/useAuth";
import SessionExpired from "./SessionExpired";
import { BG, MUTED } from "../constants/theme";

interface Props {
  children: ReactNode;
}

export default function AuthGuard({ children }: Props) {
  const location = useLocation();
  const { status } = useAuth();

  // Scan pages are always public — never block them regardless of auth state.
  // This guard is defence-in-depth: scan routes are not wrapped in AuthGuard
  // in App.tsx, but this check prevents any future accidental wrapping from
  // locking customers out of the menu.
  if (location.pathname.startsWith("/scan")) {
    return <>{children}</>;
  }

  if (status === "loading") {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: BG,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: MUTED,
          fontFamily: "sans-serif",
        }}
      >
        Loading...
      </div>
    );
  }

  if (status === "expired") return <SessionExpired />;
  if (status === "unauthenticated") {
    return <Navigate to="/login" state={{ from: location.pathname + location.search }} replace />;
  }

  return <>{children}</>;
}
