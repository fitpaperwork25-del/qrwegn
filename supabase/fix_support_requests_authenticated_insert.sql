-- Fix: support_requests INSERT policy only covered `anon`. A signed-in
-- browser session (e.g. a staff member on a shared device, or anyone
-- whose session persisted from an earlier magic-link sign-in) submits
-- requests as `authenticated`, not `anon` — the shared Supabase client
-- always attaches whatever session it currently holds. With no matching
-- policy for `authenticated`, those inserts were denied with the same
-- generic RLS error as a malformed anon request.
--
-- Fix: extend the existing policy to also cover `authenticated`, with
-- the identical WITH CHECK protections — nothing about what's a valid
-- row changes, only who is allowed to submit one. Does not edit
-- add_support_requests.sql in place (already applied/committed); this is
-- a separate, idempotent fix migration, matching this repo's existing
-- fix_*.sql convention (see fix_businesses_rls.sql, fix_tab_item_rls.sql).

DROP POLICY IF EXISTS "anon can submit support request" ON public.support_requests;
CREATE POLICY "anon can submit support request"
  ON public.support_requests
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    status = 'new'
    AND problem_type IN ('locked_out', 'other')
    AND char_length(email) > 0
    AND char_length(email) <= 320
    AND (business_name IS NULL OR char_length(business_name) <= 200)
    AND (message IS NULL OR char_length(message) <= 2000)
  );

-- Table-level grant, same reasoning as the original anon grant — the RLS
-- policy alone doesn't grant table access.
GRANT INSERT ON public.support_requests TO authenticated;

-- Still no SELECT/UPDATE/DELETE policy or grant for anon or authenticated
-- — unchanged, intentionally absent.

NOTIFY pgrst, 'reload schema';
