ALTER TABLE public.tracks
  ADD COLUMN is_bonus boolean NOT NULL DEFAULT false,
  ADD COLUMN bonus_release_date date DEFAULT NULL;