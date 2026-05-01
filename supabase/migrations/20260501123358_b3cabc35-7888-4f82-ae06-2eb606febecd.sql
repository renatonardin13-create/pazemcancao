-- LGPD: Function to delete user account and all associated data
CREATE OR REPLACE FUNCTION public.delete_user_account()
RETURNS void AS $$
DECLARE
    target_user_id UUID;
BEGIN
    target_user_id := auth.uid();
    
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
END;
$$ LANGUAGE plpgsql SECURITY INVOKER;

-- Function to redact sensitive fields from JSONB for logging
CREATE OR REPLACE FUNCTION public.redact_json(data JSONB)
RETURNS JSONB AS $$
DECLARE
    redacted JSONB;
BEGIN
    redacted := data;
    IF redacted ? 'card_number' THEN redacted := redacted || '{"card_number": "[REDACTED]"}'; END IF;
    IF redacted ? 'cvv' THEN redacted := redacted || '{"cvv": "[REDACTED]"}'; END IF;
    IF redacted ? 'password' THEN redacted := redacted || '{"password": "[REDACTED]"}'; END IF;
    IF redacted ? 'token' THEN redacted := redacted || '{"token": "[REDACTED]"}'; END IF;
    IF redacted ? 'signature' THEN redacted := redacted || '{"signature": "[REDACTED]"}'; END IF;
    RETURN redacted;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Ensure RLS on log tables
ALTER TABLE public.webhook_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.processed_webhooks ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can view webhook logs' AND tablename = 'webhook_logs') THEN
        CREATE POLICY "Admins can view webhook logs" ON public.webhook_logs FOR SELECT USING (has_role(auth.uid(), 'admin'));
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can view processed webhooks' AND tablename = 'processed_webhooks') THEN
        CREATE POLICY "Admins can view processed webhooks" ON public.processed_webhooks FOR SELECT USING (has_role(auth.uid(), 'admin'));
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Service role full access on webhook_logs' AND tablename = 'webhook_logs') THEN
        CREATE POLICY "Service role full access on webhook_logs" ON public.webhook_logs FOR ALL USING (true) WITH CHECK (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Service role full access on processed_webhooks' AND tablename = 'processed_webhooks') THEN
        CREATE POLICY "Service role full access on processed_webhooks" ON public.processed_webhooks FOR ALL USING (true) WITH CHECK (true);
    END IF;
END $$;
