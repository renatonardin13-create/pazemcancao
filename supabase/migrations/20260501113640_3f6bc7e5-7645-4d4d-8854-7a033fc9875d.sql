-- Revogar execução pública
REVOKE EXECUTE ON FUNCTION public.increment_course_access(uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_hero_banner_metrics(integer) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.is_admin(uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_analytics_summary(integer) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_analytics_summary(integer, uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.is_area_member(uuid) FROM PUBLIC;

-- Garantir acesso a usuários autenticados
GRANT EXECUTE ON FUNCTION public.increment_course_access(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_area_member(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_analytics_summary(integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_analytics_summary(integer, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_hero_banner_metrics(integer) TO authenticated;

-- Configurar search_path
ALTER FUNCTION public.increment_course_access(uuid) SET search_path = public;
ALTER FUNCTION public.handle_new_user() SET search_path = public;
ALTER FUNCTION public.get_hero_banner_metrics(integer) SET search_path = public;
ALTER FUNCTION public.is_admin(uuid) SET search_path = public;
ALTER FUNCTION public.get_analytics_summary(integer) SET search_path = public;
ALTER FUNCTION public.get_analytics_summary(integer, uuid) SET search_path = public;
ALTER FUNCTION public.has_role(uuid, app_role) SET search_path = public;
ALTER FUNCTION public.is_area_member(uuid) SET search_path = public;