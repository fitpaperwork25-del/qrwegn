import { useState } from "react";
import { supabase } from "../lib/supabase";
import { ACCENT, BG, BORDER, MUTED, TEXT, RED } from "../constants/theme";

export default function ForgotPasswordPage() {
  const [email, setEmail]     = useState("");
  const [sent, setSent]       = useState(false);
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    setSent(true);
    setLoading(false);
  }

  return (
    <div style={{ background: BG, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "sans-serif" }}>
      <div style={{ width: "100%", maxWidth: 420, padding: "0 24px" }}>

        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <p style={{ fontSize: 11, letterSpacing: 3, color: ACCENT, fontWeight: 700, textTransform: "uppercase", marginBottom: 8 }}>
            Password Reset
          </p>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: TEXT, margin: 0 }}>
            Forgot your password?
          </h1>
        </div>

        {sent ? (
          <div style={{ background: ACCENT + "11", border: `1px solid ${ACCENT}44`, borderRadius: 10, padding: "24px", textAlign: "center" }}>
            <p style={{ color: ACCENT, fontWeight: 700, fontSize: 15, margin: "0 0 8px" }}>Check your email</p>
            <p style={{ color: MUTED, fontSize: 13, margin: 0 }}>
              We sent a reset link to <strong style={{ color: TEXT }}>{email}</strong>. Click the link to set a new password.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 11, color: MUTED, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>
                Email
              </label>
              <input
                required
                autoFocus
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ background: "transparent", border: `1px solid ${BORDER}`, borderRadius: 8, padding: "12px 14px", color: TEXT, fontSize: 14, outline: "none" }}
              />
            </div>

            {error && <p style={{ color: RED, fontSize: 13, margin: 0 }}>{error}</p>}

            <button
              type="submit"
              disabled={loading}
              style={{ background: ACCENT, color: BG, border: "none", borderRadius: 8, padding: "13px", fontWeight: 800, fontSize: 15, cursor: loading ? "not-allowed" : "pointer" }}
            >
              {loading ? "Sending…" : "Send reset link"}
            </button>

            <p style={{ textAlign: "center", color: MUTED, fontSize: 13 }}>
              Remember it?{" "}
              <a href="/login" style={{ color: ACCENT, textDecoration: "none", fontWeight: 700 }}>Log in</a>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}