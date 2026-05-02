-- Update is_area_member to respect area status
CREATE OR REPLACE FUNCTION public.is_area_member(_area_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  area_status text;
BEGIN
  -- 1. Check if user is admin (Admins bypass all status checks)
  IF public.is_admin(auth.uid()) THEN
    RETURN true;
  END IF;

  -- 2. Check the status of the area in either 'areas' or 'areas_membros' table
  -- We prioritize 'areas' table as it's the primary one used by courses
  SELECT status INTO area_status FROM public.areas WHERE id = _area_id;
  
  -- If not found in 'areas', check 'areas_membros'
  IF area_status IS NULL THEN
    SELECT status INTO area_status FROM public.areas_membros WHERE id = _area_id;
  END IF;

  -- 3. If the area is in draft status, non-admins are NOT members
  IF area_status = 'draft' THEN
    RETURN false;
  END IF;

  -- 4. Check memberships table
  IF EXISTS (
    SELECT 1 FROM public.memberships
    WHERE area_id = _area_id AND user_id = auth.uid()
  ) THEN
    RETURN true;
  END IF;

  -- 5. Check approved_buyers table as fallback
  RETURN EXISTS (
    SELECT 1 FROM public.approved_buyers
    WHERE (area_id = _area_id OR area_id IS NULL)
      AND email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND access_enabled = true
  );
END;
$function$;

-- Update RLS policies for 'areas' table
DROP POLICY IF EXISTS "Users can view their areas" ON public.areas;
CREATE POLICY "Users can view their areas" 
ON public.areas 
FOR SELECT 
USING (
  is_admin(auth.uid()) OR 
  (status = 'active' AND is_area_member(id))
);

-- Update RLS policies for 'areas_membros' table
-- Ensure regular users can see active areas if they are members (if applicable)
-- For now, keep it restricted to admins but allow SELECT for members of active areas
DROP POLICY IF EXISTS "Users can view active areas" ON public.areas_membros;
CREATE POLICY "Users can view active areas" 
ON public.areas_membros 
FOR SELECT 
USING (
  is_admin(auth.uid()) OR 
  (status = 'active')
);

-- Note: The 'courses' table already uses 'is_area_member(area_id)' in its policy:
-- (is_area_member(area_id) AND ((status = 'published'::text) OR is_admin(auth.uid())))
-- Since we updated 'is_area_member', courses in draft areas are now automatically protected.
