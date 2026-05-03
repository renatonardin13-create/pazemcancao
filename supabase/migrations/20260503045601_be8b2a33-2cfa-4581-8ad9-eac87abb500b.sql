-- Convert get_analytics_summary to SECURITY INVOKER
ALTER FUNCTION public.get_analytics_summary(integer) SECURITY INVOKER;

-- Ensure handle_new_user is safe as it's a trigger
ALTER FUNCTION public.handle_new_user() SET search_path = public;

-- Ensure log_user_role_changes is safe
ALTER FUNCTION public.log_user_role_changes() SET search_path = public;

-- Ensure delete_user_account is safe
ALTER FUNCTION public.delete_user_account() SET search_path = public;
