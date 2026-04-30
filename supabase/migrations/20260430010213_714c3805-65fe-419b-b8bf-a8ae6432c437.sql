-- Add area_id to tracks
ALTER TABLE public.tracks ADD COLUMN area_id UUID REFERENCES public.areas(id);

-- Add area_id to categories
ALTER TABLE public.categories ADD COLUMN area_id UUID REFERENCES public.areas(id);

-- Set default area for existing tracks and categories
-- We'll use the existing area ID found earlier: f448280a-fcba-47f6-b3eb-6fda725987e0
UPDATE public.tracks SET area_id = 'f448280a-fcba-47f6-b3eb-6fda725987e0' WHERE area_id IS NULL;
UPDATE public.categories SET area_id = 'f448280a-fcba-47f6-b3eb-6fda725987e0' WHERE area_id IS NULL;

-- Make area_id NOT NULL for future records (optional, but good for integrity)
-- ALTER TABLE public.tracks ALTER COLUMN area_id SET NOT NULL;
-- ALTER TABLE public.categories ALTER COLUMN area_id SET NOT NULL;

-- Update RLS for tracks
DROP POLICY IF EXISTS "Authenticated can read active tracks" ON public.tracks;
CREATE POLICY "Authenticated can read active tracks by membership" ON public.tracks
FOR SELECT
TO authenticated
USING (
  is_active = true 
  AND (
    EXISTS (
      SELECT 1 FROM public.memberships 
      WHERE memberships.area_id = tracks.area_id 
      AND memberships.user_id = auth.uid()
    )
    OR 
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  )
);

-- Update RLS for categories
DROP POLICY IF EXISTS "Anyone authenticated can view categories" ON public.categories;
CREATE POLICY "Authenticated can view categories by membership" ON public.categories
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.memberships 
    WHERE memberships.area_id = categories.area_id 
    AND memberships.user_id = auth.uid()
  )
  OR 
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);
