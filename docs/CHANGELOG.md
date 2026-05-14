# QRServe v3 — Changelog

> One entry per session. Most recent first.

---

## 2026-05-13 — Financials edit/delete + docs

- Added edit and delete buttons to manual revenue entries and expense entries in Financials tab
- Inline pre-filled edit form per row; delete requires `window.confirm`
- Fixed `manual_revenue` column name: `revenue_date` → `date` across all files
- Added Income Statement (P&L) section to Financials tab
- Created `docs/` folder with ROADMAP, OPEN_ITEMS, FUTURE_FEATURES, ARCHITECTURE, CHANGELOG

---

## 2026-05-13 — Financials tab + manual revenue

- Added Financials as 4th tab in DashboardPage
- Summary cards: Revenue (30d), Orders done, Avg order value, Net
- 7-day CSS bar chart (no library)
- Add expense inline form (category, amount, description, expense_date)
- `manual_revenue` table created in Supabase and schema.sql
- Manual revenue entry form (Dine-in / Takeout / Catering / Other)
- `add_manual_revenue.sql` migration file
- Total revenue = done orders + manual entries

---

## 2026-05-13 — StaffDashboardPage

- Built `StaffDashboardPage.tsx` — kitchen/floor tablet view
- Shows new + preparing orders for staff session business, oldest first
- Each card: table name (joined from locations), time ago, item list, total
- Status buttons: NEW / PREPARING / READY (READY removes card from list)
- Auto-refreshes every 15 seconds via `setInterval`
- Wired `/staff` route in App.tsx; removed placeholder

---

## 2026-05-13 — Orders tab upgrade

- Expandable order rows — click to show items fetched from order_items + menu_items
- Changed `expandedOrderId: string` → `expandedOrders: Set<string>` so all orders expand independently
- Status buttons: NEW (yellow) / PREPARING (orange) / READY (green) / DONE (gray)
- Clicking a status button calls Supabase update and patches local state

---

## 2026-05-13 — ScanPage fixes + router wiring

- Fixed `placeOrder`: generate order ID with `crypto.randomUUID()` before insert; removed `.select().single()`
- Category nav: added `flexWrap: 'nowrap'`, `overflowY: 'hidden'`, `WebkitOverflowScrolling: 'touch'`
- Renamed `ScanPage.jsx` → `ScanPage.tsx`, added `// @ts-nocheck`
- Wired `/scan/:bizId/:locationId` route in App.tsx

---

## 2026-05-13 — Menu tab

- Create category inline form (inserts into menu_categories)
- Add menu item form: name, price, description, category dropdown
- Items listed grouped by category with gold price
- Tab badge shows live item count
- Checklist "Add menu items" uses live menuItems state

---

## 2026-05-13 — DashboardPage + Tables tab

- Built `DashboardPage.tsx` — business header (name, plan badge, status badge), sign out
- Setup checklist (4 items, disappears when all done)
- Tables tab with "Add table" inline form → inserts into locations → refreshes list
- Each table card has "Download QR" button — generates 512px PNG via `qrcode` library
- Installed `qrcode@1.5.4` + `@types/qrcode`
- Wired `/dashboard` route; removed placeholder

---

## 2026-05-13 — RegisterPage

- Built `RegisterPage.tsx` — business name, business type dropdown, email, password
- `supabase.auth.signUp` → check `authData.session` → insert into businesses
- If no immediate session (email confirmation), uses `onAuthStateChange` to wait
- On success: `window.location.href = '/dashboard'` (full reload to pick up session)
- Renamed from `.jsx` to `.tsx` with full TypeScript types
- Wired `/register` route in App.tsx

---

## 2026-05-13 — Schema + waitlist

- Generated `supabase/schema.sql` from ARCHITECTURE.md (7 tables, indexes, RLS, triggers)
- Added waitlist section to `LandingPage.tsx` — email input → redirects to Tally form `https://tally.so/r/EkvVa4`
- Created `docs/waitlist-automation.md` (Make.com: Tally → Resend → Google Sheets)

---

## 2026-05-12 — v3 initial build

- Bootstrapped TypeScript + Vite + React 18 project (`qrserve-v3`)
- All pages scaffolded as placeholders
- `AuthGuard`, `StaffGuard`, `SessionExpired` components
- `useAuth.ts`, `useStaffAuth.ts`, `supabase.ts`, `theme.ts`
- `LoginPage.tsx`, `StaffLoginPage.tsx` fully built
- `LandingPage.tsx` built with hero, feature strip, footer
- `vercel.json` for SPA routing
- Repo pushed to `fitpaperwork25-del/qrserve-v3`
