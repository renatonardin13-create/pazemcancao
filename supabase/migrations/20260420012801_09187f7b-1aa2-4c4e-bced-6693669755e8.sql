ALTER TABLE public.vitrine_hero_banners
  ADD COLUMN IF NOT EXISTS image_tablet_url text,
  ADD COLUMN IF NOT EXISTS image_mobile_url text,
  ADD COLUMN IF NOT EXISTS primary_cta_type text NOT NULL DEFAULT 'url',
  ADD COLUMN IF NOT EXISTS primary_cta_target text,
  ADD COLUMN IF NOT EXISTS secondary_cta_type text NOT NULL DEFAULT 'url',
  ADD COLUMN IF NOT EXISTS secondary_cta_target text,
  ADD COLUMN IF NOT EXISTS banner_clickable boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS banner_click_type text,
  ADD COLUMN IF NOT EXISTS banner_click_target text,
  ADD COLUMN IF NOT EXISTS autoplay boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS autoplay_interval_ms integer NOT NULL DEFAULT 7000;

-- cta_type allowed values: 'url' | 'product' | 'video'
ALTER TABLE public.vitrine_hero_banners
  DROP CONSTRAINT IF EXISTS vitrine_hero_banners_primary_cta_type_check;
ALTER TABLE public.vitrine_hero_banners
  ADD CONSTRAINT vitrine_hero_banners_primary_cta_type_check
  CHECK (primary_cta_type IN ('url','product','video'));

ALTER TABLE public.vitrine_hero_banners
  DROP CONSTRAINT IF EXISTS vitrine_hero_banners_secondary_cta_type_check;
ALTER TABLE public.vitrine_hero_banners
  ADD CONSTRAINT vitrine_hero_banners_secondary_cta_type_check
  CHECK (secondary_cta_type IN ('url','product','video'));

ALTER TABLE public.vitrine_hero_banners
  DROP CONSTRAINT IF EXISTS vitrine_hero_banners_banner_click_type_check;
ALTER TABLE public.vitrine_hero_banners
  ADD CONSTRAINT vitrine_hero_banners_banner_click_type_check
  CHECK (banner_click_type IS NULL OR banner_click_type IN ('url','product','video'));