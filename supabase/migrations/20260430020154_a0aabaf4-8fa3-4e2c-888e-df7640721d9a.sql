-- Fix shelf_courses policies
DROP POLICY IF EXISTS "Anyone authenticated can view shelf courses" ON public.shelf_courses;
CREATE POLICY "Users can view shelf_courses in their area" 
ON public.shelf_courses 
FOR SELECT 
USING (
  is_admin(auth.uid()) OR 
  EXISTS (
    SELECT 1 FROM public.shelves s 
    WHERE s.id = shelf_id AND is_area_member(s.area_id)
  )
);
