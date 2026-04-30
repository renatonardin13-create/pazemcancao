ALTER TABLE public.areas 
ADD COLUMN IF NOT EXISTS short_label TEXT,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft';

-- Update existing records to have a default status if needed
UPDATE public.areas SET status = 'active' WHERE status IS NULL;
