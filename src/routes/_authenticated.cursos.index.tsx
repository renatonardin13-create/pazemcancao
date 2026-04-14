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
import { BookOpen, Search, ArrowRight, PlayCircle, Heart, Play, Layers } from "lucide-react";
import { useState, useMemo } from "react";
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

  // Collect all courses from shelves for search
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
    <div className="min-h-screen bg-background flex flex-col">

      <main className="flex-1 w-full pb-28">

        {/* ═══ SAUDAÇÃO + BUSCA ═══ */}
        <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-12 pt-8 sm:pt-10">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="mb-6"
          >
            <div className="flex items-start gap-1.5 mb-1">
              <Heart className="h-4 w-4 text-gold/50 mt-1 flex-shrink-0" />
              <h1 className="font-display text-xl sm:text-2xl font-bold text-foreground/90 tracking-tight">
                Olá, {firstName}.
              </h1>
            </div>
            <p className="text-[12px] sm:text-[13px] text-muted-foreground/50 mt-0.5 ml-[22px] italic leading-relaxed max-w-md">
              Que sua jornada hoje seja leve, profunda e cheia de paz.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-6"
          >
            <div className="relative max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar cursos..."
                className="pl-10 h-11 bg-card/15 border-border/20 rounded-xl text-sm placeholder:text-muted-foreground/30 focus:border-gold/30 focus:ring-gold/10"
              />
            </div>
          </motion.div>
        </div>

        {/* ═══ SEARCH RESULTS ═══ */}
        {searchResults !== null ? (
          <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-12">
            <SectionHeader title={`Resultados para "${search}"`} subtitle={`${searchResults.length} curso(s) encontrado(s)`} />
            {searchResults.length > 0 ? (
              <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-1 px-1 snap-x snap-mandatory scroll-smooth">
                {searchResults.map((course: any, idx: number) => (
                  <motion.div
                    key={`search-${course.id}`}
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.04 * Math.min(idx, 10) }}
                    className="flex-shrink-0 snap-start w-[260px] sm:w-[300px] md:w-[320px]"
                  >
                    <CourseShelfCard course={course} showProgress />
                  </motion.div>
                ))}
              </div>
            ) : (
              <EmptyState icon={Search} title="Nenhum curso encontrado" description="Tente buscar com outras palavras." />
            )}
          </div>
        ) : (
          <>
            {/* ═══ BANNER PRINCIPAL (Hero) ═══ */}
            {!isLoading && featuredCourse && (
              <HeroBanner course={featuredCourse} />
            )}

            <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-12 pt-8">

              {isLoading ? (
                <CardGridSkeleton count={6} />
              ) : (
                <>
                  {/* ═══ CONTINUE ASSISTINDO ═══ */}
                  {continueWatchingCourses.length > 0 && (
                    <ContinueWatchingShelf courses={continueWatchingCourses} />
                  )}

                  {/* ═══ PRATELEIRAS DO ADMIN ═══ */}
                  {shelves.map((shelf: any, shelfIdx: number) => (
                    <ShelfSection key={shelf.id} shelf={shelf} delay={0.15 + shelfIdx * 0.05} promoBanners={promoBanners} shelfIndex={shelfIdx} />
                  ))}

                  {/* ═══ BIBLIOTECA RESUMO ═══ */}
                  <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }} className="mb-10 rounded-2xl border border-border/20 bg-card/8 p-5 sm:p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gold/[0.06] border border-gold/8">
                        <Layers className="h-4 w-4 text-primary/70" />
                      </div>
                      <h2 className="font-display text-lg font-bold text-foreground/80 tracking-tight">Minha biblioteca</h2>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <StatCard label="Cursos" value={stats.total} />
                      <StatCard label="Em andamento" value={stats.inProgress} />
                      <StatCard label="Concluídos" value={stats.completed} />
                      <StatCard label="Favoritos" value={favData?.count ?? 0} icon={<Heart className="h-3 w-3" />} />
                    </div>
                  </motion.div>

                  {/* Empty state */}
                  {shelves.length === 0 && (
                    <EmptyState icon={BookOpen} title="Nenhum conteúdo disponível" description="Em breve novos cursos serão adicionados." />
                  )}
                </>
              )}
            </div>
          </>
        )}
      </main>

      <FooterLinks />
    </div>
    </StudentLayout>
  );
}

/* ══════════════════════════════════════════════════════════════
   SHELF COMPONENTS
   ══════════════════════════════════════════════════════════════ */

function ContinueWatchingShelf({ courses }: { courses: any[] }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.05 }}
      className="mb-12"
    >
      <div className="flex items-end justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gold/[0.08] border border-gold/10">
            <PlayCircle className="h-4 w-4 text-gold" />
          </div>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground/90 tracking-tight">
            Continue assistindo
          </h2>
        </div>
      </div>

      <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-1 px-1 snap-x snap-mandatory scroll-smooth">
        {courses.map((course: any, idx: number) => (
          <motion.div
            key={`cw-${course.id}`}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.04 * Math.min(idx, 10) }}
            className="flex-shrink-0 snap-start w-[260px] sm:w-[300px] md:w-[320px]"
          >
            <ContinueWatchingCard course={course} />
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}

function ContinueWatchingCard({ course }: { course: any }) {
  const progress = course.progress_pct ?? 0;
  const linkTo = course.resume_lesson_id
    ? "/cursos/$courseId/aula/$lessonId"
    : "/cursos/$courseId";
  const linkParams = course.resume_lesson_id
    ? { courseId: course.id, lessonId: course.resume_lesson_id }
    : { courseId: course.id };

  return (
    <Link
      to={linkTo as any}
      params={linkParams as any}
      className="group relative block rounded-xl overflow-hidden cursor-pointer"
    >
      <div className="relative aspect-video overflow-hidden bg-card/10">
        {course.cover_image_url ? (
          <img
            src={course.cover_image_url}
            alt={course.title}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-card/30 via-muted/10 to-background flex items-center justify-center">
            <BookOpen className="h-8 w-8 text-muted-foreground/15" />
          </div>
        )}

        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-all duration-500" />
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/70 to-transparent" />

        {/* Play button */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-400 z-10">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gold/90 shadow-2xl shadow-gold/40 backdrop-blur-sm scale-75 group-hover:scale-100 transition-transform duration-500 ease-out">
            <Play className="h-6 w-6 text-gold-foreground fill-gold-foreground ml-0.5" />
          </div>
        </div>

        {/* Title + progress info */}
        <div className="absolute inset-x-0 bottom-0 p-4 z-10 translate-y-2 group-hover:translate-y-0 transition-transform duration-500 ease-out">
          <h3 className="text-sm font-bold text-white line-clamp-2 leading-snug drop-shadow-lg">
            {course.title}
          </h3>
          <p className="text-[11px] text-white/50 mt-1">
            {course.completed_lessons}/{course.total_lessons} aulas • {progress}%
          </p>
        </div>

        {/* Progress bar */}
        <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-white/10 z-20">
          <div
            className="h-full rounded-r-full bg-gold transition-all duration-700"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      </div>

      <div className="absolute inset-0 rounded-xl border border-transparent group-hover:border-gold/30 transition-colors duration-500 pointer-events-none z-20" />
    </Link>
  );
}

function ShelfSection({ shelf, delay, promoBanners, shelfIndex }: {
  shelf: any;
  delay: number;
  promoBanners: any[];
  shelfIndex: number;
}) {
  const bannersAfter = promoBanners.filter((b: any) => b.position_after_shelf === shelfIndex + 1);

  return (
    <>
      <motion.section
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay }}
        className="mb-12"
      >
        {/* Shelf header */}
        <div className="flex items-end justify-between mb-5">
          <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground/90 tracking-tight">
            {shelf.name}
          </h2>
          {(shelf.courses?.length ?? 0) > 5 && (
            <span className="text-[11px] font-bold text-gold/50 uppercase tracking-widest hover:text-gold/80 transition-colors duration-300 cursor-pointer flex items-center gap-1">
              Ver todos <ArrowRight className="h-3 w-3" />
            </span>
          )}
        </div>

        {/* Horizontal scroll row */}
        <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-1 px-1 snap-x snap-mandatory scroll-smooth">
          {(shelf.courses || []).map((course: any, idx: number) => (
            <motion.div
              key={`${shelf.id}-${course.id}`}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.04 * Math.min(idx, 10) }}
              className="flex-shrink-0 snap-start w-[260px] sm:w-[300px] md:w-[320px]"
            >
              <CourseShelfCard
                course={course}
                showProgress={course.access_state === 'in_progress' || course.access_state === 'enrolled'}
              />
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Promo banners after shelf */}
      {bannersAfter.map((banner: any) => (
        <motion.div
          key={banner.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: delay + 0.1 }}
          className="mb-12"
        >
          {banner.link_url ? (
            <a href={banner.link_url} target="_blank" rel="noopener noreferrer" className="block rounded-2xl overflow-hidden border border-border/15 hover:border-gold/20 transition-all duration-300">
              <img src={banner.image_url} alt={banner.title} className="w-full h-auto object-cover" />
            </a>
          ) : (
            <div className="rounded-2xl overflow-hidden border border-border/15">
              <img src={banner.image_url} alt={banner.title} className="w-full h-auto object-cover" />
            </div>
          )}
        </motion.div>
      ))}
    </>
  );
}

function HeroBanner({ course }: { course: any }) {
  const bannerImg = course.banner_image_url || course.cover_image_url;
  const isCustomBanner = course.id === '__custom_banner__';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className="relative w-full h-[280px] sm:h-[360px] md:h-[420px] overflow-hidden"
    >
      {bannerImg ? (
        <img
          src={bannerImg}
          alt={course.display_title || course.title || ''}
          className="w-full h-full object-cover scale-105"
          style={{ objectFit: (course.banner_fit || 'cover') as any }}
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-card/30 via-background to-background" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/40 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-8 sm:p-12 md:px-16 lg:px-20">
        <div className="max-w-[1400px] mx-auto">
          <motion.h2 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }} className="font-display text-2xl sm:text-4xl md:text-5xl font-bold text-foreground tracking-tight mb-3 max-w-xl leading-[1.1] drop-shadow-lg">
            {course.display_title || course.title}
          </motion.h2>
          {(course.display_subtitle || course.short_description) && (
            <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.45 }} className="text-sm text-muted-foreground/60 mb-6 max-w-lg line-clamp-2 leading-relaxed">
              {course.display_subtitle || course.short_description}
            </motion.p>
          )}
          {course.progress_pct > 0 && course.progress_pct < 100 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.5 }} className="flex items-center gap-3 mb-5 max-w-xs">
              <Progress value={course.progress_pct} className="h-1.5 flex-1 bg-muted/15" />
              <span className="text-[11px] font-bold text-gold/80 tabular-nums">{course.progress_pct}%</span>
            </motion.div>
          )}
          {!isCustomBanner && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.55 }}>
              <Link
                to="/cursos/$courseId"
                params={{ courseId: course.id }}
                className="inline-flex items-center gap-2.5 rounded-xl bg-gold text-background px-7 py-3.5 text-[13px] font-bold uppercase tracking-wider hover:bg-gold/90 transition-all duration-300 hover:shadow-xl hover:shadow-gold/25"
              >
                <Play className="h-4 w-4 fill-current" />
                {course.progress_pct > 0 ? 'Continuar' : 'Assistir'}
              </Link>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function SectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gold/[0.06] border border-gold/8">
        <BookOpen className="h-4 w-4 text-primary/70" />
      </div>
      <div>
        <h2 className="font-display text-lg font-bold text-foreground/80 tracking-tight">{title}</h2>
        {subtitle && <p className="text-[11px] text-muted-foreground/40 mt-0.5 italic">{subtitle}</p>}
      </div>
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: number | string; icon?: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border/15 bg-background/30 p-4 text-center">
      <p className="font-display text-2xl font-bold text-gold">{value}</p>
      <p className="text-[10px] text-muted-foreground/45 mt-1 uppercase tracking-wider flex items-center justify-center gap-1">
        {icon} {label}
      </p>
    </div>
  );
}
