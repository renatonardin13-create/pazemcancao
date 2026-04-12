
-- Create modules table for course structure
CREATE TABLE public.modules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add module_id to lessons table (nullable to preserve existing data)
ALTER TABLE public.lessons ADD COLUMN module_id UUID REFERENCES public.modules(id) ON DELETE SET NULL;

-- Enable RLS
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;

-- Admins manage modules
CREATE POLICY "Admins manage modules"
ON public.modules
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Anyone authenticated can view modules of published courses
CREATE POLICY "Anyone authenticated can view modules of published courses"
ON public.modules
FOR SELECT
TO authenticated
USING (EXISTS (
  SELECT 1 FROM courses c
  WHERE c.id = modules.course_id
  AND (c.status = 'published' OR has_role(auth.uid(), 'admin'::app_role))
));

-- Index for performance
CREATE INDEX idx_modules_course_id ON public.modules(course_id);
CREATE INDEX idx_lessons_module_id ON public.lessons(module_id);

-- Trigger for updated_at
CREATE TRIGGER update_modules_updated_at
BEFORE UPDATE ON public.modules
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
