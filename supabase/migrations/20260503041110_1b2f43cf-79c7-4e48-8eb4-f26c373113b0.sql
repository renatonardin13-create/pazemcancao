CREATE TABLE IF NOT EXISTS public.configuracoes_login_area (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    area_id UUID NOT NULL REFERENCES public.areas_membros(id) ON DELETE CASCADE UNIQUE,
    titulo_login TEXT,
    subtitulo_login TEXT,
    placeholder_email TEXT,
    placeholder_senha TEXT,
    texto_botao TEXT,
    texto_ajuda TEXT,
    texto_rodape TEXT,
    imagem_login_url TEXT,
    layout_login TEXT DEFAULT 'right',
    modo_fundo TEXT DEFAULT 'solid',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.configuracoes_login_area ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Admins manage login configs" ON public.configuracoes_login_area
    FOR ALL USING (is_admin(auth.uid()))
    WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Anyone can view login configs" ON public.configuracoes_login_area
    FOR SELECT USING (true);

-- Update trigger for timestamp
CREATE TRIGGER update_configuracoes_login_area_updated_at
BEFORE UPDATE ON public.configuracoes_login_area
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
