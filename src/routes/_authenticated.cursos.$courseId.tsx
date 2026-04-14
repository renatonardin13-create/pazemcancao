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
} from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
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
  const hasCheckout = access?.hasCheckout && integration?.checkout_url;

  // Group lessons by module
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
  const courseStateLabel = canAccessCourse
    ? "Acesso liberado"
    : previewLessonsCount > 0
      ? "Prévia disponível"
      : "Acesso restrito";

  const getLessonIcon = (lesson: any) => {
    const ct = lesson.content_type || "video";
    if (ct === "pdf") return <FileText className="h-4 w-4" />;
    if (ct === "file") return <FileIcon className="h-4 w-4" />;
    if (ct === "link") return <Link2 className="h-4 w-4" />;
    return <Video className="h-4 w-4" />;
  };

  const renderLesson = (lesson: any, index: number) => {
    const completed = isLessonCompleted(lesson.id);
    const canOpenLesson = canAccessCourse || lesson.is_free_preview;

    const content = (
      <div
        className={`group/lesson flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-3.5 sm:py-4 border-b border-border/10 last:border-0 transition-all duration-300 ${
          canOpenLesson ? "hover:bg-gold/[0.03] cursor-pointer" : ""
        } ${completed ? "opacity-60" : ""}`}
      >
        {/* Number circle */}
        <div className={`shrink-0 flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold tabular-nums transition-colors duration-300 ${
          completed
            ? "bg-emerald-500/15 text-emerald-400/80 border border-emerald-500/20"
            : canOpenLesson
              ? "bg-gold/[0.06] text-gold/60 border border-gold/10 group-hover/lesson:bg-gold/10 group-hover/lesson:text-gold/80"
              : "bg-muted/10 text-muted-foreground/40 border border-border/15"
        }`}>
          {completed ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            String(index + 1).padStart(2, "0")
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <span className={`text-[13px] sm:text-sm font-medium block transition-colors duration-300 ${
            completed
              ? "text-muted-foreground/50 line-through"
              : canOpenLesson
                ? "text-foreground/75 group-hover/lesson:text-gold/80"
                : "text-muted-foreground/50"
          }`}>
            {lesson.title}
          </span>
          <div className="flex items-center gap-2.5 mt-1">
            <span className={`${completed ? "text-muted-foreground/30" : "text-muted-foreground/40"}`}>
              {getLessonIcon(lesson)}
            </span>
            {lesson.duration && lesson.duration !== "0:00" && (
              <span className="text-[11px] text-muted-foreground/40 tabular-nums">
                {lesson.duration}
              </span>
            )}
            {lesson.is_free_preview && !canAccessCourse && (
              <span className="text-[10px] font-bold uppercase tracking-wider text-gold/50 bg-gold/[0.06] px-1.5 py-0.5 rounded">
                Prévia
              </span>
            )}
            {!canOpenLesson && (
              <Lock className="h-3 w-3 text-muted-foreground/30" />
            )}
          </div>
        </div>

        {/* Actions */}
        {canOpenLesson && !completed && (
          <div className="shrink-0 opacity-0 group-hover/lesson:opacity-100 transition-opacity duration-300">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gold/10 text-gold/60">
              <Play className="h-3.5 w-3.5 fill-current ml-0.5" />
            </div>
          </div>
        )}

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
            className="shrink-0 text-[10px] uppercase tracking-wider text-muted-foreground/30 hover:text-emerald-400/60 transition-colors font-bold"
          >
            Concluir
          </button>
        )}
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

      <main className="flex-1 w-full pb-28">
        <div className="mx-auto w-full max-w-[1000px] px-4 sm:px-8 lg:px-12 pt-8 sm:pt-12">
          {/* Back link */}
          <motion.div
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6"
          >
            <Link
              to="/cursos"
              className="group inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground/50 hover:text-gold/70 transition-colors duration-300"
            >
              <ArrowLeft className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-x-1" />
              Voltar aos cursos
            </Link>
          </motion.div>
        {/* Hero */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative mb-10 overflow-hidden rounded-[2rem] border border-border/15"
        >
          {course.banner_image_url || course.cover_image_url ? (
            <>
              <img
                src={course.banner_image_url || course.cover_image_url}
                alt={course.title}
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-background/15 via-background/80 to-background" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,theme(colors.gold/20),transparent_32%)]" />
            </>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-card via-background to-background" />
          )}

          <div className="relative grid gap-8 p-6 sm:p-8 lg:grid-cols-[minmax(0,1.35fr)_320px] lg:p-10">
            <div className="max-w-3xl">
              <div className="flex flex-wrap items-center gap-2.5">
                {(course as any).categories?.name && (
                  <span className="inline-flex items-center gap-2 rounded-full border border-gold/12 bg-gold/[0.07] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.32em] text-gold/55">
                    {(course as any).categories.icon}
                    {(course as any).categories.name}
                  </span>
                )}
                <span className="inline-flex items-center gap-2 rounded-full border border-border/15 bg-background/50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-foreground/55 backdrop-blur">
                  <Sparkles className="h-3 w-3 text-gold/55" />
                  {courseStateLabel}
                </span>
              </div>

              <h1 className="mt-5 font-display text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl lg:text-[2.8rem]">
                {course.title}
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-[1.9] text-muted-foreground/75 sm:text-[15px]">
                {course.short_description || "Explore o curso, acompanhe seu progresso e avance pelas aulas no seu ritmo."}
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-3 text-xs text-muted-foreground/70">
                <span className="inline-flex items-center gap-2 rounded-full border border-border/15 bg-background/45 px-3.5 py-2 backdrop-blur">
                  <Video className="h-3.5 w-3.5 text-gold/55" />
                  {totalLessons} aula{totalLessons !== 1 ? "s" : ""}
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-border/15 bg-background/45 px-3.5 py-2 backdrop-blur">
                  <Layers className="h-3.5 w-3.5 text-gold/55" />
                  {modules.length} módulo{modules.length !== 1 ? "s" : ""}
                </span>
                {course.total_duration && (
                  <span className="inline-flex items-center gap-2 rounded-full border border-border/15 bg-background/45 px-3.5 py-2 backdrop-blur">
                    <Clock className="h-3.5 w-3.5 text-gold/55" />
                    {course.total_duration}
                  </span>
                )}
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                {primaryLesson && (
                  <Link
                    to="/cursos/$courseId/aula/$lessonId"
                    params={{ courseId, lessonId: primaryLesson.id }}
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-gold/90 px-6 text-xs font-bold uppercase tracking-[0.22em] text-gold-foreground shadow-lg shadow-gold/10 transition-all duration-300 hover:bg-gold"
                  >
                    {completedLessons > 0
                      ? "Continuar curso"
                      : canAccessCourse
                        ? "Começar curso"
                        : "Assistir prévia"}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                )}

                {!canAccessCourse && hasCheckout && (
                  <a
                    href={integration.checkout_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-border/15 bg-background/55 px-6 text-xs font-semibold uppercase tracking-[0.18em] text-foreground/70 backdrop-blur transition-all duration-300 hover:border-gold/20 hover:text-gold/80"
                  >
                    Desbloquear curso
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-border/15 bg-background/70 p-5 backdrop-blur-xl">
              <div className="flex items-start gap-4">
                {course.cover_image_url ? (
                  <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-border/15">
                    <img
                      src={course.cover_image_url}
                      alt={course.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-border/15 bg-card/20">
                    <BookOpen className="h-8 w-8 text-muted-foreground/40" />
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-gold/55">
                    Panorama do curso
                  </p>
                  <p className="mt-2 text-sm font-semibold leading-snug text-foreground/80">
                    {course.title}
                  </p>
                  <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground/55">
                    {canAccessCourse
                      ? `${completedLessons} de ${totalLessons} aulas já concluídas.`
                      : previewLessonsCount > 0
                        ? `${previewLessonsCount} aulas estão liberadas como prévia.`
                        : "Acesso completo disponível após liberação ou compra."}
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/50">
                      Progresso geral
                    </span>
                    <span className="text-sm font-bold text-gold/70 tabular-nums">
                      {progressPercent}%
                    </span>
                  </div>
                  <Progress value={progressPercent} className="h-1.5" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-border/12 bg-card/10 px-4 py-3">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground/35">
                      Aulas concluídas
                    </p>
                    <p className="mt-2 text-lg font-bold text-foreground/80 tabular-nums">
                      {completedLessons}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-border/12 bg-card/10 px-4 py-3">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground/35">
                      Matrícula
                    </p>
                    <p className="mt-2 text-sm font-bold text-foreground/80">
                      {enrollment ? "Ativa" : canAccessCourse ? "Liberado" : "Pendente"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Progress & Enrollment */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15 }}
          className="mb-10 grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]"
        >
          {!canAccessCourse ? (
            <div className="rounded-[1.75rem] border border-border/20 bg-card/15 p-5 sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-gold/50">
                    <Lock className="h-3.5 w-3.5" />
                    Curso bloqueado
                  </span>
                  <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground/55">
                    {access?.hasFreePreview
                      ? "As aulas marcadas como prévia podem ser assistidas agora. O restante segue respeitando as regras reais de acesso da plataforma."
                      : "Este curso permanece protegido até existir uma liberação válida para o aluno."}
                  </p>
                </div>

                {hasCheckout ? (
                  <a
                    href={integration.checkout_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-gold/12 bg-gold/15 px-6 text-xs font-semibold uppercase tracking-[0.18em] text-gold/75 transition-all duration-300 hover:bg-gold/22"
                  >
                    Desbloquear curso
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                ) : null}
              </div>
            </div>
          ) : (
            <div className="rounded-[1.75rem] border border-border/20 bg-card/15 p-5 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground/55">
                    Seu progresso
                  </p>
                  <p className="mt-2 text-sm text-foreground/70">
                    {completedLessons} de {totalLessons} aula{totalLessons !== 1 ? "s" : ""} concluída{completedLessons !== 1 ? "s" : ""}
                  </p>
                </div>
                {primaryLesson && (
                  <Link
                    to="/cursos/$courseId/aula/$lessonId"
                    params={{ courseId, lessonId: primaryLesson.id }}
                    className="inline-flex items-center gap-2 rounded-xl border border-border/15 bg-background/55 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-foreground/70 transition-colors hover:border-gold/20 hover:text-gold/80"
                  >
                    Ir para a próxima aula
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                )}
              </div>
              <Progress value={progressPercent} className="mt-4 h-1.5" />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-[1.5rem] border border-border/15 bg-card/10 px-5 py-4">
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/35">
                Módulos
              </p>
              <p className="mt-2 text-2xl font-bold text-foreground/80 tabular-nums">
                {modules.length}
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-border/15 bg-card/10 px-5 py-4">
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/35">
                Aulas liberadas
              </p>
              <p className="mt-2 text-2xl font-bold text-foreground/80 tabular-nums">
                {accessibleLessons.length}
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-border/15 bg-card/10 px-5 py-4">
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/35">
                Conclusão
              </p>
              <p className="mt-2 text-2xl font-bold text-foreground/80 tabular-nums">
                {progressPercent}%
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-border/15 bg-card/10 px-5 py-4">
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/35">
                Status
              </p>
              <p className="mt-2 text-sm font-bold text-foreground/80">
                {courseStateLabel}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Full description */}
        {course.full_description && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.25 }}
            className="mb-10 rounded-2xl border border-border/25 bg-card/15 p-6"
          >
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 mb-4">
              Sobre o curso
            </h2>
            <p className="text-[14px] leading-[2] text-muted-foreground/55 font-light whitespace-pre-line">
              {course.full_description}
            </p>
          </motion.div>
        )}

        {/* Lessons grouped by module */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.35 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gold/[0.06] border border-gold/10">
              <Layers className="h-4 w-4 text-gold/60" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground/80 tracking-tight">
                Conteúdo do Curso
              </h2>
              <p className="text-[11px] text-muted-foreground/40 mt-0.5">
                {modules.length} módulo{modules.length !== 1 ? "s" : ""} · {totalLessons} aula{totalLessons !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          {totalLessons === 0 ? (
            <div className="text-center py-16 rounded-2xl border border-border/15 bg-card/8">
              <BookOpen className="h-8 w-8 text-muted-foreground/20 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground/50">
                Nenhuma aula disponível ainda.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Modules */}
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
                  const modProgress = Math.round((modCompleted / modLessons.length) * 100);
                  const isModuleComplete = modCompleted === modLessons.length;

                  return (
                    <div
                      key={mod.id}
                      className={`rounded-2xl border overflow-hidden transition-all duration-300 ${
                        isExpanded
                          ? "border-gold/15 bg-card/10 shadow-lg shadow-gold/[0.02]"
                          : "border-border/15 bg-card/5 hover:border-border/25 hover:bg-card/8"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => toggleModule(mod.id)}
                        className="w-full flex items-center gap-3 sm:gap-4 px-4 sm:px-6 py-4 sm:py-5 text-left transition-colors"
                      >
                        {/* Module number */}
                        <div className={`shrink-0 flex h-10 w-10 items-center justify-center rounded-xl text-xs font-black tabular-nums transition-colors ${
                          isModuleComplete
                            ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400/70"
                            : isExpanded
                              ? "bg-gold/10 border border-gold/15 text-gold/70"
                              : "bg-muted/8 border border-border/20 text-muted-foreground/40"
                        }`}>
                          {isModuleComplete ? (
                            <CheckCircle2 className="h-5 w-5" />
                          ) : (
                            String(modIdx + 1).padStart(2, "0")
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-bold truncate transition-colors ${
                            isExpanded ? "text-foreground/85" : "text-foreground/70"
                          }`}>
                            {mod.title}
                          </p>
                          {mod.description && (
                            <p className="text-[11px] text-muted-foreground/40 mt-0.5 truncate">
                              {mod.description}
                            </p>
                          )}
                          {/* Mini progress bar */}
                          <div className="flex items-center gap-2 mt-2">
                            <div className="h-[3px] flex-1 max-w-[120px] rounded-full bg-muted/10 overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${isModuleComplete ? "bg-emerald-400/60" : "bg-gold/40"}`}
                                style={{ width: `${modProgress}%` }}
                              />
                            </div>
                            <span className="text-[10px] font-bold tabular-nums text-muted-foreground/40">
                              {modCompleted}/{modLessons.length}
                            </span>
                          </div>
                        </div>

                        <div className={`shrink-0 flex h-7 w-7 items-center justify-center rounded-lg transition-all duration-300 ${
                          isExpanded ? "bg-gold/10 rotate-0" : "bg-muted/8"
                        }`}>
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4 text-gold/60" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-muted-foreground/40" />
                          )}
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="border-t border-border/10">
                          {modLessons.map((lesson: any, idx: number) =>
                            renderLesson(lesson, idx)
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}

              {/* Lessons without module */}
              {unmoduled.length > 0 && (
                <div className="rounded-2xl border border-border/15 bg-card/5 overflow-hidden">
                  {modules.length > 0 && (
                    <div className="px-5 py-3.5 border-b border-border/10">
                      <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40">
                        Aulas avulsas
                      </p>
                    </div>
                  )}
                  {unmoduled
                    .sort((a: any, b: any) => a.sort_order - b.sort_order)
                    .map((lesson: any, idx: number) =>
                      renderLesson(lesson, idx)
                    )}
                </div>
              )}
            </div>
          )}
        </motion.div>
        </div>
      </main>

      <FooterLinks />
    </div>
    </StudentLayout>
  );
}