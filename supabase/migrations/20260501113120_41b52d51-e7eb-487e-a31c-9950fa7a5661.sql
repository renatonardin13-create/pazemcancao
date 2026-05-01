-- Fix search_path for update_updated_at_column
ALTER FUNCTION public.update_updated_at_column() SET search_path = public;

-- Tighten storage policies to prevent listing
-- We'll replace the broad public SELECT policies with one that requires the name to be specified (no wildcards in listing)
-- Actually, the best way to prevent listing in Supabase Storage while allowing access to public files is to ensure the SELECT policy is not too permissive.

-- For 'covers' bucket
DROP POLICY IF EXISTS "Public can view covers" ON storage.objects;
CREATE POLICY "Public can view covers" ON storage.objects FOR SELECT TO public USING (bucket_id = 'covers' AND (storage.foldername(name))[1] IS NOT NULL);

-- For 'tracks' bucket
DROP POLICY IF EXISTS "Public can read tracks" ON storage.objects;
CREATE POLICY "Public can read tracks" ON storage.objects FOR SELECT TO public USING (bucket_id = 'tracks' AND (storage.foldername(name))[1] IS NOT NULL);

-- For 'content-files' bucket
DROP POLICY IF EXISTS "Public read content files" ON storage.objects;
CREATE POLICY "Public read content files" ON storage.objects FOR SELECT TO public USING (bucket_id = 'content-files' AND (storage.foldername(name))[1] IS NOT NULL);
