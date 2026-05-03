-- Drop tables created after April 30, 2026
DROP TABLE IF EXISTS public.admin_audit_logs CASCADE;
DROP TABLE IF EXISTS public.onboarding_status CASCADE;
DROP TABLE IF EXISTS public.member_area_settings CASCADE;
DROP TABLE IF EXISTS public.product_types CASCADE;
DROP TABLE IF EXISTS public.areas_membros CASCADE;
DROP TABLE IF EXISTS public.configuracoes_login_area CASCADE;
DROP TABLE IF EXISTS public.platform_modules CASCADE;
DROP TABLE IF EXISTS public.areas CASCADE;
DROP TABLE IF EXISTS public.memberships CASCADE;
DROP TABLE IF EXISTS public.contents CASCADE;

-- Remove columns added after April 30
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'area_id') THEN
        ALTER TABLE public.courses DROP COLUMN area_id;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tracks' AND column_name = 'area_id') THEN
        ALTER TABLE public.tracks DROP COLUMN area_id;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lessons' AND column_name = 'area_id') THEN
        ALTER TABLE public.lessons DROP COLUMN area_id;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'modules' AND column_name = 'area_id') THEN
        ALTER TABLE public.modules DROP COLUMN area_id;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'shelves' AND column_name = 'area_id') THEN
        ALTER TABLE public.shelves DROP COLUMN area_id;
    END IF;
END $$;