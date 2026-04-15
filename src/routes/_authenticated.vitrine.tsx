import { createFileRoute, Link } from "@tanstack/react-router";
import { OptimizedImage } from "@/components/OptimizedImage";
import { useQuery } from "@tanstack/react-query";
import { ModuleGuard } from "@/components/ModuleGuard";
import { getStudentShelves } from "@/lib/shelves.functions";
import { StudentLayout } from "@/components/StudentLayout";
import { FooterLinks } from "@/components/FooterLinks";
import { CourseShelfCard } from "@/components/CourseShelfCard";
import { useProjectMode } from "@/hooks/use-project-mode";
import { Store, Lock, Play, ArrowRight, ShoppingCart, Search, ChevronLeft, ChevronRight, Clock, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState, useMemo, useRef, useCallback, useEffect } from "react";

export const Route = createFileRoute("/_authenticated/vitrine")({
  component: VitrinePage,
});

const SHELF_ICONS: Record<string, React.ReactNode> = {
  '__continue__': <Play className="h-4 w-4 text-gold fill-gold" />,
  '__available__': <ShoppingCart className="h-4 w-4 text-gold" />,
  '__coming_soon__': <Clock className="h-4 w-4 text-gold" />,
};

/** Smart shelf IDs that are course-specific */
const COURSE_SMART_SHELVES = new Set(['__continue__', '__available__', '__coming_soon__']);

function VitrinePage() {
  const { data, isLoading } = useQuery({
    queryKey: ["student-shelves"],
    queryFn: () => getStudentShelves(),
    staleTime: 60_000,
    refetchOnWindowFocus: true,
  });

  const { mode, showCourses, showMusic, showLancamentos } = useProjectMode();
  const [searchTerm, setSearchTerm] = useState("");

  const shelves = data?.shelves || [];
  const promoBanners = data?.promoBanners || [];
  const featuredCourse = data?.featuredCourse;

  const modeShelves = useMemo(() => {
    return shelves.filter((shelf: any) => {
      // In somente_musica: hide course-specific smart shelves
      if (mode === "somente_musica" && COURSE_SMART_SHELVES.has(shelf.id)) return false;
      // In somente_cursos: show all course shelves (they're already course-based)
      // In hibrido: show courses shelves only if courses module enabled
      if (mode === "hibrido" && !showCourses && COURSE_SMART_SHELVES.has(shelf.id)) return false;
      // Hide "Em breve" if lancamentos disabled
      if (shelf.id === "__coming_soon__" && !showLancamentos) return false;
      // Filter out empty shelves
      return (shelf.courses?.length || 0) > 0;
    });
  }, [shelves, mode, showCourses, showLancamentos]);

  const filteredShelves = useMemo(() => {
    if (!searchTerm.trim()) return modeShelves;
    const term = searchTerm.toLowerCase();
    return modeShelves
      .map((shelf: any) => ({
        ...shelf,
        courses: shelf.courses.filter((c: any) =>
          c.title?.toLowerCase().includes(term) ||
          c.short_description?.toLowerCase().includes(term)
        ),
      }))
      .filter((shelf: any) => shelf.courses.length > 0);
  }, [modeShelves, searchTerm]);

  // Count admin shelves for promo banner positioning
  let adminShelfIndex = 0;

  return (
    <ModuleGuard moduleKey="vitrine">
    <StudentLayout>
      <div className="min-h-screen flex flex-col bg-background">
        <div className="flex-1 w-full pb-28">
          {/* ── Netflix-style Hero Banner (hide in music-only mode unless custom) ── */}
          {featuredCourse && !(mode === "somente_musica" && featuredCourse.id !== "__custom_banner__") && (
            <HeroBanner course={featuredCourse} />
          )}

          {/* ── Content area ── */}
          <div className="relative z-10 -mt-16 sm:-mt-24">
            {!featuredCourse && (
              <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-8 lg:px-12 pt-10">
                <div className="flex items-center gap-3 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-600">
                  <Store className="h-7 w-7 text-gold" />
                  <div>
                    <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground/90 tracking-tight">
                      Vitrine
                    </h1>
                    <p className="text-[13px] text-muted-foreground/50 mt-0.5">
                      Explore nossos cursos e conteúdos
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Search bar */}
            <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-8 lg:px-12">
              <div className="relative max-w-sm mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/60" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar cursos..."
                  className="pl-9 bg-card/20 border-border/30 text-sm h-10 backdrop-blur-sm"
                />
              </div>
            </div>

            {isLoading ? (
              <div className="text-center py-24">
                <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground/60 animate-pulse">
                  Carregando vitrine...
                </p>
              </div>
            ) : filteredShelves.length === 0 ? (
              <div className="text-center py-24">
                <Store className="h-10 w-10 text-muted-foreground/50 mx-auto mb-5" />
                <p className="text-sm text-muted-foreground/70">
                  {searchTerm ? "Nenhum curso encontrado para esta busca." : "Nenhum conteúdo disponível na vitrine no momento."}
                </p>
              </div>
            ) : (
              <div className="space-y-8 sm:space-y-12">
                {filteredShelves.map((shelf: any, shelfIdx: number) => {
                  const isAdminShelf = shelf.shelf_type !== 'smart';
                  if (isAdminShelf) adminShelfIndex++;

                  return (
                    <section
                      key={shelf.id}
                      className="animate-in fade-in slide-in-from-bottom-4 duration-500"
                      style={{ animationDelay: `${shelfIdx * 60}ms`, animationFillMode: 'both' }}
                    >
                      {/* Shelf title */}
                      <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-8 lg:px-12 mb-3 sm:mb-4">
                        <div className="flex items-center gap-2.5">
                          {SHELF_ICONS[shelf.id] && (
                            <span className="flex-shrink-0">{SHELF_ICONS[shelf.id]}</span>
                          )}
                          <h2 className="font-display text-lg sm:text-xl font-bold text-foreground/90 tracking-tight">
                            {shelf.name}
                          </h2>
                          <div className="flex-1 h-px bg-gradient-to-r from-gold/10 to-transparent" />
                          <span className="text-[10px] sm:text-xs text-muted-foreground/40 uppercase tracking-wider font-medium">
                            {shelf.courses.length} título{shelf.courses.length !== 1 ? "s" : ""}
                          </span>
                        </div>
                      </div>

                      {/* Netflix carousel */}
                      <NetflixCarousel courses={shelf.courses} shelfId={shelf.id} />

                      {/* Promo banner after admin shelf */}
                      {isAdminShelf && promoBanners
                        .filter((b: any) => b.position_after_shelf === adminShelfIndex)
                        .map((banner: any) => (
                          <div
                            key={banner.id}
                            className="mx-auto w-full max-w-[1400px] px-4 sm:px-8 lg:px-12 mt-6 animate-in fade-in slide-in-from-bottom-3 duration-500"
                          >
                            {banner.link_url ? (
                              <a href={banner.link_url} target="_blank" rel="noopener noreferrer">
                                <OptimizedImage
                                  src={banner.image_url}
                                  alt={banner.title}
                                  context="banner"
                                  className="w-full rounded-xl border border-border/25 hover:border-gold/20 transition-colors"
                                />
                              </a>
                            ) : (
                              <OptimizedImage
                                src={banner.image_url}
                                alt={banner.title}
                                context="banner"
                                className="w-full rounded-xl border border-border/25"
                              />
                            )}
                          </div>
                        ))}
                    </section>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <FooterLinks />
      </div>
    </StudentLayout>
    </ModuleGuard>
  );
}

/* ── Netflix Premium Hero Banner ── */
function HeroBanner({ course }: { course: any }) {
  const bannerLinkUrl = course.banner_link_url || course.sales_page_url || course.checkout_url;
  const imageUrl = course.banner_image_url || course.cover_image_url;
  const isLocked = ['locked', 'blocked', 'expired'].includes(course.access_state);
  const isEnrolled = ['enrolled', 'in_progress', 'completed'].includes(course.access_state);

  const content = (
    <div
      className={`relative w-full h-[60vh] sm:h-[70vh] lg:h-[75vh] min-h-[360px] max-h-[720px] overflow-hidden animate-in fade-in duration-1000 ${bannerLinkUrl ? 'cursor-pointer' : ''}`}
    >
      {imageUrl && (
        <OptimizedImage
          src={imageUrl}
          alt={course.display_title || course.title}
          context="hero"
          priority
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}

      {/* Cinematic overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/10" />
      <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/40 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-background via-background/95 to-transparent" />
      <div className="absolute inset-0 shadow-[inset_0_0_120px_40px_rgba(0,0,0,0.35)] pointer-events-none" />

      {/* Content */}
      <div className="absolute inset-0 flex items-end">
        <div className="w-full px-4 sm:px-8 lg:px-12 pb-20 sm:pb-28 lg:pb-32">
          <div className="mx-auto w-full max-w-[1400px]">
            {/* Featured badge */}
            <div className="mb-4 animate-in fade-in slide-in-from-left-4 duration-600" style={{ animationDelay: '200ms', animationFillMode: 'both' }}>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-gold/20 border border-gold/30 text-gold text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] backdrop-blur-sm">
                <Sparkles className="h-3 w-3" />
                {isEnrolled ? 'Seu destaque' : isLocked ? 'Destaque Premium' : 'Em destaque'}
              </span>
            </div>

            {/* Title */}
            <h1
              className="font-display text-3xl sm:text-5xl lg:text-[3.5rem] xl:text-6xl font-black text-foreground tracking-tight mb-3 sm:mb-4 max-w-2xl leading-[1.08] drop-shadow-[0_4px_20px_rgba(0,0,0,0.7)] animate-in fade-in slide-in-from-bottom-6 duration-700"
              style={{ animationDelay: '350ms', animationFillMode: 'both' }}
            >
              {course.display_title || course.title}
            </h1>

            {/* Subtitle */}
            {(course.display_subtitle || course.short_description) && (
              <p
                className="text-sm sm:text-base lg:text-lg text-foreground/50 mb-6 sm:mb-8 max-w-xl leading-relaxed line-clamp-3 animate-in fade-in slide-in-from-bottom-6 duration-700"
                style={{ animationDelay: '500ms', animationFillMode: 'both' }}
              >
                {course.display_subtitle || course.short_description}
              </p>
            )}

            {/* CTA */}
            {course.id !== '__custom_banner__' && (
              <div
                className="flex flex-wrap items-center gap-3 sm:gap-4 animate-in fade-in slide-in-from-bottom-6 duration-700"
                style={{ animationDelay: '650ms', animationFillMode: 'both' }}
              >
                <HeroCTA course={course} />
              </div>
            )}

            {/* Meta info */}
            {course.total_lessons > 0 && (
              <div
                className="mt-5 flex items-center gap-4 text-[11px] sm:text-xs text-foreground/30 uppercase tracking-wider animate-in fade-in duration-600"
                style={{ animationDelay: '900ms', animationFillMode: 'both' }}
              >
                <span>{course.total_lessons} aula{course.total_lessons !== 1 ? 's' : ''}</span>
                {course.progress_pct > 0 && course.progress_pct < 100 && (
                  <>
                    <span className="h-1 w-1 rounded-full bg-gold/40" />
                    <span className="text-gold/60">{course.progress_pct}% concluído</span>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return bannerLinkUrl ? (
    <a href={bannerLinkUrl} target="_blank" rel="noopener noreferrer">
      {content}
    </a>
  ) : content;
}


/* ── Netflix-style Carousel ── */
function NetflixCarousel({ courses, shelfId }: { courses: any[]; shelfId?: string }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }, []);

  useEffect(() => {
    const timer = setTimeout(checkScroll, 150);
    const el = scrollRef.current;
    const ro = el ? new ResizeObserver(checkScroll) : null;
    if (el && ro) ro.observe(el);
    return () => { clearTimeout(timer); ro?.disconnect(); };
  }, [checkScroll]);

  const scroll = useCallback((dir: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.8;
    el.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
  }, []);

  // For "coming soon" shelf, render a special badge
  const isComingSoon = shelfId === '__coming_soon__';

  return (
    <div className="relative group/shelf">
      {/* Left arrow — always visible on mobile, hover on desktop */}
      {canScrollLeft && (
        <button
          onClick={() => scroll('left')}
          aria-label="Anterior"
          className="absolute left-0 top-0 bottom-0 z-20 w-10 sm:w-14 lg:w-16 flex items-center justify-center bg-gradient-to-r from-background/95 via-background/70 to-transparent text-foreground/60 active:text-gold sm:text-foreground/50 sm:hover:text-gold transition-colors lg:opacity-0 lg:group-hover/shelf:opacity-100"
        >
          <ChevronLeft className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8" />
        </button>
      )}

      {/* Right arrow */}
      {canScrollRight && (
        <button
          onClick={() => scroll('right')}
          aria-label="Próximo"
          className="absolute right-0 top-0 bottom-0 z-20 w-10 sm:w-14 lg:w-16 flex items-center justify-center bg-gradient-to-l from-background/95 via-background/70 to-transparent text-foreground/60 active:text-gold sm:text-foreground/50 sm:hover:text-gold transition-colors lg:opacity-0 lg:group-hover/shelf:opacity-100"
        >
          <ChevronRight className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8" />
        </button>
      )}

      <div
        ref={scrollRef}
        onScroll={checkScroll}
        className="flex gap-2.5 sm:gap-3.5 lg:gap-4 overflow-x-auto pb-4 px-3 sm:px-6 lg:px-12 scrollbar-hide snap-x snap-mandatory touch-pan-x"
        style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
      >
        <div className="shrink-0 w-0 lg:w-[calc((100vw-1400px)/2)]" />

        {courses.map((course: any, idx: number) => (
          <div key={course.id} className="w-[150px] sm:w-[190px] md:w-[220px] lg:w-[240px] shrink-0 snap-start">
            <CourseShelfCard
              course={course}
              index={idx}
              showProgress
              badge={
                isComingSoon && course.badge_text ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-500/90 text-[9px] sm:text-[10px] font-bold text-white uppercase tracking-wide shadow-lg shadow-black/30 backdrop-blur-sm">
                    <Clock className="h-2.5 w-2.5" />
                    {course.badge_text}
                  </span>
                ) : undefined
              }
            />
          </div>
        ))}

        <div className="shrink-0 w-0 lg:w-[calc((100vw-1400px)/2)]" />
      </div>
    </div>
  );
}


function HeroCTA({ course }: { course: any }) {
  const isEnrolled = ['enrolled', 'in_progress'].includes(course.access_state);
  const isLocked = ['locked', 'blocked', 'expired'].includes(course.access_state);

  if (isEnrolled) {
    return (
      <Link
        to="/cursos/$courseId"
        params={{ courseId: course.id }}
        className="inline-flex items-center gap-2.5 rounded-lg bg-gold text-gold-foreground px-8 py-4 text-sm font-bold uppercase tracking-wider hover:bg-gold/90 transition-all shadow-xl shadow-gold/25 hover:shadow-gold/35"
      >
        <Play className="h-5 w-5 fill-current" /> Assistir Agora
      </Link>
    );
  }

  if (isLocked && (course.sales_page_url || course.checkout_url)) {
    const salesUrl = course.sales_page_url || course.checkout_url;
    return (
      <a
        href={salesUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2.5 rounded-lg bg-gold/15 text-gold border border-gold/30 px-8 py-4 text-sm font-bold uppercase tracking-wider hover:bg-gold/25 hover:border-gold/50 transition-all backdrop-blur-sm shadow-lg"
      >
        <ShoppingCart className="h-[18px] w-[18px]" /> Adquirir Agora
      </a>
    );
  }

  return null;
}
