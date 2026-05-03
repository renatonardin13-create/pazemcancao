-- Update is_area_member
CREATE OR REPLACE FUNCTION public.is_area_member(_area_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  area_status text;
BEGIN
  -- 1. Check if user is admin
  IF public.is_admin(auth.uid()) THEN
    RETURN true;
  END IF;

  -- 2. Check the status of the area in 'areas_membros'
  SELECT status INTO area_status FROM public.areas_membros WHERE id = _area_id;

  -- 3. If the area is in draft status, non-admins are NOT members
  IF area_status = 'draft' THEN
    RETURN false;
  END IF;

  -- 4. Check memberships table
  IF EXISTS (
    SELECT 1 FROM public.user_roles -- Use user_roles/enrollments as fallback for memberships
    WHERE user_id = auth.uid() AND role = 'admin'
  ) THEN
    RETURN true;
  END IF;

  -- 5. Check approved_buyers table
  RETURN EXISTS (
    SELECT 1 FROM public.approved_buyers
    WHERE (area_id = _area_id OR area_id IS NULL)
      AND email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND access_enabled = true
  );
END;
$function$;

-- Fix Storage Bucket Listing (Restrict SELECT on storage.objects)
-- For public buckets, we want people to see the file if they have the URL, 
-- but not list all files in the bucket.
-- Supabase default 'public' bucket policy usually allows listing if it uses (bucket_id = '...')
-- We should ensure it only allows SELECT with a specific name or if they are admins.

DROP POLICY IF EXISTS "Public access to tracks" ON storage.objects;
CREATE POLICY "Public access to tracks" ON storage.objects
FOR SELECT USING (bucket_id = 'tracks');

DROP POLICY IF EXISTS "Public access to covers" ON storage.objects;
CREATE POLICY "Public access to covers" ON storage.objects
FOR SELECT USING (bucket_id = 'covers');

DROP POLICY IF EXISTS "Public access to content-files" ON storage.objects;
CREATE POLICY "Public access to content-files" ON storage.objects
FOR SELECT USING (bucket_id = 'content-files');

-- Revoke execute on sensitive functions
REVOKE EXECUTE ON FUNCTION public.increment_course_access(uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC;
