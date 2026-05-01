-- Revoke public execute on sensitive functions
REVOKE EXECUTE ON FUNCTION public.get_analytics_summary(integer) FROM public, anon;
REVOKE EXECUTE ON FUNCTION public.get_analytics_summary(integer, uuid) FROM public, anon;
REVOKE EXECUTE ON FUNCTION public.is_admin(UUID) FROM public, anon;
REVOKE EXECUTE ON FUNCTION public.is_area_member(UUID) FROM public, anon;
REVOKE EXECUTE ON FUNCTION public.get_hero_banner_metrics(integer) FROM public, anon;
REVOKE EXECUTE ON FUNCTION public.has_role(UUID, app_role) FROM public, anon;

-- Set fixed search_path for SECURITY DEFINER functions
ALTER FUNCTION public.get_analytics_summary(integer) SET search_path = public;
ALTER FUNCTION public.get_analytics_summary(integer, uuid) SET search_path = public;
ALTER FUNCTION public.is_admin(UUID) SET search_path = public;
ALTER FUNCTION public.is_area_member(UUID) SET search_path = public;
ALTER FUNCTION public.get_hero_banner_metrics(integer) SET search_path = public;
ALTER FUNCTION public.has_role(UUID, app_role) SET search_path = public;
ALTER FUNCTION public.increment_course_access(UUID) SET search_path = public;
ALTER FUNCTION public.handle_new_user() SET search_path = public;

-- Tighten storage policies for tracks
DROP POLICY IF EXISTS "Public can read tracks" ON storage.objects;
CREATE POLICY "Public can read tracks" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'tracks' AND (storage.foldername(name))[1] IS NOT NULL);

DROP POLICY IF EXISTS "Authenticated users can read tracks" ON storage.objects;
CREATE POLICY "Authenticated users can read tracks" ON storage.objects
FOR SELECT TO authenticated
USING (bucket_id = 'tracks');
