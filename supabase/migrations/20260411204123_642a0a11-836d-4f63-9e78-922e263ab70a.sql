
CREATE TABLE public.user_content_unlocks (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email text NOT NULL,
  content_id uuid NOT NULL REFERENCES public.content_items(id) ON DELETE CASCADE,
  order_id text,
  unlock_at timestamp with time zone NOT NULL,
  unlocked boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (email, content_id)
);

ALTER TABLE public.user_content_unlocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role manages unlocks"
  ON public.user_content_unlocks FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "Admins can view all unlocks"
  ON public.user_content_unlocks FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view own unlocks"
  ON public.user_content_unlocks FOR SELECT
  TO authenticated
  USING (email = (SELECT (auth.jwt() ->> 'email'::text)));

CREATE TRIGGER update_user_content_unlocks_updated_at
  BEFORE UPDATE ON public.user_content_unlocks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_user_content_unlocks_email ON public.user_content_unlocks(email);
CREATE INDEX idx_user_content_unlocks_unlock_at ON public.user_content_unlocks(unlock_at);
