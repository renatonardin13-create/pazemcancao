-- Create produtos table
CREATE TABLE IF NOT EXISTS public.produtos (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    nome TEXT NOT NULL,
    tipo TEXT NOT NULL CHECK (tipo IN ('curso', 'ebook', 'pack_louvores')),
    status TEXT NOT NULL DEFAULT 'ativo',
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create ofertas table
CREATE TABLE IF NOT EXISTS public.ofertas (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    nome TEXT NOT NULL,
    gateway TEXT NOT NULL CHECK (gateway IN ('perfect_pay', 'kiwify')),
    modalidade TEXT NOT NULL CHECK (modalidade IN ('unico', 'assinatura')),
    codigo_externo TEXT NOT NULL,
    token TEXT,
    status TEXT NOT NULL DEFAULT 'ativa' CHECK (status IN ('rascunho', 'ativa', 'inativa')),
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create ofertas_produtos table
CREATE TABLE IF NOT EXISTS public.ofertas_produtos (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    oferta_id UUID NOT NULL REFERENCES public.ofertas(id) ON DELETE CASCADE,
    produto_id UUID NOT NULL REFERENCES public.produtos(id) ON DELETE CASCADE,
    UNIQUE(oferta_id, produto_id)
);

-- Create acessos_usuario table
CREATE TABLE IF NOT EXISTS public.acessos_usuario (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    usuario_email TEXT NOT NULL,
    produto_id UUID NOT NULL REFERENCES public.produtos(id) ON DELETE CASCADE,
    origem TEXT NOT NULL CHECK (origem IN ('perfect_pay', 'kiwify', 'manual')),
    status TEXT NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'cancelado')),
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ofertas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ofertas_produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.acessos_usuario ENABLE ROW LEVEL SECURITY;

-- Create policies for admin access
DO $$
BEGIN
    -- Check if policies exist before creating
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'produtos' AND policyname = 'Admins can do everything on produtos') THEN
        CREATE POLICY "Admins can do everything on produtos" ON public.produtos
        FOR ALL USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ofertas' AND policyname = 'Admins can do everything on ofertas') THEN
        CREATE POLICY "Admins can do everything on ofertas" ON public.ofertas
        FOR ALL USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ofertas_produtos' AND policyname = 'Admins can do everything on ofertas_produtos') THEN
        CREATE POLICY "Admins can do everything on ofertas_produtos" ON public.ofertas_produtos
        FOR ALL USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'acessos_usuario' AND policyname = 'Admins can do everything on acessos_usuario') THEN
        CREATE POLICY "Admins can do everything on acessos_usuario" ON public.acessos_usuario
        FOR ALL USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));
    END IF;
    
    -- Allow users to see their own access (if user_id is ever added, but for now we use email)
    -- Since we use email, we might need a policy that checks auth.email()
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'acessos_usuario' AND policyname = 'Users can view their own access by email') THEN
        CREATE POLICY "Users can view their own access by email" ON public.acessos_usuario
        FOR SELECT USING (usuario_email = auth.jwt() ->> 'email');
    END IF;
END
$$;
