REVOKE EXECUTE ON FUNCTION public.delete_user_account_v2(UUID) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.delete_user_account_v2(UUID) FROM anon;
REVOKE EXECUTE ON FUNCTION public.delete_user_account_v2(UUID) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.delete_user_account_v2(UUID) TO service_role;
