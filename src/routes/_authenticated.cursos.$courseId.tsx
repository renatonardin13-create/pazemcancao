import { createFileRoute, Link } from "@tanstack/react-router";
import { PageLoading } from "@/components/LoadingSkeletons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCourseDetail,
  updateLessonProgress,
} from "@/lib/courses.functions";
import { StudentLayout } from "@/components/StudentLayout";
import { FooterLinks } from "@/components/FooterLinks";
import {
  ArrowLeft,
  ArrowRight,
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
  // DEBUG: temporary marker to confirm this is the active component
  const DEBUG_BANNER = (
    <div className="fixed top-0 left-0 right-0 z-[9999] bg-red-600 text-white text-center py-2 font-bold text-lg tracking-widest">
      NOVA VERSÃO ATIVA
    </div>
  );
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

  const renderLesson = (lesson: any, index: number) => {
    const completed = isLessonCompleted(lesson.id);
    const canOpenLesson = canAccessCourse || lesson.is_free_preview;
    const isNextLesson = primaryLesson?.id === lesson.id;

    const content = (
      <div
        className={`group/lesson relative flex items-center gap-3.5 px-4 sm:px-5 py-3.5 transition-all duration-300 ${
          isNextLesson
            ? "bg-gold/[0.04] border-l-2 border-l-gold/50"
            : "border-l-2 border-l-transparent"
        } ${canOpenLesson ? "hover:bg-gold/[0.03] cursor-pointer" : ""}`}
      >
        {/* Status indicator */}
        <div
          className={`shrink-0 flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold tabular-nums transition-all duration-300 ${
            completed
              ? "bg-emerald-500/12 text-emerald-400/80 ring-1 ring-emerald-500/15"
              : isNextLesson
                ? "bg-gold/12 text-gold/80 ring-1 ring-gold/20 shadow-sm shadow-gold/5"
                : canOpenLesson
                  ? "bg-card/30 text-muted-foreground/50 ring-1 ring-border/15 group-hover/lesson:ring-gold/15 group-hover/lesson:text-gold/60"
                  : "bg-muted/5 text-muted-foreground/25 ring-1 ring-border/10"
          }`}
        >
          {completed ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : isNextLesson ? (
            <Play className="h-3.5 w-3.5 fill-current ml-0.5" />
          ) : (
            String(index + 1).padStart(2, "0")
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span
              className={`text-[13px] sm:text-sm font-medium block transition-colors duration-300 truncate ${
                completed
                  ? "text-muted-foreground/40 line-through decoration-muted-foreground/20"
                  : isNextLesson
                    ? "text-gold/80 font-semibold"
                    : canOpenLesson
                      ? "text-foreground/70 group-hover/lesson:text-foreground/85"
                      : "text-muted-foreground/40"
              }`}
            >
              {lesson.title}
            </span>
            {isNextLesson && !completed && (
              <span className="shrink-0 text-[9px] font-bold uppercase tracking-[0.15em] text-gold/60 bg-gold/[0.08] px-2 py-0.5 rounded-full ring-1 ring-gold/10">
                Próxima
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span
              className={`${completed ? "text-muted-foreground/25" : "text-muted-foreground/35"}`}
            >
              {getLessonIcon(lesson)}
            </span>
            {lesson.duration && lesson.duration !== "0:00" && (
              <span className="text-[11px] text-muted-foreground/35 tabular-nums">
                {lesson.duration}
              </span>
            )}
            {lesson.is_free_preview && !canAccessCourse && (
              <span className="text-[9px] font-bold uppercase tracking-[0.12em] text-gold/50 bg-gold/[0.06] px-1.5 py-0.5 rounded-full">
                Prévia
              </span>
            )}
            {!canOpenLesson && (
              <Lock className="h-3 w-3 text-muted-foreground/20" />
            )}
          </div>
        </div>

        {/* Right actions */}
        <div className="shrink-0 flex items-center gap-2">
          {!completed && enrollment && (
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
              className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground/25 hover:text-emerald-400/60 transition-colors font-bold px-2 py-1 rounded-lg hover:bg-emerald-500/5"
            >
              Concluir
            </button>
          )}
          {canOpenLesson && !completed && (
            <div className="opacity-0 group-hover/lesson:opacity-100 transition-opacity duration-300">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gold/10 text-gold/60 ring-1 ring-gold/10">
                <ArrowRight className="h-3 w-3" />
              </div>
            </div>
          )}
        </div>
      </div>
    );

    if (canOpenLesson) {
      return (
        <Link
          key={lesson.id}
          to="/cursos/$courseId/aula/$lessonId"
          params={{ courseId, lessonId: lesson.id }}
          className="block"
        >
          {content}
        </Link>
      );
    }

    return <div key={lesson.id}>{content}</div>;
  };

  return (
    <StudentLayout>
      <div className="min-h-screen bg-background flex flex-col">
        {/* ─── CINEMATIC HERO BANNER ─── */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="relative w-full overflow-hidden"
        >
          {/* Background image */}
          {(course.banner_image_url || course.cover_image_url) ? (
            <img
              src={course.banner_image_url ?? course.cover_image_url ?? undefined}
              alt=""
              aria-hidden
              className="absolute inset-0 h-full w-full object-cover scale-105 blur-[1px]"
            />
          ) : null}

          {/* Overlays */}
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/75 to-background" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/60 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />

          <div className="relative mx-auto max-w-[1100px] px-4 sm:px-8 lg:px-12 pt-10 sm:pt-14 pb-12 sm:pb-16">
            {/* Back */}
            <Link
              to="/cursos"
              className="group inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.25em] text-muted-foreground/45 hover:text-gold/70 transition-colors duration-300 mb-8"
            >
              <ArrowLeft className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-x-1" />
              Voltar aos cursos
            </Link>

            <div className="flex flex-col lg:flex-row lg:items-end gap-6 lg:gap-10">
              {/* Cover */}
              <motion.div
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="shrink-0"
              >
                {course.cover_image_url ? (
                  <div className="h-36 w-36 sm:h-44 sm:w-44 rounded-[1.5rem] overflow-hidden ring-1 ring-white/5 shadow-2xl shadow-black/30">
                    <img
                      src={course.cover_image_url}
                      alt={course.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex h-36 w-36 sm:h-44 sm:w-44 items-center justify-center rounded-[1.5rem] bg-card/20 ring-1 ring-border/15">
                    <BookOpen className="h-10 w-10 text-muted-foreground/30" />
                  </div>
                )}
              </motion.div>

              {/* Info */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.3 }}
                className="flex-1 min-w-0"
              >
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  {(course as any).categories?.name && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/12 bg-gold/[0.06] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-gold/55">
                      {(course as any).categories.icon}{" "}
                      {(course as any).categories.name}
                    </span>
                  )}
                  {isCourseComplete && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/15 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400/70">
                      <Trophy className="h-3 w-3" />
                      Concluído
                    </span>
                  )}
                </div>

                <h1 className="font-display text-3xl sm:text-4xl lg:text-[2.75rem] font-bold text-foreground/90 tracking-tight leading-[1.15]">
                  {course.title}
                </h1>

                {course.short_description && (
                  <p className="mt-4 max-w-2xl text-sm sm:text-[15px] leading-[1.9] text-muted-foreground/60">
                    {course.short_description}
                  </p>
                )}

                {/* Metadata pills */}
                <div className="mt-5 flex flex-wrap items-center gap-2.5">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-border/15 bg-background/50 px-3 py-1.5 text-[11px] text-muted-foreground/60 backdrop-blur">
                    <Video className="h-3 w-3 text-gold/50" />
                    {totalLessons} aula{totalLessons !== 1 ? "s" : ""}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-border/15 bg-background/50 px-3 py-1.5 text-[11px] text-muted-foreground/60 backdrop-blur">
                    <Layers className="h-3 w-3 text-gold/50" />
                    {modules.length} módulo{modules.length !== 1 ? "s" : ""}
                  </span>
                  {course.total_duration && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-border/15 bg-background/50 px-3 py-1.5 text-[11px] text-muted-foreground/60 backdrop-blur">
                      <Clock className="h-3 w-3 text-gold/50" />
                      {course.total_duration}
                    </span>
                  )}
                </div>

                {/* CTA */}
                <div className="mt-7 flex flex-wrap items-center gap-3">
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
                      className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-border/20 bg-background/60 px-6 text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground/65 backdrop-blur transition-all duration-300 hover:border-gold/25 hover:text-gold/80"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      Desbloquear curso
                    </a>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* ─── MAIN CONTENT ─── */}
        <main className="flex-1 w-full pb-28">
          <div className="mx-auto w-full max-w-[1100px] px-4 sm:px-8 lg:px-12">
            {/* Two-column layout */}
            <div className="flex flex-col lg:flex-row gap-8 lg:gap-10">
              {/* Left column — lessons */}
              <div className="flex-1 min-w-0">
                {/* ─── PROGRESS SECTION ─── */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="mb-8"
                >
                  {canAccessCourse ? (
                    <div className="rounded-[1.5rem] border border-border/15 bg-card/8 p-5 sm:p-6">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          {isCourseComplete ? (
                            <Trophy className="h-4 w-4 text-emerald-400/70" />
                          ) : (
                            <Flame className="h-4 w-4 text-gold/60" />
                          )}
                          <span className="text-sm font-semibold text-foreground/75">
                            {isCourseComplete
                              ? "Curso concluído! 🎉"
                              : "Seu progresso"}
                          </span>
                        </div>
                        <span className="text-xl font-black text-gold/80 tabular-nums">
                          {progressPercent}%
                        </span>
                      </div>

                      <Progress value={progressPercent} className="h-2 my-3" />

                      <div className="flex items-center justify-between text-[12px] text-muted-foreground/50">
                        <span>
                          {completedLessons} de {totalLessons} aula
                          {totalLessons !== 1 ? "s" : ""} concluída
                          {completedLessons !== 1 ? "s" : ""}
                        </span>
                        {primaryLesson && !isCourseComplete && (
                          <Link
                            to="/cursos/$courseId/aula/$lessonId"
                            params={{ courseId, lessonId: primaryLesson.id }}
                            className="inline-flex items-center gap-1 text-gold/60 hover:text-gold/85 font-semibold transition-colors"
                          >
                            Continuar
                            <ArrowRight className="h-3 w-3" />
                          </Link>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-[1.5rem] border border-border/15 bg-card/8 p-5 sm:p-6">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                          <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-gold/50">
                            <Lock className="h-3.5 w-3.5" />
                            Acesso restrito
                          </span>
                          <p className="mt-2 text-sm leading-relaxed text-muted-foreground/50 max-w-lg">
                            {access?.hasFreePreview
                              ? `${previewLessonsCount} aula${previewLessonsCount !== 1 ? "s" : ""} de prévia liberada${previewLessonsCount !== 1 ? "s" : ""} para você.`
                              : "Este curso requer liberação para acesso completo."}
                          </p>
                        </div>
                        {hasCheckout && (
                          <a
                            href={checkoutUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-gold/12 bg-gold/10 px-5 text-[11px] font-semibold uppercase tracking-[0.16em] text-gold/70 transition-all hover:bg-gold/18"
                          >
                            Desbloquear
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </motion.div>

                {/* ─── FULL DESCRIPTION ─── */}
                {course.full_description && (
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="mb-8 rounded-[1.5rem] border border-border/12 bg-card/6 p-5 sm:p-6"
                  >
                    <h2 className="text-[11px] font-bold uppercase tracking-[0.25em] text-muted-foreground/45 mb-4">
                      Sobre o curso
                    </h2>
                    <p className="text-[14px] leading-[2] text-muted-foreground/55 font-light whitespace-pre-line">
                      {course.full_description}
                    </p>
                  </motion.div>
                )}

                {/* ─── MODULES & LESSONS ─── */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  <div className="flex items-center gap-3 mb-5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gold/[0.07] ring-1 ring-gold/10">
                      <Layers className="h-4 w-4 text-gold/60" />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-foreground/80 tracking-tight">
                        Conteúdo do Curso
                      </h2>
                      <p className="text-[11px] text-muted-foreground/40 mt-0.5">
                        {modules.length} módulo{modules.length !== 1 ? "s" : ""}{" "}
                        · {totalLessons} aula{totalLessons !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>

                  {totalLessons === 0 ? (
                    <div className="text-center py-16 rounded-[1.5rem] border border-border/10 bg-card/5">
                      <BookOpen className="h-8 w-8 text-muted-foreground/15 mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground/40">
                        Nenhuma aula disponível ainda.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {/* Modules */}
                      {modules
                        .sort(
                          (a: any, b: any) => a.sort_order - b.sort_order
                        )
                        .map((mod: any, modIdx: number) => {
                          const modLessons = (
                            moduleMap[mod.id] || []
                          ).sort(
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
                          const isModuleComplete =
                            modCompleted === modLessons.length;
                          const hasCurrentLesson = modLessons.some(
                            (l: any) => l.id === primaryLesson?.id
                          );

                          return (
                            <div
                              key={mod.id}
                              className={`rounded-[1.25rem] border overflow-hidden transition-all duration-300 ${
                                isExpanded
                                  ? hasCurrentLesson
                                    ? "border-gold/20 bg-card/10 shadow-lg shadow-gold/[0.03] ring-1 ring-gold/5"
                                    : "border-border/20 bg-card/10 shadow-md shadow-black/5"
                                  : "border-border/12 bg-card/5 hover:border-border/20 hover:bg-card/8"
                              }`}
                            >
                              <button
                                type="button"
                                onClick={() => toggleModule(mod.id)}
                                className="w-full flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-4 text-left transition-colors"
                              >
                                {/* Module number badge */}
                                <div
                                  className={`shrink-0 flex h-11 w-11 items-center justify-center rounded-2xl text-xs font-black tabular-nums transition-all duration-300 ${
                                    isModuleComplete
                                      ? "bg-emerald-500/10 ring-1 ring-emerald-500/15 text-emerald-400/70"
                                      : isExpanded
                                        ? "bg-gold/10 ring-1 ring-gold/15 text-gold/70"
                                        : "bg-muted/5 ring-1 ring-border/15 text-muted-foreground/35"
                                  }`}
                                >
                                  {isModuleComplete ? (
                                    <CheckCircle2 className="h-5 w-5" />
                                  ) : (
                                    String(modIdx + 1).padStart(2, "0")
                                  )}
                                </div>

                                <div className="flex-1 min-w-0">
                                  <p
                                    className={`text-sm font-bold truncate transition-colors ${
                                      isExpanded
                                        ? "text-foreground/85"
                                        : "text-foreground/65"
                                    }`}
                                  >
                                    {mod.title}
                                  </p>
                                  {/* Progress bar for module */}
                                  <div className="flex items-center gap-2.5 mt-2">
                                    <div className="h-1 flex-1 max-w-[140px] rounded-full bg-muted/8 overflow-hidden">
                                      <div
                                        className={`h-full rounded-full transition-all duration-700 ${isModuleComplete ? "bg-emerald-400/50" : "bg-gold/35"}`}
                                        style={{
                                          width: `${modProgress}%`,
                                        }}
                                      />
                                    </div>
                                    <span className="text-[10px] font-bold tabular-nums text-muted-foreground/35">
                                      {modCompleted}/{modLessons.length}
                                    </span>
                                  </div>
                                </div>

                                <div
                                  className={`shrink-0 flex h-7 w-7 items-center justify-center rounded-lg transition-all duration-300 ${
                                    isExpanded
                                      ? "bg-gold/8 rotate-0"
                                      : "bg-muted/5"
                                  }`}
                                >
                                  {isExpanded ? (
                                    <ChevronDown className="h-4 w-4 text-gold/55" />
                                  ) : (
                                    <ChevronRight className="h-4 w-4 text-muted-foreground/30" />
                                  )}
                                </div>
                              </button>

                              <AnimatePresence>
                                {isExpanded && (
                                  <motion.div
                                    initial={{
                                      height: 0,
                                      opacity: 0,
                                    }}
                                    animate={{
                                      height: "auto",
                                      opacity: 1,
                                    }}
                                    exit={{
                                      height: 0,
                                      opacity: 0,
                                    }}
                                    transition={{ duration: 0.3 }}
                                    className="overflow-hidden"
                                  >
                                    <div className="border-t border-border/8 divide-y divide-border/5">
                                      {modLessons.map(
                                        (lesson: any, idx: number) =>
                                          renderLesson(lesson, idx)
                                      )}
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          );
                        })}

                      {/* Lessons without module */}
                      {unmoduled.length > 0 && (
                        <div className="rounded-[1.25rem] border border-border/12 bg-card/5 overflow-hidden">
                          {modules.length > 0 && (
                            <div className="px-5 py-3 border-b border-border/8">
                              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground/35">
                                Aulas avulsas
                              </p>
                            </div>
                          )}
                          <div className="divide-y divide-border/5">
                            {unmoduled
                              .sort(
                                (a: any, b: any) =>
                                  a.sort_order - b.sort_order
                              )
                              .map((lesson: any, idx: number) =>
                                renderLesson(lesson, idx)
                              )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              </div>

              {/* ─── RIGHT SIDEBAR (sticky) ─── */}
              <motion.aside
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, delay: 0.4 }}
                className="w-full lg:w-[300px] xl:w-[320px] shrink-0"
              >
                <div className="lg:sticky lg:top-8 space-y-5">
                  {/* Progress card */}
                  <div className="rounded-[1.5rem] border border-border/15 bg-card/8 p-5 backdrop-blur-sm">
                    <div className="text-center mb-5">
                      <div className="relative mx-auto w-24 h-24 mb-3">
                        <svg
                          className="w-full h-full -rotate-90"
                          viewBox="0 0 100 100"
                        >
                          <circle
                            cx="50"
                            cy="50"
                            r="42"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="4"
                            className="text-muted/8"
                          />
                          <circle
                            cx="50"
                            cy="50"
                            r="42"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="4"
                            strokeDasharray={`${progressPercent * 2.64} 264`}
                            strokeLinecap="round"
                            className={
                              isCourseComplete
                                ? "text-emerald-400/60"
                                : "text-gold/60"
                            }
                            style={{
                              transition: "stroke-dasharray 1s ease-out",
                            }}
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-2xl font-black text-foreground/80 tabular-nums">
                            {progressPercent}
                            <span className="text-sm font-bold text-muted-foreground/35">
                              %
                            </span>
                          </span>
                        </div>
                      </div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/45">
                        {isCourseComplete
                          ? "Curso concluído"
                          : "Progresso geral"}
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between rounded-xl bg-card/10 border border-border/8 px-4 py-3">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400/50" />
                          <span className="text-[11px] text-muted-foreground/50">
                            Concluídas
                          </span>
                        </div>
                        <span className="text-sm font-bold text-foreground/75 tabular-nums">
                          {completedLessons}/{totalLessons}
                        </span>
                      </div>

                      <div className="flex items-center justify-between rounded-xl bg-card/10 border border-border/8 px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Layers className="h-3.5 w-3.5 text-gold/40" />
                          <span className="text-[11px] text-muted-foreground/50">
                            Módulos
                          </span>
                        </div>
                        <span className="text-sm font-bold text-foreground/75 tabular-nums">
                          {modules.length}
                        </span>
                      </div>

                      {course.total_duration && (
                        <div className="flex items-center justify-between rounded-xl bg-card/10 border border-border/8 px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Clock className="h-3.5 w-3.5 text-gold/40" />
                            <span className="text-[11px] text-muted-foreground/50">
                              Duração
                            </span>
                          </div>
                          <span className="text-sm font-bold text-foreground/75">
                            {course.total_duration}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Continue button */}
                    {primaryLesson && !isCourseComplete && (
                      <Link
                        to="/cursos/$courseId/aula/$lessonId"
                        params={{
                          courseId,
                          lessonId: primaryLesson.id,
                        }}
                        className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-gold px-5 py-3 text-[11px] font-bold uppercase tracking-[0.18em] text-gold-foreground shadow-md shadow-gold/10 transition-all duration-300 hover:shadow-lg hover:shadow-gold/20 hover:brightness-110 active:scale-[0.97]"
                      >
                        <Play className="h-3.5 w-3.5 fill-current" />
                        {completedLessons > 0
                          ? "Continuar aula"
                          : "Começar curso"}
                      </Link>
                    )}
                  </div>

                  {/* Enrollment status */}
                  <div className="rounded-[1.25rem] border border-border/12 bg-card/6 px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-2.5 w-2.5 rounded-full ${
                          enrollment
                            ? "bg-emerald-400/70 shadow-sm shadow-emerald-400/20"
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
                        <p className="text-[10px] text-muted-foreground/35 mt-0.5">
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
                </div>
              </motion.aside>
            </div>
          </div>
        </main>

        <FooterLinks />
      </div>
    </StudentLayout>
  );
}
