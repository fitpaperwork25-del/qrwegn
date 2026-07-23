import { supabase } from "../supabase";

/**
 * WEGN Identity Service integration, Task 2 (Sprint 2) - fire-and-forget
 * from login, mirroring src/lib/wsms/subscriptionClient.ts's
 * registerBusinessWithWsms() pattern exactly. A failure here must never
 * be visible to the person logging in, never delay navigation, and
 * never throw - see supabase/functions/link-identity-account/index.ts
 * for the server-side half of this contract.
 */
export async function linkIdentityAccount(): Promise<void> {
  try {
    const { error } = await supabase.functions.invoke("link-identity-account", {});
    if (error) console.error("[linkIdentityAccount] link failed (non-blocking):", error);
  } catch (err) {
    console.error("[linkIdentityAccount] link failed (non-blocking):", err);
  }
}
