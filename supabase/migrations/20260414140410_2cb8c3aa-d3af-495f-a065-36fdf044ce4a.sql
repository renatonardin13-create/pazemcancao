ALTER TABLE public.lessons
ADD COLUMN IF NOT EXISTS thumbnail_url text,
ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'published';

UPDATE public.lessons
SET status = 'published'
WHERE status IS NULL;