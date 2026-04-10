
INSERT INTO storage.buckets (id, name, public, allowed_mime_types)
VALUES ('covers', 'covers', true, ARRAY['image/png', 'image/jpeg', 'image/webp']);

CREATE POLICY "Public can view covers"
ON storage.objects FOR SELECT
USING (bucket_id = 'covers');

CREATE POLICY "Admins can insert covers"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'covers' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update covers"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'covers' AND has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (bucket_id = 'covers' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete covers"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'covers' AND has_role(auth.uid(), 'admin'::app_role));
