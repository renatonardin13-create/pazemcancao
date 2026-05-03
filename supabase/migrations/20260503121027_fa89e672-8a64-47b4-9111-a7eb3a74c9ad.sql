-- 1. Remove triggers and functions
DROP TRIGGER IF EXISTS tr_ensure_single_primary_area ON public.areas;
DROP FUNCTION IF EXISTS public.ensure_single_primary_area();

-- 2. Drop columns from areas table with CASCADE to remove dependent policies
ALTER TABLE public.areas 
DROP COLUMN IF EXISTS is_primary CASCADE,
DROP COLUMN IF EXISTS product_id CASCADE,
DROP COLUMN IF EXISTS status CASCADE,
DROP COLUMN IF EXISTS short_label CASCADE,
DROP COLUMN IF EXISTS settings CASCADE,
DROP COLUMN IF EXISTS login_title CASCADE,
DROP COLUMN IF EXISTS login_subtitle CASCADE,
DROP COLUMN IF EXISTS login_background_url CASCADE,
DROP COLUMN IF EXISTS primary_color CASCADE,
DROP COLUMN IF EXISTS logo_url CASCADE,
DROP COLUMN IF EXISTS favicon_url CASCADE,
DROP COLUMN IF EXISTS banner_url CASCADE,
DROP COLUMN IF EXISTS secondary_color CASCADE,
DROP COLUMN IF EXISTS background_color CASCADE,
DROP COLUMN IF EXISTS surface_color CASCADE,
DROP COLUMN IF EXISTS language CASCADE;

-- 3. Drop tables added after May 1st
DROP TABLE IF EXISTS public.musicas CASCADE;
DROP TABLE IF EXISTS public.ofertas_produtos CASCADE;
DROP TABLE IF EXISTS public.ofertas CASCADE;
DROP TABLE IF EXISTS public.produtos CASCADE;
DROP TABLE IF EXISTS public.acessos_usuario CASCADE;
