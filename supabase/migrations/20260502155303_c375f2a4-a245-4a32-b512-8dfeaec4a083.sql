-- Fix permissive policies for areas_membros
DROP POLICY IF EXISTS "Allow authenticated users to read areas_membros" ON public.areas_membros;
DROP POLICY IF EXISTS "Allow authenticated users to insert areas_membros" ON public.areas_membros;
DROP POLICY IF EXISTS "Allow authenticated users to update areas_membros" ON public.areas_membros;
DROP POLICY IF EXISTS "Allow authenticated users to delete areas_membros" ON public.areas_membros;

-- Create secure policies (Admin only)
CREATE POLICY "Admins can view areas_membros" 
ON public.areas_membros 
FOR SELECT 
USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'::app_role));

CREATE POLICY "Admins can insert areas_membros" 
ON public.areas_membros 
FOR INSERT 
WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'::app_role));

CREATE POLICY "Admins can update areas_membros" 
ON public.areas_membros 
FOR UPDATE 
USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'::app_role));

CREATE POLICY "Admins can delete areas_membros" 
ON public.areas_membros 
FOR DELETE 
USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'::app_role));