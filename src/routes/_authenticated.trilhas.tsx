import { createFileRoute } from "@tanstack/react-router";
import { ModuleGuard } from "@/components/ModuleGuard";
import { StudentLayout } from "@/components/StudentLayout";
import { FooterLinks } from "@/components/FooterLinks";
import { ContentCard } from "@/components/ContentCard";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { listContentItems } from "@/lib/content.functions";
import { listFavorites, toggleFavorite } from "@/lib/favorites.functions";
import { trackContentView, trackContentDownload } from "@/lib/progress.functions";
import { useMemo, useCallback } from "react";
import { Route as RouteIcon } from "lucide-react";

export const Route = createFileRoute("/_authenticated/trilhas")({
  component: TrilhasPage,
});

function TrilhasPage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["content-items"],
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
  const dbJourneys = data?.journeys || [];

  // Group items by journey
  const journeyGroups = useMemo(() => {
    const groups: Record<string, { journey: any; items: any[] }> = {};
    
    for (const j of dbJourneys) {
      groups[j.slug] = { journey: j, items: [] };
    }

    for (const item of allItems) {
      if (!item.is_active || !item.journey_group) continue;
      if (groups[item.journey_group]) {
        groups[item.journey_group].items.push(item);
      }
    }

    // Sort items within each journey
    for (const g of Object.values(groups)) {
      g.items.sort((a: any, b: any) => (a.journey_order || 0) - (b.journey_order || 0));
    }

    return Object.values(groups).filter(g => g.items.length > 0);
  }, [allItems, dbJourneys]);

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
    <ModuleGuard moduleKey="trilhas">
      <StudentLayout>
        <div className="min-h-screen flex flex-col bg-background">
          <div className="flex-1 w-full pb-28">
            <div className="mx-auto max-w-6xl px-5 sm:px-8 py-8 sm:py-12">
              <div className="flex items-center gap-3 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-600">
                <RouteIcon className="h-7 w-7 text-gold" />
                <div>
                  <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground/90 tracking-tight">
                    Trilhas
                  </h1>
                  <p className="text-[13px] text-muted-foreground/50 mt-0.5">
                    Jornadas guiadas para sua alma
                  </p>
                </div>
              </div>

              {isLoading ? (
                <div className="text-center py-24">
                  <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground/60 animate-pulse">
                    Carregando trilhas...
                  </p>
                </div>
              ) : journeyGroups.length === 0 ? (
                <div className="text-center py-24">
                  <RouteIcon className="h-10 w-10 text-muted-foreground/30 mx-auto mb-5" />
                  <p className="text-sm text-muted-foreground/60 mb-2">
                    Nenhuma trilha disponível no momento.
                  </p>
                  <p className="text-xs text-muted-foreground/40">
                    Em breve teremos jornadas especiais para você.
                  </p>
                </div>
              ) : (
                <div className="space-y-12">
                  {journeyGroups.map((group) => (
                    <section key={group.journey.slug} className="space-y-4">
                      <div className="flex items-center gap-2.5">
                        <span className="text-lg">{group.journey.icon || "🛤️"}</span>
                        <h2 className="font-display text-lg sm:text-xl font-bold text-foreground/85 tracking-tight">
                          {group.journey.name}
                        </h2>
                        <div className="flex-1 h-px bg-gradient-to-r from-gold/10 to-transparent" />
                        <span className="text-[10px] text-muted-foreground/40 uppercase tracking-wider">
                          {group.items.length} conteúdo{group.items.length !== 1 ? "s" : ""}
                        </span>
                      </div>
                      {group.journey.description && (
                        <p className="text-xs text-muted-foreground/50 -mt-2 ml-8">
                          {group.journey.description}
                        </p>
                      )}
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                        {group.items.map((item: any, idx: number) => (
                          <ContentCard
                            key={item.id}
                            item={item}
                            index={idx}
                            hasAccess={hasAccess}
                            gradient="from-teal-900/40 via-teal-950/30 to-slate-950/50"
                            TypeIcon={RouteIcon}
                            progress={progressMap[item.id]}
                            isFavorite={favoriteIds.has(item.id)}
                            onToggleFavorite={handleToggleFavorite}
                            onTrackView={handleTrackView}
                            onTrackDownload={handleTrackDownload}
                          />
                        ))}
                      </div>
                    </section>
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
