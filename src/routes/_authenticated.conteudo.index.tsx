import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { listContentItems } from "@/lib/content.functions";
import { AppHeader } from "@/components/AppHeader";
import { FooterLinks } from "@/components/FooterLinks";
import { ContentCard } from "@/components/ContentCard";
import { RecommendedSection } from "@/components/RecommendedSection";
import { BookOpen, Video, GraduationCap, FileText, PlayCircle } from "lucide-react";

export const Route = createFileRoute("/_authenticated/conteudo/")({
  component: ContentPage,
});

const typeConfig: Record<string, { label: string; icon: any; gradient: string }> = {
  ebook: { label: "E-books", icon: BookOpen, gradient: "from-blue-900/40 via-blue-950/30 to-slate-950/50" },
  video: { label: "Videoaulas", icon: Video, gradient: "from-purple-900/40 via-purple-950/30 to-slate-950/50" },
  free_lesson: { label: "Aulas Gratuitas", icon: GraduationCap, gradient: "from-emerald-900/40 via-emerald-950/30 to-slate-950/50" },
  material: { label: "Materiais", icon: FileText, gradient: "from-amber-900/40 via-amber-950/30 to-slate-950/50" },
};

// Journey labels now come from DB

// Category order comes from DB now

function ContentPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["content-items"],
    queryFn: () => listContentItems(),
  });

  const hasAccess = data?.hasFullAccess ?? false;
  const items = data?.items || [];
  const progressMap = data?.progressMap || {};
  const dbCategories = data?.categories || [];
  const dbJourneys = data?.journeys || [];

  // Build category lookup from DB
  const categoryLookup = useMemo(() => {
    const map: Record<string, { name: string; icon: string; sortOrder: number; isFeatured: boolean }> = {};
    for (const c of dbCategories) {
      map[c.slug] = { name: c.icon ? `${c.icon} ${c.name.replace(/^[\p{Emoji}\s]+/u, '')}` : c.name, icon: c.icon || '', sortOrder: c.sortOrder, isFeatured: c.isFeatured };
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

  // Group items
  const categoryGroups: Record<string, any[]> = {};
  const typeGroups: Record<string, any[]> = {};
  const journeyGroups: Record<string, any[]> = {};

  for (const item of items) {
    if (item.journey_group && item.show_as_card !== false) {
      const jg = item.journey_group;
      if (!journeyGroups[jg]) journeyGroups[jg] = [];
      journeyGroups[jg].push(item);
    }
    if (item.display_category && item.show_as_card !== false) {
      const cat = item.display_category;
      if (!categoryGroups[cat]) categoryGroups[cat] = [];
      categoryGroups[cat].push(item);
    } else {
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
    if ((a.journey_order || 0) !== (b.journey_order || 0)) return (a.journey_order || 0) - (b.journey_order || 0);
    return a.sort_order - b.sort_order;
  };
  for (const arr of [...Object.values(categoryGroups), ...Object.values(typeGroups)]) {
    arr.sort(sortItems);
  }
  for (const arr of Object.values(journeyGroups)) {
    arr.sort(sortJourneyItems);
  }

  // "Continue sua caminhada"
  const continueItems = useMemo(() => {
    return items.filter((item: any) => {
      const p = progressMap[item.id];
      return p?.viewed_at && !p?.completed_at && item.unlocked;
    }).slice(0, 4);
  }, [items, progressMap]);

  // Sort categories by DB sort_order
  const sortedCategories = useMemo(() => {
    const entries = Object.entries(categoryGroups);
    return entries.sort(([a], [b]) => {
      const ao = categoryLookup[a]?.sortOrder ?? 999;
      const bo = categoryLookup[b]?.sortOrder ?? 999;
      return ao - bo;
    });
  }, [categoryGroups, categoryLookup]);

  // Featured categories first, then others
  const featuredCategories = sortedCategories.filter(([cat]) => categoryLookup[cat]?.isFeatured);
  const otherCategories = sortedCategories.filter(([cat]) => !categoryLookup[cat]?.isFeatured);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 space-y-12">
        {/* 1. Banner / Destaque */}
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
          <>
            {/* 2. Continue sua caminhada */}
            {continueItems.length > 0 && (
              <section className="space-y-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                    <PlayCircle className="h-4 w-4 text-primary/60" />
                  </div>
                  <div>
                    <h2 className="font-display text-lg font-bold text-foreground/75 tracking-tight">
                      ▶️ Continue sua caminhada
                    </h2>
                    <p className="text-[10px] text-muted-foreground/30">
                      Retome de onde parou
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {continueItems.map((item: any, idx: number) => {
                    const config = typeConfig[item.content_type] || typeConfig.material;
                    return (
                      <ContentCard
                        key={`cont-${item.id}`}
                        item={item}
                        index={idx}
                        hasAccess={item.is_free || hasAccess}
                        gradient={config.gradient}
                        TypeIcon={config.icon}
                      />
                    );
                  })}
                </div>
              </section>
            )}

            {/* 3. Categorias em Destaque */}
            {featuredCategories.map(([cat, catItems]: [string, any[]]) => {
              const label = categoryLookup[cat]?.name || cat.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase());
              const config = typeConfig[catItems[0]?.content_type] || typeConfig.material;
              return (
                <section key={`cat-${cat}`} className="space-y-5">
                  <div className="flex items-center gap-3">
                    <h2 className="font-display text-lg font-bold text-foreground/75 tracking-tight">
                      {label}
                    </h2>
                    <span className="text-[10px] text-muted-foreground/25">{catItems.length} item(ns)</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {catItems.map((item: any, idx: number) => (
                      <ContentCard
                        key={item.id}
                        item={item}
                        index={idx}
                        hasAccess={item.is_free || hasAccess}
                        gradient={config.gradient}
                        TypeIcon={config.icon}
                      />
                    ))}
                  </div>
                </section>
              );
            })}

            {/* 4. Sua Jornada */}
            {Object.keys(journeyGroups).length > 0 && (
              <section className="space-y-6">
                <div className="text-center">
                  <h2 className="font-display text-xl font-bold text-foreground/80 tracking-tight">
                    ✨ Sua Jornada
                  </h2>
                  <p className="mt-1 text-[11px] text-muted-foreground/35">
                    Trilhas guiadas para acompanhar seu momento
                  </p>
                </div>
                {Object.entries(journeyGroups).map(([jg, jgItems]) => {
                  const label = journeyLabels[jg] || jg.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
                  return (
                    <div key={`journey-${jg}`} className="space-y-4">
                      <div className="flex items-center gap-3">
                        <h3 className="font-display text-[15px] font-bold text-foreground/70 tracking-tight">
                          {label}
                        </h3>
                        <span className="text-[10px] text-muted-foreground/25">{jgItems.length} item(ns)</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                        {jgItems.map((item: any, idx: number) => {
                          const itemConfig = typeConfig[item.content_type] || typeConfig.material;
                          return (
                            <ContentCard
                              key={`j-${item.id}`}
                              item={item}
                              index={idx}
                              hasAccess={item.is_free || hasAccess}
                              gradient={itemConfig.gradient}
                              TypeIcon={itemConfig.icon}
                            />
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </section>
            )}

            {/* 5. Demais Categorias */}
            {otherCategories.map(([cat, catItems]: [string, any[]]) => {
              const label = categoryLookup[cat]?.name || cat.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase());
              const config = typeConfig[catItems[0]?.content_type] || typeConfig.material;
              return (
                <section key={`cat-${cat}`} className="space-y-5">
                  <div className="flex items-center gap-3">
                    <h2 className="font-display text-lg font-bold text-foreground/75 tracking-tight">
                      {label}
                    </h2>
                    <span className="text-[10px] text-muted-foreground/25">{catItems.length} item(ns)</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {catItems.map((item: any, idx: number) => (
                      <ContentCard
                        key={item.id}
                        item={item}
                        index={idx}
                        hasAccess={item.is_free || hasAccess}
                        gradient={config.gradient}
                        TypeIcon={config.icon}
                      />
                    ))}
                  </div>
                </section>
              );
            })}

            {/* Type-based sections (legacy) */}
            {Object.entries(typeGroups).map(([type, typeItems]) => {
              const config = typeConfig[type] || typeConfig.material;
              const TypeIcon = config.icon;
              return (
                <section key={type} className="space-y-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted/15">
                      <TypeIcon className="h-4 w-4 text-gold/50" />
                    </div>
                    <h2 className="font-display text-lg font-bold text-foreground/75 tracking-tight">
                      {config.label}
                    </h2>
                    <span className="text-[10px] text-muted-foreground/25">{typeItems.length} item(ns)</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {typeItems.map((item: any, idx: number) => (
                      <ContentCard
                        key={item.id}
                        item={item}
                        index={idx}
                        hasAccess={item.is_free || hasAccess}
                        gradient={config.gradient}
                        TypeIcon={config.icon}
                      />
                    ))}
                  </div>
                </section>
              );
            })}

            {/* 6. Recomendado para você (último) */}
            <RecommendedSection
              items={items}
              hasAccess={hasAccess}
              viewedIds={data?.viewedIds || []}
              downloadedIds={data?.downloadedIds || []}
              progressMap={progressMap}
            />
          </>
        )}
      </div>

      <FooterLinks />
    </div>
  );
}
