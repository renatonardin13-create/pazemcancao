import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ModuleGuard } from "@/components/ModuleGuard";
import { StudentLayout } from "@/components/StudentLayout";
import { FooterLinks } from "@/components/FooterLinks";
import { Users, Heart, Trash2, Send, Loader2, MessageCircle, HandHeart, Sparkles, Share2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useArea } from "@/providers/AreaProvider";

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

type FilterKey = "todos" | "oracao" | "testemunho" | "compartilhamento";

const FILTERS: { key: FilterKey; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: "todos", label: "Todos", icon: MessageCircle },
  { key: "oracao", label: "Pedidos de Oração", icon: HandHeart },
  { key: "testemunho", label: "Testemunhos", icon: Sparkles },
  { key: "compartilhamento", label: "Compartilhamentos", icon: Share2 },
];

function ComunidadePage() {
  const { user, isAdmin } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState<FilterKey>("todos");
  const { currentArea } = useArea();

  const loadPosts = async () => {
    let query = supabase
      .from("community_posts")
      .select("id, user_id, author_name, author_avatar_url, content, created_at, area_id");
    
    if (currentArea?.id) {
      query = query.eq("area_id", currentArea.id);
    }

    const { data: postsData, error } = await query
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
  }, [user?.id, currentArea?.id]);

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
      area_id: currentArea?.id || null,
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

  // Client-side keyword-based filter (graceful: shows everything if no match exists)
  const filteredPosts = (() => {
    if (filter === "todos") return posts;
    const keywords: Record<Exclude<FilterKey, "todos">, string[]> = {
      oracao: ["oração", "oracao", "orem", "orai", "interceda", "intercessão"],
      testemunho: ["testemunho", "testifico", "deus fez", "milagre", "gratidão", "gratidao"],
      compartilhamento: ["compartilho", "compartilhando", "queria dividir", "queria compartilhar"],
    };
    const kws = keywords[filter];
    return posts.filter((p) => {
      const text = p.content.toLowerCase();
      return kws.some((k) => text.includes(k));
    });
  })();

  const myInitial = (user?.email?.charAt(0) || "M").toUpperCase();

  return (
    <ModuleGuard moduleKey="comunidade">
      <StudentLayout>
        <div className="min-h-screen flex flex-col bg-background">
          <main className="flex-1 w-full pb-28">
            <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
              {/* Header */}
              <div className="flex items-center gap-3 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gold/10 border border-gold/20">
                  <Users className="h-6 w-6 text-gold" />
                </div>
                <div>
                  <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
                    Comunidade
                  </h1>
                  <p className="text-[13px] text-muted-foreground/70 mt-0.5">
                    Espaço para compartilhar, orar e crescer com outros membros
                  </p>
                </div>
              </div>

              {/* Composer */}
              <div className="rounded-2xl border border-border/40 bg-card/40 backdrop-blur-sm p-5 mb-6">
                <div className="flex items-start gap-3">
                  <Avatar className="h-10 w-10 shrink-0">
                    <AvatarFallback className="bg-gold/20 text-gold text-sm font-bold">
                      {myInitial}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <Textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Compartilhe um pedido, testemunho ou palavra com a comunidade..."
                      maxLength={2000}
                      rows={3}
                      className="resize-none bg-background/40 border-border/40 focus-visible:ring-gold/30"
                    />
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-[11px] text-muted-foreground/60">
                        {content.length}/2000
                      </span>
                      <Button
                        onClick={handleSubmit}
                        disabled={submitting || !content.trim()}
                        size="sm"
                        className="bg-gold hover:bg-gold/90 text-gold-foreground font-bold"
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
                </div>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-4 -mx-1 px-1 scrollbar-hide">
                {FILTERS.map(({ key, label, icon: Icon }) => {
                  const active = filter === key;
                  return (
                    <button
                      key={key}
                      onClick={() => setFilter(key)}
                      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                        active
                          ? "border-gold/40 bg-gold/15 text-gold"
                          : "border-border/40 bg-card/30 text-muted-foreground/80 hover:bg-card/60 hover:text-foreground"
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {label}
                    </button>
                  );
                })}
              </div>

              {/* Feed */}
              {loading ? (
                <div className="flex justify-center py-16">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground/50" />
                </div>
              ) : filteredPosts.length === 0 ? (
                <div className="text-center py-20 rounded-2xl border border-dashed border-border/40 bg-card/20">
                  <Users className="h-10 w-10 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground/70">
                    {filter === "todos"
                      ? "Seja o primeiro a postar na comunidade."
                      : "Nenhum post nesta categoria ainda."}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredPosts.map((post) => {
                    const canDelete = user?.id === post.user_id || isAdmin;
                    return (
                      <article
                        key={post.id}
                        className="rounded-2xl border border-border/40 bg-card/40 backdrop-blur-sm p-5 hover:border-border/60 hover:bg-card/55 transition-all"
                      >
                        <div className="flex items-start gap-3">
                          <Avatar className="h-11 w-11 shrink-0 ring-1 ring-border/40">
                            <AvatarImage src={post.author_avatar_url ?? undefined} />
                            <AvatarFallback className="bg-gold/20 text-gold text-sm font-bold">
                              {post.author_name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-foreground truncate">
                                  {post.author_name}
                                </p>
                                <p className="text-[11px] text-muted-foreground/60">
                                  {formatDistanceToNow(new Date(post.created_at), {
                                    addSuffix: true,
                                    locale: ptBR,
                                  })}
                                </p>
                              </div>
                              {canDelete && (
                                <button
                                  onClick={() => deletePost(post)}
                                  className="text-muted-foreground/40 hover:text-destructive transition-colors p-1 -mr-1"
                                  aria-label="Excluir post"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                            <p className="text-[14px] leading-relaxed text-foreground/90 mt-2.5 whitespace-pre-wrap break-words">
                              {post.content}
                            </p>
                            <div className="flex items-center gap-4 mt-4 pt-3 border-t border-border/30">
                              <button
                                onClick={() => toggleLike(post)}
                                className={`inline-flex items-center gap-1.5 text-xs font-medium transition-colors ${
                                  post.liked_by_me
                                    ? "text-gold"
                                    : "text-muted-foreground/70 hover:text-foreground"
                                }`}
                              >
                                <Heart
                                  className={`h-4 w-4 ${post.liked_by_me ? "fill-gold" : ""}`}
                                />
                                {post.likes_count}
                              </button>
                            </div>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </div>
          </main>
          <FooterLinks />
        </div>
      </StudentLayout>
    </ModuleGuard>
  );
}
