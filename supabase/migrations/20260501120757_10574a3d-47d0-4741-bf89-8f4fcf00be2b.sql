ALTER TABLE public.course_integrations 
ADD COLUMN payment_type TEXT DEFAULT 'one_time';

COMMENT ON COLUMN public.course_integrations.payment_type IS 'Type of payment: one_time or subscription';