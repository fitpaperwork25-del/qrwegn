import { useState } from "react";
import { supabase } from "../lib/supabase";
import { ACCENT, BG, BORDER, MUTED, TEXT, RED } from "../constants/theme";

type ProblemType = "locked_out" | "other";

export default function SupportRequestPage() {
  const [email,        setEmail]        = useState("");
  const [businessName, setBusinessName] = useState("");
  const [problemType,  setProblemType]  = useState<ProblemType>("locked_out");
  const [message,      setMessage]      = useState("");
  const [sent,    setSent]    = useState(false);
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return; // guards against double-submit (e.g. double-click, double Enter)
    setError("");
    setLoading(true);

    // Plain insert only — no .select() chained. This table has no SELECT
    // policy for anon, so requesting the row back would fail the whole
    // insert under RLS even though the write itself is allowed.
    const { error: insertError } = await supabase.from("support_requests").insert({
      email: email.trim(),
      business_name: businessName.trim() || null,
      problem_type: problemType,
      message: message.trim() || null,
    });

    if (insertError) {
      setError(insertError.message);
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
            Account Support
          </p>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: TEXT, margin: 0 }}>
            Can&rsquo;t access your account?
          </h1>
        </div>

        {sent ? (
          <div style={{ background: ACCENT + "11", border: `1px solid ${ACCENT}44`, borderRadius: 10, padding: "24px", textAlign: "center" }}>
            <p style={{ color: ACCENT, fontWeight: 700, fontSize: 15, margin: "0 0 8px" }}>Request received</p>
            <p style={{ color: MUTED, fontSize: 13, margin: 0 }}>
              Our support team will follow up at <strong style={{ color: TEXT }}>{email}</strong> to help you regain access.
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
                disabled={loading}
                style={{ background: "transparent", border: `1px solid ${BORDER}`, borderRadius: 8, padding: "12px 14px", color: TEXT, fontSize: 14, outline: "none" }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 11, color: MUTED, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>
                Business name <span style={{ textTransform: "none", fontWeight: 400 }}>(optional)</span>
              </label>
              <input
                type="text"
                placeholder="Your restaurant or café name"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                disabled={loading}
                style={{ background: "transparent", border: `1px solid ${BORDER}`, borderRadius: 8, padding: "12px 14px", color: TEXT, fontSize: 14, outline: "none" }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 11, color: MUTED, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>
                What&rsquo;s happening?
              </label>
              <select
                value={problemType}
                onChange={(e) => setProblemType(e.target.value as ProblemType)}
                disabled={loading}
                style={{ background: "#141414", border: `1px solid ${BORDER}`, borderRadius: 8, padding: "12px 14px", color: TEXT, fontSize: 14, outline: "none" }}
              >
                <option value="locked_out">I&rsquo;m locked out</option>
                <option value="other">Something else</option>
              </select>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 11, color: MUTED, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>
                Message <span style={{ textTransform: "none", fontWeight: 400 }}>(optional)</span>
              </label>
              <textarea
                rows={3}
                placeholder="Anything that helps us help you faster"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={loading}
                style={{ background: "transparent", border: `1px solid ${BORDER}`, borderRadius: 8, padding: "12px 14px", color: TEXT, fontSize: 14, outline: "none", resize: "vertical", fontFamily: "inherit" }}
              />
            </div>

            {error && <p style={{ color: RED, fontSize: 13, margin: 0 }}>{error}</p>}

            <button
              type="submit"
              disabled={loading}
              style={{ background: ACCENT, color: BG, border: "none", borderRadius: 8, padding: "13px", fontWeight: 800, fontSize: 15, cursor: loading ? "not-allowed" : "pointer" }}
            >
              {loading ? "Sending…" : "Send request"}
            </button>

            <p style={{ textAlign: "center", color: MUTED, fontSize: 13 }}>
              Remembered how to get in?{" "}
              <a href="/login" style={{ color: ACCENT, textDecoration: "none", fontWeight: 700 }}>Log in</a>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
