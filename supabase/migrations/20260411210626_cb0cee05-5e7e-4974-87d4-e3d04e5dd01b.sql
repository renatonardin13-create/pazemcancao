CREATE TABLE public.user_content_progress (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email text NOT NULL,
  content_id uuid NOT NULL REFERENCES public.content_items(id) ON DELETE CASCADE,
  started_at timestamp with time zone DEFAULT now(),
  completed_at timestamp with time zone,
  last_position_seconds integer NOT NULL DEFAULT 0,
  downloaded_at timestamp with time zone,
  viewed_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (user_email, content_id)
);

ALTER TABLE public.user_content_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own progress"
  ON public.user_content_progress
  FOR SELECT
  TO authenticated
  USING (user_email = (SELECT (auth.jwt() ->> 'email'::text)));

CREATE POLICY "Users can insert own progress"
  ON public.user_content_progress
  FOR INSERT
  TO authenticated
  WITH CHECK (user_email = (SELECT (auth.jwt() ->> 'email'::text)));

CREATE POLICY "Users can update own progress"
  ON public.user_content_progress
  FOR UPDATE
  TO authenticated
  USING (user_email = (SELECT (auth.jwt() ->> 'email'::text)));

CREATE POLICY "Admins can view all progress"
  ON public.user_content_progress
  FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Service role manages progress"
  ON public.user_content_progress
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE TRIGGER update_user_content_progress_updated_at
  BEFORE UPDATE ON public.user_content_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_user_content_progress_email ON public.user_content_progress(user_email);
CREATE INDEX idx_user_content_progress_content ON public.user_content_progress(content_id);