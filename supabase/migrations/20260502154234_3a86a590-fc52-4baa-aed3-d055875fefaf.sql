-- Create areas_membros table
CREATE TABLE IF NOT EXISTS public.areas_membros (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    subdominio TEXT NOT NULL UNIQUE,
    produto_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
    ativa BOOLEAN DEFAULT true,
    principal BOOLEAN DEFAULT false,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.areas_membros ENABLE ROW LEVEL SECURITY;

-- Create policies (allowing all authenticated users for now, or owner-based if there's a user_id)
-- Checking if there's a user_id or similar. Usually these admin tables are for admins.
-- Let's see if we should add user_id. The prompt didn't mention it, but it's good practice.
-- However, for now, let's keep it simple as per instructions.

CREATE POLICY "Allow authenticated users to read areas_membros" 
ON public.areas_membros FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Allow authenticated users to insert areas_membros" 
ON public.areas_membros FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update areas_membros" 
ON public.areas_membros FOR UPDATE 
TO authenticated 
USING (true);

CREATE POLICY "Allow authenticated users to delete areas_membros" 
ON public.areas_membros FOR DELETE 
TO authenticated 
USING (true);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.atualizado_em = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_areas_membros_updated_at
    BEFORE UPDATE ON public.areas_membros
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();
