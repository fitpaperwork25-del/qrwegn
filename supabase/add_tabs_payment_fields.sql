-- Add payment closeout columns to tabs (missing from add_tabs.sql).
-- Idempotent: IF NOT EXISTS guards make it safe to re-run.
-- Apply in Supabase SQL editor, then reload PostgREST schema cache.

ALTER TABLE tabs ADD COLUMN IF NOT EXISTS payment_method  TEXT;
ALTER TABLE tabs ADD COLUMN IF NOT EXISTS tip_amount      NUMERIC(10,2) DEFAULT 0;
ALTER TABLE tabs ADD COLUMN IF NOT EXISTS server_id       UUID;
