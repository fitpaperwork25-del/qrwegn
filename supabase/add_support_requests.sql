-- Client lockout/support requests, submitted from the login page while
-- logged out. Write-only from the client's side — nothing here is
-- readable except by the service-role key (used server-side by a future
-- Platform Admin-facing endpoint). Idempotent — safe to re-run.

CREATE TABLE IF NOT EXISTS public.support_requests (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT        NOT NULL,
  business_name TEXT,
  problem_type  TEXT        NOT NULL DEFAULT 'locked_out'
                             CHECK (problem_type IN ('locked_out', 'other')),
  message       TEXT,
  status        TEXT        NOT NULL DEFAULT 'new'
                             CHECK (status IN ('new', 'resolved')),
  source        TEXT        NOT NULL DEFAULT 'qrwegn_login',
  user_agent    TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_support_requests_status
  ON public.support_requests(status, created_at DESC);

-- Reuses the existing set_updated_at() trigger function (schema.sql,
-- already applied for orders) rather than redefining it.
DROP TRIGGER IF EXISTS support_requests_set_updated_at ON public.support_requests;
CREATE TRIGGER support_requests_set_updated_at
  BEFORE UPDATE ON public.support_requests
  FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

ALTER TABLE public.support_requests ENABLE ROW LEVEL SECURITY;

-- Anyone (logged out) can submit a request. Scoped so a submission can
-- only ever be inserted in its initial, unresolved state — status,
-- problem_type, and required fields are enforced at the database level
-- regardless of what a future form (or any other anon caller) sends.
DROP POLICY IF EXISTS "anon can submit support request" ON public.support_requests;
CREATE POLICY "anon can submit support request"
  ON public.support_requests
  FOR INSERT
  TO anon
  WITH CHECK (
    status = 'new'
    AND problem_type IN ('locked_out', 'other')
    AND char_length(email) > 0
    AND char_length(email) <= 320
    AND (business_name IS NULL OR char_length(business_name) <= 200)
    AND (message IS NULL OR char_length(message) <= 2000)
  );

-- No SELECT/UPDATE/DELETE policy for anon or authenticated — this table
-- is intentionally unreadable from the browser in any direction. Only
-- the service-role key (which bypasses RLS) can read or resolve
-- requests; that happens in a future QRWegn backend endpoint, never in
-- client code.

-- anon role needs table-level INSERT too; the RLS policy alone doesn't
-- grant it (same convention as add_hardware_settings.sql's authenticated
-- grant).
GRANT INSERT ON public.support_requests TO anon;

NOTIFY pgrst, 'reload schema';
