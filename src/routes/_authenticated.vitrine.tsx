import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getStudentShelves } from "@/lib/shelves.functions";
import { StudentLayout } from "@/components/StudentLayout";
import { FooterLinks } from "@/components/FooterLinks";
import { motion } from "framer-motion";
import { Store, Lock, Play, ArrowRight, ShoppingCart, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState, useMemo, useRef, useCallback, useEffect } from "react";

export const Route = createFileRoute("/_authenticated/vitrine")({
  component: VitrinePage,
});

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

  // Filter shelves by search term — filter courses within each shelf
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

  return (
    <StudentLayout>
      <div className="min-h-screen flex flex-col">
        <div className="flex-1 w-full pb-28">
          {/* Hero Banner */}
          {featuredCourse && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="relative w-full h-[280px] sm:h-[380px] overflow-hidden"
            >
              <img
                src={featuredCourse.banner_image_url || featuredCourse.cover_image_url}
                alt={featuredCourse.display_title || featuredCourse.title}
                className={`w-full h-full object-${featuredCourse.banner_fit || 'cover'}`}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10">
                <h2 className="font-display text-2xl sm:text-4xl font-bold text-foreground/90 tracking-tight mb-2">
                  {featuredCourse.display_title || featuredCourse.title}
                </h2>
                {(featuredCourse.display_subtitle || featuredCourse.short_description) && (
                  <p className="text-[13px] text-muted-foreground/50 mb-4 max-w-lg">
                    {featuredCourse.display_subtitle || featuredCourse.short_description}
                  </p>
                )}
                {featuredCourse.id !== '__custom_banner__' && (
                  <CourseActionButton course={featuredCourse} />
                )}
              </div>
            </motion.div>
          )}

          <div className="mx-auto w-full max-w-[1100px] px-4 sm:px-8 lg:px-12 pt-8">
            {!featuredCourse && (
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
            )}

            {/* Search bar */}
            <div className="relative max-w-sm mb-8">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/60" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar cursos..."
                className="pl-9 bg-card/20 border-border/30 text-sm h-10"
              />
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
              <div className="space-y-10">
                {filteredShelves.map((shelf: any, shelfIdx: number) => (
                  <motion.section
                    key={shelf.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: shelfIdx * 0.1 }}
                  >
                    <div className="flex items-center gap-3 mb-5">
                      <h2 className="font-display text-lg font-bold text-foreground/80 tracking-tight">
                        {shelf.name}
                      </h2>
                      <div className="flex-1 h-px bg-gradient-to-r from-border/15 to-transparent" />
                      <span className="text-xs text-muted-foreground/60">
                        {shelf.courses.length} curso{shelf.courses.length !== 1 ? "s" : ""}
                      </span>
                    </div>

                    {/* Horizontal scroll with arrows */}
                    <ShelfCarousel courses={shelf.courses} />

                    {/* Promo banner after shelf */}
                    {promoBanners
                      .filter((b: any) => b.position_after_shelf === shelfIdx + 1)
                      .map((banner: any) => (
                        <motion.div
                          key={banner.id}
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: 0.3 }}
                          className="mt-6"
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
                ))}
              </div>
            )}
          </div>
        </div>

        <FooterLinks />
      </div>
    </StudentLayout>
  );
}

/* ── Shelf Carousel with arrow navigation ── */
function ShelfCarousel({ courses }: { courses: any[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }, []);

  const scroll = useCallback((dir: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.75;
    el.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
  }, []);

  return (
    <div className="relative group/shelf -mx-4 sm:-mx-8">
      {/* Left arrow */}
      {canScrollLeft && (
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-background/90 border border-border/30 shadow-lg backdrop-blur-sm text-foreground/60 hover:text-gold hover:border-gold/30 transition-all opacity-0 group-hover/shelf:opacity-100"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
      )}

      {/* Right arrow */}
      {canScrollRight && (
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-background/90 border border-border/30 shadow-lg backdrop-blur-sm text-foreground/60 hover:text-gold hover:border-gold/30 transition-all opacity-0 group-hover/shelf:opacity-100"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      )}

      <div
        ref={scrollRef}
        onScroll={checkScroll}
        onLoad={checkScroll}
        className="flex gap-5 overflow-x-auto pb-4 px-4 sm:px-8 scrollbar-hide snap-x snap-mandatory"
        style={{ scrollbarWidth: 'none' }}
      >
        {courses.map((course: any) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>

      {/* Check scroll on mount */}
      <ScrollCheck scrollRef={scrollRef} onCheck={checkScroll} />
    </div>
  );
}

function ScrollCheck({ scrollRef, onCheck }: { scrollRef: React.RefObject<HTMLDivElement | null>; onCheck: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onCheck, 100);
    return () => clearTimeout(timer);
  }, [onCheck]);
  return null;
}

/* ── Fixed-size Course Card ── */
function CourseCard({ course }: { course: any }) {
  const isEnrolled = course.access_state === "enrolled" || course.access_state === "in_progress" || course.access_state === "completed";
  const isInProgress = course.access_state === "in_progress";
  const isCompleted = course.access_state === "completed";
  const isLocked = course.access_state === "locked";
  const hasPreview = course.access_state === "preview";
  const isAvailable = course.access_state === "available";
  const isBlocked = course.access_state === "blocked";
  const isExpired = course.access_state === "expired";
  const isDimmed = isLocked || isBlocked || isExpired;

  const handleLockedClick = () => {
    if (course.checkout_url) {
      window.open(course.checkout_url, "_blank");
    }
  };

  const cardContent = (
    <div className="group relative w-[180px] sm:w-[200px] md:w-[220px] shrink-0 snap-start">
      {/* Fixed height card */}
      <div className="relative w-full h-[270px] sm:h-[300px] md:h-[330px] rounded-2xl overflow-hidden border border-border/25 transition-all duration-500 group-hover:border-gold/30 group-hover:shadow-xl group-hover:shadow-gold/5 group-hover:scale-[1.03]">
        {/* Image */}
        {course.cover_image_url ? (
          <img
            src={course.cover_image_url}
            alt={course.title}
            className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-110 ${isDimmed ? "brightness-[0.3] saturate-[0.2]" : ""}`}
          />
        ) : (
          <div className="w-full h-full bg-muted/15 flex items-center justify-center">
            <Store className="h-10 w-10 text-muted-foreground/40" />
          </div>
        )}

        {/* Gradient overlay */}
        <div className={`absolute inset-0 ${isDimmed ? "bg-gradient-to-t from-black/95 via-black/50 to-black/20" : "bg-gradient-to-t from-background via-background/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500"}`} />

        {/* Lock overlay for locked/blocked */}
        {isDimmed && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
            <div className="w-14 h-14 rounded-full bg-black/60 backdrop-blur-lg border border-gold/25 flex items-center justify-center mb-2 shadow-lg shadow-black/30">
              <Lock className="h-6 w-6 text-gold/80" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-gold/80">
              {isBlocked ? "Bloqueado" : isExpired ? "Expirado" : "Premium"}
            </span>
          </div>
        )}

        {/* Top badges */}
        {isLocked && !isBlocked && !isExpired && (
          <div className="absolute top-2.5 right-2.5 z-20 flex items-center gap-1 rounded-full bg-gold/20 backdrop-blur-md px-2.5 py-1 border border-gold/30 shadow-lg">
            <ShoppingCart className="h-2.5 w-2.5 text-gold" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-gold">
              Adquirir
            </span>
          </div>
        )}

        {hasPreview && !isLocked && (
          <div className="absolute top-2.5 right-2.5 z-20 flex items-center gap-1 rounded-full bg-emerald-500/25 backdrop-blur-md px-2.5 py-1 border border-emerald-500/30">
            <Play className="h-2.5 w-2.5 text-emerald-400" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
              Preview
            </span>
          </div>
        )}

        {/* Progress indicator at top for enrolled */}
        {isInProgress && (
          <div className="absolute top-0 left-0 right-0 z-20 h-1 bg-gold/20">
            <div className="h-full bg-gold rounded-r-full transition-all" style={{ width: `${course.progress_pct}%` }} />
          </div>
        )}
        {isCompleted && (
          <div className="absolute top-0 left-0 right-0 z-20 h-1 bg-emerald-500" />
        )}

        {/* Bottom info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
          <h3 className={`font-display text-sm font-bold leading-snug line-clamp-2 transition-colors duration-300 ${isDimmed ? "text-foreground/50" : "text-foreground group-hover:text-gold"}`}>
            {course.title}
          </h3>

          {/* Status / CTA */}
          <div className="mt-2">
            {isCompleted ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                ✓ Concluído
              </span>
            ) : isInProgress ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-gold">
                {course.progress_pct}% · Continuar <ArrowRight className="h-2.5 w-2.5" />
              </span>
            ) : isEnrolled ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-gold group-hover:gap-2 transition-all">
                Acessar <ArrowRight className="h-2.5 w-2.5" />
              </span>
            ) : isLocked ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-gold/80">
                <ShoppingCart className="h-2.5 w-2.5" /> Comprar
              </span>
            ) : isBlocked ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-red-400/70">
                <Lock className="h-2.5 w-2.5" /> Bloqueado
              </span>
            ) : isExpired ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-orange-400/70">
                <Lock className="h-2.5 w-2.5" /> Expirado
              </span>
            ) : hasPreview ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                <Play className="h-2.5 w-2.5" /> Pré-visualizar
              </span>
            ) : isAvailable ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-gold group-hover:gap-2 transition-all">
                Ver Detalhes <ArrowRight className="h-2.5 w-2.5" />
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );

  if (isEnrolled || hasPreview || isAvailable) {
    return (
      <Link to="/cursos/$courseId" params={{ courseId: course.id }}>
        {cardContent}
      </Link>
    );
  }

  if (isLocked) {
    return (
      <button onClick={handleLockedClick} className="text-left cursor-pointer">
        {cardContent}
      </button>
    );
  }

  return cardContent;
}

function CourseActionButton({ course }: { course: any }) {
  const isEnrolled = course.access_state === "enrolled";
  const isLocked = course.access_state === "locked";

  if (isEnrolled) {
    return (
      <Link
        to="/cursos/$courseId"
        params={{ courseId: course.id }}
        className="inline-flex items-center gap-2 rounded-xl bg-gold/90 text-gold-foreground px-6 py-3 text-[12px] font-bold uppercase tracking-wider hover:bg-gold transition-colors"
      >
        Acessar Curso <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    );
  }

  if (isLocked && course.checkout_url) {
    return (
      <a
        href={course.checkout_url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 rounded-xl bg-gold/15 text-gold/70 border border-gold/20 px-6 py-3 text-[12px] font-bold uppercase tracking-wider hover:bg-gold/25 hover:text-gold/90 transition-all"
      >
        <ShoppingCart className="h-3.5 w-3.5" /> Adquirir Agora
      </a>
    );
  }

  return null;
}
