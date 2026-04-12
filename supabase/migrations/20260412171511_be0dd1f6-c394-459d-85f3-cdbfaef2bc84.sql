-- Shelves table
CREATE TABLE public.shelves (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  mode text NOT NULL DEFAULT 'manual',
  auto_criteria text DEFAULT 'recent',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.shelves ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage shelves"
  ON public.shelves FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone authenticated can view active shelves"
  ON public.shelves FOR SELECT TO authenticated
  USING (is_active = true);

CREATE TRIGGER update_shelves_updated_at
  BEFORE UPDATE ON public.shelves
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Shelf-courses junction table
CREATE TABLE public.shelf_courses (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  shelf_id uuid NOT NULL REFERENCES public.shelves(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (shelf_id, course_id)
);

ALTER TABLE public.shelf_courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage shelf courses"
  ON public.shelf_courses FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone authenticated can view shelf courses"
  ON public.shelf_courses FOR SELECT TO authenticated
  USING (true);