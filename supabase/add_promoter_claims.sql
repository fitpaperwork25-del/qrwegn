-- promoter_claims table
-- Run in Supabase SQL editor for project yizvlbupvamsietgjtys

CREATE TABLE IF NOT EXISTS promoter_claims (
  id               uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  promoter_name    text        NOT NULL,
  promoter_email   text        NOT NULL,
  restaurant_email text        NOT NULL,
  plan             text        NOT NULL,
  commission_amount numeric(10,2) NOT NULL,
  status           text        NOT NULL DEFAULT 'approved',
  payment_method   text,
  payment_details  text,
  date_of_sale     date,
  created_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_promoter_claims_email   ON promoter_claims(promoter_email);
CREATE INDEX IF NOT EXISTS idx_promoter_claims_status  ON promoter_claims(status);
CREATE INDEX IF NOT EXISTS idx_promoter_claims_created ON promoter_claims(created_at DESC);

ALTER TABLE promoter_claims ENABLE ROW LEVEL SECURITY;
-- Service role key (used by the API endpoint) bypasses RLS for inserts.
