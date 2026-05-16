import { useState } from "react";
import { supabase } from "../lib/supabase";
import { ACCENT, BG, BORDER, MUTED, TEXT, RED } from "../constants/theme";

export default function ResetPasswordPage() {
  const [password, setPassword]   = useState("");
  const [done, setDone]           = useState(false);
  const [error, setError]         = useState("");
  const [loading, setLoading]     = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    setDone(true);
    setLoading(false);
    setTimeout(() => window.location.href = "/dashboard", 2000);
  }

  return (
    <div style={{ background: BG, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "sans-serif" }}>
      <div style={{ width: "100%", maxWidth: 420, padding: "0 24px" }}>

        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <p style={{ fontSize: 11, letterSpacing: 3, color: ACCENT, fontWeight: 700, textTransform: "uppercase", marginBottom: 8 }}>
            New Password
          </p>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: TEXT, margin: 0 }}>Set your password</h1>
        </div>

        {done ? (
          <div style={{ background: ACCENT + "11", border: `1px solid ${ACCENT}44`, borderRadius: 10, padding: "24px", textAlign: "center" }}>
            <p style={{ color: ACCENT, fontWeight: 700, fontSize: 15, margin: "0 0 8px" }}>Password updated!</p>
            <p style={{ color: MUTED, fontSize: 13, margin: 0 }}>Redirecting to dashboard…</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 11, color: MUTED, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>
                New Password
              </label>
              <input
                required
                autoFocus
                type="password"
                placeholder="Min 6 characters"
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ background: "transparent", border: `1px solid ${BORDER}`, borderRadius: 8, padding: "12px 14px", color: TEXT, fontSize: 14, outline: "none" }}
              />
            </div>

            {error && <p style={{ color: RED, fontSize: 13, margin: 0 }}>{error}</p>}

            <button
              type="submit"
              disabled={loading}
              style={{ background: ACCENT, color: BG, border: "none", borderRadius: 8, padding: "13px", fontWeight: 800, fontSize: 15, cursor: loading ? "not-allowed" : "pointer" }}
            >
              {loading ? "Updating…" : "Set new password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}// placeholder
