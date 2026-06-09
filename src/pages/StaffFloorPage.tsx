import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { getStaffProfile, signOutStaff } from "../lib/useStaffAuth";
import { ACCENT, BG, BORDER, MUTED, SURFACE, TEXT, GREEN, RED } from "../constants/theme";

// ── Types ─────────────────────────────────────────────────────
type Table = { id: string; name: string };
type Cat = { id: string; name: string };
type Item = { id: string; category_id: string; name: string; price: number };
type Tab = { id: string; location_id: string; total: number; opened_by_staff_id?: string | null };

const round2 = (n: number) => Math.round(n * 100) / 100;
const PAYMENT_METHODS = ["Cash", "Card", "Other"] as const;
const POPULAR = "__popular__";

export default function StaffFloorPage() {
  const navigate = useNavigate();

  const [bizId, setBizId] = useState<string | null>(null);
  const [bizName, setBizName] = useState("Floor");
  const [serverId, setServerId] = useState<string | null>(null);
  const [taxRate, setTaxRate] = useState(0);

  const [tables, setTables] = useState<Table[]>([]);
  const [cats, setCats] = useState<Cat[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [openTabs, setOpenTabs] = useState<Tab[]>([]);
  const [popularIds, setPopularIds] = useState<string[]>([]);

  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"floor" | "order" | "closeout">("floor");
  const [activeTable, setActiveTable] = useState<Table | null>(null);
  const [activeCat, setActiveCat] = useState<string>(POPULAR);
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<Record<string, number>>({});
  const [notes, setNotes] = useState("");
  const [tip, setTip] = useState("");
  const [sending, setSending] = useState(false);
  const [closing, setClosing] = useState(false);
  const [msg, setMsg] = useState("");
  const [myTipsToday, setMyTipsToday] = useState(0);

  const loadTabs = useCallback(async (id: string) => {
    const { data } = await supabase
      .from("tabs")
      .select("id, location_id, total, status, opened_by_staff_id")
      .eq("business_id", id)
      .eq("status", "open");
    setOpenTabs((data as Tab[]) || []);
  }, []);

  const loadAll = useCallback(
    async (id: string) => {
      const { data: bp } = await supabase
        .from("business_public").select("tax_rate").eq("id", id).maybeSingle();
      setTaxRate(Number(bp?.tax_rate ?? 0));

      const { data: locs } = await supabase
        .from("locations").select("id, name")
        .eq("business_id", id).eq("is_active", true).order("name");
      setTables((locs as Table[]) || []);

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

      // Popular = most-ordered items for this business (from order history)
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
          .sort((a, b) => b[1] - a[1])
          .slice(0, 8)
          .map(([mid]) => mid)
          .filter((mid) => itemList.some((i) => i.id === mid));
        setPopularIds(top);
      } catch {
        setPopularIds([]);
      }

      await loadTabs(id);
    },
    [loadTabs]
  );

  const loadMyTips = useCallback(async (id: string, staffId: string | null) => {
    if (!staffId) return;
    const start = new Date(); start.setHours(0, 0, 0, 0);
    const { data } = await supabase
      .from("tabs")
      .select("tip_amount")
      .eq("business_id", id)
      .eq("status", "closed")
      .eq("server_id", staffId)
      .gte("closed_at", start.toISOString());
    const total = ((data as { tip_amount: number | null }[]) ?? []).reduce((s, t) => s + Number(t.tip_amount ?? 0), 0);
    setMyTipsToday(total);
  }, []);

  useEffect(() => {
    (async () => {
      const profile = await getStaffProfile();
      if (!profile) { navigate("/staff-login"); return; }
      setBizId(profile.bizId);
      setBizName(profile.bizName || "Floor");
      setServerId(profile.serverId);
      await loadAll(profile.bizId);
      await loadMyTips(profile.bizId, profile.serverId);
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!bizId) return;
    const t = setInterval(() => { loadTabs(bizId); loadMyTips(bizId, serverId); }, 15000);
    return () => clearInterval(t);
  }, [bizId, serverId, loadTabs, loadMyTips]);

  const tabForTable = (locId: string) => openTabs.find((t) => t.location_id === locId) || null;
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
    .map(([id, qty]) => {
      const it = items.find((x) => x.id === id);
      return it ? { id, name: it.name, price: Number(it.price), qty } : null;
    })
    .filter(Boolean) as { id: string; name: string; price: number; qty: number }[];

  const cartSubtotal = round2(cartLines.reduce((s, l) => s + l.price * l.qty, 0));
  const cartTax = round2(cartSubtotal * taxRate);
  const cartGrand = round2(cartSubtotal + cartTax);

  function openTable(t: Table) {
    setActiveTable(t);
    setCart({});
    setNotes("");
    setTip("");
    setSearch("");
    setActiveCat(popularIds.length ? POPULAR : (cats[0]?.id ?? POPULAR));
    setMsg("");
    setView("order");
  }

  async function sendOrder() {
    if (!activeTable || !bizId || cartLines.length === 0) return;
    setSending(true); setMsg("");
    try {
      let tab = tabForTable(activeTable.id);
      if (!tab) {
        const { data: newTab, error: tErr } = await supabase
          .from("tabs")
          .insert({ business_id: bizId, location_id: activeTable.id, status: "open", total: 0, opened_by_staff_id: serverId || null })
          .select("id, location_id, total")
          .single();
        if (tErr || !newTab) throw new Error(tErr?.message || "Could not open tab");
        tab = newTab as Tab;
      } else if (!tab.opened_by_staff_id && serverId) {
        await supabase.from("tabs").update({ opened_by_staff_id: serverId }).eq("id", tab.id);
      }

      const orderId = crypto.randomUUID();
      const { error: oErr } = await supabase.from("orders").insert({
        id: orderId, business_id: bizId, location_id: activeTable.id,
        subtotal: cartSubtotal, tax: cartTax, total: cartGrand, status: "new", tab_id: tab.id,
        notes: notes.trim() || null,
      });
      if (oErr) throw new Error(oErr.message);

      const { error: iErr } = await supabase.from("order_items").insert(
        cartLines.map((l) => ({ order_id: orderId, menu_item_id: l.id, quantity: l.qty, unit_price: l.price }))
      );
      if (iErr) throw new Error(iErr.message);

      const newTotal = round2(Number(tab.total) + cartSubtotal);
      await supabase.from("tabs").update({ total: newTotal }).eq("id", tab.id);

      setCart({});
      setNotes("");
      await loadTabs(bizId);
      setMsg("Sent to kitchen \u2713");
    } catch (e: any) {
      setMsg(`Error: ${e?.message ?? e}`);
    } finally {
      setSending(false);
    }
  }

  async function closeTable(method: string) {
    if (!activeTable || !bizId) return;
    const tab = tabForTable(activeTable.id);
    if (!tab) { setView("floor"); return; }
    setClosing(true); setMsg("");
    try {
      const { error } = await supabase.from("tabs").update({
        status: "closed", closed_at: new Date().toISOString(),
        total: Number(tab.total), payment_method: method,
        tip_amount: Number(tip) || 0, server_id: serverId,
      }).eq("id", tab.id);
      if (error) throw new Error(error.message);
      await loadTabs(bizId);
      setActiveTable(null);
      setTip("");
      setView("floor");
    } catch (e: any) {
      setMsg(`Error: ${e?.message ?? e}`);
    } finally {
      setClosing(false);
    }
  }

  async function handleSignOut() {
    await signOutStaff();
    navigate("/staff-login");
  }

  // ── styles ──
  const page: React.CSSProperties = { minHeight: "100vh", background: BG, color: TEXT, padding: 16 };
  const topbar: React.CSSProperties = {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    marginBottom: 14, gap: 12, flexWrap: "wrap",
  };
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
    background: ACCENT, color: BG, cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.5 : 1,
    width: "100%",
  });
  const searchInput: React.CSSProperties = {
    width: "100%", padding: "12px 14px", borderRadius: 10, border: `1px solid ${BORDER}`,
    background: SURFACE, color: TEXT, fontSize: 15, marginBottom: 12, boxSizing: "border-box",
  };
  const noteInput: React.CSSProperties = {
    width: "100%", padding: "10px 12px", borderRadius: 10, border: `1px solid ${BORDER}`,
    background: BG, color: TEXT, fontSize: 14, marginBottom: 10, boxSizing: "border-box",
    fontFamily: "inherit", resize: "none",
  };

  if (loading) {
    return <div style={{ ...page, display: "grid", placeItems: "center" }}>Loading floor…</div>;
  }

  // ── FLOOR VIEW ──
  if (view === "floor") {
    return (
      <div style={page}>
        <div style={topbar}>
          <div>
            <div style={{ fontSize: 12, letterSpacing: 2, color: MUTED }}>FLOOR</div>
            <div style={{ fontSize: 22, fontWeight: 900 }}>{bizName}</div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{ color: MUTED, fontSize: 13 }}>{openTabs.length} open</span>
            {serverId && <span style={{ color: MUTED, fontSize: 13 }}>My tips: ${myTipsToday.toFixed(2)}</span>}
            <button style={ghostBtn} onClick={() => navigate("/staff")}>Kitchen view</button>
            <button style={ghostBtn} onClick={handleSignOut}>Sign out</button>
          </div>
        </div>

        <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))" }}>
          {tables.map((t) => {
            const tab = tabForTable(t.id);
            const isOpen = !!tab;
            return (
              <button
                key={t.id}
                onClick={() => openTable(t)}
                style={{
                  textAlign: "left", cursor: "pointer", borderRadius: 14, padding: 16, background: SURFACE,
                  border: `1px solid ${isOpen ? GREEN : BORDER}`, color: TEXT,
                  minHeight: 96, display: "flex", flexDirection: "column", justifyContent: "space-between",
                }}
              >
                <div style={{ fontWeight: 800, fontSize: 18, color: TEXT }}>{t.name}</div>
                {isOpen ? (
                  <div>
                    <div style={{ color: GREEN, fontWeight: 700, fontSize: 12 }}>OPEN</div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: ACCENT }}>
                      ${withTax(Number(tab!.total)).toFixed(2)}
                    </div>
                  </div>
                ) : (
                  <div style={{ color: MUTED, fontSize: 13 }}>Empty</div>
                )}
              </button>
            );
          })}
        </div>

        {tables.length === 0 && (
          <div style={{ color: MUTED, marginTop: 24 }}>No tables yet — add them in the owner dashboard.</div>
        )}
      </div>
    );
  }

  // ── ORDER VIEW ──
  if (view === "order" && activeTable) {
    const tab = tabForTable(activeTable.id);
    const q = search.trim().toLowerCase();
    let shownItems: Item[];
    if (q) {
      shownItems = items.filter((i) => i.name.toLowerCase().includes(q));
    } else if (activeCat === POPULAR) {
      shownItems = popularIds.map((id) => items.find((i) => i.id === id)).filter(Boolean) as Item[];
    } else {
      shownItems = items.filter((i) => i.category_id === activeCat);
    }

    return (
      <div style={{ ...page, paddingBottom: 260 }}>
        {/* prominent table header */}
        <div style={topbar}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <button style={ghostBtn} onClick={() => { setView("floor"); setActiveTable(null); }}>← Floor</button>
            <div>
              <div style={{ fontSize: 11, letterSpacing: 2, color: MUTED }}>TABLE</div>
              <div style={{ fontSize: 26, fontWeight: 900, color: ACCENT }}>{activeTable.name}</div>
            </div>
          </div>
          {tab && (
            <button
              style={{ ...ghostBtn, borderColor: ACCENT, color: ACCENT }}
              onClick={() => setView("closeout")}
            >
              Close out · ${withTax(Number(tab.total)).toFixed(2)}
            </button>
          )}
        </div>

        {/* search */}
        <input
          style={searchInput}
          placeholder="Search menu…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* category chips (hidden while searching) */}
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

        {/* items */}
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
                  <button style={{ ...ghostBtn, borderColor: ACCENT, color: ACCENT }} onClick={() => addToCart(it.id)}>
                    Add
                  </button>
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

        {/* cart bar */}
        <div style={{
          position: "fixed", left: 0, right: 0, bottom: 0, background: SURFACE,
          borderTop: `1px solid ${BORDER}`, padding: 16,
        }}>
          <textarea
            style={noteInput}
            placeholder="Note for kitchen (allergies, no onions, extra spicy…)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
          />
          {msg && <div style={{ marginBottom: 8, fontSize: 13, color: msg.startsWith("Error") ? RED : GREEN }}>{msg}</div>}
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 14 }}>
            <span style={{ color: MUTED }}>{activeTable.name} · {cartLines.reduce((s, l) => s + l.qty, 0)} item(s)</span>
            <span style={{ fontWeight: 800 }}>${cartGrand.toFixed(2)}</span>
          </div>
          <button style={primaryBtn(sending || cartLines.length === 0)} disabled={sending || cartLines.length === 0} onClick={sendOrder}>
            {sending ? "Sending…" : "Send to kitchen"}
          </button>
        </div>
      </div>
    );
  }

  // ── CLOSEOUT VIEW ──
  if (view === "closeout" && activeTable) {
    const tab = tabForTable(activeTable.id);
    const grand = withTax(Number(tab?.total ?? 0));
    return (
      <div style={page}>
        <div style={topbar}>
          <button style={ghostBtn} onClick={() => setView("order")}>← Back</button>
          <div style={{ fontSize: 20, fontWeight: 900 }}>{activeTable.name}</div>
        </div>

        <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 14, padding: 24, maxWidth: 420 }}>
          <div style={{ color: MUTED, fontSize: 13 }}>Amount due</div>
          <div style={{ fontSize: 40, fontWeight: 900, color: ACCENT, marginBottom: 20 }}>${grand.toFixed(2)}</div>

          <div style={{ color: MUTED, fontSize: 12, marginBottom: 8, fontWeight: 600 }}>TIP (OPTIONAL)</div>
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
            type="number"
            inputMode="decimal"
            placeholder="Custom tip $"
            value={tip}
            onChange={(e) => setTip(e.target.value)}
            style={searchInput}
          />

          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20, fontSize: 15 }}>
            <span style={{ color: MUTED }}>Total with tip</span>
            <span style={{ fontWeight: 800 }}>${(grand + (Number(tip) || 0)).toFixed(2)}</span>
          </div>

          <div style={{ color: MUTED, fontSize: 12, marginBottom: 8, fontWeight: 600 }}>RECORD PAYMENT</div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {PAYMENT_METHODS.map((m) => (
              <button key={m} style={{ ...primaryBtn(closing), width: "auto", flex: 1, minWidth: 100 }}
                disabled={closing} onClick={() => closeTable(m)}>
                {m}
              </button>
            ))}
          </div>
          {msg && <div style={{ marginTop: 12, fontSize: 13, color: RED }}>{msg}</div>}
        </div>
      </div>
    );
  }

  return null;
}
