import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getStudentShelves } from "@/lib/shelves.functions";
import { StudentLayout } from "@/components/StudentLayout";
import { FooterLinks } from "@/components/FooterLinks";
import { CourseShelfCard } from "@/components/CourseShelfCard";
import { motion } from "framer-motion";
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

function VitrinePage() {
  const { data, isLoading } = useQuery({
    queryKey: ["student-shelves"],
    queryFn: () => getStudentShelves(),
    staleTime: 10_000,
    refetchOnWindowFocus: true,
  });

  const [searchTerm, setSearchTerm] = useState("");

  const shelves = data?.shelves || [];
  const promoBanners = data?.promoBanners || [];
  const featuredCourse = data?.featuredCourse;

  const filteredShelves = useMemo(() => {
    if (!searchTerm.trim()) return shelves;
    const term = searchTerm.toLowerCase();
    return shelves
      .map((shelf: any) => ({
        ...shelf,
        courses: shelf.courses.filter((c: any) =>
          c.title?.toLowerCase().includes(term) ||
          c.short_description?.toLowerCase().includes(term)
        ),
      }))
      .filter((shelf: any) => shelf.courses.length > 0);
  }, [shelves, searchTerm]);

  // Count admin shelves for promo banner positioning
  let adminShelfIndex = 0;

  return (
    <StudentLayout>
      <div className="min-h-screen flex flex-col bg-background">
        <div className="flex-1 w-full pb-28">
          {/* ── Netflix-style Hero Banner ── */}
          {featuredCourse && <HeroBanner course={featuredCourse} />}

          {/* ── Content area ── */}
          <div className="relative z-10 -mt-16 sm:-mt-24">
            {!featuredCourse && (
              <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-8 lg:px-12 pt-10">
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="flex items-center gap-3 mb-8"
                >
                  <Store className="h-7 w-7 text-gold" />
                  <div>
                    <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground/90 tracking-tight">
                      Vitrine
                    </h1>
                    <p className="text-[13px] text-muted-foreground/50 mt-0.5">
                      Explore nossos cursos e conteúdos
                    </p>
                  </div>
                </motion.div>
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
                    <motion.section
                      key={shelf.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: shelfIdx * 0.06 }}
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
                          <motion.div
                            key={banner.id}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            className="mx-auto w-full max-w-[1400px] px-4 sm:px-8 lg:px-12 mt-6"
                          >
                            {banner.link_url ? (
                              <a href={banner.link_url} target="_blank" rel="noopener noreferrer">
                                <img
                                  src={banner.image_url}
                                  alt={banner.title}
                                  className="w-full rounded-xl border border-border/25 hover:border-gold/20 transition-colors"
                                />
                              </a>
                            ) : (
                              <img
                                src={banner.image_url}
                                alt={banner.title}
                                className="w-full rounded-xl border border-border/25"
                              />
                            )}
                          </motion.div>
                        ))}
                    </motion.section>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <FooterLinks />
      </div>
    </StudentLayout>
  );
}

/* ── Netflix Premium Hero Banner ── */
function HeroBanner({ course }: { course: any }) {
  const bannerLinkUrl = course.banner_link_url || course.sales_page_url || course.checkout_url;
  const imageUrl = course.banner_image_url || course.cover_image_url;
  const isLocked = ['locked', 'blocked', 'expired'].includes(course.access_state);
  const isEnrolled = ['enrolled', 'in_progress', 'completed'].includes(course.access_state);

  const content = (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.2 }}
      className={`relative w-full h-[60vh] sm:h-[70vh] lg:h-[75vh] min-h-[360px] max-h-[720px] overflow-hidden ${bannerLinkUrl ? 'cursor-pointer' : ''}`}
    >
      {/* Background image with Ken Burns */}
      {imageUrl && (
        <motion.img
          src={imageUrl}
          alt={course.display_title || course.title}
          initial={{ scale: 1.05 }}
          animate={{ scale: 1 }}
          transition={{ duration: 8, ease: 'easeOut' }}
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
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-4"
            >
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-gold/20 border border-gold/30 text-gold text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] backdrop-blur-sm">
                <Sparkles className="h-3 w-3" />
                {isEnrolled ? 'Seu destaque' : isLocked ? 'Destaque Premium' : 'Em destaque'}
              </span>
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.35 }}
              className="font-display text-3xl sm:text-5xl lg:text-[3.5rem] xl:text-6xl font-black text-foreground tracking-tight mb-3 sm:mb-4 max-w-2xl leading-[1.08] drop-shadow-[0_4px_20px_rgba(0,0,0,0.7)]"
            >
              {course.display_title || course.title}
            </motion.h1>

            {/* Subtitle */}
            {(course.display_subtitle || course.short_description) && (
              <motion.p
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="text-sm sm:text-base lg:text-lg text-foreground/50 mb-6 sm:mb-8 max-w-xl leading-relaxed line-clamp-3"
              >
                {course.display_subtitle || course.short_description}
              </motion.p>
            )}

            {/* CTA */}
            {course.id !== '__custom_banner__' && (
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.65 }}
                className="flex flex-wrap items-center gap-3 sm:gap-4"
              >
                <HeroCTA course={course} />
              </motion.div>
            )}

            {/* Meta info */}
            {course.total_lessons > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.9 }}
                className="mt-5 flex items-center gap-4 text-[11px] sm:text-xs text-foreground/30 uppercase tracking-wider"
              >
                <span>{course.total_lessons} aula{course.total_lessons !== 1 ? 's' : ''}</span>
                {course.progress_pct > 0 && course.progress_pct < 100 && (
                  <>
                    <span className="h-1 w-1 rounded-full bg-gold/40" />
                    <span className="text-gold/60">{course.progress_pct}% concluído</span>
                  </>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
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
      {canScrollLeft && (
        <button
          onClick={() => scroll('left')}
          aria-label="Anterior"
          className="absolute left-0 top-0 bottom-0 z-20 w-12 sm:w-16 flex items-center justify-center bg-gradient-to-r from-background/95 via-background/60 to-transparent text-foreground/50 hover:text-gold transition-colors sm:opacity-0 sm:group-hover/shelf:opacity-100"
        >
          <ChevronLeft className="h-7 w-7 sm:h-8 sm:w-8" />
        </button>
      )}

      {canScrollRight && (
        <button
          onClick={() => scroll('right')}
          aria-label="Próximo"
          className="absolute right-0 top-0 bottom-0 z-20 w-12 sm:w-16 flex items-center justify-center bg-gradient-to-l from-background/95 via-background/60 to-transparent text-foreground/50 hover:text-gold transition-colors sm:opacity-0 sm:group-hover/shelf:opacity-100"
        >
          <ChevronRight className="h-7 w-7 sm:h-8 sm:w-8" />
        </button>
      )}

      <div
        ref={scrollRef}
        onScroll={checkScroll}
        className="flex gap-3 sm:gap-4 overflow-x-auto pb-4 px-4 sm:px-8 lg:px-12 scrollbar-hide snap-x snap-mandatory touch-pan-x"
        style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
      >
        <div className="shrink-0 w-0 lg:w-[calc((100vw-1400px)/2)]" />

        {courses.map((course: any, idx: number) => (
          <div key={course.id} className="w-[185px] sm:w-[210px] md:w-[230px] lg:w-[240px] shrink-0 snap-start">
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

