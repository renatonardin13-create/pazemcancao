CREATE OR REPLACE FUNCTION public.increment_course_access(p_course_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.courses
  SET access_count = access_count + 1
  WHERE id = p_course_id;
$$;