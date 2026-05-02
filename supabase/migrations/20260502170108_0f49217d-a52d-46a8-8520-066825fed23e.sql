-- Security Hardening: Restricted execution permissions for SECURITY DEFINER functions

-- 1. log_user_role_changes
REVOKE EXECUTE ON FUNCTION public.log_user_role_changes() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.log_user_role_changes() TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_user_role_changes() TO service_role;

-- 2. is_admin
REVOKE EXECUTE ON FUNCTION public.is_admin(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO service_role;

-- 3. get_analytics_summary
-- Signature 1: p_days integer
REVOKE EXECUTE ON FUNCTION public.get_analytics_summary(integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_analytics_summary(integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_analytics_summary(integer) TO service_role;

-- Signature 2: p_days integer, p_area_id uuid
REVOKE EXECUTE ON FUNCTION public.get_analytics_summary(integer, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_analytics_summary(integer, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_analytics_summary(integer, uuid) TO service_role;

-- 4. increment_course_access
REVOKE EXECUTE ON FUNCTION public.increment_course_access(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.increment_course_access(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.increment_course_access(uuid) TO service_role;

-- 5. delete_user_account_v2
REVOKE EXECUTE ON FUNCTION public.delete_user_account_v2(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.delete_user_account_v2(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.delete_user_account_v2(uuid) TO service_role;

-- 6. get_hero_banner_metrics
REVOKE EXECUTE ON FUNCTION public.get_hero_banner_metrics(integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_hero_banner_metrics(integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_hero_banner_metrics(integer) TO service_role;

-- 7. is_area_member
REVOKE EXECUTE ON FUNCTION public.is_area_member(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_area_member(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_area_member(uuid) TO service_role;

-- 8. has_role
-- Note: 'app_role' is a custom type, but we use the type name in the signature
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO service_role;

-- 9. handle_new_user (Trigger function)
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC;
-- Triggers run as postgres/system, so they don't need explicit authenticated grants unless also called via RPC
