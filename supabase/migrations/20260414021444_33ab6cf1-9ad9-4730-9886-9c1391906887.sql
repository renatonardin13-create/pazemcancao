ALTER TABLE public.webhook_logs
  ADD COLUMN IF NOT EXISTS external_product_id text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS internal_course_id uuid DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS processed_at timestamptz DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS is_success boolean DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS error_details text DEFAULT NULL;