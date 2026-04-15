
-- Upsell relationships between products (courses, content_items, tracks)
CREATE TABLE public.product_upsells (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source_type TEXT NOT NULL CHECK (source_type IN ('course', 'content', 'track')),
  source_id UUID NOT NULL,
  target_type TEXT NOT NULL CHECK (target_type IN ('course', 'content', 'track')),
  target_id UUID NOT NULL,
  title TEXT,
  description TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (source_type, source_id, target_type, target_id)
);

ALTER TABLE public.product_upsells ENABLE ROW LEVEL SECURITY;

-- Admins manage upsells
CREATE POLICY "Admins manage upsells"
  ON public.product_upsells
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Authenticated users can view active upsells
CREATE POLICY "Anyone authenticated can view active upsells"
  ON public.product_upsells
  FOR SELECT
  TO authenticated
  USING (is_active = true);
