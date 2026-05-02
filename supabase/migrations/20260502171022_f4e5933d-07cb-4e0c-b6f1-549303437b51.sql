-- 1. Fix delete_user_account to ensure authorization
CREATE OR REPLACE FUNCTION public.delete_user_account()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER -- Changed to DEFINER to allow deleting from profiles/roles
 SET search_path TO 'public'
AS $function$
DECLARE
    target_user_id UUID;
    caller_id UUID;
BEGIN
    target_user_id := auth.uid();
    caller_id := auth.uid();
    
    IF target_user_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    -- Delete from application tables
    DELETE FROM public.enrollments WHERE user_id = target_user_id;
    DELETE FROM public.memberships WHERE user_id = target_user_id;
    DELETE FROM public.user_favorites WHERE user_id = target_user_id;
    DELETE FROM public.user_content_progress WHERE user_id = target_user_id;
    DELETE FROM public.user_content_unlocks WHERE user_id = target_user_id;
    DELETE FROM public.lesson_progress WHERE user_id = target_user_id;
    DELETE FROM public.community_post_likes WHERE user_id = target_user_id;
    DELETE FROM public.community_posts WHERE author_id = target_user_id;
    DELETE FROM public.play_logs WHERE user_id = target_user_id;
    DELETE FROM public.download_logs WHERE user_id = target_user_id;
    DELETE FROM public.notifications WHERE user_id = target_user_id;
    DELETE FROM public.user_roles WHERE user_id = target_user_id;
    DELETE FROM public.profiles WHERE id = target_user_id;
    
    -- Note: We cannot delete from auth.users here easily without service_role or more complex setup.
    -- But we wipe all app data.
END;
$function$;

-- 2. Fix delete_user_account_v2 to ensure authorization
CREATE OR REPLACE FUNCTION public.delete_user_account_v2(target_user_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    target_email text;
    caller_id uuid;
BEGIN
    caller_id := auth.uid();

    -- Authorization check: Caller must be the user themselves OR an admin
    IF caller_id IS DISTINCT FROM target_user_id AND NOT public.is_admin(caller_id) THEN
        RAISE EXCEPTION 'Unauthorized: You can only delete your own account or you must be an admin.';
    END IF;

    -- Get user email for session cleanup
    SELECT email INTO target_email FROM auth.users WHERE id = target_user_id;

    -- Log the deletion action for auditing
    INSERT INTO public.audit_logs (user_id, action, entity_type, entity_id, details)
    VALUES (caller_id, 'DELETE_USER', 'user', target_user_id, jsonb_build_object('email', target_email, 'timestamp', now()));

    -- Delete from application tables
    DELETE FROM public.enrollments WHERE user_id = target_user_id;
    DELETE FROM public.lesson_progress WHERE user_id = target_user_id;
    DELETE FROM public.user_roles WHERE user_id = target_user_id;
    DELETE FROM public.profiles WHERE id = target_user_id;
    
    -- Cleanup sessions associated with this email
    IF target_email IS NOT NULL THEN
        DELETE FROM public.active_sessions WHERE email = target_email;
    END IF;

    -- Cleanup other possible tables
    DELETE FROM public.memberships WHERE user_id = target_user_id;
    DELETE FROM public.user_favorites WHERE user_id = target_user_id;
    DELETE FROM public.community_post_likes WHERE user_id = target_user_id;
END;
$function$;

-- 3. Revoke public execute from SECURITY DEFINER functions
REVOKE EXECUTE ON FUNCTION public.is_admin(uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_analytics_summary(integer) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_analytics_summary(integer, uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.increment_course_access(uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.is_area_member(uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_hero_banner_metrics(integer) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.delete_user_account_v2(uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.log_user_role_changes() FROM PUBLIC;

-- 4. Grant back to authenticated and service_role where appropriate
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_area_member(uuid) TO authenticated, anon, service_role; -- Needed for RLS
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.increment_course_access(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.delete_user_account_v2(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_analytics_summary(integer) TO authenticated, service_role; -- Internal check still exists
GRANT EXECUTE ON FUNCTION public.get_analytics_summary(integer, uuid) TO authenticated, service_role; -- Internal check still exists
GRANT EXECUTE ON FUNCTION public.get_hero_banner_metrics(integer) TO authenticated, service_role; -- Internal check still exists

-- 5. Ensure handle_new_user and log_user_role_changes can be executed by postgres/service_role
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO postgres, service_role;
GRANT EXECUTE ON FUNCTION public.log_user_role_changes() TO postgres, service_role;
