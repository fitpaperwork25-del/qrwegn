# Cross-Product Self-Service Signup — Phase A Implementation

**Status: implemented and live-verified.** This document records what Phase A shipped, what it deliberately stubbed for Phase B and Phase C, and exactly what each later phase needs to do — so they can proceed independently without re-reading every call site.

Repositories touched: `qrwegn` (WEGN Restaurants + marketing site), `wegn-store-app` (WEGN Store), `QRBooker-main-work` (WEGN Appointments), `wegn-home` (WEGN Home), `wegn-identity` (secrets only, no code change).

---

## 1. What Phase A actually built

For all three products, on successful signup (immediate-session path only — see §4):

1. `linkIdentityAccount()` is now called on **signup**, not just login (previously login-only in all three products — this was a real, confirmed gap, identical in shape across qrwegn, wegn-store-app, and QRBooker).
2. If that succeeds and returns a `wegnAccountId`, `registerBusinessWithIdentity(businessId)` is called — this is the call that actually creates the `wegn_businesses` + `wegn_business_memberships` rows in Identity's registry (the thing that makes a business show up in WEGN Home).
3. If *that* succeeds, the browser is redirected to `https://wegn-home.vercel.app/login?email=<their email>` instead of the product's own `/dashboard`.
4. If any step fails, nothing is blocked — the signup already succeeded, the business already exists and works in that product regardless — the flow just falls back to the product's own `/dashboard`, exactly as it behaved before this change.

**New in this pass:**
- `QRBooker-main-work/supabase/functions/register-business-with-identity/index.ts` — this Edge Function did not exist before. Mirrors `qrwegn`'s and `wegn-store-app`'s own versions exactly (productKey `"qrbooker"`, no `country_code` column, same ownership-verification discipline). Deployed and live-verified.
- `IDENTITY_REGISTRY_CREDENTIAL_QRBOOKER` set in `wegn-identity`'s secrets (the credential registry code already reserved this exact env var name — no code change was needed there, only provisioning a real value).
- `IDENTITY_REGISTRY_CREDENTIAL` / `IDENTITY_REGISTER_BUSINESS_LINK_URL` set in `QRBooker-main-work`'s own Supabase secrets.
- `wegn-home/src/pages/LoginPage.tsx` now reads `?email=` and `?mode=` query params, defaulting to signup mode with the email pre-filled when an email is present. Backward-compatible — visiting `/login` with no params behaves exactly as before.

## 2. Verification performed

Live-verified end-to-end, using disposable test accounts, cleaned up afterward:

- **qrwegn**: full chain confirmed directly in `wegn-identity`'s database — `wegn_accounts` row auto-created, `account_links` row correct (`product_key: "qrwegn"`), `wegn_businesses` row created (`profile_source_product_key: "qrwegn"`), `wegn_business_memberships` row correct (`role: "owner"`, `access_status: "active"`). Also confirmed the actual redirect URL fires correctly and lands on WEGN Home's login page in signup mode with the email pre-filled.
- **QRBooker (WEGN Appointments)**: same full chain verified directly against the deployed Edge Functions (`link-identity-account`, `register-business-with-identity`) via direct API calls with a real session token — both returned `ok: true` with real `wegnAccountId`/`wegnBusinessId` values, confirmed in `wegn-identity`'s database exactly as qrwegn's.
- **wegn-store-app**: code is a faithful mirror of the qrwegn pattern (same functions, same call order, same fallback behavior) and type-checks clean, but **could not be live-verified end-to-end** — this product's Supabase Auth project has "confirm email" enabled, so a fresh signup never gets an immediate session (falls into the existing `else` branch, which was already true before this change and is untouched by it). Live verification would require access to a real inbox to click the confirmation link. Not a gap introduced by this work — the identity-link/business-link code sits behind the exact same `if (signUpData.session && signUpData.user)` gate the WSMS registration call already used.
- **wegn-home**: `LoginPage.tsx`'s new query-param behavior verified directly in production (`/login?email=...` correctly renders "Create your WEGN Account" pre-filled; `/login` with no params is unaffected).

## 3. PHASE B — WSMS pricing (not started, intentionally)

Not touched in this pass, per explicit instruction. Still true as of this writing:

- QRBooker/QRWegn's WSMS plans are seeded at a **500 ETB placeholder** (`wegn-wsms/supabase/migrations/20260720150434_register_qrbooker_qrwegn.sql`), not the approved 3,000 Br (WEGN Restaurants) / 1,500 Br (WEGN Appointments). The live value may have been edited since via Platform Admin — **not reconfirmed against the live database in this session.**
- WEGN Store's actual WSMS-registered price was never found in any migration — edited live via Platform Admin, unconfirmed against the approved 4,000 Br.
- `default_trial_days` is unconfirmed as 30 for any of the three products (schema default is 14).
- No public, unauthenticated pricing-read endpoint exists in WSMS yet (`qrwegn/api/pricing.ts` remains a local hardcoded mirror).

None of this blocks Phase A's mechanism — `self-register-subscription` already resolves price/trial length server-side regardless of what the marketing site displays. Phase B is a data-correction and (optionally) a new-endpoint task, not a code-structure task.

## 4. PHASE C — automatic vs. explicit business-link (decided provisionally, not finally)

**The decision this stubs:** `register-business-link`'s own envelope requires `ownerConfirmed: true`, and the Business Registry contract's original intent (see every `register-business-with-identity` function's own header comment, across all three repos) was "a real, deliberate owner action, not something silently created on signup."

**What Phase A actually did:** called it automatically, immediately after a successful account-link, from each product's own signup flow — with no owner-facing confirmation step. This was an explicit, temporary choice to unblock a working end-to-end flow, not a final decision.

**Exactly where to change it, if Phase C decides explicit confirmation is required:**
- `qrwegn/src/pages/RegisterPage.tsx` — the `registerBusinessWithIdentity(newBusiness.id)` call inside `insertBusiness()`.
- `qrwegn/src/pages/DashboardPage.tsx` — the fire-and-forget call inside the magic-link-fallback branch of `load()`.
- `wegn-store-app/src/AuthGate.tsx` — the call inside the signup branch of `handleSubmit`.
- `QRBooker-main-work/src/pages/RegisterPage.tsx` — same shape as qrwegn's.
- `QRBooker-main-work/src/pages/DashboardPage.tsx` — same shape as qrwegn's.

In every case, **only the call site needs to move** — behind whatever confirmation UI Phase C designs — nothing in `registerBusinessWithIdentity()` itself, nor in `wegn-identity`'s `register-business-link`, needs to change. The redirect-to-WEGN-Home logic in each `RegisterPage.tsx`/`AuthGate.tsx` would also need to move to fire after that later confirmation instead of immediately after signup.

## 5. Known limitation, not a Phase B/C item: no cross-origin session handoff

There is no session-sharing mechanism between a product's own Supabase Auth (three separate projects) and WEGN Home's own Supabase Auth (`wegn-identity`'s project). Redirecting to `/login?email=...` does **not** sign the person in — it pre-fills WEGN Home's own signup form with their email so they can create (or sign into, if they already have one) their WEGN Account there. `business-portfolio-v1` then finds their already-linked business purely by matching verified email — this works correctly (verified live), but it is a second, separate step for the owner, not a silent handoff. Worth a future design pass if a smoother handoff is ever wanted; out of scope for Phase A.
