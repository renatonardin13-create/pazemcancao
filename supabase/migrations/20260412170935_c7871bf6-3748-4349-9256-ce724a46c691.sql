-- Add origin tracking and metadata to enrollments
ALTER TABLE public.enrollments
  ADD COLUMN IF NOT EXISTS access_origin text NOT NULL DEFAULT 'manual',
  ADD COLUMN IF NOT EXISTS notes text,
  ADD COLUMN IF NOT EXISTS granted_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS email text;

-- Add index for email lookups
CREATE INDEX IF NOT EXISTS idx_enrollments_email ON public.enrollments(email);

-- Add index for course lookups
CREATE INDEX IF NOT EXISTS idx_enrollments_course_id ON public.enrollments(course_id);

-- Add unique constraint to prevent duplicate enrollments
ALTER TABLE public.enrollments
  ADD CONSTRAINT enrollments_user_course_unique UNIQUE (user_id, course_id);