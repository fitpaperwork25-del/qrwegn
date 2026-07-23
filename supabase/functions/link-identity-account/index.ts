import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { verifyAuth } from "../_shared/verifyAuth.ts";

/**
 * Task 2 (Sprint 2): links the caller's own QRWegn owner account to the
 * WEGN Identity Service, fire-and-forget from LoginPage.tsx. Holds
 * IDENTITY_SERVICE_SECRET server-side only - the bootstrap shared
 * secret from wegn-identity's Task 1 (see that repo's README.md
 * "Security model" section), never a per-product secret yet, since
 * this is currently the only product connected.
 *
 * No businessId, email, or auth_user_id is ever trusted from the
 * client - both come from verifyAuth's server-side verification of the
 * caller's own JWT, exactly like register-with-wsms's own discipline,
 * simplified here since linking a caller's own account needs no
 * separate ownership check (there's no other resource to prove
 * ownership of - the caller IS the account being linked).
 *
 * Fire-and-forget from the frontend's perspective - a failure here must
 * never block or fail a QRWegn login, which has already succeeded by
 * the time this is called. Mirrors register-with-wsms's own
 * non-blocking contract exactly.
 */

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }
  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const identityUrl = Deno.env.get("IDENTITY_LINK_ACCOUNT_URL");
  const identitySecret = Deno.env.get("IDENTITY_SERVICE_SECRET");

  if (!supabaseUrl || !supabaseAnonKey || !identityUrl || !identitySecret) {
    return jsonResponse({ error: "Server is not configured (missing required secrets)" }, 500);
  }

  const verified = await verifyAuth({
    supabaseUrl,
    supabaseAnonKey,
    authorizationHeader: req.headers.get("Authorization"),
  });
  if (!verified) {
    return jsonResponse({ error: "Not authenticated" }, 401);
  }
  if (!verified.email) {
    // No email on the session (should not happen for a password-based
    // owner login, but link-account requires one) - fail quiet, this
    // must never surface as a login error.
    return jsonResponse({ ok: false, error: "No email on session" }, 200);
  }

  try {
    const identityRes = await fetch(identityUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        secret: identitySecret,
        productKey: "qrwegn",
        productAuthUserId: verified.authUserId,
        email: verified.email,
      }),
    });
    const identityBody = await identityRes.json().catch(() => ({}));
    if (!identityRes.ok) {
      console.error("[link-identity-account] Identity service returned an error:", identityRes.status, identityBody);
      return jsonResponse({ ok: false, error: "Identity link failed" }, 502);
    }
    return jsonResponse({ ok: true, alreadyLinked: !!identityBody.alreadyLinked, wegnAccountId: identityBody.wegnAccountId ?? null });
  } catch (err) {
    console.error("[link-identity-account] request to Identity service failed:", err);
    return jsonResponse({ ok: false, error: "Request to Identity service failed" }, 502);
  }
});
