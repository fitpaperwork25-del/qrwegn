import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { VercelRequest, VercelResponse } from "@vercel/node";

// Read-only operational summary for Platform Admin's Ecosystem product
// detail panel. Deliberately separate from the other admin-*.ts endpoints
// in this file: those authenticate a logged-in QR-Wegn super-admin user
// (Bearer JWT checked against a hardcoded email) — there is no such user
// session for a server-to-server call from another product's backend, so
// this endpoint uses a shared secret instead.
//
// Only aggregate counts are returned by default — no business names, no
// stripe_customer_id, no staff_pin, no per-tenant rows of any kind. The
// underlying queries are exact-count HEAD requests (no row data is even
// fetched from Postgres), so there is nothing sensitive in the response
// even if the secret were ever compromised — only three integers.
//
// Business Lookup (added for Platform Admin's AI Command Center Live
// Data Tools): an optional ?businessName= query param switches this same
// endpoint to a single-business, name-and-email-only lookup instead of
// the aggregate summary — kept in this file rather than a new endpoint
// to avoid consuming another Vercel function slot for what is
// structurally the same "shared-secret-authenticated, read-only,
// service-role" operation as the branch above. Deliberately does NOT
// reuse or call get_admin_businesses() (which also returns staff_pin,
// stripe ids, subscription status, etc.) — this only ever selects
// `name, owner_id` from businesses (never any other column) and looks
// the owner's email up via the Auth Admin API, so it is structurally
// incapable of returning anything beyond name + email, not just
// filtered down to it after the fact.
//
// No CORS header is set (unlike api/health.ts, which intentionally
// allows any browser origin): this endpoint is meant to be called
// server-to-server only, from Platform Admin's own backend, never
// directly from a browser.

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const platformAdminSecret = process.env.PLATFORM_ADMIN_SHARED_SECRET;

interface BusinessNameRow {
  name: string;
  owner_id: string;
}

async function handleBusinessLookup(supabase: SupabaseClient, businessName: string, res: VercelResponse) {
  try {
    const { data, error } = await supabase
      .from("businesses")
      .select("name, owner_id")
      .neq("type", "platform")
      .ilike("name", businessName)
      .limit(1)
      .maybeSingle();

    if (error) throw error;

    res.setHeader("Cache-Control", "no-store");

    if (!data) {
      return res.status(200).json({ business: null, generatedAt: new Date().toISOString() });
    }

    const row = data as BusinessNameRow;
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(row.owner_id);
    if (userError) throw userError;

    return res.status(200).json({
      business: { name: row.name, email: userData.user?.email ?? null },
      generatedAt: new Date().toISOString(),
    });
  } catch (err) {
    return res.status(500).json({ error: err instanceof Error ? err.message : "Internal error" });
  }
}

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

  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

  const businessName = typeof req.query.businessName === "string" ? req.query.businessName.trim() : "";
  if (businessName) {
    return handleBusinessLookup(supabase, businessName, res);
  }

  try {
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
