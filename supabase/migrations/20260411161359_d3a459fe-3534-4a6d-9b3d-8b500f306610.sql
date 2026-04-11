
-- Play logs table
CREATE TABLE public.play_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  track_id UUID NOT NULL,
  played_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  duration_seconds INTEGER NOT NULL DEFAULT 0
);

ALTER TABLE public.play_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own play logs"
  ON public.play_logs FOR INSERT
  TO authenticated
  WITH CHECK (email = (SELECT (auth.jwt() ->> 'email'::text)));

CREATE POLICY "Admins can view all play logs"
  ON public.play_logs FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Service role manages play logs"
  ON public.play_logs FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE INDEX idx_play_logs_email ON public.play_logs(email);
CREATE INDEX idx_play_logs_track_id ON public.play_logs(track_id);
CREATE INDEX idx_play_logs_played_at ON public.play_logs(played_at);

-- Download logs table
CREATE TABLE public.download_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  track_id UUID NOT NULL,
  downloaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.download_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own download logs"
  ON public.download_logs FOR INSERT
  TO authenticated
  WITH CHECK (email = (SELECT (auth.jwt() ->> 'email'::text)));

CREATE POLICY "Admins can view all download logs"
  ON public.download_logs FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Service role manages download logs"
  ON public.download_logs FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE INDEX idx_download_logs_email ON public.download_logs(email);
CREATE INDEX idx_download_logs_track_id ON public.download_logs(track_id);
CREATE INDEX idx_download_logs_downloaded_at ON public.download_logs(downloaded_at);
