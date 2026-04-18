import { EmptyState } from "@/components/EmptyState";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CardGridSkeleton } from "@/components/LoadingSkeletons";
import { useQuery } from "@tanstack/react-query";
import { getMyCoursesData } from "@/lib/my-courses.functions";
import { getContinueWatching } from "@/lib/continue-watching.functions";
import { StudentLayout } from "@/components/StudentLayout";
import { FooterLinks } from "@/components/FooterLinks";
import { CourseShelfCard } from "@/components/CourseShelfCard";
import { motion } from "framer-motion";
import { BookOpen, Search, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import { useDragScroll } from "@/hooks/use-drag-scroll";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { getMyProfile } from "@/lib/profile.functions";

export const Route = createFileRoute("/_authenticated/cursos/")({
  component: MeusCoursosPage,
});

/**
 * REGRA: a página /cursos é a BIBLIOTECA do aluno.
 * SOMENTE produtos com entitlement REAL ativo (status=active, não expirado)
 * podem aparecer aqui. Nada de catálogo, nada de bloqueado, nada de "em breve".
 * Catálogo completo vive em /vitrine.
 */
function MeusCoursosPage() {
  const { user } = useAuth();

  const { data: profileData } = useQuery({
    queryKey: ["my-profile"],
    queryFn: () => getMyProfile(),
    staleTime: 60_000,
  });

  const { data: myData, isLoading } = useQuery({
    queryKey: ["courses-page", "my-courses", "v4-owned-access-state"],
    queryFn: () => getMyCoursesData(),
    staleTime: 30_000,
  });

  const { data: continueData } = useQuery({
    queryKey: ["courses-page", "continue-watching"],
    queryFn: () => getContinueWatching(),
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });

  const [search, setSearch] = useState("");

  const displayName = profileData?.profile?.display_name || user?.email?.split("@")[0] || "aluno";
  const firstName = displayName.split(" ")[0];

  const myCourses = myData?.courses || [];
  const ownedCourseIds = useMemo(() => new Set(myCourses.map((c: any) => c.id)), [myCourses]);

  // Continue assistindo só pode listar cursos que o aluno REALMENTE possui.
  const continueWatchingCourses = useMemo(
    () => (continueData?.courses || []).filter((c: any) => ownedCourseIds.has(c.id)),
    [continueData, ownedCourseIds],
  );

  const searchResults = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return null;
    return myCourses.filter((course: any) =>
      [course.title, course.short_description].filter(Boolean).some((v) => String(v).toLowerCase().includes(term)),
    );
  }, [search, myCourses]);

  useEffect(() => {
    console.log("[DEBUG][CURSOS] routeComponent=MeusCoursosPage(owned-only)");
    console.log("[DEBUG][CURSOS] ownedCount=", myCourses.length);
  }, [myCourses.length]);

  return (
    <StudentLayout>
      <div className="min-h-screen bg-background flex flex-col">
        <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-10 xl:px-12 pt-6 sm:pt-8 pb-28">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="mb-8 sm:mb-10"
          >
            <div className="mb-4">
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground/90 tracking-tight">
                Olá, {firstName}
              </h1>
              <p className="text-[13px] sm:text-sm text-muted-foreground/40 mt-1 leading-relaxed">
                Sua biblioteca de cursos liberados
              </p>
            </div>

            {myCourses.length > 0 && (
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/25" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar nos seus cursos..."
                  className="pl-10 h-10 bg-card/8 border-border/10 rounded-xl text-sm placeholder:text-muted-foreground/20 focus:border-gold/25 focus:ring-gold/10 transition-all duration-300"
                />
              </div>
            )}
          </motion.div>

          {isLoading ? (
            <CardGridSkeleton count={6} />
          ) : myCourses.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title="Você ainda não possui cursos liberados"
              description="Explore a Vitrine para conhecer os conteúdos disponíveis."
              actionTo="/vitrine"
              actionLabel="Ir para a Vitrine"
            />
          ) : searchResults !== null ? (
            <div className="pb-8">
              <ShelfHeader title={`Resultados para "${search}"`} />
              {searchResults.length > 0 ? (
                <ShelfRow>
                  {searchResults.map((course: any, idx: number) => (
                    <ShelfItem key={`search-${course.id}`} index={idx}>
                      <CourseShelfCard course={course} showProgress />
                    </ShelfItem>
                  ))}
                </ShelfRow>
              ) : (
                <EmptyState icon={Search} title="Nenhum curso encontrado" description="Tente buscar com outras palavras." />
              )}
            </div>
          ) : (
            <>
              {continueWatchingCourses.length > 0 && (
                <ShelfSection delay={0.05}>
                  <ShelfHeader title="Continue assistindo" />
                  <ShelfRow>
                    {continueWatchingCourses.map((course: any, idx: number) => (
                      <ShelfItem key={`cw-${course.id}`} index={idx}>
                        <CourseShelfCard
                          course={course}
                          showProgress
                          showStatusBadge
                          subtitle={`${course.completed_lessons || 0}/${course.total_lessons || 0} aulas`}
                        />
                      </ShelfItem>
                    ))}
                  </ShelfRow>
                </ShelfSection>
              )}

              <ShelfSection delay={0.1}>
                <ShelfHeader title="Meus cursos" />
                <ShelfRow>
                  {myCourses.map((course: any, idx: number) => (
                    <ShelfItem key={`mc-${course.id}`} index={idx}>
                      <CourseShelfCard
                        course={course}
                        showProgress
                        showStatusBadge
                        subtitle={`${course.completed_lessons || 0}/${course.lesson_count || course.total_lessons || 0} aulas`}
                      />
                    </ShelfItem>
                  ))}
                </ShelfRow>
              </ShelfSection>
            </>
          )}
        </main>

        <FooterLinks />
      </div>
    </StudentLayout>
  );
}

/* ─── Shelf primitives ─── */

function ShelfSection({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      className="mb-8 sm:mb-10"
    >
      {children}
    </motion.section>
  );
}

function ShelfHeader({ title }: { title: string }) {
  return (
    <div className="flex items-baseline justify-between mb-3.5 sm:mb-4">
      <h2 className="font-display text-[22px] sm:text-[26px] md:text-[28px] font-bold text-foreground/95 tracking-[-0.01em] leading-none">
        {title}
      </h2>
    </div>
  );
}

function ShelfRow({ children }: { children: React.ReactNode }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const dragRef = useDragScroll();
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }, []);

  const scroll = useCallback((direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.7;
    el.scrollBy({ left: direction === "left" ? -amount : amount, behavior: "smooth" });
  }, []);

  return (
    <div className="group/shelf relative -mx-4 sm:-mx-6 lg:-mx-10 xl:-mx-12">
      <div className={`absolute left-0 top-0 bottom-3 w-8 sm:w-12 z-10 pointer-events-none bg-gradient-to-r from-background to-transparent transition-opacity duration-500 ${canScrollLeft ? "opacity-100" : "opacity-0"}`} />
      <div className={`absolute right-0 top-0 bottom-3 w-8 sm:w-12 z-10 pointer-events-none bg-gradient-to-l from-background to-transparent transition-opacity duration-500 ${canScrollRight ? "opacity-100" : "opacity-0"}`} />

      <button
        onClick={() => scroll("left")}
        className={`absolute left-2 top-1/2 -translate-y-1/2 z-20 h-11 w-11 rounded-full bg-background/90 border border-border/20 backdrop-blur-md flex items-center justify-center transition-all duration-300 hover:bg-card/50 hover:scale-105 shadow-xl ${canScrollLeft ? "opacity-0 group-hover/shelf:opacity-100" : "opacity-0 pointer-events-none"}`}
      >
        <ChevronLeft className="h-5 w-5 text-foreground/70" />
      </button>
      <button
        onClick={() => scroll("right")}
        className={`absolute right-2 top-1/2 -translate-y-1/2 z-20 h-11 w-11 rounded-full bg-background/90 border border-border/20 backdrop-blur-md flex items-center justify-center transition-all duration-300 hover:bg-card/50 hover:scale-105 shadow-xl ${canScrollRight ? "opacity-0 group-hover/shelf:opacity-100" : "opacity-0 pointer-events-none"}`}
      >
        <ChevronRight className="h-5 w-5 text-foreground/70" />
      </button>

      <div
        ref={(el) => {
          (scrollRef as any).current = el;
          (dragRef as any).current = el;
        }}
        onScroll={updateScrollState}
        onMouseEnter={updateScrollState}
        className="flex gap-3.5 sm:gap-4 lg:gap-5 overflow-x-auto pb-3 scrollbar-hide px-4 sm:px-6 lg:px-8 snap-x snap-mandatory scroll-smooth cursor-grab select-none will-change-scroll"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {children}
      </div>
    </div>
  );
}

function ShelfItem({ children, index }: { children: React.ReactNode; index: number }) {
  if (index > 5) {
    return (
      <div className="flex-shrink-0 snap-start w-[170px] sm:w-[200px] md:w-[210px] lg:w-[220px] xl:w-[240px]">
        {children}
      </div>
    );
  }
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: 0.04 * index, ease: [0.22, 1, 0.36, 1] }}
      className="flex-shrink-0 snap-start w-[170px] sm:w-[200px] md:w-[210px] lg:w-[220px] xl:w-[240px]"
    >
      {children}
    </motion.div>
  );
}
