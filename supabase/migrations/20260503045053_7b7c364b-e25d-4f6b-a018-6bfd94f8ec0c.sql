-- Revoke execute from public on sensitive functions
REVOKE EXECUTE ON FUNCTION public.process_webhook_payment() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.delete_user_account() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.delete_user_account_v2(uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_analytics_summary(integer, uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_hero_banner_metrics(integer) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.log_user_role_changes() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC;

-- Grant execute to specific roles
GRANT EXECUTE ON FUNCTION public.process_webhook_payment() TO service_role;
GRANT EXECUTE ON FUNCTION public.delete_user_account() TO authenticated;
GRANT EXECUTE ON FUNCTION public.delete_user_account_v2(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_analytics_summary(integer, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_hero_banner_metrics(integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_user_role_changes() TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;
