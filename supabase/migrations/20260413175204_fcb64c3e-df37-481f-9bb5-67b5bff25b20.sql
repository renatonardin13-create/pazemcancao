
CREATE TABLE public.transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_code text NOT NULL,
  buyer_name text NOT NULL,
  buyer_email text NOT NULL,
  course_id uuid REFERENCES public.courses(id) ON DELETE SET NULL,
  course_title text NOT NULL,
  amount numeric(10,2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  payment_method text,
  platform text DEFAULT 'kiwify',
  external_order_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage transactions"
ON public.transactions
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_transactions_created_at ON public.transactions(created_at DESC);
CREATE INDEX idx_transactions_status ON public.transactions(status);
