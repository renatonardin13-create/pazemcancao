import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getStudentShelves } from "@/lib/shelves.functions";
import { AppHeader } from "@/components/AppHeader";
import { FooterLinks } from "@/components/FooterLinks";
import { motion } from "framer-motion";
import { BookOpen, Lock, ChevronRight } from "lucide-react";
import { useRef } from "react";

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

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppHeader />

      <main className="flex-1 mx-auto w-full max-w-6xl px-4 sm:px-6 py-8 pb-28">
        {/* Header */}
        <motion.div initial="hidden" animate="visible" className="mb-10">
          <motion.div variants={fadeUp} custom={0} className="flex items-center gap-3 mb-2">
            <BookOpen className="h-6 w-6 text-gold/40" />
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground/90 tracking-tight">
              Cursos
            </h1>
          </motion.div>
          <motion.p
            variants={fadeUp}
            custom={0.1}
            className="mt-2 text-[14px] text-muted-foreground/50 font-light"
          >
            Explore os cursos disponíveis para você
          </motion.p>
        </motion.div>

        {/* Loading */}
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
          <div className="space-y-10">
            {shelves.map((shelf: any, shelfIdx: number) => (
              <ShelfRow key={shelf.id} shelf={shelf} shelfIdx={shelfIdx} />
            ))}
          </div>
        )}
      </main>

      <FooterLinks />
    </div>
  );
}

function ShelfRow({ shelf, shelfIdx }: { shelf: any; shelfIdx: number }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <motion.section
      initial="hidden"
      animate="visible"
      variants={fadeUp}
      custom={0.2 + shelfIdx * 0.1}
    >
      <div className="flex items-center gap-3 mb-4">
        <h2 className="font-display text-lg font-bold text-foreground/80 tracking-tight">
          {shelf.name}
        </h2>
        <div className="flex-1 h-px bg-gradient-to-r from-border/15 to-transparent" />
        <span className="text-[10px] text-muted-foreground/25">
          {shelf.courses.length} curso{shelf.courses.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="relative -mx-4 sm:-mx-6 px-4 sm:px-6">
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory"
        >
          {shelf.courses.map((course: any) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      </div>
    </motion.section>
  );
}

function CourseCard({ course }: { course: any }) {
  const isEnrolled = course.is_enrolled;

  return (
    <Link
      to="/cursos/$courseId"
      params={{ courseId: course.id }}
      className="group relative shrink-0 w-[200px] sm:w-[220px] snap-start"
    >
      {/* Cover */}
      <div className="relative aspect-[3/4] rounded-xl overflow-hidden border border-border/10 bg-card/10 mb-3">
        {course.cover_image_url ? (
          <img
            src={course.cover_image_url}
            alt={course.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-card/20 to-card/5">
            <BookOpen className="h-10 w-10 text-muted-foreground/10" />
          </div>
        )}

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

        {/* Lock badge if not enrolled */}
        {!isEnrolled && (
          <div className="absolute top-2.5 right-2.5 flex items-center justify-center h-7 w-7 rounded-full bg-black/40 backdrop-blur-sm border border-white/10">
            <Lock className="h-3.5 w-3.5 text-white/60" />
          </div>
        )}

        {/* Bottom info on cover */}
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <p className="text-[12px] font-semibold text-white/90 leading-tight line-clamp-2 drop-shadow-md">
            {course.title}
          </p>
        </div>
      </div>

      {/* Description below */}
      {course.short_description && (
        <p className="text-[11px] text-muted-foreground/35 line-clamp-2 leading-relaxed">
          {course.short_description}
        </p>
      )}

      {/* CTA */}
      <div className="mt-2 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-gold/40 group-hover:text-gold/70 transition-colors">
        {isEnrolled ? "Continuar" : "Ver curso"}
        <ChevronRight className="h-3 w-3" />
      </div>
    </Link>
  );
}
