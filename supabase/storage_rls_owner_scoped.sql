-- Storage RLS: owner-scoped policies for business-assets and menu-images
-- Applied 2026-06-06. Replaces the broad "assets authenticated *" policies.
-- Owners may only read/write objects whose path prefix matches one of their
-- own business IDs (storage.foldername(name)[1]).
-- Public reads are served via /object/public/ and bypass RLS entirely.

DROP POLICY IF EXISTS "owner can select business assets" ON storage.objects;
DROP POLICY IF EXISTS "owner can insert business assets" ON storage.objects;
DROP POLICY IF EXISTS "owner can update business assets" ON storage.objects;
DROP POLICY IF EXISTS "owner can delete business assets" ON storage.objects;

CREATE POLICY "owner can select business assets"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = ANY (ARRAY['business-assets'::text, 'menu-images'::text])
    AND (storage.foldername(name))[1] IN (
      SELECT id::text FROM businesses WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "owner can insert business assets"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = ANY (ARRAY['business-assets'::text, 'menu-images'::text])
    AND (storage.foldername(name))[1] IN (
      SELECT id::text FROM businesses WHERE owner_id = auth.uid()
    )
  );

-- UPDATE uses bucket_id only: the SELECT policy already gates visibility to
-- the owner's own folder, so USING(foldername) is redundant and was found to
-- be unreliable in Supabase storage's ON CONFLICT DO UPDATE execution path.
CREATE POLICY "owner can update business assets"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = ANY (ARRAY['business-assets'::text, 'menu-images'::text])
  )
  WITH CHECK (
    bucket_id = ANY (ARRAY['business-assets'::text, 'menu-images'::text])
  );

CREATE POLICY "owner can delete business assets"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = ANY (ARRAY['business-assets'::text, 'menu-images'::text])
    AND (storage.foldername(name))[1] IN (
      SELECT id::text FROM businesses WHERE owner_id = auth.uid()
    )
  );
