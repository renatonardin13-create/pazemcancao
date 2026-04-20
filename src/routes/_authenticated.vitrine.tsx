import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  RefreshCw,
  Loader2,
  LayoutGrid,
  ChevronRight,
} from "lucide-react";
import { ModuleGuard } from "@/components/ModuleGuard";
import { getStudentVitrineData } from "@/lib/student-vitrine.functions";
import { StudentLayout } from "@/components/StudentLayout";
import { HeroBanner } from "@/components/vitrine/HeroBanner";
import { ShelfRow } from "@/components/vitrine/ShelfRow";
import { CoursePosterCard } from "@/components/vitrine/CoursePosterCard";
import type { VitrineShelf, VitrineCourse } from "@/components/vitrine/types";

export const Route = createFileRoute("/_authenticated/vitrine")({
  component: VitrinePage,
  errorComponent: VitrineErrorFallback,
});

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

function VitrinePage() {
  const [activeCategory, setActiveCategory] = useState<string>(ALL_KEY);
  const shelfRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const chipRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const shelvesAreaRef = useRef<HTMLDivElement | null>(null);
  const isProgrammaticScrollRef = useRef(false);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["student-shelves", "v3-netflix"],
    queryFn: () => getStudentVitrineData(),
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

  // Categorias dinâmicas geradas a partir das prateleiras ativas/com itens
  const categories = useMemo(
    () =>
      allShelves.map((shelf) => ({
        key: shelf.id,
        label: (shelf.public_title?.trim() || shelf.name || "Sem título").trim(),
      })),
    [allShelves],
  );

  // Sempre renderiza todas as prateleiras — categoria apenas faz scroll
  const filteredShelves = allShelves;

  const featuredList = useMemo(() => {
    const seen = new Set<string>();
    const out: VitrineCourse[] = [];
    for (const shelf of allShelves) {
      for (const c of shelf.courses) {
        if (!c?.id || seen.has(c.id)) continue;
        seen.add(c.id);
        out.push(c);
        if (out.length >= 10) return out;
      }
    }
    return out;
  }, [allShelves]);

  const scrollChipIntoView = useCallback((key: string) => {
    const chip = chipRefs.current[key];
    if (chip) {
      chip.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  }, []);

  const handleCategoryClick = useCallback(
    (key: string) => {
      setActiveCategory(key);
      scrollChipIntoView(key);
      isProgrammaticScrollRef.current = true;
      window.setTimeout(() => {
        isProgrammaticScrollRef.current = false;
      }, 800);

      if (key === ALL_KEY) {
        const target = shelvesAreaRef.current;
        if (target) {
          const top = target.getBoundingClientRect().top + window.scrollY - 80;
          window.scrollTo({ top, behavior: "smooth" });
        } else {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
        return;
      }
      requestAnimationFrame(() => {
        const el = shelfRefs.current[key];
        if (el) {
          const top = el.getBoundingClientRect().top + window.scrollY - 80;
          window.scrollTo({ top, behavior: "smooth" });
        }
      });
    },
    [scrollChipIntoView],
  );

  // Atualiza o botão ativo conforme a prateleira visível durante o scroll manual
  useEffect(() => {
    if (!allShelves.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (isProgrammaticScrollRef.current) return;
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible.length > 0) {
          const id = (visible[0].target as HTMLElement).dataset.shelfId;
          if (id && id !== activeCategory) {
            setActiveCategory(id);
            scrollChipIntoView(id);
          }
        }
      },
      { rootMargin: "-90px 0px -55% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] },
    );
    Object.values(shelfRefs.current).forEach((el) => {
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [allShelves, activeCategory, scrollChipIntoView]);

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
          ) : allShelves.length === 0 && !featured && heroBanners.length === 0 ? (
            <div className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center gap-3 px-6 py-20 text-center">
              <h1 className="font-display text-3xl font-bold text-foreground">Vitrine</h1>
              <p className="text-sm text-muted-foreground">
                Nenhum conteúdo disponível no momento. Volte em breve.
              </p>
            </div>
          ) : (
            <>
              {/* HERO com slides automáticos quando há múltiplos banners */}
              {(heroBanners.length > 0 || featured) && (
                <HeroBanner banners={heroBanners} fallbackCourse={featured} />
              )}

              {/* CHIPS DE CATEGORIA */}
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

              {/* EM DESTAQUE */}
              {featuredList.length > 0 && (
                <section className="mx-auto mt-8 w-full max-w-[1400px] px-4 sm:px-8 lg:px-12">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="font-display text-xl font-bold text-foreground">Em destaque</h2>
                    <button
                      onClick={() => handleCategoryClick(ALL_KEY)}
                      className="inline-flex items-center gap-1 text-sm font-medium text-gold/80 hover:text-gold"
                    >
                      Ver todos <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="scrollbar-hide -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:gap-4 sm:px-0">
                    {featuredList.map((course) => (
                      <CoursePosterCard key={course.id} course={course} />
                    ))}
                  </div>
                </section>
              )}

              {/* PRATELEIRAS */}
              <div className="space-y-10 py-10 sm:py-12">
                {filteredShelves.length === 0 ? (
                  <div className="mx-auto max-w-2xl px-6 py-10 text-center text-sm text-muted-foreground">
                    Nenhum conteúdo nesta categoria.
                  </div>
                ) : (
                  filteredShelves.map((shelf) => (
                    <div
                      key={shelf.id}
                      ref={(el) => {
                        shelfRefs.current[shelf.id] = el;
                      }}
                      className="scroll-mt-24"
                    >
                      <ShelfRow
                        title={shelf.public_title?.trim() || shelf.name}
                        courses={shelf.courses}
                      />
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      </StudentLayout>
    </ModuleGuard>
  );
}
