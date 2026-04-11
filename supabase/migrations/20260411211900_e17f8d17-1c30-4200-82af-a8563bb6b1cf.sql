
ALTER TABLE public.content_items
ADD COLUMN is_featured boolean NOT NULL DEFAULT false,
ADD COLUMN featured_priority integer NOT NULL DEFAULT 0;
