import { createFileRoute, Link } from "@tanstack/react-router";
import { PageLoading } from "@/components/LoadingSkeletons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCourseDetail,
  updateLessonProgress,
} from "@/lib/courses.functions";
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
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/_authenticated/cursos/$courseId")({
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
  const queryClient = useQueryClient();

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

  const isLessonCompleted = (lessonId: string) =>
    progress.some((p: any) => p.lesson_id === lessonId && p.completed);

  const accessibleLessons = canAccessCourse
    ? lessons
    : lessons.filter((lesson: any) => lesson.is_free_preview);
  const primaryLesson =
    accessibleLessons.find((lesson: any) => !isLessonCompleted(lesson.id)) ||
    accessibleLessons[0] ||
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
    const isNext = primaryLesson?.id === lesson.id;

    const row = (
      <div
        className={`group/lesson flex items-center gap-3 px-4 py-3 transition-all duration-200 cursor-pointer ${
          isNext
            ? "bg-player-sidebar-active border-l-2 border-l-player-sidebar-active-border"
            : "border-l-2 border-l-transparent hover:bg-player-sidebar-hover"
        } ${!canOpen ? "opacity-50" : ""}`}
      >
        {/* Number / status */}
        <div
          className={`shrink-0 flex h-8 w-8 items-center justify-center rounded-lg text-[11px] font-bold tabular-nums ${
            completed
              ? "bg-player-completed/15 text-player-completed"
              : isNext
                ? "bg-gold/15 text-gold"
                : "text-muted-foreground/40"
          }`}
        >
          {completed ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : isNext ? (
            <Play className="h-3.5 w-3.5 fill-current" />
          ) : (
            String(index + 1).padStart(2, "0")
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <span
            className={`text-[13px] font-medium block truncate ${
              completed
                ? "text-muted-foreground/35 line-through"
                : isNext
                  ? "text-gold font-semibold"
                  : "text-foreground/70"
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
            {!canOpen && <Lock className="h-3 w-3 text-muted-foreground/20" />}
          </div>
        </div>

        {/* Mark complete */}
        {!completed && enrollment && canOpen && (
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
          >
            ✓
          </button>
        )}
      </div>
    );

    if (canOpen) {
      return (
        <Link
          key={lesson.id}
          to="/cursos/$courseId/aula/$lessonId"
          params={{ courseId, lessonId: lesson.id }}
          className="block"
        >
          {row}
        </Link>
      );
    }
    return <div key={lesson.id}>{row}</div>;
  };

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
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground/50 max-w-lg">
                        {access?.hasFreePreview
                          ? `${previewLessonsCount} aula${previewLessonsCount !== 1 ? "s" : ""} de prévia disponíve${previewLessonsCount !== 1 ? "is" : "l"}.`
                          : "Este curso requer liberação para acesso completo."}
                      </p>
                    </div>
                    {hasCheckout && (
                      <a
                        href={checkoutUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gold px-6 text-[11px] font-bold uppercase tracking-[0.16em] text-gold-foreground shadow-md shadow-gold/15 transition-all hover:brightness-110"
                      >
                        <Sparkles className="h-3.5 w-3.5" />
                        Desbloquear
                      </a>
                    )}
                  </div>
                </motion.div>
              )}

              {/* CTA buttons */}
              <div className="flex flex-wrap items-center gap-3">
                {primaryLesson && (
                  <Link
                    to="/cursos/$courseId/aula/$lessonId"
                    params={{ courseId, lessonId: primaryLesson.id }}
                    className="inline-flex h-12 items-center justify-center gap-2.5 rounded-2xl bg-gold px-7 text-[12px] font-bold uppercase tracking-[0.2em] text-gold-foreground shadow-lg shadow-gold/15 transition-all duration-300 hover:shadow-xl hover:shadow-gold/25 hover:brightness-110 active:scale-[0.97]"
                  >
                    {isCourseComplete ? (
                      <>
                        <GraduationCap className="h-4 w-4" />
                        Revisar curso
                      </>
                    ) : completedLessons > 0 ? (
                      <>
                        <Flame className="h-4 w-4" />
                        Continuar aula
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 fill-current" />
                        {canAccessCourse ? "Começar curso" : "Assistir prévia"}
                      </>
                    )}
                  </Link>
                )}
                {!canAccessCourse && hasCheckout && (
                  <a
                    href={checkoutUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-border/20 bg-card/20 px-6 text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground/65 backdrop-blur transition-all hover:border-gold/25 hover:text-gold/80"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Comprar acesso
                  </a>
                )}

                {/* Toggle playlist on desktop */}
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="hidden lg:inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-border/15 bg-card/10 px-5 text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/50 hover:text-gold/70 transition-colors"
                >
                  <List className="h-4 w-4" />
                  {sidebarOpen ? "Ocultar playlist" : "Mostrar playlist"}
                </button>
              </div>

              {/* Description */}
              {course.full_description && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="rounded-2xl border border-border/10 bg-card/5 p-5"
                >
                  <h3 className="text-[11px] font-bold uppercase tracking-[0.25em] text-muted-foreground/40 mb-3">
                    Sobre o curso
                  </h3>
                  <p className="text-[14px] leading-[2] text-muted-foreground/55 whitespace-pre-line">
                    {course.full_description}
                  </p>
                </motion.div>
              )}

              {/* Enrollment status */}
              <div className="flex items-center gap-3 rounded-xl border border-border/10 bg-card/5 px-4 py-3">
                <div
                  className={`h-2.5 w-2.5 rounded-full ${
                    enrollment
                      ? "bg-player-completed shadow-sm shadow-player-completed/30"
                      : canAccessCourse
                        ? "bg-gold/60"
                        : "bg-muted-foreground/20"
                  }`}
                />
                <div>
                  <p className="text-[11px] font-semibold text-foreground/70">
                    {enrollment
                      ? "Matrícula ativa"
                      : canAccessCourse
                        ? "Acesso liberado"
                        : "Acesso pendente"}
                  </p>
                  <p className="text-[10px] text-muted-foreground/35">
                    {enrollment
                      ? "Você tem acesso completo"
                      : canAccessCourse
                        ? "Administrador"
                        : previewLessonsCount > 0
                          ? `${previewLessonsCount} prévia${previewLessonsCount !== 1 ? "s" : ""} disponíve${previewLessonsCount !== 1 ? "is" : "l"}`
                          : "Nenhum acesso liberado"}
                  </p>
                </div>
              </div>
            </div>
          </main>

          {/* ─── PLAYLIST SIDEBAR ─── */}
          <AnimatePresence>
            {sidebarOpen && (
              <motion.aside
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: "auto", opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="shrink-0 w-full lg:w-[340px] xl:w-[370px] border-l border-player-sidebar-border bg-player-sidebar-bg overflow-hidden
                  fixed lg:relative inset-0 top-[53px] lg:top-0 z-30 lg:z-auto"
              >
                <div className="h-full overflow-y-auto">
                  {/* Sidebar header */}
                  <div className="sticky top-0 z-10 bg-player-sidebar-bg/95 backdrop-blur-xl border-b border-player-sidebar-border px-4 py-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-foreground/60">
                        Playlist do curso
                      </h3>
                      <button
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden flex items-center justify-center h-7 w-7 rounded-lg bg-card/10 text-muted-foreground/40 hover:text-foreground/70 transition-colors"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {/* Mini progress */}
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full bg-player-progress-track overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${isCourseComplete ? "bg-player-completed" : "bg-player-progress-fill"}`}
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-bold tabular-nums text-muted-foreground/40">
                        {completedLessons}/{totalLessons}
                      </span>
                    </div>
                  </div>

                  {/* Modules & lessons */}
                  <div className="pb-20">
                    {totalLessons === 0 ? (
                      <div className="text-center py-16 px-4">
                        <BookOpen className="h-8 w-8 text-muted-foreground/10 mx-auto mb-3" />
                        <p className="text-sm text-muted-foreground/30">
                          Nenhuma aula ainda.
                        </p>
                      </div>
                    ) : (
                      <>
                        {modules
                          .sort((a: any, b: any) => a.sort_order - b.sort_order)
                          .map((mod: any, modIdx: number) => {
                            const modLessons = (moduleMap[mod.id] || []).sort(
                              (a: any, b: any) => a.sort_order - b.sort_order
                            );
                            if (modLessons.length === 0) return null;

                            const isExpanded =
                              expandedModules.size === 0
                                ? modIdx === 0
                                : expandedModules.has(mod.id);
                            const modCompleted = modLessons.filter((l: any) =>
                              isLessonCompleted(l.id)
                            ).length;
                            const modProgress = Math.round(
                              (modCompleted / modLessons.length) * 100
                            );
                            const isModComplete = modCompleted === modLessons.length;
                            const hasNext = modLessons.some(
                              (l: any) => l.id === primaryLesson?.id
                            );

                            return (
                              <div key={mod.id} className="border-b border-player-sidebar-border/50">
                                <button
                                  type="button"
                                  onClick={() => toggleModule(mod.id)}
                                  className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-player-sidebar-hover ${
                                    hasNext ? "bg-player-sidebar-active/30" : ""
                                  }`}
                                >
                                  <div
                                    className={`shrink-0 flex h-8 w-8 items-center justify-center rounded-lg text-[10px] font-black tabular-nums ${
                                      isModComplete
                                        ? "bg-player-completed/12 text-player-completed"
                                        : "bg-gold/8 text-gold/50"
                                    }`}
                                  >
                                    {isModComplete ? (
                                      <CheckCircle2 className="h-4 w-4" />
                                    ) : (
                                      String(modIdx + 1).padStart(2, "0")
                                    )}
                                  </div>

                                  <div className="flex-1 min-w-0">
                                    <p className="text-[13px] font-bold text-foreground/70 truncate">
                                      {mod.title}
                                    </p>
                                    <div className="flex items-center gap-2 mt-1">
                                      <div className="h-1 flex-1 max-w-[100px] rounded-full bg-player-progress-track overflow-hidden">
                                        <div
                                          className={`h-full rounded-full ${isModComplete ? "bg-player-completed" : "bg-player-progress-fill"}`}
                                          style={{ width: `${modProgress}%` }}
                                        />
                                      </div>
                                      <span className="text-[9px] font-bold tabular-nums text-muted-foreground/30">
                                        {modCompleted}/{modLessons.length}
                                      </span>
                                    </div>
                                  </div>

                                  <div className="shrink-0">
                                    {isExpanded ? (
                                      <ChevronDown className="h-4 w-4 text-gold/40" />
                                    ) : (
                                      <ChevronRight className="h-4 w-4 text-muted-foreground/25" />
                                    )}
                                  </div>
                                </button>

                                <AnimatePresence>
                                  {isExpanded && (
                                    <motion.div
                                      initial={{ height: 0, opacity: 0 }}
                                      animate={{ height: "auto", opacity: 1 }}
                                      exit={{ height: 0, opacity: 0 }}
                                      transition={{ duration: 0.25 }}
                                      className="overflow-hidden"
                                    >
                                      <div className="divide-y divide-player-sidebar-border/30">
                                        {modLessons.map((lesson: any, idx: number) =>
                                          renderPlaylistLesson(lesson, idx)
                                        )}
                                      </div>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            );
                          })}

                        {/* Unmoduled lessons */}
                        {unmoduled.length > 0 && (
                          <div className="border-b border-player-sidebar-border/50">
                            {modules.length > 0 && (
                              <div className="px-4 py-2.5 border-b border-player-sidebar-border/30">
                                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/30">
                                  Aulas avulsas
                                </p>
                              </div>
                            )}
                            <div className="divide-y divide-player-sidebar-border/30">
                              {unmoduled
                                .sort((a: any, b: any) => a.sort_order - b.sort_order)
                                .map((lesson: any, idx: number) =>
                                  renderPlaylistLesson(lesson, idx)
                                )}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </motion.aside>
            )}
          </AnimatePresence>
        </div>
      </div>
    </StudentLayout>
  );
}
