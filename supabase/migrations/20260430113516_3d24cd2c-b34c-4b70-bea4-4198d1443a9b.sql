CREATE OR REPLACE FUNCTION public.is_area_member(_area_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- 1. Check if user is admin
  IF public.is_admin(auth.uid()) THEN
    RETURN true;
  END IF;

  -- 2. Check memberships table
  IF EXISTS (
    SELECT 1 FROM public.memberships
    WHERE area_id = _area_id AND user_id = auth.uid()
  ) THEN
    RETURN true;
  END IF;

  -- 3. Check approved_buyers table as fallback
  RETURN EXISTS (
    SELECT 1 FROM public.approved_buyers
    WHERE (area_id = _area_id OR area_id IS NULL)
      AND email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND access_enabled = true
  );
END;
$function$;
