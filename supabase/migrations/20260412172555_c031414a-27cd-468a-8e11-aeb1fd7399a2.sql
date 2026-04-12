CREATE TABLE public.lesson_materials (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lesson_id uuid NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  title text NOT NULL,
  material_type text NOT NULL DEFAULT 'file',
  url text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.lesson_materials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage lesson materials"
ON public.lesson_materials
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone authenticated can view materials of published courses"
ON public.lesson_materials
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM lessons l
    JOIN courses c ON c.id = l.course_id
    WHERE l.id = lesson_materials.lesson_id
    AND (c.status = 'published' OR has_role(auth.uid(), 'admin'::app_role))
  )
);

CREATE TRIGGER update_lesson_materials_updated_at
BEFORE UPDATE ON public.lesson_materials
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();