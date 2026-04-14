-- Sync existing total_lessons
UPDATE public.courses SET total_lessons = (
  SELECT count(*) FROM public.lessons WHERE lessons.course_id = courses.id
);

-- Function to auto-sync total_lessons
CREATE OR REPLACE FUNCTION public.sync_course_total_lessons()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  IF TG_OP = 'DELETE' OR TG_OP = 'UPDATE' THEN
    UPDATE public.courses SET total_lessons = (
      SELECT count(*) FROM public.lessons WHERE lessons.course_id = OLD.course_id
    ) WHERE id = OLD.course_id;
  END IF;

  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE public.courses SET total_lessons = (
      SELECT count(*) FROM public.lessons WHERE lessons.course_id = NEW.course_id
    ) WHERE id = NEW.course_id;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Trigger on lessons table
CREATE TRIGGER trg_sync_course_total_lessons
AFTER INSERT OR UPDATE OF course_id OR DELETE ON public.lessons
FOR EACH ROW EXECUTE FUNCTION public.sync_course_total_lessons();