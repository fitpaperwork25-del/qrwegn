import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { getStaffProfile, signOutStaff } from "../lib/useStaffAuth";
import { ACCENT, BG, BORDER, MUTED, SURFACE, TEXT } from "../constants/theme";

// ── Types ─────────────────────────────────────────────────────
type OrderRow = {
  id: string;
  status: string;
  total: number;
  created_at: string;
  location_id: string;
  table_name: string;
};

type OrderItem = {
  order_id: string;
  name: string;
  quantity: number;
  unit_price: number;
};

type TabRow = {
  id: string;
  table_name: string;
  total: number;
  opened_at: string;
};

// ── Constants ─────────────────────────────────────────────────
const STATUS_COLOR: Record<string, string> = {
  new:       "#E8C547",
  preparing: "#F97316",
  ready:     "#4CAF50",
  done: "#64748b",
};

const STATUS_LABEL: Record<string, string> = {
  new:       "New",
  preparing: "Preparing",
  ready:     "Ready",
  done: "Delivered",
};

const STAFF_STATUSES = ["new", "preparing", "ready"] as const;
const CANCEL_REASONS = ["Wrong order", "Customer refused", "Item unavailable", "Other"] as const;
const REFRESH_MS = 15_000;

function nowStr() {
  return new Date().toLocaleTimeString(undefined, {
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  });
}

// Returns MM:SS (or H:MM:SS past 1 hour) elapsed + urgency color.
// Appends "Z" when no timezone indicator is present so the string is
// always parsed as UTC, not local time.
function formatElapsed(dateStr: string, now: number): { text: string; color: string } {
  const normalized = /[Zz]|[+-]\d{2}:?\d{2}$/.test(dateStr.trim())
    ? dateStr
    : dateStr + "Z";
  const epoch = Date.parse(normalized);
  if (isNaN(epoch)) return { text: "--:--", color: MUTED };

  const ms        = Math.max(0, now - epoch);
  const totalSecs = Math.floor(ms / 1000);
  const h         = Math.floor(totalSecs / 3600);
  const m         = Math.floor((totalSecs % 3600) / 60);
  const s         = totalSecs % 60;
  const pad       = (n: number) => n.toString().padStart(2, "0");
  const text      = h > 0
    ? `${h}:${pad(m)}:${pad(s)}`
    : `${pad(m)}:${pad(s)}`;
  const color     = ms >= 600_000 ? "#f44336" : ms >= 300_000 ? "#F97316" : "#4CAF50";
  return { text, color };
}

// ── Component ──────────────────────────────────────────────────
export default function StaffDashboardPage() {
  const navigate = useNavigate();

  const [bizId, setBizId]   = useState<string | null>(null);
  const [flash, setFlash] = useState(false);
  const [bizName, setBizName] = useState("Staff Dashboard");

  const [orders, setOrders]           = useState<OrderRow[]>([]);
  const [items, setItems]             = useState<OrderItem[]>([]);
  const [openTabs, setOpenTabs]       = useState<TabRow[]>([]);
  const [loading, setLoading]         = useState(true);
  const [lastChecked, setLastChecked] = useState(nowStr());
  const [now, setNow]                 = useState(Date.now());

  // Load business identity from Supabase auth + staff_profiles.
  useEffect(() => {
    getStaffProfile().then((profile) => {
      if (!profile) { navigate("/staff-login", { replace: true }); return; }
      setBizId(profile.bizId);
      setBizName(profile.bizName);
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);
  const [cancelReason, setCancelReason]           = useState("");
  const [cancelError, setCancelError]             = useState("");

  // 1-second tick for live elapsed time — independent of data polling.
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  function notifyNewOrder() {
    setFlash(true);
    setTimeout(() => setFlash(false), 4000);
    try {
      const Ctx = (window.AudioContext || (window as any).webkitAudioContext);
      const ctx = new Ctx();
      const beep = (t: number, f: number) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.connect(g); g.connect(ctx.destination);
        o.frequency.value = f; o.type = "sine";
        g.gain.setValueAtTime(0.0001, ctx.currentTime + t);
        g.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + t + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + t + 0.25);
        o.start(ctx.currentTime + t); o.stop(ctx.currentTime + t + 0.26);
      };
      beep(0, 880); beep(0.18, 1175);
      setTimeout(() => ctx.close(), 900);
    } catch {}
  }

  useEffect(() => {
    if (!bizId) return;

    async function fetchOrders() {
      const [ordRes, tabRes] = await Promise.all([
        supabase
          .from("orders")
          .select("id, status, total, created_at, location_id, locations(name, label)")
          .eq("business_id", bizId)
          .in("status", ["new", "preparing"])
          .order("created_at", { ascending: true }),
        supabase
          .from("tabs")
          .select("id, total, opened_at, locations(name, label)")
          .eq("business_id", bizId)
          .eq("status", "open")
          .order("opened_at", { ascending: true }),
      ]);

      if (ordRes.error) console.error("[KDS] orders query error:", ordRes.error);
      if (tabRes.error) console.error("[KDS] tabs query error:", tabRes.error);

      const rows: OrderRow[] = (ordRes.data ?? []).map((o: any) => ({
        id:          o.id,
        status:      o.status,
        total:       o.total,
        created_at:  o.created_at,
        location_id: o.location_id,
        table_name:  o.locations?.label || o.locations?.name || "Unknown table",
      }));
      setOrders(rows);

      setOpenTabs(
        (tabRes.data ?? []).map((t: any) => ({
          id:         t.id,
          table_name: t.locations?.label || t.locations?.name || "Unknown table",
          total:      t.total,
          opened_at:  t.opened_at,
        }))
      );

      if (rows.length > 0) {
        const { data: itemData } = await supabase
          .from("order_items")
          .select("order_id, quantity, unit_price, menu_items(name)")
          .in("order_id", rows.map((r) => r.id));
        setItems(
          (itemData ?? []).map((i: any) => ({
            order_id:   i.order_id,
            name:       i.menu_items?.name ?? "Item",
            quantity:   i.quantity,
            unit_price: i.unit_price,
          }))
        );
      } else {
        setItems([]);
      }

      setLoading(false);
    }

    void fetchOrders();

    const channel = supabase
      .channel(`kds-orders-${bizId}`)
      .on("postgres_changes",
        { event: "INSERT", schema: "public", table: "orders", filter: `business_id=eq.${bizId}` },
        () => { notifyNewOrder(); void fetchOrders(); }
      )
      .subscribe();

    const id = setInterval(() => {
      setLastChecked(nowStr());
      void fetchOrders();
    }, REFRESH_MS);

    return () => { clearInterval(id); supabase.removeChannel(channel); };
  }, [bizId]);

  async function closeTab(tabId: string) {
    const { error } = await supabase
      .from("tabs")
      .update({ status: "closed", closed_at: new Date().toISOString() })
      .eq("id", tabId);
    if (!error) setOpenTabs((prev) => prev.filter((t) => t.id !== tabId));
  }

  async function cancelOrder(orderId: string, reason: string) {
    setCancelError("");
    const { error } = await supabase
      .from("orders")
      .update({ status: "cancelled", cancel_reason: reason })
      .eq("id", orderId);
    if (error) {
      console.error("cancelOrder failed:", error);
      setCancelError(error.message);
      return;
    }
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
    setCancellingOrderId(null);
    setCancelReason("");
  }

  async function updateStatus(orderId: string, newStatus: string) {
    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", orderId);

    if (!error) {
      // Remove from KDS when moving past the visible window ("new" / "preparing")
      if (newStatus === "ready" || newStatus === "done") {
        setOrders((prev) => prev.filter((o) => o.id !== orderId));
      } else {
        setOrders((prev) =>
          prev.map((o) => o.id === orderId ? { ...o, status: newStatus } : o)
        );
      }
    }
  }

  async function handleSignOut() {
    await signOutStaff();
    navigate("/staff-login", { replace: true });
  }

  if (loading) {
    return (
      <div style={{ background: BG, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: MUTED, fontFamily: "sans-serif", fontSize: 16 }}>
        Loading orders…
      </div>
    );
  }

  return (
    <div style={{ background: BG, minHeight: "100vh", color: TEXT, fontFamily: "sans-serif" }}>

      {flash && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 50, background: "#4CAF50", color: "#000", textAlign: "center", padding: "10px", fontWeight: 800 }}>
          🔔 New order received
        </div>
      )}

      {/* ── Header ── */}
      <header style={{
        background: SURFACE,
        borderBottom: `1px solid ${BORDER}`,
        padding: "16px 20px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        position: "sticky",
        top: 0,
        zIndex: 10,
      }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: 3, color: ACCENT, fontWeight: 700, textTransform: "uppercase", marginBottom: 2 }}>
            Kitchen Display
          </div>
          <div style={{ fontWeight: 900, fontSize: 18 }}>{bizName}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
          <div style={{ fontSize: 11, color: MUTED, fontFamily: "monospace" }}>
            {orders.length} active · {lastChecked}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => navigate("/staff/floor")}
              style={{ background: "none", border: `1px solid ${BORDER}`, borderRadius: 8, padding: "6px 14px", color: MUTED, fontSize: 12, cursor: "pointer" }}
            >
              Floor view
            </button>
            <button
              onClick={handleSignOut}
              style={{ background: "none", border: `1px solid ${BORDER}`, borderRadius: 8, padding: "6px 14px", color: MUTED, fontSize: 12, cursor: "pointer" }}
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      {/* ── Open Tabs ── */}
      {openTabs.length > 0 && (
        <div style={{ padding: "16px 16px 0", maxWidth: 680, margin: "0 auto" }}>
          <div style={{ fontSize: 11, letterSpacing: 3, color: ACCENT, fontWeight: 700, textTransform: "uppercase", marginBottom: 10 }}>
            Open Tabs — {openTabs.length}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {openTabs.map((tab) => {
              const { text: elText, color: elColor } = formatElapsed(tab.opened_at, now);
              return (
                <div
                  key={tab.id}
                  style={{ background: "#1a1400", border: "1px solid #E8C54733", borderRadius: 12, padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}
                >
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 16 }}>{tab.table_name}</div>
                    <div style={{ fontSize: 12, color: elColor, marginTop: 2, fontFamily: "monospace", fontWeight: 700 }}>
                      ⏱ {elText}
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontWeight: 900, fontSize: 18, color: ACCENT }}>${Number(tab.total).toFixed(2)}</span>
                    <button
                      onClick={() => closeTab(tab.id)}
                      style={{ background: "none", border: "1px solid #E8C54766", borderRadius: 8, padding: "5px 12px", color: ACCENT, fontSize: 12, fontWeight: 700, cursor: "pointer" }}
                    >
                      Close Tab
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Orders ── */}
      <div style={{ padding: "20px 16px", display: "flex", flexDirection: "column", gap: 16, maxWidth: 680, margin: "0 auto" }}>
        {orders.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 24px" }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>✓</div>
            <div style={{ fontWeight: 800, fontSize: 20, marginBottom: 8 }}>All clear</div>
            <div style={{ color: MUTED, fontSize: 14 }}>No active orders.</div>
            <div style={{ color: MUTED, fontSize: 12, marginTop: 12, fontFamily: "monospace" }}>
              Last checked: {lastChecked}
            </div>
          </div>
        ) : (
          orders.map((order, queueIdx) => {
            const orderItems  = items.filter((i) => i.order_id === order.id);
            const statusColor = STATUS_COLOR[order.status] ?? MUTED;
            const { text: elText, color: elColor } = formatElapsed(order.created_at, now);

            return (
              <div
                key={order.id}
                style={{
                  background: SURFACE,
                  border: `2px solid ${statusColor}44`,
                  borderRadius: 14,
                  overflow: "hidden",
                }}
              >
                {/* ── Card header ── */}
                <div style={{
                  background: statusColor + "18",
                  borderBottom: `1px solid ${statusColor}33`,
                  padding: "14px 18px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}>
                  <div>
                    <div style={{ fontSize: 10, letterSpacing: 2, color: MUTED, textTransform: "uppercase", fontWeight: 700, marginBottom: 4 }}>
                      Order #{queueIdx + 1}
                    </div>
                    <div style={{ fontWeight: 900, fontSize: 26, lineHeight: 1, letterSpacing: -0.5 }}>
                      {order.table_name}
                    </div>
                    <div style={{ fontSize: 14, color: elColor, marginTop: 6, fontFamily: "monospace", fontWeight: 700 }}>
                      ⏱ {elText}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{
                      display: "inline-block",
                      background: statusColor + "33",
                      color: statusColor,
                      border: `1px solid ${statusColor}66`,
                      borderRadius: 8,
                      padding: "4px 12px",
                      fontSize: 12,
                      fontWeight: 800,
                      letterSpacing: 1,
                      textTransform: "uppercase",
                      marginBottom: 6,
                    }}>
                      {STATUS_LABEL[order.status] ?? order.status}
                    </div>
                    <div style={{ fontWeight: 800, fontSize: 18, color: TEXT }}>
                      ${Number(order.total).toFixed(2)}
                    </div>
                    <div style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>
                      {orderItems.length} item{orderItems.length !== 1 ? "s" : ""}
                    </div>
                  </div>
                </div>

                {/* ── Items ── */}
                <div style={{ padding: "14px 18px 12px", display: "flex", flexDirection: "column", gap: 12 }}>
                  {orderItems.length === 0 ? (
                    <div style={{ color: MUTED, fontSize: 13 }}>No items</div>
                  ) : (
                    orderItems.map((item, idx) => (
                      <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
                          <span style={{ fontWeight: 900, fontSize: 24, color: ACCENT, minWidth: 32, lineHeight: 1 }}>
                            {item.quantity}×
                          </span>
                          <span style={{ fontWeight: 700, fontSize: 18 }}>{item.name}</span>
                        </div>
                        <span style={{ color: MUTED, fontSize: 14 }}>
                          ${(item.unit_price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))
                  )}
                </div>

                {/* ── Status buttons ── */}
                <div style={{
                  padding: "8px 18px 16px",
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: 8,
                }}>
                  {STAFF_STATUSES.map((s) => {
                    const active = order.status === s;
                    const color  = STATUS_COLOR[s];
                    return (
                      <button
                        key={s}
                        onClick={() => updateStatus(order.id, s)}
                        style={{
                          padding: "12px 4px",
                          borderRadius: 10,
                          border: `2px solid ${active ? color : BORDER}`,
                          background: active ? color + "33" : "none",
                          color: active ? color : MUTED,
                          fontWeight: active ? 900 : 600,
                          fontSize: 11,
                          cursor: "pointer",
                          textTransform: "uppercase",
                          letterSpacing: 0.5,
                          transition: "all 0.15s",
                          minHeight: 44,
                        }}
                      >
                        {STATUS_LABEL[s]}
                      </button>
                    );
                  })}
                </div>

                {/* ── Cancel ── */}
                {cancellingOrderId === order.id ? (
                  <div style={{ borderTop: `1px solid rgba(255,255,255,0.06)`, padding: "10px 18px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                      <select
                        value={cancelReason}
                        onChange={(e) => { setCancelReason(e.target.value); setCancelError(""); }}
                        style={{ flex: 1, minWidth: 140, background: "#1a1a1a", border: `1px solid ${BORDER}`, borderRadius: 8, padding: "10px 12px", color: cancelReason ? TEXT : MUTED, fontSize: 13, cursor: "pointer" }}
                      >
                        <option value="">Select reason…</option>
                        {CANCEL_REASONS.map((r) => <option key={r}>{r}</option>)}
                      </select>
                      <button
                        onClick={() => { if (cancelReason) cancelOrder(order.id, cancelReason); }}
                        disabled={!cancelReason}
                        style={{ padding: "10px 16px", borderRadius: 8, border: `1px solid ${cancelReason ? "#f44336" : BORDER}`, background: cancelReason ? "rgba(244,67,54,0.15)" : "none", color: cancelReason ? "#f44336" : MUTED, fontWeight: 800, fontSize: 13, cursor: cancelReason ? "pointer" : "not-allowed" }}
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => { setCancellingOrderId(null); setCancelReason(""); setCancelError(""); }}
                        style={{ padding: "10px 14px", borderRadius: 8, border: `1px solid ${BORDER}`, background: "none", color: MUTED, fontSize: 13, cursor: "pointer" }}
                      >
                        Keep
                      </button>
                    </div>
                    {cancelError && (
                      <p style={{ margin: 0, fontSize: 11, color: "#f44336" }}>{cancelError}</p>
                    )}
                  </div>
                ) : (
                  <div style={{ borderTop: `1px solid rgba(255,255,255,0.06)`, padding: "10px 18px 14px" }}>
                    <button
                      onClick={() => { setCancellingOrderId(order.id); setCancelReason(""); }}
                      style={{ width: "100%", padding: "10px", borderRadius: 10, border: `1px solid rgba(244,67,54,0.3)`, background: "rgba(244,67,54,0.07)", color: "#f44336", fontWeight: 700, fontSize: 13, cursor: "pointer", letterSpacing: 0.5 }}
                    >
                      Cancel Order
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
