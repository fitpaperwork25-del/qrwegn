-- Creates fitpaperwork25@gmail.com in auth.users and inserts the QR-Wegn HQ business row.
-- Run once in Supabase SQL Editor (project yizvlbupvamsietgjtys).
-- Temp password: TempAdmin2026!  — change it immediately via /forgot-password.

DO $$
DECLARE
  new_id uuid := gen_random_uuid();
BEGIN

  -- 1. Create the auth user
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    new_id,
    'authenticated',
    'authenticated',
    'fitpaperwork25@gmail.com',
    crypt('TempAdmin2026!', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    now(),
    now(),
    '', '', '', ''
  );

  -- 2. Create the identity record (required for email sign-in)
  INSERT INTO auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at
  ) VALUES (
    new_id::text,
    new_id,
    jsonb_build_object('sub', new_id::text, 'email', 'fitpaperwork25@gmail.com'),
    'email',
    now(),
    now(),
    now()
  );

  -- 3. Insert the business row
  INSERT INTO public.businesses (
    owner_id,
    name,
    slug,
    type,
    plan,
    subscription_status
  ) VALUES (
    new_id,
    'QR-Wegn HQ',
    'qr-wegn-hq',
    'platform',
    'starter',
    'trialing'
  );

  RAISE NOTICE 'Done — user ID: %', new_id;
END $$;
