-- Hardware settings per business.
-- Owner-only. No anon access.
-- Idempotent — safe to re-run.

CREATE TABLE IF NOT EXISTS public.hardware_settings (
  id                    UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id           UUID        NOT NULL UNIQUE REFERENCES public.businesses(id) ON DELETE CASCADE,
  receipt_printer_mode  TEXT        NOT NULL DEFAULT 'browser',
  kitchen_printer_mode  TEXT        NOT NULL DEFAULT 'none',
  cash_drawer_enabled   BOOLEAN     NOT NULL DEFAULT false,
  print_strategy        TEXT        NOT NULL DEFAULT 'browser',
  local_bridge_url      TEXT,
  escpos_enabled        BOOLEAN     NOT NULL DEFAULT false,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_hardware_settings_business ON public.hardware_settings(business_id);

ALTER TABLE public.hardware_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "owner can manage hardware_settings" ON public.hardware_settings;
CREATE POLICY "owner can manage hardware_settings"
  ON public.hardware_settings
  FOR ALL
  USING  (business_id IN (SELECT id FROM public.businesses WHERE owner_id = auth.uid()))
  WITH CHECK (business_id IN (SELECT id FROM public.businesses WHERE owner_id = auth.uid()));

-- authenticated role needs table-level access; RLS policy alone is not enough.
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hardware_settings TO authenticated;

NOTIFY pgrst, 'reload schema';
