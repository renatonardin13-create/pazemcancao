-- Create areas_membros table
CREATE TABLE IF NOT EXISTS public.areas_membros (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    nome TEXT NOT NULL,
    subdominio TEXT NOT NULL UNIQUE,
    produto_id UUID REFERENCES public.courses(id),
    ativa BOOLEAN DEFAULT true,
    principal BOOLEAN DEFAULT false,
    status TEXT DEFAULT 'active',
    language TEXT DEFAULT 'pt-BR',
    primary_color TEXT,
    secondary_color TEXT,
    logo_url TEXT,
    favicon_url TEXT,
    banner_url TEXT,
    background_color TEXT,
    surface_color TEXT,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT now(),
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.areas_membros ENABLE ROW LEVEL SECURITY;

-- Policies for areas_membros
CREATE POLICY "Public areas are viewable by everyone" 
ON public.areas_membros FOR SELECT 
USING (ativa = true);

CREATE POLICY "Admins can manage areas" 
ON public.areas_membros FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = auth.uid() AND role = 'admin'
    )
);

-- Add area_id to existing tables
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS area_id UUID REFERENCES public.areas_membros(id);
ALTER TABLE public.tracks ADD COLUMN IF NOT EXISTS area_id UUID REFERENCES public.areas_membros(id);
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS area_id UUID REFERENCES public.areas_membros(id);
ALTER TABLE public.journeys ADD COLUMN IF NOT EXISTS area_id UUID REFERENCES public.areas_membros(id);
ALTER TABLE public.content_items ADD COLUMN IF NOT EXISTS area_id UUID REFERENCES public.areas_membros(id);
ALTER TABLE public.shelves ADD COLUMN IF NOT EXISTS area_id UUID REFERENCES public.areas_membros(id);
ALTER TABLE public.promo_banners ADD COLUMN IF NOT EXISTS area_id UUID REFERENCES public.areas_membros(id);

-- Create a default area
DO $$
DECLARE
    default_area_id UUID;
BEGIN
    INSERT INTO public.areas_membros (nome, subdominio, principal, ativa)
    VALUES ('Área Principal', 'app', true, true)
    ON CONFLICT (subdominio) DO NOTHING
    RETURNING id INTO default_area_id;

    IF default_area_id IS NULL THEN
        SELECT id INTO default_area_id FROM public.areas_membros WHERE subdominio = 'app';
    END IF;

    -- Update existing records to the default area
    UPDATE public.courses SET area_id = default_area_id WHERE area_id IS NULL;
    UPDATE public.tracks SET area_id = default_area_id WHERE area_id IS NULL;
    UPDATE public.categories SET area_id = default_area_id WHERE area_id IS NULL;
    UPDATE public.journeys SET area_id = default_area_id WHERE area_id IS NULL;
    UPDATE public.content_items SET area_id = default_area_id WHERE area_id IS NULL;
    UPDATE public.shelves SET area_id = default_area_id WHERE area_id IS NULL;
    UPDATE public.promo_banners SET area_id = default_area_id WHERE area_id IS NULL;
END $$;

-- Create update trigger for updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.atualizado_em = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_areas_membros_updated_at
BEFORE UPDATE ON public.areas_membros
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();
