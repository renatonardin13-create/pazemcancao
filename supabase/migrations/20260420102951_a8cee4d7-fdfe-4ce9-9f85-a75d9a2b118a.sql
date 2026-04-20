-- 1) Novos campos por banner em vitrine_hero_banners
ALTER TABLE public.vitrine_hero_banners
  ADD COLUMN IF NOT EXISTS display_mode TEXT NOT NULL DEFAULT 'auto',
  ADD COLUMN IF NOT EXISTS container_ratio TEXT NOT NULL DEFAULT 'auto',
  ADD COLUMN IF NOT EXISTS image_width INTEGER,
  ADD COLUMN IF NOT EXISTS image_height INTEGER;

-- 2) Garante registro de configuração global do hero
INSERT INTO public.platform_settings (key, value)
VALUES (
  'hero_global',
  jsonb_build_object(
    'enabled', true,
    'default_display_mode', 'auto',
    'default_container_ratio', 'auto'
  )
)
ON CONFLICT (key) DO NOTHING;