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
import { BookOpen, Search, ArrowRight, PlayCircle, Sparkles, TrendingUp, Play, Heart, Star, Zap, CheckCircle2, Layers } from "lucide-react";
import { useState, useMemo, useRef } from "react";
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

  const displayName = profileData?.profile?.display_name || user?.email?.split("@")[0] || "aluno";
  const firstName = displayName.split(" ")[0];
  const courses = data?.courses || [];
  const stats = data?.stats || { total: 0, inProgress: 0, completed: 0 };

  const continueItems = useMemo(() => {
    return courses
      .filter((c: any) => c.last_accessed_at && c.progress_pct > 0 && c.progress_pct < 100)
      .sort((a: any, b: any) => new Date(b.last_accessed_at).getTime() - new Date(a.last_accessed_at).getTime())
      .slice(0, 10);
  }, [courses]);

  const continueIds = new Set(continueItems.map((c: any) => c.id));
  const recommendations = (recData?.recommendations || []).filter((c: any) => !continueIds.has(c.id));
  const trending = trendData?.ranked || [];
  const newCourses = (newData?.courses || []).filter((c: any) => !continueIds.has(c.id));

  // "Meus cursos" shelf — enrolled courses not in "continue"
  const myCourses = useMemo(() => {
    return courses.filter((c: any) => !continueIds.has(c.id));
  }, [courses, continueIds]);

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

  // Search across all courses
  const allVisibleCourses = useMemo(() => {
    if (!search) return null;
    const q = search.toLowerCase();
    const allSources = [...courses, ...recommendations, ...trending, ...newCourses];
    const seen = new Set<string>();
    return allSources.filter((c: any) => {
      if (seen.has(c.id)) return false;
      seen.add(c.id);
      return c.title?.toLowerCase().includes(q);
    });
  }, [search, courses, recommendations, trending, newCourses]);

  return (
    <StudentLayout>
    <div className="min-h-screen bg-background flex flex-col">

      <main className="flex-1 w-full pb-28">

        {/* ═══ 1. SAUDAÇÃO + BUSCA ═══ */}
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
        {allVisibleCourses !== null ? (
          <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-12">
            <SectionHeader icon={Search} title={`Resultados para "${search}"`} subtitle={`${allVisibleCourses.length} curso(s) encontrado(s)`} />
            {allVisibleCourses.length > 0 ? (
              <ShelfRow>
                {allVisibleCourses.map((course: any, idx: number) => (
                  <ShelfItem key={`search-${course.id}`} idx={idx}>
                    <CourseShelfCard course={course} showProgress />
                  </ShelfItem>
                ))}
              </ShelfRow>
            ) : (
              <EmptyState icon={Search} title="Nenhum curso encontrado" description="Tente buscar com outras palavras." />
            )}
          </div>
        ) : (
          <>
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
                  <div className="max-w-[1400px] mx-auto">
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

            <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-12 pt-8">

              {isLoading ? (
                <CardGridSkeleton count={6} />
              ) : (
                <>
                  {/* ═══ 3. CONTINUE ASSISTINDO ═══ */}
                  {continueItems.length > 0 && (
                    <Shelf icon={PlayCircle} title="Continue assistindo" subtitle="Retome de onde você parou" delay={0.1}>
                      {continueItems.map((course: any, idx: number) => (
                        <ShelfItem key={`continue-${course.id}`} idx={idx}>
                          <CourseShelfCard course={course} showProgress ctaLabel={`${course.progress_pct}% concluído`} />
                        </ShelfItem>
                      ))}
                    </Shelf>
                  )}

                  {/* ═══ 4. MEUS CURSOS ═══ */}
                  {myCourses.length > 0 && (
                    <Shelf icon={BookOpen} title="Meus cursos" subtitle="Cursos em que você está matriculado" delay={0.15}>
                      {myCourses.map((course: any, idx: number) => {
                        const isCompleted = course.progress_pct >= 100;
                        return (
                          <ShelfItem key={`my-${course.id}`} idx={idx}>
                            <CourseShelfCard
                              course={course}
                              showProgress={course.progress_pct > 0}
                              badge={isCompleted ? (
                                <span className="inline-flex items-center gap-1 rounded-full bg-player-completed/20 backdrop-blur-sm px-2 py-0.5 border border-player-completed/15 text-[9px] font-bold text-player-completed uppercase tracking-wider">
                                  <CheckCircle2 className="h-2.5 w-2.5" /> Concluído
                                </span>
                              ) : undefined}
                            />
                          </ShelfItem>
                        );
                      })}
                    </Shelf>
                  )}

                  {/* ═══ 5. RECOMENDADOS ═══ */}
                  {recommendations.length > 0 && (
                    <Shelf icon={Sparkles} title="Recomendados para você" subtitle="Cursos selecionados com base no seu perfil" delay={0.2}>
                      {recommendations.slice(0, 10).map((course: any, idx: number) => (
                        <ShelfItem key={`rec-${course.id}`} idx={idx}>
                          <CourseShelfCard
                            course={course}
                            badge={course.enrollment_count > 0 ? (
                              <span className="rounded-full bg-background/60 backdrop-blur-sm px-2 py-0.5 border border-border/20 text-[9px] font-bold text-muted-foreground/60">{course.enrollment_count} alunos</span>
                            ) : undefined}
                          />
                        </ShelfItem>
                      ))}
                    </Shelf>
                  )}

                  {/* ═══ 6. MAIS ACESSADOS ═══ */}
                  {trending.length > 0 && (
                    <Shelf icon={TrendingUp} title="Mais acessados" subtitle="Os cursos mais populares da plataforma" delay={0.25}>
                      {trending.map((course: any, idx: number) => (
                        <ShelfItem key={`trend-${course.id}`} idx={idx}>
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
                        </ShelfItem>
                      ))}
                    </Shelf>
                  )}

                  {/* ═══ 7. CONTEÚDOS EM DESTAQUE ═══ */}
                  {(featuredData?.items?.length ?? 0) > 0 && (
                    <Shelf icon={Star} title="Conteúdos em destaque" subtitle="Selecionados especialmente para sua jornada" delay={0.3}>
                      {(featuredData?.items || []).map((item: any, idx: number) => {
                        const isCourse = featuredData?.source === 'courses' || item.content_type === 'course';
                        const coverImg = item.card_cover_url || item.cover_url;
                        return (
                          <ShelfItem key={`feat-${item.id}`} idx={idx} wide>
                            {isCourse ? (
                              <Link to="/cursos/$courseId" params={{ courseId: item.id }} className="group block rounded-2xl border border-border/12 bg-card/10 overflow-hidden transition-all duration-500 hover:border-gold/25 hover:bg-card/20 hover:shadow-lg hover:shadow-gold/5 hover:-translate-y-1">
                                <FeaturedCardInner item={item} coverImg={coverImg} />
                              </Link>
                            ) : (
                              <Link to="/conteudo/$trackId" params={{ trackId: item.id }} className="group block rounded-2xl border border-border/12 bg-card/10 overflow-hidden transition-all duration-500 hover:border-gold/25 hover:bg-card/20 hover:shadow-lg hover:shadow-gold/5 hover:-translate-y-1">
                                <FeaturedCardInner item={item} coverImg={coverImg} />
                              </Link>
                            )}
                          </ShelfItem>
                        );
                      })}
                    </Shelf>
                  )}

                  {/* ═══ 8. LANÇAMENTOS ═══ */}
                  {newCourses.length > 0 && (
                    <Shelf icon={Zap} title="Lançamentos" subtitle="Adicionados recentemente à plataforma" delay={0.35}>
                      {newCourses.slice(0, 10).map((course: any, idx: number) => (
                        <ShelfItem key={`new-${course.id}`} idx={idx}>
                          <CourseShelfCard
                            course={course}
                            badge={
                              <span className="rounded-full bg-gold/20 backdrop-blur-sm px-2.5 py-0.5 border border-gold/20 text-[9px] font-bold text-gold uppercase tracking-wider">Novo</span>
                            }
                          />
                        </ShelfItem>
                      ))}
                    </Shelf>
                  )}

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
                  {courses.length === 0 && recommendations.length === 0 && trending.length === 0 && (
                    <EmptyState icon={BookOpen} title="Você ainda não possui cursos" description="Adquira um curso na vitrine para começar sua jornada de aprendizado." actionLabel="Explorar Vitrine" actionTo="/vitrine" actionIcon={ArrowRight} />
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

function Shelf({ icon: Icon, title, subtitle, delay = 0, children }: {
  icon: any;
  title: string;
  subtitle: string;
  delay?: number;
  children: React.ReactNode;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      className="mb-10"
    >
      <SectionHeader icon={Icon} title={title} subtitle={subtitle} />
      <ShelfRow>{children}</ShelfRow>
    </motion.section>
  );
}

function ShelfRow({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-1 px-1 snap-x snap-mandatory">
      {children}
    </div>
  );
}

function ShelfItem({ children, idx = 0, wide = false }: { children: React.ReactNode; idx?: number; wide?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.05 * Math.min(idx, 8) }}
      className={`flex-shrink-0 snap-start ${wide ? "w-[220px] sm:w-[260px]" : "w-[160px] sm:w-[190px]"}`}
    >
      {children}
    </motion.div>
  );
}

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
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold/90 shadow-xl shadow-gold/25 scale-90 group-hover:scale-100 transition-transform duration-400">
            <Play className="h-4 w-4 text-gold-foreground fill-gold-foreground ml-0.5" />
          </div>
        </div>
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
