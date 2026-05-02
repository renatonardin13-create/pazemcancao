-- Fix search_path for is_admin and restrict access
ALTER FUNCTION public.is_admin(uuid) SET search_path = public;
REVOKE EXECUTE ON FUNCTION public.is_admin(uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO authenticated;

-- Fix search_path for get_hero_banner_metrics
ALTER FUNCTION public.get_hero_banner_metrics(integer) SET search_path = public;
REVOKE EXECUTE ON FUNCTION public.get_hero_banner_metrics(integer) FROM public;
GRANT EXECUTE ON FUNCTION public.get_hero_banner_metrics(integer) TO authenticated;

-- Ensure RLS on areas_membros is tight
ALTER TABLE public.areas_membros ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they are overly permissive or redundant
DROP POLICY IF EXISTS "Admins can view areas_membros" ON public.areas_membros;
DROP POLICY IF EXISTS "Admins can insert areas_membros" ON public.areas_membros;
DROP POLICY IF EXISTS "Admins can update areas_membros" ON public.areas_membros;
DROP POLICY IF EXISTS "Admins can delete areas_membros" ON public.areas_membros;

-- Re-create policies using the is_admin function for clarity and security
CREATE POLICY "Admins can view all areas" 
ON public.areas_membros FOR SELECT 
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can create areas" 
ON public.areas_membros FOR INSERT 
WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update areas" 
ON public.areas_membros FOR UPDATE 
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can delete areas" 
ON public.areas_membros FOR DELETE 
USING (is_admin(auth.uid()));

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_areas_membros_subdominio ON public.areas_membros(subdominio);
CREATE INDEX IF NOT EXISTS idx_areas_membros_produto_id ON public.areas_membros(produto_id);
