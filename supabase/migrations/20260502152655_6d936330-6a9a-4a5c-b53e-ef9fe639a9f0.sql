-- Add columns to areas table
ALTER TABLE public.areas 
ADD COLUMN IF NOT EXISTS is_primary BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS product_id UUID REFERENCES public.courses(id);

-- Create an index for product_id
CREATE INDEX IF NOT EXISTS idx_areas_product_id ON public.areas(product_id);

-- Ensure only one area is primary
CREATE OR REPLACE FUNCTION public.ensure_single_primary_area()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_primary THEN
    UPDATE public.areas SET is_primary = false WHERE id != NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_ensure_single_primary_area ON public.areas;
CREATE TRIGGER tr_ensure_single_primary_area
BEFORE INSERT OR UPDATE OF is_primary ON public.areas
FOR EACH ROW
WHEN (NEW.is_primary = true)
EXECUTE FUNCTION public.ensure_single_primary_area();
