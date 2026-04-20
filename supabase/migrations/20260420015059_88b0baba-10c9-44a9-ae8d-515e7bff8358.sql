CREATE TABLE IF NOT EXISTS public.hero_banner_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  banner_id uuid NOT NULL REFERENCES public.vitrine_hero_banners(id) ON DELETE CASCADE,
  event_type text NOT NULL CHECK (event_type IN ('impression', 'click')),
  cta_kind text,
  email text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_hero_banner_events_banner_type
  ON public.hero_banner_events (banner_id, event_type, created_at DESC);

ALTER TABLE public.hero_banner_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can insert hero banner events"
  ON public.hero_banner_events FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Service role manages hero banner events"
  ON public.hero_banner_events FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "Admins can view hero banner events"
  ON public.hero_banner_events FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE OR REPLACE FUNCTION public.get_hero_banner_metrics(p_days integer DEFAULT 30)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  since_date timestamptz;
  result json;
BEGIN
  since_date := now() - (p_days || ' days')::interval;
  SELECT coalesce(json_agg(row_to_json(t)), '[]'::json) INTO result
  FROM (
    SELECT
      b.id AS "bannerId",
      coalesce(b.title, 'Sem título') AS title,
      sum(CASE WHEN e.event_type = 'impression' THEN 1 ELSE 0 END)::int AS impressions,
      sum(CASE WHEN e.event_type = 'click' THEN 1 ELSE 0 END)::int AS clicks,
      CASE
        WHEN sum(CASE WHEN e.event_type = 'impression' THEN 1 ELSE 0 END) > 0
        THEN round(
          100.0 * sum(CASE WHEN e.event_type = 'click' THEN 1 ELSE 0 END)::numeric
          / sum(CASE WHEN e.event_type = 'impression' THEN 1 ELSE 0 END)::numeric
        , 2)
        ELSE 0
      END AS ctr
    FROM public.vitrine_hero_banners b
    LEFT JOIN public.hero_banner_events e
      ON e.banner_id = b.id AND e.created_at >= since_date
    GROUP BY b.id, b.title, b.sort_order
    ORDER BY b.sort_order ASC
  ) t;
  RETURN result;
END;
$$;