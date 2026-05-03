-- Revoke public execute on all functions in public schema by default
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE EXECUTE ON FUNCTIONS FROM anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE EXECUTE ON FUNCTIONS FROM authenticated;

-- Revoke execute from public/anon on specific sensitive functions
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM public, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_hero_banner_metrics(integer) FROM public, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.log_user_role_changes() FROM public, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_analytics_summary(integer) FROM public, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_analytics_summary(integer, uuid) FROM public, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.delete_user_account_v2(uuid) FROM public, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.delete_user_account() FROM public, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.process_webhook_payment() FROM public, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.is_admin(uuid) FROM public, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.increment_course_access(uuid) FROM public, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.is_area_member(uuid) FROM public, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM public, anon, authenticated;

-- Explicitly grant to authenticated where needed
GRANT EXECUTE ON FUNCTION public.delete_user_account() TO authenticated;
GRANT EXECUTE ON FUNCTION public.delete_user_account_v2(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.increment_course_access(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_area_member(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_hero_banner_metrics(integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_analytics_summary(integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_analytics_summary(integer, uuid) TO authenticated;

-- Ensure search_path is set for all
ALTER FUNCTION public.update_updated_at_column() SET search_path = public;
ALTER FUNCTION public.handle_new_user() SET search_path = public;
ALTER FUNCTION public.get_hero_banner_metrics(integer) SET search_path = public;
ALTER FUNCTION public.log_user_role_changes() SET search_path = public;
ALTER FUNCTION public.get_analytics_summary(integer) SET search_path = public;
ALTER FUNCTION public.get_analytics_summary(integer, uuid) SET search_path = public;
ALTER FUNCTION public.delete_user_account_v2(uuid) SET search_path = public;
ALTER FUNCTION public.delete_user_account() SET search_path = public;
ALTER FUNCTION public.is_admin(uuid) SET search_path = public;
ALTER FUNCTION public.increment_course_access(uuid) SET search_path = public;
ALTER FUNCTION public.is_area_member(uuid) SET search_path = public;
ALTER FUNCTION public.has_role(uuid, app_role) SET search_path = public;
ALTER FUNCTION public.process_webhook_payment() SET search_path = public;