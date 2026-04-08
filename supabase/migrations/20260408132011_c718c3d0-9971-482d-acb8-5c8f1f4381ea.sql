
-- Active sessions table for single-session enforcement
CREATE TABLE public.active_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  session_token TEXT NOT NULL,
  device_fingerprint TEXT,
  user_agent TEXT,
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_active_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_valid BOOLEAN NOT NULL DEFAULT true
);

CREATE UNIQUE INDEX idx_active_sessions_email ON public.active_sessions (email) WHERE is_valid = true;

ALTER TABLE public.active_sessions ENABLE ROW LEVEL SECURITY;

-- Only service_role can manage sessions
CREATE POLICY "Server manages sessions"
  ON public.active_sessions FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Authenticated users can read their own session
CREATE POLICY "Users can view own session"
  ON public.active_sessions FOR SELECT
  TO authenticated
  USING (email = (SELECT auth.jwt() ->> 'email'));

-- Allow service_role insert on user_access_logs (add if not exists pattern)
-- Also allow authenticated users to insert their own logs
CREATE POLICY "Authenticated can insert own logs"
  ON public.user_access_logs FOR INSERT
  TO authenticated
  WITH CHECK (email = (SELECT auth.jwt() ->> 'email'));
