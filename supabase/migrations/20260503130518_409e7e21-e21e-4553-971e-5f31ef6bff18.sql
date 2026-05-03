-- Enable SELECT for authenticated users on content tables

-- Courses
CREATE POLICY "Users can view published courses" ON public.courses
FOR SELECT TO authenticated USING (status = 'published');

-- Lessons
CREATE POLICY "Users can view published lessons" ON public.lessons
FOR SELECT TO authenticated USING (status = 'published');

-- Shelves
CREATE POLICY "Users can view active shelves" ON public.shelves
FOR SELECT TO authenticated USING (is_active = true);

-- Shelf Courses
CREATE POLICY "Users can view shelf course links" ON public.shelf_courses
FOR SELECT TO authenticated USING (true);

-- Categories
CREATE POLICY "Users can view categories" ON public.categories
FOR SELECT TO authenticated USING (true);

-- Vitrine Hero Banners
CREATE POLICY "Users can view active hero banners" ON public.vitrine_hero_banners
FOR SELECT TO authenticated USING (is_active = true);

-- Tracks (Louvores)
CREATE POLICY "Users can view active tracks" ON public.tracks
FOR SELECT TO authenticated USING (is_active = true);

-- Platform Settings
CREATE POLICY "Users can view public platform settings" ON public.platform_settings
FOR SELECT TO authenticated USING (key IN ('general', 'hero_banner', 'music_player'));

-- Ensure RLS is enabled (it already was, but just to be safe)
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shelves ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shelf_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vitrine_hero_banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;
