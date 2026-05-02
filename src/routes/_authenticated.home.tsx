import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { AlertCircle, RefreshCw, Loader2, LayoutGrid, ChevronRight, Sparkles } from "lucide-center";
import { ModuleGuard } from "@/components/ModuleGuard";
import { getStudentVitrineData } from "@/lib/student-vitrine.functions";
import { StudentLayout } from "@/components/StudentLayout";
import { HeroBanner } from "@/components/vitrine/HeroBanner";
import { VitrineCourseCard } from "@/components/vitrine/VitrineCourseCard";
import { ContinueWatchingSection } from "@/components/ContinueWatchingSection";
import { POSTER_GRID } from "@/lib/card-grid";
import { CardScopeProvider } from "@/hooks/use-cards-config";
import type { VitrineShelf, VitrineCourse } from "@/components/vitrine/types";

export const Route = createFileRoute("/_authenticated/home")({
  component: VitrinePageWithScope,
  errorComponent: VitrineErrorFallback,
});

function VitrinePageWithScope() {
  return (
    <CardScopeProvider scope="home">
      <VitrinePage />
    </CardScopeProvider>
  );
}

function VitrineErrorFallback({ error }: { error: Error }) {
  return (
    <StudentLayout>
      <div className="mx-auto flex min-h-[60vh] w-full max-w-2xl flex-col items-center justify-center gap-4 px-6 text-center">
        <AlertCircle className="h-10 w-10 text-muted-foreground" />
        <h2 className="font-display text-xl font-semibold text-foreground">
          Não foi possível carregar a vitrine
        </h2>
        <p className="text-sm text-muted-foreground">
          {error?.message || "Ocorreu um erro inesperado. Tente novamente em instantes."}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground"
        >
          <RefreshCw className="h-4 w-4" /> Tentar novamente
        </button>
      </div>
    </StudentLayout>
  );
}

const ALL_KEY = "all";
const FEATURED_LIMIT = 10;

function VitrinePage() {
  const [activeCategory, setActiveCategory] = useState<string>(ALL_KEY);
  const [showAll, setShowAll] = useState(false);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["student-shelves", "v4-clean", undefined],
    queryFn: () => getStudentVitrineData({ data: { areaId: undefined } }),
    staleTime: 30_000,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const allShelves: VitrineShelf[] = useMemo(
    () =>
      Array.isArray(data?.shelves)
        ? (data!.shelves as VitrineShelf[]).filter(
            (s) => s && typeof s.id === "string" && Array.isArray(s.courses) && s.courses.length > 0,
          )
        : [],
    [data],
  );

  const featured = (data?.featuredCourse as VitrineCourse | null) || null;
  const heroBanners = Array.isArray((data as any)?.heroBanners) ? (data as any).heroBanners : [];

  // Categorias = prateleiras com itens
  const categories = useMemo(
    () =>
      allShelves.map((shelf) => ({
        key: shelf.id,
        label: (shelf.public_title?.trim() || shelf.name || "Sem título").trim(),
      })),
    [allShelves],
  );

  // Lista única consolidada (sem duplicar cursos entre prateleiras)
  const allCourses: VitrineCourse[] = useMemo(() => {
    const seen = new Set<string>();
    const out: VitrineCourse[] = [];
    for (const shelf of allShelves) {
      for (const c of shelf.courses) {
        if (!c?.id || seen.has(c.id)) continue;
        seen.add(c.id);
        out.push(c);
      }
    }
    return out;
  }, [allShelves]);

  // Filtragem por categoria (shelf) selecionada
  const visibleCourses: VitrineCourse[] = useMemo(() => {
    if (activeCategory === ALL_KEY) return allCourses;
    const shelf = allShelves.find((s) => s.id === activeCategory);
    if (!shelf) return allCourses;
    const seen = new Set<string>();
    return shelf.courses.filter((c) => {
      if (!c?.id || seen.has(c.id)) return false;
      seen.add(c.id);
      return true;
    });
  }, [activeCategory, allShelves, allCourses]);

  const isFiltered = activeCategory !== ALL_KEY;
  const showSeeAll = !showAll && !isFiltered && visibleCourses.length > FEATURED_LIMIT;
  const displayedCourses =
    isFiltered || showAll ? visibleCourses : visibleCourses.slice(0, FEATURED_LIMIT);

  const handleCategoryClick = (key: string) => {
    setActiveCategory(key);
    setShowAll(key !== ALL_KEY ? false : showAll);
  };

  return (
    <ModuleGuard moduleKey="vitrine">
      <StudentLayout>
        <div className="min-h-screen bg-background">
          {isError ? (
            <div className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center gap-4 px-6 py-20 text-center">
              <AlertCircle className="h-10 w-10 text-muted-foreground" />
              <h2 className="font-display text-lg font-semibold text-foreground">
                Não foi possível carregar a vitrine
              </h2>
              <p className="text-sm text-muted-foreground">
                {(error as Error)?.message || "Verifique sua conexão e tente novamente."}
              </p>
              <button
                onClick={() => refetch()}
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground"
              >
                <RefreshCw className="h-4 w-4" /> Tentar novamente
              </button>
            </div>
          ) : isLoading ? (
            <div className="flex min-h-[60vh] items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : allCourses.length === 0 && !featured && heroBanners.length === 0 ? (
            <div className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center gap-3 px-6 py-20 text-center">
              <h1 className="font-display text-3xl font-bold text-foreground">Vitrine</h1>
              <p className="text-sm text-muted-foreground">
                Nenhum conteúdo disponível no momento. Volte em breve.
              </p>
            </div>
          ) : (
            <>
              {(heroBanners.length > 0 || featured) && (
                <HeroBanner banners={heroBanners} fallbackCourse={featured} />
              )}

              <ContinueWatchingSection />

              {/* Chips de categoria */}
              {categories.length > 0 && (
                <div className="mx-auto w-full max-w-[1400px] px-4 pt-8 sm:px-8 lg:px-12">
                  <h2 className="mb-4 font-display text-lg font-bold text-foreground">
                    Explorar por categoria
                  </h2>
                  <div className="scrollbar-hide -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
                    {[{ key: ALL_KEY, label: "Todos" }, ...categories].map(({ key, label }) => {
                      const active = activeCategory === key;
                      const Icon = key === ALL_KEY ? LayoutGrid : null;
                      return (
                        <button
                          key={key}
                          onClick={() => handleCategoryClick(key)}
                          className={[
                            "inline-flex shrink-0 items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all",
                            active
                              ? "border-gold/50 bg-gradient-to-br from-gold/20 to-amber-600/10 text-gold shadow-lg shadow-gold/10"
                              : "border-border/40 bg-card/40 text-muted-foreground hover:border-gold/30 hover:text-foreground",
                          ].join(" ")}
                        >
                          {Icon ? <Icon className="h-4 w-4" /> : null}
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Grade única — Em destaque / categoria selecionada */}
              <section className="mx-auto mt-8 w-full max-w-[1400px] px-4 pb-16 sm:px-8 lg:px-12">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="font-display text-xl font-bold text-foreground">
                    {isFiltered
                      ? categories.find((c) => c.key === activeCategory)?.label || "Catálogo"
                      : showAll
                        ? "Todos os produtos"
                        : "Em destaque"}
                  </h2>
                  {showSeeAll && (
                    <button
                      onClick={() => setShowAll(true)}
                      className="inline-flex items-center gap-1 text-sm font-medium text-gold/80 hover:text-gold"
                    >
                      Ver todos <ChevronRight className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {displayedCourses.length === 0 ? (
                  <div className="rounded-xl border border-border/30 bg-card/30 px-6 py-10 text-center text-sm text-muted-foreground">
                    Nenhum conteúdo nesta categoria.
                  </div>
                ) : (
                  <div className={POSTER_GRID}>
                    {displayedCourses.map((course, index) => (
                      <VitrineCourseCard key={course.id} course={course} index={index} />
                    ))}
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      </StudentLayout>
    </ModuleGuard>
  );
}
