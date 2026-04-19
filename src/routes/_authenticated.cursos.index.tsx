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
        <main className="flex-1 pt-6 pb-20 sm:pt-8">
          {/* Header / saudação */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="mb-8 px-4 sm:mb-10 sm:px-8 lg:px-12"
          >
            <div className="flex flex-col gap-1.5">
              <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-primary/25 bg-primary/[0.06] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
                <Sparkles className="h-3 w-3" /> Sua biblioteca
              </span>
              <h1 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                Olá, <span className="bg-gradient-to-r from-primary via-amber-300 to-primary bg-clip-text text-transparent">{firstName}</span>
              </h1>
              <p className="max-w-xl text-sm text-muted-foreground/70 sm:text-base">
                Tudo o que você liberou, organizado em prateleiras para continuar de onde parou.
              </p>
            </div>

            {myCourses.length > 0 && (
              <div className="relative mt-6 w-full max-w-sm">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/40" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar nos seus cursos..."
                  className="h-11 rounded-xl border-border/30 bg-card/40 pl-10 text-sm placeholder:text-muted-foreground/40 focus:border-primary/40 focus:ring-primary/15"
                />
              </div>
            )}
          </motion.div>

          {/* Conteúdo */}
          {isLoading ? (
            <div className="px-4 sm:px-8 lg:px-12">
              <CardGridSkeleton count={6} />
            </div>
          ) : myCourses.length === 0 ? (
            <div className="px-4 sm:px-8 lg:px-12">
              <EmptyState
                icon={BookOpen}
                title="Sua biblioteca está esperando você"
                description="Você ainda não possui cursos liberados. Conheça o catálogo completo na Vitrine."
                actionTo="/vitrine"
                actionLabel="Ir para a Vitrine"
              />
            </div>
          ) : searchResults !== null ? (
            <div className="space-y-6">
              {searchResults.length > 0 ? (
                <ShelfRow title={`Resultados para "${search}"`} courses={searchResults} />
              ) : (
                <div className="px-4 sm:px-8 lg:px-12">
                  <EmptyState
                    icon={Search}
                    title="Nenhum curso encontrado"
                    description="Tente buscar com outras palavras."
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-10 sm:space-y-12">
              {continueWatching.length > 0 && (
                <ShelfRow title="Continue assistindo" courses={continueWatching} />
              )}
              {inProgress.length > 0 && continueWatching.length === 0 && (
                <ShelfRow title="Em andamento" courses={inProgress} />
              )}
              <ShelfRow title="Meus cursos" courses={myCourses} />
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

              {/* CTA explorar */}
              <div className="flex justify-center px-4 pt-6 sm:px-8 lg:px-12">
                <Link
                  to="/vitrine"
                  className="group inline-flex items-center gap-2 rounded-full border border-primary/25 bg-card/40 px-6 py-3 text-sm font-medium text-foreground/80 transition-all duration-300 hover:border-primary/50 hover:bg-card/60 hover:text-primary"
                >
                  Explorar mais cursos na Vitrine
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          )}
        </main>

        <FooterLinks />
      </div>
    </StudentLayout>
  );
}

// Re-export to keep the old named import working if referenced anywhere
export { CoursePosterCard };
