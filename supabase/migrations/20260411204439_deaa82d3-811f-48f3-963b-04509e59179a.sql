
CREATE TABLE public.processed_webhooks (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  unique_event_id text NOT NULL,
  provider text NOT NULL DEFAULT 'kiwify',
  email text,
  event_type text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'received',
  payload jsonb,
  error_message text,
  details jsonb DEFAULT '{}'::jsonb,
  processed_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (unique_event_id, provider)
);

ALTER TABLE public.processed_webhooks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role manages processed webhooks"
  ON public.processed_webhooks FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "Admins can view processed webhooks"
  ON public.processed_webhooks FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX idx_processed_webhooks_event_id ON public.processed_webhooks(unique_event_id);
CREATE INDEX idx_processed_webhooks_email ON public.processed_webhooks(email);
CREATE INDEX idx_processed_webhooks_status ON public.processed_webhooks(status);

CREATE TRIGGER update_processed_webhooks_updated_at
  BEFORE UPDATE ON public.processed_webhooks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
