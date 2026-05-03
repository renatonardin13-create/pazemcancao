-- Create webhooks_logs table
CREATE TABLE IF NOT EXISTS public.webhooks_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payload JSONB NOT NULL,
    gateway TEXT NOT NULL, -- 'perfect_pay' or 'kiwify'
    status TEXT DEFAULT 'pending', -- 'pending', 'processed', 'error'
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    processed_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE public.webhooks_logs ENABLE ROW LEVEL SECURITY;

-- Policies for webhooks_logs
CREATE POLICY "Admins can view webhook logs" 
ON public.webhooks_logs 
FOR SELECT 
USING (public.is_admin(auth.uid()));

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_webhooks_logs_status ON public.webhooks_logs(status);
CREATE INDEX IF NOT EXISTS idx_webhooks_logs_created_at ON public.webhooks_logs(created_at);

-- Ensure musicas table has RLS and policies (already checked, but good to ensure)
-- Students can view musicas if they have the product
-- (Existing policies are already good)

-- Add a function to process webhooks (placeholder for the logic described in PRD)
CREATE OR REPLACE FUNCTION public.process_webhook_payment()
RETURNS trigger AS $$
BEGIN
    -- This function would contain logic to parse payload and grant access
    -- For now, it's a placeholder for the backend logic
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to process webhooks
CREATE TRIGGER trigger_process_webhook
AFTER INSERT ON public.webhooks_logs
FOR EACH ROW
EXECUTE FUNCTION public.process_webhook_payment();