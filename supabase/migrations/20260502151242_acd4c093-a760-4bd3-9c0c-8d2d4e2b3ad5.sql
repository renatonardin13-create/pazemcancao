-- Fix search path for internal functions
ALTER FUNCTION public.redact_json(jsonb) SET search_path = public;
ALTER FUNCTION public.delete_user_account() SET search_path = public;

-- Update delete_user_account_v2 to be more comprehensive for LGPD
CREATE OR REPLACE FUNCTION public.delete_user_account_v2(target_user_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    target_email text;
BEGIN
    -- Get user email for session cleanup
    SELECT email INTO target_email FROM auth.users WHERE id = target_user_id;

    -- Log the deletion action for auditing
    INSERT INTO public.audit_logs (user_id, action, entity_type, entity_id, details)
    VALUES (auth.uid(), 'DELETE_USER', 'user', target_user_id, jsonb_build_object('email', target_email, 'timestamp', now()));

    -- Delete from application tables
    DELETE FROM public.enrollments WHERE user_id = target_user_id;
    DELETE FROM public.lesson_progress WHERE user_id = target_user_id;
    DELETE FROM public.user_roles WHERE user_id = target_user_id;
    DELETE FROM public.profiles WHERE id = target_user_id;
    
    -- Cleanup sessions associated with this email
    IF target_email IS NOT NULL THEN
        DELETE FROM public.active_sessions WHERE email = target_email;
    END IF;

    -- Cleanup other possible tables (checking existence first to avoid errors if they were removed/renamed)
    -- Using EXECUTE for optional tables
    BEGIN
        DELETE FROM public.memberships WHERE user_id = target_user_id;
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
    
    BEGIN
        DELETE FROM public.user_favorites WHERE user_id = target_user_id;
    EXCEPTION WHEN OTHERS THEN NULL;
    END;

    BEGIN
        DELETE FROM public.community_post_likes WHERE user_id = target_user_id;
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
END;
$function$;

-- Revoke execute from public/anon for sensitive functions
REVOKE EXECUTE ON FUNCTION public.delete_user_account_v2(uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.delete_user_account_v2(uuid) FROM anon;
-- Allow authenticated if they are deleting themselves (though we use edge function with service role usually)
-- For now, let's keep it restricted to service_role and admins in the edge function logic.

-- Ensure webhook_logs RLS is strictly for admins
ALTER TABLE public.webhook_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view webhook logs" ON public.webhook_logs;
CREATE POLICY "Admins can view webhook logs" 
ON public.webhook_logs 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Service role manages webhook logs" ON public.webhook_logs;
CREATE POLICY "Service role manages webhook logs" 
ON public.webhook_logs 
FOR ALL 
TO service_role
USING (true)
WITH CHECK (true);

-- Ensure processed_webhooks is also protected
ALTER TABLE public.processed_webhooks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view processed webhooks" ON public.processed_webhooks;
CREATE POLICY "Admins can view processed webhooks" 
ON public.processed_webhooks 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Service role manages processed webhooks" ON public.processed_webhooks;
CREATE POLICY "Service role manages processed webhooks" 
ON public.processed_webhooks 
FOR ALL 
TO service_role
USING (true)
WITH CHECK (true);
