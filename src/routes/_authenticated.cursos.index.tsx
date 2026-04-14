import { EmptyState } from "@/components/EmptyState";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CardGridSkeleton } from "@/components/LoadingSkeletons";
import { useQuery } from "@tanstack/react-query";
import { getMyCoursesData, getRecommendedCourses, getMostAccessedCourses } from "@/lib/my-courses.functions";
import { StudentLayout } from "@/components/StudentLayout";
import { FooterLinks } from "@/components/FooterLinks";
import { motion } from "framer-motion";
import { BookOpen, Search, ArrowRight, Layers, Clock, PlayCircle, Sparkles, TrendingUp, CheckCircle2, Play, Heart } from "lucide-react";
import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { getMyProfile } from "@/lib/profile.functions";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/_authenticated/cursos/")({
  component: MeusCoursosPage,
});

function MeusCoursosPage() {
  const { user } = useAuth();

  const { data: profileData } = useProfileQuery({
    queryKey: ["my-profile"],
    queryFn: () => getMyProfile(),
    staleTime: 60_000,
  });

  const { data, isLoading } = useQuery({
    queryKey: ["my-courses"],
    queryFn: () => getMyCoursesData(),
    staleTime: 5_000,
    refetchOnWindowFocus: true,
  });

  const { data: recData } = useQuery({
    queryKey: ["recommended-courses"],
    queryFn: () => getRecommendedCourses(),
    staleTime: 30_000,
  });

  const { data: trendData } = useQuery({
    queryKey: ["most-accessed-courses"],
    queryFn: () => getMostAccessedCourses(),
    staleTime: 60_000,
  });

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const displayName = profileData?.profile?.display_name || user?.email?.split("@")[0] || "aluno";
  const firstName = displayName.split(" ")[0];
  const courses = data?.courses || [];
  const stats = data?.stats || { total: 0, inProgress: 0, completed: 0 };

  // "Continue de onde parou" — recently accessed, in progress, max 5
  const continueItems = useMemo(() => {
    return courses
      .filter((c: any) => c.last_accessed_at && c.progress_pct > 0 && c.progress_pct < 100)
      .sort((a: any, b: any) => new Date(b.last_accessed_at).getTime() - new Date(a.last_accessed_at).getTime())
      .slice(0, 5);
  }, [courses]);

  const continueIds = new Set(continueItems.map((c: any) => c.id));
  const recommendations = (recData?.recommendations || []).filter((c: any) => !continueIds.has(c.id));
  const trending = trendData?.ranked || [];

  // Hero banner: first in-progress course, or first recommended, or first trending
  const heroCourse = useMemo(() => {
    if (continueItems.length > 0) return { ...continueItems[0], _heroType: "continue" as const };
    if (recommendations.length > 0) return { ...recommendations[0], _heroType: "recommended" as const };
    if (trending.length > 0) return { ...trending[0], _heroType: "trending" as const };
    if (courses.length > 0) return { ...courses[0], _heroType: "course" as const };
    return null;
  }, [continueItems, recommendations, trending, courses]);

  const filtered = courses.filter((c: any) => {
    const matchSearch = !search || c.title?.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === "all" ||
      (filter === "in_progress" && c.progress_pct > 0 && c.progress_pct < 100) ||
      (filter === "completed" && c.progress_pct >= 100) ||
      (filter === "not_started" && c.progress_pct === 0);
    return matchSearch && matchFilter;
  });

  return (
    <StudentLayout>
    <div className="min-h-screen bg-background flex flex-col">

      <main className="flex-1 w-full pb-28">
        <div className="mx-auto w-full max-w-[1100px] px-4 sm:px-8 lg:px-12 pt-8 sm:pt-12">
          {/* Personalized Greeting */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="mb-6"
          >
            <div className="flex items-start gap-1.5 mb-1">
              <Heart className="h-4 w-4 text-gold/50 mt-1 flex-shrink-0" />
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground/90 tracking-tight">
                Olá, {firstName}.
              </h1>
            </div>
            <p className="text-[13px] sm:text-sm text-muted-foreground/50 mt-1 ml-[22px] italic leading-relaxed max-w-md">
              Que sua jornada hoje seja leve, profunda e cheia de paz.
            </p>
          </motion.div>

          {/* Hero Banner */}
          {!isLoading && heroCourse && (heroCourse.banner_image_url || heroCourse.cover_image_url) && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.08 }}
              className="mb-8"
            >
              <Link
                to="/cursos/$courseId"
                params={{ courseId: heroCourse.id }}
                className="group relative block rounded-2xl overflow-hidden"
              >
                {/* Background image */}
                <div className="relative aspect-[21/9] sm:aspect-[3/1] overflow-hidden">
                  <img
                    src={heroCourse.banner_image_url || heroCourse.cover_image_url}
                    alt={heroCourse.title}
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                  />
                  {/* Cinematic gradient */}
                  <div className="absolute inset-0 bg-gradient-to-r from-background via-background/70 to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />

                  {/* Subtle glow border */}
                  <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/[0.06] group-hover:ring-gold/15 transition-all duration-500" />
                </div>

                {/* Content overlay */}
                <div className="absolute inset-0 flex flex-col justify-end p-5 sm:p-8">
                  {/* Badge */}
                  <div className="mb-2 sm:mb-3">
                    {heroCourse._heroType === "continue" ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-gold/15 backdrop-blur-sm px-3 py-1 border border-gold/15 text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.2em] text-gold/80">
                        <PlayCircle className="h-3 w-3" />
                        Continue de onde parou
                      </span>
                    ) : heroCourse._heroType === "recommended" ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 backdrop-blur-sm px-3 py-1 border border-primary/15 text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.2em] text-primary/80">
                        <Sparkles className="h-3 w-3" />
                        Recomendado para você
                      </span>
                    ) : heroCourse._heroType === "trending" ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-gold/15 backdrop-blur-sm px-3 py-1 border border-gold/15 text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.2em] text-gold/80">
                        <TrendingUp className="h-3 w-3" />
                        Em destaque
                      </span>
                    ) : null}
                  </div>

                  {/* Title */}
                  <h2 className="font-display text-xl sm:text-2xl md:text-3xl font-bold text-foreground/95 leading-tight max-w-lg drop-shadow-lg group-hover:text-gold transition-colors duration-500">
                    {heroCourse.title}
                  </h2>

                  {/* Description */}
                  {heroCourse.short_description && (
                    <p className="mt-1.5 sm:mt-2 text-[12px] sm:text-sm text-muted-foreground/60 max-w-md line-clamp-2 leading-relaxed">
                      {heroCourse.short_description}
                    </p>
                  )}

                  {/* Progress or CTA */}
                  <div className="mt-3 sm:mt-4 flex items-center gap-4">
                    {heroCourse._heroType === "continue" && heroCourse.progress_pct > 0 ? (
                      <>
                        <div className="flex items-center gap-3 flex-1 max-w-[200px]">
                          <Progress value={heroCourse.progress_pct} className="h-1.5 flex-1 bg-white/[0.08]" />
                          <span className="text-[11px] font-bold text-gold/70 tabular-nums">{heroCourse.progress_pct}%</span>
                        </div>
                        <span className="inline-flex items-center gap-1.5 rounded-xl bg-gold/20 backdrop-blur-sm px-4 py-2 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-gold/90 border border-gold/15 group-hover:bg-gold/30 transition-all duration-300">
                          <Play className="h-3 w-3 fill-current" />
                          Continuar
                        </span>
                      </>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-xl bg-gold/20 backdrop-blur-sm px-4 py-2 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-gold/90 border border-gold/15 group-hover:bg-gold/30 transition-all duration-300">
                        Ver detalhes
                        <ArrowRight className="h-3 w-3" />
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            </motion.div>
          )}

          {/* Search bar */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mb-8"
          >
            <div className="relative max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar entre seus cursos..."
                className="pl-10 h-11 bg-card/15 border-border/20 rounded-xl text-sm placeholder:text-muted-foreground/30 focus:border-gold/30 focus:ring-gold/10"
              />
            </div>
          </motion.div>

          {/* Stat Cards */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-3 gap-3 sm:gap-4 mb-10"
          >
            <div className="rounded-xl border border-border/20 bg-card/8 p-4 sm:p-5 text-center">
              <p className="text-[10px] sm:text-xs text-muted-foreground/40 mb-1 uppercase tracking-wider">Cursos</p>
              <p className="font-display text-2xl sm:text-3xl font-bold text-gold">
                {isLoading ? "—" : stats.total}
              </p>
            </div>
            <div className="rounded-xl border border-border/20 bg-card/8 p-4 sm:p-5 text-center">
              <p className="text-[10px] sm:text-xs text-muted-foreground/40 mb-1 uppercase tracking-wider">Em andamento</p>
              <p className="font-display text-2xl sm:text-3xl font-bold text-gold">
                {isLoading ? "—" : stats.inProgress}
              </p>
            </div>
            <div className="rounded-xl border border-border/20 bg-card/8 p-4 sm:p-5 text-center">
              <p className="text-[10px] sm:text-xs text-muted-foreground/40 mb-1 uppercase tracking-wider">Concluídos</p>
              <p className="font-display text-2xl sm:text-3xl font-bold text-gold">
                {isLoading ? "—" : stats.completed}
              </p>
            </div>
          </motion.div>
          {/* Continue de onde parou */}
          {!isLoading && continueItems.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.12 }}
              className="mb-10"
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gold/[0.06] border border-gold/8">
                  <PlayCircle className="h-4 w-4 text-primary/70" />
                </div>
                <div>
                  <h2 className="font-display text-lg font-bold text-foreground/80 tracking-tight">
                    Continue sua caminhada
                  </h2>
                  <p className="text-[11px] text-muted-foreground/40 mt-0.5 italic">
                    Retome de onde você parou, no seu ritmo
                  </p>
                </div>
              </div>

              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1">
                {continueItems.map((course: any, idx: number) => (
                  <motion.div
                    key={`continue-${course.id}`}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.06 * idx }}
                    className="flex-shrink-0 w-[280px] sm:w-[300px]"
                  >
                    <Link
                      to="/cursos/$courseId"
                      params={{ courseId: course.id }}
                      className="group flex gap-4 rounded-xl border border-border/20 bg-card/10 p-3 transition-all duration-500 hover:border-gold/25 hover:bg-card/20 hover:shadow-lg hover:shadow-gold/5"
                    >
                      {/* Thumbnail */}
                      <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                        {course.cover_image_url ? (
                          <img
                            src={course.cover_image_url}
                            alt={course.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                        ) : (
                          <div className="w-full h-full bg-muted/15 flex items-center justify-center">
                            <BookOpen className="h-6 w-6 text-muted-foreground/30" />
                          </div>
                        )}
                        {/* Progress overlay */}
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/40">
                          <div
                            className="h-full bg-gold rounded-r-full transition-all"
                            style={{ width: `${course.progress_pct}%` }}
                          />
                        </div>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <h3 className="text-sm font-bold text-foreground/80 line-clamp-2 leading-snug group-hover:text-gold transition-colors duration-300">
                          {course.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-1.5">
                          <Progress value={course.progress_pct} className="h-1 flex-1 bg-muted/10" />
                          <span className="text-[10px] font-bold text-gold/70 tabular-nums">
                            {course.progress_pct}%
                          </span>
                        </div>
                        <p className="text-[10px] text-muted-foreground/40 mt-1">
                          {course.completed_lessons}/{course.lesson_count} aulas
                        </p>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Recomendado para você */}
          {!isLoading && recommendations.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.18 }}
              className="mb-10"
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gold/[0.06] border border-gold/8">
                  <Sparkles className="h-4 w-4 text-primary/70" />
                </div>
                <div>
                  <h2 className="font-display text-lg font-bold text-foreground/80 tracking-tight">
                    Recomendado para você
                  </h2>
                  <p className="text-[11px] text-muted-foreground/40 mt-0.5 italic">
                    Cursos selecionados com base no seu perfil
                  </p>
                </div>
              </div>

              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1">
                {recommendations.slice(0, 8).map((course: any, idx: number) => (
                  <motion.div
                    key={`rec-${course.id}`}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.06 * idx }}
                    className="flex-shrink-0 w-[220px] sm:w-[240px]"
                  >
                    <Link
                      to="/cursos/$courseId"
                      params={{ courseId: course.id }}
                      className="group block rounded-xl border border-border/20 bg-card/10 overflow-hidden transition-all duration-500 hover:border-gold/25 hover:bg-card/20 hover:shadow-lg hover:shadow-gold/5"
                    >
                      <div className="relative aspect-video overflow-hidden">
                        {course.cover_image_url ? (
                          <img
                            src={course.cover_image_url}
                            alt={course.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                        ) : (
                          <div className="w-full h-full bg-muted/15 flex items-center justify-center">
                            <BookOpen className="h-6 w-6 text-muted-foreground/30" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-60" />
                        {course.enrollment_count > 0 && (
                          <div className="absolute top-2 right-2 rounded-full bg-background/60 backdrop-blur-sm px-2 py-0.5 border border-border/20">
                            <span className="text-[9px] font-bold text-muted-foreground/60">
                              {course.enrollment_count} alunos
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="p-3">
                        <h3 className="text-sm font-bold text-foreground/80 line-clamp-2 leading-snug group-hover:text-gold transition-colors duration-300">
                          {course.title}
                        </h3>
                        {course.short_description && (
                          <p className="text-[10px] text-muted-foreground/40 mt-1 line-clamp-1">
                            {course.short_description}
                          </p>
                        )}
                        <div className="mt-2 flex items-center text-[10px] font-bold text-gold/60 uppercase tracking-wider">
                          Conhecer <ArrowRight className="h-3 w-3 ml-1" />
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Mais acessados */}
          {!isLoading && trending.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.22 }}
              className="mb-10"
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gold/[0.06] border border-gold/8">
                  <TrendingUp className="h-4 w-4 text-primary/70" />
                </div>
                <div>
                  <h2 className="font-display text-lg font-bold text-foreground/80 tracking-tight">
                    Mais acessados
                  </h2>
                  <p className="text-[11px] text-muted-foreground/40 mt-0.5 italic">
                    Os cursos mais populares da plataforma
                  </p>
                </div>
              </div>

              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1">
                {trending.map((course: any, idx: number) => (
                  <motion.div
                    key={`trend-${course.id}`}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.06 * idx }}
                    className="flex-shrink-0 w-[220px] sm:w-[240px]"
                  >
                    <Link
                      to="/cursos/$courseId"
                      params={{ courseId: course.id }}
                      className="group block rounded-xl border border-border/20 bg-card/10 overflow-hidden transition-all duration-500 hover:border-gold/25 hover:bg-card/20 hover:shadow-lg hover:shadow-gold/5 relative"
                    >
                      {/* Rank badge */}
                      <div className={`absolute top-2 left-2 z-10 flex h-7 w-7 items-center justify-center rounded-full border text-xs font-black tabular-nums ${
                        idx === 0
                          ? "bg-gold/90 border-gold text-background"
                          : idx === 1
                            ? "bg-muted/60 border-muted-foreground/20 text-foreground/70"
                            : idx === 2
                              ? "bg-amber-800/40 border-amber-700/30 text-amber-200/80"
                              : "bg-background/60 backdrop-blur-sm border-border/30 text-muted-foreground/60"
                      }`}>
                        {idx + 1}
                      </div>

                      <div className="relative aspect-video overflow-hidden">
                        {course.cover_image_url ? (
                          <img
                            src={course.cover_image_url}
                            alt={course.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                        ) : (
                          <div className="w-full h-full bg-muted/15 flex items-center justify-center">
                            <BookOpen className="h-6 w-6 text-muted-foreground/30" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-60" />
                      </div>
                      <div className="p-3">
                        <h3 className="text-sm font-bold text-foreground/80 line-clamp-2 leading-snug group-hover:text-gold transition-colors duration-300">
                          {course.title}
                        </h3>
                        <p className="text-[10px] text-muted-foreground/40 mt-1">
                          {course.access_count} {course.access_count === 1 ? "aluno" : "alunos"}
                        </p>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Section: Todos os cursos */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5 mt-2">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gold/[0.06] border border-gold/8">
                <BookOpen className="h-4 w-4 text-primary/70" />
              </div>
              <h2 className="font-display text-lg font-bold text-foreground/80 tracking-tight">
                Todos os cursos
              </h2>
            </div>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[160px] bg-card/15 border-border/20 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="in_progress">Em andamento</SelectItem>
                <SelectItem value="completed">Concluídos</SelectItem>
                <SelectItem value="not_started">Não iniciados</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Course List */}
          {isLoading ? (
            <CardGridSkeleton count={6} />
          ) : filtered.length === 0 ? (
            courses.length === 0 ? (
              <EmptyState
                icon={BookOpen}
                title="Você ainda não possui cursos"
                description="Adquira um curso na vitrine para começar sua jornada de aprendizado."
                actionLabel="Explorar Vitrine"
                actionTo="/vitrine"
                actionIcon={ArrowRight}
              />
            ) : (
              <EmptyState
                icon={Search}
                title="Nenhum curso encontrado"
                description="Tente ajustar os filtros para encontrar o que procura."
              />
            )
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((course: any, idx: number) => {
                const isCompleted = course.progress_pct >= 100;
                const isInProgress = course.progress_pct > 0 && course.progress_pct < 100;

                return (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.04 * Math.min(idx, 8) }}
                >
                  <Link
                    to="/cursos/$courseId"
                    params={{ courseId: course.id }}
                    className="group relative block rounded-2xl overflow-hidden transition-all duration-500 hover:scale-[1.03] hover:shadow-2xl hover:shadow-gold/8"
                  >
                    {/* Full-bleed cover */}
                    <div className="relative aspect-[16/10] overflow-hidden">
                      {course.cover_image_url ? (
                        <img
                          src={course.cover_image_url}
                          alt={course.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-muted/20 to-muted/5 flex items-center justify-center">
                          <BookOpen className="h-12 w-12 text-muted-foreground/20" />
                        </div>
                      )}

                      {/* Cinematic gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />

                      {/* Glow ring on hover */}
                      <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/[0.06] group-hover:ring-gold/20 transition-all duration-500" />

                      {/* Progress bar — bottom of image */}
                      {course.progress_pct > 0 && (
                        <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-white/[0.08]">
                          <div
                            className={`h-full transition-all duration-700 ${isCompleted ? "bg-emerald-400" : "bg-gold"}`}
                            style={{ width: `${course.progress_pct}%` }}
                          />
                        </div>
                      )}

                      {/* Status badge — top right */}
                      <div className="absolute top-3 right-3">
                        {isCompleted ? (
                          <div className="flex items-center gap-1 rounded-full bg-emerald-500/25 backdrop-blur-xl px-2.5 py-1 border border-emerald-400/20 shadow-lg shadow-emerald-500/10">
                            <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                            <span className="text-[10px] font-bold text-emerald-300 tracking-wide uppercase">Concluído</span>
                          </div>
                        ) : isInProgress ? (
                          <div className="flex items-center gap-1 rounded-full bg-gold/20 backdrop-blur-xl px-2.5 py-1 border border-gold/20 shadow-lg shadow-gold/10">
                            <Play className="h-3 w-3 text-gold fill-gold" />
                            <span className="text-[10px] font-bold text-gold tracking-wide uppercase">Em andamento</span>
                          </div>
                        ) : null}
                      </div>

                      {/* Content overlay — bottom */}
                      <div className="absolute bottom-0 left-0 right-0 p-4 pt-10">
                        <h3 className="font-display text-[15px] font-bold text-foreground leading-tight line-clamp-2 drop-shadow-lg group-hover:text-gold transition-colors duration-300">
                          {course.title}
                        </h3>

                        <div className="flex items-center gap-3 mt-2 text-[11px] text-muted-foreground/60">
                          <span className="flex items-center gap-1">
                            <Layers className="h-3 w-3" />
                            {course.module_count} mód.
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {course.lesson_count} aulas
                          </span>
                          {isInProgress && (
                            <>
                              <span className="text-border/30">·</span>
                              <span className="text-gold/70 font-bold tabular-nums">
                                {course.progress_pct}%
                              </span>
                            </>
                          )}
                          {isCompleted && (
                            <>
                              <span className="text-border/30">·</span>
                              <span className="text-emerald-400/70 font-bold tabular-nums">
                                100%
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Hover play icon */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gold/90 shadow-xl shadow-gold/30 backdrop-blur-sm">
                          <Play className="h-5 w-5 text-background fill-background ml-0.5" />
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <FooterLinks />
    </div>
    </StudentLayout>
  );
}
