
CREATE TABLE public.platform_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage platform settings"
  ON public.platform_settings FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Service role manages platform settings"
  ON public.platform_settings FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Seed default settings
INSERT INTO public.platform_settings (key, value) VALUES
  ('branding', '{"platform_name": "Paz em Canção", "logo_url": null, "favicon_url": null}'::jsonb),
  ('colors', '{"primary": "#D4A853", "background": "#000000", "surface": "#0A0A0A", "text": "#FFFFFF"}'::jsonb),
  ('general', '{"welcome_message": "Bem-vindo à sua área de membros!", "footer_text": "© 2026 Paz em Canção. Todos os direitos reservados.", "support_email": ""}'::jsonb),
  ('analytics', '{"google_analytics_id": "", "facebook_pixel_id": ""}'::jsonb),
  ('notifications', '{"email_alerts": false, "alert_email": "", "alert_on_error": true, "alert_on_consecutive": true, "consecutive_limit": 3, "monitored_platforms": ["hotmart", "kiwify"]}'::jsonb);
