-- Fix Function Search Path Mutable issues
ALTER FUNCTION public.increment_course_access(uuid) SET search_path = public;
ALTER FUNCTION public.is_admin(uuid) SET search_path = public;
ALTER FUNCTION public.has_role(uuid, public.app_role) SET search_path = public;
ALTER FUNCTION public.handle_new_user() SET search_path = public;

-- Tighten Storage Policies to prevent listing
-- Bucket: covers
DROP POLICY IF EXISTS "Public can view covers" ON storage.objects;
CREATE POLICY "Public can view covers" ON storage.objects
FOR SELECT USING (
  bucket_id = 'covers' 
  AND (storage.foldername(name))[1] IS NOT NULL
);

-- Bucket: content-files
DROP POLICY IF EXISTS "Public read content files" ON storage.objects;
CREATE POLICY "Public read content files" ON storage.objects
FOR SELECT USING (
  bucket_id = 'content-files'
  AND (storage.foldername(name))[1] IS NOT NULL
);

-- Bucket: tracks (already has the condition but let's be explicit)
DROP POLICY IF EXISTS "Public can read tracks" ON storage.objects;
CREATE POLICY "Public can read tracks" ON storage.objects
FOR SELECT USING (
  bucket_id = 'tracks'
  AND (storage.foldername(name))[1] IS NOT NULL
);

-- Now implement the requested feature changes
-- Add category_id to contents table
ALTER TABLE public.contents 
ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_contents_category_id ON public.contents(category_id);
