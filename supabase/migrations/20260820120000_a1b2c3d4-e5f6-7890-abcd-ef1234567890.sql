-- Create a public bucket for product images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  true,
  5242880, -- 5 MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
);

-- Anyone can read product images (public bucket)
CREATE POLICY "Public read access for product images"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'product-images');

-- Only authenticated users with manage role can upload
CREATE POLICY "Authenticated upload for product images"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'product-images'
    AND public.can_manage(auth.uid())
  );

-- Only authenticated users with manage role can delete
CREATE POLICY "Authenticated delete for product images"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'product-images'
    AND public.can_manage(auth.uid())
  );

-- Only authenticated users with manage role can update
CREATE POLICY "Authenticated update for product images"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'product-images'
    AND public.can_manage(auth.uid())
  );
