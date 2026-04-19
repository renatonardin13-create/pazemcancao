CREATE TABLE public.impersonation_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id uuid NOT NULL,
  admin_email text NOT NULL,
  target_email text NOT NULL,
  target_user_id uuid,
  started_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz,
  ip_address text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.impersonation_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view impersonation logs"
ON public.impersonation_logs FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Service role manages impersonation logs"
ON public.impersonation_logs FOR ALL
TO service_role
USING (true) WITH CHECK (true);

CREATE INDEX idx_impersonation_logs_admin ON public.impersonation_logs(admin_user_id, started_at DESC);
CREATE INDEX idx_impersonation_logs_target ON public.impersonation_logs(target_email);