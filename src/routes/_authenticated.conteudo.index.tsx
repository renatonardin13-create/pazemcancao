import { EmptyState } from "@/components/EmptyState";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useCallback } from "react";
import { trackContentView, trackContentDownload } from "@/lib/progress.functions";
import { listContentItems } from "@/lib/content.functions";
import { listFavorites, toggleFavorite } from "@/lib/favorites.functions";
import { getMyProfile } from "@/lib/profile.functions";
import { useAuth } from "@/hooks/use-auth";
import { StudentLayout } from "@/components/StudentLayout";
import { FooterLinks } from "@/components/FooterLinks";
import { ContentCard } from "@/components/ContentCard";
import { RecommendedSection } from "@/components/RecommendedSection";
import { TopRankingSection } from "@/components/TopRankingSection";
import { motion } from "framer-motion";
import {
  BookOpen,
  Video,
  GraduationCap,
  FileText,
  PlayCircle,
  Sparkles,
  Clock,
  CheckCircle2,
  Library,
  TrendingUp,
  Heart,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/conteudo/")({
  component: ContentPage,
});

const typeConfig: Record<
  string,
  { label: string; icon: any; gradient: string }
> = {
  ebook: {
    label: "E-books",
    icon: BookOpen,
    gradient: "from-blue-900/40 via-blue-950/30 to-slate-950/50",
  },
  video: {
    label: "Videoaulas",
    icon: Video,
    gradient: "from-purple-900/40 via-purple-950/30 to-slate-950/50",
  },
  free_lesson: {
    label: "Aulas Gratuitas",
    icon: GraduationCap,
    gradient: "from-emerald-900/40 via-emerald-950/30 to-slate-950/50",
  },
  material: {
    label: "Materiais",
    icon: FileText,
    gradient: "from-amber-900/40 via-amber-950/30 to-slate-950/50",
  },
};

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
}

function ContentPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

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

  const { data, isLoading } = useQuery({
    queryKey: ["content-items"],
    queryFn: () => listContentItems(),
    refetchOnWindowFocus: true,
    staleTime: 30_000,        // refetch after 30s when revisiting
    refetchInterval: 120_000, // auto-refresh every 2 min
  });

  const { data: profileData } = useQuery({
    queryKey: ["my-profile"],
    queryFn: () => getMyProfile(),
    staleTime: 60_000,
  });

  const { data: favData } = useQuery({
    queryKey: ["user-favorites"],
    queryFn: () => listFavorites(),
    staleTime: 30_000,
  });

  const favoriteIds = useMemo(() => new Set(favData?.favoriteIds || []), [favData]);

  const handleToggleFavorite = useCallback((contentId: string, currentlyFav: boolean) => {
    toggleFavorite({ data: { contentId, isFavorite: currentlyFav } }).then(() => {
      queryClient.invalidateQueries({ queryKey: ["user-favorites"] });
    });
  }, [queryClient]);

  const displayName =
    profileData?.profile?.display_name ||
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "";
  const firstName = displayName.split(" ")[0];

  const hasAccess = data?.hasFullAccess ?? false;
  const allItems = data?.items || [];
  const progressMap: Record<string, any> = data?.progressMap || {};
  const dbCategories = data?.categories || [];
  const dbJourneys = data?.journeys || [];

  // CRITICAL: Only show items that are active AND (unlocked OR free OR user has full access)
  // This ensures "published ≠ released" — only truly accessible content appears
  const items = useMemo(() => {
    return allItems.filter((item: any) => {
      if (!item.is_active) return false;
      if (item.show_as_card === false) return false;
      return true; // Server already handles access logic via `unlocked` field
    });
  }, [allItems]);

  // Compute stats for the library
  const stats = useMemo(() => {
    let unlocked = 0;
    let inProgress = 0;
    let completed = 0;

    for (const item of items) {
      if (!item.unlocked) continue;
      unlocked++;
      const p = progressMap[item.id];
      if (p?.completed_at) completed++;
      else if (p?.viewed_at) inProgress++;
    }
    return { unlocked, inProgress, completed };
  }, [items, progressMap]);

  // Find last accessed content
  const lastAccessedId = useMemo(() => {
    let latest: { id: string; time: number } | null = null;
    for (const [contentId, p] of Object.entries(progressMap)) {
      if (!p) continue;
      const times = [p.viewed_at, p.completed_at, p.downloaded_at].filter(Boolean).map((t: string) => new Date(t).getTime());
      const maxTime = Math.max(0, ...times);
      if (maxTime > 0 && (!latest || maxTime > latest.time)) {
        latest = { id: contentId, time: maxTime };
      }
    }
    return latest?.id || null;
  }, [progressMap]);

  // Build category lookup from DB
  const categoryLookup = useMemo(() => {
    const map: Record<
      string,
      { name: string; icon: string; sortOrder: number; isFeatured: boolean }
    > = {};
    for (const c of dbCategories) {
      map[c.slug] = {
        name: c.icon
          ? `${c.icon} ${c.name.replace(/^[\p{Emoji}\s]+/u, "")}`
          : c.name,
        icon: c.icon || "",
        sortOrder: c.sortOrder,
        isFeatured: c.isFeatured,
      };
    }
    return map;
  }, [dbCategories]);

  // Build journey labels from DB
  const journeyLabels = useMemo(() => {
    const map: Record<string, string> = {};
    for (const j of dbJourneys) {
      map[j.slug] = j.icon ? `${j.icon} ${j.name}` : j.name;
    }
    return map;
  }, [dbJourneys]);

  // Track shown items to avoid duplication
  const shownIds = useMemo(() => new Set<string>(), [items]);

  // "Continuar de onde parou"
  const continueItems = useMemo(() => {
    const result = items
      .filter((item: any) => {
        const p = progressMap[item.id];
        return p?.viewed_at && !p?.completed_at && item.unlocked;
      })
      .sort((a: any, b: any) => {
        // Sort by most recently accessed first
        const aTime = progressMap[a.id]?.viewed_at ? new Date(progressMap[a.id].viewed_at).getTime() : 0;
        const bTime = progressMap[b.id]?.viewed_at ? new Date(progressMap[b.id].viewed_at).getTime() : 0;
        return bTime - aTime;
      })
      .slice(0, 5);
    result.forEach((i: any) => shownIds.add(i.id));
    return result;
  }, [items, progressMap, shownIds]);

  // "Conteúdos em destaque"
  const featuredItems = useMemo(() => {
    const result = items
      .filter(
        (item: any) =>
          item.is_featured &&
          !shownIds.has(item.id)
      )
      .sort(
        (a: any, b: any) =>
          (b.featured_priority || 0) - (a.featured_priority || 0)
      )
      .slice(0, 4);
    result.forEach((i: any) => shownIds.add(i.id));
    return result;
  }, [items, shownIds]);

  // "Novos conteúdos"
  const newItems = useMemo(() => {
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const result = items
      .filter(
        (item: any) =>
          !shownIds.has(item.id) &&
          new Date(item.created_at).getTime() > thirtyDaysAgo
      )
      .sort(
        (a: any, b: any) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
      .slice(0, 4);
    result.forEach((i: any) => shownIds.add(i.id));
    return result;
  }, [items, shownIds]);

  // Group remaining items
  const categoryGroups: Record<string, any[]> = {};
  const typeGroups: Record<string, any[]> = {};
  const journeyGroups: Record<string, any[]> = {};

  for (const item of items) {
    if (item.journey_group) {
      const jg = item.journey_group;
      if (!journeyGroups[jg]) journeyGroups[jg] = [];
      journeyGroups[jg].push(item);
    }
    if (item.display_category) {
      const cat = item.display_category;
      if (!categoryGroups[cat]) categoryGroups[cat] = [];
      categoryGroups[cat].push(item);
    } else if (!shownIds.has(item.id)) {
      const type = item.content_type || "material";
      if (!typeGroups[type]) typeGroups[type] = [];
      typeGroups[type].push(item);
    }
  }

  const sortItems = (a: any, b: any) => {
    if (a.sort_order !== b.sort_order) return a.sort_order - b.sort_order;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  };
  const sortJourneyItems = (a: any, b: any) => {
    if ((a.journey_order || 0) !== (b.journey_order || 0))
      return (a.journey_order || 0) - (b.journey_order || 0);
    return a.sort_order - b.sort_order;
  };
  for (const arr of [
    ...Object.values(categoryGroups),
    ...Object.values(typeGroups),
  ]) {
    arr.sort(sortItems);
  }
  for (const arr of Object.values(journeyGroups)) {
    arr.sort(sortJourneyItems);
  }

  // Sort categories by DB sort_order
  const sortedCategories = useMemo(() => {
    const entries = Object.entries(categoryGroups);
    return entries.sort(([a], [b]) => {
      const ao = categoryLookup[a]?.sortOrder ?? 999;
      const bo = categoryLookup[b]?.sortOrder ?? 999;
      return ao - bo;
    });
  }, [categoryGroups, categoryLookup]);

  const featuredCategories = sortedCategories.filter(
    ([cat]) => categoryLookup[cat]?.isFeatured
  );
  const otherCategories = sortedCategories.filter(
    ([cat]) => !categoryLookup[cat]?.isFeatured
  );

  return (
    <StudentLayout>
      <div className="min-h-screen bg-background text-foreground">
        <div className="mx-auto max-w-6xl px-5 sm:px-8 py-8 sm:py-12 space-y-12 sm:space-y-16">
          {/* Greeting + Stats */}
          <div className="space-y-6">
            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground/85 tracking-tight">
                {getGreeting()}
                {firstName ? `, ${firstName}` : ""}
              </h1>
              <p className="mt-2 text-[13px] text-muted-foreground/45 font-light leading-relaxed">
                Sua jornada espiritual continua aqui
              </p>
            </div>

            {/* Stats bar */}
            {stats.unlocked > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="flex flex-wrap gap-4 sm:gap-6"
              >
                <StatPill icon={Library} label="Disponíveis" value={stats.unlocked} color="text-gold/60" />
                <StatPill icon={TrendingUp} label="Em andamento" value={stats.inProgress} color="text-primary/60" />
                <StatPill icon={CheckCircle2} label="Concluídos" value={stats.completed} color="text-player-completed/60" />
              </motion.div>
            )}
          </div>

          {isLoading ? (
            <div className="text-center py-16">
              <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground/60 animate-pulse">
                Carregando conteúdos...
              </p>
            </div>
          ) : !items.length ? (
            <EmptyState
              icon={BookOpen}
              title="Nenhum conteúdo disponível"
              description="Novos conteúdos serão adicionados em breve. Volte mais tarde!"
            />
          ) : (
            <>
              {/* Continue de onde parou */}
              {continueItems.length > 0 && (
                <ContentShelf
                  icon={<PlayCircle className="h-4 w-4 text-primary/70" />}
                  title="Continuar de onde parou"
                  subtitle="Retome seus conteúdos em andamento"
                  items={continueItems}
                  hasAccess={hasAccess}
                  progressMap={progressMap}
                  lastAccessedId={lastAccessedId}
                  onTrackView={handleTrackView}
                  onTrackDownload={handleTrackDownload}
                  favoriteIds={favoriteIds}
                  onToggleFavorite={handleToggleFavorite}
                />
              )}

              {/* Seus favoritos */}
              {(() => {
                const favItems = items.filter((i: any) => favoriteIds.has(i.id));
                if (favItems.length === 0) return null;
                return (
                  <ContentShelf
                    icon={<Heart className="h-4 w-4 text-red-400/70" />}
                    title="Seus favoritos"
                    subtitle="Conteúdos salvos por você"
                    items={favItems}
                    hasAccess={hasAccess}
                    progressMap={progressMap}
                    lastAccessedId={lastAccessedId}
                    onTrackView={handleTrackView}
                    onTrackDownload={handleTrackDownload}
                    favoriteIds={favoriteIds}
                    onToggleFavorite={handleToggleFavorite}
                  />
                );
              })()}

              {/* Conteúdos em destaque */}
              {featuredItems.length > 0 && (
                <ContentShelf
                  icon={<Sparkles className="h-4 w-4 text-gold/70" />}
                  title="Conteúdos em destaque"
                  subtitle="Selecionados especialmente para você"
                  items={featuredItems}
                  hasAccess={hasAccess}
                  progressMap={progressMap}
                  lastAccessedId={lastAccessedId}
                  onTrackView={handleTrackView}
                  onTrackDownload={handleTrackDownload}
                  favoriteIds={favoriteIds}
                  onToggleFavorite={handleToggleFavorite}
                />
              )}

              {/* Novos conteúdos */}
              {newItems.length > 0 && (
                <ContentShelf
                  icon={<Clock className="h-4 w-4 text-emerald-400/70" />}
                  title="Novos conteúdos"
                  subtitle="Adicionados recentemente"
                  items={newItems}
                  hasAccess={hasAccess}
                  progressMap={progressMap}
                  lastAccessedId={lastAccessedId}
                  onTrackView={handleTrackView}
                  onTrackDownload={handleTrackDownload}
                  favoriteIds={favoriteIds}
                  onToggleFavorite={handleToggleFavorite}
                />
              )}

              {/* Top da semana */}
              <TopRankingSection
                items={items}
                hasAccess={hasAccess}
                popularityMap={data?.weeklyPopularityMap || {}}
                progressMap={progressMap}
                lastAccessedId={lastAccessedId}
                mode="weekly"
              />

              {/* Mais acessados (all time) */}
              <TopRankingSection
                items={items}
                hasAccess={hasAccess}
                popularityMap={data?.popularityMap || {}}
                progressMap={progressMap}
                lastAccessedId={lastAccessedId}
                mode="all_time"
              />

              {/* Categorias em Destaque */}
              {featuredCategories.map(([cat, catItems]: [string, any[]]) => {
                const label =
                  categoryLookup[cat]?.name ||
                  cat.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase());
                const config =
                  typeConfig[catItems[0]?.content_type] || typeConfig.material;
                return (
                  <section key={`cat-${cat}`} className="space-y-4">
                    <SectionHeader title={label} count={catItems.length} />
                    <ContentGrid
                      items={catItems}
                      hasAccess={hasAccess}
                      config={config}
                      progressMap={progressMap}
                      lastAccessedId={lastAccessedId}
                      onTrackView={handleTrackView}
                      onTrackDownload={handleTrackDownload}
                    />
                  </section>
                );
              })}

              {/* Jornadas */}
              {Object.keys(journeyGroups).length > 0 && (
                <section className="space-y-8">
                  <div>
                    <h2 className="font-display text-xl font-bold text-foreground/85 tracking-tight">
                      ✨ Sua Jornada
                    </h2>
                    <p className="mt-1 text-xs text-muted-foreground/60">
                      Trilhas guiadas para acompanhar seu momento
                    </p>
                  </div>
                  {Object.entries(journeyGroups).map(([jg, jgItems]) => {
                    const label =
                      journeyLabels[jg] ||
                      jg.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
                    return (
                      <div key={`journey-${jg}`} className="space-y-4">
                        <SectionHeader title={label} count={jgItems.length} />
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                          {jgItems.map((item: any, idx: number) => {
                            const itemConfig =
                              typeConfig[item.content_type] || typeConfig.material;
                            return (
                              <ContentCard
                                key={`j-${item.id}`}
                                item={item}
                                index={idx}
                                hasAccess={item.is_free || hasAccess}
                                gradient={itemConfig.gradient}
                                TypeIcon={itemConfig.icon}
                                progress={progressMap[item.id]}
                                isLastAccessed={item.id === lastAccessedId}
                              />
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </section>
              )}

              {/* Demais Categorias */}
              {otherCategories.map(([cat, catItems]: [string, any[]]) => {
                const label =
                  categoryLookup[cat]?.name ||
                  cat.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase());
                const config =
                  typeConfig[catItems[0]?.content_type] || typeConfig.material;
                return (
                  <section key={`cat-${cat}`} className="space-y-4">
                    <SectionHeader title={label} count={catItems.length} />
                    <ContentGrid
                      items={catItems}
                      hasAccess={hasAccess}
                      config={config}
                      progressMap={progressMap}
                      lastAccessedId={lastAccessedId}
                      onTrackView={handleTrackView}
                      onTrackDownload={handleTrackDownload}
                    />
                  </section>
                );
              })}

              {/* Seções por tipo (sem categoria) */}
              {Object.entries(typeGroups).map(([type, typeItems]) => {
                const config = typeConfig[type] || typeConfig.material;
                const TypeIcon = config.icon;
                return (
                  <section key={type} className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted/10">
                        <TypeIcon className="h-4 w-4 text-gold/60" />
                      </div>
                      <div>
                        <h2 className="font-display text-lg font-bold text-foreground/80 tracking-tight">
                          {config.label}
                        </h2>
                        <p className="text-xs text-muted-foreground/50">
                          {typeItems.length} conteúdo{typeItems.length > 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                    <ContentGrid
                      items={typeItems}
                      hasAccess={hasAccess}
                      config={config}
                      progressMap={progressMap}
                      lastAccessedId={lastAccessedId}
                      onTrackView={handleTrackView}
                      onTrackDownload={handleTrackDownload}
                    />
                  </section>
                );
              })}

              {/* Recomendado */}
              <RecommendedSection
                items={items}
                hasAccess={hasAccess}
                viewedIds={data?.viewedIds || []}
                downloadedIds={data?.downloadedIds || []}
                progressMap={progressMap}
                popularityMap={data?.popularityMap || {}}
              />
            </>
          )}
        </div>

        <FooterLinks />
      </div>
    </StudentLayout>
  );
}

/* ── Reusable sub-components ── */

function SectionHeader({ title, count }: { title: string; count: number }) {
  return (
    <div className="flex items-center gap-3">
      <h2 className="font-display text-lg font-bold text-foreground/75 tracking-tight">
        {title}
      </h2>
      <div className="flex-1 h-px bg-gradient-to-r from-border/10 to-transparent" />
      <span className="text-[11px] text-muted-foreground/35 tracking-wider">
        {count} conteúdo{count > 1 ? "s" : ""}
      </span>
    </div>
  );
}

function ContentShelf({
  icon,
  title,
  subtitle,
  items,
  hasAccess,
  progressMap,
  lastAccessedId,
  onTrackView,
  onTrackDownload,
  favoriteIds,
  onToggleFavorite,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  items: any[];
  hasAccess: boolean;
  progressMap: Record<string, any>;
  lastAccessedId: string | null;
  onTrackView?: (contentId: string) => void;
  onTrackDownload?: (contentId: string) => void;
  favoriteIds?: Set<string>;
  onToggleFavorite?: (contentId: string, isFav: boolean) => void;
}) {
  return (
    <section className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gold/[0.06] border border-gold/8">
          {icon}
        </div>
        <div className="flex-1">
          <h2 className="font-display text-lg font-bold text-foreground/80 tracking-tight">
            {title}
          </h2>
          <p className="text-[11px] text-muted-foreground/40 mt-0.5">{subtitle}</p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
        {items.map((item: any, idx: number) => {
          const config = typeConfig[item.content_type] || typeConfig.material;
          return (
            <ContentCard
              key={`shelf-${item.id}`}
              item={item}
              index={idx}
              hasAccess={item.is_free || hasAccess}
              gradient={config.gradient}
              TypeIcon={config.icon}
              progress={progressMap[item.id]}
              isLastAccessed={item.id === lastAccessedId}
              onTrackView={onTrackView}
              onTrackDownload={onTrackDownload}
              isFavorite={favoriteIds?.has(item.id)}
              onToggleFavorite={onToggleFavorite}
            />
          );
        })}
      </div>
    </section>
  );
}

function ContentGrid({
  items,
  hasAccess,
  config,
  progressMap,
  lastAccessedId,
  onTrackView,
  onTrackDownload,
  favoriteIds,
  onToggleFavorite,
}: {
  items: any[];
  hasAccess: boolean;
  config: { gradient: string; icon: any };
  progressMap: Record<string, any>;
  lastAccessedId: string | null;
  onTrackView?: (contentId: string) => void;
  onTrackDownload?: (contentId: string) => void;
  favoriteIds?: Set<string>;
  onToggleFavorite?: (contentId: string, isFav: boolean) => void;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
      {items.map((item: any, idx: number) => (
        <ContentCard
          key={item.id}
          item={item}
          index={idx}
          hasAccess={item.is_free || hasAccess}
          gradient={config.gradient}
          TypeIcon={config.icon}
          progress={progressMap[item.id]}
          isLastAccessed={item.id === lastAccessedId}
          onTrackView={onTrackView}
          onTrackDownload={onTrackDownload}
          isFavorite={favoriteIds?.has(item.id)}
          onToggleFavorite={onToggleFavorite}
        />
      ))}
    </div>
  );
}

function StatPill({ icon: Icon, label, value, color }: { icon: any; label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-2.5 rounded-xl bg-card/20 border border-border/8 px-4 py-2.5">
      <Icon className={`h-3.5 w-3.5 ${color}`} />
      <div className="flex items-baseline gap-1.5">
        <span className="text-sm font-bold text-foreground/75 tabular-nums">{value}</span>
        <span className="text-[11px] text-muted-foreground/40 tracking-wide">{label}</span>
      </div>
    </div>
  );
}
