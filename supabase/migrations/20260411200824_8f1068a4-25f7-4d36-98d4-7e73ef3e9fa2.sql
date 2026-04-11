
ALTER TABLE public.content_items
ADD COLUMN release_days integer DEFAULT NULL;

COMMENT ON COLUMN public.content_items.release_days IS 'Number of days after buyer creation date to unlock this content. NULL means immediate access for buyers.';
