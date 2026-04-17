import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ModuleGuard } from "@/components/ModuleGuard";
import { StudentLayout } from "@/components/StudentLayout";
import { FooterLinks } from "@/components/FooterLinks";
import { Users, Heart, Trash2, Send, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export const Route = createFileRoute("/_authenticated/comunidade")({
  component: ComunidadePage,
});

type Post = {
  id: string;
  user_id: string;
  author_name: string;
  author_avatar_url: string | null;
  content: string;
  created_at: string;
  likes_count: number;
  liked_by_me: boolean;
};

function ComunidadePage() {
  const { user, isAdmin } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const loadPosts = async () => {
    const { data: postsData, error } = await supabase
      .from("community_posts")
      .select("id, user_id, author_name, author_avatar_url, content, created_at")
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      toast.error("Erro ao carregar posts");
      setLoading(false);
      return;
    }

    const ids = (postsData ?? []).map((p) => p.id);
    let likes: { post_id: string; user_id: string }[] = [];
    if (ids.length) {
      const { data: likesData } = await supabase
        .from("community_post_likes")
        .select("post_id, user_id")
        .in("post_id", ids);
      likes = likesData ?? [];
    }

    const enriched: Post[] = (postsData ?? []).map((p) => {
      const postLikes = likes.filter((l) => l.post_id === p.id);
      return {
        ...p,
        likes_count: postLikes.length,
        liked_by_me: !!user && postLikes.some((l) => l.user_id === user.id),
      };
    });

    setPosts(enriched);
    setLoading(false);
  };

  useEffect(() => {
    loadPosts();
    const channel = supabase
      .channel("community_posts_realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "community_posts" }, () => loadPosts())
      .on("postgres_changes", { event: "*", schema: "public", table: "community_post_likes" }, () => loadPosts())
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const handleSubmit = async () => {
    if (!user || !content.trim()) return;
    setSubmitting(true);
    const authorName =
      (user.user_metadata?.full_name as string | undefined) ||
      user.email?.split("@")[0] ||
      "Membro";
    const { error } = await supabase.from("community_posts").insert({
      user_id: user.id,
      author_name: authorName,
      author_avatar_url: (user.user_metadata?.avatar_url as string | undefined) ?? null,
      content: content.trim(),
    });
    setSubmitting(false);
    if (error) {
      toast.error("Não foi possível publicar");
      return;
    }
    setContent("");
    toast.success("Mensagem publicada");
    loadPosts();
  };

  const toggleLike = async (post: Post) => {
    if (!user) return;
    if (post.liked_by_me) {
      await supabase
        .from("community_post_likes")
        .delete()
        .eq("post_id", post.id)
        .eq("user_id", user.id);
    } else {
      await supabase
        .from("community_post_likes")
        .insert({ post_id: post.id, user_id: user.id });
    }
    loadPosts();
  };

  const deletePost = async (post: Post) => {
    if (!user) return;
    if (!confirm("Excluir este post?")) return;
    const { error } = await supabase.from("community_posts").delete().eq("id", post.id);
    if (error) {
      toast.error("Não foi possível excluir");
      return;
    }
    toast.success("Post excluído");
    loadPosts();
  };

  return (
    <ModuleGuard moduleKey="comunidade">
      <StudentLayout>
        <div className="min-h-screen flex flex-col bg-background">
          <div className="flex-1 w-full pb-28">
            <div className="mx-auto max-w-3xl px-5 sm:px-8 py-8 sm:py-12">
              <div className="flex items-center gap-3 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-600">
                <Users className="h-7 w-7 text-gold" />
                <div>
                  <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground/90 tracking-tight">
                    Comunidade
                  </h1>
                  <p className="text-[13px] text-muted-foreground/60 mt-0.5">
                    Compartilhe com outros membros
                  </p>
                </div>
              </div>

              {/* Composer */}
              <div className="rounded-xl border border-border/40 bg-card/40 backdrop-blur p-4 mb-6">
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Escreva uma mensagem para a comunidade..."
                  maxLength={2000}
                  rows={3}
                  className="resize-none bg-background/50 border-border/40"
                />
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs text-muted-foreground/60">
                    {content.length}/2000
                  </span>
                  <Button
                    onClick={handleSubmit}
                    disabled={submitting || !content.trim()}
                    size="sm"
                    className="bg-gold hover:bg-gold/90 text-black"
                  >
                    {submitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Publicar
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Feed */}
              {loading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground/50" />
                </div>
              ) : posts.length === 0 ? (
                <div className="text-center py-16">
                  <Users className="h-10 w-10 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground/60">
                    Seja o primeiro a postar na comunidade.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {posts.map((post) => {
                    const canDelete = user?.id === post.user_id || isAdmin;
                    return (
                      <article
                        key={post.id}
                        className="rounded-xl border border-border/40 bg-card/30 p-4 hover:bg-card/50 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <Avatar className="h-10 w-10 shrink-0">
                            <AvatarImage src={post.author_avatar_url ?? undefined} />
                            <AvatarFallback className="bg-gold/20 text-gold text-sm">
                              {post.author_name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-foreground/90 truncate">
                                  {post.author_name}
                                </p>
                                <p className="text-xs text-muted-foreground/60">
                                  {formatDistanceToNow(new Date(post.created_at), {
                                    addSuffix: true,
                                    locale: ptBR,
                                  })}
                                </p>
                              </div>
                              {canDelete && (
                                <button
                                  onClick={() => deletePost(post)}
                                  className="text-muted-foreground/40 hover:text-destructive transition-colors p-1"
                                  aria-label="Excluir post"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                            <p className="text-sm text-foreground/85 mt-2 whitespace-pre-wrap break-words">
                              {post.content}
                            </p>
                            <button
                              onClick={() => toggleLike(post)}
                              className={`mt-3 inline-flex items-center gap-1.5 text-xs transition-colors ${
                                post.liked_by_me
                                  ? "text-gold"
                                  : "text-muted-foreground/60 hover:text-foreground/80"
                              }`}
                            >
                              <Heart
                                className={`h-4 w-4 ${post.liked_by_me ? "fill-gold" : ""}`}
                              />
                              {post.likes_count}
                            </button>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
          <FooterLinks />
        </div>
      </StudentLayout>
    </ModuleGuard>
  );
}
