import { useState } from "react";
import { ACCENT, BG, BORDER, MUTED, SURFACE, TEXT, GREEN, RED } from "../constants/theme";

// ── Time helpers ──────────────────────────────────────────────────────────────
const NOW = Date.now();
const MIN = 60_000;
const HR  = 3_600_000;
const ago = (ms: number) => new Date(NOW - ms).toISOString();

// ── Types ─────────────────────────────────────────────────────────────────────
type OrderItem  = { id: string; name: string; quantity: number; unit_price: number };
type DemoOrder  = { id: string; tableName: string; status: string; total: number; created_at: string; cancel_reason?: string; items: OrderItem[] };
type ActiveTab  = "customer" | "orders" | "kitchen" | "financials" | "menu";

// ── Fixture data ──────────────────────────────────────────────────────────────
const ORDERS: DemoOrder[] = [
  {
    id: "o1", tableName: "Table 4", status: "new", total: 52.00, created_at: ago(8 * MIN),
    items: [
      { id: "i1", name: "Wagyu Burger",  quantity: 1, unit_price: 22.00 },
      { id: "i2", name: "Truffle Fries", quantity: 1, unit_price: 12.00 },
      { id: "i3", name: "Craft Lager",   quantity: 2, unit_price: 9.00  },
    ],
  },
  {
    id: "o2", tableName: "Bar Tab — Jamie L.", status: "preparing", total: 96.00, created_at: ago(22 * MIN),
    items: [
      { id: "i4", name: "Grilled Salmon", quantity: 1, unit_price: 34.00 },
      { id: "i5", name: "Caesar Salad",   quantity: 1, unit_price: 14.00 },
      { id: "i6", name: "Pinot Noir",     quantity: 2, unit_price: 18.00 },
      { id: "i7", name: "Crème Brûlée",   quantity: 1, unit_price: 12.00 },
    ],
  },
  {
    id: "o3", tableName: "Table 2", status: "ready", total: 86.00, created_at: ago(35 * MIN),
    items: [
      { id: "i8",  name: "NY Strip Steak",      quantity: 1, unit_price: 42.00 },
      { id: "i9",  name: "Truffle Fries",        quantity: 1, unit_price: 12.00 },
      { id: "i10", name: "House Red",            quantity: 1, unit_price: 18.00 },
      { id: "i11", name: "Chocolate Lava Cake",  quantity: 1, unit_price: 14.00 },
    ],
  },
  {
    id: "o4", tableName: "Table 6", status: "done", total: 57.00, created_at: ago(70 * MIN),
    items: [
      { id: "i12", name: "Chicken Parmesan", quantity: 1, unit_price: 28.00 },
      { id: "i13", name: "Side Salad",       quantity: 2, unit_price: 8.00  },
      { id: "i14", name: "Sparkling Water",  quantity: 1, unit_price: 5.00  },
      { id: "i15", name: "Espresso",         quantity: 2, unit_price: 4.00  },
    ],
  },
  {
    id: "o5", tableName: "Bar Tab — Alex R.", status: "done", total: 212.00, created_at: ago(2 * HR),
    items: [
      { id: "i16", name: "Ribeye Tomahawk",   quantity: 1, unit_price: 85.00 },
      { id: "i17", name: "Lobster Mac",        quantity: 1, unit_price: 38.00 },
      { id: "i18", name: "Bottle of Barolo",   quantity: 1, unit_price: 65.00 },
      { id: "i19", name: "Tiramisu",           quantity: 2, unit_price: 12.00 },
    ],
  },
  {
    id: "o6", tableName: "Table 9", status: "cancelled", total: 34.00, created_at: ago(3 * HR),
    cancel_reason: "Customer refused",
    items: [
      { id: "i20", name: "Margherita Pizza", quantity: 1, unit_price: 22.00 },
      { id: "i21", name: "House Salad",      quantity: 1, unit_price: 12.00 },
    ],
  },
];

const OPEN_TABS = [
  { id: "t1", table_name: "Bar Tab — Jamie L.", total: 96.00,  opened_at: ago(22 * MIN) },
  { id: "t2", table_name: "Table 11",           total: 28.00,  opened_at: ago(12 * MIN) },
  { id: "t3", table_name: "Bar Tab — Alex R.",  total: 212.00, opened_at: ago(2 * HR)   },
];

type KdsOrder = { id: string; tableName: string; status: "new" | "preparing" | "ready"; total: number; created_at: string; items: OrderItem[] };

const KITCHEN_ORDERS: KdsOrder[] = [
  {
    id: "k1", tableName: "Table 4", status: "new", total: 52.00, created_at: ago(3 * MIN),
    items: [
      { id: "ki1", name: "Wagyu Burger",  quantity: 1, unit_price: 22.00 },
      { id: "ki2", name: "Truffle Fries", quantity: 1, unit_price: 12.00 },
      { id: "ki3", name: "Craft Lager",   quantity: 2, unit_price: 9.00  },
    ],
  },
  {
    id: "k2", tableName: "Table 8", status: "new", total: 49.00, created_at: ago(6 * MIN),
    items: [
      { id: "ki4", name: "Chicken Parmesan", quantity: 1, unit_price: 28.00 },
      { id: "ki5", name: "Side Salad",       quantity: 2, unit_price: 8.00  },
      { id: "ki6", name: "Sparkling Water",  quantity: 1, unit_price: 5.00  },
    ],
  },
  {
    id: "k3", tableName: "Table 11", status: "preparing", total: 84.00, created_at: ago(14 * MIN),
    items: [
      { id: "ki7", name: "Grilled Salmon", quantity: 1, unit_price: 34.00 },
      { id: "ki8", name: "Caesar Salad",   quantity: 1, unit_price: 14.00 },
      { id: "ki9", name: "Pinot Noir",     quantity: 2, unit_price: 18.00 },
    ],
  },
  {
    id: "k4", tableName: "Bar Tab — Jamie L.", status: "preparing", total: 86.00, created_at: ago(22 * MIN),
    items: [
      { id: "ki10", name: "NY Strip Steak",      quantity: 1, unit_price: 42.00 },
      { id: "ki11", name: "Truffle Fries",        quantity: 1, unit_price: 12.00 },
      { id: "ki12", name: "House Red",            quantity: 1, unit_price: 18.00 },
      { id: "ki13", name: "Chocolate Lava Cake",  quantity: 1, unit_price: 14.00 },
    ],
  },
  {
    id: "k5", tableName: "Table 2", status: "ready", total: 36.00, created_at: ago(31 * MIN),
    items: [
      { id: "ki14", name: "Crème Brûlée", quantity: 2, unit_price: 12.00 },
      { id: "ki15", name: "Tiramisu",     quantity: 1, unit_price: 12.00 },
    ],
  },
];

const MENU_CATEGORIES = [
  {
    id: "c1", name: "Starters",
    items: [
      { id: "m1", name: "Caesar Salad",  price: 14.00, description: "Romaine, parmesan, house-made dressing, croutons" },
      { id: "m2", name: "Tuna Tartare",  price: 18.00, description: "Sashimi-grade tuna, avocado, sesame oil, wonton chips" },
      { id: "m3", name: "Truffle Fries", price: 12.00, description: "Hand-cut fries, truffle oil, parmesan, fresh herbs" },
    ],
  },
  {
    id: "c2", name: "Mains",
    items: [
      { id: "m4", name: "Wagyu Burger",     price: 22.00, description: "6oz wagyu patty, aged cheddar, caramelised onion, brioche bun" },
      { id: "m5", name: "Grilled Salmon",   price: 34.00, description: "Atlantic salmon, lemon butter sauce, seasonal vegetables" },
      { id: "m6", name: "NY Strip Steak",   price: 42.00, description: "10oz prime cut, herb butter, choice of side" },
      { id: "m7", name: "Chicken Parmesan", price: 28.00, description: "Breaded chicken breast, house marinara, fresh mozzarella" },
    ],
  },
  {
    id: "c3", name: "Desserts",
    items: [
      { id: "m8",  name: "Crème Brûlée",       price: 12.00, description: "Classic French custard, caramelised sugar, fresh berries" },
      { id: "m9",  name: "Chocolate Lava Cake", price: 14.00, description: "Warm dark chocolate, vanilla bean ice cream" },
      { id: "m10", name: "Tiramisu",            price: 12.00, description: "Espresso-soaked sponge, mascarpone cream" },
    ],
  },
];

// ── Financials fixture ────────────────────────────────────────────────────────
const ORDER_REVENUE  = 12_847.00;
const MANUAL_REVENUE =  1_240.00;
const TOTAL_REVENUE  = ORDER_REVENUE + MANUAL_REVENUE;
const EXPENSE_CATS   = [
  { category: "Food & Beverage", amount: 4_200.00 },
  { category: "Staff",           amount: 3_800.00 },
  { category: "Rent",            amount: 2_500.00 },
  { category: "Utilities",       amount:   380.00 },
];
const TOTAL_EXPENSES = EXPENSE_CATS.reduce((s, e) => s + e.amount, 0);
const NET            = TOTAL_REVENUE - TOTAL_EXPENSES;
const AVG_ORDER      = ORDER_REVENUE / 181;

const CANCELLATIONS = [
  { reason: "Wrong order",      count: 3, lost: 122.00 },
  { reason: "Item unavailable", count: 2, lost: 87.50  },
  { reason: "Customer refused", count: 1, lost: 34.00  },
];
const TOTAL_CANCEL_COUNT = CANCELLATIONS.reduce((s, c) => s + c.count, 0);
const TOTAL_LOST         = CANCELLATIONS.reduce((s, c) => s + c.lost,  0);

// 7-day daily revenue — computed once at load time so labels match real calendar days
const LAST_7_DAYS = Array.from({ length: 7 }, (_, i) => {
  const d = new Date(NOW - (6 - i) * 24 * HR);
  return { date: d.toISOString().slice(0, 10), label: d.toLocaleDateString(undefined, { weekday: "short" }) };
});
const DAILY_REVENUE: Record<string, number> = {
  [LAST_7_DAYS[0].date]:  420,
  [LAST_7_DAYS[1].date]:  380,
  [LAST_7_DAYS[2].date]:  510,
  [LAST_7_DAYS[3].date]:  640,
  [LAST_7_DAYS[4].date]:  920,
  [LAST_7_DAYS[5].date]: 1580,
  [LAST_7_DAYS[6].date]:  847,
};
const MAX_DAY = Math.max(...Object.values(DAILY_REVENUE));

// ── Style helpers ─────────────────────────────────────────────────────────────
const ORDER_STATUS_COLOR: Record<string, string> = {
  new: "#E8C547", preparing: "#F97316", ready: "#4CAF50", done: "#888888", cancelled: "#f44336",
};

const card: React.CSSProperties = {
  background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "24px 28px",
};

const badge = (color: string): React.CSSProperties => ({
  display: "inline-block", background: color + "22", color,
  border: `1px solid ${color}44`, borderRadius: 6, padding: "3px 10px",
  fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase",
});

const fmt = (n: number) => n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// ── Component ─────────────────────────────────────────────────────────────────
export default function DemoDashboardPage() {
  const [activeTab, setActiveTab]     = useState<ActiveTab>("orders");
  const [expanded, setExpanded]       = useState<Set<string>>(new Set(["o1", "o2"]));
  const [isMobile]                    = useState(() => window.innerWidth < 640);
  const [activeCat, setActiveCat]     = useState(() => MENU_CATEGORIES[0].id);

  function toggleOrder(id: string) {
    setExpanded((prev) => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
  }

  const TABS: ActiveTab[] = ["customer", "orders", "kitchen", "financials", "menu"];
  const menuItemCount = MENU_CATEGORIES.reduce((s, c) => s + c.items.length, 0);

  return (
    <div style={{ background: BG, minHeight: "100vh", color: TEXT, fontFamily: "sans-serif" }}>

      {/* Demo banner */}
      <div style={{ background: ACCENT, color: BG, textAlign: "center", padding: "9px 16px", fontSize: 12, fontWeight: 800, letterSpacing: 2, textTransform: "uppercase" }}>
        DEMO — Sample data only. Nothing here is real.
      </div>

      {/* Nav */}
      <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: isMobile ? "14px 16px" : "18px 32px", borderBottom: `1px solid ${BORDER}`, gap: 12 }}>
        <div style={{ minWidth: 0, overflow: "hidden" }}>
          <span style={{ fontWeight: 900, fontSize: isMobile ? 15 : 18, letterSpacing: -0.5, display: "block", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            Demo Bistro
          </span>
          <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
            <span style={{ ...badge(ACCENT) }}>pro</span>
            <span style={{ ...badge(GREEN) }}>active</span>
          </div>
        </div>
        <a href="/register"
          style={{ background: ACCENT, color: BG, borderRadius: 8, padding: "10px 20px", fontWeight: 800, fontSize: 13, cursor: "pointer", textDecoration: "none", whiteSpace: "nowrap", flexShrink: 0 }}>
          Start Free Trial →
        </a>
      </nav>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: isMobile ? "20px 16px" : "36px 24px", display: "flex", flexDirection: "column", gap: 28 }}>

        {/* Metric cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14 }}>
          {[
            { label: "Revenue Today",  value: "$847.50",                  color: GREEN  },
            { label: "Orders Today",   value: "12",                       color: ACCENT },
            { label: "Avg Ticket",     value: `$${AVG_ORDER.toFixed(2)}`, color: ACCENT },
            { label: "Open Tabs",      value: `${OPEN_TABS.length}`,      color: TEXT   },
          ].map((m) => (
            <div key={m.label} style={{ ...card, padding: "18px 20px" }}>
              <div style={{ fontSize: 11, color: MUTED, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>{m.label}</div>
              <div style={{ fontSize: 26, fontWeight: 900, color: m.color }}>{m.value}</div>
            </div>
          ))}
        </div>

        {/* Tab bar */}
        <div>
          <div style={{ display: "flex", gap: 0, borderBottom: `1px solid ${BORDER}`, marginBottom: 24, overflowX: "auto", scrollbarWidth: "none" } as React.CSSProperties}>
            {TABS.map((t) => (
              <button key={t} onClick={() => setActiveTab(t)}
                style={{ background: "none", border: "none", borderBottom: activeTab === t ? `2px solid ${ACCENT}` : "2px solid transparent", color: activeTab === t ? ACCENT : MUTED, padding: isMobile ? "10px 14px" : "12px 24px", fontWeight: 700, fontSize: isMobile ? 13 : 14, cursor: "pointer", textTransform: "capitalize", letterSpacing: 0.5, transition: "color 0.15s", whiteSpace: "nowrap", flexShrink: 0 }}>
                {t}
                {t === "customer" && (
                  <span style={{ marginLeft: 6, background: ACCENT, color: BG, borderRadius: 10, padding: "1px 7px", fontSize: 11, fontWeight: 800 }}>4</span>
                )}
                {t === "orders" && (
                  <span style={{ marginLeft: 8, background: BORDER, borderRadius: 12, padding: "2px 8px", fontSize: 11, color: MUTED }}>{ORDERS.length}</span>
                )}
                {t === "kitchen" && (
                  <span style={{ marginLeft: 8, background: BORDER, borderRadius: 12, padding: "2px 8px", fontSize: 11, color: MUTED }}>{KITCHEN_ORDERS.length}</span>
                )}
                {t === "menu" && (
                  <span style={{ marginLeft: 8, background: BORDER, borderRadius: 12, padding: "2px 8px", fontSize: 11, color: MUTED }}>{menuItemCount}</span>
                )}
              </button>
            ))}
          </div>

          {/* ── Customer tab ───────────────────────────────────────────────── */}
          {activeTab === "customer" && (
            <div style={{ maxWidth: 420, margin: "0 auto" }}>

              {/* Business header */}
              <div style={{ padding: "20px 16px 14px", borderBottom: `1px solid ${BORDER}`, background: SURFACE }}>
                <div style={{ fontSize: 11, letterSpacing: 2, color: ACCENT, fontWeight: 700, textTransform: "uppercase", marginBottom: 6 }}>Dine-in · Scan & Order</div>
                <h1 style={{ margin: "0 0 8px", fontSize: 22, fontWeight: 800, color: TEXT }}>Demo Bistro</h1>
                <span style={{ ...badge(ACCENT), fontSize: 12 }}>Table 4</span>
              </div>

              {/* Open-tab banner */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 16px", background: "#1a1400", borderBottom: `1px solid ${ACCENT}44` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 12, color: MUTED }}>Tab open</span>
                  <span style={{ fontWeight: 800, color: ACCENT, fontSize: 16 }}>$96.00</span>
                </div>
                <button disabled title="Read-only demo"
                  style={{ background: "none", border: `1px solid ${ACCENT}`, color: ACCENT, borderRadius: 8, padding: "5px 12px", fontSize: 12, fontWeight: 700, cursor: "not-allowed" }}>
                  View Tab (3)
                </button>
              </div>

              {/* Category nav pills */}
              <div style={{ display: "flex", flexWrap: "nowrap", gap: 8, padding: "10px 16px", overflowX: "auto", borderBottom: `1px solid ${BORDER}`, background: BG, scrollbarWidth: "none" } as React.CSSProperties}>
                {MENU_CATEGORIES.map((cat) => (
                  <button key={cat.id} onClick={() => setActiveCat(cat.id)}
                    style={{ background: activeCat === cat.id ? ACCENT : "transparent", border: `1px solid ${activeCat === cat.id ? ACCENT : BORDER}`, color: activeCat === cat.id ? BG : MUTED, borderRadius: 20, padding: "6px 14px", fontSize: 13, cursor: "pointer", whiteSpace: "nowrap", fontWeight: activeCat === cat.id ? 700 : 400, transition: "all 0.15s", flexShrink: 0 }}>
                    {cat.name}
                  </button>
                ))}
              </div>

              {/* Menu sections */}
              <div style={{ padding: "0 16px", background: BG }}>
                {MENU_CATEGORIES.map((cat) => (
                  <div key={cat.id} style={{ paddingTop: 20, paddingBottom: 4 }}>
                    <h2 style={{ fontSize: 13, fontWeight: 800, color: ACCENT, margin: "0 0 12px", textTransform: "uppercase", letterSpacing: 1 }}>{cat.name}</h2>
                    {cat.items.map((item) => (
                      <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", background: SURFACE, borderRadius: 10, padding: "14px 16px", marginBottom: 10, border: `1px solid ${BORDER}` }}>
                        <div style={{ flex: 1, paddingRight: 12 }}>
                          <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4, color: TEXT }}>{item.name}</div>
                          <div style={{ fontSize: 12, color: MUTED, lineHeight: 1.4, marginBottom: 6 }}>{item.description}</div>
                          <div style={{ color: ACCENT, fontWeight: 700, fontSize: 15 }}>${item.price.toFixed(2)}</div>
                        </div>
                        <div style={{ paddingTop: 2, flexShrink: 0 }}>
                          <button disabled title="Read-only demo"
                            style={{ background: ACCENT, color: BG, border: "none", borderRadius: 8, padding: "7px 16px", fontWeight: 700, fontSize: 13, cursor: "not-allowed" }}>
                            + Add
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
                <div style={{ height: 80 }} />
              </div>

              {/* Cart bar — sticky to bottom of viewport while scrolling through menu */}
              <div style={{ position: "sticky", bottom: 0, background: SURFACE, borderTop: `2px solid ${ACCENT}`, padding: "14px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", zIndex: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ background: ACCENT, color: BG, borderRadius: "50%", width: 26, height: 26, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 13 }}>4</span>
                  <span style={{ fontSize: 14, color: MUTED }}>items in cart</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <span style={{ fontWeight: 700, fontSize: 16, color: ACCENT }}>$52.00</span>
                  <button disabled title="Read-only demo"
                    style={{ background: ACCENT, color: BG, border: "none", borderRadius: 8, padding: "10px 20px", fontWeight: 700, fontSize: 14, cursor: "not-allowed" }}>
                    Place Order
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* ── Orders tab ─────────────────────────────────────────────────── */}
          {activeTab === "orders" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

              <div>
                <p style={{ fontSize: 11, letterSpacing: 3, color: ACCENT, fontWeight: 700, textTransform: "uppercase", margin: "0 0 12px" }}>
                  Open Tabs — {OPEN_TABS.length}
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {OPEN_TABS.map((ot) => (
                    <div key={ot.id} style={{ ...card, padding: "14px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", borderColor: ACCENT + "44", flexWrap: "wrap", gap: 10 }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 15 }}>{ot.table_name}</div>
                        <div style={{ color: MUTED, fontSize: 12, marginTop: 2 }}>
                          Opened {new Date(ot.opened_at).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </div>
                      <span style={{ fontWeight: 900, fontSize: 18, color: ACCENT }}>${ot.total.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {ORDERS.map((order) => {
                  const isExpanded  = expanded.has(order.id);
                  const statusColor = ORDER_STATUS_COLOR[order.status] ?? MUTED;
                  return (
                    <div key={order.id} style={{ ...card, padding: 0 }}>
                      <div onClick={() => toggleOrder(order.id)}
                        style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", cursor: "pointer", gap: 12 }}>
                        <div style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
                          <span style={{ fontWeight: 700, fontSize: 14 }}>{order.tableName}</span>
                          <span style={badge(statusColor)}>{order.status}</span>
                          <span style={{ color: MUTED, fontSize: 12, fontFamily: "monospace" }}>
                            {new Date(order.created_at).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 16, flexShrink: 0 }}>
                          <span style={{ fontWeight: 800, fontSize: 15 }}>${order.total.toFixed(2)}</span>
                          <span style={{ color: MUTED, fontSize: 12 }}>{isExpanded ? "▲" : "▼"}</span>
                        </div>
                      </div>
                      {isExpanded && (
                        <div style={{ borderTop: `1px solid ${BORDER}`, padding: "16px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
                          {order.items.map((item) => (
                            <div key={item.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                              <span style={{ color: TEXT }}>
                                <span style={{ color: MUTED, fontFamily: "monospace", marginRight: 10 }}>{item.quantity}×</span>
                                {item.name}
                              </span>
                              <span style={{ color: MUTED }}>${(item.unit_price * item.quantity).toFixed(2)}</span>
                            </div>
                          ))}
                          {order.status === "cancelled" && (
                            <div style={{ fontSize: 12, color: RED, fontStyle: "italic", marginTop: 6 }}>
                              Cancelled{order.cancel_reason ? `: ${order.cancel_reason}` : ""}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Kitchen tab ────────────────────────────────────────────────── */}
          {activeTab === "kitchen" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ fontSize: 11, color: MUTED, fontFamily: "monospace", textAlign: "right", marginBottom: -8 }}>
                {KITCHEN_ORDERS.filter((o) => o.status !== "ready").length} active · {KITCHEN_ORDERS.filter((o) => o.status === "ready").length} ready
              </div>
              {KITCHEN_ORDERS.map((order) => {
                const sc = ORDER_STATUS_COLOR[order.status] ?? MUTED;
                return (
                  <div key={order.id} style={{ background: SURFACE, border: `2px solid ${sc}44`, borderRadius: 14, overflow: "hidden" }}>

                    {/* Ticket header */}
                    <div style={{ background: sc + "18", borderBottom: `1px solid ${sc}33`, padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <div style={{ fontWeight: 900, fontSize: 20, color: TEXT }}>{order.tableName}</div>
                        <div style={{ fontSize: 12, color: MUTED, marginTop: 2 }}>{minutesAgo(order.created_at)}</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ display: "inline-block", background: sc + "33", color: sc, border: `1px solid ${sc}66`, borderRadius: 8, padding: "4px 12px", fontSize: 12, fontWeight: 800, letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>
                          {order.status}
                        </div>
                        <div style={{ fontWeight: 800, fontSize: 16, color: TEXT }}>${order.total.toFixed(2)}</div>
                      </div>
                    </div>

                    {/* Items */}
                    <div style={{ padding: "14px 18px 10px", display: "flex", flexDirection: "column", gap: 10 }}>
                      {order.items.map((item) => (
                        <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
                            <span style={{ fontWeight: 900, fontSize: 22, color: ACCENT, minWidth: 28 }}>{item.quantity}×</span>
                            <span style={{ fontWeight: 700, fontSize: 17, color: TEXT }}>{item.name}</span>
                          </div>
                          <span style={{ color: MUTED, fontSize: 14 }}>${(item.unit_price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>

                    {/* Status buttons — visual only */}
                    <div style={{ padding: "10px 18px 16px", display: "flex", gap: 10 }}>
                      {(["new", "preparing", "ready"] as const).map((s) => {
                        const active = order.status === s;
                        const color  = ORDER_STATUS_COLOR[s];
                        return (
                          <button key={s} disabled title="Read-only demo"
                            style={{ flex: 1, padding: "12px 8px", borderRadius: 10, border: `2px solid ${active ? color : BORDER}`, background: active ? color + "33" : "none", color: active ? color : MUTED, fontWeight: active ? 900 : 600, fontSize: 13, cursor: "not-allowed", textTransform: "uppercase", letterSpacing: 0.5 }}>
                            {s}
                          </button>
                        );
                      })}
                    </div>

                  </div>
                );
              })}
            </div>
          )}

          {/* ── Financials tab ─────────────────────────────────────────────── */}
          {activeTab === "financials" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14 }}>
                {[
                  { label: "Revenue (30d)",   value: `$${fmt(TOTAL_REVENUE)}`, color: GREEN  },
                  { label: "Orders (billed)", value: "181",                    color: ACCENT },
                  { label: "Avg order value", value: `$${AVG_ORDER.toFixed(2)}`, color: ACCENT },
                  { label: "Net (30d)",        value: `$${fmt(NET)}`,           color: GREEN  },
                ].map((s) => (
                  <div key={s.label} style={{ ...card, padding: "18px 20px" }}>
                    <div style={{ fontSize: 11, color: MUTED, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>{s.label}</div>
                    <div style={{ fontSize: 26, fontWeight: 900, color: s.color }}>{s.value}</div>
                  </div>
                ))}
              </div>

              <div style={{ ...card }}>
                <p style={{ fontSize: 11, letterSpacing: 3, color: ACCENT, fontWeight: 700, textTransform: "uppercase", marginBottom: 20 }}>Daily Revenue — Last 7 Days</p>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 120 }}>
                  {LAST_7_DAYS.map(({ date, label }) => {
                    const val = DAILY_REVENUE[date] ?? 0;
                    const pct = (val / MAX_DAY) * 100;
                    return (
                      <div key={date} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, height: "100%" }}>
                        <div style={{ fontSize: 10, color: MUTED }}>{val > 0 ? `$${val}` : ""}</div>
                        <div style={{ flex: 1, display: "flex", alignItems: "flex-end", width: "100%" }}>
                          <div style={{ width: "100%", height: `${Math.max(pct, 4)}%`, background: ACCENT + "aa", borderRadius: "4px 4px 0 0", transition: "height 0.3s" }} />
                        </div>
                        <div style={{ fontSize: 10, color: MUTED }}>{label}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div style={{ ...card }}>
                <p style={{ fontSize: 11, letterSpacing: 3, color: ACCENT, fontWeight: 700, textTransform: "uppercase", marginBottom: 20 }}>Income Statement — Last 30 Days</p>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: MUTED, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>Revenue</div>
                  <StmtRow label="Orders (completed)" value={ORDER_REVENUE}  color={GREEN} />
                  <StmtRow label="Catering (manual)"  value={MANUAL_REVENUE} color={GREEN} />
                  <StmtDivider />
                  <StmtRow label="Total Revenue" value={TOTAL_REVENUE} color={GREEN} bold />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: MUTED, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>Expenses</div>
                  {EXPENSE_CATS.map((e) => <StmtRow key={e.category} label={e.category} value={e.amount} color={RED} negate />)}
                  <StmtDivider />
                  <StmtRow label="Total Expenses" value={TOTAL_EXPENSES} color={RED} bold negate />
                </div>
                <div style={{ borderTop: `2px solid ${BORDER}`, paddingTop: 14 }}>
                  <StmtRow label="Net Profit" value={NET} color={GREEN} bold />
                </div>
              </div>

              <div style={{ ...card, display: "flex", flexDirection: "column", gap: 20 }}>
                <p style={{ fontSize: 11, letterSpacing: 3, color: RED, fontWeight: 700, textTransform: "uppercase", margin: 0 }}>Cancellations — Last 30 Days</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div style={{ background: RED + "11", border: `1px solid ${RED}33`, borderRadius: 10, padding: "16px 18px" }}>
                    <div style={{ fontSize: 11, color: RED, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>Cancelled orders</div>
                    <div style={{ fontSize: 28, fontWeight: 900, color: RED }}>{TOTAL_CANCEL_COUNT}</div>
                  </div>
                  <div style={{ background: RED + "11", border: `1px solid ${RED}33`, borderRadius: 10, padding: "16px 18px" }}>
                    <div style={{ fontSize: 11, color: RED, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>Lost revenue</div>
                    <div style={{ fontSize: 28, fontWeight: 900, color: RED }}>${TOTAL_LOST.toFixed(2)}</div>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div style={{ fontSize: 11, color: MUTED, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>By Reason</div>
                  {CANCELLATIONS.map(({ reason, count, lost }) => {
                    const pct = (count / TOTAL_CANCEL_COUNT) * 100;
                    return (
                      <div key={reason}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
                          <span style={{ fontSize: 13, color: TEXT, fontWeight: 600 }}>{reason}</span>
                          <span style={{ fontSize: 12, color: MUTED, fontFamily: "monospace" }}>{count}× · ${lost.toFixed(2)} ({pct.toFixed(0)}%)</span>
                        </div>
                        <div style={{ height: 5, background: "rgba(255,255,255,0.06)", borderRadius: 3, overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${pct}%`, background: RED + "88", borderRadius: 3, transition: "width 0.3s" }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ── Menu tab ───────────────────────────────────────────────────── */}
          {activeTab === "menu" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
              {MENU_CATEGORIES.map((cat) => (
                <div key={cat.id}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                    <h3 style={{ fontWeight: 800, fontSize: 15, color: TEXT, margin: 0 }}>{cat.name}</h3>
                    <span style={{ color: MUTED, fontSize: 12 }}>{cat.items.length} items</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {cat.items.map((item) => (
                      <div key={item.id} style={{ ...card, padding: "14px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1, minWidth: 0 }}>
                          <span style={{ fontWeight: 700, fontSize: 14 }}>{item.name}</span>
                          <span style={{ color: MUTED, fontSize: 12 }}>{item.description}</span>
                        </div>
                        <span style={{ fontWeight: 800, fontSize: 15, color: ACCENT, flexShrink: 0 }}>${item.price.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom CTA */}
        <div style={{ ...card, textAlign: "center", borderColor: ACCENT + "33", padding: "36px 24px" }}>
          <p style={{ fontSize: 11, letterSpacing: 3, color: ACCENT, fontWeight: 700, textTransform: "uppercase", marginBottom: 10 }}>Ready to go live?</p>
          <p style={{ color: MUTED, fontSize: 14, margin: "0 0 24px", lineHeight: 1.7 }}>
            Set up QR ordering for your venue in minutes.<br />No hardware. No app download. Orders straight to your dashboard.
          </p>
          <a href="/register"
            style={{ display: "inline-block", background: ACCENT, color: BG, borderRadius: 8, padding: "14px 36px", fontWeight: 800, fontSize: 15, textDecoration: "none" }}>
            Start Free Trial →
          </a>
        </div>

      </div>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function minutesAgo(dateStr: string) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60_000);
  if (diff < 1) return "just now";
  if (diff === 1) return "1 min ago";
  return `${diff} mins ago`;
}

// ── Statement helpers ─────────────────────────────────────────────────────────
function StmtRow({ label, value, color, bold, negate }: {
  label: string; value: number; color: string; bold?: boolean; negate?: boolean;
}) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "5px 8px", marginBottom: 2 }}>
      <span style={{ fontSize: 14, color: bold ? TEXT : MUTED, fontWeight: bold ? 800 : 400 }}>{label}</span>
      <span style={{ fontSize: 14, color, fontWeight: bold ? 900 : 600, fontFamily: "monospace" }}>
        {negate ? "−" : ""}${value.toLocaleString("en-US", { minimumFractionDigits: 2 })}
      </span>
    </div>
  );
}

function StmtDivider() {
  return <div style={{ borderTop: `1px solid ${BORDER}`, margin: "8px 8px 10px" }} />;
}
