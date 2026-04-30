-- Add status column to contents table
ALTER TABLE public.contents ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

-- Add updated_at column
ALTER TABLE public.contents ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_contents_updated_at ON public.contents;
CREATE TRIGGER update_contents_updated_at
    BEFORE UPDATE ON public.contents
    FOR EACH ROW
    EXECUTE PROCEDURE public.update_updated_at_column();
