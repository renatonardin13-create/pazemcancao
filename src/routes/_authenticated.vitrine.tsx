import { createFileRoute, Link } from "@tanstack/react-router";
import { OptimizedImage } from "@/components/OptimizedImage";
import { useQuery } from "@tanstack/react-query";
import { ModuleGuard } from "@/components/ModuleGuard";
import { getStudentShelves } from "@/lib/shelves.functions";
import { getTrendingCourses } from "@/lib/trending.functions";
import { StudentLayout } from "@/components/StudentLayout";
import { FooterLinks } from "@/components/FooterLinks";
import { CourseShelfCard } from "@/components/CourseShelfCard";
import { useProjectMode } from "@/hooks/use-project-mode";
import { Store, Lock, Play, ArrowRight, ShoppingCart, Search, ChevronLeft, ChevronRight, Clock, Sparkles } from "lucide-react";
import { InvisibleFunnelShelves } from "@/components/InvisibleFunnelShelves";
import { Input } from "@/components/ui/input";
import { useState, useMemo, useRef, useCallback, useEffect } from "react";

export const Route = createFileRoute("/_authenticated/vitrine")({
  component: VitrinePage,
});

const SHELF_ICONS: Record<string, React.ReactNode> = {
  '__continue__': <Play className="h-4 w-4 text-gold fill-gold" />,
  '__available__': <ShoppingCart className="h-4 w-4 text-gold" />,
  '__coming_soon__': <Clock className="h-4 w-4 text-gold" />,
  '__trending__': <Sparkles className="h-4 w-4 text-gold" />,
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

  const { data: trendingData } = useQuery({
    queryKey: ["trending-courses-7d"],
    queryFn: () => getTrendingCourses(),
    staleTime: 5 * 60_000,
  });

  const { mode, showCoursesInVitrine, showMusicInVitrine, showLancamentos } = useProjectMode();
  const [searchTerm, setSearchTerm] = useState("");

  const shelves = data?.shelves || [];
  const promoBanners = data?.promoBanners || [];
  const featuredCourse = data?.featuredCourse;
  const featuredCourses: any[] = (data as any)?.featuredCourses?.length
    ? (data as any).featuredCourses
    : (featuredCourse ? [featuredCourse] : []);

  const modeShelves = useMemo(() => {
    const base = shelves.filter((shelf: any) => {
      // In somente_musica: hide course-specific smart shelves
      if (mode === "somente_musica" && COURSE_SMART_SHELVES.has(shelf.id)) return false;
      // In somente_cursos: show all course shelves (they're already course-based)
      // In hibrido: show courses shelves only if courses module enabled
      if (mode === "hibrido" && !showCoursesInVitrine && COURSE_SMART_SHELVES.has(shelf.id)) return false;
      // Hide "Em breve" if lancamentos disabled
      if (shelf.id === "__coming_soon__" && !showLancamentos) return false;
      // Evita prateleiras com 1 item isolado (visual quebrado/vazio).
      // "Continue assistindo" pode ter 1 item porque é contextual e útil.
      const minCards = shelf.id === '__continue__' ? 1 : 2;
      return (shelf.courses?.length || 0) >= minCards;
    });

    // Prepend "Mais acessados esta semana" se houver dados (≥2 cursos)
    const trending = trendingData?.courses || [];
    if (mode !== "somente_musica" && trending.length >= 2) {
      return [
        {
          id: "__trending__",
          name: "Mais acessados esta semana",
          shelf_type: "smart",
          courses: trending,
        },
        ...base,
      ];
    }
    return base;
  }, [shelves, mode, showCoursesInVitrine, showLancamentos, trendingData]);

  // RC1: dedupe — um curso não pode aparecer em mais de uma prateleira.
  // Ordem de prioridade: a primeira prateleira fica intacta; as seguintes
  // removem cursos já exibidos. Prateleiras "recomendadas" são empurradas
  // para o final para receberem o restante.
  const dedupedShelves = useMemo(() => {
    const isRecommended = (s: any) =>
      /recomend/i.test(s?.name || "") || s?.auto_criteria === "recommended";
    const ordered = [...modeShelves].sort((a: any, b: any) => {
      const ar = isRecommended(a) ? 1 : 0;
      const br = isRecommended(b) ? 1 : 0;
      return ar - br;
    });
    const seen = new Set<string>();
    return ordered
      .map((shelf: any) => {
        const courses = (shelf.courses || []).filter((c: any) => {
          if (seen.has(c.id)) return false;
          seen.add(c.id);
          return true;
        });
        return { ...shelf, courses };
      })
      .filter((shelf: any) => {
        const minCards = shelf.id === "__continue__" ? 1 : 2;
        return shelf.courses.length >= minCards;
      });
  }, [modeShelves]);

  const filteredShelves = useMemo(() => {
    if (!searchTerm.trim()) return dedupedShelves;
    const term = searchTerm.toLowerCase();
    return dedupedShelves
      .map((shelf: any) => ({
        ...shelf,
        courses: shelf.courses.filter((c: any) =>
          c.title?.toLowerCase().includes(term) ||
          c.short_description?.toLowerCase().includes(term)
        ),
      }))
      .filter((shelf: any) => shelf.courses.length > 0);
  }, [dedupedShelves, searchTerm]);

  // Count admin shelves for promo banner positioning
  let adminShelfIndex = 0;

  return (
    <ModuleGuard moduleKey="vitrine">
    <StudentLayout>
      <div className="min-h-screen flex flex-col bg-background">
        <div className="flex-1 w-full pb-28">
          <div className="relative z-10">
            <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-8 lg:px-12 pt-8 sm:pt-10">
              <div className="flex items-center gap-3 mb-6 sm:mb-8 animate-in fade-in slide-in-from-bottom-4 duration-600">
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

            {/* ── Destaque da semana (carrossel rotativo até 3) ── */}
            {featuredCourses.length > 0 && !(mode === "somente_musica" && featuredCourses[0].id !== "__custom_banner__") && (
              <FeaturedCarousel courses={featuredCourses} />
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

                {/* Invisible funnel shelves — blended naturally after real shelves */}
                <InvisibleFunnelShelves context="vitrine" />
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

/* ── Destaque da semana — carrossel rotativo (até 3, 6s) ── */
function FeaturedCarousel({ courses }: { courses: any[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const total = courses.length;

  useEffect(() => {
    if (total <= 1 || paused) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % total), 6000);
    return () => clearInterval(id);
  }, [total, paused]);

  if (total === 0) return null;
  const current = courses[Math.min(index, total - 1)];

  return (
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className="relative"
    >
      <div key={current.id} className="animate-in fade-in duration-500">
        <FeaturedHighlight course={current} />
      </div>
      {total > 1 && (
        <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-8 lg:px-12 -mt-4 mb-6 flex items-center justify-center gap-2">
          {courses.map((c, i) => (
            <button
              key={c.id}
              aria-label={`Destaque ${i + 1}`}
              onClick={() => setIndex(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? 'w-8 bg-gold' : 'w-2 bg-gold/30 hover:bg-gold/50'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Destaque da semana — card compacto consistente ── */
function FeaturedHighlight({ course }: { course: any }) {
  const bannerLinkUrl = course.banner_link_url || course.sales_page_url || course.checkout_url;
  const imageUrl = course.banner_image_url || course.cover_image_url;
  const isLocked = ['locked', 'blocked', 'expired'].includes(course.access_state);
  const isEnrolled = ['enrolled', 'in_progress', 'completed'].includes(course.access_state);

  const card = (
    <div className="group relative w-full overflow-hidden rounded-2xl border border-gold/15 bg-gradient-to-br from-card/40 via-background to-black/60 hover:border-gold/30 transition-all duration-500 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.6)]">
      <div className="grid grid-cols-1 sm:grid-cols-[40%_1fr] gap-0">
        <div className="relative aspect-[16/9] sm:aspect-auto sm:min-h-[180px] overflow-hidden">
          {imageUrl ? (
            <OptimizedImage
              src={imageUrl}
              alt={course.display_title || course.title}
              context="banner"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-gold/10 to-black/40 flex items-center justify-center">
              <Sparkles className="h-10 w-10 text-gold/30" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-background/30 to-background sm:bg-gradient-to-r sm:from-transparent sm:to-background/95" />
        </div>

        <div className="relative flex flex-col justify-center gap-2.5 p-5 sm:p-6 lg:p-7">
          <span className="inline-flex w-fit items-center gap-1.5 px-2.5 py-1 rounded-full bg-gold/15 border border-gold/25 text-gold text-[10px] font-bold uppercase tracking-[0.2em]">
            <Sparkles className="h-2.5 w-2.5" />
            Destaque da semana
          </span>
          <h2 className="font-display text-lg sm:text-xl lg:text-2xl font-bold text-foreground/95 tracking-tight leading-tight line-clamp-2">
            {course.display_title || course.title}
          </h2>
          {(course.display_subtitle || course.short_description) && (
            <p className="text-xs sm:text-sm text-muted-foreground/70 leading-relaxed line-clamp-2 max-w-xl">
              {course.display_subtitle || course.short_description}
            </p>
          )}
          {course.id !== '__custom_banner__' && (
            <div className="flex items-center gap-3 mt-1.5">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-gold/80 group-hover:text-gold transition-colors">
                {isLocked ? <ShoppingCart className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 fill-current" />}
                {isLocked ? 'Quero desbloquear' : isEnrolled ? 'Continuar' : 'Acessar agora'}
                <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
              </span>
              {course.total_lessons > 0 && (
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground/40">
                  {course.total_lessons} aula{course.total_lessons !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-8 lg:px-12 mb-6 sm:mb-8 animate-in fade-in slide-in-from-bottom-4 duration-600">
      {bannerLinkUrl ? (
        <a href={bannerLinkUrl} target="_blank" rel="noopener noreferrer" className="block">
          {card}
        </a>
      ) : course.id !== '__custom_banner__' ? (
        <Link to="/cursos/$courseId" params={{ courseId: course.id }} className="block">
          {card}
        </Link>
      ) : card}
    </div>
  );
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
        className={`flex gap-2.5 sm:gap-3 lg:gap-4 overflow-x-auto pb-4 px-4 sm:px-8 lg:px-12 scrollbar-hide snap-x snap-mandatory touch-pan-x ${
          !canScrollLeft && !canScrollRight ? 'lg:justify-start' : ''
        }`}
        style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
      >
        <div className="shrink-0 w-0 lg:w-[calc((100vw-1400px)/2)]" />

        {courses.map((course: any, idx: number) => (
          <div key={course.id} className="w-[150px] sm:w-[185px] md:w-[210px] lg:w-[230px] xl:w-[245px] shrink-0 snap-start">
            <CourseShelfCard
              course={course}
              index={idx}
              showProgress
              comingSoon={isComingSoon}
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
