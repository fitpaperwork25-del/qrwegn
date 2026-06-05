import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { BG } from "../constants/theme";

export default function StaffGuard({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<"loading" | "authed" | "unauthed">("loading");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setStatus(session ? "authed" : "unauthed");
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setStatus(session ? "authed" : "unauthed");
    });

    return () => subscription.unsubscribe();
  }, []);

  if (status === "loading") {
    return (
      <div style={{ background: BG, minHeight: "100vh" }} />
    );
  }
  if (status === "unauthed") return <Navigate to="/staff-login" replace />;
  return <>{children}</>;
}
