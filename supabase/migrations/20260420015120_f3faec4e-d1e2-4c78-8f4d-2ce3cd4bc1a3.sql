DROP POLICY IF EXISTS "Authenticated can insert hero banner events" ON public.hero_banner_events;

CREATE POLICY "Authenticated can insert hero banner events"
  ON public.hero_banner_events FOR INSERT
  TO authenticated
  WITH CHECK (
    email IS NULL
    OR email = (auth.jwt() ->> 'email')
  );