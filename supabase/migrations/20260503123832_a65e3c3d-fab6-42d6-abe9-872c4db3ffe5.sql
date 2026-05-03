-- handle_new_user
ALTER FUNCTION public.handle_new_user() SET search_path = public;

-- log_user_role_changes
ALTER FUNCTION public.log_user_role_changes() SET search_path = public;

-- delete_user_account
ALTER FUNCTION public.delete_user_account() SECURITY INVOKER;

-- process_webhook_payment
ALTER FUNCTION public.process_webhook_payment() SET search_path = public;

-- get_hero_banner_metrics
ALTER FUNCTION public.get_hero_banner_metrics(integer) SET search_path = public;

-- increment_course_access
ALTER FUNCTION public.increment_course_access(uuid) SET search_path = public;

-- get_analytics_summary(integer)
ALTER FUNCTION public.get_analytics_summary(integer) SET search_path = public;

-- redact_json
ALTER FUNCTION public.redact_json(jsonb) SECURITY INVOKER;

-- update_updated_at_column
ALTER FUNCTION public.update_updated_at_column() SECURITY INVOKER;
