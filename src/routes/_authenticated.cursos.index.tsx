import { EmptyState } from "@/components/EmptyState";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CardGridSkeleton } from "@/components/LoadingSkeletons";
import { useQuery } from "@tanstack/react-query";
import { getMyCoursesData } from "@/lib/my-courses.functions";
import { getLibraryStats, getLibrarySections } from "@/lib/user-library.functions";
import { getContinueWatching } from "@/lib/continue-watching.functions";
import { listPublishedCourses } from "@/lib/courses.functions";
import { StudentLayout } from "@/components/StudentLayout";
import { FooterLinks } from "@/components/FooterLinks";
import { CourseShelfCard } from "@/components/CourseShelfCard";
import { ContentCard } from "@/components/ContentCard";
import { motion } from "framer-motion";
import { BookOpen, Search, ArrowRight, Play, Clock, Lock, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useMemo, useRef, useCallback, useEffect } from "react";
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

  const { data: catalogData, isLoading } = useQuery({
    queryKey: ["courses-page", "published-courses"],
    queryFn: () => listPublishedCourses(),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  const { data: myData } = useQuery({
    queryKey: ["courses-page", "my-courses"],
    queryFn: () => getMyCoursesData(),
    staleTime: 30_000,
  });

  useQuery({
    queryKey: ["courses-page", "library-stats"],
    queryFn: () => getLibraryStats(),
    staleTime: 60_000,
  });

  const { data: libSections } = useQuery({
    queryKey: ["courses-page", "library-sections"],
    queryFn: () => getLibrarySections(),
    staleTime: 60_000,
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

  const publishedCourses = catalogData?.courses || [];
  const continueWatchingCourses = continueData?.courses || [];
  const myCourses = myData?.courses || [];

  const enrolledCourseIds = useMemo(() => new Set(myCourses.map((course: any) => course.id)), [myCourses]);

  const availableCourses = useMemo(() => {
    return (publishedCourses || [])
      .filter((course: any) => !enrolledCourseIds.has(course.id))
      .map((course: any) => {
        const launchDate = course.launch_date ? new Date(course.launch_date).getTime() : null;
        const isComingSoon = !!launchDate && launchDate > Date.now();

        return {
          ...course,
          access_state: isComingSoon ? "coming_soon" : "locked",
        };
      })
      .sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
  }, [publishedCourses, enrolledCourseIds]);

  const searchableCourses = useMemo(() => {
    const deduped = new Map<string, any>();

    [...continueWatchingCourses, ...myCourses, ...availableCourses].forEach((course: any) => {
      if (!deduped.has(course.id)) {
        deduped.set(course.id, course);
      }
    });

    return Array.from(deduped.values());
  }, [continueWatchingCourses, myCourses, availableCourses]);

  const searchResults = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return null;

    return searchableCourses.filter((course: any) =>
      [course.title, course.short_description, course.sales_description, course.categories?.name]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term)),
    );
  }, [search, searchableCourses]);

  useEffect(() => {
    const renderedCards = searchResults !== null
      ? searchResults.length
      : continueWatchingCourses.length + myCourses.length + availableCourses.length;

    console.log("[DEBUG][CURSOS] routeComponent=MeusCoursosPage");
    console.log("[DEBUG][CURSOS] queries=[courses-page:published-courses,courses-page:my-courses,courses-page:library-sections,courses-page:continue-watching]");
    console.log("[DEBUG][CURSOS] renderedCards=", renderedCards);
  }, [availableCourses.length, continueWatchingCourses.length, myCourses.length, searchResults]);

  return (
    <StudentLayout>
      <div className="min-h-screen bg-background flex flex-col">

        <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-10 xl:px-12 pt-6 sm:pt-8 pb-28">

          {/* ═══ GREETING + SEARCH ═══ */}
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
                Continue sua jornada de aprendizado
              </p>
            </div>

            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/25" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar cursos, ebooks..."
                className="pl-10 h-10 bg-card/8 border-border/10 rounded-xl text-sm placeholder:text-muted-foreground/20 focus:border-gold/25 focus:ring-gold/10 transition-all duration-300"
              />
            </div>
          </motion.div>

          {/* ═══ SHELVES CONTENT ═══ */}
          {searchResults !== null ? (
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
            <div>
              {isLoading ? (
                <CardGridSkeleton count={6} />
              ) : (
                <>
                  {/* ═══ CONTINUE ASSISTINDO ═══ */}
                  {continueWatchingCourses.length > 0 && (
                    <ShelfSection delay={0.05}>
                      <ShelfHeader title="Continue assistindo" linkTo="/cursos" linkLabel="Ver todos" />
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

                  {/* ═══ MEUS CURSOS ═══ */}
                  {myCourses.length > 0 && (
                    <ShelfSection delay={0.1}>
                      <ShelfHeader title="Meus cursos" linkTo="/cursos" linkLabel="Ver todos" />
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
                  )}

                  {/* ═══ EXPLORAR CURSOS ═══ */}
                  {availableCourses.length > 0 && (
                    <ShelfSection delay={0.15}>
                      <ShelfHeader title="Explorar cursos" linkTo="/cursos" linkLabel="Ver todos" />
                      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                        {availableCourses.map((course: any, idx: number) => (
                          <motion.div
                            key={`catalog-${course.id}`}
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.35, delay: Math.min(idx, 8) * 0.04 }}
                          >
                            <CourseShelfCard
                              course={course}
                              comingSoon={course.access_state === "coming_soon"}
                            />
                          </motion.div>
                        ))}
                      </div>
                    </ShelfSection>
                  )}

                  {/* ═══ SEUS ACESSOS ═══ */}
                  {(libSections?.unlocked?.length ?? 0) >= 2 && (
                    <ShelfSection delay={0.3}>
                      <ShelfHeader title="Seus Acessos" />
                      <ShelfRow>
                        {(libSections?.unlocked || []).map((item: any, idx: number) => (
                          <ShelfItem key={`unlocked-${item.id}`} index={idx}>
                            <LibraryContentCard item={item} />
                          </ShelfItem>
                        ))}
                      </ShelfRow>
                    </ShelfSection>
                  )}

                  {/* ═══ DISPONÍVEL PARA VOCÊ (BLOQUEADO) ═══ */}
                  {(libSections?.locked?.length ?? 0) >= 2 && (
                    <ShelfSection delay={0.35}>
                      <ShelfHeader title="Disponível para você" />
                      <ShelfRow>
                        {(libSections?.locked || []).map((item: any, idx: number) => (
                          <ShelfItem key={`locked-${item.id}`} index={idx}>
                            <LockedContentCard item={item} />
                          </ShelfItem>
                        ))}
                      </ShelfRow>
                    </ShelfSection>
                  )}

                  {/* ═══ EM BREVE ═══ */}
                  {(libSections?.upcoming?.length ?? 0) >= 2 && (
                    <ShelfSection delay={0.4}>
                      <ShelfHeader title="Novidades chegando" />
                      <ShelfRow>
                        {(libSections?.upcoming || []).map((item: any, idx: number) => (
                          <ShelfItem key={`upcoming-${item.id}`} index={idx}>
                            <UpcomingContentCard item={item} />
                          </ShelfItem>
                        ))}
                      </ShelfRow>
                    </ShelfSection>
                  )}

                  {/* ═══ FAVORITOS ═══ */}
                  {(libSections?.favorites?.length ?? 0) >= 2 && (
                    <ShelfSection delay={0.45}>
                      <ShelfHeader title="Seus Favoritos" />
                      <ShelfRow>
                        {(libSections?.favorites || []).map((item: any, idx: number) => (
                          <ShelfItem key={`fav-${item.id}`} index={idx}>
                            <LibraryContentCard item={item} />
                          </ShelfItem>
                        ))}
                      </ShelfRow>
                    </ShelfSection>
                  )}

                  {/* ═══ BÔNUS ═══ */}
                  {(libSections?.bonus?.length ?? 0) >= 2 && (
                    <ShelfSection delay={0.5}>
                      <ShelfHeader title="Bônus Exclusivos" />
                      <ShelfRow>
                        {(libSections?.bonus || []).map((item: any, idx: number) => (
                          <ShelfItem key={`bonus-${item.id}`} index={idx}>
                            <LibraryContentCard item={item} isFree />
                          </ShelfItem>
                        ))}
                      </ShelfRow>
                    </ShelfSection>
                  )}

                  {continueWatchingCourses.length === 0 && myCourses.length === 0 && availableCourses.length === 0 && (
                    <EmptyState icon={BookOpen} title="Nenhum conteúdo disponível" description="Em breve novos cursos serão adicionados." />
                  )}
                </>
              )}
            </div>
          )}
        </main>

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
      className="mb-8 sm:mb-10"
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
    <div className="flex items-baseline justify-between mb-3.5 sm:mb-4">
      <h2 className="font-display text-[22px] sm:text-[26px] md:text-[28px] font-bold text-foreground/95 tracking-[-0.01em] leading-none">
        {title}
      </h2>
      {linkTo && linkLabel && (
        <Link to={linkTo as any} className="text-[10px] sm:text-[11px] font-semibold text-gold/30 uppercase tracking-[0.14em] hover:text-gold/60 transition-colors duration-300 flex items-center gap-1.5 shrink-0">
          {linkLabel} <ArrowRight className="h-3 w-3" />
        </Link>
      )}
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

  const scroll = useCallback((direction: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.7;
    el.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' });
  }, []);

  return (
    <div className="group/shelf relative -mx-4 sm:-mx-6 lg:-mx-10 xl:-mx-12">
      {/* Fade edges */}
      <div className={`absolute left-0 top-0 bottom-3 w-8 sm:w-12 z-10 pointer-events-none bg-gradient-to-r from-background to-transparent transition-opacity duration-500 ${canScrollLeft ? 'opacity-100' : 'opacity-0'}`} />
      <div className={`absolute right-0 top-0 bottom-3 w-8 sm:w-12 z-10 pointer-events-none bg-gradient-to-l from-background to-transparent transition-opacity duration-500 ${canScrollRight ? 'opacity-100' : 'opacity-0'}`} />

      {/* Left arrow */}
      <button
        onClick={() => scroll('left')}
        className={`absolute left-2 top-1/2 -translate-y-1/2 z-20 h-11 w-11 rounded-full bg-background/90 border border-border/20 backdrop-blur-md flex items-center justify-center transition-all duration-300 hover:bg-card/50 hover:scale-105 shadow-xl ${canScrollLeft ? 'opacity-0 group-hover/shelf:opacity-100' : 'opacity-0 pointer-events-none'}`}
      >
        <ChevronLeft className="h-5 w-5 text-foreground/70" />
      </button>

      {/* Right arrow */}
      <button
        onClick={() => scroll('right')}
        className={`absolute right-2 top-1/2 -translate-y-1/2 z-20 h-11 w-11 rounded-full bg-background/90 border border-border/20 backdrop-blur-md flex items-center justify-center transition-all duration-300 hover:bg-card/50 hover:scale-105 shadow-xl ${canScrollRight ? 'opacity-0 group-hover/shelf:opacity-100' : 'opacity-0 pointer-events-none'}`}
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
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {children}
      </div>
    </div>
  );
}

function ShelfItem({ children, index }: { children: React.ReactNode; index: number }) {
  // Only animate the first 6 items for performance
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

/* ══════════════════════════════════════════════════════════════
   HERO BANNER — Cinematic, full-width with rounded corners
   ══════════════════════════════════════════════════════════════ */

function HeroBanner({ course }: { course: any }) {
  const bannerImg = course.banner_image_url || course.cover_image_url;
  const isCustomBanner = course.id === '__custom_banner__';
  const bannerLinkUrl = course.banner_link_url || course.sales_page_url || course.checkout_url;

  const bannerContent = (
    <div className="mb-8 sm:mb-10">
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        className={`relative w-full h-[220px] sm:h-[300px] md:h-[380px] lg:h-[420px] rounded-2xl sm:rounded-3xl overflow-hidden shadow-[0_8px_60px_-12px_rgba(0,0,0,0.7)] ring-1 ring-white/[0.04] ${bannerLinkUrl && isCustomBanner ? 'cursor-pointer' : ''}`}
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
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/5" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-transparent to-transparent" />

        {/* Premium vignette + glow */}
        <div className="absolute inset-0 shadow-[inset_0_0_150px_rgba(0,0,0,0.4)]" />
        <div className="absolute inset-0 rounded-2xl sm:rounded-3xl ring-1 ring-inset ring-white/[0.06]" />

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

  if (isCustomBanner && bannerLinkUrl) {
    return (
      <a href={bannerLinkUrl} target="_blank" rel="noopener noreferrer">
        {bannerContent}
      </a>
    );
  }

  return bannerContent;
}



/* ══════════════════════════════════════════════════════════════
   LIBRARY CARDS — wrappers finos sobre ContentCard (Card Master)
   para manter padronização visual com /bonus, /ebooks, /conteudo.
   ══════════════════════════════════════════════════════════════ */

function LibraryContentCard({ item, isFree }: { item: any; isFree?: boolean }) {
  const enrichedItem = isFree
    ? { ...item, is_free: true, badge_text: item.badge_text || "Grátis" }
    : item;
  const TypeIcon = item.content_type === "ebook" ? BookOpen : Play;
  return (
    <ContentCard
      item={enrichedItem}
      index={0}
      hasAccess={true}
      gradient="from-sky-900/40 via-blue-950/30 to-slate-950/50"
      TypeIcon={TypeIcon}
    />
  );
}

function LockedContentCard({ item }: { item: any }) {
  // Força estado bloqueado mantendo sales_page_url para click externo
  const lockedItem = {
    ...item,
    is_free: false,
    unlocked: false,
    effectiveAccessMode: "pago",
    locked_label: "Conteúdo Premium",
  };
  return (
    <ContentCard
      item={lockedItem}
      index={0}
      hasAccess={false}
      gradient="from-stone-900/40 via-zinc-950/30 to-neutral-950/50"
      TypeIcon={Lock}
    />
  );
}

function UpcomingContentCard({ item }: { item: any }) {
  // Estado "em breve": força launch_mode para o overlay correto do ContentCard
  const upcomingItem = {
    ...item,
    launch_mode: "em_breve",
    is_free: false,
    unlocked: false,
    unlockDate: item.unlock_at,
  };
  return (
    <ContentCard
      item={upcomingItem}
      index={0}
      hasAccess={true}
      gradient="from-stone-900/40 via-zinc-950/30 to-neutral-950/50"
      TypeIcon={Clock}
    />
  );
}
