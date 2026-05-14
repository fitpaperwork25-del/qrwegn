-- Run this in the Supabase SQL editor to enable order cancellation.
-- Safe to re-run (all statements are idempotent).

-- 1. Add cancel_reason column
alter table orders add column if not exists cancel_reason text;

-- 2. Grant UPDATE on orders to the anon role.
--    Required so staff (PIN-authenticated, no Supabase session) can change
--    order status and cancel orders from the kitchen view.
grant update on orders to anon;

-- 3. RLS policy: allow anon to update orders (kitchen view operations).
--    The WITH CHECK restricts the new status to valid enum values only.
drop policy if exists "staff can update orders" on orders;
create policy "staff can update orders"
  on orders for update
  using (true)
  with check (status in ('new', 'preparing', 'ready', 'done', 'cancelled'));
