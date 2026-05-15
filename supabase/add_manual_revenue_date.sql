-- Add missing date column to manual_revenue.
-- Safe to re-run (IF NOT EXISTS).
ALTER TABLE manual_revenue ADD COLUMN IF NOT EXISTS date date;
