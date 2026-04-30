-- Refine Courses Policy
DROP POLICY IF EXISTS "Users can view courses in their area" ON public.courses;
CREATE POLICY "Users can view courses in their area" 
ON public.courses 
FOR SELECT 
USING (
  is_area_member(area_id) AND (
    status = 'published' OR is_admin(auth.uid())
  )
);

-- Refine Modules Policy
DROP POLICY IF EXISTS "Users can view modules of their courses" ON public.modules;
CREATE POLICY "Users can view modules of their courses" 
ON public.modules 
FOR SELECT 
USING (
  is_admin(auth.uid()) OR 
  EXISTS (
    SELECT 1 FROM public.courses c 
    WHERE c.id = course_id 
    AND is_area_member(c.area_id)
    AND (c.status = 'published' OR is_admin(auth.uid()))
  )
);

-- Refine Lessons Policy
DROP POLICY IF EXISTS "Users can view lessons of their courses" ON public.lessons;
CREATE POLICY "Users can view lessons of their courses" 
ON public.lessons 
FOR SELECT 
USING (
  is_admin(auth.uid()) OR 
  EXISTS (
    SELECT 1 FROM public.courses c 
    WHERE c.id = course_id 
    AND is_area_member(c.area_id)
    AND (c.status = 'published' OR is_admin(auth.uid()))
  )
);
