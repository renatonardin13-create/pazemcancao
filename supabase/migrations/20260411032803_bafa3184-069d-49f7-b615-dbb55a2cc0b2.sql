-- Add trial fields to approved_buyers
ALTER TABLE public.approved_buyers 
  ADD COLUMN is_trial boolean NOT NULL DEFAULT false,
  ADD COLUMN trial_expires_at timestamp with time zone,
  ADD COLUMN can_download boolean NOT NULL DEFAULT true;