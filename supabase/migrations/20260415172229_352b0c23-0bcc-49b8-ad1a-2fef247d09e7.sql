
-- Playlists table (admin-curated)
CREATE TABLE public.playlists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  cover_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Playlist tracks (many-to-many)
CREATE TABLE public.playlist_tracks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  playlist_id UUID NOT NULL REFERENCES public.playlists(id) ON DELETE CASCADE,
  track_id UUID NOT NULL REFERENCES public.tracks(id) ON DELETE CASCADE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(playlist_id, track_id)
);

-- RLS for playlists
ALTER TABLE public.playlists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage playlists" ON public.playlists
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone authenticated can view active playlists" ON public.playlists
  FOR SELECT TO authenticated
  USING (is_active = true);

-- RLS for playlist_tracks
ALTER TABLE public.playlist_tracks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage playlist tracks" ON public.playlist_tracks
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone authenticated can view playlist tracks" ON public.playlist_tracks
  FOR SELECT TO authenticated
  USING (true);
