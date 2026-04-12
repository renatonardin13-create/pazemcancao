import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getStudentShelves } from "@/lib/shelves.functions";
import { AppHeader } from "@/components/AppHeader";
import { FooterLinks } from "@/components/FooterLinks";
import { motion } from "framer-motion";
import { BookOpen, Lock, ChevronRight, ChevronLeft, Play } from "lucide-react";
import { useRef, useState, useEffect, useCallback } from "react";

export const Route = createFileRoute("/_authenticated/cursos/")({
  component: CoursesVitrinePage,
});

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1], delay },
  }),
};

function CoursesVitrinePage() {
  const { data, isLoading } = useQuery({
    queryKey: ["student-shelves"],
    queryFn: () => getStudentShelves(),
    staleTime: 60_000,
  });

  const shelves = data?.shelves || [];
  const featuredCourse = shelves
    .flatMap((shelf: any) => shelf.courses || [])
    .find((course: any) => course.banner_image_url || course.cover_image_url);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppHeader />

      <main className="flex-1 w-full pb-28">
        {/* Hero Banner */}
        {featuredCourse && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2 }}
            className="relative w-full"
          >
            <Link
              to="/cursos/$courseId"
              params={{ courseId: featuredCourse.id }}
              className="group block"
            >
              <div className="relative w-full aspect-[16/7] sm:aspect-[21/8] overflow-hidden">
                {featuredCourse.banner_image_url ||
                featuredCourse.cover_image_url ? (
                  <img
                    src={
                      featuredCourse.banner_image_url ||
                      featuredCourse.cover_image_url
                    }
                    alt={featuredCourse.title}
                    className="h-full w-full object-cover transition-transform duration-[1200ms] group-hover:scale-[1.02]"
                    loading="eager"
                  />
                ) : (
                  <div className="h-full w-full bg-gradient-to-br from-card/20 to-card/5" />
                )}
                {/* Gradients */}
                <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />

                {/* Content */}
                <div className="absolute inset-0 flex items-end px-6 sm:px-12 pb-10 sm:pb-14">
                  <div className="max-w-xl">
                    <motion.p
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3, duration: 0.6 }}
                      className="mb-3 text-[9px] font-bold uppercase tracking-[0.5em] text-gold/50"
                    >
                      Em destaque
                    </motion.p>
                    <motion.h2
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4, duration: 0.8 }}
                      className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-foreground/95 leading-[1.1]"
                    >
                      {featuredCourse.title}
                    </motion.h2>
                    {featuredCourse.short_description && (
                      <motion.p
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.55, duration: 0.6 }}
                        className="mt-4 max-w-lg text-[14px] leading-[1.8] text-muted-foreground/55 font-light line-clamp-2"
                      >
                        {featuredCourse.short_description}
                      </motion.p>
                    )}
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7, duration: 0.6 }}
                      className="mt-6 flex items-center gap-3"
                    >
                      <span className="inline-flex items-center gap-2.5 rounded-xl bg-gold/15 border border-gold/15 px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.2em] text-gold/70 transition-all duration-500 group-hover:bg-gold/25 group-hover:border-gold/25">
                        <Play className="h-3.5 w-3.5 fill-current" />
                        {featuredCourse.is_enrolled
                          ? "Continuar"
                          : featuredCourse.has_preview
                            ? "Ver prévia"
                            : "Ver detalhes"}
                      </span>
                    </motion.div>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        )}

        {/* Shelves */}
        <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-8 lg:px-12 mt-6 sm:mt-8">
          {isLoading ? (
            <div className="text-center py-24">
              <div className="w-px h-12 mx-auto bg-gradient-to-b from-transparent via-gold/15 to-transparent animate-breathe mb-6" />
              <p className="text-[11px] uppercase tracking-[0.4em] text-gold/25">
                Carregando cursos...
              </p>
            </div>
          ) : shelves.length === 0 ? (
            <div className="text-center py-24">
              <BookOpen className="h-10 w-10 text-muted-foreground/15 mx-auto mb-5" />
              <p className="text-sm text-muted-foreground/40">
                Nenhum curso disponível no momento.
              </p>
            </div>
          ) : (
            <div className="space-y-10 sm:space-y-14">
              {shelves.map((shelf: any, shelfIdx: number) => (
                <ShelfRow key={shelf.id} shelf={shelf} shelfIdx={shelfIdx} />
              ))}
            </div>
          )}
        </div>
      </main>

      <FooterLinks />
    </div>
  );
}

/* ── Shelf Row with scroll arrows ── */

function ShelfRow({ shelf, shelfIdx }: { shelf: any; shelfIdx: number }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener("scroll", checkScroll, { passive: true });
    const ro = new ResizeObserver(checkScroll);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", checkScroll);
      ro.disconnect();
    };
  }, [checkScroll]);

  const scroll = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.75;
    el.scrollBy({
      left: dir === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  return (
    <motion.section
      initial="hidden"
      animate="visible"
      variants={fadeUp}
      custom={0.1 + shelfIdx * 0.08}
      className="group/shelf relative"
    >
      {/* Shelf title */}
      <div className="flex items-center gap-3 mb-4 sm:mb-5">
        <h2 className="font-display text-lg sm:text-xl font-bold text-foreground/85 tracking-tight">
          {shelf.name}
        </h2>
        <div className="flex-1 h-px bg-gradient-to-r from-border/10 to-transparent" />
      </div>

      {/* Scroll container */}
      <div className="relative -mx-4 sm:-mx-8 lg:-mx-12">
        {/* Left arrow */}
        {canScrollLeft && (
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-0 bottom-0 z-10 w-12 sm:w-16 flex items-center justify-start pl-2 bg-gradient-to-r from-background via-background/80 to-transparent opacity-0 group-hover/shelf:opacity-100 transition-opacity duration-300"
            aria-label="Rolar para a esquerda"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-card/40 border border-border/15 backdrop-blur-sm hover:bg-card/60 transition-colors">
              <ChevronLeft className="h-5 w-5 text-foreground/60" />
            </div>
          </button>
        )}

        {/* Right arrow */}
        {canScrollRight && (
          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-0 bottom-0 z-10 w-12 sm:w-16 flex items-center justify-end pr-2 bg-gradient-to-l from-background via-background/80 to-transparent opacity-0 group-hover/shelf:opacity-100 transition-opacity duration-300"
            aria-label="Rolar para a direita"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-card/40 border border-border/15 backdrop-blur-sm hover:bg-card/60 transition-colors">
              <ChevronRight className="h-5 w-5 text-foreground/60" />
            </div>
          </button>
        )}

        <div
          ref={scrollRef}
          className="flex gap-3 sm:gap-4 overflow-x-auto px-4 sm:px-8 lg:px-12 pb-2 scrollbar-hide scroll-smooth snap-x snap-mandatory"
        >
          {shelf.courses.map((course: any) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      </div>
    </motion.section>
  );
}

/* ── Course Card ── */

function CourseCard({ course }: { course: any }) {
  const isEnrolled = course.is_enrolled;
  const accessState =
    course.access_state || (isEnrolled ? "enrolled" : "locked");
  const showLock = accessState === "locked";

  return (
    <Link
      to="/cursos/$courseId"
      params={{ courseId: course.id }}
      className="group relative shrink-0 w-[180px] sm:w-[210px] lg:w-[240px] snap-start"
    >
      {/* Cover */}
      <div className="relative aspect-[2/3] rounded-xl overflow-hidden border border-border/10 bg-card/10 transition-all duration-500 group-hover:border-gold/20 group-hover:shadow-[0_8px_40px_-12px] group-hover:shadow-gold/10 group-hover:scale-[1.03] group-hover:z-10">
        {course.cover_image_url ? (
          <img
            src={course.cover_image_url}
            alt={course.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-card/30 to-card/5">
            <BookOpen className="h-10 w-10 text-muted-foreground/10" />
          </div>
        )}

        {/* Overlay - visible on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-90 transition-opacity duration-500" />

        {/* Lock badge */}
        {showLock && (
          <div className="absolute top-3 right-3 flex items-center justify-center h-7 w-7 rounded-full bg-black/50 backdrop-blur-sm border border-white/10">
            <Lock className="h-3.5 w-3.5 text-white/60" />
          </div>
        )}

        {/* Access badge */}
        {!isEnrolled && !showLock && (
          <div className="absolute top-3 right-3 rounded-full bg-card/70 backdrop-blur-sm border border-border/20 px-2.5 py-1">
            <span className="text-[8px] font-bold uppercase tracking-[0.25em] text-gold/60">
              {accessState === "preview" ? "Preview" : "Novo"}
            </span>
          </div>
        )}

        {/* Bottom content */}
        <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
          <p className="text-[13px] font-bold text-white/95 leading-tight line-clamp-2 drop-shadow-lg">
            {course.title}
          </p>
          {course.short_description && (
            <p className="mt-2 text-[11px] text-white/50 line-clamp-2 leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-75">
              {course.short_description}
            </p>
          )}
          <div className="mt-3 flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.2em] text-gold/60 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
            <Play className="h-3 w-3 fill-current" />
            {isEnrolled
              ? "Continuar"
              : accessState === "preview"
                ? "Ver prévia"
                : "Ver curso"}
          </div>
        </div>
      </div>
    </Link>
  );
}
