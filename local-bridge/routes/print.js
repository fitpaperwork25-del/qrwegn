const { Router } = require("express");
const router = Router();

// POST /print-test
// Stub — no hardware commands yet.
router.post("/test", (_req, res) => {
  console.log("[bridge] print-test received");
  res.json({ ok: true, queued: true, mode: "stub" });
});

// POST /print-receipt
// Stub — accepts ReceiptData payload, logs it, returns queued confirmation.
router.post("/receipt", (req, res) => {
  const { businessName, tableName } = req.body ?? {};
  console.log(`[bridge] print-receipt received — ${businessName ?? "?"} / ${tableName ?? "?"}`);
  res.json({ ok: true, queued: true, mode: "stub" });
});

module.exports = router;
