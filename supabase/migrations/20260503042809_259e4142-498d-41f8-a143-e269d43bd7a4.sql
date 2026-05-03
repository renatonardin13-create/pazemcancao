ALTER TABLE public.courses DROP CONSTRAINT IF EXISTS courses_course_type_check;
ALTER TABLE public.courses ADD CONSTRAINT courses_course_type_check 
  CHECK (course_type = ANY (ARRAY['video'::text, 'ebook'::text, 'aula'::text, 'material'::text, 'bonus'::text, 'louvores'::text]));
