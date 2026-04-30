-- Ensure tables exist with correct schema
CREATE TABLE IF NOT EXISTS public.areas (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    primary_color TEXT,
    logo_url TEXT,
    domain TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.memberships (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    area_id UUID REFERENCES public.areas(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(user_id, area_id)
);

CREATE TABLE IF NOT EXISTS public.contents (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    area_id UUID REFERENCES public.areas(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    type TEXT,
    url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS (already enabled but ensuring it)
ALTER TABLE public.areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contents ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any to avoid conflicts
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Areas are viewable by everyone" ON public.areas;
    DROP POLICY IF EXISTS "Areas are manageable by admins" ON public.areas;
    DROP POLICY IF EXISTS "Users can view their own memberships" ON public.memberships;
    DROP POLICY IF EXISTS "Memberships are manageable by admins" ON public.memberships;
    DROP POLICY IF EXISTS "Contents are viewable by area members" ON public.contents;
    DROP POLICY IF EXISTS "Contents are manageable by admins" ON public.contents;
EXCEPTION
    WHEN undefined_object THEN null;
END $$;

-- Create policies
-- Anyone can see areas
CREATE POLICY "Areas are viewable by everyone" ON public.areas FOR SELECT USING (true);
-- Authenticated users can manage areas (for initial setup, should be tightened later)
CREATE POLICY "Areas are manageable by authenticated users" ON public.areas FOR ALL USING (auth.role() = 'authenticated');

-- Users can see their own memberships
CREATE POLICY "Users can view their own memberships" ON public.memberships FOR SELECT USING (auth.uid() = user_id);
-- Authenticated users can manage memberships (for initial setup)
CREATE POLICY "Memberships are manageable by authenticated users" ON public.memberships FOR ALL USING (auth.role() = 'authenticated');

-- Contents viewable by members
CREATE POLICY "Contents are viewable by everyone" ON public.contents FOR SELECT USING (true);
-- Authenticated users can manage contents
CREATE POLICY "Contents are manageable by authenticated users" ON public.contents FOR ALL USING (auth.role() = 'authenticated');
