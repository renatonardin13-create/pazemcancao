-- Posts da comunidade
CREATE TABLE public.community_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  author_name TEXT NOT NULL,
  author_avatar_url TEXT,
  content TEXT NOT NULL CHECK (char_length(content) BETWEEN 1 AND 2000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view posts"
  ON public.community_posts FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can create own posts"
  ON public.community_posts FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own posts"
  ON public.community_posts FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users or admins can delete posts"
  ON public.community_posts FOR DELETE TO authenticated
  USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_community_posts_updated_at
  BEFORE UPDATE ON public.community_posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_community_posts_created_at ON public.community_posts (created_at DESC);

-- Curtidas
CREATE TABLE public.community_post_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (post_id, user_id)
);

ALTER TABLE public.community_post_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view likes"
  ON public.community_post_likes FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can like"
  ON public.community_post_likes FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can unlike own"
  ON public.community_post_likes FOR DELETE TO authenticated
  USING (user_id = auth.uid());

CREATE INDEX idx_community_post_likes_post ON public.community_post_likes (post_id);