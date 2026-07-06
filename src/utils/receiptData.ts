import { supabase } from "../lib/supabase";

export type ReceiptItem  = { name: string; quantity: number; unit_price: number };
export type ReceiptOrder = { id: string; subtotal: number; tax: number; items: ReceiptItem[] };
export type ReceiptData  = {
  tabId:         string;
  businessName:  string;
  tableName:     string;
  closedAt:      string;
  paymentMethod: string | null;
  serverName:    string | null;
  orders:        ReceiptOrder[];
  total:         number;
  tipAmount:     number;
  refundAmount:  number;
  voidedAt:      string | null;
  voidReason:    string | null;
};

export type ReceiptTabInput = {
  id:             string;
  total:          number;
  tip_amount:     number | null;
  refund_amount:  number;
  payment_method: string | null;
  closed_at:      string;
  server_id:      string | null;
  voided_at:      string | null;
  void_reason:    string | null;
};

export async function loadReceiptData(
  businessName: string,
  tab: ReceiptTabInput,
): Promise<ReceiptData> {
  const [tabRes, serverRes, ordersRes] = await Promise.all([
    supabase.from("tabs").select("name, locations(name, label)").eq("id", tab.id).single(),
    tab.server_id
      ? supabase.from("staff_pins").select("name").eq("id", tab.server_id).single()
      : Promise.resolve({ data: null }),
    supabase
      .from("orders")
      .select("id, subtotal, tax")
      .eq("tab_id", tab.id)
      .neq("status", "cancelled"),
  ]);

  const tabRow = tabRes.data as any;
  const loc    = tabRow?.locations as any;
  const tableName =
    loc?.label || loc?.name || tabRow?.name || "Unknown table";
  const serverName = (serverRes.data as any)?.name ?? null;
  const orderRows  = (ordersRes.data ?? []) as { id: string; subtotal: number; tax: number }[];

  let itemsByOrder: Record<string, ReceiptItem[]> = {};
  if (orderRows.length > 0) {
    const { data: itemRows } = await supabase
      .from("order_items")
      .select("order_id, quantity, unit_price, menu_items(name)")
      .in("order_id", orderRows.map((o) => o.id));
    (itemRows ?? []).forEach((r: any) => {
      const oid = r.order_id;
      if (!itemsByOrder[oid]) itemsByOrder[oid] = [];
      itemsByOrder[oid].push({
        name:       r.menu_items?.name ?? "Unknown item",
        quantity:   r.quantity,
        unit_price: Number(r.unit_price),
      });
    });
  }

  const orders: ReceiptOrder[] = orderRows.map((o) => ({
    id:       o.id,
    subtotal: Number(o.subtotal ?? 0),
    tax:      Number(o.tax ?? 0),
    items:    itemsByOrder[o.id] ?? [],
  }));

  return {
    tabId:         tab.id,
    businessName,
    tableName,
    closedAt:      tab.closed_at,
    paymentMethod: tab.payment_method,
    serverName,
    orders,
    total:         Number(tab.total),
    tipAmount:     Number(tab.tip_amount ?? 0),
    refundAmount:  Number(tab.refund_amount ?? 0),
    voidedAt:      tab.voided_at,
    voidReason:    tab.void_reason,
  };
}

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export function buildReceiptHtml(data: ReceiptData): string {
  const allItems = data.orders.flatMap((o) => o.items);
  const subtotal = data.orders.reduce((s, o) => s + o.subtotal, 0);
  const tax      = data.orders.reduce((s, o) => s + o.tax, 0);
  const totalPaid = data.total + tax + data.tipAmount;

  const closedDate = new Date(data.closedAt).toLocaleString(undefined, {
    year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
  });

  const itemRows = allItems.map((i) =>
    `<tr>
      <td>${esc(i.name)}</td>
      <td style="text-align:center">×${i.quantity}</td>
      <td style="text-align:right">$${(i.unit_price * i.quantity).toFixed(2)}</td>
    </tr>`
  ).join("");

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Receipt</title>
  <style>
    /* Browser print only. Sized for 80mm thermal roll paper; degrades
       gracefully on 58mm rolls since no column uses a fixed pixel width. */
    *{box-sizing:border-box;margin:0;padding:0}
    html,body{width:100%}
    body{font-family:monospace;font-size:12px;max-width:76mm;margin:0 auto;padding:3mm;color:#000;background:#fff;word-break:break-word}
    .c{text-align:center}
    .biz{font-size:15px;font-weight:bold;margin-bottom:4px}
    .meta{font-size:11px;color:#555;margin-bottom:2px}
    hr{border:none;border-top:1px dashed #000;margin:8px 0}
    table{width:100%;border-collapse:collapse;table-layout:auto}
    td{padding:3px 0;vertical-align:top}
    .bold td{font-weight:bold;padding-top:8px}
    .voided{background:#fdd;padding:6px;text-align:center;font-weight:bold;letter-spacing:3px;margin-bottom:10px;border:1px solid #f00}
    .red{color:#c00}
    .thank{font-size:10px;color:#555;text-align:center;margin-top:14px}
    @media print{
      @page{size:80mm auto;margin:2mm}
      body{padding:1mm}
    }
  </style>
</head>
<body>
  ${data.voidedAt ? '<div class="voided">★ VOIDED ★</div>' : ""}
  <div class="c biz">${esc(data.businessName)}</div>
  <div class="c meta">Table: ${esc(data.tableName)}</div>
  <div class="c meta">${esc(closedDate)}</div>
  ${data.serverName ? `<div class="c meta">Server: ${esc(data.serverName)}</div>` : ""}
  <hr>
  ${allItems.length > 0
    ? `<table><tbody>${itemRows}</tbody></table><hr>`
    : `<div class="meta c">No items on record</div><hr>`}
  <table><tbody>
    <tr><td>Subtotal</td><td style="text-align:right">$${subtotal.toFixed(2)}</td></tr>
    <tr><td>Tax</td><td style="text-align:right">$${tax.toFixed(2)}</td></tr>
    <tr><td>Tip</td><td style="text-align:right">$${data.tipAmount.toFixed(2)}</td></tr>
    ${data.refundAmount > 0
      ? `<tr class="red"><td>Refunded</td><td style="text-align:right">−$${data.refundAmount.toFixed(2)}</td></tr>`
      : ""}
    <tr class="bold"><td>Total Paid</td><td style="text-align:right">$${totalPaid.toFixed(2)}</td></tr>
    <tr><td class="meta">Payment</td><td class="meta" style="text-align:right">${esc(data.paymentMethod || "Other / legacy")}</td></tr>
  </tbody></table>
  ${data.voidReason ? `<hr><div class="meta">Void reason: ${esc(data.voidReason)}</div>` : ""}
  <div class="thank">Thank you!</div>
</body>
</html>`;
}
