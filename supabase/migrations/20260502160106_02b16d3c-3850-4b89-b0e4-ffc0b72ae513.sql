-- Add columns to areas_membros
ALTER TABLE public.areas_membros ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
ALTER TABLE public.areas_membros ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'pt-BR';

-- Revoke public execution with correct signatures
REVOKE EXECUTE ON FUNCTION public.log_user_role_changes() FROM public;
REVOKE EXECUTE ON FUNCTION public.get_analytics_summary(integer) FROM public;
REVOKE EXECUTE ON FUNCTION public.get_analytics_summary(integer, uuid) FROM public;
REVOKE EXECUTE ON FUNCTION public.delete_user_account_v2(uuid) FROM public;
REVOKE EXECUTE ON FUNCTION public.increment_course_access(uuid) FROM public;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM public;
REVOKE EXECUTE ON FUNCTION public.is_area_member(uuid) FROM public;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM public;

-- Grant to authenticated
GRANT EXECUTE ON FUNCTION public.get_analytics_summary(integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_analytics_summary(integer, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.increment_course_access(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_area_member(uuid) TO authenticated;
