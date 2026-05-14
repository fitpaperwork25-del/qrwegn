# QRServe — Product Roadmap

> Last updated: 2026-05-13

---

## Vision

QRServe is a multi-industry operations platform for hospitality businesses. Customers scan a QR code to browse menus, place orders, and request services. Owners manage everything — menus, tables, bookings, staff, and financials — from one dashboard.

Target verticals: restaurants, cafes, barbershops, salons, hotels.

---

## v3 — Current (In Progress)

**Goal:** Rebuild v2 in TypeScript with a clean architecture, fix core reliability issues, and ship the first paying client.

### Shipped
- TypeScript + Vite + React 18 codebase
- LandingPage with waitlist (Tally form)
- RegisterPage — Supabase auth + business row creation
- LoginPage — email/password + magic link
- DashboardPage — Tables, Menu, Orders, Financials tabs
- StaffLoginPage + StaffDashboardPage (PIN login, kitchen view, auto-refresh)
- ScanPage — customer QR scan → menu → cart → order
- Supabase schema — all core tables + RLS policies
- `manual_revenue` table + income statement
- Edit/delete on financials entries
- Waitlist section on landing page

### In Progress
- Stripe integration (checkout, webhooks, billing portal)
- Email confirmation flow
- Admin dashboard

### Remaining Before First Client
- See OPEN_ITEMS.md P0 and P1

---

## v3.1 — Stability & First Clients

- Stripe live mode verified end-to-end
- Sentry error logging
- Staging environment (Vercel preview + separate Supabase project)
- Session expiry handling
- Staff PIN uniqueness per business
- Rate limiting on scan page
- Order receipt email to customer

---

## v3.2 — Growth

- Multi-business support (one owner, multiple businesses)
- In-app onboarding checklist
- Subscription dunning + expiry emails
- Annual plan option
- CSV exports (orders, revenue)
- Menu branding (logo, accent color)
- In-app upgrade prompts

---

## v4 — Scale (see FUTURE_FEATURES.md)

- Booking system (appointments for barbershops, salons)
- Hotel room management + guest requests
- White-label / custom domain support
- Referral system
- Isolated Supabase per enterprise client
- Mobile app (React Native or PWA)

---

## Principles

1. Ship to real clients before adding features
2. Fix P0 bugs before onboarding the next client
3. One dashboard per business type — no configuration overload
4. Revenue from recurring subscriptions, not setup fees
