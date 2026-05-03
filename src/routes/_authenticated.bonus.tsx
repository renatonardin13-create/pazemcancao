import { createFileRoute } from "@tanstack/react-router";
import { ModuleGuard } from "@/components/ModuleGuard";
import { StudentLayout } from "@/components/StudentLayout";
import { FooterLinks } from "@/components/FooterLinks";
import { ContentCard } from "@/components/ContentCard";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { listContentItems } from "@/lib/content.functions";
import { listFavorites, toggleFavorite } from "@/lib/favorites.functions";
import { trackContentView, trackContentDownload } from "@/lib/progress.functions";
import { POSTER_GRID } from "@/lib/card-grid";
import { useMemo, useCallback } from "react";
import { Gift } from "lucide-react";

export const Route = createFileRoute("/_authenticated/bonus")({
  component: BonusPage,
});

function BonusPage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["content-items", undefined],
    staleTime: 60_000,
  });

  const { data: favData } = useQuery({
    queryKey: ["user-favorites"],
    queryFn: () => listFavorites(),
    staleTime: 30_000,
  });

  const favoriteIds = useMemo(() => new Set(favData?.favoriteIds || []), [favData]);
  const hasAccess = data?.hasFullAccess ?? false;
  const progressMap: Record<string, any> = data?.progressMap || {};
  const allItems = data?.items || [];

  // Bônus aqui = SOMENTE conteúdos extras (cursos, ebooks, vídeos).
  // Louvores bônus aparecem dentro da própria categoria, em /musicas.
  const bonusItems = useMemo(() => {
    return allItems.filter((item: any) => {
      if (!item.is_active) return false;
      return item.access_mode === 'bonus' || item.badge_text?.toLowerCase().includes('bônus');
    });
  }, [allItems]);

  const hasAnyBonus = bonusItems.length > 0;

  const handleTrackView = useCallback((contentId: string) => {
      queryClient.invalidateQueries({ queryKey: ["content-items"] });
    });
  }, [queryClient, undefined]);

  const handleTrackDownload = useCallback((contentId: string) => {
      queryClient.invalidateQueries({ queryKey: ["content-items"] });
    });
  }, [queryClient, undefined]);

  const handleToggleFavorite = useCallback((contentId: string, currentlyFav: boolean) => {
    toggleFavorite({ data: { contentId, isFavorite: currentlyFav } }).then(() => {
      queryClient.invalidateQueries({ queryKey: ["user-favorites"] });
    });
  }, [queryClient]);

  return (
    <ModuleGuard moduleKey="bonus">
      <StudentLayout>
        <div className="min-h-screen flex flex-col bg-background">
          <div className="flex-1 w-full pb-28">
            <div className="mx-auto max-w-6xl px-5 sm:px-8 py-8 sm:py-12">
              <div className="flex items-center gap-3 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-600">
                <Gift className="h-7 w-7 text-gold" />
                <div>
                  <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground/90 tracking-tight">
                    Bônus
                  </h1>
                  <p className="text-[13px] text-muted-foreground/50 mt-0.5">
                    Conteúdos exclusivos de presente para você
                  </p>
                </div>
              </div>

              {isLoading ? (
                <div className="text-center py-24">
                  <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground/60 animate-pulse">
                    Carregando bônus...
                  </p>
                </div>
              ) : !hasAnyBonus ? (
                <div className="text-center py-24">
                  <Gift className="h-10 w-10 text-muted-foreground/30 mx-auto mb-5" />
                  <p className="text-sm text-muted-foreground/60 mb-2">
                    Nenhum bônus disponível no momento.
                  </p>
                  <p className="text-xs text-muted-foreground/40">
                    Fique de olho! Novos bônus podem aparecer a qualquer momento.
                  </p>
                </div>
              ) : (
                <div className="space-y-12">
                  {bonusItems.length > 0 && (
                    <div className={POSTER_GRID}>
                      {bonusItems.map((item: any, idx: number) => (
                        <ContentCard
                          key={item.id}
                          item={item}
                          index={idx}
                          hasAccess={hasAccess}
                          gradient="from-amber-900/40 via-amber-950/30 to-slate-950/50"
                          TypeIcon={Gift}
                          progress={progressMap[item.id]}
                          isFavorite={favoriteIds.has(item.id)}
                          onToggleFavorite={handleToggleFavorite}
                          onTrackView={handleTrackView}
                          onTrackDownload={handleTrackDownload}
                        />
                      ))}
                    </div>
                  )}

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
