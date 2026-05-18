import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import type { VercelRequest, VercelResponse } from "@vercel/node";

// One-time bootstrap endpoint — deleted immediately after use.
const BOOTSTRAP_SECRET = "qwegn-bootstrap-2026";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).end();
  if (req.headers["x-bootstrap-secret"] !== BOOTSTRAP_SECRET) {
    return res.status(403).json({ error: "Forbidden" });
  }

  let userId: string;

  // Try to create the user fresh
  const { data: userData, error: userError } = await supabase.auth.admin.createUser({
    email:         "fitpaperwork25@gmail.com",
    password:      "TempAdmin2026!",
    email_confirm: true,
  });

  if (userError) {
    if (!userError.message.toLowerCase().includes("already been registered")) {
      return res.status(400).json({ step: "createUser", error: userError.message });
    }

    // The email is soft-deleted — invisible to listUsers/generateLink but
    // still blocks re-registration. Fetch including deleted records, hard-delete
    // to free the email, then recreate.
    const base    = process.env.SUPABASE_URL!;
    const svcKey  = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const headers = { "apikey": svcKey, "Authorization": `Bearer ${svcKey}` };

    // Try to find the deleted user
    const withDeleted = await fetch(
      `${base}/auth/v1/admin/users?include_deleted=true&per_page=1000`,
      { headers }
    ).then((r) => r.json()) as any;

    const allUsers: any[] = Array.isArray(withDeleted)
      ? withDeleted
      : (withDeleted.users ?? []);

    const ghost = allUsers.find(
      (u: any) => u.email?.toLowerCase() === "fitpaperwork25@gmail.com"
    );

    if (!ghost) {
      return res.status(404).json({
        error: "Ghost user not found even with include_deleted",
        total: allUsers.length,
        sample: allUsers.slice(0, 3).map((u: any) => ({ id: u.id, email: u.email, deleted_at: u.deleted_at })),
      });
    }

    // Hard-delete the ghost so the email is freed
    await fetch(`${base}/auth/v1/admin/users/${ghost.id}`, {
      method: "DELETE",
      headers,
    });

    // Now recreate fresh
    const { data: fresh, error: freshErr } = await supabase.auth.admin.createUser({
      email:         "fitpaperwork25@gmail.com",
      password:      "TempAdmin2026!",
      email_confirm: true,
    });

    if (freshErr || !fresh?.user?.id) {
      return res.status(500).json({ step: "recreate", error: freshErr?.message ?? "no user" });
    }

    userId = fresh.user.id;
  } else {
    userId = userData.user.id;
  }

  // Insert business row
  const { error: bizError } = await supabase.from("businesses").insert({
    owner_id:            userId,
    name:                "QR-Wegn HQ",
    slug:                "qr-wegn-hq",
    type:                "platform",
    plan:                "starter",
    subscription_status: "trialing",
  });

  if (bizError) {
    return res.status(400).json({ error: bizError.message, user_id: userId });
  }

  return res.json({ success: true, user_id: userId });
}
