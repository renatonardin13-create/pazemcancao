import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { CrossSellSection } from "@/components/CrossSellSection";
import { PageLoading } from "@/components/LoadingSkeletons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCourseDetail,
  updateLessonProgress,
} from "@/lib/courses.functions";
import { resolveCourseLesson } from "@/lib/resolve-course-lesson.functions";
import { StudentLayout } from "@/components/StudentLayout";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  BookOpen,
  Video,
  ChevronDown,
  ChevronRight,
  FileText,
  File as FileIcon,
  ExternalLink,
  Link2,
  Lock,
  Play,
  Layers,
  Sparkles,
  Trophy,
  Flame,
  GraduationCap,
  X,
  List,
} from "lucide-react";
import { useState, useEffect } from "react";
import { MusicPackPlayer } from "@/components/MusicPackPlayer";
import { motion, AnimatePresence } from "framer-motion";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/_authenticated/cursos/$courseId/")({
  component: CourseDetailPage,
  notFoundComponent: () => (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <p className="text-muted-foreground/50">Curso não encontrado.</p>
        <Link
          to="/cursos"
          className="mt-4 inline-block text-gold/70 hover:text-gold/80 text-sm"
        >
          Voltar
        </Link>
      </div>
    </div>
  ),
});

function CourseDetailPage() {
  const { courseId } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Auto-redirect to the appropriate lesson
  const { data: resolvedLesson, isLoading: isResolving } = useQuery({
    queryKey: ["resolve-course-lesson", courseId],
    queryFn: () => resolveCourseLesson({ data: { courseId } }),
  });

  useEffect(() => {
    if (resolvedLesson?.lessonId) {
      navigate({
        to: "/cursos/$courseId/aula/$lessonId",
        params: { courseId, lessonId: resolvedLesson.lessonId },
        replace: true,
      });
    }
  }, [resolvedLesson, courseId, navigate]);

  const { data, isLoading, error } = useQuery({
    queryKey: ["course-detail", courseId],
    queryFn: () => getCourseDetail({ data: { courseId } }),
  });

  const progressMutation = useMutation({
    mutationFn: (input: {
      lessonId: string;
      watchedSeconds: number;
      completed: boolean;
    }) =>
      updateLessonProgress({
        data: { courseId, ...input },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course-detail", courseId] });
    },
  });

  const [expandedModules, setExpandedModules] = useState<Set<string>>(
    new Set()
  );
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleModule = (id: string) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (isLoading) {
    return <PageLoading message="Carregando curso..." />;
  }

  if (error || !data?.course) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-muted-foreground/50">Erro ao carregar o curso.</p>
          <Link
            to="/cursos"
            className="mt-4 inline-block text-gold/70 hover:text-gold/80 text-sm"
          >
            Voltar
          </Link>
        </div>
      </div>
    );
  }

  const { course, lessons, progress, enrollment, integration, access } = data;
  const canAccessCourse = access?.canAccessCourse;
  const checkoutUrl = integration?.checkout_url ?? undefined;
  const hasCheckout = access?.hasCheckout && !!checkoutUrl;

  const modules = data.modules || [];
  const moduleMap: Record<string, any[]> = {};
  const unmoduled: any[] = [];
  for (const l of lessons) {
    if (l.module_id) {
      if (!moduleMap[l.module_id]) moduleMap[l.module_id] = [];
      moduleMap[l.module_id].push(l);
    } else {
      unmoduled.push(l);
    }
  }

  const completedLessons = progress.filter((p: any) => p.completed).length;
  const totalLessons = lessons.length;
  const progressPercent =
    totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  const isLouvoresPack = course?.course_type === "louvores";

  const isLessonCompleted = (lessonId: string) =>
    progress.some((p: any) => p.lesson_id === lessonId && p.completed);

  const hasValidContent = (lesson: any) => {
    const ct = lesson.content_type || "video";
    if (ct === "video") return !!lesson.video_url;
    return !!lesson.content_url;
  };

  const accessibleLessons = canAccessCourse
    ? lessons
    : lessons.filter((lesson: any) => lesson.is_free_preview);
  const validLessons = accessibleLessons.filter(hasValidContent);
  const primaryLesson =
    validLessons.find((lesson: any) => !isLessonCompleted(lesson.id)) ||
    validLessons[0] ||
    null;
  const previewLessonsCount = lessons.filter(
    (lesson: any) => lesson.is_free_preview
  ).length;
  const isCourseComplete = progressPercent >= 100;

  const getLessonIcon = (lesson: any) => {
    const ct = lesson.content_type || "video";
    if (ct === "pdf") return <FileText className="h-3.5 w-3.5" />;
    if (ct === "file") return <FileIcon className="h-3.5 w-3.5" />;
    if (ct === "link") return <Link2 className="h-3.5 w-3.5" />;
    return <Video className="h-3.5 w-3.5" />;
  };

  /* ─── Lesson row for the sidebar playlist ─── */
  const renderPlaylistLesson = (lesson: any, index: number) => {
    const completed = isLessonCompleted(lesson.id);
    const canOpen = canAccessCourse || lesson.is_free_preview;
    const hasContent = hasValidContent(lesson);
    const isNext = primaryLesson?.id === lesson.id;
    const isDisabled = !canOpen || !hasContent;

    const disabledReason = !canOpen
      ? "Acesso restrito"
      : !hasContent
        ? "Conteúdo indisponível"
        : null;

    const row = (
      <div
        className={`group/lesson flex items-center gap-3 px-4 py-3 transition-all duration-200 relative ${
          isNext
            ? "bg-player-sidebar-active border-l-[3px] border-l-gold"
            : isDisabled
              ? "border-l-[3px] border-l-transparent opacity-45 cursor-not-allowed"
              : "border-l-[3px] border-l-transparent cursor-pointer hover:bg-player-sidebar-hover hover:border-l-gold/25"
        }`}
        title={disabledReason || undefined}
      >
        {/* Number / status */}
        <div
          className={`shrink-0 flex h-8 w-8 items-center justify-center rounded-lg text-[11px] font-bold tabular-nums transition-colors ${
            completed
              ? "bg-player-completed/15 text-player-completed"
              : isNext
                ? "bg-gold/15 text-gold ring-1 ring-gold/20"
                : isDisabled
                  ? "text-muted-foreground/25"
                  : "text-muted-foreground/40 group-hover/lesson:text-foreground/50"
          }`}
        >
          {completed ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : isNext ? (
            <Play className="h-3.5 w-3.5 fill-current" />
          ) : isDisabled ? (
            !canOpen ? <Lock className="h-3.5 w-3.5" /> : <BookOpen className="h-3.5 w-3.5" />
          ) : (
            String(index + 1).padStart(2, "0")
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <span
            className={`text-[13px] font-medium block truncate transition-colors ${
              completed
                ? "text-muted-foreground/35 line-through"
                : isNext
                  ? "text-gold font-semibold"
                  : isDisabled
                    ? "text-muted-foreground/30"
                    : "text-foreground/70 group-hover/lesson:text-foreground/85"
            }`}
          >
            {lesson.title}
          </span>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-muted-foreground/30">
              {getLessonIcon(lesson)}
            </span>
            {lesson.duration && lesson.duration !== "0:00" && (
              <span className="text-[10px] text-muted-foreground/30 tabular-nums">
                {lesson.duration}
              </span>
            )}
            {disabledReason && (
              <span className="text-[9px] text-muted-foreground/25 font-medium">
                {disabledReason}
              </span>
            )}
            {isNext && (
              <span className="text-[8px] font-bold uppercase tracking-[0.12em] text-gold/60 bg-gold/[0.06] px-1.5 py-0.5 rounded-full ring-1 ring-gold/10">
                Continuar
              </span>
            )}
          </div>
        </div>

        {/* Mark complete */}
        {!completed && enrollment && canOpen && hasContent && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              progressMutation.mutate({
                lessonId: lesson.id,
                watchedSeconds: 0,
                completed: true,
              });
            }}
            className="shrink-0 opacity-0 group-hover/lesson:opacity-100 text-[9px] uppercase tracking-wider text-muted-foreground/30 hover:text-player-completed font-bold px-2 py-1 rounded-md hover:bg-player-completed/10 transition-all"
            aria-label={`Marcar ${lesson.title} como concluída`}
          >
            ✓
          </button>
        )}

        {/* Hover arrow for clickable items */}
        {!isDisabled && !isNext && !completed && (
          <ChevronRight className="shrink-0 h-3.5 w-3.5 text-muted-foreground/15 opacity-0 group-hover/lesson:opacity-100 transition-opacity" />
        )}
      </div>
    );

    if (!isDisabled) {
      return (
        <Link
          key={lesson.id}
          to="/cursos/$courseId/aula/$lessonId"
          params={{ courseId, lessonId: lesson.id }}
          className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/30 focus-visible:ring-offset-1 rounded-sm"
          aria-label={`Abrir aula: ${lesson.title}`}
        >
          {row}
        </Link>
      );
    }
    return (
      <div key={lesson.id} aria-disabled="true" role="listitem">
        {row}
      </div>
    );
  };

  if (isLouvoresPack) {
    return (
      <StudentLayout>
        <MusicPackPlayer courseId={courseId} courseTitle={course.title} />
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <div className="min-h-screen bg-background flex flex-col">
        {/* ─── TOP BAR ─── */}
        <motion.header
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="sticky top-0 z-40 flex items-center gap-3 px-4 sm:px-6 py-3 bg-background/80 backdrop-blur-xl border-b border-border/10"
        >
          <Link
            to="/cursos"
            className="flex items-center gap-2 text-muted-foreground/50 hover:text-gold/70 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] hidden sm:inline">
              Cursos
            </span>
          </Link>

          <div className="h-4 w-px bg-border/15" />

          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-bold text-foreground/80 truncate">
              {course.title}
            </h1>
          </div>

          {/* Progress pill */}
          <div className="hidden sm:flex items-center gap-2 rounded-full border border-border/15 bg-card/10 px-3 py-1.5">
            {isCourseComplete ? (
              <Trophy className="h-3.5 w-3.5 text-player-completed" />
            ) : (
              <Flame className="h-3.5 w-3.5 text-gold/60" />
            )}
            <span className="text-[11px] font-bold tabular-nums text-foreground/70">
              {progressPercent}%
            </span>
            <div className="w-16 h-1.5 rounded-full bg-muted/10 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${isCourseComplete ? "bg-player-completed" : "bg-player-progress-fill"}`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Toggle sidebar (mobile) */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="flex lg:hidden items-center justify-center h-9 w-9 rounded-xl bg-card/10 border border-border/10 text-muted-foreground/50 hover:text-gold/70 transition-colors"
          >
            {sidebarOpen ? (
              <X className="h-4 w-4" />
            ) : (
              <List className="h-4 w-4" />
            )}
          </button>
        </motion.header>

        {/* ─── MAIN BODY: content + sidebar ─── */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* ─── MAIN CONTENT AREA ─── */}
          <main className="flex-1 min-w-0 overflow-y-auto">
            {/* Hero / Feature area */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="relative w-full aspect-video max-h-[420px] bg-card/5 overflow-hidden"
            >
              {(course.banner_image_url || course.cover_image_url) ? (
                <img
                  src={course.banner_image_url ?? course.cover_image_url ?? undefined}
                  alt={course.title}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-card/20 to-background">
                  <BookOpen className="h-16 w-16 text-muted-foreground/10" />
                </div>
              )}

              {/* Gradient overlays */}
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-background/50 to-transparent" />

              {/* Play CTA overlay */}
              {primaryLesson && (
                <Link
                  to="/cursos/$courseId/aula/$lessonId"
                  params={{ courseId, lessonId: primaryLesson.id }}
                  className="absolute inset-0 flex items-center justify-center group/play"
                >
                  <motion.div
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex h-20 w-20 items-center justify-center rounded-full bg-gold/90 text-gold-foreground shadow-2xl shadow-gold/30 ring-4 ring-gold/20 backdrop-blur-sm transition-all duration-300 group-hover/play:shadow-gold/50 group-hover/play:ring-gold/30"
                  >
                    <Play className="h-8 w-8 fill-current ml-1" />
                  </motion.div>
                </Link>
              )}

              {/* Bottom info on hero */}
              <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-8">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  {(course as any).categories?.name && (
                    <span className="rounded-full border border-gold/15 bg-gold/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-gold/70 backdrop-blur-sm">
                      {(course as any).categories.name}
                    </span>
                  )}
                  {isCourseComplete && (
                    <span className="rounded-full bg-player-completed/15 border border-player-completed/20 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-player-completed backdrop-blur-sm">
                      <Trophy className="h-3 w-3 inline mr-1" />
                      Concluído
                    </span>
                  )}
                </div>
                <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground/95 tracking-tight leading-tight max-w-2xl">
                  {course.title}
                </h2>
                {course.short_description && (
                  <p className="mt-2 text-sm text-muted-foreground/60 max-w-xl leading-relaxed line-clamp-2">
                    {course.short_description}
                  </p>
                )}
                <div className="mt-4 flex items-center gap-3 text-[11px] text-muted-foreground/45">
                  <span className="flex items-center gap-1.5">
                    <Video className="h-3 w-3 text-gold/50" />
                    {totalLessons} aula{totalLessons !== 1 ? "s" : ""}
                  </span>
                  <span className="text-border/20">·</span>
                  <span className="flex items-center gap-1.5">
                    <Layers className="h-3 w-3 text-gold/50" />
                    {modules.length} módulo{modules.length !== 1 ? "s" : ""}
                  </span>
                  {course.total_duration && (
                    <>
                      <span className="text-border/20">·</span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-3 w-3 text-gold/50" />
                        {course.total_duration}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Below hero: progress + actions + description */}
            <div className="px-4 sm:px-6 lg:px-8 py-6 space-y-6 max-w-4xl">
              {/* Progress bar */}
              {canAccessCourse && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="rounded-2xl border border-border/12 bg-card/8 p-5"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {isCourseComplete ? (
                        <Trophy className="h-4 w-4 text-player-completed" />
                      ) : (
                        <Flame className="h-4 w-4 text-gold/60" />
                      )}
                      <span className="text-sm font-semibold text-foreground/75">
                        {isCourseComplete ? "Curso concluído! 🎉" : "Seu progresso"}
                      </span>
                    </div>
                    <span className="text-xl font-black text-gold/80 tabular-nums">
                      {progressPercent}%
                    </span>
                  </div>
                  <Progress value={progressPercent} className="h-2 mb-2" />
                  <div className="flex items-center justify-between text-[12px] text-muted-foreground/50">
                    <span>
                      {completedLessons} de {totalLessons} aula{totalLessons !== 1 ? "s" : ""} concluída{completedLessons !== 1 ? "s" : ""}
                    </span>
                    {primaryLesson && !isCourseComplete && (
                      <Link
                        to="/cursos/$courseId/aula/$lessonId"
                        params={{ courseId, lessonId: primaryLesson.id }}
                        className="inline-flex items-center gap-1 text-gold/60 hover:text-gold/85 font-semibold transition-colors"
                      >
                        Continuar
                        <ChevronRight className="h-3 w-3" />
                      </Link>
                    )}
                  </div>
                </motion.div>
              )}

              {/* No valid lessons message */}
              {canAccessCourse && !primaryLesson && totalLessons > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="rounded-2xl border border-border/12 bg-card/8 p-5 text-center"
                >
                  <BookOpen className="mx-auto h-8 w-8 text-muted-foreground/20 mb-3" />
                  <p className="text-sm font-semibold text-foreground/60">
                    Nenhuma aula com conteúdo disponível
                  </p>
                  <p className="text-[12px] text-muted-foreground/35 mt-1">
                    As aulas deste curso estão sendo preparadas. Volte em breve.
                  </p>
                </motion.div>
              )}

              {/* Locked access card */}
              {!canAccessCourse && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="rounded-2xl border border-border/12 bg-card/8 p-5"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-gold/50">
                        <Lock className="h-3.5 w-3.5" />
                        Acesso restrito
                      </span>
                      <p className="text-sm text-muted-foreground/40 mt-2 max-w-sm leading-relaxed">
                        {previewLessonsCount > 0
                          ? `${previewLessonsCount} aula${previewLessonsCount !== 1 ? "s" : ""} disponíve${previewLessonsCount !== 1 ? "is" : "l"} para preview gratuito`
                          : "Adquira o acesso para assistir as aulas"}
                      </p>
                    </div>
                    {hasCheckout && (
                      <a
                        href={checkoutUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-2xl bg-gold/90 text-gold-foreground px-6 py-3 text-xs font-bold uppercase tracking-[0.2em] hover:bg-gold transition-all shadow-md shadow-gold/15 whitespace-nowrap"
                      >
                        <Sparkles className="h-3.5 w-3.5" />
                        Adquirir acesso
                      </a>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Course description */}
              {course.full_description && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <h3 className="text-xs font-bold uppercase tracking-[0.25em] text-muted-foreground/40 mb-4">
                    Sobre o curso
                  </h3>
                  <p className="text-sm text-muted-foreground/50 leading-relaxed whitespace-pre-line">
                    {course.full_description}
                  </p>
                </motion.div>
              )}
            </div>
          </main>

          {/* ─── SIDEBAR: Playlist ─── */}
          <AnimatePresence>
            {sidebarOpen && (
              <motion.aside
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full lg:w-[380px] shrink-0 bg-card/3 border-t lg:border-t-0 lg:border-l border-border/10 overflow-y-auto"
              >
                <div className="p-5 border-b border-border/10">
                  <h3 className="text-xs font-bold uppercase tracking-[0.25em] text-muted-foreground/40">
                    Conteúdo do curso
                  </h3>
                </div>

                {/* Modules */}
                <div className="divide-y divide-border/8">
                  {modules.map((mod: any) => {
                    const modLessons = moduleMap[mod.id] || [];
                    const isModExpanded = expandedModules.has(mod.id);
                    const modCompleted = modLessons.filter((l: any) =>
                      isLessonCompleted(l.id)
                    ).length;
                    const modHasActiveLessons = modLessons.some(
                      (l: any) => primaryLesson?.id === l.id
                    );

                    return (
                      <div key={mod.id}>
                        <button
                          onClick={() => toggleModule(mod.id)}
                          className="flex items-center gap-3 w-full px-5 py-4 text-left hover:bg-card/8 transition-colors"
                        >
                          <div className="shrink-0">
                            {isModExpanded ? (
                              <ChevronDown className="h-4 w-4 text-muted-foreground/40" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-muted-foreground/40" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-[13px] font-semibold text-foreground/70 block truncate">
                              {mod.title}
                            </span>
                            <span className="text-[11px] text-muted-foreground/40">
                              {modCompleted}/{modLessons.length} aula{modLessons.length !== 1 ? "s" : ""}
                            </span>
                          </div>
                        </button>

                        <AnimatePresence>
                          {isModExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              {modLessons.map((lesson: any, i: number) =>
                                renderPlaylistLesson(lesson, i)
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}

                  {/* Unmoduled lessons */}
                  {unmoduled.length > 0 && (
                    <div>
                      {unmoduled.map((lesson: any, i: number) =>
                        renderPlaylistLesson(lesson, i)
                      )}
                    </div>
                  )}
                </div>
              </motion.aside>
            )}
          </AnimatePresence>
        </div>

        {/* Cross-sell related products */}
        <CrossSellSection
          currentType="course"
          currentId={courseId}
          category={course.category_id || undefined}
          className="mt-8 px-4 sm:px-6 pb-8"
        />
      </div>
    </StudentLayout>
  );
}
