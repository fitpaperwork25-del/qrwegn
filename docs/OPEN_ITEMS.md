# QRServe v3 — Open Items

> Read this before every session. Mark [x] when done. Move to Done when resolved.
> Priority: P0 = fix now, P1 = before next client, P2 = before 10 clients, P3 = growth phase.

---

## P0 — Fix Before Any Client Goes Live

- [ ] Each business must have its own unique staff PIN — no shared default
- [ ] Audit all RLS policies end to end — added reactively, may have gaps
- [ ] Delete live Stripe/API keys file from Desktop
- [ ] Verify super admin route is protected and working
- [ ] Session expiry — expired tokens hang on "Loading..." instead of showing login prompt
- [ ] `manual_revenue` migration has not been run on all environments — `noRevenueTable` fallback shown

---

## P1 — Before Next Client (Red Sea, Thirty Bales)

- [ ] Rename all remaining "QRSolutions" text to "QRServe" in UI and codebase
- [ ] Contact Red Sea and Thirty Bales owners — get real emails, complete signups
- [ ] Clean test orders from Snelling Cafe dashboard
- [ ] Fix iPhone scan page — button blinks with no feedback, needs loading state
- [ ] Add basic error logging — Sentry free tier
- [ ] Add soft deletes (`deleted_at`) on orders and menu items — hard deletes are permanent
- [ ] Add input validation on order amounts before they hit the database
- [ ] Protect menu item deletes when active orders reference them
- [ ] Add Terms of Service and Privacy Policy pages — required for Stripe
- [ ] Stripe integration verified end-to-end in v3 (checkout → webhook → status update)

---

## P2 — Before 10 Clients

- [ ] Multi-business support — one auth account owning multiple businesses with switcher
- [ ] Create staging environment on Vercel (preview branch) + separate Supabase project
- [ ] Configure Supabase backups and point-in-time recovery
- [ ] Add Stripe dunning — handle failed payments automatically
- [ ] Add subscription expiry warning emails (7 days, 3 days, day-of)
- [ ] Add client onboarding checklist inside dashboard
- [ ] Add order confirmation / receipt email to customer after placing order
- [ ] Add rate limiting on scan page — prevent order spam
- [ ] Add in-app upgrade prompt for Starter clients
- [ ] Add annual plan option in Stripe and pricing page
- [ ] Differentiate Pro vs Enterprise features in UI

---

## P3 — Growth Phase (10+ clients)

- [ ] Internal MRR / churn / signup dashboard
- [ ] Audit log — record key actions per business
- [ ] Client feedback / bug report form inside app
- [ ] In-app changelog — notify clients when features ship
- [ ] CSV export of orders and revenue for clients
- [ ] Menu branding — logo and accent color per business
- [ ] Referral / affiliate system
- [ ] Account pause/resume flow
- [ ] Account deletion with data export (GDPR)
- [ ] SLA documentation for enterprise clients

---

## Done

- [x] Supabase schema — all core tables + RLS policies
- [x] RegisterPage — auth + business insert + session guard
- [x] DashboardPage — Tables, Menu, Orders, Financials tabs
- [x] StaffDashboardPage — kitchen view, auto-refresh, status buttons
- [x] ScanPage — QR scan → menu → cart → order (crypto.randomUUID for order ID)
- [x] Manual revenue table + income statement
- [x] Edit/delete on manual revenue and expense entries
- [x] Orders tab — expandable rows (Set-based, multi-expand), status buttons
- [x] Category nav scroll fixed (flexWrap: nowrap) on ScanPage
- [x] Waitlist section on LandingPage (Tally redirect)
