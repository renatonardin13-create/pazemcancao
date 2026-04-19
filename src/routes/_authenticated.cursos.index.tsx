import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { BookOpen, Search, ArrowRight } from "lucide-react";
import { useMemo, useState } from "react";

import { EmptyState } from "@/components/EmptyState";
import { CardGridSkeleton } from "@/components/LoadingSkeletons";
import { StudentLayout } from "@/components/StudentLayout";
import { FooterLinks } from "@/components/FooterLinks";
import { Input } from "@/components/ui/input";
import { ShelfRow } from "@/components/vitrine/ShelfRow";
import { CoursePosterCard } from "@/components/vitrine/CoursePosterCard";
import type { VitrineCourse } from "@/components/vitrine/types";
import { useAuth } from "@/hooks/use-auth";
import { getMyProfile } from "@/lib/profile.functions";
import { getMyCoursesData } from "@/lib/my-courses.functions";
import { getContinueWatching } from "@/lib/continue-watching.functions";
import { getStudentVitrineData } from "@/lib/student-vitrine.functions";

export const Route = createFileRoute("/_authenticated/cursos/")({
  component: MeusCursosPage,
});

/**
 * Biblioteca do aluno — mesma linguagem visual da /vitrine.
 * Apenas cursos com entitlement REAL ativo. Catálogo completo vive em /vitrine.
 */
function MeusCursosPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"recent" | "progress" | "title">("recent");

  const { data: profileData } = useQuery({
    queryKey: ["my-profile"],
    queryFn: () => getMyProfile(),
    staleTime: 60_000,
  });

  const { data: myData, isLoading } = useQuery({
    queryKey: ["my-courses-library", "v1"],
    queryFn: () => getMyCoursesData(),
    staleTime: 30_000,
  });

  const { data: continueData } = useQuery({
    queryKey: ["my-courses-library", "continue-watching"],
    queryFn: () => getContinueWatching(),
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });

  const { data: vitrineData } = useQuery({
    queryKey: ["my-courses-library", "premium-catalog"],
    queryFn: () => getStudentVitrineData(),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  const displayName = profileData?.profile?.display_name || user?.email?.split("@")[0] || "aluno";
  const firstName = displayName.split(" ")[0];

  const myCourses: VitrineCourse[] = useMemo(
    () => (Array.isArray(myData?.courses) ? myData.courses.filter((course) => Boolean(course?.id)) : []),
    [myData],
  );
  const ownedIds = useMemo(() => new Set(myCourses.map((c) => c.id)), [myCourses]);

  const sortedMyCourses = useMemo(() => {
    const arr = [...myCourses];
    if (sortBy === "title") {
      arr.sort((a, b) => String(a.title || "").localeCompare(String(b.title || "")));
    } else if (sortBy === "progress") {
      arr.sort((a, b) => Number(b.progress_pct ?? 0) - Number(a.progress_pct ?? 0));
    }
    return arr;
  }, [myCourses, sortBy]);

  const continueWatching: VitrineCourse[] = useMemo(
    () => (Array.isArray(continueData?.courses) ? continueData.courses : []).filter((c: VitrineCourse) => Boolean(c?.id) && ownedIds.has(c.id)),
    [continueData, ownedIds],
  );

  const inProgress = useMemo(
    () => myCourses.filter((c) => Number(c.progress_pct ?? 0) > 0 && Number(c.progress_pct ?? 0) < 100),
    [myCourses],
  );
  const completed = useMemo(
    () => myCourses.filter((c) => Number(c.progress_pct ?? 0) >= 100),
    [myCourses],
  );
  const newCourses = useMemo(
    () => myCourses.filter((c) => Number(c.progress_pct ?? 0) === 0),
    [myCourses],
  );

  // Group by category
  const byCategory = useMemo(() => {
    const map = new Map<string, VitrineCourse[]>();
    for (const c of myCourses) {
      const key = c.category_name || "Outros";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(c);
    }
    return Array.from(map.entries()).filter(([, list]) => list.length > 0);
  }, [myCourses]);

  // Conteúdo Premium: cursos da vitrine que o aluno ainda NÃO possui
  const premiumCourses: VitrineCourse[] = useMemo(() => {
    const all: VitrineCourse[] = [];
    const seen = new Set<string>();
    const shelves = (Array.isArray(vitrineData?.shelves) ? vitrineData.shelves : []) as { courses: VitrineCourse[] }[];
    for (const shelf of shelves) {
      for (const c of Array.isArray(shelf?.courses) ? shelf.courses : []) {
        if (!c?.id || ownedIds.has(c.id) || seen.has(c.id)) continue;
        seen.add(c.id);
        all.push(c);
      }
    }
    return all;
  }, [vitrineData, ownedIds]);

  const searchResults = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return null;
    return myCourses.filter((course) =>
      [course.title, course.short_description]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(term)),
    );
  }, [search, myCourses]);

  return (
    <StudentLayout>
      <div className="flex min-h-screen flex-col bg-background">
        <main className="flex-1 pt-8 pb-20 sm:pt-10">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-8 lg:px-10">
            {/* Header / saudação */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="mb-12 sm:mb-14"
            >
              <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between lg:gap-12">
                {/* Lado esquerdo: título + subtítulo + busca */}
                <div className="flex min-w-0 flex-1 flex-col gap-3 lg:max-w-2xl">
                  <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-primary/80">
                    Olá, {firstName}
                  </span>
                  <h1 className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-[3.25rem] lg:leading-[1.05]">
                    Meus{" "}
                    <span className="bg-gradient-to-r from-primary via-amber-300 to-primary bg-clip-text text-transparent">
                      cursos
                    </span>
                  </h1>
                  <p className="max-w-xl text-[15px] leading-relaxed text-muted-foreground/75 sm:text-base">
                    Tudo o que você liberou, reunido aqui para continuar de onde parou.
                  </p>

                  {myCourses.length > 0 && (
                    <div className="relative mt-4 w-full max-w-md">
                      <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/40" />
                      <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Buscar nos seus cursos..."
                        className="h-12 rounded-xl border-border/30 bg-card/40 pl-11 text-sm placeholder:text-muted-foreground/40 focus:border-primary/40 focus:ring-primary/15"
                      />
                    </div>
                  )}
                </div>

                {/* Lado direito: seletor */}
                {myCourses.length > 0 && (
                  <div className="flex shrink-0 items-center gap-3 lg:pb-1">
                    <span className="hidden text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/55 lg:inline">
                      Ordenar por
                    </span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                      className="h-11 min-w-[12rem] rounded-xl border border-border/30 bg-card/40 px-4 text-sm font-medium text-foreground/85 focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/15"
                    >
                      <option value="recent">Mais recentes</option>
                      <option value="progress">Maior progresso</option>
                      <option value="title">Ordem alfabética</option>
                    </select>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Conteúdo */}
            {isLoading ? (
              <CardGridSkeleton count={6} />
            ) : myCourses.length === 0 ? (
              <EmptyState
                icon={BookOpen}
                title="Sua biblioteca está esperando você"
                description="Você ainda não possui cursos liberados. Conheça o catálogo completo na Vitrine."
                actionTo="/vitrine"
                actionLabel="Ir para a Vitrine"
              />
            ) : searchResults !== null ? (
              <div className="space-y-6">
                {searchResults.length > 0 ? (
                  <ShelfRow title={`Resultados para "${search}"`} courses={searchResults} />
                ) : (
                  <EmptyState
                    icon={Search}
                    title="Nenhum curso encontrado"
                    description="Tente buscar com outras palavras."
                  />
                )}
              </div>
            ) : (
              <div className="space-y-12 sm:space-y-14">
                {continueWatching.length > 0 && (
                  <ShelfRow title="Continue aprendendo" courses={continueWatching} />
                )}
                {inProgress.length > 0 && continueWatching.length === 0 && (
                  <ShelfRow title="Em andamento" courses={inProgress} />
                )}
                <ShelfRow title="Meus cursos" courses={sortedMyCourses} />
                {newCourses.length > 0 && newCourses.length < myCourses.length && (
                  <ShelfRow title="Novos para começar" courses={newCourses} />
                )}
                {byCategory.length > 1 &&
                  byCategory.map(([cat, list]) => (
                    <ShelfRow key={cat} title={cat} courses={list} />
                  ))}
                {completed.length > 0 && <ShelfRow title="Concluídos" courses={completed} />}

                {premiumCourses.length > 0 && (
                  <ShelfRow title="Conteúdo Premium" courses={premiumCourses} />
                )}

                {/* CTA explorar — integrado como continuação natural */}
                <div className="rounded-2xl border border-border/25 bg-gradient-to-br from-card/50 via-card/30 to-card/50 p-6 sm:p-8">
                  <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                      <h3 className="font-display text-lg font-semibold text-foreground sm:text-xl">
                        Continue aprendendo
                      </h3>
                      <p className="text-sm text-muted-foreground/70">
                        Descubra novos cursos disponíveis na Vitrine.
                      </p>
                    </div>
                    <Link
                      to="/vitrine"
                      className="group inline-flex shrink-0 items-center gap-2 rounded-full border border-primary/30 bg-primary/[0.08] px-5 py-2.5 text-sm font-semibold text-primary transition-all duration-300 hover:border-primary/50 hover:bg-primary/[0.12]"
                    >
                      Ir para a Vitrine
                      <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>

        <FooterLinks />
      </div>
    </StudentLayout>
  );
}

// Re-export to keep the old named import working if referenced anywhere
export { CoursePosterCard };
