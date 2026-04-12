import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCourseDetail,
  updateLessonProgress,
  enrollInCourse,
} from "@/lib/courses.functions";
import {
  ArrowLeft,
  Play,
  Pause,
  CheckCircle2,
  Circle,
  Clock,
  BookOpen,
  Video,
} from "lucide-react";
import { useState, useRef, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/_authenticated/cursos/$courseId")({
  component: CourseDetailPage,
  notFoundComponent: () => (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <p className="text-muted-foreground/50">Curso não encontrado.</p>
        <Link
          to="/musicas"
          className="mt-4 inline-block text-gold/50 hover:text-gold/80 text-sm"
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

  const [playingLessonId, setPlayingLessonId] = useState<string | null>(null);
  const [loadingLessonId, setLoadingLessonId] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const enrollMutation = useMutation({
    mutationFn: () => enrollInCourse({ data: { courseId } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course-detail", courseId] });
      toast.success("Matrícula realizada!");
    },
    onError: (err: any) => toast.error(err.message),
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

  const handlePlay = useCallback(
    (lessonId: string, videoUrl: string) => {
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      }

      if (playingLessonId === lessonId) {
        setPlayingLessonId(null);
        return;
      }

      setLoadingLessonId(lessonId);
      const video = document.createElement("video") as HTMLVideoElement;
      video.src = videoUrl;
      video.preload = "auto";
      videoRef.current = video;

      video.addEventListener(
        "canplaythrough",
        () => {
          setLoadingLessonId(null);
          setPlayingLessonId(lessonId);
        },
        { once: true }
      );

      video.addEventListener("error", () => {
        setLoadingLessonId(null);
        videoRef.current = null;
        toast.error("Erro ao carregar o vídeo");
      });

      video.onended = () => {
        setPlayingLessonId(null);
        videoRef.current = null;
        progressMutation.mutate({
          lessonId,
          watchedSeconds: Math.floor(video.duration || 0),
          completed: true,
        });
      };

      video.play().catch(() => {
        setLoadingLessonId(null);
        toast.error("Erro ao reproduzir");
      });
    },
    [playingLessonId, progressMutation]
  );

  useEffect(() => {
    return () => {
      videoRef.current?.pause();
      videoRef.current = null;
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-[11px] uppercase tracking-[0.4em] text-muted-foreground/25 animate-pulse">
          Carregando curso...
        </p>
      </div>
    );
  }

  if (error || !data?.course) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-muted-foreground/50">Erro ao carregar o curso.</p>
          <Link
            to="/musicas"
            className="mt-4 inline-block text-gold/50 hover:text-gold/80 text-sm"
          >
            Voltar
          </Link>
        </div>
      </div>
    );
  }

  const { course, lessons, progress, enrollment } = data;

  const completedLessons = progress.filter((p: any) => p.completed).length;
  const totalLessons = lessons.length;
  const progressPercent =
    totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  const isLessonCompleted = (lessonId: string) =>
    progress.some((p: any) => p.lesson_id === lessonId && p.completed);

  return (
    <div className="min-h-screen bg-background pb-32 relative">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_30%,var(--color-gold)/0.03,transparent_70%)]" />

      {/* Back button */}
      <motion.div
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="fixed top-6 left-6 z-30"
      >
        <Link
          to="/musicas"
          className="group flex items-center gap-2.5 text-[10px] font-semibold uppercase tracking-[0.3em] text-muted-foreground/30 hover:text-gold/50 transition-colors duration-500"
        >
          <ArrowLeft className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-x-1" />
          Voltar
        </Link>
      </motion.div>

      <div className="mx-auto max-w-4xl px-6 pt-24 sm:pt-32">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-12"
        >
          {/* Banner */}
          {course.banner_image_url && (
            <div className="mb-8 rounded-2xl overflow-hidden aspect-[21/9] border border-border/10">
              <img
                src={course.banner_image_url}
                alt={course.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="flex items-start gap-6">
            {/* Cover */}
            {course.cover_image_url ? (
              <div className="hidden sm:block shrink-0 h-28 w-28 rounded-xl overflow-hidden border border-border/10">
                <img
                  src={course.cover_image_url}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="hidden sm:flex shrink-0 h-28 w-28 items-center justify-center rounded-xl border border-border/10 bg-card/15">
                <BookOpen className="h-8 w-8 text-muted-foreground/15" />
              </div>
            )}

            <div className="flex-1 min-w-0">
              {(course as any).categories?.name && (
                <span className="inline-block rounded-full bg-gold/[0.06] border border-gold/10 px-3 py-1 text-[9px] font-semibold uppercase tracking-[0.4em] text-gold/45 mb-3">
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

              <div className="mt-4 flex flex-wrap items-center gap-4 text-[11px] text-muted-foreground/30">
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
          {!enrollment ? (
            <button
              onClick={() => enrollMutation.mutate()}
              disabled={enrollMutation.isPending}
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl h-12 px-8 text-[11px] font-semibold uppercase tracking-wider bg-gold/15 text-gold/70 border border-gold/12 hover:bg-gold/22 transition-all duration-500 disabled:opacity-50"
            >
              {enrollMutation.isPending
                ? "Matriculando..."
                : "Começar este curso"}
            </button>
          ) : (
            <div className="rounded-2xl border border-border/10 bg-card/5 p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/40">
                  Seu progresso
                </span>
                <span className="text-[13px] font-bold text-gold/60 tabular-nums">
                  {progressPercent}%
                </span>
              </div>
              <Progress value={progressPercent} className="h-1.5" />
              <p className="mt-2.5 text-[11px] text-muted-foreground/25">
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
            className="mb-10 rounded-2xl border border-border/10 bg-card/5 p-6"
          >
            <h2 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/40 mb-4">
              Sobre o curso
            </h2>
            <p className="text-[14px] leading-[2] text-muted-foreground/55 font-light whitespace-pre-line">
              {course.full_description}
            </p>
          </motion.div>
        )}

        {/* Lesson List */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.35 }}
        >
          <h2 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/40 mb-5">
            Aulas
          </h2>

          {lessons.length === 0 ? (
            <div className="text-center py-12 rounded-2xl border border-border/10 bg-card/5">
              <p className="text-sm text-muted-foreground/35">
                Nenhuma aula disponível ainda.
              </p>
            </div>
          ) : (
            <div className="rounded-2xl border border-border/10 overflow-hidden">
              {lessons.map((lesson: any, index: number) => {
                const completed = isLessonCompleted(lesson.id);
                const isPlaying = playingLessonId === lesson.id;
                const isLoadingLesson = loadingLessonId === lesson.id;
                const hasVideo = !!lesson.video_url;

                return (
                  <div
                    key={lesson.id}
                    className={`flex items-center gap-4 px-5 py-4 border-b border-border/8 last:border-0 transition-colors ${
                      isPlaying
                        ? "bg-gold/[0.04]"
                        : "hover:bg-card/10"
                    }`}
                  >
                    {/* Status icon */}
                    <div className="shrink-0">
                      {completed ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-400/60" />
                      ) : (
                        <Circle className="h-5 w-5 text-muted-foreground/15" />
                      )}
                    </div>

                    {/* Lesson number */}
                    <span className="text-[10px] font-bold text-muted-foreground/15 tabular-nums shrink-0 w-6 text-center">
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <Link
                        to="/cursos/$courseId/aula/$lessonId"
                        params={{ courseId, lessonId: lesson.id }}
                        className={`text-sm font-medium truncate block hover:text-gold/70 transition-colors ${
                          completed
                            ? "text-muted-foreground/40 line-through"
                            : "text-foreground/70"
                        }`}
                      >
                        {lesson.title}
                      </Link>
                      <div className="flex items-center gap-3 mt-1">
                        {lesson.duration && (
                          <span className="text-[10px] text-muted-foreground/25">
                            {lesson.duration}
                          </span>
                        )}
                        {lesson.is_free_preview && (
                          <span className="text-[9px] uppercase tracking-wider text-gold/40 font-semibold">
                            Preview
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Play button */}
                    {hasVideo && (
                      <button
                        onClick={() =>
                          handlePlay(lesson.id, lesson.video_url!)
                        }
                        disabled={isLoadingLesson}
                        className={`shrink-0 flex items-center justify-center h-9 w-9 rounded-full border transition-all duration-500 ${
                          isPlaying
                            ? "bg-gold/20 border-gold/25 text-gold/70"
                            : "border-border/12 text-muted-foreground/25 hover:border-gold/20 hover:text-gold/50 hover:bg-gold/[0.04]"
                        } disabled:opacity-40`}
                      >
                        {isLoadingLesson ? (
                          <div className="h-3.5 w-3.5 border-2 border-gold/30 border-t-transparent rounded-full animate-spin" />
                        ) : isPlaying ? (
                          <Pause className="h-3.5 w-3.5" />
                        ) : (
                          <Play className="h-3.5 w-3.5 ml-0.5" />
                        )}
                      </button>
                    )}

                    {/* Mark as complete */}
                    {!completed && enrollment && (
                      <button
                        onClick={() =>
                          progressMutation.mutate({
                            lessonId: lesson.id,
                            watchedSeconds: 0,
                            completed: true,
                          })
                        }
                        className="shrink-0 text-[9px] uppercase tracking-wider text-muted-foreground/20 hover:text-emerald-400/50 transition-colors font-semibold"
                      >
                        Concluir
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
