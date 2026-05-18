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

  // Try to create; if already exists, look up the existing user
  let userId: string;
  const { data: userData, error: userError } = await supabase.auth.admin.createUser({
    email:          "fitpaperwork25@gmail.com",
    password:       "TempAdmin2026!",
    email_confirm:  true,
  });

  if (userError) {
    if (!userError.message.toLowerCase().includes("already been registered")) {
      return res.status(400).json({ error: userError.message });
    }
    // User exists — find them by email
    const { data: list, error: listErr } = await supabase.auth.admin.listUsers();
    if (listErr) return res.status(500).json({ error: listErr.message });
    const existing = list.users.find((u) => u.email === "fitpaperwork25@gmail.com");
    if (!existing) return res.status(404).json({ error: "User not found after lookup" });
    userId = existing.id;
    // Reset password so they can log in
    await supabase.auth.admin.updateUserById(userId, { password: "TempAdmin2026!" });
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
