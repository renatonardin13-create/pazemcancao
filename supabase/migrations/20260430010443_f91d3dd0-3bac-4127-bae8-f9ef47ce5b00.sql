-- Update RLS for tracks: allow viewing even if inactive if the user is a member
DROP POLICY IF EXISTS "Authenticated can read active tracks by membership" ON public.tracks;
CREATE POLICY "Authenticated can read tracks by membership" ON public.tracks
FOR SELECT
TO authenticated
USING (
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
);
