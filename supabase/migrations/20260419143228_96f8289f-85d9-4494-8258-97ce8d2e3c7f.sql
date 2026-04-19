-- Tabela de banners do hero da vitrine
CREATE TABLE IF NOT EXISTS public.vitrine_hero_banners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url text NOT NULL,
  title text,
  subtitle text,
  description text,
  primary_cta_label text,
  primary_cta_url text,
  secondary_cta_label text,
  secondary_cta_url text,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_vitrine_hero_banners_active_order
  ON public.vitrine_hero_banners (is_active, sort_order);

ALTER TABLE public.vitrine_hero_banners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage vitrine hero banners"
  ON public.vitrine_hero_banners
  FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Authenticated can view active hero banners"
  ON public.vitrine_hero_banners
  FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE TRIGGER update_vitrine_hero_banners_updated_at
  BEFORE UPDATE ON public.vitrine_hero_banners
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();