import { supabase } from "../supabase";

/**
 * Task 2 (Sprint 2), credential updated in Task 5: links the caller's
 * own QRWegn owner account to the WEGN Identity Service. Holds
 * IDENTITY_CREDENTIAL server-side only - a scoped credential permitted
 * only to call link-account with productKey "qrwegn" (see wegn-identity's
 * README.md "Security model" section and credentialRegistry.ts).
 *
 * Cross-product signup Phase A: now returns its result instead of void,
 * so a caller (RegisterPage.tsx) can decide whether it's safe to proceed
 * to registerBusinessWithIdentity() below - register-business-link
 * requires an existing account_links row and 409s otherwise, so business
 * linking must never be attempted before this succeeds. Still never
 * throws and still safe to call fire-and-forget (`void
 * linkIdentityAccount()`) wherever the caller doesn't need the result,
 * e.g. LoginPage.tsx.
 */
export type LinkIdentityAccountResult = { ok: boolean; wegnAccountId: string | null };

export async function linkIdentityAccount(): Promise<LinkIdentityAccountResult> {
  try {
    const { data, error } = await supabase.functions.invoke("link-identity-account", {});
    if (error) {
      console.error("[linkIdentityAccount] link failed (non-blocking):", error);
      return { ok: false, wegnAccountId: null };
    }
    return { ok: !!data?.ok, wegnAccountId: data?.wegnAccountId ?? null };
  } catch (err) {
    console.error("[linkIdentityAccount] link failed (non-blocking):", err);
    return { ok: false, wegnAccountId: null };
  }
}

/**
 * Cross-product signup Phase A / Phase C stub: registers the caller's
 * own business with WEGN Identity's canonical Business Registry (see
 * supabase/functions/register-business-with-identity/index.ts). This is
 * what makes a business appear in WEGN Home's portfolio.
 *
 * PHASE C PLACEHOLDER - decision not yet made: register-business-link's
 * envelope requires ownerConfirmed: true, and its own design intent (see
 * that Edge Function's header comment) was "a real, deliberate owner
 * action, not something silently created on signup." This client is
 * currently called automatically, immediately after a successful
 * linkIdentityAccount(), from RegisterPage.tsx's signup flow - not from
 * any explicit owner-confirmation UI, because none exists yet. If a
 * future decision requires explicit confirmation instead, move this
 * call (and only this call) behind that UI; nothing else in this chain
 * needs to change.
 */
export type RegisterBusinessWithIdentityResult = { ok: boolean; wegnBusinessId: string | null };

export async function registerBusinessWithIdentity(businessId: string): Promise<RegisterBusinessWithIdentityResult> {
  try {
    const { data, error } = await supabase.functions.invoke("register-business-with-identity", {
      body: { businessId },
    });
    if (error) {
      console.error("[registerBusinessWithIdentity] link failed (non-blocking):", error);
      return { ok: false, wegnBusinessId: null };
    }
    return { ok: !!data?.ok, wegnBusinessId: data?.wegnBusinessId ?? null };
  } catch (err) {
    console.error("[registerBusinessWithIdentity] link failed (non-blocking):", err);
    return { ok: false, wegnBusinessId: null };
  }
}
