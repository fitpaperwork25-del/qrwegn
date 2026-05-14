# QRServe v3 — Architecture Reference

> Read this before touching any file. Update after every structural change.

---

## Project Identity

- **Product:** QRServe (formerly QRSolutions)
- **Repo:** `fitpaperwork25-del/qrserve-v3`
- **Live URL:** https://qrserve-v3.vercel.app *(update when deployed)*
- **Owner:** fitpaperwork25@gmail.com
- **Supabase project:** `yizvlbupvamsietgjtys`

---

## Stack

| Layer       | Technology                          |
|-------------|-------------------------------------|
| Frontend    | React 18 + Vite + TypeScript        |
| Database    | Supabase (PostgreSQL)               |
| Auth        | Supabase — email/password + magic link |
| Payments    | Stripe (live mode)                  |
| Email       | Resend                              |
| Deployment  | Vercel (auto-deploys from `main`)   |

---

## Key Routes

| Route                        | Component             | Guard        |
|------------------------------|-----------------------|--------------|
| `/`                          | LandingPage           | —            |
| `/register`                  | RegisterPage          | —            |
| `/login`                     | LoginPage             | —            |
| `/staff-login`               | StaffLoginPage        | —            |
| `/dashboard`                 | DashboardPage         | AuthGuard    |
| `/staff`                     | StaffDashboardPage    | StaffGuard   |
| `/scan/:bizId/:locationId`   | ScanPage              | —            |
| `/admin`                     | AdminPage             | AuthGuard    |

---

## Auth Flows

**Owner:** Supabase email/password → session stored in localStorage → `AuthGuard` checks `useAuth()` status.

**Staff:** Business slug + 4-digit PIN → verified against `businesses.staff_pin` → session stored in `sessionStorage` as `{ bizId, bizName, bizSlug }` → `StaffGuard` checks `getStaffSession()`.

---

## Database Tables

### `businesses`
Core business record. One row per business.
- `id` (uuid PK), `owner_id` → auth.users
- `name`, `slug` (unique), `type` (restaurant | cafe | barbershop | salon | hotel)
- `plan` (starter | pro | enterprise), `subscription_status` (active | trialing | expired | cancelled | past_due)
- `staff_pin`, `stripe_customer_id`, `stripe_subscription_id`, `current_period_end`
- `logo_url`, `hero_image_url`, `tagline`, `accent`

### `locations`
Tables, seats, rooms — one QR code per row.
- `id`, `business_id`, `name`, `label`, `slug`, `is_active`

### `menu_categories`
- `id`, `business_id`, `name`, `display_order`, `is_visible`

### `menu_items`
- `id`, `category_id`, `name`, `price`, `description`, `image_url`, `is_available`, `display_order`

### `orders`
- `id`, `location_id`, `business_id`, `total`, `status` (new | preparing | ready | done | cancelled)
- `created_at`, `updated_at`
- **NOTE:** Revenue queries should filter by `business_id` directly (v3 schema includes it).

### `order_items`
- `id`, `order_id`, `menu_item_id`, `quantity`, `unit_price`

### `business_expenses`
- `id`, `business_id`, `amount`, `category`, `description`, `expense_date` (date — NOT `date`), `created_at`

### `manual_revenue`
Owner-entered revenue not from orders (cash, catering, etc.)
- `id`, `business_id`, `amount`, `category` (Dine-in | Takeout | Catering | Other), `description`, `date` (date column), `created_at`
- Migration: `supabase/add_manual_revenue.sql`

---

## Component Map

| File                                      | Purpose                                      |
|-------------------------------------------|----------------------------------------------|
| `src/pages/LandingPage.tsx`              | Public landing + waitlist (Tally redirect)   |
| `src/pages/RegisterPage.tsx`             | Signup: auth + businesses insert             |
| `src/pages/LoginPage.tsx`                | Email/password + magic link login            |
| `src/pages/DashboardPage.tsx`            | Owner dashboard — Tables, Menu, Orders, Financials |
| `src/pages/StaffDashboardPage.tsx`       | Kitchen view — active orders, status buttons |
| `src/pages/StaffLoginPage.tsx`           | Staff PIN login                              |
| `src/pages/ScanPage.tsx`                 | Customer QR → menu → cart → order           |
| `src/components/AuthGuard.tsx`           | Redirects unauthenticated owners to /login   |
| `src/components/StaffGuard.tsx`          | Redirects unauthenticated staff to /staff-login |
| `src/components/SessionExpired.tsx`      | Shown when session token is stale            |
| `src/lib/supabase.ts`                    | Supabase client                              |
| `src/lib/useAuth.ts`                     | Owner auth hook (session, status, signOut)   |
| `src/lib/useStaffAuth.ts`                | Staff session: login, get, clear             |
| `src/constants/theme.ts`                 | Design tokens (ACCENT, BG, SURFACE, etc.)    |

---

## Design Tokens

```ts
ACCENT  = "#E8C547"  // gold
BG      = "#080808"  // near black
SURFACE = "#111111"  // card background
BORDER  = "rgba(255,255,255,0.08)"
TEXT    = "#F0EDE8"  // off white
MUTED   = "#666666"
GREEN   = "#4CAF50"
RED     = "#f44336"
```

---

## Rules for Claude Code Sessions

1. Read this file before making any changes.
2. One task per session where possible.
3. Commit immediately after each accepted change.
4. Never rename or restructure files without updating this document.
5. `business_expenses` date column is `expense_date` (not `date`).
6. `manual_revenue` date column is `date` (not `revenue_date`).
7. Order inserts must use `crypto.randomUUID()` client-side — do not use `.select().single()` to retrieve the ID.
8. Staff session is in `sessionStorage` (not `localStorage`) — use `getStaffSession()` from `useStaffAuth`.
