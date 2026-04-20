ALTER TABLE public.vitrine_hero_banners
ADD COLUMN IF NOT EXISTS schedule_start_at timestamptz,
ADD COLUMN IF NOT EXISTS schedule_end_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_hero_banners_schedule
ON public.vitrine_hero_banners (schedule_start_at, schedule_end_at);