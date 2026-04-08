
-- Table: approved_buyers
CREATE TABLE public.approved_buyers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  order_id TEXT,
  product_name TEXT,
  status TEXT NOT NULL DEFAULT 'approved',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  access_enabled BOOLEAN NOT NULL DEFAULT true,
  first_login_at TIMESTAMP WITH TIME ZONE,
  last_login_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.approved_buyers ENABLE ROW LEVEL SECURITY;

-- Only authenticated users can read their own row
CREATE POLICY "Users can view own buyer record"
  ON public.approved_buyers FOR SELECT
  TO authenticated
  USING (email = (SELECT auth.jwt() ->> 'email'));

-- Table: user_access_logs
CREATE TABLE public.user_access_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  device_fingerprint TEXT,
  login_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_blocked BOOLEAN NOT NULL DEFAULT false,
  block_reason TEXT
);

ALTER TABLE public.user_access_logs ENABLE ROW LEVEL SECURITY;

-- Only authenticated users can view their own logs
CREATE POLICY "Users can view own access logs"
  ON public.user_access_logs FOR SELECT
  TO authenticated
  USING (email = (SELECT auth.jwt() ->> 'email'));

-- Service role (server functions) can insert logs
CREATE POLICY "Server can insert access logs"
  ON public.user_access_logs FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Service role can manage approved_buyers
CREATE POLICY "Server can manage approved buyers"
  ON public.approved_buyers FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
