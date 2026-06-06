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

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  try {
    const { restaurant, pin } = await req.json();
    if (!restaurant || !pin) {
      return respond({ error: "restaurant and pin are required" }, 400);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const admin = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // ── 1. Resolve business (slug is the normal path; UUID fallback for tooling) ──
    const uuidRe =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    let business: { id: string; name: string } | null = null;

    const slugRes = await admin
      .from("businesses")
      .select("id, name")
      .eq("slug", restaurant)
      .maybeSingle();

    if (slugRes.data) {
      business = slugRes.data as { id: string; name: string };
    } else if (uuidRe.test(restaurant)) {
      const idRes = await admin
        .from("businesses")
        .select("id, name")
        .eq("id", restaurant)
        .maybeSingle();
      if (idRes.data) {
        business = idRes.data as { id: string; name: string };
      }
    }

    if (!business) {
      return respond({ error: "Invalid credentials" }, 401);
    }

    // ── 2. Verify PIN — SECURITY DEFINER RPC reads pin_hash safely ──
    const pinRes = await admin.rpc("verify_staff_pin_id", {
      bid: business.id,
      pin: String(pin),
    });

    if (pinRes.error || !pinRes.data || (pinRes.data as unknown[]).length === 0) {
      return respond({ error: "Invalid credentials" }, 401);
    }

    const staffPin = (pinRes.data as { id: string; name: string }[])[0];

    // ── 3. Find or create the synthetic auth user for this business ──
    const identityRes = await admin
      .from("staff_identities")
      .select("user_id, auth_email")
      .eq("business_id", business.id)
      .maybeSingle();

    let userId: string;
    let authEmail: string;

    if (identityRes.data) {
      userId = (identityRes.data as { user_id: string; auth_email: string })
        .user_id;
      authEmail = (
        identityRes.data as { user_id: string; auth_email: string }
      ).auth_email;
    } else {
      // First login for this business — provision a synthetic auth user
      authEmail = `staff-${business.id}@qrwegn.internal`;
      const initialPassword = crypto.randomUUID();

      const createRes = await admin.auth.admin.createUser({
        email: authEmail,
        password: initialPassword,
        email_confirm: true,
      });

      if (createRes.error || !createRes.data.user) {
        console.error("createUser error:", createRes.error);
        return respond({ error: "Failed to provision staff session" }, 500);
      }

      userId = createRes.data.user.id;

      const insertRes = await admin.from("staff_identities").insert({
        business_id: business.id,
        user_id: userId,
        auth_email: authEmail,
        auth_password: initialPassword,
      });

      if (insertRes.error) {
        console.error("staff_identities insert error:", insertRes.error);
        return respond({ error: "Failed to provision staff session" }, 500);
      }
    }

    // ── 4. Mint a real session: set one-time password → signInWithPassword ──
    // Updating the password avoids needing to know or store the current one.
    const sessionPassword = crypto.randomUUID();

    const updateRes = await admin.auth.admin.updateUserById(userId, {
      password: sessionPassword,
    });

    if (updateRes.error) {
      console.error("updateUserById error:", updateRes.error);
      return respond({ error: "Failed to create staff session" }, 500);
    }

    const signInRes = await admin.auth.signInWithPassword({
      email: authEmail,
      password: sessionPassword,
    });

    if (signInRes.error || !signInRes.data.session) {
      console.error("signInWithPassword error:", signInRes.error);
      return respond({ error: "Failed to create staff session" }, 500);
    }

    // ── 5. Return session + business context ──
    return respond(
      {
        access_token: signInRes.data.session.access_token,
        refresh_token: signInRes.data.session.refresh_token,
        business_id: business.id,
        name: business.name,
        server_id: staffPin.id,
      },
      200
    );
  } catch (err) {
    console.error("staff-login unhandled error:", err);
    return respond({ error: "Internal server error" }, 500);
  }
});
