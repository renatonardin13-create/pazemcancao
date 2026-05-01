-- Revoke execute from public roles for security definer function
REVOKE EXECUTE ON FUNCTION public.log_user_role_changes() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.log_user_role_changes() FROM anon;
REVOKE EXECUTE ON FUNCTION public.log_user_role_changes() FROM authenticated;
