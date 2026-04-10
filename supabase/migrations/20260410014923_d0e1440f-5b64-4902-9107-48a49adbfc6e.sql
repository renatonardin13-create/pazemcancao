CREATE POLICY "Admins can update tracks"
ON storage.objects FOR UPDATE
TO authenticated
USING ((bucket_id = 'tracks'::text) AND has_role(auth.uid(), 'admin'::app_role))
WITH CHECK ((bucket_id = 'tracks'::text) AND has_role(auth.uid(), 'admin'::app_role));