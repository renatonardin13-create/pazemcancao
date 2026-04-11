
-- Content items table
CREATE TABLE public.content_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  content_type TEXT NOT NULL DEFAULT 'ebook',
  cover_url TEXT,
  file_url TEXT,
  video_url TEXT,
  sales_page_url TEXT,
  is_free BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.content_items ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can see free content
CREATE POLICY "Anyone can view free content"
  ON public.content_items FOR SELECT
  TO authenticated
  USING (is_active = true AND is_free = true);

-- Approved buyers can see paid content
CREATE POLICY "Approved buyers can view paid content"
  ON public.content_items FOR SELECT
  TO authenticated
  USING (
    is_active = true AND is_free = false
    AND EXISTS (
      SELECT 1 FROM public.approved_buyers
      WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND access_enabled = true
    )
  );

-- Admins can do everything
CREATE POLICY "Admins can manage content"
  ON public.content_items FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Trigger for updated_at
CREATE TRIGGER update_content_items_updated_at
  BEFORE UPDATE ON public.content_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket for content files (PDFs, materials)
INSERT INTO storage.buckets (id, name, public) VALUES ('content-files', 'content-files', true);

-- Storage policies
CREATE POLICY "Public read content files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'content-files');

CREATE POLICY "Admins can upload content files"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'content-files' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update content files"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'content-files' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete content files"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'content-files' AND public.has_role(auth.uid(), 'admin'));
