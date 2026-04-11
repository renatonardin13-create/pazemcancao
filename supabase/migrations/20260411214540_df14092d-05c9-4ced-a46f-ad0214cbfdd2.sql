-- Create journeys table
CREATE TABLE public.journeys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT DEFAULT '✨',
  description TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.journeys ENABLE ROW LEVEL SECURITY;

-- Admins manage journeys
CREATE POLICY "Admins manage journeys"
ON public.journeys FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Anyone authenticated can view journeys
CREATE POLICY "Anyone authenticated can view journeys"
ON public.journeys FOR SELECT
TO authenticated
USING (true);

-- Trigger for updated_at
CREATE TRIGGER update_journeys_updated_at
BEFORE UPDATE ON public.journeys
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default journeys
INSERT INTO public.journeys (name, slug, icon, sort_order) VALUES
  ('Comece por aqui', 'comece_por_aqui', '🌱', 0),
  ('Para dias difíceis', 'dias_dificeis', '🌧️', 1),
  ('Quando a ansiedade apertar', 'ansiedade', '🕊️', 2),
  ('Para restaurar a alma', 'restauracao', '💛', 3),
  ('Para continuar mesmo cansado', 'perseveranca', '💪', 4);