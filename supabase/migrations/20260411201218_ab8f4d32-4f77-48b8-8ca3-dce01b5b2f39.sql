
ALTER TABLE public.content_items
ADD COLUMN display_category text DEFAULT NULL,
ADD COLUMN access_mode text DEFAULT 'pago',
ADD COLUMN show_as_card boolean DEFAULT true,
ADD COLUMN badge_text text DEFAULT NULL,
ADD COLUMN card_cover_url text DEFAULT NULL;

COMMENT ON COLUMN public.content_items.display_category IS 'Category/section where the card appears in the app';
COMMENT ON COLUMN public.content_items.access_mode IS 'Access mode: gratuito, pago, liberar_em_dias';
COMMENT ON COLUMN public.content_items.show_as_card IS 'Whether to display this content as a card in the app';
COMMENT ON COLUMN public.content_items.badge_text IS 'Optional badge text shown on the card (e.g., BÔNUS, NOVO)';
COMMENT ON COLUMN public.content_items.card_cover_url IS 'Optional card-specific cover image URL, falls back to cover_url';

-- Backfill access_mode from existing is_free and release_days
UPDATE public.content_items SET access_mode = 'gratuito' WHERE is_free = true;
UPDATE public.content_items SET access_mode = 'liberar_em_dias' WHERE release_days IS NOT NULL AND is_free = false;
