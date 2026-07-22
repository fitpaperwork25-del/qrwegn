import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../../lib/supabase";
import WegnLayout from "../../../components/wegn/WegnLayout";

// ── Demo dropdown ─────────────────────────────────────────────────────────────

interface DemoDropdownProps {
  onClose: () => void;
}

function DemoDropdown({ onClose }: DemoDropdownProps) {
  const navigate = useNavigate();

  function goCustomer() {
    onClose();
    navigate("/scan/demo-restaurant");
  }

  function goStaff() {
    onClose();
    navigate("/staff-login", { state: { demoSlug: "demo-restaurant", demoPin: "1234" } });
  }

  function goOwner() {
    onClose();
    navigate("/demo");
  }

  const items = [
    { key: "customer" as const, icon: "📱", label: "Customer View", sub: "Scan a table, browse the menu & order", action: goCustomer },
    { key: "staff" as const, icon: "👨‍🍳", label: "Staff Kitchen", sub: "Kitchen display — manage live orders", action: goStaff },
    { key: "owner" as const, icon: "📊", label: "Owner Dashboard", sub: "Full business management view", action: goOwner },
  ];

  return (
    <div
      style={{
        position: "absolute",
        top: "calc(100% + 8px)",
        right: 0,
        zIndex: 100,
        background: "#fff",
        border: "1px solid var(--line)",
        borderRadius: 14,
        padding: 8,
        minWidth: 280,
        boxShadow: "var(--shadow)",
      }}
    >
      {items.map((item, i) => (
        <button
          key={item.key}
          onClick={item.action}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            width: "100%",
            background: "transparent",
            border: "none",
            borderRadius: 10,
            padding: "12px 14px",
            cursor: "pointer",
            textAlign: "left",
            marginBottom: i < items.length - 1 ? 2 : 0,
            font: "inherit",
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#f0f4ee")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "transparent")}
        >
          <span style={{ fontSize: 22, flexShrink: 0 }}>{item.icon}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: "var(--ink)" }}>{item.label}</div>
            <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>{item.sub}</div>
          </div>
          <span style={{ color: "var(--green-dark)", fontSize: 16, flexShrink: 0 }}>→</span>
        </button>
      ))}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function QRWegnProductPage() {
  const navigate = useNavigate();
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [demoOpen, setDemoOpen] = useState(false);
  const demoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.location.hash.includes("access_token")) return;
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        const dest = session.user.email === "fitpaperwork25@gmail.com" ? "/admin" : "/dashboard";
        navigate(dest, { replace: true });
      }
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    QRCode.toDataURL("https://qrwegn.com", {
      width: 200,
      margin: 2,
      color: { dark: "#0d140e", light: "#ffffff" },
    }).then(setQrDataUrl);
  }, []);

  useEffect(() => {
    if (!demoOpen) return;
    function handleClick(e: MouseEvent) {
      if (demoRef.current && !demoRef.current.contains(e.target as Node)) setDemoOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [demoOpen]);

  return (
    <WegnLayout>
      {/* Utility row — demo / staff login, specific to this product */}
      <div style={{ borderBottom: "1px solid var(--line)", background: "#fff", padding: "10px 0" }}>
        <div className="wrap" style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <button className="btn" onClick={() => navigate("/staff-login")} style={{ minHeight: 38, padding: "0 16px", fontSize: 13 }}>
            Staff login
          </button>
          <div ref={demoRef} style={{ position: "relative" }}>
            <button className="btn" onClick={() => setDemoOpen((o) => !o)} style={{ minHeight: 38, padding: "0 16px", fontSize: 13 }}>
              Try Demo <span style={{ fontSize: 9, opacity: 0.8, marginLeft: 6 }}>{demoOpen ? "▲" : "▼"}</span>
            </button>
            {demoOpen && <DemoDropdown onClose={() => setDemoOpen(false)} />}
          </div>
        </div>
      </div>

      {/* Hero */}
      <section className="hero">
        <div className="wrap hero-grid">
          <div>
            <span
              className="price-badge"
              style={{ position: "static", display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 16 }}
            >
              <span className="status-dot" style={{ width: 6, height: 6, boxShadow: "none" }} />
              Live product
            </span>
            <div className="eyebrow">Restaurant Operations Platform</div>
            <h1>Put your restaurant in order.</h1>
            <p className="hero-copy">
              From QR ordering to kitchen flow, floor service, cashier checkout, staff roles, tabs, payments, and
              reports — WEGN Restaurants keeps every shift organized.
            </p>
            <div className="for">Built for</div>
            <div className="chips" style={{ marginBottom: 24 }}>
              {["Restaurants", "Coffee shops", "Hotels", "Cafés", "Lounges", "Resorts"].map((c) => (
                <span key={c} className="chip">
                  {c}
                </span>
              ))}
            </div>
            <div className="actions">
              <button className="btn primary" onClick={() => navigate("/register")}>
                Get started free →
              </button>
              <button className="btn" onClick={() => setDemoOpen((o) => !o)}>
                See how it works
              </button>
            </div>
            <div className="hero-note">30-day free trial · No credit card required</div>
          </div>

          <div
            style={{
              background: "#fff",
              border: "1px solid var(--line)",
              borderRadius: 28,
              padding: 28,
              boxShadow: "var(--shadow)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "0 0 16px" }}>
              <p style={{ fontSize: 11, letterSpacing: 3, color: "var(--muted)", fontWeight: 700, textTransform: "uppercase", margin: 0 }}>
                Today&rsquo;s Flow
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span className="status-dot" />
                <span style={{ fontSize: 10, color: "#3e7721", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>Live</span>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
              {[
                { label: "Table 4", value: "Ready" },
                { label: "Kitchen", value: "3 new orders" },
                { label: "Cashier", value: "$29.98" },
                { label: "Revenue today", value: "$145.84" },
              ].map((s) => (
                <div key={s.label} style={{ background: "var(--soft)", border: "1px solid var(--line)", borderRadius: 12, padding: "12px 14px" }}>
                  <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 6 }}>{s.label}</div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: "var(--green-dark)" }}>{s.value}</div>
                </div>
              ))}
            </div>
            <div style={{ borderTop: "1px solid var(--line)", paddingTop: 16, display: "flex", flexWrap: "wrap", gap: 8 }}>
              {["Scan", "Kitchen", "Floor", "Cashier", "Owner Reports"].map((step) => (
                <span key={step} className="chip">
                  {step}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How WEGN Restaurants works */}
      <section>
        <div className="wrap">
          <div className="section-head" style={{ justifyContent: "center", textAlign: "center", display: "block" }}>
            <div className="eyebrow" style={{ textAlign: "center" }}>
              How WEGN Restaurants works
            </div>
          </div>
          <div className="industries">
            {["Customer scans", "Kitchen receives", "Server manages floor", "Cashier closes out", "Owner sees the money"].map((label, i) => (
              <div key={label} className="industry">
                <div style={{ color: "var(--green-dark)", fontWeight: 900, fontFamily: "monospace", marginBottom: 6 }}>{i + 1}</div>
                {label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section>
        <div className="wrap">
          <div className="section-head">
            <div>
              <div className="eyebrow">How it works</div>
              <h2>Up and running in under an hour.</h2>
            </div>
          </div>
          <div className="cards" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
            {[
              { n: "01", head: "Register your restaurant", sub: "Create your account in 2 minutes. Your dashboard is ready immediately — no setup call needed." },
              { n: "02", head: "Add your tables and menu", sub: "Add one location per table, then build your menu with categories and items. Everything goes live instantly." },
              { n: "03", head: "Print your QR code", sub: "Download a unique QR code for each table from your dashboard. Print, laminate, and place it on the table." },
              { n: "04", head: "Customers scan and order", sub: "Guests scan the code, browse your menu, and place orders — no app, no account, no friction." },
            ].map((step) => (
              <div key={step.n} className="card" style={{ minHeight: "auto" }}>
                <div>
                  <div className="icon" style={{ fontFamily: "monospace", fontWeight: 900, color: "var(--green-dark)" }}>
                    {step.n}
                  </div>
                  <h3 style={{ fontSize: 18 }}>{step.head}</h3>
                  <p className="purpose">{step.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing + Partners teaser */}
      <section>
        <div className="wrap" style={{ textAlign: "center" }}>
          <div className="eyebrow" style={{ textAlign: "center" }}>
            Pricing &amp; partners
          </div>
          <p style={{ color: "var(--muted)", maxWidth: 500, margin: "0 auto 28px" }}>
            WEGN Restaurants pricing and the WEGN Partner program live on their own pages.
          </p>
          <div className="actions" style={{ justifyContent: "center" }}>
            <Link className="btn primary" to="/pricing">
              View pricing →
            </Link>
            <Link className="btn" to="/partners">
              Become a partner →
            </Link>
          </div>
        </div>
      </section>

      {/* QR Code */}
      <section>
        <div className="wrap" style={{ textAlign: "center" }}>
          <div className="eyebrow" style={{ textAlign: "center" }}>
            Scan to try
          </div>
          <p style={{ fontWeight: 800, marginBottom: 24 }}>Scan to try WEGN Restaurants</p>
          <div style={{ display: "inline-block", padding: 16, border: "1px solid var(--line)", borderRadius: 20, background: "#fff", boxShadow: "0 12px 32px rgba(18,42,18,.05)" }}>
            {qrDataUrl ? (
              <img src={qrDataUrl} alt="Scan to try WEGN Restaurants" width={200} height={200} style={{ display: "block", borderRadius: 8 }} />
            ) : (
              <div style={{ width: 200, height: 200, background: "var(--soft)", borderRadius: 8 }} />
            )}
          </div>
          <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 16, fontFamily: "monospace" }}>qrwegn.com</p>
        </div>
      </section>

      <section>
        <div className="wrap" style={{ textAlign: "center" }}>
          <Link to="/products" style={{ color: "var(--green-dark)", fontWeight: 700, fontSize: 14 }}>
            ← See all WEGN products
          </Link>
        </div>
      </section>
    </WegnLayout>
  );
}
