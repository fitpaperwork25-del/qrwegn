import { useState } from "react";
import { Link } from "react-router-dom";
import WegnLayout from "../../../components/wegn/WegnLayout";

export default function WegnStoreProductPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleWaitlist(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    window.location.href = `https://tally.so/r/EkvVa4?email=${encodeURIComponent(email)}&product=wegn-store`;
  }

  return (
    <WegnLayout>
      <section className="hero">
        <div className="wrap" style={{ textAlign: "center", maxWidth: 700, margin: "0 auto" }}>
          <span className="price-badge" style={{ position: "static", display: "inline-block", marginBottom: 20 }}>
            Coming soon
          </span>
          <div className="eyebrow" style={{ textAlign: "center" }}>
            Wegn Store
          </div>
          <h1>Commerce for operators who sell more than a service.</h1>
          <p className="hero-copy" style={{ margin: "0 auto 20px" }}>
            Wegn Store is in development — a product catalog and checkout built on the same WEGN foundation as
            QRWegn and QRBooker, for operators who need retail alongside ordering or booking.
          </p>

          <div className="for" style={{ textAlign: "center" }}>
            Built for
          </div>
          <div className="chips" style={{ justifyContent: "center", marginBottom: 20 }}>
            {["Grocery stores", "Mini markets", "Retail shops", "Pharmacies", "Hardware stores", "Wholesalers"].map((c) => (
              <span key={c} className="chip">
                {c}
              </span>
            ))}
          </div>

          <div className="for" style={{ textAlign: "center" }}>
            Key features
          </div>
          <div className="chips" style={{ justifyContent: "center", marginBottom: 32 }}>
            {["POS", "Inventory", "Purchasing", "Customers", "Staff", "Reporting"].map((c) => (
              <span key={c} className="chip">
                {c}
              </span>
            ))}
          </div>

          {submitted ? (
            <div style={{ display: "inline-block", border: "1px solid var(--green)", borderRadius: 10, padding: "16px 32px", color: "var(--green-dark)", fontWeight: 700 }}>
              You&rsquo;re on the list.
            </div>
          ) : (
            <form onSubmit={handleWaitlist} style={{ display: "flex", gap: 0, maxWidth: 440, margin: "0 auto" }}>
              <input
                type="email"
                required
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  flex: 1,
                  minWidth: 0,
                  background: "#fff",
                  border: "1px solid var(--line)",
                  borderRight: "none",
                  borderRadius: "999px 0 0 999px",
                  padding: "0 18px",
                  minHeight: 48,
                  color: "var(--ink)",
                  fontSize: 14,
                  outline: "none",
                  font: "inherit",
                }}
              />
              <button type="submit" className="btn primary" style={{ borderRadius: "0 999px 999px 0" }}>
                Join waitlist
              </button>
            </form>
          )}
        </div>
      </section>

      <section>
        <div className="wrap" style={{ textAlign: "center" }}>
          <p style={{ color: "var(--muted)", maxWidth: 480, margin: "0 auto 20px" }}>
            Have specific requirements for a WEGN store, or want to be part of early access?{" "}
            <Link to="/contact" style={{ color: "var(--green-dark)", fontWeight: 700 }}>
              Tell us what you need
            </Link>
            .
          </p>
          <Link to="/products" style={{ color: "var(--green-dark)", fontWeight: 700, fontSize: 14 }}>
            ← See all WEGN products
          </Link>
        </div>
      </section>
    </WegnLayout>
  );
}
