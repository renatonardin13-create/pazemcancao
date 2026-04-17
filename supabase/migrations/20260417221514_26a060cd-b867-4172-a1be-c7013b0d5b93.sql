ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS product_type text NOT NULL DEFAULT 'curso_individual';
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS sales_description text;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS benefits text[] NOT NULL DEFAULT '{}'::text[];