-- Tighten security for areas
DROP POLICY IF EXISTS "Areas are manageable by authenticated users" ON public.areas;
CREATE POLICY "Areas are manageable by admins" ON public.areas 
FOR ALL TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_roles.user_id = auth.uid()
        AND user_roles.role::text = 'admin'
    )
);

-- Tighten security for memberships
DROP POLICY IF EXISTS "Memberships are manageable by authenticated users" ON public.memberships;
CREATE POLICY "Memberships are manageable by admins" ON public.memberships 
FOR ALL TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_roles.user_id = auth.uid()
        AND user_roles.role::text = 'admin'
    )
);

-- Tighten security for contents
DROP POLICY IF EXISTS "Contents are manageable by authenticated users" ON public.contents;
CREATE POLICY "Contents are manageable by admins" ON public.contents 
FOR ALL TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_roles.user_id = auth.uid()
        AND user_roles.role::text = 'admin'
    )
);
