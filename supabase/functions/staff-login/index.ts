import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function respond(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  try {
    const { restaurant, pin } = await req.json();
    if (!restaurant || !pin) {
      return respond({ error: "restaurant and pin are required" }, 400);
    }

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { autoRefreshToken: false, persistSession: false } },
    );

    // ── 1. Resolve business by slug, fall back to UUID ──────────────────────
    const isUuid = UUID_RE.test(String(restaurant));
    const { data: business } = await admin
      .from("businesses")
      .select("id, name")
      .eq(isUuid ? "id" : "slug", String(restaurant))
      .maybeSingle<{ id: string; name: string }>();

    if (!business) {
      return respond({ error: "Invalid credentials" }, 401);
    }

    // ── 2. Verify PIN — SECURITY DEFINER RPC checks pin_hash safely ─────────
    const { data: pins, error: pinErr } = await admin.rpc(
      "verify_staff_pin_id",
      { bid: business.id, pin: String(pin) },
    );

    if (pinErr || !Array.isArray(pins) || pins.length === 0) {
      return respond({ error: "Invalid credentials" }, 401);
    }

    const staffPin = (pins as { id: string; name: string }[])[0];

    // ── 2b. Fetch role from staff_pins (verify_staff_pin_id only returns id/name) ─
    const { data: pinRow } = await admin
      .from("staff_pins")
      .select("role")
      .eq("id", staffPin.id)
      .maybeSingle<{ role: string }>();
    const serverRole = pinRow?.role ?? "kitchen";

    // ── 3. Find or create the synthetic auth user for this business ──────────
    const { data: identity } = await admin
      .from("staff_identities")
      .select("user_id, auth_email")
      .eq("business_id", business.id)
      .maybeSingle<{ user_id: string; auth_email: string }>();

    let userId: string;
    let authEmail: string;

    if (identity) {
      userId    = identity.user_id;
      authEmail = identity.auth_email;
    } else {
      // First login — provision a synthetic auth user for this business.
      authEmail = `staff-${business.id}@qrwegn.internal`;
      const initialPassword = crypto.randomUUID();

      const { data: created, error: createErr } =
        await admin.auth.admin.createUser({
          email:         authEmail,
          password:      initialPassword,
          email_confirm: true,
        });

      if (createErr || !created.user) {
        console.error("createUser:", createErr);
        return respond({ error: "Failed to provision staff session" }, 500);
      }

      userId = created.user.id;

      const { error: insertErr } = await admin
        .from("staff_identities")
        .insert({
          business_id:   business.id,
          user_id:       userId,
          auth_email:    authEmail,
          auth_password: initialPassword, // NOT NULL column; value is stale after first login
        });

      if (insertErr) {
        console.error("staff_identities insert:", insertErr);
        return respond({ error: "Failed to provision staff session" }, 500);
      }
    }

    // ── 4. Rotate to one-time password and sign in ───────────────────────────
    const sessionPassword = crypto.randomUUID();

    const { error: updateErr } = await admin.auth.admin.updateUserById(
      userId,
      { password: sessionPassword },
    );

    if (updateErr) {
      console.error("updateUserById:", updateErr);
      return respond({ error: "Failed to create staff session" }, 500);
    }

    const { data: signInData, error: signInErr } =
      await admin.auth.signInWithPassword({
        email:    authEmail,
        password: sessionPassword,
      });

    if (signInErr || !signInData.session) {
      console.error("signInWithPassword:", signInErr);
      return respond({ error: "Failed to create staff session" }, 500);
    }

    // ── 5. Return session + context ──────────────────────────────────────────
    return respond(
      {
        access_token:  signInData.session.access_token,
        refresh_token: signInData.session.refresh_token,
        business_id:   business.id,
        name:          business.name,
        server_id:     staffPin.id,
        server_role:   serverRole,
      },
      200,
    );
  } catch (err) {
    console.error("staff-login unhandled:", err);
    return respond({ error: "Internal server error" }, 500);
  }
});
