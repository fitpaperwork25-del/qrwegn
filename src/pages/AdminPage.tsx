import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { useAuth } from "../lib/useAuth";
import { supabase } from "../lib/supabase";

// ── Constants ────────────────────────────────────────────────────────────────
const SUPER_ADMIN = "fitpaperwork25@gmail.com";
const APP_URL     = "https://qrserve-v3.vercel.app";

const BG      = "#080808";
const SURFACE = "#111111";
const CARD    = "#161616";
const BORDER  = "rgba(255,255,255,0.07)";
const TEXT    = "#F0EDE8";
const MUTED   = "#666666";
const ACCENT  = "#E8C547";
const GREEN   = "#4CAF50";
const RED     = "#f44336";
const ORANGE  = "#F97316";

// ── Types ────────────────────────────────────────────────────────────────────
type AdminBiz = {
  id:                  string;
  name:                string;
  slug:                string;
  plan:                string;
  subscription_status: string;
  created_at:          string;
  owner_email:         string | null;
  location_count:      number;
  menu_item_count:     number;
  order_count:         number;
};

// ── Helpers ──────────────────────────────────────────────────────────────────
function planColor(p: string) {
  if (p === "enterprise") return TEXT;
  if (p === "pro") return ACCENT;
  return MUTED;
}
function statusColor(s: string) {
  if (s === "active")   return GREEN;
  if (s === "trialing") return ACCENT;
  if (s === "past_due") return ORANGE;
  return RED;
}
function badge(color: string, label: string) {
  return (
    <span style={{
      display: "inline-block",
      background: color + "22",
      color,
      border: `1px solid ${color}44`,
      borderRadius: 5,
      padding: "2px 8px",
      fontSize: 10,
      fontWeight: 700,
      letterSpacing: 1,
      textTransform: "uppercase" as const,
    }}>
      {label}
    </span>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function AdminPage() {
  const { session } = useAuth();
  const userEmail   = session?.user?.email;

  const [businesses, setBusinesses] = useState<AdminBiz[]>([]);
  const [notes,     setNotes]       = useState<Record<string, string>>({});
  const [qrCodes,   setQrCodes]     = useState<Record<string, string>>({});
  const [loading,   setLoading]     = useState(true);
  const [error,     setError]       = useState("");
  const [savingNote, setSavingNote] = useState<string | null>(null);

  const isSuperAdmin = userEmail === SUPER_ADMIN;

  useEffect(() => {
    if (!isSuperAdmin) return;
    void load();
  }, [isSuperAdmin]);

  async function load() {
    setLoading(true);

    const [bizRes, notesRes] = await Promise.all([
      supabase.rpc("get_admin_businesses"),
      supabase.from("admin_notes").select("business_id, note"),
    ]);

    if (bizRes.error) {
      setError(bizRes.error.message);
      setLoading(false);
      return;
    }

    const bizList = (bizRes.data ?? []) as AdminBiz[];
    setBusinesses(bizList);

    const noteMap: Record<string, string> = {};
    ((notesRes.data ?? []) as { business_id: string; note: string }[]).forEach(
      (n) => { noteMap[n.business_id] = n.note; }
    );
    setNotes(noteMap);

    // Generate QR codes in parallel
    const qrEntries = await Promise.all(
      bizList.map(async (b) => {
        const url = await QRCode.toDataURL(`${APP_URL}/scan/${b.slug}`, {
          width: 128, margin: 1,
          color: { dark: "#E8C547", light: "#111111" },
        });
        return [b.id, url] as [string, string];
      })
    );
    setQrCodes(Object.fromEntries(qrEntries));
    setLoading(false);
  }

  async function saveNote(bizId: string) {
    setSavingNote(bizId);
    await supabase.from("admin_notes").upsert(
      { business_id: bizId, note: notes[bizId] ?? "", updated_at: new Date().toISOString() },
      { onConflict: "business_id" }
    );
    setSavingNote(null);
  }

  // ── Access denied ──────────────────────────────────────────────────────────
  if (!isSuperAdmin) {
    return (
      <div style={{ background: BG, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "sans-serif" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🔒</div>
          <p style={{ color: RED, fontWeight: 700, fontSize: 16 }}>Access denied</p>
          <p style={{ color: MUTED, fontSize: 13 }}>Super-admin only.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ background: BG, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "sans-serif" }}>
        <div style={{ width: 36, height: 36, border: `3px solid rgba(255,255,255,0.08)`, borderTop: `3px solid ${ACCENT}`, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ background: BG, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "sans-serif" }}>
        <div style={{ color: RED, fontSize: 14, textAlign: "center" }}>
          <p style={{ fontWeight: 700 }}>Error loading admin data</p>
          <p style={{ color: MUTED }}>{error}</p>
        </div>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  const active   = businesses.filter(b => b.subscription_status === "active").length;
  const trialing = businesses.filter(b => b.subscription_status === "trialing").length;
  const setupDone = businesses.filter(b => b.location_count > 0 && b.menu_item_count > 0 && b.order_count > 0).length;

  return (
    <div style={{ background: BG, minHeight: "100vh", color: TEXT, fontFamily: "sans-serif" }}>

      {/* Header */}
      <header style={{ background: SURFACE, borderBottom: `1px solid ${BORDER}`, padding: "20px 32px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <div>
            <p style={{ fontSize: 11, letterSpacing: 3, color: ACCENT, fontWeight: 700, textTransform: "uppercase", margin: "0 0 6px" }}>Super Admin</p>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 900 }}>Client Dashboard</h1>
          </div>
          <div style={{ display: "flex", gap: 20 }}>
            {[
              { label: "Total",    value: businesses.length, color: TEXT },
              { label: "Active",   value: active,            color: GREEN },
              { label: "Trialing", value: trialing,          color: ACCENT },
              { label: "Setup Done", value: setupDone,       color: GREEN },
            ].map(s => (
              <div key={s.label} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 22, fontWeight: 900, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 11, color: MUTED, letterSpacing: 1, textTransform: "uppercase" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* Business cards */}
      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px", display: "flex", flexDirection: "column", gap: 20 }}>
        {businesses.map((biz) => {
          const hasTables = biz.location_count > 0;
          const hasMenu   = biz.menu_item_count > 0;
          const hasOrders = biz.order_count > 0;
          const fullySetup = hasTables && hasMenu && hasOrders;

          return (
            <div key={biz.id} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14, overflow: "hidden" }}>

              {/* Card header */}
              <div style={{ padding: "20px 24px", borderBottom: `1px solid ${BORDER}`, display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 14 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 8 }}>
                    <span style={{ fontWeight: 900, fontSize: 18 }}>{biz.name}</span>
                    {badge(planColor(biz.plan), biz.plan)}
                    {badge(statusColor(biz.subscription_status), biz.subscription_status)}
                    {fullySetup && badge(GREEN, "setup ✓")}
                  </div>
                  <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                    <span style={{ color: MUTED, fontSize: 13 }}>
                      <span style={{ color: ACCENT, fontFamily: "monospace" }}>/{biz.slug}</span>
                    </span>
                    {biz.owner_email && (
                      <span style={{ color: MUTED, fontSize: 13 }}>{biz.owner_email}</span>
                    )}
                    <span style={{ color: MUTED, fontSize: 13 }}>
                      Joined {new Date(biz.created_at).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
                    </span>
                  </div>
                </div>

                {/* QR code */}
                {qrCodes[biz.id] && (
                  <a
                    href={qrCodes[biz.id]}
                    download={`qr-${biz.slug}.png`}
                    title="Download QR code"
                    style={{ display: "block", borderRadius: 8, overflow: "hidden", border: `1px solid ${BORDER}`, flexShrink: 0 }}
                  >
                    <img src={qrCodes[biz.id]} alt="QR" width={80} height={80} style={{ display: "block" }} />
                  </a>
                )}
              </div>

              {/* Setup + stats */}
              <div style={{ padding: "16px 24px", borderBottom: `1px solid ${BORDER}`, display: "flex", gap: 24, flexWrap: "wrap", alignItems: "center" }}>
                {/* Setup checklist */}
                <div style={{ display: "flex", gap: 12 }}>
                  {[
                    { label: "Tables",    done: hasTables, count: biz.location_count },
                    { label: "Menu",      done: hasMenu,   count: biz.menu_item_count },
                    { label: "Orders",    done: hasOrders, count: biz.order_count },
                  ].map(item => (
                    <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ width: 18, height: 18, borderRadius: "50%", background: item.done ? GREEN + "33" : BORDER, border: `1px solid ${item.done ? GREEN : BORDER}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: item.done ? GREEN : MUTED, flexShrink: 0 }}>
                        {item.done ? "✓" : "–"}
                      </span>
                      <span style={{ fontSize: 12, color: item.done ? TEXT : MUTED }}>
                        {item.label} ({item.count})
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action buttons */}
              <div style={{ padding: "14px 24px", borderBottom: `1px solid ${BORDER}`, display: "flex", gap: 10, flexWrap: "wrap" }}>
                <a
                  href={`${APP_URL}/scan/${biz.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{ background: ACCENT + "18", border: `1px solid ${ACCENT}44`, borderRadius: 8, padding: "7px 14px", color: ACCENT, fontSize: 12, fontWeight: 700, textDecoration: "none", cursor: "pointer" }}
                >
                  📱 Scan Page
                </a>
                <a
                  href={`${APP_URL}/staff-login`}
                  target="_blank"
                  rel="noreferrer"
                  style={{ background: ORANGE + "18", border: `1px solid ${ORANGE}44`, borderRadius: 8, padding: "7px 14px", color: ORANGE, fontSize: 12, fontWeight: 700, textDecoration: "none", cursor: "pointer" }}
                >
                  👨‍🍳 Staff Login
                </a>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(biz.slug);
                  }}
                  style={{ background: "none", border: `1px solid ${BORDER}`, borderRadius: 8, padding: "7px 14px", color: MUTED, fontSize: 12, fontWeight: 700, cursor: "pointer" }}
                >
                  📋 Copy Slug
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(biz.id);
                  }}
                  style={{ background: "none", border: `1px solid ${BORDER}`, borderRadius: 8, padding: "7px 14px", color: MUTED, fontSize: 12, fontWeight: 700, cursor: "pointer" }}
                >
                  🔑 Copy ID
                </button>
              </div>

              {/* Notes */}
              <div style={{ padding: "16px 24px" }}>
                <label style={{ fontSize: 11, color: MUTED, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 8 }}>
                  Contact Notes
                </label>
                <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <textarea
                    rows={2}
                    placeholder="Add notes about this client — onboarding status, follow-ups, etc."
                    value={notes[biz.id] ?? ""}
                    onChange={(e) => setNotes((prev) => ({ ...prev, [biz.id]: e.target.value }))}
                    style={{
                      flex: 1,
                      background: BG,
                      border: `1px solid ${BORDER}`,
                      borderRadius: 8,
                      padding: "10px 12px",
                      color: TEXT,
                      fontSize: 13,
                      resize: "vertical",
                      outline: "none",
                      fontFamily: "sans-serif",
                      lineHeight: 1.5,
                    }}
                  />
                  <button
                    onClick={() => saveNote(biz.id)}
                    disabled={savingNote === biz.id}
                    style={{
                      background: savingNote === biz.id ? BORDER : ACCENT,
                      color: savingNote === biz.id ? MUTED : BG,
                      border: "none",
                      borderRadius: 8,
                      padding: "10px 18px",
                      fontSize: 12,
                      fontWeight: 800,
                      cursor: savingNote === biz.id ? "not-allowed" : "pointer",
                      flexShrink: 0,
                    }}
                  >
                    {savingNote === biz.id ? "Saving…" : "Save"}
                  </button>
                </div>
              </div>

            </div>
          );
        })}

        {businesses.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 24px", color: MUTED, fontSize: 14 }}>
            No businesses registered yet.
          </div>
        )}
      </main>
    </div>
  );
}
