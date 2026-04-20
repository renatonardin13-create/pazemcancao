-- Add public title, description and display mode to shelves
ALTER TABLE public.shelves
  ADD COLUMN IF NOT EXISTS public_title text,
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS display_mode text NOT NULL DEFAULT 'auto';

-- Constrain display_mode values
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'shelves_display_mode_check'
  ) THEN
    ALTER TABLE public.shelves
      ADD CONSTRAINT shelves_display_mode_check
      CHECK (display_mode IN ('auto', 'grid', 'carousel'));
  END IF;
END $$;

-- Add is_featured flag to shelf_courses
ALTER TABLE public.shelf_courses
  ADD COLUMN IF NOT EXISTS is_featured boolean NOT NULL DEFAULT false;