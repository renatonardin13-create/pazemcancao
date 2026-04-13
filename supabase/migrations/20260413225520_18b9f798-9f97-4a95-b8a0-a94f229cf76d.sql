
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can upload covers' AND tablename = 'objects') THEN
    CREATE POLICY "Admins can upload covers"
    ON storage.objects FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'covers' AND has_role(auth.uid(), 'admin'::app_role));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can delete covers' AND tablename = 'objects') THEN
    CREATE POLICY "Admins can delete covers"
    ON storage.objects FOR DELETE TO authenticated
    USING (bucket_id = 'covers' AND has_role(auth.uid(), 'admin'::app_role));
  END IF;
END $$;
