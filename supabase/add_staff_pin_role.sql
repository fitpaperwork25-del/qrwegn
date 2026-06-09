-- Add role column to staff_pins for role-based routing.
-- Values: 'kitchen' (default) | 'server' | 'cashier'
-- Idempotent — safe to re-run.

ALTER TABLE staff_pins
  ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'kitchen'
  CHECK (role IN ('kitchen', 'server', 'cashier'));
