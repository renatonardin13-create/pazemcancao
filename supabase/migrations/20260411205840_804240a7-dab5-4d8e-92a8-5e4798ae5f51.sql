ALTER TABLE public.content_items
  ADD COLUMN IF NOT EXISTS journey_group text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS journey_order integer NOT NULL DEFAULT 0;