
-- Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policies
CREATE POLICY "Users can view own roles"
  ON public.user_roles
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Service role manages roles"
  ON public.user_roles
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create storage bucket for audio tracks
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'tracks',
  'tracks',
  true,
  52428800,
  ARRAY['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg']
);

-- Storage policy: admins can upload
CREATE POLICY "Admins can upload tracks"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'tracks'
    AND public.has_role(auth.uid(), 'admin')
  );

-- Storage policy: anyone authenticated can read
CREATE POLICY "Authenticated users can read tracks"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id = 'tracks');

-- Public can read tracks too (for download URLs)
CREATE POLICY "Public can read tracks"
  ON storage.objects
  FOR SELECT
  TO anon
  USING (bucket_id = 'tracks');

-- Admins can delete tracks
CREATE POLICY "Admins can delete tracks"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'tracks'
    AND public.has_role(auth.uid(), 'admin')
  );

-- Create tracks table for managing uploaded tracks
CREATE TABLE public.tracks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'Paz',
  duration TEXT NOT NULL DEFAULT '0:00',
  storage_path TEXT NOT NULL,
  download_url TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.tracks ENABLE ROW LEVEL SECURITY;

-- Everyone authenticated can read active tracks
CREATE POLICY "Authenticated can read active tracks"
  ON public.tracks
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Admins can do everything with tracks
CREATE POLICY "Admins manage tracks"
  ON public.tracks
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
