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
  CheckCircle2,
  Circle,
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

  const getLessonIcon = (lesson: any) => {
    const ct = lesson.content_type || "video";
    if (ct === "pdf") return <FileText className="h-3.5 w-3.5 text-muted-foreground/60" />;
    if (ct === "file") return <FileIcon className="h-3.5 w-3.5 text-muted-foreground/60" />;
    if (ct === "link") return <Link2 className="h-3.5 w-3.5 text-muted-foreground/60" />;
    return <Video className="h-3.5 w-3.5 text-muted-foreground/60" />;
  };

  const renderLesson = (lesson: any, index: number) => {
    const completed = isLessonCompleted(lesson.id);
    const canOpenLesson = canAccessCourse || lesson.is_free_preview;
    const lessonTitleClasses = `text-sm font-medium truncate block transition-colors ${
      completed
        ? "text-muted-foreground/70 line-through"
        : canOpenLesson
          ? "text-foreground/70 hover:text-gold/70"
          : "text-muted-foreground/60"
    }`;

    return (
      <div
        key={lesson.id}
        className="flex items-center gap-4 px-5 py-4 border-b border-border/20 last:border-0 transition-colors hover:bg-card/20"
      >
        <div className="shrink-0">
          {completed ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-400/60" />
          ) : (
            <Circle className="h-5 w-5 text-muted-foreground/50" />
          )}
        </div>

        <span className="text-xs font-bold text-muted-foreground/50 tabular-nums shrink-0 w-6 text-center">
          {String(index + 1).padStart(2, "0")}
        </span>

        <div className="flex-1 min-w-0">
          {canOpenLesson ? (
            <Link
              to="/cursos/$courseId/aula/$lessonId"
              params={{ courseId, lessonId: lesson.id }}
              className={lessonTitleClasses}
            >
              {lesson.title}
            </Link>
          ) : (
            <span className={lessonTitleClasses}>{lesson.title}</span>
          )}
          <div className="flex items-center gap-3 mt-1">
            {getLessonIcon(lesson)}
            {lesson.duration && lesson.duration !== "0:00" && (
              <span className="text-xs text-muted-foreground/60">
                {lesson.duration}
              </span>
            )}
            {lesson.is_free_preview && (
              <span className="text-[11px] uppercase tracking-wider text-gold/40 font-semibold">
                Preview
              </span>
            )}
            {!canOpenLesson && (
              <span className="inline-flex items-center gap-1 text-[11px] uppercase tracking-wider text-muted-foreground/60 font-semibold">
                <Lock className="h-3 w-3" />
                Bloqueada
              </span>
            )}
          </div>
        </div>

        {!completed && enrollment && (
          <button
            onClick={() =>
              progressMutation.mutate({
                lessonId: lesson.id,
                watchedSeconds: 0,
                completed: true,
              })
            }
            className="shrink-0 text-[11px] uppercase tracking-wider text-muted-foreground/50 hover:text-emerald-400/50 transition-colors font-semibold"
          >
            Concluir
          </button>
        )}
      </div>
    );
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
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-12"
        >
          {course.banner_image_url && (
            <div className="mb-6 rounded-2xl overflow-hidden aspect-[3/1] border border-border/20">
              <img
                src={course.banner_image_url}
                alt={course.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="flex items-start gap-6">
            {course.cover_image_url ? (
              <div className="hidden sm:block shrink-0 h-28 w-28 rounded-xl overflow-hidden border border-border/25">
                <img
                  src={course.cover_image_url}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="hidden sm:flex shrink-0 h-28 w-28 items-center justify-center rounded-xl border border-border/25 bg-card/15">
                <BookOpen className="h-8 w-8 text-muted-foreground/50" />
              </div>
            )}

            <div className="flex-1 min-w-0">
              {(course as any).categories?.name && (
                <span className="inline-block rounded-full bg-gold/[0.06] border border-gold/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.4em] text-gold/45 mb-3">
                  {(course as any).categories.icon}{" "}
                  {(course as any).categories.name}
                </span>
              )}

              <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground/85 tracking-tight leading-tight">
                {course.title}
              </h1>

              {course.short_description && (
                <p className="mt-3 text-[14px] leading-[1.8] text-muted-foreground/45 font-light max-w-2xl">
                  {course.short_description}
                </p>
              )}

              <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-muted-foreground/60">
                <span className="flex items-center gap-1.5">
                  <Video className="h-3.5 w-3.5" />
                  {totalLessons} aula{totalLessons !== 1 ? "s" : ""}
                </span>
                {course.total_duration && (
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    {course.total_duration}
                  </span>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Progress & Enrollment */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15 }}
          className="mb-10"
        >
          {!canAccessCourse ? (
            <div className="rounded-2xl border border-border/25 bg-card/15 p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-gold/45">
                    <Lock className="h-3.5 w-3.5" />
                    Curso bloqueado
                  </span>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground/45">
                    {access?.hasFreePreview
                      ? "Este curso possui aulas de prévia liberadas para o aluno."
                      : "Este curso só aparece para o aluno quando houver liberação ou estratégia de venda configurada."}
                  </p>
                </div>

                {hasCheckout ? (
                  <a
                    href={integration.checkout_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-gold/12 bg-gold/15 px-6 text-xs font-semibold uppercase tracking-wider text-gold/70 transition-all duration-500 hover:bg-gold/22"
                  >
                    Desbloquear curso
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                ) : null}
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-border/25 bg-card/15 p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
                  Seu progresso
                </span>
                <span className="text-[13px] font-bold text-gold/60 tabular-nums">
                  {progressPercent}%
                </span>
              </div>
              <Progress value={progressPercent} className="h-1.5" />
              <p className="mt-2.5 text-xs text-muted-foreground/60">
                {completedLessons} de {totalLessons} aula
                {totalLessons !== 1 ? "s" : ""} concluída
                {completedLessons !== 1 ? "s" : ""}
              </p>
            </div>
          )}
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
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 mb-5">
            Conteúdo do Curso
          </h2>

          {totalLessons === 0 ? (
            <div className="text-center py-12 rounded-2xl border border-border/25 bg-card/15">
              <p className="text-sm text-muted-foreground/70">
                Nenhuma aula disponível ainda.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Modules */}
              {modules
                .sort((a: any, b: any) => a.sort_order - b.sort_order)
                .map((mod: any) => {
                  const modLessons = (moduleMap[mod.id] || []).sort(
                    (a: any, b: any) => a.sort_order - b.sort_order
                  );
                  if (modLessons.length === 0) return null;

                  const isExpanded = expandedModules.has(mod.id);
                  const modCompleted = modLessons.filter((l: any) =>
                    isLessonCompleted(l.id)
                  ).length;

                  return (
                    <div
                      key={mod.id}
                      className="rounded-2xl border border-border/25 overflow-hidden"
                    >
                      <button
                        type="button"
                        onClick={() => toggleModule(mod.id)}
                        className="w-full flex items-center gap-3 px-5 py-4 hover:bg-card/20 transition-colors text-left"
                      >
                        <div className="shrink-0 w-6 h-6 flex items-center justify-center rounded-lg bg-card/20 border border-border/25">
                          {isExpanded ? (
                            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground/70" />
                          ) : (
                            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/70" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground/80 truncate">
                            {mod.title}
                          </p>
                          {mod.description && (
                            <p className="text-xs text-muted-foreground/60 mt-0.5 truncate">
                              {mod.description}
                            </p>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground/60 shrink-0">
                          {modCompleted}/{modLessons.length}
                        </span>
                      </button>

                      {isExpanded && (
                        <div className="border-t border-border/20">
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
                <div className="rounded-2xl border border-border/25 overflow-hidden">
                  {modules.length > 0 && (
                    <div className="px-5 py-3 border-b border-border/20">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">
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