import { EmptyState } from "@/components/EmptyState";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CardGridSkeleton } from "@/components/LoadingSkeletons";
import { useQuery } from "@tanstack/react-query";
import { getStudentShelves } from "@/lib/shelves.functions";
import { getMyCoursesData } from "@/lib/my-courses.functions";
import { getUserFavoritesCount } from "@/lib/user-library.functions";
import { getContinueWatching } from "@/lib/continue-watching.functions";
import { StudentLayout } from "@/components/StudentLayout";
import { FooterLinks } from "@/components/FooterLinks";
import { CourseShelfCard } from "@/components/CourseShelfCard";
import { motion } from "framer-motion";
import { BookOpen, Search, ArrowRight, PlayCircle, Heart, Play, Layers, CheckCircle2, GraduationCap, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useMemo, useRef, useCallback } from "react";
import { useDragScroll } from "@/hooks/use-drag-scroll";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { getMyProfile } from "@/lib/profile.functions";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/_authenticated/cursos/")({
  component: MeusCoursosPage,
});

function MeusCoursosPage() {
  const { user } = useAuth();

  const { data: profileData } = useQuery({
    queryKey: ["my-profile"],
    queryFn: () => getMyProfile(),
    staleTime: 60_000,
  });

  const { data: shelvesData, isLoading } = useQuery({
    queryKey: ["student-shelves"],
    queryFn: () => getStudentShelves(),
    staleTime: 10_000,
    refetchOnWindowFocus: true,
  });

  const { data: myData } = useQuery({
    queryKey: ["my-courses"],
    queryFn: () => getMyCoursesData(),
    staleTime: 5_000,
  });

  const { data: favData } = useQuery({
    queryKey: ["user-favorites-count"],
    queryFn: () => getUserFavoritesCount(),
    staleTime: 30_000,
  });

  const { data: continueData } = useQuery({
    queryKey: ["continue-watching"],
    queryFn: () => getContinueWatching(),
    staleTime: 5_000,
    refetchOnWindowFocus: true,
  });

  const [search, setSearch] = useState("");

  const displayName = profileData?.profile?.display_name || user?.email?.split("@")[0] || "aluno";
  const firstName = displayName.split(" ")[0];

  const shelves = shelvesData?.shelves || [];
  const featuredCourse = shelvesData?.featuredCourse || null;
  const promoBanners = shelvesData?.promoBanners || [];
  const stats = myData?.stats || { total: 0, inProgress: 0, completed: 0 };
  const continueWatchingCourses = continueData?.courses || [];
  const myCourses = myData?.courses || [];

  const allShelfCourses = useMemo(() => {
    const seen = new Set<string>();
    const result: any[] = [];
    for (const shelf of shelves) {
      for (const c of shelf.courses || []) {
        if (!seen.has(c.id)) {
          seen.add(c.id);
          result.push(c);
        }
      }
    }
    return result;
  }, [shelves]);

  const searchResults = useMemo(() => {
    if (!search) return null;
    const q = search.toLowerCase();
    return allShelfCourses.filter((c: any) => c.title?.toLowerCase().includes(q));
  }, [search, allShelfCourses]);

  return (
    <StudentLayout>
      <div className="min-h-screen bg-background">

        {/* ═══ HERO BANNER — full-bleed, rounded, cinematic ═══ */}
        {!isLoading && featuredCourse && !searchResults && (
          <HeroBanner course={featuredCourse} />
        )}

        {/* ═══ MAIN CONTENT AREA ═══ */}
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12">

          {/* ═══ SAUDAÇÃO + BUSCA ═══ */}
          <div className="pt-8 sm:pt-10 pb-2">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8"
            >
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <Heart className="h-3.5 w-3.5 text-gold/40 flex-shrink-0" />
                  <h1 className="font-display text-xl sm:text-2xl font-bold text-foreground/90 tracking-tight">
                    Olá, {firstName}
                  </h1>
                </div>
                <p className="text-[11px] text-muted-foreground/35 ml-[22px] italic">
                  Que sua jornada hoje seja cheia de paz.
                </p>
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/25" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar cursos..."
                  className="pl-10 h-10 bg-card/8 border-border/10 rounded-xl text-xs placeholder:text-muted-foreground/20 focus:border-gold/20 focus:ring-gold/8 transition-all duration-300"
                />
              </div>
            </motion.div>
          </div>

          {/* ═══ SEARCH RESULTS ═══ */}
          {searchResults !== null ? (
            <div className="pb-20">
              <ShelfHeader title={`Resultados para "${search}"`} subtitle={`${searchResults.length} curso(s)`} icon={<Search className="h-4 w-4" />} />
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
            <div className="pb-20">
              {isLoading ? (
                <CardGridSkeleton count={6} />
              ) : (
                <>
                  {/* ═══ CONTINUE ASSISTINDO ═══ */}
                  {continueWatchingCourses.length > 0 && (
                    <ShelfSection delay={0.05}>
                      <ShelfHeader
                        title="Continue assistindo"
                        subtitle="Retome de onde parou"
                        icon={<PlayCircle className="h-4 w-4 text-gold" />}
                        linkTo="/cursos"
                        linkLabel="Ver todos"
                      />
                      <ShelfRow>
                        {continueWatchingCourses.map((course: any, idx: number) => (
                          <ShelfItem key={`cw-${course.id}`} index={idx}>
                            <ContinueWatchingCard course={course} />
                          </ShelfItem>
                        ))}
                      </ShelfRow>
                    </ShelfSection>
                  )}

                  {/* ═══ MEUS CURSOS ═══ */}
                  {myCourses.length > 0 && (
                    <ShelfSection delay={0.1}>
                      <ShelfHeader
                        title="Meus cursos"
                        subtitle="Seus cursos matriculados"
                        icon={<GraduationCap className="h-4 w-4 text-gold" />}
                        linkTo="/cursos"
                        linkLabel="Ver todos"
                      />
                      <ShelfRow>
                        {myCourses.map((course: any, idx: number) => (
                          <ShelfItem key={`mc-${course.id}`} index={idx}>
                            <MyCoursesCard course={course} />
                          </ShelfItem>
                        ))}
                      </ShelfRow>
                    </ShelfSection>
                  )}

                  {/* ═══ PRATELEIRAS DO ADMIN ═══ */}
                  {shelves.map((shelf: any, shelfIdx: number) => {
                    const bannersAfter = promoBanners.filter((b: any) => b.position_after_shelf === shelfIdx + 1);
                    return (
                      <div key={shelf.id}>
                        <ShelfSection delay={0.15 + shelfIdx * 0.04}>
                          <ShelfHeader
                            title={shelf.name}
                            linkTo="/cursos"
                            linkLabel={(shelf.courses?.length ?? 0) > 3 ? "Ver todos" : undefined}
                          />
                          <ShelfRow>
                            {(shelf.courses || []).map((course: any, idx: number) => (
                              <ShelfItem key={`${shelf.id}-${course.id}`} index={idx}>
                                <CourseShelfCard
                                  course={course}
                                  showProgress={course.access_state === 'in_progress' || course.access_state === 'enrolled'}
                                />
                              </ShelfItem>
                            ))}
                          </ShelfRow>
                        </ShelfSection>

                        {bannersAfter.map((banner: any) => (
                          <motion.div
                            key={banner.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="mb-14"
                          >
                            {banner.link_url ? (
                              <a href={banner.link_url} target="_blank" rel="noopener noreferrer" className="block rounded-2xl overflow-hidden border border-border/8 hover:border-gold/12 transition-all duration-300">
                                <img src={banner.image_url} alt={banner.title} className="w-full h-auto object-cover" />
                              </a>
                            ) : (
                              <div className="rounded-2xl overflow-hidden border border-border/8">
                                <img src={banner.image_url} alt={banner.title} className="w-full h-auto object-cover" />
                              </div>
                            )}
                          </motion.div>
                        ))}
                      </div>
                    );
                  })}

                  {/* ═══ BIBLIOTECA RESUMO ═══ */}
                  <ShelfSection delay={0.3}>
                    <ShelfHeader
                      title="Minha biblioteca"
                      icon={<Layers className="h-4 w-4 text-primary/50" />}
                    />
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                      <StatCard label="Cursos" value={stats.total} />
                      <StatCard label="Em andamento" value={stats.inProgress} />
                      <StatCard label="Concluídos" value={stats.completed} />
                      <StatCard label="Favoritos" value={favData?.count ?? 0} icon={<Heart className="h-3 w-3" />} />
                    </div>
                  </ShelfSection>

                  {shelves.length === 0 && (
                    <EmptyState icon={BookOpen} title="Nenhum conteúdo disponível" description="Em breve novos cursos serão adicionados." />
                  )}
                </>
              )}
            </div>
          )}
        </div>

        <FooterLinks />
      </div>
    </StudentLayout>
  );
}

/* ══════════════════════════════════════════════════════════════
   REUSABLE SHELF PRIMITIVES
   ══════════════════════════════════════════════════════════════ */

function ShelfSection({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      className="mb-14 sm:mb-16"
    >
      {children}
    </motion.section>
  );
}

function ShelfHeader({ title, subtitle, icon, linkTo, linkLabel }: {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  linkTo?: string;
  linkLabel?: string;
}) {
  return (
    <div className="flex items-center justify-between mb-5 sm:mb-6">
      <div className="flex items-center gap-3">
        {icon && (
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold/[0.06] border border-gold/8">
            {icon}
          </div>
        )}
        <div>
          <h2 className="font-display text-lg sm:text-xl font-bold text-foreground/90 tracking-tight leading-none">
            {title}
          </h2>
          {subtitle && (
            <p className="text-[10px] text-muted-foreground/30 mt-0.5 tracking-wide">{subtitle}</p>
          )}
        </div>
      </div>
      {linkTo && linkLabel && (
        <Link to={linkTo as any} className="text-[10px] font-bold text-gold/35 uppercase tracking-[0.15em] hover:text-gold/65 transition-colors duration-300 flex items-center gap-1">
          {linkLabel} <ArrowRight className="h-3 w-3" />
        </Link>
      )}
    </div>
  );
}

function ShelfRow({ children }: { children: React.ReactNode }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const dragRef = useDragScroll();

  const scroll = useCallback((direction: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.75;
    el.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' });
  }, []);

  return (
    <div className="group/shelf relative -mx-4 sm:-mx-8 lg:-mx-12">
      {/* Left arrow */}
      <button
        onClick={() => scroll('left')}
        className="absolute left-1 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full bg-background/80 border border-border/15 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover/shelf:opacity-100 transition-opacity duration-300 hover:bg-card/30 shadow-xl"
      >
        <ChevronLeft className="h-5 w-5 text-foreground/60" />
      </button>

      {/* Right arrow */}
      <button
        onClick={() => scroll('right')}
        className="absolute right-1 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full bg-background/80 border border-border/15 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover/shelf:opacity-100 transition-opacity duration-300 hover:bg-card/30 shadow-xl"
      >
        <ChevronRight className="h-5 w-5 text-foreground/60" />
      </button>

      <div
        ref={(el) => {
          (scrollRef as any).current = el;
          (dragRef as any).current = el;
        }}
        className="flex gap-4 sm:gap-5 overflow-x-auto pb-4 scrollbar-hide px-4 sm:px-8 lg:px-12 snap-x snap-mandatory scroll-smooth cursor-grab select-none"
      >
        {children}
      </div>
    </div>
  );
}

function ShelfItem({ children, index }: { children: React.ReactNode; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.45, delay: 0.03 * Math.min(index, 12) }}
      className="flex-shrink-0 snap-start w-[280px] sm:w-[340px] md:w-[400px] lg:w-[440px]"
    >
      {children}
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════════════
   HERO BANNER — Cinematic, full-width with rounded corners
   ══════════════════════════════════════════════════════════════ */

function HeroBanner({ course }: { course: any }) {
  const bannerImg = course.banner_image_url || course.cover_image_url;
  const isCustomBanner = course.id === '__custom_banner__';

  return (
    <div className="px-3 sm:px-6 lg:px-10 pt-3 sm:pt-5">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full h-[300px] sm:h-[400px] md:h-[500px] lg:h-[560px] xl:h-[600px] rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl shadow-black/40"
      >
        {/* Background image */}
        {bannerImg ? (
          <img
            src={bannerImg}
            alt={course.display_title || course.title || ''}
            className="absolute inset-0 w-full h-full object-cover"
            style={{ objectFit: (course.banner_fit || 'cover') as any }}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-card/30 via-background to-background" />
        )}

        {/* Cinematic overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/20 to-transparent" />

        {/* Subtle vignette */}
        <div className="absolute inset-0 shadow-[inset_0_0_120px_rgba(0,0,0,0.35)]" />

        {/* Content — bottom left */}
        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 md:p-12 lg:p-14">
          <motion.h2
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="font-display text-xl sm:text-3xl md:text-4xl lg:text-[42px] font-bold text-white tracking-tight mb-2 sm:mb-3 max-w-lg leading-[1.1] drop-shadow-2xl"
          >
            {course.display_title || course.title}
          </motion.h2>

          {(course.display_subtitle || course.short_description) && (
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35 }}
              className="text-xs sm:text-sm text-white/55 mb-5 max-w-md line-clamp-2 leading-relaxed"
            >
              {course.display_subtitle || course.short_description}
            </motion.p>
          )}

          {course.progress_pct > 0 && course.progress_pct < 100 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex items-center gap-3 mb-4 max-w-xs"
            >
              <Progress value={course.progress_pct} className="h-1 flex-1 bg-white/10" />
              <span className="text-[10px] font-bold text-gold/90 tabular-nums">{course.progress_pct}%</span>
            </motion.div>
          )}

          {!isCustomBanner && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.45 }}
            >
              <Link
                to="/cursos/$courseId"
                params={{ courseId: course.id }}
                className="inline-flex items-center gap-2 rounded-xl bg-gold text-background px-6 py-3 text-[12px] font-bold uppercase tracking-wider hover:bg-gold/90 transition-all duration-300 hover:shadow-xl hover:shadow-gold/20"
              >
                <Play className="h-3.5 w-3.5 fill-current" />
                {course.progress_pct > 0 ? 'Continuar' : 'Assistir agora'}
              </Link>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   CONTINUE WATCHING CARD
   ══════════════════════════════════════════════════════════════ */

function ContinueWatchingCard({ course }: { course: any }) {
  const progress = course.progress_pct ?? 0;
  const linkTo = course.resume_lesson_id ? "/cursos/$courseId/aula/$lessonId" : "/cursos/$courseId";
  const linkParams = course.resume_lesson_id
    ? { courseId: course.id, lessonId: course.resume_lesson_id }
    : { courseId: course.id };

  return (
    <Link to={linkTo as any} params={linkParams as any} className="group relative block rounded-2xl overflow-hidden cursor-pointer">
      <div className="relative aspect-video overflow-hidden bg-card/5 shadow-lg shadow-black/20 md:group-hover:shadow-2xl md:group-hover:shadow-black/40 transition-shadow duration-500 rounded-2xl">
        {course.cover_image_url ? (
          <img src={course.cover_image_url} alt={course.title} className="w-full h-full object-cover md:transition-transform md:duration-[800ms] md:ease-out md:group-hover:scale-[1.08]" loading="lazy" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-card/40 via-muted/10 to-background flex items-center justify-center">
            <BookOpen className="h-10 w-10 text-muted-foreground/10" />
          </div>
        )}

        <div className="absolute inset-0 bg-black/0 md:group-hover:bg-black/45 transition-all duration-500" />
        <div className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

        {/* Play button */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 md:group-hover:opacity-100 transition-all duration-500 z-10">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gold shadow-2xl shadow-gold/30 scale-[0.6] md:group-hover:scale-100 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]">
            <Play className="h-6 w-6 text-gold-foreground fill-gold-foreground ml-0.5" />
          </div>
        </div>

        {/* Title + progress */}
        <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 z-10">
          <h3 className="text-[14px] font-bold text-white line-clamp-2 leading-[1.3] drop-shadow-xl tracking-tight">{course.title}</h3>
          <p className="text-[10px] text-white/40 mt-1">
            {course.completed_lessons}/{course.total_lessons} aulas • {progress}%
          </p>
        </div>

        {/* Progress bar */}
        <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-white/[0.06] z-20">
          <div className="h-full rounded-r-full bg-gold transition-all duration-700" style={{ width: `${Math.min(progress, 100)}%` }} />
        </div>
      </div>
      <div className="absolute inset-0 rounded-2xl border border-transparent md:group-hover:border-gold/15 transition-colors duration-500 pointer-events-none z-20" />
    </Link>
  );
}

/* ══════════════════════════════════════════════════════════════
   MY COURSES CARD
   ══════════════════════════════════════════════════════════════ */

function MyCoursesCard({ course }: { course: any }) {
  const progress = course.progress_pct ?? 0;
  const isCompleted = progress >= 100;
  const isInProgress = progress > 0 && progress < 100;

  return (
    <Link to="/cursos/$courseId" params={{ courseId: course.id }} className="group relative block rounded-2xl overflow-hidden cursor-pointer">
      <div className="relative aspect-video overflow-hidden bg-card/5 shadow-lg shadow-black/20 md:group-hover:shadow-2xl md:group-hover:shadow-black/40 transition-shadow duration-500 rounded-2xl">
        {course.cover_image_url ? (
          <img src={course.cover_image_url} alt={course.title} className="w-full h-full object-cover md:transition-transform md:duration-[800ms] md:ease-out md:group-hover:scale-[1.08]" loading="lazy" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-card/40 via-muted/10 to-background flex items-center justify-center">
            <BookOpen className="h-10 w-10 text-muted-foreground/10" />
          </div>
        )}

        <div className="absolute inset-0 bg-black/0 md:group-hover:bg-black/45 transition-all duration-500" />
        <div className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

        {/* Status badge */}
        <div className="absolute top-3 left-3 z-10">
          {isCompleted ? (
            <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/90 px-2 py-0.5 text-[9px] font-bold text-white uppercase tracking-wider backdrop-blur-sm">
              <CheckCircle2 className="h-2.5 w-2.5" /> Concluído
            </span>
          ) : isInProgress ? (
            <span className="inline-flex items-center gap-1 rounded-lg bg-gold/90 px-2 py-0.5 text-[9px] font-bold text-background uppercase tracking-wider backdrop-blur-sm">
              <Play className="h-2.5 w-2.5 fill-current" /> Em andamento
            </span>
          ) : null}
        </div>

        {/* Play button */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 md:group-hover:opacity-100 transition-all duration-500 z-10">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gold shadow-2xl shadow-gold/30 scale-[0.6] md:group-hover:scale-100 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]">
            <Play className="h-6 w-6 text-gold-foreground fill-gold-foreground ml-0.5" />
          </div>
        </div>

        {/* Title */}
        <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 z-10">
          <h3 className="text-[14px] font-bold text-white line-clamp-2 leading-[1.3] drop-shadow-xl tracking-tight">{course.title}</h3>
          <p className="text-[10px] text-white/40 mt-1">
            {course.completed_lessons}/{course.lesson_count || course.total_lessons} aulas
            {isInProgress && ` • ${progress}%`}
          </p>
        </div>

        {/* Progress bar */}
        {(isInProgress || isCompleted) && (
          <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-white/[0.06] z-20">
            <div className={`h-full rounded-r-full transition-all duration-700 ${isCompleted ? "bg-emerald-400" : "bg-gold"}`} style={{ width: `${Math.min(progress, 100)}%` }} />
          </div>
        )}
      </div>
      <div className="absolute inset-0 rounded-2xl border border-transparent md:group-hover:border-gold/15 transition-colors duration-500 pointer-events-none z-20" />
    </Link>
  );
}

/* ══════════════════════════════════════════════════════════════
   STAT CARD
   ══════════════════════════════════════════════════════════════ */

function StatCard({ label, value, icon }: { label: string; value: number | string; icon?: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border/8 bg-card/5 p-4 sm:p-5 text-center backdrop-blur-sm">
      <p className="font-display text-2xl sm:text-3xl font-bold text-gold">{value}</p>
      <p className="text-[9px] text-muted-foreground/35 mt-1 uppercase tracking-[0.15em] flex items-center justify-center gap-1">
        {icon} {label}
      </p>
    </div>
  );
}
