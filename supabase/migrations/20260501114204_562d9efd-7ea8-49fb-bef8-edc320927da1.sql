-- Create audit_logs table
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    action TEXT NOT NULL,
    entity_type TEXT,
    entity_id UUID,
    details JSONB DEFAULT '{}'::jsonb,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can see audit logs
CREATE POLICY "Admins can view audit logs"
ON public.audit_logs
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = auth.uid() AND role = 'admin'
    )
);

-- Function to log user role changes
CREATE OR REPLACE FUNCTION public.log_user_role_changes()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.audit_logs (
        user_id,
        action,
        entity_type,
        entity_id,
        details
    ) VALUES (
        auth.uid(),
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

-- Trigger for user_roles
CREATE TRIGGER trigger_audit_user_roles
AFTER INSERT OR UPDATE OR DELETE ON public.user_roles
FOR EACH ROW EXECUTE FUNCTION public.log_user_role_changes();
