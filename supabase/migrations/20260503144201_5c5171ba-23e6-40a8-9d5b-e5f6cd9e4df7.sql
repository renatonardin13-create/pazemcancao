-- 1. sync_course_total_lessons
ALTER FUNCTION public.sync_course_total_lessons() SET search_path = public;

-- 2. get_analytics_summary (Overloaded)
ALTER FUNCTION public.get_analytics_summary(integer) SET search_path = public;
REVOKE EXECUTE ON FUNCTION public.get_analytics_summary(integer) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_analytics_summary(integer) FROM authenticated;

ALTER FUNCTION public.get_analytics_summary(integer, uuid) SET search_path = public;
REVOKE EXECUTE ON FUNCTION public.get_analytics_summary(integer, uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_analytics_summary(integer, uuid) FROM authenticated;

-- 3. is_admin
ALTER FUNCTION public.is_admin(uuid) SET search_path = public;

-- 4. redact_json
ALTER FUNCTION public.redact_json(jsonb) SET search_path = public;

-- 5. delete_user_account
ALTER FUNCTION public.delete_user_account() SET search_path = public;
REVOKE EXECUTE ON FUNCTION public.delete_user_account() FROM PUBLIC;

-- 6. process_webhook_payment
ALTER FUNCTION public.process_webhook_payment() SET search_path = public;
REVOKE EXECUTE ON FUNCTION public.process_webhook_payment() FROM PUBLIC;

-- 7. get_hero_banner_metrics
ALTER FUNCTION public.get_hero_banner_metrics(integer) SET search_path = public;
REVOKE EXECUTE ON FUNCTION public.get_hero_banner_metrics(integer) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_hero_banner_metrics(integer) FROM authenticated;

-- 8. increment_course_access
ALTER FUNCTION public.increment_course_access(uuid) SET search_path = public;

-- 9. delete_user_account_v2
ALTER FUNCTION public.delete_user_account_v2(uuid) SET search_path = public;
REVOKE EXECUTE ON FUNCTION public.delete_user_account_v2(uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.delete_user_account_v2(uuid) FROM authenticated;

-- 10. handle_updated_at
ALTER FUNCTION public.handle_updated_at() SET search_path = public;

-- 11. is_area_member
ALTER FUNCTION public.is_area_member(uuid) SET search_path = public;

-- 12. has_role
ALTER FUNCTION public.has_role(uuid, app_role) SET search_path = public;

-- 13. update_updated_at_column
ALTER FUNCTION public.update_updated_at_column() SET search_path = public;

-- 14. handle_new_user
ALTER FUNCTION public.handle_new_user() SET search_path = public;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM authenticated;

-- 15. log_user_role_changes
ALTER FUNCTION public.log_user_role_changes() SET search_path = public;
REVOKE EXECUTE ON FUNCTION public.log_user_role_changes() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.log_user_role_changes() FROM authenticated;
