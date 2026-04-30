-- Helper function for membership check
CREATE OR REPLACE FUNCTION public.is_area_member(_area_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.memberships
    WHERE area_id = _area_id AND user_id = auth.uid()
  ) OR public.is_admin(auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 1. Areas
DROP POLICY IF EXISTS "Areas are viewable by everyone" ON public.areas;
DROP POLICY IF EXISTS "read areas" ON public.areas;
DROP POLICY IF EXISTS "Users can view their areas" ON public.areas;
CREATE POLICY "Users can view their areas" 
ON public.areas 
FOR SELECT 
USING (is_area_member(id));

-- 2. Courses
DROP POLICY IF EXISTS "Anyone authenticated can view published courses" ON public.courses;
DROP POLICY IF EXISTS "Users can view courses in their area" ON public.courses;
CREATE POLICY "Users can view courses in their area" 
ON public.courses 
FOR SELECT 
USING (is_area_member(area_id));

-- 3. Modules
DROP POLICY IF EXISTS "Anyone authenticated can view modules of published courses" ON public.modules;
DROP POLICY IF EXISTS "Users can view modules of their courses" ON public.modules;
CREATE POLICY "Users can view modules of their courses" 
ON public.modules 
FOR SELECT 
USING (
  is_admin(auth.uid()) OR 
  EXISTS (
    SELECT 1 FROM public.courses c 
    WHERE c.id = course_id AND is_area_member(c.area_id)
  )
);

-- 4. Lessons
DROP POLICY IF EXISTS "Anyone authenticated can view lessons of published courses" ON public.lessons;
DROP POLICY IF EXISTS "Users can view lessons of their courses" ON public.lessons;
CREATE POLICY "Users can view lessons of their courses" 
ON public.lessons 
FOR SELECT 
USING (
  is_admin(auth.uid()) OR 
  EXISTS (
    SELECT 1 FROM public.courses c 
    WHERE c.id = course_id AND is_area_member(c.area_id)
  )
);

-- 5. Contents
DROP POLICY IF EXISTS "Contents are viewable by everyone" ON public.contents;
DROP POLICY IF EXISTS "Users can view content in their area" ON public.contents;
DROP POLICY IF EXISTS "read contents by membership" ON public.contents;
CREATE POLICY "Users can view content in their area" 
ON public.contents 
FOR SELECT 
USING (is_area_member(area_id));

-- 6. Community Posts
DROP POLICY IF EXISTS "Authenticated can view posts" ON public.community_posts;
DROP POLICY IF EXISTS "Users can view posts in their area" ON public.community_posts;
CREATE POLICY "Users can view posts in their area" 
ON public.community_posts 
FOR SELECT 
USING (is_area_member(area_id));

-- 7. Categories
DROP POLICY IF EXISTS "Authenticated can view categories by membership" ON public.categories;
DROP POLICY IF EXISTS "Users can view categories in their area" ON public.categories;
CREATE POLICY "Users can view categories in their area" 
ON public.categories 
FOR SELECT 
USING (is_area_member(area_id));

-- 8. Vitrine Hero Banners
DROP POLICY IF EXISTS "Authenticated can view active banners" ON public.vitrine_hero_banners;
DROP POLICY IF EXISTS "Users can view banners in their area" ON public.vitrine_hero_banners;
CREATE POLICY "Users can view banners in their area" 
ON public.vitrine_hero_banners 
FOR SELECT 
USING (is_area_member(area_id));

-- 9. Playlists & Tracks
DROP POLICY IF EXISTS "Anyone authenticated can view published playlists" ON public.playlists;
DROP POLICY IF EXISTS "Users can view playlists in their area" ON public.playlists;
DROP POLICY IF EXISTS "Anyone authenticated can view tracks" ON public.tracks;
DROP POLICY IF EXISTS "Users can view tracks in their area" ON public.tracks;

CREATE POLICY "Users can view playlists in their area" 
ON public.playlists 
FOR SELECT 
USING (is_area_member(area_id));

CREATE POLICY "Users can view tracks in their area" 
ON public.tracks 
FOR SELECT 
USING (is_area_member(area_id));

-- 10. Shelves & Journeys
DROP POLICY IF EXISTS "Anyone authenticated can view active shelves" ON public.shelves;
DROP POLICY IF EXISTS "Users can view shelves in their area" ON public.shelves;
DROP POLICY IF EXISTS "Anyone authenticated can view journeys" ON public.journeys;
DROP POLICY IF EXISTS "Users can view journeys in their area" ON public.journeys;

CREATE POLICY "Users can view shelves in their area" 
ON public.shelves 
FOR SELECT 
USING (is_area_member(area_id));

CREATE POLICY "Users can view journeys in their area" 
ON public.journeys 
FOR SELECT 
USING (is_area_member(area_id));
