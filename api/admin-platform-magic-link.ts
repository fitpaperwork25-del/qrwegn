import { createClient } from "@supabase/supabase-js";
import type { VercelRequest, VercelResponse } from "@vercel/node";

// Server-to-server twin of admin-get-magic-link.ts. That endpoint
// authenticates a logged-in QR-Wegn super-admin browser session (Bearer
// JWT checked against a hardcoded email) — there is no such session when
// Platform Admin's own backend calls out to QR-Wegn on behalf of a
// signed-in Platform Admin user. Authenticates with the same shared
// secret already proven by admin-operational-summary.ts instead.

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const APP_URL = "https://qrwegn.com";
const platformAdminSecret = process.env.PLATFORM_ADMIN_SHARED_SECRET;

// Recent support requests for Platform Admin's "Incoming QRWegn Support
// Requests" list. Uses the same service-role client and shared-secret
// gate as the magic-link path above — reads bypass RLS here since this
// runs server-side only, never in a browser. Bounded to 50 rows; no
// pagination needed yet for a v1.1 support inbox. Only unresolved
// ('new') requests are returned — resolved ones stay in the table for
// history/audit but drop out of the active list.
async function listRecentSupportRequests() {
  const { data, error } = await supabaseAdmin
    .from("support_requests")
    .select("id, email, business_name, problem_type, message, status, created_at")
    .eq("status", "new")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) throw new Error(error.message);
  return data ?? [];
}

// Marks a request resolved — never deletes it. No RLS/grant change
// needed: this runs through the same service-role client as the list
// above, which already bypasses RLS entirely.
async function resolveSupportRequest(requestId: string) {
  const { error } = await supabaseAdmin
    .from("support_requests")
    .update({ status: "resolved" })
    .eq("id", requestId);

  if (error) throw new Error(error.message);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed." });

  if (!platformAdminSecret) {
    return res.status(503).json({ error: "PLATFORM_ADMIN_SHARED_SECRET is not configured on the server." });
  }

  const providedSecret = req.headers["x-platform-admin-secret"];
  if (providedSecret !== platformAdminSecret) {
    return res.status(401).json({ error: "Invalid or missing credentials." });
  }

  const { email, action, requestId } = req.body as { email?: string; action?: string; requestId?: string };

  if (action === "list-requests") {
    try {
      const requests = await listRecentSupportRequests();
      res.setHeader("Cache-Control", "no-store");
      return res.json({ requests });
    } catch (err: any) {
      return res.status(500).json({ error: err.message ?? "Failed to list support requests." });
    }
  }

  if (action === "resolve") {
    if (typeof requestId !== "string" || requestId.trim().length === 0) {
      return res.status(400).json({ error: "requestId required" });
    }
    try {
      await resolveSupportRequest(requestId);
      res.setHeader("Cache-Control", "no-store");
      return res.json({ ok: true });
    } catch (err: any) {
      return res.status(500).json({ error: err.message ?? "Failed to resolve support request." });
    }
  }

  if (!email || typeof email !== "string") return res.status(400).json({ error: "email required" });

  const { data, error } = await supabaseAdmin.auth.admin.generateLink({
    type: "magiclink",
    email,
    options: { redirectTo: APP_URL },
  });

  if (error) return res.status(400).json({ error: error.message });

  const link = (data as any).properties?.action_link;
  if (!link) return res.status(500).json({ error: "Failed to generate magic link" });

  res.setHeader("Cache-Control", "no-store");
  return res.json({ link });
}
