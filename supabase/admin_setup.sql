-- Super-admin setup
-- admin_notes: one note per business, RLS-gated to fitpaperwork25@gmail.com
-- get_admin_businesses(): SECURITY DEFINER RPC that bypasses owner-only RLS
--   and returns all businesses with stats + owner email.

-- ── admin_notes ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS admin_notes (
  business_id uuid    NOT NULL PRIMARY KEY REFERENCES businesses(id) ON DELETE CASCADE,
  note        text    NOT NULL DEFAULT '',
  updated_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE admin_notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "super admin notes" ON admin_notes;
CREATE POLICY "super admin notes"
  ON admin_notes FOR ALL
  USING  ((auth.jwt() ->> 'email') = 'fitpaperwork25@gmail.com')
  WITH CHECK ((auth.jwt() ->> 'email') = 'fitpaperwork25@gmail.com');

GRANT ALL ON admin_notes TO authenticated;

-- ── get_admin_businesses() ────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION get_admin_businesses()
RETURNS TABLE (
  id                  uuid,
  name                text,
  slug                text,
  plan                text,
  subscription_status text,
  created_at          timestamptz,
  owner_email         text,
  location_count      bigint,
  menu_item_count     bigint,
  order_count         bigint
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  IF (auth.jwt() ->> 'email') IS DISTINCT FROM 'fitpaperwork25@gmail.com' THEN
    RAISE EXCEPTION 'Access denied: super-admin only';
  END IF;

  RETURN QUERY
  SELECT
    b.id,
    b.name,
    b.slug,
    b.plan,
    b.subscription_status,
    b.created_at,
    u.email::text                 AS owner_email,
    COUNT(DISTINCT l.id)::bigint  AS location_count,
    COUNT(DISTINCT mi.id)::bigint AS menu_item_count,
    COUNT(DISTINCT o.id)::bigint  AS order_count
  FROM businesses b
  LEFT JOIN auth.users u         ON u.id  = b.owner_id
  LEFT JOIN locations l          ON l.business_id = b.id
  LEFT JOIN menu_categories mc   ON mc.business_id = b.id
  LEFT JOIN menu_items mi        ON mi.category_id = mc.id
  LEFT JOIN orders o             ON o.business_id  = b.id
  GROUP BY b.id, b.name, b.slug, b.plan, b.subscription_status, b.created_at, u.email
  ORDER BY b.created_at DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION get_admin_businesses() TO authenticated;
