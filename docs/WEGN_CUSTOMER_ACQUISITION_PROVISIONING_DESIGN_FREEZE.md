# WEGN Customer Acquisition & Product Provisioning — Architecture Design Freeze

**Status: investigation and design only. No code, migrations, or configuration changed anywhere. No repo modified except this document.**

This document exists because the conversion-flow audit (previous task) found that
routing every product's "Start Free Trial" CTA to the marketing site's existing
`/register` route would be wrong — that route provisions only WEGN Restaurants and
carries a stale `plan: "starter"` value. This document investigates what already
exists across every real repository in the ecosystem before proposing anything.

---

## 0. What was actually inspected

Repositories found on this machine, and which is canonical where duplicates exist
(the newer, richer copy under `Desktop/Projects/Wegn-Store/` — confirmed by
`docs/` depth and file mtimes, Jul 20 vs. an Jul 10 top-level duplicate):

| System | Repo path | Type |
|---|---|---|
| WEGN public website **and** WEGN Restaurants product | `Desktop/Projects/qrwegn` (this repo) | React Router SPA, one deployment |
| WEGN Store | `Desktop/Projects/Wegn-Store/wegn-store-app` | Single-page app, no router |
| WSMS | `Desktop/Projects/Wegn-Store/wegn-wsms` | Supabase backend only (migrations + Edge Functions), no frontend |
| Platform Admin | `Desktop/Projects/Wegn-Store/wegn-platform-admin` | React Router v7 app |
| WEGN Appointments (QRBooker) | **not present on this machine** | — |

**WEGN Appointments' own repository could not be located or inspected locally.**
Everything below about it is reconstructed from WSMS/Platform Admin's own
documentation (`WSMS_IMPLEMENTATION_STATUS.md`, `WSMS_PRODUCT_INTEGRATION_PATTERN.md`,
`MILESTONE_CLOSURE_QRBOOKER_WSMS.md`, migration files that reference it) and from
WSMS's actual database schema/seed migrations — not from reading its source. This
is called out explicitly rather than presented as directly verified, per the same
"flag, don't guess" discipline used throughout this engagement.

---

## 1. Current architecture, by product

### WEGN public website (this repo, `qrwegn`)
Also *is* the WEGN Restaurants product — one Vercel deployment, one React Router
SPA, serving both the public marketing pages (`/`, `/products`, `/pricing`, etc.)
and the authenticated app (`/dashboard`, `/staff-*`, `/admin`) under the same
domain. This dual identity is why `/register` "just works" for WEGN Restaurants
and for no one else — it was never built to serve three products, only one that
happens to also host the shared marketing shell.

- **Live:** yes.
- **Production URL:** not confirmed from local files (Vercel custom-domain
  binding isn't recorded in-repo); `https://qrwegn.com` appears as a QR-code
  target and email sender domain in source, so that is very likely the real
  production domain, but this should be confirmed against the actual Vercel
  project before being relied on operationally.
- **Auth:** Supabase email+password, plus a per-business synthetic-auth staff
  PIN flow (built earlier this engagement).
- **Self-service registration:** yes — `/register` (`RegisterPage.tsx`), single
  form, no product selector.
- **Tenant creation:** `INSERT INTO businesses (...)` in this repo's own
  Supabase project, three call sites total (`RegisterPage.tsx` plus two more
  found during `qrwegn-wsms-v1`'s closure, per `WSMS_PRODUCT_INTEGRATION_PATTERN.md`).
- **30-day trial today:** WSMS registration happens (`registerBusinessWithWsms`),
  always `trialing`, but the *length* of that trial is resolved by WSMS from
  `products.default_trial_days` — not by this repo. See §7 for why that matters.
- **WSMS recognition:** yes, `product_key = 'qrwegn'`, live, tested
  (`qrwegn-wsms-v1`), 10 real subscriptions in production per
  `WSMS_IMPLEMENTATION_STATUS.md`.
- **Access control from subscription status:** informational only — a banner
  renders based on WSMS-derived state (trial/active/grace/suspended/cancelled);
  nothing is actually blocked at any status today, by explicit, documented,
  cross-product Phase-1 policy.
- **Onboarding:** none. `/onboarding` and `/onboarding-complete` are unwired
  `Placeholder` routes nothing links to. Registration succeeds straight into
  `/dashboard`.
- **Provisioning safety today:** registration itself is safe (ownership
  verification, server-resolved trial creation, fire-and-forget WSMS call that
  never blocks account creation). The unsafe part is entirely upstream of
  registration — see §3.

### WEGN Store (`wegn-store-app`)
- **Live:** yes (`wsms-wegn-store-v1`, closed milestone).
- **Production URL:** not confirmed from local files.
- **Auth:** *not* Supabase email+password by default — a custom
  owner/registered-device/employee session model (`AuthGate.tsx`), documented in
  this repo's own migration comments as "Registered Store Device (Option A —
  shared device identity)." A visitor can also sign up as an owner directly
  (`mode: "signup"` inside `AuthGate.tsx`).
- **Self-service registration:** yes, but **not as a URL route** — this app has
  no `react-router-dom` dependency at all. Registration is a `mode` toggle
  (`"login" | "signup"`) inside one gate component that owns the entire app
  shell. There is no `/register` (or equivalent) path to link to; the entry
  point is the app's root URL plus in-app UI state.
- **Tenant creation:** `businesses` insert inside `AuthGate.tsx`'s signup branch,
  `owner_id: signUpData.user.id`, immediately followed by a fire-and-forget
  `registerBusinessWithWsms(newBusiness.id)` call — architecturally identical
  fire-and-forget pattern to WEGN Restaurants.
- **WSMS recognition:** yes, `product_key = 'wegn-store'`, live, 4 real
  subscriptions in production (per `WSMS_IMPLEMENTATION_STATUS.md`), migrated
  to `active` status directly (no prior trial concept existed at migration
  time).
- **Registered price in WSMS:** not found in any migration file — Wegn Store's
  `plans` row was apparently seeded or edited outside version control (plans
  are editable live via Platform Admin's `update-plan` Authorized Operation).
  **Not independently confirmed to equal the approved 4,000 Br/month** — flagged
  as a verify-before-launch item, not assumed correct just because it wasn't
  flagged as obviously wrong.
- **Onboarding:** none found beyond the signup form itself producing an
  immediately-usable (empty) store.
- **Known pre-existing data drift:** `WSMS_IMPLEMENTATION_STATUS.md` records one
  business ("Dukan Mereb") created after the original migration with no
  matching WSMS subscription — a real orphan, already known, out of scope for
  this document to fix.
- **Provisioning safety today:** the registration mechanism itself is real and
  tested. **It is unreachable from the public marketing site** — no CTA, no
  link, no query-param bootstrap exists anywhere in `AuthGate.tsx` to land a
  marketing visitor directly into signup mode with a specific plan already
  selected.

### WEGN Appointments (QRBooker) — reconstructed from documentation only
- **Live:** yes, per `WSMS_IMPLEMENTATION_STATUS.md` (`qrbooker-wsms-v1`), 2 real
  `trialing` subscriptions in production.
- **Production URL:** not found in any locally available document.
- **Auth:** Supabase email+password, plus "a single shared staff PIN" (per
  `WSMS_PRODUCT_INTEGRATION_PATTERN.md`'s Part 6 comparison table) — described
  as architecturally simpler than WEGN Restaurants' per-business synthetic PIN
  system, but not independently verified here.
- **Self-service registration:** documented as existing, with **three**
  business-creation call sites (`RegisterPage.tsx`, plus two more, one of which
  is `AdminPage.tsx`'s `admin_create_business` path) — same shape as WEGN
  Restaurants, per the pattern doc's own note that QRWegn's integration was
  "copied from QRBooker's actual finished code with zero adaptation." This
  implies QRBooker very likely also has its own dedicated `/register`-style
  route, by architectural inheritance — **not directly confirmed**, since the
  source isn't available to read.
- **Tenant creation:** `businesses` / `owner_id`, **public RLS** (unlike WEGN
  Restaurants' RLS posture at the time this pattern was first identified) —
  this is *why* the mandatory explicit `owner_id` filter in WSMS's registration
  path became a documented, non-negotiable standard (`WSMS_PRODUCT_INTEGRATION_PATTERN.md`
  Part 1).
- **WSMS recognition:** yes, `product_key = 'qrbooker'`, live, tested.
- **Registered price in WSMS — confirmed, and it is a real problem:** the
  seed migration `20260720_register_qrbooker_qrwegn.sql` registers QRBooker
  (and QRWegn) with an explicit **500 ETB "Starter"** placeholder plan, with
  the migration's own comment stating: *"Placeholder prices only — no real
  pricing decision has been made for these two yet."* This is **500 ETB**,
  not the approved **1,500 Br/month**. This is not a hypothetical
  risk — it is the actual row a real signup would be charged against today,
  had a self-service CTA existed to reach it.
- **Trial length:** the same seed migration does not set `default_trial_days`,
  so it sits at the schema default of **14 days**, not 30.
- **Onboarding:** unknown — cannot verify without source access.
- **Provisioning safety today:** cannot be independently assessed beyond what
  WSMS's own records show. What WSMS's records *do* show is enough to say:
  **do not point a "Start Free 30-Day Trial" CTA at this product yet** — the
  price and trial length WSMS would actually apply do not match what the
  marketing site promises.

### WSMS (`wegn-wsms`)
- **Live:** yes, Supabase project `vqnhvhrdzkaqoecikspf`. No frontend of its
  own — pure backend (migrations + Edge Functions).
- **Schema already contains most of a real product catalog:**
  `products (product_key, display_name, status, default_trial_days)` and
  `plans (product_id, plan_key, display_name, price_amount, price_currency,
  billing_interval, grace_period_days, is_active)` — this is not a green-field
  design problem; it is an existing table that is missing a handful of
  public-facing fields (see §5).
- **No public read endpoint exists.** Every WSMS Edge Function requires either
  a product secret (`self-register-subscription`, `check-entitlement`) or the
  platform-admin secret (everything Platform Admin calls). There is currently
  no way for an anonymous browser — i.e., the marketing site — to read current
  published pricing from WSMS at all. This is exactly why `api/pricing.ts` in
  this repo exists as its own documented "temporary adapter," and exactly why
  it and WSMS's actual `plans` table have already drifted (§7).
- **Access control:** subscription status (`trialing → active → grace_period →
  suspended → cancelled`) is tracked centrally and precisely, but is
  informational-only in every consuming product today — no product currently
  blocks functionality at any status, by deliberate, documented, cross-product
  policy pending a future explicit decision.
- **Provisioning can be performed safely today** for WEGN Store and WEGN
  Restaurants (both live-tested, both reachable through their own apps). For
  WEGN Appointments, WSMS-side mechanics are safe, but see the pricing
  mismatch above.

### Platform Admin (`wegn-platform-admin`)
- **Live:** yes. Holds the *only* copy of `WSMS_PLATFORM_ADMIN_SECRET` anywhere
  in the ecosystem, by design (ADR-0001).
- **Full read + Authorized Operations** over WSMS (Activate / Suspend /
  Reactivate / Extend Grace / Override Period), a Subscription Operations
  dashboard, and Sync Health / orphan detection across all three products via
  read-only per-product proxies (`stores-summary`, and equivalents for the
  other two).
- **Relevant here because:** it is the one system already positioned, secured,
  and trusted to safely broker a public-facing read of WSMS's real pricing —
  see §5's recommendation.

---

## 2. Product readiness classification

| Product | Classification | Why |
|---|---|---|
| **WEGN Restaurants** | **Self-service ready** | Working `/register` route, live WSMS registration, lands on a usable dashboard. One caveat: trial length shown publicly (30 days) is not confirmed to match WSMS's actual configured value for this product (schema default is 14 days unless overridden — not confirmed either way from migrations). Verify before relying on the CTA copy. |
| **WEGN Store** | **Assisted onboarding only** (from the public website's perspective) | The underlying registration mechanism is real, live, and tested — but it is a same-app UI-state toggle, not a linkable route, and nothing on the marketing site links to it or passes it any context. Its actual WSMS-registered price is also unconfirmed against the approved 4,000 Br figure. Product-side, it is closer to self-service-ready than Appointments; site-side, it is not reachable at all today. |
| **WEGN Appointments** | **Assisted onboarding only** (leaning toward **not ready**) | Same site-side reachability gap as Store, *plus* a confirmed, real pricing mismatch: WSMS holds an explicit 500 ETB placeholder plan for this product, documented as a deliberate placeholder awaiting a real pricing decision. A "Start Free Trial" CTA pointed at this product today would create real subscriptions at the wrong price. |

None of the three is disqualified by the marketing site's own presentation —
each was evaluated on what its actual backing system does, per the instruction
not to assume readiness from marketing-page presence alone.

---

## 3. Current registration and provisioning gaps

1. **The marketing site's only registration route provisions one product.**
   `/register` has no product concept, hardcodes `plan: "starter"` (a value
   from a pricing model that no longer exists after the brand-alignment pass),
   and cannot express "this signup is for WEGN Store" even in principle.
2. **Pricing exists in three disconnected places, already diverged.** The
   marketing site's `api/pricing.ts` (4,000 / 3,000 / 1,500 Br), WSMS's actual
   `plans` table for QRBooker/QRWegn (500 ETB placeholder each), and Wegn
   Store's WSMS plan (unconfirmed) do not agree. WSMS is the system that will
   actually govern what a subscription is charged against — it must become the
   single source of truth, not the third disconnected copy.
3. **No public, unauthenticated way to read WSMS's real catalog exists.** Every
   product that wants to show accurate pricing has had to build (or will have
   to build) its own local hardcoded mirror, which is precisely how gap #2
   happened and will keep happening.
4. **Two of three products are unreachable from any marketing CTA.** WEGN
   Store and WEGN Appointments have no deep-link / bootstrap mechanism to
   receive "the visitor wants to sign up for *this* product, having seen *this*
   price," even if the marketing site tried to send them there today.
5. **The three products are not architecturally uniform.** WEGN Restaurants is
   a routed multi-page SPA; WEGN Store has no router at all; WEGN Appointments'
   shape is inferred, not confirmed. A design that assumes "just add a query
   param to `/register`" only solves this for the one product that already
   works.
6. **Onboarding does not exist anywhere confirmed.** WEGN Restaurants'
   `/onboarding` is a dead placeholder. Neither Store nor (as far as can be
   determined) Appointments appears to have a distinct onboarding stage beyond
   "the signup form itself produces a usable, empty account."
7. **Access control from subscription status is informational-only,
   everywhere, on purpose** — this is a real, deliberate, already-documented
   design decision (not a gap to close in this document), but it does mean
   "whether provisioning can be performed safely" is currently a question
   about registration correctness and pricing integrity, not about
   entitlement enforcement, since nothing is enforced yet.

---

## 4. Target end-to-end architecture

```
Visitor on WEGN public website
        │
        ▼
  Product selection            (Products / Pricing page — reads the
        │                       canonical catalog, never a hardcoded copy)
        ▼
  Pricing confirmation         (price, currency, trial length, and
        │                       "no credit card required" — all resolved
        │                       server-side from the catalog, at request time)
        ▼
  CTA routes to the SELECTED PRODUCT'S OWN registration surface,
  carrying product context via a signed/short-lived query parameter —
  not a shared cross-origin route, since the three products are
  separate deployments with materially different app architectures.
        │
        ▼
  Product-specific registration UI (each product's own app),
  pre-filled/locked to the product the visitor actually chose,
  never trusting a client-editable price — it re-resolves price
  and trial terms from the catalog/WSMS at submission time.
        │
        ▼
  WEGN customer/account identity created  (each product's own
        │                                   Supabase Auth — no shared
        │                                   identity provider today;
        │                                   seeAdopting §11 for why that's
        │                                   deliberately out of scope here)
        ▼
  Product-specific subscription creation   (self-register-subscription,
        │                                   product secret, trialing,
        │                                   price/trial length resolved
        │                                   from WSMS's own products/plans
        │                                   row — never from the request)
        ▼
  Product provisioning                     (tenant row creation — already
        │                                   product-owned, stays that way)
        ▼
  Onboarding                               (currently absent everywhere;
        │                                   see §9)
        ▼
  Correct application launches             (that product's own dashboard —
                                             never a generic shared shell)
```

**The core design decision this makes explicit:** the marketing site's job
stops at "hand the visitor to the right product, with the right context,
safely." It does not become a shared registration system for all products —
that would require rebuilding two of the three products' auth/onboarding
layers, which is explicitly out of scope and not something three separately
architected apps should be forced into just to satisfy one shared form.

---

## 5. Canonical product-catalog design

**Do not build a new catalog system.** WSMS's existing `products`/`plans`
tables are already most of this. Extend them with the public-facing fields
they're missing, and add exactly one new, narrowly-scoped, public-safe read
endpoint to serve them — closing the gap `api/pricing.ts`'s own comments
already named.

### Fields (existing vs. new)

| Field | Source | Status |
|---|---|---|
| `product_id` | `products.id` | exists |
| `product_slug` (was `product_key`) | `products.product_key` | exists |
| `public_name` | — | **new** — `products.display_name` exists but is currently used as an internal/admin label ("QRBooker," not "WEGN Appointments"); either add a distinct `public_name` column or make `display_name` itself the public name and rename call sites — a product-owner decision, not a technical one |
| `description` | — | **new** column on `products` |
| `monthly_price` / `currency` | `plans.price_amount` / `plans.price_currency` | exists (per active plan) |
| `trial_days` | `products.default_trial_days` | exists — **must be corrected per product before this catalog is trusted publicly** (see §7) |
| `acquisition_mode` | — | **new** — enum `self_service \| assisted \| unavailable`, drives §11's CTA behavior directly from data, not from hardcoded per-page logic |
| `registration_route` | — | **new** — where *that product's own app* expects a signed-up visitor to land (may be a path, may be a full URL — see §6) |
| `onboarding_route` | — | **new**, nullable until §9 exists anywhere |
| `application_url` | — | **new** — the product's real production origin; today this isn't recorded anywhere central, which is itself a gap this catalog fixes |
| `wsms_product_identifier` | `products.product_key` | exists, already the join key |
| `provisioning_handler` | — | **new**, or simply "the fact that a product has a row here and an `acquisition_mode` of `self_service`" *is* the provisioning handler — see §8 for why no separate dispatch table is needed |
| `active` / `unavailable` | `products.status` | exists, but currently only `active \| inactive` — needs `unavailable` to be distinguishable from `inactive` (a *retired* product vs. one that's real but not yet sold) or `acquisition_mode = unavailable` covers this without a schema change |

### The one new endpoint

`GET /public/catalog` (name illustrative) — WSMS Edge Function, **no product
secret required, no platform-admin secret required**, returns only the columns
above for every `active` product, nothing else (no tenant data, no
subscription data, no other product's secrets). This is a genuinely new kind
of WSMS endpoint — Part 3 of `WSMS_PRODUCT_INTEGRATION_PATTERN.md` currently
states "no new WSMS endpoint gets created to serve one product's special
case," but a *public catalog read* is not a per-product special case — it is
infrastructure every current and future product needs identically, which is
exactly the bar that document sets for adding something new to WSMS's shared
surface.

Every product's own pricing page (or the shared marketing site) calls this one
endpoint instead of maintaining a local copy. This is the single change that
makes gap #2 in §3 structurally impossible to repeat.

---

## 6. Registration route and state-persistence design

**Recommendation: product-specific registration surfaces, not one shared
route** — with the shared component being the *catalog lookup and CTA
generation* on the marketing site, not the registration form itself.

Reasoning, concretely:

- WEGN Restaurants' registration already lives at its own `/register`, inside
  the same deployment as the marketing site.
- WEGN Store has no router — there is no URL for a shared route to redirect
  *to* inside that app today. A query-param convention only helps once Store's
  own `AuthGate.tsx` is taught to read `?product=...` on mount and force
  `mode="signup"` — that is Store-repo work, not marketing-site work.
- WEGN Appointments' actual registration surface cannot be confirmed from here.

So the pattern `/register?product=wegn-restaurants` **is correct in shape**
for WEGN Restaurants specifically, since it is the one product actually
sharing an origin with the marketing site. For the other two, the equivalent
is an **external redirect to that product's own `application_url`**, carrying
the same product-context convention as a query string that product's own app
must be updated to read — e.g. `https://store.wegn.example/?intent=signup&product=wegn-store`.
This is why `registration_route` in §5's catalog is deliberately modeled as
"wherever that product wants it to be," not a hardcoded path assumption.

### What "the selected product must be preserved" requires, concretely

1. **Validated against the catalog** — the marketing site never constructs a
   registration link from a client-editable value; it looks up the product by
   slug from the §5 catalog response and only proceeds if that product's
   `acquisition_mode` is `self_service`.
2. **Shown clearly on the registration page** — this is the one requirement
   that's already partly true for WEGN Restaurants (nothing prevents adding a
   "You're signing up for WEGN Restaurants" line) but is currently false —
   `RegisterPage.tsx` shows no product context today at all, even though only
   one product is possible.
3. **Preserved through authentication** — since each product owns its own
   Supabase Auth project, "the product" is implicit the moment the visitor is
   on that product's own registration page; nothing needs to be threaded
   through auth itself. The risk is earlier — losing the context *before* the
   redirect, not during auth.
4. **Recorded with the customer/business** — each product's own tenant-creation
   call site already does this implicitly (a business row created inside WEGN
   Store's database is definitionally a WEGN Store business). No new field is
   needed for this reason alone.
5. **Sent safely to WSMS** — already true today, per Part 3 of the integration
   pattern doc: a product's secret can only ever authenticate as that product,
   so WSMS never has to be told which product a registration is for by a
   trustable-or-not client value — the secret itself proves it.
6. **Used by the correct provisioning workflow** — automatically true, since
   provisioning is product-owned code, not a shared dispatcher.
7. **Preserved through onboarding** — moot until onboarding exists (§9), but
   the design principle carries forward: onboarding lives inside the product
   that just provisioned the tenant, not in a shared cross-product wizard.

### Server-side price resolution (explicit, since this was flagged as a risk to avoid)

At no point does any client-supplied price or trial-length value get written
anywhere. The marketing site's catalog *read* is public, but every *write*
(`self-register-subscription`) has never taken a price parameter — it already
resolves the plan and trial length from WSMS's own `plans`/`products` rows by
`product_key`, server-side, today. This part of the architecture does not need
to change; it needs its *inputs* (the actual row values) corrected — see §7.

---

## 7. WSMS integration requirements

1. **Correct the two known pricing/trial discrepancies before any public CTA
   points at them:**
   - QRBooker/QRWegn's placeholder `500 ETB` plans (from
     `20260720_register_qrbooker_qrwegn.sql`) must be updated to the approved
     3,000 Br (WEGN Restaurants) and 1,500 Br (WEGN Appointments) — this is a
     `plans` row update via Platform Admin's existing `update-plan` Authorized
     Operation, not a new capability.
   - `products.default_trial_days` must be explicitly verified (and set to 30
     if it isn't already) for all three products — currently defaults to 14
     unless a product's row overrides it, and no migration was found setting
     it to 30 for any product.
   - Wegn Store's actual registered price must be read directly from WSMS
     (via Platform Admin, since no local migration records it) and confirmed
     against 4,000 Br before any CTA relies on it.
2. **Add the public catalog read endpoint** described in §5 — the only net-new
   WSMS capability this design requires.
3. **No change to the existing security boundaries** — `self-register-subscription`
   and `check-entitlement` remain the only two capabilities any product secret
   is ever granted (`WSMS_PRODUCT_INTEGRATION_PATTERN.md` Part 3, item 7,
   explicitly says a new special-case endpoint should not be added per-product;
   the public catalog read is shared infrastructure, not a special case, and
   should be built once, generically).
4. **A future product needs exactly the same two integration points every
   current product already uses** (`self-register-subscription`,
   `check-entitlement`) plus one row each in `products` and `plans` with the
   new public-facing columns filled in — this is what "support additional WEGN
   products without rebuilding registration each time" concretely means once
   §5's catalog exists.

---

## 8. Product-specific provisioning requirements

No shared "provisioning handler" needs to be built as a piece of dispatch
code — provisioning is, and should remain, product-owned:

- **WEGN Restaurants:** already correct in shape (ownership-verified business
  insert → fire-and-forget WSMS registration). Only needs: a product-context
  field read from the incoming `?product=` param (validated against the
  catalog, not trusted blindly) and the stale `plan: "starter"` write removed
  entirely — WSMS is the plan authority now, the product's own `businesses`
  row does not need to duplicate it.
- **WEGN Store:** needs `AuthGate.tsx` to gain a query-param bootstrap
  (`?intent=signup&product=wegn-store`, or similar) that forces `mode="signup"`
  on mount and displays the confirmed product/price. This is real, scoped,
  Store-repo work — not something the marketing site can do on Store's behalf.
- **WEGN Appointments:** cannot be scoped precisely without repo access;
  provisionally the same shape as WEGN Restaurants, since it shares that
  product's registration architecture per `WSMS_PRODUCT_INTEGRATION_PATTERN.md`'s
  own account of QRWegn being "copied from QRBooker's finished code." Must be
  confirmed by someone with access to that repository before being scoped as
  an implementation task.

---

## 9. Onboarding design

None of the three products has a confirmed, working onboarding stage today —
this is not a regression to fix, it is a stage that has never existed. Given
that, the recommendation is to **not** build a shared cross-product onboarding
system (it would face the exact same "three different app architectures"
problem as registration, for a much less standardized surface — first-run
setup is inherently product-specific: a restaurant's first run is "add your
menu," a store's is "add your first product," an appointments business's is
"set your available hours"). Each product should own a minimal first-run
experience inside its own dashboard, gated on "this tenant has zero
[menu items / products / staff]," not on a separate route or a shared wizard.
`registration_route`/`onboarding_route` in §5's catalog exist so the marketing
site can *link* correctly once each product builds this, not so the marketing
site can *implement* it for them.

---

## 10. Access-control and suspension behavior

No change recommended here. This is a deliberate, already-documented,
cross-product Phase-1 decision (subscription status is informational-only
everywhere — see `WSMS_PRODUCT_INTEGRATION_PATTERN.md` Part 4) and revisiting
it is explicitly called out there as "pending a separate, explicit future
design freeze." This document does not reopen that decision.

---

## 11. Transitional CTA behavior (public website, today)

Per product, driven by the readiness classification in §2:

| Product | CTA | Destination |
|---|---|---|
| WEGN Restaurants | `Start Free 30-Day Trial` | `/register` — but only after removing the stale `plan: "starter"` write and adding visible product confirmation, and after §7's trial-length verification |
| WEGN Store | `Request Setup` (or `Talk to WEGN`) | `/contact?product=wegn-store&intent=setup` |
| WEGN Appointments | `Request Setup` (or `Talk to WEGN`) | `/contact?product=wegn-appointments&intent=setup` |

The Contact page should read `product` and `intent` from the query string and
visibly display them back ("You're asking about WEGN Store — Setup") so a
human answering the message has the context immediately, without asking the
visitor to repeat it. This is a small, additive change to `ContactPage.tsx`
(currently fully static) and does not require any of the registration/WSMS
work above to ship first — it can be the very first thing implemented, since
it only ever improves on the current silent `/contact` dead-end.

**Do not present `Start Free 30-Day Trial` for WEGN Store or WEGN
Appointments until each has:** a real deep-link/bootstrap into its own
registration surface, and a WSMS-registered price confirmed to match what the
marketing site would promise.

---

## 12. Database / schema implications

- **WSMS `products` table:** add `public_name`, `description`,
  `acquisition_mode`, `registration_route`, `onboarding_route`,
  `application_url` (all nullable/optional, additive, non-breaking to every
  existing consumer since nothing currently reads these columns).
- **WSMS `products.status`:** either extend the `CHECK` constraint to add
  `unavailable`, or treat `acquisition_mode = 'unavailable'` as sufficient and
  leave `status` as-is — a product-owner call, not a technical requirement
  either way.
- **No change to `plans`, `tenants`, `subscriptions`, or `subscription_events`**
  — their shape already supports everything this design needs; only their
  *data* (the QRBooker/QRWegn placeholder prices) needs correcting.
- **No change to any product's own database** — `businesses` tables stay
  exactly as they are, in every repo. WEGN Restaurants' `RegisterPage.tsx`
  stops *writing* a `plan` value, but that's an application-code change, not a
  schema one (the column can stay for backward read-compatibility with
  existing rows, simply unused going forward — a decision for whoever
  implements this, not this document).

---

## 13. Security risks

1. **Client-supplied product/price trust.** Already correctly designed against
   at the WSMS write layer (secret-scoped, server-resolved). The *new* surface
   this design adds — the public catalog read and the query-param product
   context on redirect — must never be treated as authoritative by anything
   that writes data. The catalog read is public precisely because it is
   read-only; nothing downstream should skip re-validating the product slug
   against it.
2. **Open-redirect shape.** Redirecting to `application_url` read from a
   catalog response is safe only if that catalog is itself trusted (it's a
   same-origin-to-WSMS, server-controlled value, not user input) — but the
   implementation must resist a scenario where a manipulated query string
   could redirect a visitor somewhere the catalog didn't actually specify.
   Validate the target product slug against the catalog first, then use
   *that* record's URL — never construct a redirect URL from raw query input.
3. **Cross-product secret discipline must not weaken.** Nothing in this design
   asks any product to hold another product's secret, or asks the marketing
   site to hold any WSMS secret at all (the new catalog endpoint is
   deliberately unauthenticated-read, not secret-gated) — this preserves
   ADR-0001's boundaries rather than testing them.
4. **The Contact-page context-passing in §11 is display-only.** `product` and
   `intent` query params must be treated as untrusted display strings (escaped
   normally, as React already does by default) — never used to look up or
   trigger anything server-side beyond showing them back to a human.

---

## 14. Migration considerations

- **WSMS plan-price correction (§7)** is the one change with real operational
  stakes if sequenced wrong: correcting QRBooker/QRWegn's placeholder price
  *before* any real customer has signed up against it is low-risk (2 + 10
  existing subscriptions are already `trialing`/real, not placeholder test
  data — changing the *plan's* listed price doesn't retroactively change
  their `subscriptions.current_period_end` or bill anyone differently under
  today's Phase-1 informational-only enforcement, but it does mean the next
  person to look at Platform Admin's Billing page sees the corrected number
  going forward). No rollback complexity — it's a single `update-plan` call
  per product.
- **No migration is required for the catalog columns** beyond the additive
  `ALTER TABLE` in §12 — no backfill needed for the two products not yet
  scoped for self-service (their `acquisition_mode` simply starts as
  `assisted` or `unavailable`).
- **No data migration is required for existing WEGN Restaurants businesses**
  — the stale `plan: "starter"` values already written can stay as historical
  data; only new writes stop happening.

---

## 15. Recommended implementation phases

1. **Phase 1 (see exact scope below).**
2. **Phase 2 — WSMS pricing correction + public catalog endpoint.** Update
   QRBooker/QRWegn's placeholder plans, confirm Wegn Store's, verify/set
   `default_trial_days` to 30 across all three, build and deploy the new
   public catalog read endpoint.
3. **Phase 3 — WEGN Restaurants registration cleanup.** Add product
   confirmation UI to `/register`, remove the stale `plan` write, wire the
   marketing site's Pricing/product-page CTAs to read from the new catalog
   endpoint instead of the local `api/pricing.ts` adapter.
4. **Phase 4 — WEGN Store deep-link bootstrap.** `AuthGate.tsx` reads
   `?intent=signup&product=wegn-store`, forces signup mode, displays confirmed
   product/price from the catalog. Marketing site's WEGN Store CTA upgrades
   from "Request Setup" to "Start Free 30-Day Trial."
5. **Phase 5 — WEGN Appointments,** scoped only once its actual repository and
   registration surface can be directly inspected — cannot be sequenced
   precisely today.
6. **Phase 6 — Onboarding,** per product, per §9 — independent of the above,
   can happen any time after a given product is self-service-ready.

---

## 16. Exact Phase 1 scope

Everything in this phase is additive, low-risk, and requires no WSMS pricing
correction to be safe — it can start immediately after product-owner approval
of this document:

1. **`ContactPage.tsx`** (marketing site): read `?product=` and `?intent=`
   from the URL, display them back visibly ("You're asking about WEGN Store —
   Setup"). No backend change.
2. **WEGN Store and WEGN Appointments product-page/Pricing-page CTAs**
   (marketing site): change destination from `/contact` (no context) to
   `/contact?product=<slug>&intent=setup`, and change label from
   "Get Started..." / "Ask about..." to "Request Setup" or "Talk to WEGN," per
   §11 — this alone stops the marketing site from silently discarding product
   context, without waiting on any other phase.
3. **Do not touch WEGN Restaurants' CTA or `/register` yet** — it stays exactly
   as it is until Phase 3, since it is the one path that currently works
   end-to-end and nothing here should risk it.
4. **No WSMS change in this phase.** Phase 1 is entirely marketing-site copy
   and query-string plumbing; it does not require, and should not attempt, any
   pricing correction, catalog endpoint, or other-repo change.

This document itself, plus the above, are the only Phase 1 deliverables. No
code was written as part of producing this document.
