import { createClient } from "@supabase/supabase-js";
import type { VercelRequest, VercelResponse } from "@vercel/node";

// Read-only operational summary for Platform Admin's Ecosystem product
// detail panel. Deliberately separate from the other admin-*.ts endpoints
// in this file: those authenticate a logged-in QR-Wegn super-admin user
// (Bearer JWT checked against a hardcoded email) — there is no such user
// session for a server-to-server call from another product's backend, so
// this endpoint uses a shared secret instead.
//
// Only aggregate counts are returned — no business names, no
// stripe_customer_id, no staff_pin, no per-tenant rows of any kind. The
// underlying queries are exact-count HEAD requests (no row data is even
// fetched from Postgres), so there is nothing sensitive in the response
// even if the secret were ever compromised — only three integers.
//
// No CORS header is set (unlike api/health.ts, which intentionally
// allows any browser origin): this endpoint is meant to be called
// server-to-server only, from Platform Admin's own backend, never
// directly from a browser.

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const platformAdminSecret = process.env.PLATFORM_ADMIN_SHARED_SECRET;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed. This endpoint is read-only." });
  }

  if (!platformAdminSecret) {
    return res.status(503).json({ error: "PLATFORM_ADMIN_SHARED_SECRET is not configured on the server." });
  }

  const providedSecret = req.headers["x-platform-admin-secret"];
  if (providedSecret !== platformAdminSecret) {
    return res.status(401).json({ error: "Invalid or missing credentials." });
  }

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    return res.status(503).json({ error: "Supabase credentials are not configured on the server." });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    const [businesses, locations, orders] = await Promise.all([
      supabase.from("businesses").select("id", { count: "exact", head: true }).neq("type", "platform"),
      supabase.from("locations").select("id", { count: "exact", head: true }),
      supabase.from("orders").select("id", { count: "exact", head: true }),
    ]);

    if (businesses.error) throw businesses.error;
    if (locations.error) throw locations.error;
    if (orders.error) throw orders.error;

    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json({
      businessCount: businesses.count ?? 0,
      locationCount: locations.count ?? 0,
      orderCount: orders.count ?? 0,
      generatedAt: new Date().toISOString(),
    });
  } catch (err) {
    return res.status(500).json({ error: err instanceof Error ? err.message : "Internal error" });
  }
}
