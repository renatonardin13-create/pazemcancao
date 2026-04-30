-- 1. Ensure courses table has area_id
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'area_id') THEN
    ALTER TABLE public.courses ADD COLUMN area_id UUID REFERENCES public.areas(id);
  END IF;
END $$;

-- 2. Enable RLS on all relevant tables
ALTER TABLE public.areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

-- 3. Define a helper function to check if a user is an admin
-- This assumes a 'user_roles' table exists as seen in course detail logic
CREATE OR REPLACE FUNCTION public.is_admin(uid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = uid AND role = 'admin'
  ) OR (
    SELECT email FROM auth.users WHERE id = uid
  ) = 'renatonardin13@gmail.com';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. RLS Policies for 'areas'
DROP POLICY IF EXISTS "Users can view their areas" ON public.areas;
CREATE POLICY "Users can view their areas" ON public.areas
FOR SELECT USING (
  is_admin(auth.uid()) OR 
  id IN (SELECT area_id FROM public.memberships WHERE user_id = auth.uid())
);

-- 5. RLS Policies for 'memberships'
DROP POLICY IF EXISTS "Users can view their own membership" ON public.memberships;
CREATE POLICY "Users can view their own membership" ON public.memberships
FOR SELECT USING (
  is_admin(auth.uid()) OR user_id = auth.uid()
);

-- 6. RLS Policies for 'contents'
DROP POLICY IF EXISTS "Users can view content in their area" ON public.contents;
CREATE POLICY "Users can view content in their area" ON public.contents
FOR SELECT USING (
  is_admin(auth.uid()) OR 
  area_id IN (SELECT area_id FROM public.memberships WHERE user_id = auth.uid())
);

-- 7. RLS Policies for 'tracks'
DROP POLICY IF EXISTS "Users can view tracks in their area" ON public.tracks;
CREATE POLICY "Users can view tracks in their area" ON public.tracks
FOR SELECT USING (
  is_admin(auth.uid()) OR 
  area_id IN (SELECT area_id FROM public.memberships WHERE user_id = auth.uid())
);

-- 8. RLS Policies for 'courses'
DROP POLICY IF EXISTS "Users can view courses in their area" ON public.courses;
CREATE POLICY "Users can view courses in their area" ON public.courses
FOR SELECT USING (
  is_admin(auth.uid()) OR 
  area_id IN (SELECT area_id FROM public.memberships WHERE user_id = auth.uid())
);
