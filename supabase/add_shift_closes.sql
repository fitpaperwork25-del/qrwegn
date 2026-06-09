-- Shift close / drawer reconciliation records.
-- Owner-only. No anon, no staff access.
-- Idempotent — safe to re-run.

CREATE TABLE IF NOT EXISTS shift_closes (
  id             UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id    UUID        NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  shift_date     DATE        NOT NULL,
  expected_cash  NUMERIC(10,2) NOT NULL,
  actual_cash    NUMERIC(10,2) NOT NULL,
  difference     NUMERIC(10,2) NOT NULL,
  tab_count      INTEGER     NOT NULL DEFAULT 0,
  total_revenue  NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_tips     NUMERIC(10,2) NOT NULL DEFAULT 0,
  note           TEXT,
  closed_by      UUID,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_shift_closes_business ON shift_closes(business_id);
CREATE INDEX IF NOT EXISTS idx_shift_closes_date     ON shift_closes(business_id, shift_date);

ALTER TABLE shift_closes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "owner can manage shift_closes" ON shift_closes;
CREATE POLICY "owner can manage shift_closes"
  ON shift_closes
  FOR ALL
  USING  (business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid()))
  WITH CHECK (business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid()));
