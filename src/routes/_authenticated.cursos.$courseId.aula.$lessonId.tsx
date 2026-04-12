import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getLessonDetail } from "@/lib/lesson-detail.functions";
import { updateLessonProgress } from "@/lib/courses.functions";
import { useState, useRef, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Circle,
  ChevronLeft,
  Play,
  Pause,
  Download,
  ExternalLink,
  FileText,
  Video,
  Link2,
  File,
  BookOpen,
} from "lucide-react";

export const Route = createFileRoute(
  "/_authenticated/cursos/$courseId/aula/$lessonId"
)({
  component: LessonDetailPage,
  notFoundComponent: () => (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <p className="text-muted-foreground/50">Aula não encontrada.</p>
    </div>
  ),
});

function LessonDetailPage() {
  const { courseId, lessonId } = Route.useParams();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["lesson-detail", courseId, lessonId],
    queryFn: () => getLessonDetail({ data: { courseId, lessonId } }),
  });

  const progressMutation = useMutation({
    mutationFn: (input: {
      lessonId: string;
      watchedSeconds: number;
      completed: boolean;
    }) => updateLessonProgress({ data: { courseId, ...input } }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["lesson-detail", courseId, lessonId],
      });
      queryClient.invalidateQueries({ queryKey: ["course-detail", courseId] });
      toast.success("Progresso atualizado!");
    },
  });

  // Video player state
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    return () => {
      videoRef.current?.pause();
      videoRef.current = null;
    };
  }, [lessonId]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-[11px] uppercase tracking-[0.4em] text-muted-foreground/25 animate-pulse">
          Carregando aula...
        </p>
      </div>
    );
  }

  if (error || !data?.lesson) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-muted-foreground/50">Erro ao carregar a aula.</p>
          <Link
            to="/cursos/$courseId"
            params={{ courseId }}
            className="mt-4 inline-block text-gold/50 hover:text-gold/80 text-sm"
          >
            Voltar ao curso
          </Link>
        </div>
      </div>
    );
  }

  const {
    course,
    lesson,
    lessons,
    modules,
    moduleMap,
    unmoduled,
    progress,
    enrollment,
    prevLesson,
    nextLesson,
    currentIndex,
    completedCount,
    totalLessons,
  } = data;

  const progressPercent =
    totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  const isCompleted = progress.some(
    (p: any) => p.lesson_id === lessonId && p.completed
  );

  const isLessonCompleted = (id: string) =>
    progress.some((p: any) => p.lesson_id === id && p.completed);

  // Determine content type
  const videoUrl = lesson.video_url ?? "";
  const contentUrl = lesson.content_url ?? "";
  const hasVideo = !!videoUrl;
  const hasContentUrl = !!contentUrl;
  const isYouTube =
    hasVideo &&
    (videoUrl.includes("youtube.com") || videoUrl.includes("youtu.be"));
  const isVimeo = hasVideo && videoUrl.includes("vimeo.com");
  const isPdf = hasContentUrl && contentUrl.toLowerCase().endsWith(".pdf");
  const isExternalLink =
    hasContentUrl &&
    (contentUrl.startsWith("http://") || contentUrl.startsWith("https://")) &&
    !isPdf;
  const isDownloadableFile = hasContentUrl && !isPdf && !isExternalLink;

  // YouTube embed URL
  const getYouTubeEmbedUrl = (url: string) => {
    const match = url.match(
      /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]+)/
    );
    return match ? `https://www.youtube.com/embed/${match[1]}` : url;
  };

  const getVimeoEmbedUrl = (url: string) => {
    const match = url.match(/vimeo\.com\/(\d+)/);
    return match ? `https://player.vimeo.com/video/${match[1]}` : url;
  };

  const handleDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("Fetch failed");
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch {
      window.open(url, "_blank");
    }
  };

  return (
    <div className="min-h-screen bg-background pb-32">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_30%,var(--color-gold)/0.03,transparent_70%)]" />

      {/* Top bar */}
      <div className="sticky top-0 z-30 border-b border-border/10 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl flex items-center gap-4 px-4 sm:px-6 h-14">
          <Link
            to="/cursos/$courseId"
            params={{ courseId }}
            className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-muted-foreground/30 hover:text-gold/50 transition-colors"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            {course.title}
          </Link>
          <div className="flex-1" />
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground/30">
            <span className="tabular-nums font-semibold text-gold/50">
              {progressPercent}%
            </span>
            <Progress value={progressPercent} className="h-1 w-24" />
            <span>
              {completedCount}/{totalLessons}
            </span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-6 flex flex-col lg:flex-row gap-6">
        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Video player */}
          {hasVideo && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              {isYouTube || isVimeo ? (
                <div className="rounded-2xl overflow-hidden border border-border/10 aspect-video bg-black">
                  <iframe
                    src={
                      isYouTube
                        ? getYouTubeEmbedUrl(lesson.video_url)
                        : getVimeoEmbedUrl(lesson.video_url)
                    }
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title={lesson.title}
                  />
                </div>
              ) : (
                <div className="rounded-2xl overflow-hidden border border-border/10 bg-black">
                  <video
                    ref={videoRef}
                    src={lesson.video_url}
                    controls
                    className="w-full aspect-video"
                    onEnded={() => {
                      if (!isCompleted) {
                        progressMutation.mutate({
                          lessonId,
                          watchedSeconds: Math.floor(
                            videoRef.current?.duration || 0
                          ),
                          completed: true,
                        });
                      }
                    }}
                  />
                </div>
              )}
            </motion.div>
          )}

          {/* PDF viewer */}
          {isPdf && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <div className="rounded-2xl overflow-hidden border border-border/10 bg-card/5">
                <iframe
                  src={lesson.content_url}
                  className="w-full h-[70vh]"
                  title={lesson.title}
                />
                <div className="flex items-center justify-center gap-3 p-4 border-t border-border/8">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 text-xs"
                    onClick={() =>
                      window.open(lesson.content_url, "_blank")
                    }
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Abrir em nova aba
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 text-xs"
                    onClick={() =>
                      handleDownload(
                        lesson.content_url,
                        `${lesson.title}.pdf`
                      )
                    }
                  >
                    <Download className="h-3.5 w-3.5" />
                    Baixar PDF
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* External link */}
          {isExternalLink && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 rounded-2xl border border-border/10 bg-card/5 p-8 text-center"
            >
              <Link2 className="mx-auto h-10 w-10 text-gold/30 mb-4" />
              <p className="text-sm text-muted-foreground/50 mb-4">
                Esta aula contém um link externo
              </p>
              <Button
                className="gap-2 bg-gold/15 text-gold/70 border border-gold/12 hover:bg-gold/22"
                onClick={() => window.open(lesson.content_url, "_blank")}
              >
                <ExternalLink className="h-4 w-4" />
                Acessar conteúdo
              </Button>
            </motion.div>
          )}

          {/* Downloadable file */}
          {isDownloadableFile && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 rounded-2xl border border-border/10 bg-card/5 p-8 text-center"
            >
              <File className="mx-auto h-10 w-10 text-gold/30 mb-4" />
              <p className="text-sm text-muted-foreground/50 mb-4">
                Material disponível para download
              </p>
              <Button
                className="gap-2 bg-gold/15 text-gold/70 border border-gold/12 hover:bg-gold/22"
                onClick={() =>
                  handleDownload(lesson.content_url, lesson.title)
                }
              >
                <Download className="h-4 w-4" />
                Baixar arquivo
              </Button>
            </motion.div>
          )}

          {/* No content fallback */}
          {!hasVideo && !hasContentUrl && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 rounded-2xl border border-border/10 bg-card/5 p-8 text-center"
            >
              <BookOpen className="mx-auto h-10 w-10 text-muted-foreground/15 mb-4" />
              <p className="text-sm text-muted-foreground/35">
                Conteúdo em breve.
              </p>
            </motion.div>
          )}

          {/* Lesson info */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="font-display text-xl sm:text-2xl font-bold text-foreground/85 tracking-tight">
                  {lesson.title}
                </h1>
                {lesson.description && (
                  <p className="mt-3 text-[14px] leading-[1.8] text-muted-foreground/45 font-light whitespace-pre-line">
                    {lesson.description}
                  </p>
                )}
                <div className="flex items-center gap-3 mt-3">
                  {lesson.duration && lesson.duration !== "0:00" && (
                    <span className="text-[11px] text-muted-foreground/30 flex items-center gap-1">
                      <Video className="h-3 w-3" />
                      {lesson.duration}
                    </span>
                  )}
                  {lesson.is_free_preview && (
                    <Badge
                      variant="outline"
                      className="text-[9px] text-gold/50 border-gold/15"
                    >
                      Preview gratuito
                    </Badge>
                  )}
                  {isCompleted && (
                    <Badge
                      variant="outline"
                      className="text-[9px] text-emerald-400/60 border-emerald-500/15"
                    >
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Concluída
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Supplementary materials */}
          {lesson.content_url && hasVideo && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-6 rounded-2xl border border-border/10 bg-card/5 p-5"
            >
              <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/40 mb-3">
                Materiais Complementares
              </h3>
              <div className="space-y-2">
                <div className="flex items-center gap-3 rounded-xl bg-muted/5 border border-border/8 px-4 py-3">
                  <FileText className="h-4 w-4 text-gold/40 shrink-0" />
                  <span className="text-sm text-foreground/60 flex-1 truncate">
                    {isPdf ? "Arquivo PDF" : isExternalLink ? "Link externo" : "Arquivo"}
                  </span>
                  {isPdf || isDownloadableFile ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 gap-1.5 text-[10px] text-gold/50 hover:text-gold/80"
                      onClick={() =>
                        handleDownload(
                          lesson.content_url,
                          `${lesson.title}${isPdf ? ".pdf" : ""}`
                        )
                      }
                    >
                      <Download className="h-3 w-3" />
                      Baixar
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 gap-1.5 text-[10px] text-gold/50 hover:text-gold/80"
                      onClick={() =>
                        window.open(lesson.content_url, "_blank")
                      }
                    >
                      <ExternalLink className="h-3 w-3" />
                      Acessar
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Navigation buttons */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
          >
            {prevLesson ? (
              <Link
                to="/cursos/$courseId/aula/$lessonId"
                params={{ courseId, lessonId: prevLesson.id }}
                className="flex items-center gap-2 rounded-xl border border-border/10 bg-card/5 px-4 py-3 text-sm text-muted-foreground/50 hover:bg-card/15 hover:text-foreground/70 transition-colors"
              >
                <ArrowLeft className="h-4 w-4 shrink-0" />
                <span className="truncate">{prevLesson.title}</span>
              </Link>
            ) : (
              <div />
            )}

            <div className="flex-1" />

            {enrollment && !isCompleted && (
              <Button
                onClick={() =>
                  progressMutation.mutate({
                    lessonId,
                    watchedSeconds: 0,
                    completed: true,
                  })
                }
                disabled={progressMutation.isPending}
                className="gap-2 bg-emerald-500/15 text-emerald-400/70 border border-emerald-500/12 hover:bg-emerald-500/22"
                variant="outline"
              >
                <CheckCircle2 className="h-4 w-4" />
                {progressMutation.isPending
                  ? "Salvando..."
                  : "Marcar como concluída"}
              </Button>
            )}

            {nextLesson ? (
              <Link
                to="/cursos/$courseId/aula/$lessonId"
                params={{ courseId, lessonId: nextLesson.id }}
                className="flex items-center gap-2 rounded-xl border border-gold/15 bg-gold/[0.06] px-4 py-3 text-sm text-gold/60 hover:bg-gold/12 hover:text-gold/80 transition-colors"
              >
                <span className="truncate">{nextLesson.title}</span>
                <ArrowRight className="h-4 w-4 shrink-0" />
              </Link>
            ) : (
              <div />
            )}
          </motion.div>
        </div>

        {/* Sidebar - Module list */}
        <aside className="w-full lg:w-80 shrink-0">
          <div className="lg:sticky lg:top-20">
            {/* Progress card */}
            <div className="rounded-2xl border border-border/10 bg-card/5 p-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/35">
                  Progresso
                </span>
                <span className="text-[12px] font-bold text-gold/55 tabular-nums">
                  {progressPercent}%
                </span>
              </div>
              <Progress value={progressPercent} className="h-1.5 mb-2" />
              <p className="text-[10px] text-muted-foreground/25">
                {completedCount} de {totalLessons} aula
                {totalLessons !== 1 ? "s" : ""} concluída
                {completedCount !== 1 ? "s" : ""}
              </p>
            </div>

            {/* Lesson list */}
            <div className="rounded-2xl border border-border/10 overflow-hidden max-h-[60vh] overflow-y-auto">
              {modules.length > 0
                ? modules.map((mod: any) => {
                    const modLessons = (moduleMap[mod.id] || []) as any[];
                    if (modLessons.length === 0) return null;
                    return (
                      <div key={mod.id}>
                        <div className="px-4 py-2.5 bg-card/10 border-b border-border/8">
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/35">
                            {mod.title}
                          </p>
                        </div>
                        {modLessons.map((l: any) => (
                          <LessonSidebarItem
                            key={l.id}
                            lesson={l}
                            courseId={courseId}
                            isActive={l.id === lessonId}
                            isCompleted={isLessonCompleted(l.id)}
                          />
                        ))}
                      </div>
                    );
                  })
                : null}

              {unmoduled.length > 0 && (
                <>
                  {modules.length > 0 && (
                    <div className="px-4 py-2.5 bg-card/10 border-b border-border/8">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/35">
                        Aulas
                      </p>
                    </div>
                  )}
                  {unmoduled.map((l: any) => (
                    <LessonSidebarItem
                      key={l.id}
                      lesson={l}
                      courseId={courseId}
                      isActive={l.id === lessonId}
                      isCompleted={isLessonCompleted(l.id)}
                    />
                  ))}
                </>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function LessonSidebarItem({
  lesson,
  courseId,
  isActive,
  isCompleted,
}: {
  lesson: any;
  courseId: string;
  isActive: boolean;
  isCompleted: boolean;
}) {
  return (
    <Link
      to="/cursos/$courseId/aula/$lessonId"
      params={{ courseId, lessonId: lesson.id }}
      className={`flex items-center gap-3 px-4 py-3 border-b border-border/5 last:border-0 transition-colors text-left ${
        isActive
          ? "bg-gold/[0.06] border-l-2 border-l-gold/30"
          : "hover:bg-card/10"
      }`}
    >
      <div className="shrink-0">
        {isCompleted ? (
          <CheckCircle2 className="h-4 w-4 text-emerald-400/60" />
        ) : (
          <Circle
            className={`h-4 w-4 ${isActive ? "text-gold/40" : "text-muted-foreground/15"}`}
          />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p
          className={`text-[12px] font-medium truncate ${
            isActive
              ? "text-gold/70"
              : isCompleted
                ? "text-muted-foreground/35 line-through"
                : "text-foreground/60"
          }`}
        >
          {lesson.title}
        </p>
        {lesson.duration && lesson.duration !== "0:00" && (
          <span className="text-[10px] text-muted-foreground/20">
            {lesson.duration}
          </span>
        )}
      </div>
    </Link>
  );
}
