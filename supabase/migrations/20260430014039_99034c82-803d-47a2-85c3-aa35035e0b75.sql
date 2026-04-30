-- Add area_id to community_posts
ALTER TABLE public.community_posts ADD COLUMN area_id UUID REFERENCES public.areas(id);

-- Add area_id to content_items
ALTER TABLE public.content_items ADD COLUMN area_id UUID REFERENCES public.areas(id);

-- Add area_id to shelves
ALTER TABLE public.shelves ADD COLUMN area_id UUID REFERENCES public.areas(id);

-- Add area_id to playlists
ALTER TABLE public.playlists ADD COLUMN area_id UUID REFERENCES public.areas(id);

-- Add area_id to journeys
ALTER TABLE public.journeys ADD COLUMN area_id UUID REFERENCES public.areas(id);

-- Add area_id to vitrine_hero_banners
ALTER TABLE public.vitrine_hero_banners ADD COLUMN area_id UUID REFERENCES public.areas(id);

-- Create indexes for performance
CREATE INDEX idx_community_posts_area_id ON public.community_posts(area_id);
CREATE INDEX idx_content_items_area_id ON public.content_items(area_id);
CREATE INDEX idx_shelves_area_id ON public.shelves(area_id);
CREATE INDEX idx_playlists_area_id ON public.playlists(area_id);
CREATE INDEX idx_journeys_area_id ON public.journeys(area_id);
CREATE INDEX idx_vitrine_hero_banners_area_id ON public.vitrine_hero_banners(area_id);
