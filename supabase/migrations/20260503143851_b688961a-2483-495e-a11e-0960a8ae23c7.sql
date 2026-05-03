-- Add area_id to remaining tables
ALTER TABLE public.playlists ADD COLUMN IF NOT EXISTS area_id UUID REFERENCES public.areas_membros(id);
ALTER TABLE public.approved_buyers ADD COLUMN IF NOT EXISTS area_id UUID REFERENCES public.areas_membros(id);
ALTER TABLE public.active_sessions ADD COLUMN IF NOT EXISTS area_id UUID REFERENCES public.areas_membros(id);
ALTER TABLE public.enrollments ADD COLUMN IF NOT EXISTS area_id UUID REFERENCES public.areas_membros(id);
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS area_id UUID REFERENCES public.areas_membros(id);

-- Create platform_modules table
CREATE TABLE IF NOT EXISTS public.platform_modules (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    enabled BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    visible_in_vitrine BOOLEAN DEFAULT true,
    visible_in_menu BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS for platform_modules
ALTER TABLE public.platform_modules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Platform modules are viewable by authenticated users" 
ON public.platform_modules FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage platform modules" 
ON public.platform_modules FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = auth.uid() AND role = 'admin'
    )
);

-- Initialize platform modules
INSERT INTO public.platform_modules (name, slug, sort_order) VALUES
('Louvores', 'louvores', 1),
('Produtos', 'cursos', 2),
('Trilhas', 'trilhas', 3),
('Ebooks', 'ebooks', 4),
('Lançamentos', 'lancamentos', 5),
('Comunidade', 'comunidade', 6)
ON CONFLICT (slug) DO NOTHING;

-- Update existing records to the default area
DO $$
DECLARE
    default_area_id UUID;
BEGIN
    SELECT id INTO default_area_id FROM public.areas_membros WHERE subdominio = 'app';

    IF default_area_id IS NOT NULL THEN
        UPDATE public.playlists SET area_id = default_area_id WHERE area_id IS NULL;
        UPDATE public.approved_buyers SET area_id = default_area_id WHERE area_id IS NULL;
        UPDATE public.active_sessions SET area_id = default_area_id WHERE area_id IS NULL;
        UPDATE public.enrollments SET area_id = default_area_id WHERE area_id IS NULL;
        UPDATE public.transactions SET area_id = default_area_id WHERE area_id IS NULL;
    END IF;
END $$;
