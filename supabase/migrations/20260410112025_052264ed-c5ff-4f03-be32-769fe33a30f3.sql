
CREATE TABLE public.course_integrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  is_enabled BOOLEAN NOT NULL DEFAULT false,
  platform TEXT NOT NULL DEFAULT 'hotmart',
  external_product_id TEXT,
  external_product_name TEXT,
  checkout_url TEXT,
  notes TEXT,
  webhook_active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(course_id)
);

ALTER TABLE public.course_integrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage course integrations"
  ON public.course_integrations FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
