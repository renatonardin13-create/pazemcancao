import { EmptyState } from "@/components/EmptyState";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CardGridSkeleton } from "@/components/LoadingSkeletons";
import { useQuery } from "@tanstack/react-query";
import { getMyCoursesData, getRecommendedCourses, getMostAccessedCourses, getFeaturedContent } from "@/lib/my-courses.functions";
import { getNewCourses } from "@/lib/new-content.functions";
import { getUserFavoritesCount } from "@/lib/user-library.functions";
import { StudentLayout } from "@/components/StudentLayout";
import { FooterLinks } from "@/components/FooterLinks";
import { CourseShelfCard } from "@/components/CourseShelfCard";
import { motion } from "framer-motion";
import { BookOpen, Search, ArrowRight, Layers, Clock, PlayCircle, Sparkles, TrendingUp, CheckCircle2, Play, Heart, Star, Zap } from "lucide-react";
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

  const { data: profileData } = useQuery({
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

  const { data: featuredData } = useQuery({
    queryKey: ["featured-content"],
    queryFn: () => getFeaturedContent(),
    staleTime: 60_000,
  });

  const { data: newData } = useQuery({
    queryKey: ["new-courses"],
    queryFn: () => getNewCourses(),
    staleTime: 60_000,
  });

  const { data: favData } = useQuery({
    queryKey: ["user-favorites-count"],
    queryFn: () => getUserFavoritesCount(),
    staleTime: 30_000,
  });

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const displayName = profileData?.profile?.display_name || user?.email?.split("@")[0] || "aluno";
  const firstName = displayName.split(" ")[0];
  const courses = data?.courses || [];
  const stats = data?.stats || { total: 0, inProgress: 0, completed: 0 };

  const continueItems = useMemo(() => {
    return courses
      .filter((c: any) => c.last_accessed_at && c.progress_pct > 0 && c.progress_pct < 100)
      .sort((a: any, b: any) => new Date(b.last_accessed_at).getTime() - new Date(a.last_accessed_at).getTime())
      .slice(0, 5);
  }, [courses]);

  const continueIds = new Set(continueItems.map((c: any) => c.id));
  const recommendations = (recData?.recommendations || []).filter((c: any) => !continueIds.has(c.id));
  const trending = trendData?.ranked || [];
  const newCourses = (newData?.courses || []).filter((c: any) => !continueIds.has(c.id));

  const heroCourse = useMemo(() => {
    const inProgressCourse = continueItems[0];
    if (inProgressCourse) return { ...inProgressCourse, _heroType: 'continue' as const };
    const rec = recommendations[0];
    if (rec) return { ...rec, _heroType: 'recommended' as const };
    const trend = trending[0];
    if (trend) return { ...trend, _heroType: 'trending' as const };
    const first = courses[0];
    if (first) return { ...first, _heroType: 'enrolled' as const };
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

        {/* ═══ 1. SAUDAÇÃO + BUSCA ═══ */}
        <div className="mx-auto w-full max-w-[1100px] px-4 sm:px-8 lg:px-12 pt-8 sm:pt-10">
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
                placeholder="Buscar entre seus cursos..."
                className="pl-10 h-11 bg-card/15 border-border/20 rounded-xl text-sm placeholder:text-muted-foreground/30 focus:border-gold/30 focus:ring-gold/10"
              />
            </div>
          </motion.div>
        </div>

        {/* ═══ 2. BANNER PRINCIPAL ═══ */}
        {!isLoading && heroCourse && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="relative w-full h-[260px] sm:h-[340px] md:h-[380px] overflow-hidden"
          >
            {(heroCourse.banner_image_url || heroCourse.cover_image_url) ? (
              <img
                src={heroCourse.banner_image_url || heroCourse.cover_image_url}
                alt={heroCourse.title}
                className="w-full h-full object-cover scale-105"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-card/30 via-background to-background" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 md:px-12 lg:px-16">
              <div className="max-w-[1100px] mx-auto">
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }} className="mb-3">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-gold/10 backdrop-blur-sm px-3 py-1 border border-gold/15 text-[10px] font-bold uppercase tracking-widest text-gold/80">
                    {heroCourse._heroType === 'continue' && <><PlayCircle className="h-3 w-3" /> Continue de onde parou</>}
                    {heroCourse._heroType === 'recommended' && <><Sparkles className="h-3 w-3" /> Recomendado para você</>}
                    {heroCourse._heroType === 'trending' && <><TrendingUp className="h-3 w-3" /> Em destaque</>}
                    {heroCourse._heroType === 'enrolled' && <><Heart className="h-3 w-3" /> Seu curso</>}
                  </span>
                </motion.div>
                <motion.h2 initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.4 }} className="font-display text-xl sm:text-3xl md:text-4xl font-bold text-foreground/95 tracking-tight mb-2 max-w-lg leading-tight drop-shadow-lg">
                  {heroCourse.title}
                </motion.h2>
                {heroCourse.short_description && (
                  <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.5 }} className="text-[13px] text-muted-foreground/60 mb-5 max-w-md line-clamp-2 leading-relaxed">
                    {heroCourse.short_description}
                  </motion.p>
                )}
                {heroCourse._heroType === 'continue' && heroCourse.progress_pct > 0 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.55 }} className="flex items-center gap-3 mb-4 max-w-xs">
                    <Progress value={heroCourse.progress_pct} className="h-1.5 flex-1 bg-muted/15" />
                    <span className="text-[11px] font-bold text-gold/80 tabular-nums">{heroCourse.progress_pct}%</span>
                  </motion.div>
                )}
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.6 }}>
                  <Link
                    to="/cursos/$courseId"
                    params={{ courseId: heroCourse.id }}
                    className="inline-flex items-center gap-2 rounded-xl bg-gold/90 text-background px-6 py-3 text-[12px] font-bold uppercase tracking-wider hover:bg-gold transition-all duration-300 hover:shadow-lg hover:shadow-gold/20"
                  >
                    {heroCourse._heroType === 'continue' ? 'Continuar agora' : 'Ver detalhes'}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}

        <div className="mx-auto w-full max-w-[1100px] px-4 sm:px-8 lg:px-12 pt-8">

          {/* ═══ 3. CONTINUE DE ONDE PAROU ═══ */}
          {!isLoading && continueItems.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.12 }} className="mb-10">
              <SectionHeader icon={PlayCircle} title="Continue sua caminhada" subtitle="Retome de onde você parou, no seu ritmo" />
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1">
                {continueItems.map((course: any, idx: number) => (
                  <motion.div key={`continue-${course.id}`} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.06 * idx }} className="flex-shrink-0 w-[280px] sm:w-[300px]">
                    <Link
                      to="/cursos/$courseId"
                      params={{ courseId: course.id }}
                      className="group flex gap-4 rounded-xl border border-border/20 bg-card/10 p-3 transition-all duration-500 hover:border-gold/25 hover:bg-card/20 hover:shadow-lg hover:shadow-gold/5"
                    >
                      <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                        {course.cover_image_url ? (
                          <img src={course.cover_image_url} alt={course.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                        ) : (
                          <div className="w-full h-full bg-muted/15 flex items-center justify-center"><BookOpen className="h-6 w-6 text-muted-foreground/30" /></div>
                        )}
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/40">
                          <div className="h-full bg-gold rounded-r-full transition-all" style={{ width: `${course.progress_pct}%` }} />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <h3 className="text-sm font-bold text-foreground/80 line-clamp-2 leading-snug group-hover:text-gold transition-colors duration-300">{course.title}</h3>
                        <div className="flex items-center gap-2 mt-1.5">
                          <Progress value={course.progress_pct} className="h-1 flex-1 bg-muted/10" />
                          <span className="text-[10px] font-bold text-gold/70 tabular-nums">{course.progress_pct}%</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground/40 mt-1">{course.completed_lessons}/{course.lesson_count} aulas</p>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ═══ 4. RECOMENDADO PARA VOCÊ ═══ */}
          {!isLoading && recommendations.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.18 }} className="mb-10">
              <SectionHeader icon={Sparkles} title="Recomendado para você" subtitle="Cursos selecionados com base no seu perfil" />
              <div className="flex gap-4 overflow-x-auto pb-3 scrollbar-hide -mx-1 px-1">
                {recommendations.slice(0, 8).map((course: any, idx: number) => (
                  <motion.div key={`rec-${course.id}`} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.06 * idx }} className="flex-shrink-0 w-[160px] sm:w-[180px]">
                    <CourseShelfCard
                      course={course}
                      badge={course.enrollment_count > 0 ? (
                        <span className="rounded-full bg-background/60 backdrop-blur-sm px-2 py-0.5 border border-border/20 text-[9px] font-bold text-muted-foreground/60">{course.enrollment_count} alunos</span>
                      ) : undefined}
                    />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ═══ 5. CONTEÚDOS EM DESTAQUE ═══ */}
          {!isLoading && (featuredData?.items?.length ?? 0) > 0 && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.22 }} className="mb-10">
              <SectionHeader icon={Star} title="Conteúdos em destaque" subtitle="Selecionados especialmente para sua jornada" />
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1">
                {(featuredData?.items || []).map((item: any, idx: number) => {
                  const isCourse = featuredData?.source === 'courses' || item.content_type === 'course';
                  const coverImg = item.card_cover_url || item.cover_url;
                  return (
                    <motion.div key={`feat-${item.id}`} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.06 * idx }} className="flex-shrink-0 w-[220px] sm:w-[240px]">
                      {isCourse ? (
                        <Link to="/cursos/$courseId" params={{ courseId: item.id }} className="group block rounded-xl border border-border/20 bg-card/10 overflow-hidden transition-all duration-500 hover:border-gold/25 hover:bg-card/20 hover:shadow-lg hover:shadow-gold/5">
                          <FeaturedCardInner item={item} coverImg={coverImg} />
                        </Link>
                      ) : (
                        <Link to="/conteudo/$trackId" params={{ trackId: item.id }} className="group block rounded-xl border border-border/20 bg-card/10 overflow-hidden transition-all duration-500 hover:border-gold/25 hover:bg-card/20 hover:shadow-lg hover:shadow-gold/5">
                          <FeaturedCardInner item={item} coverImg={coverImg} />
                        </Link>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* ═══ 6. MAIS ACESSADOS ═══ */}
          {!isLoading && trending.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.26 }} className="mb-10">
              <SectionHeader icon={TrendingUp} title="Mais acessados" subtitle="Os cursos mais populares da plataforma" />
              <div className="flex gap-4 overflow-x-auto pb-3 scrollbar-hide -mx-1 px-1">
                {trending.map((course: any, idx: number) => (
                  <motion.div key={`trend-${course.id}`} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.06 * idx }} className="flex-shrink-0 w-[160px] sm:w-[180px]">
                    <CourseShelfCard
                      course={course}
                      showDescription={false}
                      badge={
                        <div className={`flex h-7 w-7 items-center justify-center rounded-full border text-xs font-black tabular-nums ${
                          idx === 0 ? "bg-gold/90 border-gold text-background"
                            : idx === 1 ? "bg-muted/60 border-muted-foreground/20 text-foreground/70"
                              : idx === 2 ? "bg-amber-800/40 border-amber-700/30 text-amber-200/80"
                                : "bg-background/60 backdrop-blur-sm border-border/30 text-muted-foreground/60"
                        }`}>
                          {idx + 1}
                        </div>
                      }
                      ctaLabel={`${course.access_count} ${course.access_count === 1 ? "acesso" : "acessos"}`}
                    />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ═══ 7. NOVOS CONTEÚDOS ═══ */}
          {!isLoading && newCourses.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }} className="mb-10">
              <SectionHeader icon={Zap} title="Novos conteúdos" subtitle="Adicionados recentemente à plataforma" />
              <div className="flex gap-4 overflow-x-auto pb-3 scrollbar-hide -mx-1 px-1">
                {newCourses.slice(0, 8).map((course: any, idx: number) => (
                  <motion.div key={`new-${course.id}`} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.06 * idx }} className="flex-shrink-0 w-[160px] sm:w-[180px]">
                    <CourseShelfCard
                      course={course}
                      badge={
                        <span className="rounded-full bg-gold/20 backdrop-blur-sm px-2.5 py-0.5 border border-gold/20 text-[9px] font-bold text-gold uppercase tracking-wider">Novo</span>
                      }
                    />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ═══ 8. MINHA BIBLIOTECA ═══ */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.34 }} className="mb-10 rounded-2xl border border-border/20 bg-card/8 p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gold/[0.06] border border-gold/8">
                  <BookOpen className="h-4 w-4 text-primary/70" />
                </div>
                <h2 className="font-display text-lg font-bold text-foreground/80 tracking-tight">Minha biblioteca</h2>
              </div>
              <Link to="/cursos" search={{ filter: "all" } as any} className="inline-flex items-center gap-1.5 text-[11px] font-bold text-gold/70 uppercase tracking-wider hover:text-gold transition-colors">
                Ver tudo <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-xl border border-border/15 bg-background/30 p-4 text-center">
                <p className="font-display text-2xl font-bold text-gold">{isLoading ? "—" : stats.total}</p>
                <p className="text-[10px] text-muted-foreground/45 mt-1 uppercase tracking-wider">Cursos</p>
              </div>
              <div className="rounded-xl border border-border/15 bg-background/30 p-4 text-center">
                <p className="font-display text-2xl font-bold text-gold">{isLoading ? "—" : stats.inProgress}</p>
                <p className="text-[10px] text-muted-foreground/45 mt-1 uppercase tracking-wider">Em andamento</p>
              </div>
              <div className="rounded-xl border border-border/15 bg-background/30 p-4 text-center">
                <p className="font-display text-2xl font-bold text-gold">{isLoading ? "—" : stats.completed}</p>
                <p className="text-[10px] text-muted-foreground/45 mt-1 uppercase tracking-wider">Concluídos</p>
              </div>
              <div className="rounded-xl border border-border/15 bg-background/30 p-4 text-center">
                <p className="font-display text-2xl font-bold text-gold">{favData?.count ?? "—"}</p>
                <p className="text-[10px] text-muted-foreground/45 mt-1 uppercase tracking-wider flex items-center justify-center gap-1">
                  <Heart className="h-3 w-3" /> Favoritos
                </p>
              </div>
            </div>
          </motion.div>

          {/* ═══ TODOS OS CURSOS ═══ */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5 mt-2">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gold/[0.06] border border-gold/8">
                <BookOpen className="h-4 w-4 text-primary/70" />
              </div>
              <h2 className="font-display text-lg font-bold text-foreground/80 tracking-tight">Todos os cursos</h2>
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

          {isLoading ? (
            <CardGridSkeleton count={6} />
          ) : filtered.length === 0 ? (
            courses.length === 0 ? (
              <EmptyState icon={BookOpen} title="Você ainda não possui cursos" description="Adquira um curso na vitrine para começar sua jornada de aprendizado." actionLabel="Explorar Vitrine" actionTo="/vitrine" actionIcon={ArrowRight} />
            ) : (
              <EmptyState icon={Search} title="Nenhum curso encontrado" description="Tente ajustar os filtros para encontrar o que procura." />
            )
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5">
              {filtered.map((course: any, idx: number) => {
                const isCompleted = course.progress_pct >= 100;
                const isInProgress = course.progress_pct > 0 && course.progress_pct < 100;
                return (
                  <motion.div key={course.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.04 * Math.min(idx, 10) }}>
                    <Link
                      to="/cursos/$courseId"
                      params={{ courseId: course.id }}
                      className="group relative block rounded-2xl overflow-hidden transition-all duration-500 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-gold/[0.08]"
                    >
                      <div className="absolute inset-0 rounded-2xl border border-border/10 group-hover:border-gold/20 transition-colors duration-500 z-10 pointer-events-none" />
                      <div className="relative aspect-[3/4] overflow-hidden bg-card/8">
                        {course.cover_image_url ? (
                          <img src={course.cover_image_url} alt={course.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-card/15 via-muted/5 to-background flex items-center justify-center">
                            <BookOpen className="h-10 w-10 text-muted-foreground/15" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent opacity-90" />
                        <div className="absolute top-2.5 right-2.5 z-10">
                          {isCompleted ? (
                            <div className="flex items-center gap-1 rounded-full bg-player-completed/20 backdrop-blur-xl px-2.5 py-1 border border-player-completed/15">
                              <CheckCircle2 className="h-3 w-3 text-player-completed" />
                              <span className="text-[9px] font-bold text-player-completed tracking-wide uppercase">Concluído</span>
                            </div>
                          ) : isInProgress ? (
                            <div className="flex items-center gap-1 rounded-full bg-gold/15 backdrop-blur-xl px-2.5 py-1 border border-gold/15">
                              <Play className="h-3 w-3 text-gold fill-gold" />
                              <span className="text-[9px] font-bold text-gold tracking-wide uppercase">{course.progress_pct}%</span>
                            </div>
                          ) : null}
                        </div>
                        {course.progress_pct > 0 && (
                          <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-white/[0.06] z-10">
                            <div className={`h-full rounded-r-full transition-all duration-700 ${isCompleted ? "bg-player-completed" : "bg-gold"}`} style={{ width: `${course.progress_pct}%` }} />
                          </div>
                        )}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-10">
                          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gold/90 shadow-xl shadow-gold/25 scale-90 group-hover:scale-100 transition-transform duration-400">
                            <Play className="h-4 w-4 text-gold-foreground fill-gold-foreground ml-0.5" />
                          </div>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 p-3.5 z-10">
                          <h3 className="text-[13px] font-bold text-foreground/90 leading-snug line-clamp-2 drop-shadow-sm group-hover:text-gold transition-colors duration-300">
                            {course.title}
                          </h3>
                          <div className="flex items-center gap-2.5 mt-1.5 text-[9px] text-muted-foreground/40">
                            {course.module_count > 0 && (
                              <span className="flex items-center gap-1"><Layers className="h-2.5 w-2.5" />{course.module_count} mód.</span>
                            )}
                            <span className="flex items-center gap-1"><Clock className="h-2.5 w-2.5" />{course.lesson_count} aulas</span>
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

/* ── Helpers ── */

function SectionHeader({ icon: Icon, title, subtitle }: { icon: any; title: string; subtitle: string }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gold/[0.06] border border-gold/8">
        <Icon className="h-4 w-4 text-primary/70" />
      </div>
      <div>
        <h2 className="font-display text-lg font-bold text-foreground/80 tracking-tight">{title}</h2>
        <p className="text-[11px] text-muted-foreground/40 mt-0.5 italic">{subtitle}</p>
      </div>
    </div>
  );
}

function FeaturedCardInner({ item, coverImg }: { item: any; coverImg: string | null }) {
  return (
    <>
      <div className="relative aspect-video overflow-hidden">
        {coverImg ? (
          <img src={coverImg} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
        ) : (
          <div className="w-full h-full bg-muted/15 flex items-center justify-center"><Star className="h-6 w-6 text-muted-foreground/30" /></div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-60" />
        {item.badge_text && (
          <div className="absolute top-2 right-2 rounded-full bg-gold/20 backdrop-blur-sm px-2 py-0.5 border border-gold/20">
            <span className="text-[9px] font-bold text-gold uppercase tracking-wider">{item.badge_text}</span>
          </div>
        )}
        {item.is_free && (
          <div className="absolute top-2 left-2 rounded-full bg-player-completed/20 backdrop-blur-sm px-2 py-0.5 border border-player-completed/15">
            <span className="text-[9px] font-bold text-player-completed uppercase tracking-wider">Gratuito</span>
          </div>
        )}
      </div>
      <div className="p-3">
        <h3 className="text-sm font-bold text-foreground/80 line-clamp-2 leading-snug group-hover:text-gold transition-colors duration-300">{item.title}</h3>
        {item.description && <p className="text-[10px] text-muted-foreground/40 mt-1 line-clamp-1">{item.description}</p>}
        <div className="mt-2 flex items-center text-[10px] font-bold text-gold/60 uppercase tracking-wider">Explorar <ArrowRight className="h-3 w-3 ml-1" /></div>
      </div>
    </>
  );
}
