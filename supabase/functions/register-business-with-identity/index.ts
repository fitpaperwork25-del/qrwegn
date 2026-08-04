import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * QRWegn Phase 1: registers the caller's own owned business with WEGN
 * Identity's canonical Business Registry, via wegn-identity's
 * register-business-link. Copied from wegn-store-app's own
 * register-business-with-identity with zero logic changes beyond
 * productKey, QRWegn's schema (no country_code column - always sent as
 * null), and the same owner_id + super-admin exception already proven
 * in this repo's own register-with-wsms (mandatory here too, since
 * businesses has public read RLS - row existence proves nothing).
 *
 * Deliberately NOT wired to any automatic trigger, matching
 * wegn-store-app's own real, current state exactly: no frontend call
 * site exists there either. register-business-link's envelope requires
 * ownerConfirmed: true, and the Business Registry contract requires a
 * deliberate owner action, not a silent link created on business
 * creation - unlike register-with-wsms, which registers a trial
 * fire-and-forget by design. This function exists as a capability, to
 * be invoked by a real owner action (once one is designed) or an
 * explicit, reviewed operator backfill - never automatically.
 *
 * Holds IDENTITY_REGISTRY_CREDENTIAL server-side only - scoped in
 * wegn-identity to register-business-link + productKey "qrwegn" only.
 * Separate from IDENTITY_CREDENTIAL (link-account).
 *
 * Reliable Business Registration Phase 2: the outbound call to Identity
 * is now retried (bounded, with backoff) instead of a single attempt.
 * All attempts reuse the SAME requestId/issuedAt/expiresAt envelope
 * generated once below, and retrying stops once that envelope's own
 * expiresAt is reached - this stays inside wegn-identity's existing
 * business_registry_requests idempotency window instead of opening a
 * new one per attempt, so a retry can never be mistaken for a second,
 * distinct registration request. A 4xx from Identity is not retried
 * (retrying an identical rejected request cannot change its outcome);
 * network errors and 5xx are. Response shape and the endpoint's own
 * contract are unchanged either way.
 */
const SUPER_ADMIN_EMAIL = "fitpaperwork25@gmail.com";
const MAX_IDENTITY_ATTEMPTS = 3;
const RETRY_DELAYS_MS = [500, 1500];

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

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
  const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const identityUrl = Deno.env.get("IDENTITY_REGISTER_BUSINESS_LINK_URL");
  const identitySecret = Deno.env.get("IDENTITY_REGISTRY_CREDENTIAL");

  if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey || !identityUrl || !identitySecret) {
    return jsonResponse({ error: "Server is not configured (missing required secrets)" }, 500);
  }

  const authorizationHeader = req.headers.get("Authorization");
  if (!authorizationHeader) {
    return jsonResponse({ error: "Not authenticated" }, 401);
  }
  const callerClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authorizationHeader } },
  });
  const { data: userData, error: userErr } = await callerClient.auth.getUser();
  if (userErr || !userData?.user) {
    return jsonResponse({ error: "Not authenticated" }, 401);
  }
  const authUserId = userData.user.id;
  const callerEmail = userData.user.email ?? null;

  let body: { businessId?: unknown };
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON body" }, 400);
  }
  const businessId = typeof body.businessId === "string" ? body.businessId : "";
  if (!businessId) {
    return jsonResponse({ error: "businessId is required" }, 400);
  }

  // Ownership check - see register-with-wsms's own header comment for
  // why this is mandatory even though businesses is publicly readable.
  // Same narrow super-admin exception, same reasoning: admin_create_business
  // callers can never pass an owner_id check by definition, so the
  // recognized super-admin email is a second, explicit, still-real path
  // to the same lookup - never a bypass of ownership verification itself.
  const admin = createClient(supabaseUrl, supabaseServiceRoleKey);
  const isSuperAdmin = callerEmail === SUPER_ADMIN_EMAIL;
  let bizQuery = admin.from("businesses").select("id, name, type").eq("id", businessId);
  if (!isSuperAdmin) bizQuery = bizQuery.eq("owner_id", authUserId);
  const { data: business, error: businessErr } = await bizQuery.maybeSingle();
  if (businessErr) {
    return jsonResponse({ error: "Business lookup failed" }, 500);
  }
  if (!business) {
    return jsonResponse({ error: "Business not found or not owned by caller" }, 404);
  }

  const requestId = crypto.randomUUID();
  const issuedAt = new Date();
  const expiresAt = new Date(issuedAt.getTime() + 4 * 60 * 1000);

  let lastErrorStatus: number | null = null;
  let lastErrorBody: unknown = null;

  for (let attempt = 1; attempt <= MAX_IDENTITY_ATTEMPTS; attempt++) {
    if (Date.now() >= expiresAt.getTime()) break; // never retry past this request's own envelope

    try {
      const identityRes = await fetch(identityUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Request-ID": requestId },
        body: JSON.stringify({
          secret: identitySecret,
          productKey: "qrwegn",
          productAuthUserId: authUserId,
          externalBusinessId: business.id,
          ownerConfirmed: true,
          displayName: business.name,
          businessType: business.type ?? null,
          countryCode: null, // QRWegn's businesses table has no country column
          requestId,
          issuedAt: issuedAt.toISOString(),
          expiresAt: expiresAt.toISOString(),
        }),
      });
      const identityBody = await identityRes.json().catch(() => ({}));
      if (identityRes.ok) {
        return jsonResponse({
          ok: true,
          wegnBusinessId: identityBody.wegnBusinessId ?? null,
          alreadyLinked: !!identityBody.alreadyLinked,
        });
      }
      lastErrorStatus = identityRes.status;
      lastErrorBody = identityBody;
      console.error(`[register-business-with-identity] attempt ${attempt}/${MAX_IDENTITY_ATTEMPTS} - Identity service returned an error:`, identityRes.status, identityBody);
      if (identityRes.status >= 400 && identityRes.status < 500) break; // not retryable
    } catch (err) {
      lastErrorBody = err instanceof Error ? err.message : String(err);
      console.error(`[register-business-with-identity] attempt ${attempt}/${MAX_IDENTITY_ATTEMPTS} - request to Identity service failed:`, err);
    }

    if (attempt < MAX_IDENTITY_ATTEMPTS) {
      const remainingMs = expiresAt.getTime() - Date.now();
      if (remainingMs <= 0) break;
      await sleep(Math.min(RETRY_DELAYS_MS[attempt - 1], remainingMs));
    }
  }

  console.error("[register-business-with-identity] all attempts exhausted:", { status: lastErrorStatus, body: lastErrorBody });
  return jsonResponse({ ok: false, error: "Business registration failed" }, 502);
});
