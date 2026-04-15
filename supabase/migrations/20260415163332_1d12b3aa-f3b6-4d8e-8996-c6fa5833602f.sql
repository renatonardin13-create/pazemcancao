-- Tabela para rastrear cliques nos cards do funil invisível
CREATE TABLE public.funnel_click_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  item_id uuid NOT NULL,
  item_type text NOT NULL DEFAULT 'course',
  funnel_context text,
  shelf_title text,
  is_locked boolean NOT NULL DEFAULT false,
  clicked_at timestamptz NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.funnel_click_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role manages funnel clicks"
  ON public.funnel_click_logs FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can insert own funnel clicks"
  ON public.funnel_click_logs FOR INSERT
  TO authenticated
  WITH CHECK (email = (SELECT (auth.jwt() ->> 'email'::text)));

CREATE POLICY "Admins can view all funnel clicks"
  ON public.funnel_click_logs FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Index for analytics queries
CREATE INDEX idx_funnel_click_logs_clicked_at ON public.funnel_click_logs (clicked_at DESC);
CREATE INDEX idx_funnel_click_logs_item ON public.funnel_click_logs (item_id, item_type);