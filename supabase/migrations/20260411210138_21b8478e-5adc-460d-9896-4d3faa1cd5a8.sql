ALTER TABLE public.content_items
  ADD COLUMN IF NOT EXISTS unlock_rule_type text DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS unlock_rule_content_id uuid DEFAULT NULL REFERENCES public.content_items(id) ON DELETE SET NULL;