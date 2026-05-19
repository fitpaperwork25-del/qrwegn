-- get_promoter_claims() — super-admin only
-- Run in Supabase SQL editor (project yizvlbupvamsietgjtys)

CREATE OR REPLACE FUNCTION get_promoter_claims()
RETURNS TABLE (
  id               uuid,
  promoter_name    text,
  promoter_email   text,
  restaurant_email text,
  plan             text,
  commission_amount numeric,
  status           text,
  payment_method   text,
  payment_details  text,
  date_of_sale     date,
  created_at       timestamptz
)
SECURITY DEFINER SET search_path = public
LANGUAGE plpgsql AS $$
BEGIN
  IF (auth.jwt() ->> 'email') IS DISTINCT FROM 'fitpaperwork25@gmail.com' THEN
    RAISE EXCEPTION 'Access denied: super-admin only';
  END IF;
  RETURN QUERY
  SELECT
    pc.id, pc.promoter_name, pc.promoter_email, pc.restaurant_email,
    pc.plan, pc.commission_amount, pc.status,
    pc.payment_method, pc.payment_details, pc.date_of_sale, pc.created_at
  FROM promoter_claims pc
  ORDER BY pc.created_at DESC;
END;
$$;
GRANT EXECUTE ON FUNCTION get_promoter_claims() TO authenticated;
