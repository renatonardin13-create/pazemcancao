ALTER TABLE public.lessons
ADD COLUMN content_type text NOT NULL DEFAULT 'video';

-- Backfill existing lessons based on current data
UPDATE public.lessons SET content_type = 'pdf' WHERE video_url IS NULL AND content_url IS NOT NULL AND lower(content_url) LIKE '%.pdf';
UPDATE public.lessons SET content_type = 'file' WHERE video_url IS NULL AND content_url IS NOT NULL AND content_type = 'video' AND lower(content_url) NOT LIKE '%.pdf' AND content_url NOT LIKE 'http%';
UPDATE public.lessons SET content_type = 'link' WHERE video_url IS NULL AND content_url IS NOT NULL AND content_type = 'video' AND lower(content_url) NOT LIKE '%.pdf';