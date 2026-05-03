ALTER TABLE public.areas_membros 
ADD COLUMN IF NOT EXISTS tipo TEXT DEFAULT 'misto',
ADD COLUMN IF NOT EXISTS rotulo_curto TEXT;

-- Update existing records with a default value for tipo
UPDATE public.areas_membros SET tipo = 'misto' WHERE tipo IS NULL;
