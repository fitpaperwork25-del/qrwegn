import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import type { VercelRequest, VercelResponse } from "@vercel/node";

// Server-to-server sibling of admin-platform-magic-link.ts — same shared-
// secret authentication, but generates the link and emails it directly
// via Resend (same provider/pattern as admin-send-invite.ts) instead of
// returning the raw link to the caller. Used by Platform Admin's "Send
// Recovery Email" action so the live, single-use sign-in link never has
// to transit Platform Admin's frontend/browser at all.

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
const resend = new Resend(process.env.RESEND_API_KEY);

const APP_URL = "https://qrwegn.com";
const platformAdminSecret = process.env.PLATFORM_ADMIN_SHARED_SECRET;

// Same visual language as admin-send-invite.ts's template (dark theme,
// gold QR finder mark) but recovery-toned copy. Does not state a specific
// expiration window — that's a Supabase Auth project setting, not
// something this code can verify, so the copy only promises single-use.
function html(email: string, recoveryLink: string): string {
  const finder = `
    <div style="width:24px;height:24px;background:#E8C547;border-radius:3px;display:inline-block;">
      <div style="margin:5px;width:14px;height:14px;background:#111111;border-radius:1px;">
        <div style="margin:4px;width:6px;height:6px;background:#E8C547;border-radius:1px;"></div>
      </div>
    </div>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>QR-Wegn account access recovery</title>
</head>
<body style="margin:0;padding:0;background:#080808;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#080808;">
<tr><td align="center" style="padding:0 16px;">
<table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">

  <!-- HEADER -->
  <tr>
    <td align="center" style="padding:52px 32px 40px;border-bottom:1px solid rgba(255,255,255,0.08);">
      <table cellpadding="0" cellspacing="0" style="margin:0 auto 16px;">
        <tr>
          <td>${finder}</td>
          <td width="10"></td>
          <td>${finder}</td>
        </tr>
        <tr><td colspan="3" height="10"></td></tr>
        <tr>
          <td>${finder}</td>
          <td></td>
          <td>
            <table cellpadding="0" cellspacing="2">
              <tr>
                <td style="width:6px;height:6px;background:#E8C547;border-radius:1px;opacity:.7;"></td>
                <td style="width:6px;height:6px;background:#E8C547;border-radius:1px;opacity:.4;"></td>
              </tr>
              <tr>
                <td style="width:6px;height:6px;background:#E8C547;border-radius:1px;opacity:.4;"></td>
                <td style="width:6px;height:6px;background:#E8C547;border-radius:1px;opacity:.7;"></td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
      <div style="font-size:28px;font-weight:900;color:#F0EDE8;letter-spacing:2px;line-height:1;">QR-Wegn</div>
      <div style="margin-top:8px;font-size:10px;font-weight:600;color:#E8C547;letter-spacing:5px;">SCAN &middot; ORDER &middot; SERVE</div>
    </td>
  </tr>

  <!-- HEADLINE -->
  <tr>
    <td style="padding:48px 32px 0;">
      <div style="font-size:30px;font-weight:900;color:#F0EDE8;line-height:1.15;letter-spacing:-0.5px;">
        Regain access to<br/>your dashboard.
      </div>
    </td>
  </tr>

  <!-- BODY -->
  <tr>
    <td style="padding:20px 32px 36px;">
      <p style="margin:0;font-size:16px;line-height:1.75;color:#999999;">
        Our support team received a request to help you sign back in to
        your QR-Wegn dashboard at <strong style="color:#ccc;">${email}</strong>.
        Click the button below to sign in directly &mdash; no password needed.
      </p>
    </td>
  </tr>

  <!-- RECOVERY LINK CTA -->
  <tr>
    <td align="center" style="padding:0 32px 40px;">
      <a href="${recoveryLink}"
         style="display:inline-block;background:#E8C547;color:#080808;text-decoration:none;font-weight:800;font-size:16px;padding:16px 40px;border-radius:10px;letter-spacing:0.3px;">
        Sign In to My Dashboard &rarr;
      </a>
      <p style="margin:16px 0 0;font-size:11px;color:#555555;">
        This link can only be used once. If you didn't request this, you can safely ignore this email.
      </p>
    </td>
  </tr>

  <!-- FOOTER -->
  <tr>
    <td style="border-top:1px solid rgba(255,255,255,0.07);padding:32px;text-align:center;">
      <p style="margin:0 0 8px;font-size:12px;color:#555555;">
        Questions? Reply to this email or reach us at
        <a href="mailto:fitpaperwork25@gmail.com" style="color:#E8C547;text-decoration:none;">fitpaperwork25@gmail.com</a>
      </p>
      <p style="margin:0;font-size:11px;color:#444444;letter-spacing:1px;">
        &copy; 2026 QR-Wegn &nbsp;&middot;&nbsp; SCAN &middot; ORDER &middot; SERVE
      </p>
    </td>
  </tr>

</table>
</td></tr>
</table>
</body>
</html>`;
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

  const { email } = req.body as { email?: string };
  if (!email || typeof email !== "string") return res.status(400).json({ error: "email required" });

  const { data, error } = await supabaseAdmin.auth.admin.generateLink({
    type: "magiclink",
    email,
    options: { redirectTo: APP_URL },
  });

  if (error) return res.status(400).json({ error: error.message });

  const link = (data as any).properties?.action_link;
  if (!link) return res.status(500).json({ error: "Failed to generate recovery link" });

  try {
    const { error: sendErr } = await resend.emails.send({
      from: "QR-Wegn <support@qrwegn.com>",
      to: email,
      subject: "Regain access to your QR-Wegn dashboard",
      html: html(email, link),
    });

    if (sendErr) {
      console.error("Resend error:", sendErr);
      return res.status(500).json({ error: sendErr.message });
    }

    res.setHeader("Cache-Control", "no-store");
    return res.json({ ok: true });
  } catch (err: any) {
    console.error("admin-platform-send-recovery-email error:", err);
    return res.status(500).json({ error: err.message ?? "Failed to send recovery email." });
  }
}
