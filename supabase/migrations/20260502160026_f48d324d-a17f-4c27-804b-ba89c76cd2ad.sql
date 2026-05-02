-- Fix misconfigured policies that allow public access despite being named 'Service role'
DROP POLICY IF EXISTS "Service role full access on webhook_logs" ON public.webhook_logs;
CREATE POLICY "Service role full access on webhook_logs" 
ON public.webhook_logs FOR ALL 
TO service_role 
USING (true) 
WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full access on processed_webhooks" ON public.processed_webhooks;
CREATE POLICY "Service role full access on processed_webhooks" 
ON public.processed_webhooks FOR ALL 
TO service_role 
USING (true) 
WITH CHECK (true);

-- Set search_path for internal utility functions
ALTER FUNCTION public.ensure_single_primary_area() SET search_path = public;
ALTER FUNCTION public.update_updated_at_column() SET search_path = public;

-- Ensure all SECURITY DEFINER functions have a search_path
-- (Already fixed is_admin, get_hero_banner_metrics, etc. in previous migration)

-- Enable RLS on audit_logs if not already enabled
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can view audit logs" ON public.audit_logs;
CREATE POLICY "Admins can view audit logs" 
ON public.audit_logs FOR SELECT 
TO authenticated 
USING (is_admin(auth.uid()));

-- Tighten RLS on user_roles (ensure only admins can see all roles, users see only their own)
-- Existing policy "Users can view own roles" is fine.
-- Existing policy "Service role manages roles" for service_role is fine.
-- Check if there's any public SELECT policy on user_roles
DROP POLICY IF EXISTS "Enable read access for all users" ON public.user_roles;
