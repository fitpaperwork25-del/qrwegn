-- Staff attribution: who opened a tab.
-- server_id (already present) covers who closed/paid.
-- Idempotent — safe to re-run.

ALTER TABLE tabs ADD COLUMN IF NOT EXISTS opened_by_staff_id UUID;
