-- Refund / void foundation on tabs.
-- All fields nullable/defaulted — existing rows are unaffected.
-- Idempotent — safe to re-run.

ALTER TABLE tabs ADD COLUMN IF NOT EXISTS voided_at     TIMESTAMPTZ;
ALTER TABLE tabs ADD COLUMN IF NOT EXISTS void_reason   TEXT;
ALTER TABLE tabs ADD COLUMN IF NOT EXISTS voided_by     UUID;
ALTER TABLE tabs ADD COLUMN IF NOT EXISTS refund_amount NUMERIC(10,2) NOT NULL DEFAULT 0;
