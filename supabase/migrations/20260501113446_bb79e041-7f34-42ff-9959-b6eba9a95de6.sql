-- Re-conceder permissões com as assinaturas corretas
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_area_member(uuid) TO authenticated, service_role;

-- get_analytics_summary (sobrecarregada)
GRANT EXECUTE ON FUNCTION public.get_analytics_summary(integer) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_analytics_summary(integer, uuid) TO authenticated, service_role;

GRANT EXECUTE ON FUNCTION public.get_hero_banner_metrics(integer) TO authenticated, service_role;

-- sync_course_total_lessons
GRANT EXECUTE ON FUNCTION public.sync_course_total_lessons() TO authenticated, service_role;

GRANT EXECUTE ON FUNCTION public.increment_course_access(uuid) TO authenticated, anon, service_role;

-- Funções de Gatilho
GRANT EXECUTE ON FUNCTION public.update_updated_at_column() TO authenticated, anon, service_role;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO authenticated, anon, service_role;

-- Proteção de Storage (repetindo para garantir que as políticas foram removidas)
DROP POLICY IF EXISTS "Public can read tracks" ON storage.objects;
DROP POLICY IF EXISTS "Public can view covers" ON storage.objects;
DROP POLICY IF EXISTS "Public read content files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can read tracks" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload tracks" ON storage.objects;
