
-- Create platform_modules table
CREATE TABLE public.platform_modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  enabled boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  visible_in_vitrine boolean NOT NULL DEFAULT true,
  visible_in_menu boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.platform_modules ENABLE ROW LEVEL SECURITY;

-- Admins can manage
CREATE POLICY "Admins manage platform modules"
  ON public.platform_modules FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

-- Any authenticated user can read
CREATE POLICY "Anyone authenticated can view platform modules"
  ON public.platform_modules FOR SELECT
  TO authenticated
  USING (true);

-- Trigger for updated_at
CREATE TRIGGER update_platform_modules_updated_at
  BEFORE UPDATE ON public.platform_modules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Seed default modules
INSERT INTO public.platform_modules (name, slug, enabled, sort_order, visible_in_vitrine, visible_in_menu) VALUES
  ('Vitrine',      'vitrine',      true,  0, true,  true),
  ('Louvores',     'louvores',     true,  1, true,  true),
  ('Cursos',       'cursos',       true,  2, true,  true),
  ('Ebooks',       'ebooks',       true,  3, true,  true),
  ('Trilhas',      'trilhas',      true,  4, true,  true),
  ('Perfil',       'perfil',       true,  5, false, true),
  ('Comunidade',   'comunidade',   false, 6, false, true),
  ('Bônus',        'bonus',        true,  7, true,  true),
  ('Lançamentos',  'lancamentos',  true,  8, true,  true);
