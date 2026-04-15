CREATE POLICY "Anyone authenticated can view platform settings"
ON public.platform_settings FOR SELECT
TO authenticated
USING (true);