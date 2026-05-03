import { createFileRoute } from "@tanstack/react-router";
import { ModuleGuard } from "@/components/ModuleGuard";
import { StudentLayout } from "@/components/StudentLayout";
import { FooterLinks } from "@/components/FooterLinks";
import { ContentCard } from "@/components/ContentCard";
import { POSTER_GRID } from "@/lib/card-grid";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { listContentItems } from "@/lib/content.functions";
import { listFavorites, toggleFavorite } from "@/lib/favorites.functions";
import { trackContentView, trackContentDownload } from "@/lib/progress.functions";
import { useMemo, useCallback } from "react";
import { Rocket } from "lucide-react";

export const Route = createFileRoute("/_authenticated/lancamentos")({
  component: LancamentosPage,
});

function LancamentosPage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["content-items", undefined],
    queryFn: () => listContentItems(),
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

  // Filter launch content (launch_mode != 'none')
  const launchItems = useMemo(() => {
    return allItems.filter((item: any) => {
      if (!item.is_active) return false;
      return item.launch_mode && item.launch_mode !== 'none';
    });
  }, [allItems]);

  const handleTrackView = useCallback((contentId: string) => {
    trackContentView({ data: { contentId } }).then(() => {
      queryClient.invalidateQueries({ queryKey: ["content-items"] });
    });
  }, [queryClient]);


  const handleTrackDownload = useCallback((contentId: string) => {
    trackContentDownload({ data: { contentId } }).then(() => {
      queryClient.invalidateQueries({ queryKey: ["content-items"] });
    });
  }, [queryClient]);


  const handleToggleFavorite = useCallback((contentId: string, currentlyFav: boolean) => {
    toggleFavorite({ data: { contentId, isFavorite: currentlyFav } }).then(() => {
      queryClient.invalidateQueries({ queryKey: ["user-favorites"] });
    });
  }, [queryClient]);

  return (
    <ModuleGuard moduleKey="lancamentos">
      <StudentLayout>
        <div className="min-h-screen flex flex-col bg-background">
          <div className="flex-1 w-full pb-28">
            <div className="mx-auto max-w-6xl px-5 sm:px-8 py-8 sm:py-12">
              <div className="flex items-center gap-3 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-600">
                <Rocket className="h-7 w-7 text-gold" />
                <div>
                  <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground/90 tracking-tight">
                    Lançamentos
                  </h1>
                  <p className="text-[13px] text-muted-foreground/50 mt-0.5">
                    Novidades e conteúdos em destaque
                  </p>
                </div>
              </div>

              {isLoading ? (
                <div className="text-center py-24">
                  <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground/60 animate-pulse">
                    Carregando lançamentos...
                  </p>
                </div>
              ) : launchItems.length === 0 ? (
                <div className="text-center py-24">
                  <Rocket className="h-10 w-10 text-muted-foreground/30 mx-auto mb-5" />
                  <p className="text-sm text-muted-foreground/60 mb-2">
                    Nenhum lançamento no momento.
                  </p>
                  <p className="text-xs text-muted-foreground/40">
                    Em breve teremos novidades incríveis para você!
                  </p>
                </div>
              ) : (
                <div className={POSTER_GRID}>
                  {launchItems.map((item: any, idx: number) => (
                    <ContentCard
                      key={item.id}
                      item={item}
                      index={idx}
                      hasAccess={hasAccess}
                      gradient="from-purple-900/40 via-purple-950/30 to-slate-950/50"
                      TypeIcon={Rocket}
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
          </div>
          <FooterLinks />
        </div>
      </StudentLayout>
    </ModuleGuard>
  );
}
