import { EmptyState } from "@/components/EmptyState";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CardGridSkeleton } from "@/components/LoadingSkeletons";
import { useQuery } from "@tanstack/react-query";
import { getStudentShelves } from "@/lib/shelves.functions";
import { getMyCoursesData } from "@/lib/my-courses.functions";
import { getLibraryStats, getLibrarySections } from "@/lib/user-library.functions";
import { getContinueWatching } from "@/lib/continue-watching.functions";
import { StudentLayout } from "@/components/StudentLayout";
import { FooterLinks } from "@/components/FooterLinks";
import { CourseShelfCard } from "@/components/CourseShelfCard";
import { motion } from "framer-motion";
import { BookOpen, Search, ArrowRight, Play, Clock, Gift, Lock, ChevronLeft, ChevronRight } from "lucide-react";
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

  const { data: libStats } = useQuery({
    queryKey: ["library-stats"],
    queryFn: () => getLibraryStats(),
    staleTime: 30_000,
  });

  const { data: libSections } = useQuery({
    queryKey: ["library-sections"],
    queryFn: () => getLibrarySections(),
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

        {/* ═══ TOP BAR — greeting + search ═══ */}
        <div className="w-full max-w-[1440px] mx-auto px-7 sm:px-10 lg:px-14 pt-7 sm:pt-10">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center justify-between gap-4 mb-6"
          >
            <h1 className="font-display text-lg sm:text-xl font-bold text-foreground/80 tracking-tight whitespace-nowrap">
              Olá, {firstName}
            </h1>

            <div className="relative w-full max-w-xs">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/25" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar cursos..."
                className="pl-10 h-9 bg-card/6 border-border/8 rounded-xl text-xs placeholder:text-muted-foreground/20 focus:border-gold/20 focus:ring-gold/8 transition-all duration-300"
              />
            </div>
          </motion.div>
        </div>

        {/* ═══ HERO BANNER ═══ */}
        {!isLoading && featuredCourse && !searchResults && (
          <HeroBanner course={featuredCourse} />
        )}

        {/* ═══ SHELVES CONTENT ═══ */}
        <div className="w-full max-w-[1440px] mx-auto px-7 sm:px-10 lg:px-14">

          {/* ═══ SEARCH RESULTS ═══ */}
          {searchResults !== null ? (
            <div className="pt-8 pb-24">
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
            <div className="pt-12 sm:pt-14 pb-28">
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
                            className="mb-16"
                          >
                            {banner.link_url ? (
                              <a href={banner.link_url} target="_blank" rel="noopener noreferrer" className="block rounded-2xl overflow-hidden border border-border/6 hover:border-gold/10 transition-all duration-300">
                                <img src={banner.image_url} alt={banner.title} className="w-full h-auto object-cover" />
                              </a>
                            ) : (
                              <div className="rounded-2xl overflow-hidden border border-border/6">
                                <img src={banner.image_url} alt={banner.title} className="w-full h-auto object-cover" />
                              </div>
                            )}
                          </motion.div>
                        ))}
                      </div>
                    );
                  })}

                  {/* ═══ SEUS ACESSOS ═══ */}
                  {(libSections?.unlocked?.length ?? 0) > 0 && (
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
                  {(libSections?.locked?.length ?? 0) > 0 && (
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
                  {(libSections?.upcoming?.length ?? 0) > 0 && (
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
                  {(libSections?.favorites?.length ?? 0) > 0 && (
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
                  {(libSections?.bonus?.length ?? 0) > 0 && (
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
      className="mb-10 sm:mb-12"
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
    <div className="group/shelf relative -mx-7 sm:-mx-10 lg:-mx-14">
      {/* Fade edges */}
      <div className={`absolute left-0 top-0 bottom-4 w-10 sm:w-14 lg:w-20 z-10 pointer-events-none bg-gradient-to-r from-background to-transparent transition-opacity duration-500 ${canScrollLeft ? 'opacity-100' : 'opacity-0'}`} />
      <div className={`absolute right-0 top-0 bottom-4 w-10 sm:w-14 lg:w-20 z-10 pointer-events-none bg-gradient-to-l from-background to-transparent transition-opacity duration-500 ${canScrollRight ? 'opacity-100' : 'opacity-0'}`} />

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
        className="flex gap-4 sm:gap-[18px] lg:gap-5 overflow-x-auto pb-3 scrollbar-hide px-7 sm:px-10 lg:px-14 snap-x snap-mandatory scroll-smooth cursor-grab select-none will-change-scroll"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {children}
      </div>
    </div>
  );
}

function ShelfItem({ children, index }: { children: React.ReactNode; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.04 * Math.min(index, 10), ease: [0.22, 1, 0.36, 1] }}
      className="flex-shrink-0 snap-start w-[150px] sm:w-[165px] md:w-[175px] lg:w-[180px] xl:w-[185px]"
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
    <div className="px-5 sm:px-10 lg:px-14 xl:px-20 pt-2 sm:pt-4 mb-16 sm:mb-24">
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        className={`relative w-full h-[280px] sm:h-[380px] md:h-[460px] lg:h-[520px] xl:h-[560px] rounded-3xl sm:rounded-[28px] overflow-hidden shadow-[0_8px_60px_-12px_rgba(0,0,0,0.7)] ring-1 ring-white/[0.04] ${bannerLinkUrl && isCustomBanner ? 'cursor-pointer' : ''}`}
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
        <div className="absolute inset-0 rounded-3xl sm:rounded-[28px] ring-1 ring-inset ring-white/[0.06]" />

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
   LIBRARY CONTENT CARD (unlocked / favorites / bonus)
   Same visual pattern as CourseShelfCard — vertical poster 9:13
   ══════════════════════════════════════════════════════════════ */

function LibraryContentCard({ item, isFree }: { item: any; isFree?: boolean }) {
  return (
    <Link
      to="/conteudo/$trackId"
      params={{ trackId: item.id }}
      className="group/card relative block cursor-pointer"
    >
      <div className="relative rounded-[14px] sm:rounded-[16px] overflow-visible md:transition-all md:duration-[600ms] md:ease-[cubic-bezier(0.22,1,0.36,1)] md:group-hover/card:scale-[1.04] md:group-hover/card:z-30">
        {/* Ambient glow */}
        <div className="absolute -inset-4 rounded-3xl bg-gold/0 md:group-hover/card:bg-gold/[0.05] md:transition-all md:duration-700 blur-3xl pointer-events-none" />

        <div className="relative rounded-[14px] sm:rounded-[16px] overflow-hidden bg-card/5 shadow-md shadow-black/25 ring-1 ring-white/[0.04] md:group-hover/card:shadow-[0_12px_40px_-8px_rgba(0,0,0,0.6)] md:group-hover/card:ring-gold/15 md:transition-all md:duration-500">
          <div className="relative aspect-[9/13] overflow-hidden">
            {(item.card_cover_url || item.cover_url) ? (
              <img
                src={item.card_cover_url || item.cover_url}
                alt={item.title}
                className="w-full h-full object-cover md:transition-transform md:duration-[900ms] md:ease-out md:group-hover/card:scale-[1.08]"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-card/40 via-muted/10 to-background flex items-center justify-center">
                <BookOpen className="h-10 w-10 text-muted-foreground/8" />
              </div>
            )}

            {/* Bottom gradient */}
            <div className="absolute inset-x-0 bottom-0 h-[70%] bg-gradient-to-t from-black/95 via-black/50 to-transparent" />
            <div className="absolute inset-0 bg-black/0 md:group-hover/card:bg-black/30 md:transition-all md:duration-500" />
            <div className="absolute inset-0 shadow-[inset_0_0_30px_rgba(0,0,0,0.25)] pointer-events-none" />

            {/* Badge */}
            {isFree && (
              <div className="absolute top-2.5 left-2.5 z-10">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gold/90 text-[9px] sm:text-[10px] font-bold text-gold-foreground uppercase tracking-wide shadow-lg shadow-black/30 backdrop-blur-sm">
                  <Gift className="h-2.5 w-2.5" /> Grátis
                </span>
              </div>
            )}
            {item.badge_text && !isFree && (
              <div className="absolute top-2.5 left-2.5 z-10">
                <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-gold/20 border border-gold/30 text-[9px] font-bold text-gold uppercase tracking-wider backdrop-blur-sm">
                  {item.badge_text}
                </span>
              </div>
            )}

            {/* Play button on hover */}
            <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
              <div className="flex items-center gap-2 h-auto px-5 py-2.5 rounded-full bg-gold/95 shadow-[0_4px_24px_rgba(0,0,0,0.4)] scale-[0.5] opacity-0 md:group-hover/card:opacity-100 md:group-hover/card:scale-100 md:transition-all md:duration-500 md:ease-[cubic-bezier(0.22,1,0.36,1)]">
                <Play className="h-4 w-4 text-gold-foreground fill-gold-foreground" />
              </div>
            </div>

            {/* Title + description — bottom */}
            <div className="absolute inset-x-0 bottom-0 px-3.5 sm:px-4 pb-4 sm:pb-5 z-10">
              <h3 className="text-sm sm:text-[15px] font-bold text-white line-clamp-2 leading-snug drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] tracking-tight">
                {item.title}
              </h3>
              {item.description && (
                <p className="text-[10px] sm:text-[11px] text-white/40 mt-1.5 line-clamp-2 leading-relaxed italic opacity-80 md:opacity-0 md:group-hover/card:opacity-100 md:transition-opacity md:duration-500">
                  {item.description}
                </p>
              )}
              <p className="text-[9px] text-white/25 mt-1 uppercase tracking-[0.18em] font-semibold">
                {item.content_type === "ebook" ? "E-book" : item.content_type === "video" ? "Vídeo" : "Conteúdo"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

/* ══════════════════════════════════════════════════════════════
   LOCKED CONTENT CARD — same poster shape with lock overlay
   ══════════════════════════════════════════════════════════════ */

function LockedContentCard({ item }: { item: any }) {
  const handleClick = () => {
    if (item.sales_page_url) {
      window.open(item.sales_page_url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <button
      onClick={handleClick}
      className="group/card relative block cursor-pointer text-left"
    >
      <div className="relative rounded-[14px] sm:rounded-[16px] overflow-visible md:transition-all md:duration-[600ms] md:ease-[cubic-bezier(0.22,1,0.36,1)] md:group-hover/card:scale-[1.04] md:group-hover/card:z-30">
        {/* Ambient gold glow */}
        <div className="absolute -inset-4 rounded-3xl bg-gold/0 md:group-hover/card:bg-gold/[0.08] md:transition-all md:duration-700 blur-3xl pointer-events-none" />

        <div className="relative rounded-[14px] sm:rounded-[16px] overflow-hidden bg-card/5 shadow-md shadow-black/25 ring-1 ring-gold/10 md:group-hover/card:shadow-[0_12px_40px_-8px_rgba(0,0,0,0.6)] md:group-hover/card:ring-gold/30 md:transition-all md:duration-500">
          <div className="relative aspect-[9/13] overflow-hidden">
            {(item.card_cover_url || item.cover_url) ? (
              <img
                src={item.card_cover_url || item.cover_url}
                alt={item.title}
                className="w-full h-full object-cover md:transition-transform md:duration-[900ms] md:ease-out md:group-hover/card:scale-[1.08] saturate-[0.45] brightness-[0.35] md:group-hover/card:brightness-[0.45]"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-card/40 via-muted/10 to-background" />
            )}

            {/* Bottom gradient */}
            <div className="absolute inset-x-0 bottom-0 h-[80%] bg-gradient-to-t from-black/95 via-black/60 to-transparent" />
            <div className="absolute inset-0 bg-black/20" />
            <div className="absolute inset-0 shadow-[inset_0_0_30px_rgba(0,0,0,0.25)] pointer-events-none" />

            {/* Premium badge */}
            <div className="absolute top-2.5 left-2.5 z-10">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-r from-gold/95 to-amber-500/90 text-[9px] sm:text-[10px] font-bold text-gold-foreground uppercase tracking-wide shadow-lg shadow-black/30 backdrop-blur-sm border border-gold/20">
                <Lock className="h-2.5 w-2.5" />
                Premium
              </span>
            </div>

            {/* Lock icon — top right */}
            <div className="absolute top-2.5 right-2.5 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-black/50 backdrop-blur-sm border border-white/[0.08]">
              <Lock className="h-3 w-3 text-white/45" />
            </div>

            {/* Title + description + lock info — bottom */}
            <div className="absolute inset-x-0 bottom-0 px-3.5 sm:px-4 pb-4 sm:pb-5 z-10 flex flex-col gap-2">
              <h3 className="font-display text-sm sm:text-[15px] font-black text-white/90 leading-snug tracking-tight uppercase line-clamp-2 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                {item.title}
              </h3>

              {item.description && (
                <p className="text-[10px] sm:text-[11px] text-white/40 leading-relaxed line-clamp-2 italic">
                  {item.description}
                </p>
              )}

              {/* Lock badge */}
              <div className="flex items-center gap-2 mt-1">
                <div className="h-6 w-6 rounded-full bg-gold/15 border border-gold/30 flex items-center justify-center backdrop-blur-md md:group-hover/card:bg-gold/25 md:group-hover/card:border-gold/50 md:transition-all md:duration-300">
                  <Lock className="h-2.5 w-2.5 text-gold" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[8px] sm:text-[9px] font-bold text-gold uppercase tracking-[0.15em]">
                    Acesso exclusivo
                  </span>
                  <span className="text-[7px] sm:text-[8px] text-white/30">
                    Libera após a compra
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}

/* ══════════════════════════════════════════════════════════════
   UPCOMING CONTENT CARD — same poster shape with countdown
   ══════════════════════════════════════════════════════════════ */

function UpcomingContentCard({ item }: { item: any }) {
  const unlockAt = item.unlock_at ? new Date(item.unlock_at) : null;
  const now = new Date();
  let countdownLabel = "Em breve";

  if (unlockAt && unlockAt > now) {
    const diffMs = unlockAt.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) {
      countdownLabel = "Hoje!";
    } else if (diffDays === 1) {
      countdownLabel = "Amanhã";
    } else {
      countdownLabel = `Em ${diffDays} dias`;
    }
  }

  return (
    <div className="group/card relative block">
      <div className="relative rounded-[14px] sm:rounded-[16px] overflow-visible">
        <div className="relative rounded-[14px] sm:rounded-[16px] overflow-hidden bg-card/5 shadow-md shadow-black/25 ring-1 ring-white/[0.04]">
          <div className="relative aspect-[9/13] overflow-hidden">
            {(item.card_cover_url || item.cover_url) ? (
              <img
                src={item.card_cover_url || item.cover_url}
                alt={item.title}
                className="w-full h-full object-cover brightness-[0.3] saturate-[0.3]"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-card/40 via-muted/10 to-background" />
            )}

            <div className="absolute inset-x-0 bottom-0 h-[70%] bg-gradient-to-t from-black/95 via-black/50 to-transparent" />
            <div className="absolute inset-0 bg-black/30" />
            <div className="absolute inset-0 shadow-[inset_0_0_30px_rgba(0,0,0,0.25)] pointer-events-none" />

            {/* Countdown badge — center */}
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 z-10">
              <div className="h-12 w-12 rounded-full bg-card/20 border border-border/20 flex items-center justify-center backdrop-blur-md">
                <Clock className="h-5 w-5 text-gold/60" />
              </div>
              <span className="text-[10px] sm:text-[11px] font-bold text-gold/70 uppercase tracking-[0.15em]">
                {countdownLabel}
              </span>
            </div>

            {/* Title — bottom */}
            <div className="absolute inset-x-0 bottom-0 px-3.5 sm:px-4 pb-4 sm:pb-5 z-10">
              <h3 className="text-sm sm:text-[15px] font-bold text-white/50 line-clamp-2 leading-snug drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] tracking-tight">
                {item.title}
              </h3>
              <p className="text-[9px] text-white/20 mt-1 uppercase tracking-[0.18em] font-semibold">
                {item.content_type === "ebook" ? "E-book" : item.content_type === "video" ? "Vídeo" : "Conteúdo"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
