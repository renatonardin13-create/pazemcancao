import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { listContentItems } from "@/lib/content.functions";
import { checkBuyerAccess } from "@/lib/access.functions";
import { AppHeader } from "@/components/AppHeader";
import { FooterLinks } from "@/components/FooterLinks";
import { BookOpen, Video, GraduationCap, FileText, Download, ExternalLink, Play, Lock, ShoppingCart } from "lucide-react";
import { motion } from "framer-motion";

export const Route = createFileRoute("/_authenticated/conteudo")({
  component: ContentPage,
});

const typeConfig: Record<string, { label: string; icon: any; gradient: string }> = {
  ebook: { label: "E-books", icon: BookOpen, gradient: "from-blue-900/40 via-blue-950/30 to-slate-950/50" },
  video: { label: "Videoaulas", icon: Video, gradient: "from-purple-900/40 via-purple-950/30 to-slate-950/50" },
  free_lesson: { label: "Aulas Gratuitas", icon: GraduationCap, gradient: "from-emerald-900/40 via-emerald-950/30 to-slate-950/50" },
  material: { label: "Materiais", icon: FileText, gradient: "from-amber-900/40 via-amber-950/30 to-slate-950/50" },
};

function getYouTubeEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url);
    let videoId: string | null = null;
    if (u.hostname.includes("youtube.com")) videoId = u.searchParams.get("v");
    else if (u.hostname.includes("youtu.be")) videoId = u.pathname.slice(1);
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  } catch {
    return null;
  }
}

function ContentPage() {
  const { data: accessData } = useQuery({
    queryKey: ["buyer-access"],
    queryFn: () => checkBuyerAccess(),
  });

  const { data, isLoading } = useQuery({
    queryKey: ["content-items"],
    queryFn: () => listContentItems(),
  });

  const hasAccess = accessData?.hasAccess;
  const items = data?.items || [];

  const groupedItems = items.reduce((acc: Record<string, any[]>, item: any) => {
    const type = item.content_type || "material";
    if (!acc[type]) acc[type] = [];
    acc[type].push(item);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader />

      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8 space-y-12">
        <div className="text-center">
          <h1 className="font-display text-3xl font-bold text-foreground/85 tracking-tight">
            Conteúdos Exclusivos
          </h1>
          <p className="mt-2 text-sm text-muted-foreground/40">
            E-books, videoaulas e materiais para sua jornada espiritual
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-16">
            <p className="text-[11px] uppercase tracking-[0.4em] text-muted-foreground/25 animate-pulse">
              Carregando conteúdos...
            </p>
          </div>
        ) : !items.length ? (
          <div className="text-center py-16 rounded-2xl border border-border/15 bg-card/5">
            <BookOpen className="h-8 w-8 text-muted-foreground/15 mx-auto mb-4" />
            <p className="text-sm text-muted-foreground/35">Nenhum conteúdo disponível ainda.</p>
          </div>
        ) : (
          Object.entries(groupedItems).map(([type, typeItems]) => {
            const config = typeConfig[type] || typeConfig.material;
            const TypeIcon = config.icon;

            return (
              <section key={type} className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted/15">
                    <TypeIcon className="h-4 w-4 text-gold/50" />
                  </div>
                  <h2 className="font-display text-lg font-bold text-foreground/75 tracking-tight">
                    {config.label}
                  </h2>
                  <span className="text-[10px] text-muted-foreground/25">{typeItems.length} item(ns)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {typeItems.map((item: any, idx: number) => {
                    const canAccess = item.is_free || hasAccess;
                    const embedUrl = item.video_url ? getYouTubeEmbedUrl(item.video_url) : null;

                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05, duration: 0.5 }}
                        className="group rounded-2xl border border-border/15 bg-card/5 overflow-hidden hover:bg-card/10 transition-all duration-500"
                      >
                        {/* Cover or Video */}
                        {embedUrl && canAccess ? (
                          <div className="aspect-video w-full">
                            <iframe
                              src={embedUrl}
                              title={item.title}
                              className="w-full h-full"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          </div>
                        ) : item.cover_url ? (
                          <div className="relative aspect-video w-full overflow-hidden">
                            <img src={item.cover_url} alt={item.title} className="w-full h-full object-cover" />
                            {!canAccess && (
                              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                <Lock className="h-6 w-6 text-white/50" />
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className={`aspect-video w-full bg-gradient-to-br ${config.gradient} flex items-center justify-center`}>
                            {!canAccess ? (
                              <Lock className="h-8 w-8 text-white/20" />
                            ) : (
                              <TypeIcon className="h-8 w-8 text-white/15" />
                            )}
                          </div>
                        )}

                        <div className="p-4 space-y-3">
                          <h3 className="text-sm font-semibold text-foreground/75 line-clamp-2">
                            {item.title}
                          </h3>
                          {item.description && (
                            <p className="text-[11px] text-muted-foreground/35 line-clamp-2">
                              {item.description}
                            </p>
                          )}

                          {item.is_free && (
                            <span className="inline-block text-[9px] font-bold uppercase tracking-widest text-emerald-400/60 bg-emerald-500/8 border border-emerald-500/15 rounded-full px-2 py-0.5">
                              Gratuito
                            </span>
                          )}

                          {/* Actions */}
                          <div className="flex items-center gap-2 pt-1">
                            {canAccess ? (
                              <>
                                {item.file_url && (
                                  <a
                                    href={item.file_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1.5 rounded-full bg-gold/10 text-gold/60 border border-gold/12 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider hover:bg-gold/20 transition-all"
                                  >
                                    <Download className="h-3 w-3" />
                                    Baixar
                                  </a>
                                )}
                                {item.video_url && !embedUrl && (
                                  <a
                                    href={item.video_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1.5 rounded-full bg-gold/10 text-gold/60 border border-gold/12 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider hover:bg-gold/20 transition-all"
                                  >
                                    <Play className="h-3 w-3" />
                                    Assistir
                                  </a>
                                )}
                              </>
                            ) : (
                              <>
                                {item.sales_page_url ? (
                                  <a
                                    href={item.sales_page_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1.5 rounded-full bg-gold/10 text-gold/60 border border-gold/12 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider hover:bg-gold/20 transition-all"
                                  >
                                    <ShoppingCart className="h-3 w-3" />
                                    Comprar
                                  </a>
                                ) : (
                                  <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground/30">
                                    <Lock className="h-3 w-3" />
                                    Conteúdo exclusivo
                                  </span>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </section>
            );
          })
        )}
      </div>

      <FooterLinks />
    </div>
  );
}
