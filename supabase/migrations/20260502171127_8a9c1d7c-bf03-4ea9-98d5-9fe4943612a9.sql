-- Add branding fields to areas_membros
ALTER TABLE public.areas_membros 
ADD COLUMN IF NOT EXISTS background_color TEXT,
ADD COLUMN IF NOT EXISTS surface_color TEXT;

-- Update areas table to have surface_color if missing (it's already there based on schema query, but let's be safe)
ALTER TABLE public.areas
ADD COLUMN IF NOT EXISTS surface_color TEXT;
