import { ACCENT, BG, BORDER, MUTED, SURFACE, TEXT, RED } from "../constants/theme";
import { type ReceiptData, buildReceiptHtml } from "../utils/receiptData";

interface Props {
  data:    ReceiptData;
  onClose: () => void;
}

export function ReceiptModal({ data, onClose }: Props) {
  const allItems  = data.orders.flatMap((o) => o.items);
  const subtotal  = data.orders.reduce((s, o) => s + o.subtotal, 0);
  const tax       = data.orders.reduce((s, o) => s + o.tax, 0);
  const totalPaid = data.total + data.tipAmount;
  const isVoided  = !!data.voidedAt;

  const closedDate = new Date(data.closedAt).toLocaleString(undefined, {
    year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
  });

  function handlePrint() {
    const html = buildReceiptHtml(data);
    const w = window.open("", "_blank", "width=420,height=700");
    if (!w) return;
    w.document.write(html);
    w.document.close();
    w.focus();
    w.print();
  }

  const row = (label: string, value: string, opts?: { color?: string; bold?: boolean }) => (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: `1px solid ${BORDER}` }}>
      <span style={{ fontSize: 13, color: opts?.color ?? MUTED }}>{label}</span>
      <span style={{ fontSize: 13, color: opts?.color ?? TEXT, fontWeight: opts?.bold ? 700 : 400, fontFamily: "monospace" }}>{value}</span>
    </div>
  );

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", zIndex: 9999,
        display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: SURFACE, borderRadius: 14, border: `1px solid ${BORDER}`,
          width: "100%", maxWidth: 420, maxHeight: "90vh", overflowY: "auto",
          display: "flex", flexDirection: "column",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: `1px solid ${BORDER}` }}>
          <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: 2, color: ACCENT, textTransform: "uppercase" }}>Receipt</span>
          <button onClick={onClose} style={{ background: "none", border: "none", color: MUTED, fontSize: 18, cursor: "pointer", lineHeight: 1 }}>×</button>
        </div>

        {/* Body */}
        <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: 16, flex: 1 }}>

          {/* Voided banner */}
          {isVoided && (
            <div style={{ background: RED + "18", border: `1px solid ${RED}66`, borderRadius: 8, padding: "8px 14px", textAlign: "center" }}>
              <span style={{ fontSize: 12, fontWeight: 800, color: RED, letterSpacing: 3, textTransform: "uppercase" }}>Voided</span>
              {data.voidReason && <p style={{ fontSize: 12, color: RED, margin: "4px 0 0", fontStyle: "italic" }}>{data.voidReason}</p>}
            </div>
          )}

          {/* Refund banner */}
          {data.refundAmount > 0 && (
            <div style={{ background: ACCENT + "18", border: `1px solid ${ACCENT}44`, borderRadius: 8, padding: "8px 14px", textAlign: "center" }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: ACCENT }}>Refunded ${data.refundAmount.toFixed(2)}</span>
            </div>
          )}

          {/* Business / table info */}
          <div style={{ textAlign: "center", borderBottom: `1px solid ${BORDER}`, paddingBottom: 14 }}>
            <p style={{ fontSize: 18, fontWeight: 800, color: TEXT, margin: "0 0 4px" }}>{data.businessName}</p>
            <p style={{ fontSize: 13, color: MUTED, margin: "0 0 2px" }}>Table: {data.tableName}</p>
            <p style={{ fontSize: 12, color: MUTED, margin: 0 }}>{closedDate}</p>
            {data.serverName && <p style={{ fontSize: 12, color: MUTED, margin: "2px 0 0" }}>Server: {data.serverName}</p>}
          </div>

          {/* Items */}
          <div>
            <p style={{ fontSize: 11, letterSpacing: 2, color: ACCENT, fontWeight: 700, textTransform: "uppercase", margin: "0 0 8px" }}>Items</p>
            {allItems.length === 0 ? (
              <p style={{ fontSize: 12, color: MUTED }}>No items on record for this tab.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {allItems.map((item, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <span style={{ fontSize: 13, color: TEXT }}>{item.name}</span>
                    <span style={{ fontSize: 13, color: MUTED, fontFamily: "monospace" }}>
                      ×{item.quantity}&nbsp;&nbsp;${(item.unit_price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Totals */}
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {row("Subtotal", `$${subtotal.toFixed(2)}`)}
            {row("Tax", `$${tax.toFixed(2)}`)}
            {row("Tip", `$${data.tipAmount.toFixed(2)}`)}
            {data.refundAmount > 0 && row("Refunded", `−$${data.refundAmount.toFixed(2)}`, { color: ACCENT })}
            {row("Total Paid", `$${totalPaid.toFixed(2)}`, { bold: true, color: TEXT })}
            {row("Payment Method", data.paymentMethod || "Other / legacy")}
          </div>
        </div>

        {/* Footer actions */}
        <div style={{ display: "flex", gap: 10, padding: "14px 20px", borderTop: `1px solid ${BORDER}` }}>
          <button
            onClick={handlePrint}
            style={{ flex: 1, background: ACCENT, color: BG, border: "none", borderRadius: 8, padding: "10px 0", fontWeight: 800, fontSize: 13, cursor: "pointer" }}
          >
            Print Receipt
          </button>
          <button
            onClick={onClose}
            style={{ background: "none", border: `1px solid ${BORDER}`, borderRadius: 8, padding: "10px 18px", color: MUTED, fontSize: 13, cursor: "pointer" }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
