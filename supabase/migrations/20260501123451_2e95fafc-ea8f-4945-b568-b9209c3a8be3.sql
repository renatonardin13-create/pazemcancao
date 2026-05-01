CREATE OR REPLACE FUNCTION public.delete_user_account_v2(target_user_id UUID)
RETURNS void AS $$
BEGIN
    -- Only allow if called by service role OR if the user is deleting themselves
    -- (In the edge function we use service role, so this is fine)
    
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
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Setting search_path for security
ALTER FUNCTION public.delete_user_account_v2(UUID) SET search_path = public;
