-- Improve the trigger function to capture user_id better
CREATE OR REPLACE FUNCTION public.log_user_role_changes()
RETURNS TRIGGER AS $$
DECLARE
    responsible_user_id UUID;
BEGIN
    -- Try to get the user ID from the JWT claims if available
    responsible_user_id := auth.uid();
    
    INSERT INTO public.audit_logs (
        user_id,
        action,
        entity_type,
        entity_id,
        details
    ) VALUES (
        responsible_user_id,
        CASE
            WHEN TG_OP = 'INSERT' THEN 'ROLE_CREATED'
            WHEN TG_OP = 'UPDATE' THEN 'ROLE_UPDATED'
            WHEN TG_OP = 'DELETE' THEN 'ROLE_DELETED'
        END,
        'user_roles',
        COALESCE(NEW.id, OLD.id),
        jsonb_build_object(
            'old_role', CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN OLD.role ELSE NULL END,
            'new_role', CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN NEW.role ELSE NULL END,
            'target_user_id', COALESCE(NEW.user_id, OLD.user_id)
        )
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
