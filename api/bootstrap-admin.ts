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

    // User exists in a ghost/unconfirmed state not returned by listUsers.
    // generateLink({ type: "recovery" }) locates ANY user by email regardless
    // of confirmation status and returns their full user object.
    const { data: linkData, error: linkErr } = await supabase.auth.admin.generateLink({
      type:  "recovery",
      email: "fitpaperwork25@gmail.com",
    });

    if (linkErr || !linkData?.user?.id) {
      return res.status(500).json({ step: "generateLink", error: linkErr?.message ?? "no user returned" });
    }

    userId = linkData.user.id;

    // Confirm email and reset password so they can sign in immediately
    await supabase.auth.admin.updateUserById(userId, {
      password:      "TempAdmin2026!",
      email_confirm: true,
    });
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
