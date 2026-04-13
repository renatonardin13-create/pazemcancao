INSERT INTO public.categories (name, slug, sort_order, icon) VALUES
  ('Marketing Digital', 'marketing-digital', 10, '📱'),
  ('Programação', 'programacao', 11, '💻'),
  ('Design', 'design', 12, '🎨'),
  ('Negócios', 'negocios', 13, '💼'),
  ('Finanças', 'financas', 14, '💰'),
  ('Desenvolvimento Pessoal', 'desenvolvimento-pessoal', 15, '🧠'),
  ('Saúde e Bem-estar', 'saude-e-bem-estar', 16, '🏃'),
  ('Idiomas', 'idiomas', 17, '🌍'),
  ('Outros', 'outros', 18, '📁')
ON CONFLICT DO NOTHING;