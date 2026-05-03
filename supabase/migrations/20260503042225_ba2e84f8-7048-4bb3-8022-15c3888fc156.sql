-- Create table for music tracks
CREATE TABLE public.musicas (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    produto_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    titulo TEXT NOT NULL,
    artista TEXT,
    capa_url TEXT,
    audio_url TEXT NOT NULL,
    categoria TEXT,
    destaque BOOLEAN DEFAULT false,
    ordem INT DEFAULT 0,
    criado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.musicas ENABLE ROW LEVEL SECURITY;

-- Create policies for admin access
CREATE POLICY "Admins can manage musicas"
ON public.musicas
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = auth.uid() AND role = 'admin'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = auth.uid() AND role = 'admin'
    )
);

-- Create policy for student viewing
-- Students can view music if they are enrolled in the course
CREATE POLICY "Students can view musicas"
ON public.musicas
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.enrollments
        WHERE user_id = auth.uid() AND course_id = produto_id
    ) OR EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = auth.uid() AND role = 'admin'
    )
);

-- Create function for updating updated_at if it doesn't exist
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_musicas_updated_at
BEFORE UPDATE ON public.musicas
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
