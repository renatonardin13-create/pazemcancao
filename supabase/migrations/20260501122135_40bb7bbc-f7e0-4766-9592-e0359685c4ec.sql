-- Revoke execute from public for sensitive functions
REVOKE ALL ON FUNCTION public.is_admin(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_hero_banner_metrics(integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_analytics_summary(integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.log_user_role_changes() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.sync_course_total_lessons() FROM PUBLIC;

-- Grant execute only to necessary roles
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_hero_banner_metrics(integer) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_analytics_summary(integer) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.log_user_role_changes() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.sync_course_total_lessons() TO authenticated, service_role;

-- Ensure SECURITY DEFINER functions are as safe as possible
-- (They already have SET search_path TO 'public', which is good)
