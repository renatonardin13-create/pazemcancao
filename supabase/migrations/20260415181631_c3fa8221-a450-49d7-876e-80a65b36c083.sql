
ALTER TABLE public.content_items
  ADD COLUMN IF NOT EXISTS release_mode text NOT NULL DEFAULT 'liberar_tudo',
  ADD COLUMN IF NOT EXISTS initial_free_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS locked_final_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS locked_label text NULL;
