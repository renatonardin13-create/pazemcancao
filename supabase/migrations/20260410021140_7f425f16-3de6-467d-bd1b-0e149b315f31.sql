
-- Drop the admin-only INSERT policy
DROP POLICY IF EXISTS "Admins can upload tracks" ON storage.objects;

-- Create a new INSERT policy for all authenticated users
CREATE POLICY "Authenticated users can upload tracks"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'tracks');
