-- Ensure areas and memberships are properly protected
ALTER TABLE public.areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contents ENABLE ROW LEVEL SECURITY;

-- Policy for contents: Users can only see contents of their area
DROP POLICY IF EXISTS "Users can view content in their area" ON public.contents;
CREATE POLICY "Users can view content in their area" ON public.contents
FOR SELECT
USING (
  area_id IN (
    SELECT area_id 
    FROM public.memberships 
    WHERE user_id = auth.uid()
  )
);

-- Policy for areas: Users can only see areas they are members of
DROP POLICY IF EXISTS "Users can view their areas" ON public.areas;
CREATE POLICY "Users can view their areas" ON public.areas
FOR SELECT
USING (
  id IN (
    SELECT area_id 
    FROM public.memberships 
    WHERE user_id = auth.uid()
  )
);

-- Note: Admin access would typically be handled by checking a user role column 
-- or by allowing super-admins via a specific bypass policy.
-- Assuming an 'is_admin' field or similar exists on the memberships table if needed,
-- but the current requirement focuses on area_id filtering.
