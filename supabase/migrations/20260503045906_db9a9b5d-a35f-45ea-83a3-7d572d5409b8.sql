-- Add INSERT policy for tracks bucket
CREATE POLICY "Admins can upload tracks"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'tracks' AND has_role(auth.uid(), 'admin'::app_role));

-- Also add SELECT policy for tracks bucket just in case
CREATE POLICY "Public can view tracks"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'tracks');
