import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
  AlertCircle,
  RefreshCw,
  Loader2,
  LayoutGrid,
  GraduationCap,
  BookOpen,
  Users,
  Gift,
  Star,
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

type CategoryKey = "all" | "curso" | "ebook" | "mentoria" | "pacote" | "novidades";

const CATEGORIES: { key: CategoryKey; label: string; icon: typeof LayoutGrid }[] = [
  { key: "all", label: "Todos", icon: LayoutGrid },
  { key: "curso", label: "Cursos", icon: GraduationCap },
  { key: "ebook", label: "E-books", icon: BookOpen },
  { key: "mentoria", label: "Mentorias", icon: Users },
  { key: "pacote", label: "Pacotes", icon: Gift },
  { key: "novidades", label: "Novidades", icon: Star },
];

function matchesCategory(course: VitrineCourse, key: CategoryKey): boolean {
  if (key === "all") return true;
  const type = (course.product_type || "").toLowerCase();
  if (key === "novidades") {
    if (course.launch_date) {
      const days = (Date.now() - new Date(course.launch_date).getTime()) / 86400000;
      return days >= 0 && days <= 30;
    }
    return false;
  }
  if (key === "curso") return type.includes("curso");
  if (key === "ebook") return type.includes("ebook") || type.includes("e-book");
  if (key === "mentoria") return type.includes("mentoria");
  if (key === "pacote") return type.includes("pacote") || type.includes("assinatura") || type.includes("combo");
  return false;
}

function VitrinePage() {
  const [activeCategory, setActiveCategory] = useState<CategoryKey>("all");

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

  const filteredCourses = useMemo(
    () => allCourses.filter((c) => matchesCategory(c, activeCategory)),
    [allCourses, activeCategory],
  );

  const filteredShelves = useMemo(() => {
    if (activeCategory === "all") return allShelves;
    return allShelves
      .map((shelf) => ({
        ...shelf,
        courses: shelf.courses.filter((c) => matchesCategory(c, activeCategory)),
      }))
      .filter((s) => s.courses.length > 0);
  }, [allShelves, activeCategory]);

  const featuredList = useMemo(() => filteredCourses.slice(0, 10), [filteredCourses]);

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
                <HeroBanner banners={heroBanners} fallbackCourse={featured} rotationMs={6000} />
              )}

              {/* CHIPS DE CATEGORIA */}
              <div className="mx-auto w-full max-w-[1400px] px-4 pt-8 sm:px-8 lg:px-12">
                <h2 className="mb-4 font-display text-lg font-bold text-foreground">
                  Explorar por categoria
                </h2>
                <div className="scrollbar-hide -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
                  {CATEGORIES.map(({ key, label, icon: Icon }) => {
                    const active = activeCategory === key;
                    return (
                      <button
                        key={key}
                        onClick={() => setActiveCategory(key)}
                        className={[
                          "inline-flex shrink-0 items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all",
                          active
                            ? "border-gold/50 bg-gradient-to-br from-gold/20 to-amber-600/10 text-gold shadow-lg shadow-gold/10"
                            : "border-border/40 bg-card/40 text-muted-foreground hover:border-gold/30 hover:text-foreground",
                        ].join(" ")}
                      >
                        <Icon className="h-4 w-4" />
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
                      onClick={() => setActiveCategory("all")}
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
                    <ShelfRow key={shelf.id} title={shelf.name} courses={shelf.courses} />
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
