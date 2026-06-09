import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { getStaffProfile, signOutStaff } from "../lib/useStaffAuth";
import { ACCENT, BG, BORDER, MUTED, SURFACE, TEXT, GREEN, RED } from "../constants/theme";

type Location  = { id: string; name: string };
type Cat       = { id: string; name: string };
type Item      = { id: string; category_id: string; name: string; price: number };
type Tab       = { id: string; location_id: string; total: number; opened_by_staff_id?: string | null };
type TodayTab  = { total: number; tip_amount: number | null };

const round2 = (n: number) => Math.round(n * 100) / 100;
const PAYMENT_METHODS = ["Cash", "Card", "Other"] as const;
const POPULAR = "__popular__";

export default function CashierPage() {
  const navigate = useNavigate();

  const [bizId,      setBizId]      = useState<string | null>(null);
  const [bizName,    setBizName]    = useState("Cashier");
  const [serverId,   setServerId]   = useState<string | null>(null);
  const [taxRate,    setTaxRate]    = useState(0);

  const [locations,       setLocations]       = useState<Location[]>([]);
  const [activeLocation,  setActiveLocation]  = useState<Location | null>(null);
  const [cats,            setCats]            = useState<Cat[]>([]);
  const [items,           setItems]           = useState<Item[]>([]);
  const [openTabs,        setOpenTabs]        = useState<Tab[]>([]);
  const [popularIds,      setPopularIds]      = useState<string[]>([]);
  const [todayTabs,       setTodayTabs]       = useState<TodayTab[]>([]);

  const [loading,  setLoading]  = useState(true);
  const [view,     setView]     = useState<"menu" | "payment">("menu");
  const [activeCat, setActiveCat] = useState<string>(POPULAR);
  const [search,   setSearch]   = useState("");
  const [cart,     setCart]     = useState<Record<string, number>>({});
  const [notes,    setNotes]    = useState("");
  const [tip,      setTip]      = useState("");
  const [sending,  setSending]  = useState(false);
  const [closing,  setClosing]  = useState(false);
  const [msg,          setMsg]          = useState("");
  const [pm,           setPm]           = useState<string | null>(null);
  const [cashTendered, setCashTendered] = useState("");

  const loadTodayTabs = useCallback(async (id: string, staffId: string | null) => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    let query = supabase
      .from("tabs")
      .select("total, tip_amount")
      .eq("business_id", id)
      .eq("status", "closed")
      .gte("closed_at", start.toISOString());
    if (staffId) query = query.eq("server_id", staffId);
    const { data } = await query;
    setTodayTabs((data as TodayTab[]) || []);
  }, []);

  const loadTabs = useCallback(async (id: string) => {
    const { data } = await supabase
      .from("tabs").select("id, location_id, total, status, opened_by_staff_id")
      .eq("business_id", id).eq("status", "open");
    setOpenTabs((data as Tab[]) || []);
  }, []);

  const loadAll = useCallback(async (id: string, staffId: string | null = null) => {
    const { data: bp } = await supabase
      .from("business_public").select("tax_rate").eq("id", id).maybeSingle();
    setTaxRate(Number(bp?.tax_rate ?? 0));

    const { data: locs } = await supabase
      .from("locations").select("id, name")
      .eq("business_id", id).eq("is_active", true).order("name");
    const locList = (locs as Location[]) || [];
    setLocations(locList);
    if (locList.length > 0) setActiveLocation(locList[0]);

    const { data: c } = await supabase
      .from("menu_categories").select("id, name")
      .eq("business_id", id).eq("is_visible", true).order("display_order");
    const catList = (c as Cat[]) || [];
    setCats(catList);

    let itemList: Item[] = [];
    if (catList.length) {
      const { data: it } = await supabase
        .from("menu_items").select("id, category_id, name, price")
        .in("category_id", catList.map((x) => x.id))
        .eq("is_available", true).order("display_order");
      itemList = (it as Item[]) || [];
      setItems(itemList);
    }

    try {
      const { data: oi } = await supabase
        .from("order_items")
        .select("menu_item_id, quantity, orders!inner(business_id)")
        .eq("orders.business_id", id);
      const counts: Record<string, number> = {};
      (oi as any[] | null)?.forEach((r) => {
        if (!r.menu_item_id) return;
        counts[r.menu_item_id] = (counts[r.menu_item_id] || 0) + Number(r.quantity || 0);
      });
      const top = Object.entries(counts)
        .sort((a, b) => b[1] - a[1]).slice(0, 8)
        .map(([mid]) => mid)
        .filter((mid) => itemList.some((i) => i.id === mid));
      setPopularIds(top);
    } catch { setPopularIds([]); }

    await Promise.all([loadTabs(id), loadTodayTabs(id, staffId)]);
  }, [loadTabs, loadTodayTabs]);

  useEffect(() => {
    (async () => {
      const profile = await getStaffProfile();
      if (!profile) { navigate("/staff-login"); return; }
      setBizId(profile.bizId);
      setBizName(profile.bizName || "Cashier");
      setServerId(profile.serverId);
      await loadAll(profile.bizId, profile.serverId);
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!bizId) return;
    const t = setInterval(() => { loadTabs(bizId); loadTodayTabs(bizId, serverId); }, 15000);
    return () => clearInterval(t);
  }, [bizId, serverId, loadTabs, loadTodayTabs]);

  const currentTab = activeLocation
    ? openTabs.find((t) => t.location_id === activeLocation.id) || null
    : null;

  const withTax = (sub: number) => round2(sub * (1 + taxRate));
  const addToCart = (id: string) => setCart((c) => ({ ...c, [id]: (c[id] || 0) + 1 }));
  const decFromCart = (id: string) =>
    setCart((c) => {
      const q = (c[id] || 0) - 1;
      const next = { ...c };
      if (q <= 0) delete next[id]; else next[id] = q;
      return next;
    });

  const cartLines = Object.entries(cart)
    .map(([id, qty]) => { const it = items.find((x) => x.id === id); return it ? { id, name: it.name, price: Number(it.price), qty } : null; })
    .filter(Boolean) as { id: string; name: string; price: number; qty: number }[];

  const cartSubtotal = round2(cartLines.reduce((s, l) => s + l.price * l.qty, 0));
  const cartTax      = round2(cartSubtotal * taxRate);
  const cartGrand    = round2(cartSubtotal + cartTax);

  // Returns true on success, false on error.
  async function sendOrder(): Promise<boolean> {
    if (!activeLocation || !bizId || cartLines.length === 0) return false;
    setSending(true); setMsg("");
    try {
      let tab = currentTab;
      if (!tab) {
        const { data: newTab, error: tErr } = await supabase
          .from("tabs")
          .insert({ business_id: bizId, location_id: activeLocation.id, status: "open", total: 0, opened_by_staff_id: serverId || null })
          .select("id, location_id, total").single();
        if (tErr || !newTab) throw new Error(tErr?.message || "Could not open tab");
        tab = newTab as Tab;
      } else if (!tab.opened_by_staff_id && serverId) {
        await supabase.from("tabs").update({ opened_by_staff_id: serverId }).eq("id", tab.id);
      }
      const orderId = crypto.randomUUID();
      const { error: oErr } = await supabase.from("orders").insert({
        id: orderId, business_id: bizId, location_id: activeLocation.id,
        subtotal: cartSubtotal, tax: cartTax, total: cartGrand, status: "new", tab_id: tab.id,
        notes: notes.trim() || null,
      });
      if (oErr) throw new Error(oErr.message);
      const { error: iErr } = await supabase.from("order_items").insert(
        cartLines.map((l) => ({ order_id: orderId, menu_item_id: l.id, quantity: l.qty, unit_price: l.price }))
      );
      if (iErr) throw new Error(iErr.message);
      await supabase.from("tabs").update({ total: round2(Number(tab.total) + cartSubtotal) }).eq("id", tab.id);
      setCart({}); setNotes("");
      await loadTabs(bizId);
      setMsg("Sent to kitchen ✓");
      return true;
    } catch (e: any) {
      setMsg(`Error: ${e?.message ?? e}`);
      return false;
    } finally {
      setSending(false);
    }
  }

  async function handleCharge() {
    if (cartLines.length > 0) {
      const ok = await sendOrder();
      if (!ok) return;
    }
    setMsg("");
    setView("payment");
  }

  async function closeTab(method: string) {
    if (!["Cash", "Card", "Other"].includes(method)) { setMsg("Select a payment method."); return; }
    if (!activeLocation || !bizId) return;
    const tab = currentTab;
    if (!tab) { setView("menu"); return; }
    setClosing(true); setMsg("");
    try {
      const { error } = await supabase.from("tabs").update({
        status: "closed", closed_at: new Date().toISOString(),
        total: Number(tab.total), payment_method: method,
        tip_amount: Number(tip) || 0, server_id: serverId,
      }).eq("id", tab.id);
      if (error) throw new Error(error.message);
      await Promise.all([loadTabs(bizId), loadTodayTabs(bizId, serverId)]);
      setCart({}); setTip(""); setPm(null); setCashTendered(""); setMsg(""); setView("menu");
    } catch (e: any) {
      setMsg(`Error: ${e?.message ?? e}`);
    } finally {
      setClosing(false);
    }
  }

  // ── Today stats ──────────────────────────────────────────────────
  const todayCount   = todayTabs.length;
  const todayRevenue = todayTabs.reduce((s, t) => s + Number(t.total), 0);
  const todayTips    = todayTabs.reduce((s, t) => s + Number(t.tip_amount ?? 0), 0);

  // ── Shared styles ────────────────────────────────────────────────
  const page: React.CSSProperties = { minHeight: "100vh", background: BG, color: TEXT, padding: 16 };
  const pill = (active: boolean): React.CSSProperties => ({
    padding: "8px 14px", borderRadius: 20, fontWeight: 700, fontSize: 13, cursor: "pointer",
    border: `1px solid ${active ? ACCENT : BORDER}`, background: active ? ACCENT : "transparent",
    color: active ? BG : TEXT, whiteSpace: "nowrap",
  });
  const ghostBtn: React.CSSProperties = {
    padding: "8px 14px", borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: "pointer",
    border: `1px solid ${BORDER}`, background: "transparent", color: TEXT,
  };
  const primaryBtn = (disabled = false): React.CSSProperties => ({
    padding: "14px 20px", borderRadius: 10, fontWeight: 800, fontSize: 15, border: "none",
    background: ACCENT, color: BG, cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.5 : 1, flex: 1,
  });
  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "12px 14px", borderRadius: 10, border: `1px solid ${BORDER}`,
    background: SURFACE, color: TEXT, fontSize: 15, marginBottom: 12, boxSizing: "border-box",
  };

  if (loading) {
    return <div style={{ ...page, display: "grid", placeItems: "center" }}>Loading cashier…</div>;
  }

  // ── PAYMENT VIEW ─────────────────────────────────────────────────
  if (view === "payment") {
    const tab   = currentTab;
    const grand = withTax(Number(tab?.total ?? 0));
    return (
      <div style={page}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <button style={ghostBtn} onClick={() => { setView("menu"); setMsg(""); setPm(null); setCashTendered(""); }}>← Back</button>
          <span style={{ fontSize: 18, fontWeight: 900 }}>Payment</span>
        </div>

        <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 14, padding: 24, maxWidth: 420, margin: "0 auto" }}>
          <div style={{ color: MUTED, fontSize: 13 }}>Amount due</div>
          <div style={{ fontSize: 44, fontWeight: 900, color: ACCENT, marginBottom: 20 }}>${grand.toFixed(2)}</div>

          <div style={{ color: MUTED, fontSize: 12, marginBottom: 8, fontWeight: 600 }}>TIP</div>
          <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
            {[0.15, 0.18, 0.20].map((p) => {
              const amt = round2(grand * p);
              return (
                <button key={p} style={{ ...ghostBtn, borderColor: ACCENT, color: ACCENT }} onClick={() => setTip(String(amt))}>
                  {Math.round(p * 100)}% · ${amt.toFixed(2)}
                </button>
              );
            })}
            <button style={ghostBtn} onClick={() => setTip("")}>No tip</button>
          </div>
          <input
            type="number" inputMode="decimal" placeholder="Custom tip $"
            value={tip} onChange={(e) => setTip(e.target.value)}
            style={inputStyle}
          />

          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20, fontSize: 15 }}>
            <span style={{ color: MUTED }}>Total with tip</span>
            <span style={{ fontWeight: 800 }}>${(grand + (Number(tip) || 0)).toFixed(2)}</span>
          </div>

          <div style={{ color: MUTED, fontSize: 12, marginBottom: 8, fontWeight: 600 }}>RECORD PAYMENT</div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 14 }}>
            {PAYMENT_METHODS.map((m) => (
              <button key={m}
                style={{ ...primaryBtn(closing), ...(pm === m ? { outline: `2px solid ${ACCENT}`, outlineOffset: 2 } : {}) }}
                disabled={closing}
                onClick={() => {
                  if (m === "Cash") { setPm("Cash"); setCashTendered(""); }
                  else { setPm(null); setCashTendered(""); closeTab(m); }
                }}>
                {m}
              </button>
            ))}
          </div>
          {pm === "Cash" && (() => {
            const totalWithTip = grand + (Number(tip) || 0);
            const tendered = parseFloat(cashTendered) || 0;
            const change = round2(tendered - totalWithTip);
            const insufficient = cashTendered === "" || tendered < totalWithTip;
            return (
              <>
                <input
                  type="number" inputMode="decimal" placeholder="Cash received $"
                  value={cashTendered} onChange={(e) => setCashTendered(e.target.value)}
                  style={{ ...inputStyle, marginBottom: cashTendered !== "" ? 8 : 12 }}
                  autoFocus
                />
                {cashTendered !== "" && (
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, fontSize: 15, fontWeight: 700 }}>
                    <span style={{ color: MUTED }}>{change >= 0 ? "Change due" : "Short by"}</span>
                    <span style={{ color: change >= 0 ? GREEN : RED }}>${Math.abs(change).toFixed(2)}</span>
                  </div>
                )}
                <button
                  disabled={closing || insufficient}
                  onClick={() => closeTab("Cash")}
                  style={{ ...primaryBtn(closing || insufficient), flex: "none" as const, width: "100%" }}>
                  {closing ? "Processing…" : "Confirm Cash"}
                </button>
              </>
            );
          })()}
          {msg && <div style={{ marginTop: 12, fontSize: 13, color: RED }}>{msg}</div>}
        </div>
      </div>
    );
  }

  // ── MENU VIEW ────────────────────────────────────────────────────
  const q = search.trim().toLowerCase();
  let shownItems: Item[];
  if (q) {
    shownItems = items.filter((i) => i.name.toLowerCase().includes(q));
  } else if (activeCat === POPULAR) {
    shownItems = popularIds.map((id) => items.find((i) => i.id === id)).filter(Boolean) as Item[];
  } else {
    shownItems = items.filter((i) => i.category_id === activeCat);
  }
  const cartCount = cartLines.reduce((s, l) => s + l.qty, 0);
  const showBar   = cartCount > 0 || !!currentTab;

  return (
    <div style={{ ...page, paddingBottom: showBar ? 220 : 80 }}>
      {/* header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: 2, color: MUTED }}>CASHIER</div>
          <div style={{ fontSize: 20, fontWeight: 900 }}>{bizName}</div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <button style={ghostBtn} onClick={() => navigate("/staff")}>Kitchen</button>
          <button style={ghostBtn} onClick={() => navigate("/staff/floor")}>Floor</button>
          <button style={ghostBtn} onClick={async () => { await signOutStaff(); navigate("/staff-login"); }}>Sign out</button>
        </div>
      </div>

      {/* today strip */}
      <div style={{
        background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 10,
        padding: "10px 14px", marginBottom: 14, display: "flex", gap: 20, flexWrap: "wrap", fontSize: 13,
      }}>
        <span style={{ color: MUTED, fontWeight: 600 }}>Today</span>
        <span><strong>{todayCount}</strong> <span style={{ color: MUTED }}>tabs</span></span>
        <span><strong>${todayRevenue.toFixed(2)}</strong> <span style={{ color: MUTED }}>revenue</span></span>
        <span><strong>${todayTips.toFixed(2)}</strong> <span style={{ color: MUTED }}>tips (pass-through)</span></span>
      </div>

      {/* location selector (only when multiple) */}
      {locations.length > 1 && (
        <select
          value={activeLocation?.id ?? ""}
          onChange={(e) => {
            const loc = locations.find((l) => l.id === e.target.value) || null;
            setActiveLocation(loc);
            setCart({}); setNotes(""); setMsg("");
          }}
          style={{ ...inputStyle, marginBottom: 12 }}
        >
          {locations.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
        </select>
      )}

      {/* search */}
      <input style={inputStyle} placeholder="Search menu…" value={search} onChange={(e) => setSearch(e.target.value)} />

      {/* category chips */}
      {!q && (
        <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 8, marginBottom: 12 }}>
          {popularIds.length > 0 && (
            <div style={pill(activeCat === POPULAR)} onClick={() => setActiveCat(POPULAR)}>★ Popular</div>
          )}
          {cats.map((c) => (
            <div key={c.id} style={pill(c.id === activeCat)} onClick={() => setActiveCat(c.id)}>{c.name}</div>
          ))}
        </div>
      )}

      {/* item grid */}
      <div style={{ display: "grid", gap: 10, gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))" }}>
        {shownItems.map((it) => {
          const qty = cart[it.id] || 0;
          return (
            <div key={it.id} style={{
              background: SURFACE, border: `1px solid ${qty ? ACCENT : BORDER}`,
              borderRadius: 12, padding: 12, display: "flex", flexDirection: "column", gap: 8,
            }}>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{it.name}</div>
              <div style={{ color: MUTED, fontSize: 13 }}>${Number(it.price).toFixed(2)}</div>
              {qty === 0 ? (
                <button style={{ ...ghostBtn, borderColor: ACCENT, color: ACCENT }} onClick={() => addToCart(it.id)}>Add</button>
              ) : (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                  <button style={ghostBtn} onClick={() => decFromCart(it.id)}>−</button>
                  <span style={{ fontWeight: 800 }}>{qty}</span>
                  <button style={ghostBtn} onClick={() => addToCart(it.id)}>+</button>
                </div>
              )}
            </div>
          );
        })}
        {shownItems.length === 0 && (
          <div style={{ color: MUTED }}>{q ? "No items match." : "Nothing here yet."}</div>
        )}
      </div>

      {/* bottom action bar */}
      {showBar && (
        <div style={{
          position: "fixed", left: 0, right: 0, bottom: 0,
          background: SURFACE, borderTop: `1px solid ${BORDER}`, padding: 16,
        }}>
          {msg && (
            <div style={{ marginBottom: 8, fontSize: 13, color: msg.startsWith("Error") ? RED : GREEN }}>{msg}</div>
          )}

          {/* cart line summary */}
          {cartCount > 0 && (
            <div style={{ marginBottom: 10 }}>
              {cartLines.map((l) => (
                <div key={l.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: MUTED, marginBottom: 2 }}>
                  <span>{l.name} × {l.qty}</span>
                  <span>${(l.price * l.qty).toFixed(2)}</span>
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, fontWeight: 800, marginTop: 6, paddingTop: 6, borderTop: `1px solid ${BORDER}` }}>
                <span>Subtotal</span>
                <span>${cartGrand.toFixed(2)}</span>
              </div>
            </div>
          )}

          {/* open tab balance (when no new cart items) */}
          {currentTab && cartCount === 0 && (
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, marginBottom: 10 }}>
              <span style={{ color: MUTED }}>Open tab</span>
              <span style={{ fontWeight: 800, color: ACCENT }}>${withTax(Number(currentTab.total)).toFixed(2)}</span>
            </div>
          )}

          <textarea
            style={{
              width: "100%", padding: "8px 12px", borderRadius: 8, border: `1px solid ${BORDER}`,
              background: BG, color: TEXT, fontSize: 13, marginBottom: 10, boxSizing: "border-box",
              fontFamily: "inherit", resize: "none",
            }}
            placeholder="Note for kitchen…"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={1}
          />

          <div style={{ display: "flex", gap: 10 }}>
            {cartCount > 0 && (
              <button style={{ ...ghostBtn, flex: 1 }} disabled={sending} onClick={sendOrder}>
                {sending ? "Sending…" : "Send to Kitchen"}
              </button>
            )}
            <button
              style={primaryBtn(sending || (!cartCount && !currentTab))}
              disabled={sending || (!cartCount && !currentTab)}
              onClick={handleCharge}
            >
              {sending ? "…" : `Charge · $${cartCount > 0 ? cartGrand.toFixed(2) : withTax(Number(currentTab?.total ?? 0)).toFixed(2)}`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
