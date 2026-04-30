-- Add area_id to enrollments
ALTER TABLE public.enrollments ADD COLUMN area_id UUID REFERENCES public.areas(id);

-- Add area_id to transactions
ALTER TABLE public.transactions ADD COLUMN area_id UUID REFERENCES public.areas(id);

-- Add area_id to approved_buyers
ALTER TABLE public.approved_buyers ADD COLUMN area_id UUID REFERENCES public.areas(id);

-- Add area_id to active_sessions
ALTER TABLE public.active_sessions ADD COLUMN area_id UUID REFERENCES public.areas(id);

-- Create indexes
CREATE INDEX idx_enrollments_area_id ON public.enrollments(area_id);
CREATE INDEX idx_transactions_area_id ON public.transactions(area_id);
CREATE INDEX idx_approved_buyers_area_id ON public.approved_buyers(area_id);
CREATE INDEX idx_active_sessions_area_id ON public.active_sessions(area_id);
