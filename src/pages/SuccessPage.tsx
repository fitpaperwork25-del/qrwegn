import { useNavigate } from "react-router-dom";
import { ACCENT, BG, BORDER, MUTED, TEXT, GREEN } from "../constants/theme";

export default function SuccessPage() {
  const navigate = useNavigate();

  return (
    <div style={{ background: BG, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "sans-serif", padding: 24 }}>
      <div style={{ textAlign: "center", maxWidth: 480 }}>
        <div style={{ width: 72, height: 72, borderRadius: "50%", background: GREEN + "22", border: `2px solid ${GREEN}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 28px", fontSize: 32 }}>
          ✓
        </div>
        <p style={{ fontSize: 11, letterSpacing: 4, color: ACCENT, fontWeight: 700, textTransform: "uppercase", marginBottom: 16 }}>
          Payment successful
        </p>
        <h1 style={{ fontSize: 32, fontWeight: 900, color: TEXT, marginBottom: 14, letterSpacing: -1 }}>
          You're all set.
        </h1>
        <p style={{ fontSize: 16, color: MUTED, lineHeight: 1.7, marginBottom: 36 }}>
          Your subscription is now active. Your dashboard has been updated with your new plan.
        </p>
        <button
          onClick={() => navigate("/dashboard")}
          style={{ background: ACCENT, color: BG, border: "none", borderRadius: 10, padding: "15px 36px", fontWeight: 800, fontSize: 16, cursor: "pointer" }}
        >
          Go to dashboard →
        </button>
        <p style={{ color: MUTED, fontSize: 12, marginTop: 20 }}>
          A receipt has been sent to your email by Stripe.
        </p>
      </div>
    </div>
  );
}
