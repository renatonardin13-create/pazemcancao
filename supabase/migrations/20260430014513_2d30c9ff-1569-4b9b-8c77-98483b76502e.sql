ALTER TABLE public.user_content_progress ADD COLUMN area_id UUID REFERENCES public.areas(id);
CREATE INDEX idx_user_content_progress_area_id ON public.user_content_progress(area_id);
