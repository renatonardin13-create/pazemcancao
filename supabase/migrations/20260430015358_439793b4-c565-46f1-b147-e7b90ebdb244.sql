-- Add sort_order column to contents table
ALTER TABLE public.contents 
ADD COLUMN sort_order INTEGER NOT NULL DEFAULT 0;

-- Optional: Initialize sort_order based on created_at for existing records
UPDATE public.contents
SET sort_order = sub.rn
FROM (
  SELECT id, row_number() OVER (PARTITION BY area_id ORDER BY created_at ASC) as rn
  FROM public.contents
) sub
WHERE public.contents.id = sub.id;