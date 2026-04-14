import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getLessonDetail } from "@/lib/lesson-detail.functions";
import { updateLessonProgress } from "@/lib/courses.functions";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Circle,
  ChevronLeft,
  ChevronUp,
  ChevronDown,
  Play,
  Download,
  ExternalLink,
  FileText,
  Video,
  Link2,
  File,
  BookOpen,
  Clock,
  Award,
  Sparkles,
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
        <div className="text-center">
          <div className="w-px h-12 mx-auto bg-gradient-to-b from-transparent via-gold/20 to-transparent animate-pulse mb-4" />
          <p className="text-[11px] uppercase tracking-[0.4em] text-muted-foreground/25 animate-pulse">
            Carregando aula...
          </p>
        </div>
      </div>
    );
  }

  if (error || !data?.lesson) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <BookOpen className="mx-auto mb-4 h-10 w-10 text-muted-foreground/15" />
          <p className="text-muted-foreground/50 mb-4">Erro ao carregar a aula.</p>
          <Link
            to="/cursos/$courseId"
            params={{ courseId }}
            className="inline-flex items-center gap-2 text-gold/50 hover:text-gold/80 text-sm transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
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
    materials,
    accessRestricted,
    checkoutUrl,
  } = data;

  const progressPercent =
    totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  const isCompleted = progress.some(
    (p: any) => p.lesson_id === lessonId && p.completed
  );

  const isLessonCompleted = (id: string) =>
    progress.some((p: any) => p.lesson_id === id && p.completed);

  const contentType = lesson.content_type || "video";
  const videoUrl = lesson.video_url ?? "";
  const contentUrl = lesson.content_url ?? "";
  const hasVideo = contentType === "video" && !!videoUrl;
  const isPdf = contentType === "pdf" && !!contentUrl;
  const isEbook = contentType === "ebook" && !!contentUrl;
  const isDownloadableFile = contentType === "file" && !!contentUrl;
  const isExternalLink = contentType === "link" && !!contentUrl;
  const hasContentUrl = !!contentUrl;
  const isYouTube =
    hasVideo &&
    (videoUrl.includes("youtube.com") || videoUrl.includes("youtu.be"));
  const isVimeo = hasVideo && videoUrl.includes("vimeo.com");

  const isCourseCompleted = progressPercent >= 100;

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

  const legacySupplementaryMaterial =
    hasVideo && hasContentUrl
      ? {
          id: "legacy-content-url",
          title: lesson.title,
          material_type: isExternalLink ? "link" : isPdf ? "pdf" : "file",
          url: contentUrl,
        }
      : null;

  const displayedMaterials = legacySupplementaryMaterial
    ? [legacySupplementaryMaterial, ...(materials || [])]
    : materials || [];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-border/8 bg-background/90 backdrop-blur-xl">
        <div className="mx-auto max-w-[1600px] flex items-center gap-4 px-4 sm:px-6 h-14">
          <Link
            to="/cursos/$courseId"
            params={{ courseId }}
            className="flex items-center gap-2 text-[11px] font-semibold text-muted-foreground/40 hover:text-gold/60 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Voltar à Vitrine</span>
          </Link>
          <div className="flex-1" />
          <div className="flex items-center gap-3">
            <span className="text-[11px] text-muted-foreground/30 hidden sm:inline">
              {completedCount}/{totalLessons} aulas
            </span>
            <Progress value={progressPercent} className="h-1.5 w-20 sm:w-28" />
            <span className="text-sm font-bold text-gold/60 tabular-nums">
              {progressPercent}%
            </span>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Left: Content area */}
        <main className="flex-1 min-w-0">
          {/* Access restricted */}
          {accessRestricted && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center justify-center min-h-[60vh] p-6"
            >
              <div className="max-w-md text-center">
                <div className="mx-auto mb-6 h-20 w-20 rounded-2xl bg-gold/10 border border-gold/15 flex items-center justify-center">
                  <BookOpen className="h-8 w-8 text-gold/40" />
                </div>
                <h1 className="font-display text-2xl font-bold tracking-tight text-foreground mb-3">
                  Aula bloqueada
                </h1>
                <p className="text-[14px] leading-relaxed text-muted-foreground/45 mb-6">
                  Esta aula requer a liberação do curso. Adquira o acesso completo para continuar.
                </p>
                <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                  {checkoutUrl && (
                    <a
                      href={checkoutUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-xl bg-gold/90 text-gold-foreground px-6 py-3 text-sm font-bold uppercase tracking-wider hover:bg-gold transition-colors"
                    >
                      <Sparkles className="h-4 w-4" />
                      Desbloquear curso
                    </a>
                  )}
                  <Link
                    to="/cursos/$courseId"
                    params={{ courseId }}
                    className="inline-flex items-center gap-2 rounded-xl border border-border/15 bg-card/10 px-5 py-3 text-sm font-semibold text-muted-foreground/50 hover:text-foreground/90 transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Voltar ao curso
                  </Link>
                </div>
              </div>
            </motion.div>
          )}

          {/* Video player */}
          {!accessRestricted && hasVideo && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {isYouTube || isVimeo ? (
                <div className="w-full aspect-video bg-black border-b border-border/8">
                  <iframe
                    src={
                      isYouTube
                        ? getYouTubeEmbedUrl(videoUrl)
                        : getVimeoEmbedUrl(videoUrl)
                    }
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title={lesson.title}
                  />
                </div>
              ) : (
                <div className="w-full bg-black border-b border-border/8">
                  <video
                    ref={videoRef}
                    src={videoUrl}
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

          {/* PDF / Ebook reader */}
          {!accessRestricted && (isPdf || isEbook) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-full border-b border-border/8"
            >
              <div className="bg-card/5">
                <iframe
                  src={contentUrl}
                  className="w-full h-[80vh]"
                  title={lesson.title}
                />
                <div className="flex items-center justify-center gap-3 p-3 border-t border-border/8 bg-card/8">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 text-[11px] border-border/15"
                    onClick={() => window.open(contentUrl, "_blank")}
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Abrir em nova aba
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 text-[11px] border-border/15"
                    onClick={() =>
                      handleDownload(contentUrl, `${lesson.title}.pdf`)
                    }
                  >
                    <Download className="h-3.5 w-3.5" />
                    Baixar
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* External link */}
          {!accessRestricted && isExternalLink && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-center min-h-[40vh] p-6"
            >
              <div className="text-center">
                <div className="mx-auto mb-5 h-16 w-16 rounded-2xl bg-gold/10 border border-gold/15 flex items-center justify-center">
                  <Link2 className="h-7 w-7 text-gold/40" />
                </div>
                <p className="text-sm text-muted-foreground/50 mb-4">
                  Esta aula contém um link externo
                </p>
                <Button
                  className="gap-2 bg-gold/90 text-gold-foreground hover:bg-gold"
                  onClick={() => window.open(contentUrl, "_blank")}
                >
                  <ExternalLink className="h-4 w-4" />
                  Acessar conteúdo
                </Button>
              </div>
            </motion.div>
          )}

          {/* Downloadable file */}
          {!accessRestricted && isDownloadableFile && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-center min-h-[40vh] p-6"
            >
              <div className="text-center">
                <div className="mx-auto mb-5 h-16 w-16 rounded-2xl bg-gold/10 border border-gold/15 flex items-center justify-center">
                  <File className="h-7 w-7 text-gold/40" />
                </div>
                <p className="text-sm text-muted-foreground/50 mb-4">
                  Material disponível para download
                </p>
                <Button
                  className="gap-2 bg-gold/90 text-gold-foreground hover:bg-gold"
                  onClick={() => handleDownload(contentUrl, lesson.title)}
                >
                  <Download className="h-4 w-4" />
                  Baixar arquivo
                </Button>
              </div>
            </motion.div>
          )}

          {/* No content fallback */}
          {!accessRestricted && !hasVideo && !hasContentUrl && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center min-h-[40vh] p-6"
            >
              <div className="text-center">
                <BookOpen className="mx-auto h-10 w-10 text-muted-foreground/15 mb-4" />
                <p className="text-sm text-muted-foreground/35">
                  Conteúdo em breve.
                </p>
              </div>
            </motion.div>
          )}

          {/* Lesson info + materials + nav */}
          {!accessRestricted && (
            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
              {/* Title and description */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <h1 className="font-display text-xl sm:text-2xl font-bold text-foreground/90 tracking-tight uppercase">
                  {lesson.title}
                </h1>
                {lesson.description && (
                  <p className="mt-3 text-[14px] leading-[1.8] text-muted-foreground/50 whitespace-pre-line">
                    {lesson.description}
                  </p>
                )}
                <div className="flex items-center gap-3 mt-3 flex-wrap">
                  {lesson.duration && lesson.duration !== "0:00" && (
                    <span className="text-[11px] text-muted-foreground/35 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {lesson.duration}
                    </span>
                  )}
                  {lesson.is_free_preview && (
                    <Badge
                      variant="outline"
                      className="text-[11px] text-gold/50 border-gold/15"
                    >
                      Preview gratuito
                    </Badge>
                  )}
                </div>
              </motion.div>

              {/* Supplementary materials */}
              {displayedMaterials.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="rounded-xl border border-border/10 bg-card/5 p-4"
                >
                  <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/40 mb-3">
                    Materiais Complementares
                  </h3>
                  <div className="space-y-2">
                    {displayedMaterials.map((mat: any) => (
                      <div
                        key={mat.id}
                        className="flex items-center gap-3 rounded-lg bg-muted/5 border border-border/8 px-4 py-3"
                      >
                        {mat.material_type === "pdf" ? (
                          <FileText className="h-4 w-4 text-gold/40 shrink-0" />
                        ) : mat.material_type === "link" ? (
                          <ExternalLink className="h-4 w-4 text-gold/40 shrink-0" />
                        ) : (
                          <File className="h-4 w-4 text-gold/40 shrink-0" />
                        )}
                        <span className="flex-1 text-sm text-foreground/60 truncate">
                          {mat.title}
                        </span>
                        {mat.material_type === "link" ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 gap-1.5 text-xs text-gold/50 hover:text-gold/80"
                            onClick={() => window.open(mat.url, "_blank")}
                          >
                            <ExternalLink className="h-3 w-3" />
                            Acessar
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 gap-1.5 text-xs text-gold/50 hover:text-gold/80"
                            onClick={() => handleDownload(mat.url, mat.title)}
                          >
                            <Download className="h-3 w-3" />
                            Baixar
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </main>

        {/* Right Sidebar */}
        <aside className="w-full lg:w-[360px] shrink-0 border-l border-border/8 bg-card/[0.03] lg:overflow-y-auto lg:max-h-[calc(100vh-56px)] lg:sticky lg:top-14">
          {/* Progress card */}
          <div className="p-5 border-b border-border/8">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-muted-foreground/50">
                Seu Progresso
              </span>
              <span className="font-display text-2xl font-bold text-gold">
                {progressPercent}%
              </span>
            </div>
            <Progress value={progressPercent} className="h-2 mb-3" />
            <div className="flex items-center justify-between text-[11px] text-muted-foreground/40">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3 text-emerald-400/60" />
                {completedCount}/{totalLessons} aulas
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {isCourseCompleted ? "Concluído!" : "Em andamento"}
              </span>
            </div>
            {isCourseCompleted && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-3 flex items-center justify-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/15 py-2 px-3"
              >
                <Award className="h-4 w-4 text-emerald-400/70" />
                <span className="text-[11px] font-semibold text-emerald-400/70">
                  Parabéns! Curso concluído!
                </span>
              </motion.div>
            )}
          </div>

          {/* Module/lesson list */}
          <div className="divide-y divide-border/6">
            {modules.length > 0 &&
              modules.map((mod: any) => {
                const modLessons = (moduleMap[mod.id] || []) as any[];
                if (modLessons.length === 0) return null;
                const modCompleted = modLessons.filter((l: any) =>
                  isLessonCompleted(l.id)
                ).length;
                const hasActiveLesson = modLessons.some(
                  (l: any) => l.id === lessonId
                );

                return (
                  <ModuleSection
                    key={mod.id}
                    title={mod.title}
                    completedCount={modCompleted}
                    totalCount={modLessons.length}
                    defaultOpen={hasActiveLesson}
                  >
                    {modLessons.map((l: any) => (
                      <LessonSidebarItem
                        key={l.id}
                        lesson={l}
                        courseId={courseId}
                        isActive={l.id === lessonId}
                        isCompleted={isLessonCompleted(l.id)}
                      />
                    ))}
                  </ModuleSection>
                );
              })}

            {unmoduled.length > 0 && (
              <ModuleSection
                title="Aulas"
                completedCount={
                  unmoduled.filter((l: any) => isLessonCompleted(l.id)).length
                }
                totalCount={unmoduled.length}
                defaultOpen
              >
                {unmoduled.map((l: any) => (
                  <LessonSidebarItem
                    key={l.id}
                    lesson={l}
                    courseId={courseId}
                    isActive={l.id === lessonId}
                    isCompleted={isLessonCompleted(l.id)}
                  />
                ))}
              </ModuleSection>
            )}
          </div>
        </aside>
      </div>

      {/* Bottom navigation bar */}
      {!accessRestricted && (
        <div className="sticky bottom-0 z-30 border-t border-border/10 bg-background/95 backdrop-blur-xl">
          <div className="mx-auto max-w-[1600px] flex items-center justify-center gap-3 px-4 sm:px-6 py-3">
            {prevLesson ? (
              <Link
                to="/cursos/$courseId/aula/$lessonId"
                params={{ courseId, lessonId: prevLesson.id }}
                className="flex items-center gap-2 rounded-xl border border-border/15 bg-card/8 px-4 py-2.5 text-sm font-medium text-muted-foreground/50 hover:bg-card/20 hover:text-foreground/90 transition-all"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span className="hidden sm:inline truncate max-w-[120px]">Aula Anterior</span>
                <span className="sm:hidden">Anterior</span>
              </Link>
            ) : (
              <div className="w-[120px]" />
            )}

            {enrollment && (
              <Button
                onClick={() => {
                  if (!isCompleted) {
                    progressMutation.mutate({
                      lessonId,
                      watchedSeconds: 0,
                      completed: true,
                    });
                  }
                }}
                disabled={progressMutation.isPending || isCompleted}
                className={`gap-2 px-6 text-sm font-bold uppercase tracking-wider ${
                  isCompleted
                    ? "bg-emerald-500/15 text-emerald-400/70 border border-emerald-500/15 hover:bg-emerald-500/20"
                    : "bg-gold/90 text-gold-foreground hover:bg-gold"
                }`}
                variant={isCompleted ? "outline" : "default"}
              >
                <CheckCircle2 className="h-4 w-4" />
                {isCompleted
                  ? "Concluída"
                  : progressMutation.isPending
                    ? "Salvando..."
                    : "Concluída"}
              </Button>
            )}

            {nextLesson ? (
              <Link
                to="/cursos/$courseId/aula/$lessonId"
                params={{ courseId, lessonId: nextLesson.id }}
                className="flex items-center gap-2 rounded-xl border border-gold/20 bg-gold/[0.08] px-4 py-2.5 text-sm font-medium text-gold/70 hover:bg-gold/15 hover:text-gold transition-all"
              >
                <span className="hidden sm:inline truncate max-w-[120px]">Próxima Aula</span>
                <span className="sm:hidden">Próxima</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            ) : (
              <div className="w-[120px]" />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Module collapsible section ── */

function ModuleSection({
  title,
  completedCount,
  totalCount,
  defaultOpen,
  children,
}: {
  title: string;
  completedCount: number;
  totalCount: number;
  defaultOpen: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <button className="flex items-center gap-3 w-full px-5 py-3.5 text-left hover:bg-card/8 transition-colors group">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground/90 truncate">
              {title}
            </p>
            <p className="text-xs text-muted-foreground/35 mt-0.5">
              {completedCount}/{totalCount} concluídas
            </p>
          </div>
          {open ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground/30 shrink-0" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground/30 shrink-0" />
          )}
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="bg-card/[0.03]">{children}</div>
      </CollapsibleContent>
    </Collapsible>
  );
}

/* ── Sidebar lesson item ── */

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
      className={`flex items-center gap-3 px-5 py-3 transition-all text-left ${
        isActive
          ? "bg-gold/[0.08] border-l-2 border-l-gold/40"
          : "hover:bg-card/8 border-l-2 border-l-transparent"
      }`}
    >
      <div className="shrink-0">
        {isCompleted ? (
          <CheckCircle2 className="h-4 w-4 text-emerald-400/60" />
        ) : isActive ? (
          <Play className="h-4 w-4 text-gold/50 fill-gold/30" />
        ) : (
          <Circle className="h-4 w-4 text-muted-foreground/15" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-medium truncate ${
            isActive
              ? "text-gold/80"
              : isCompleted
                ? "text-muted-foreground/40"
                : "text-foreground/60"
          }`}
        >
          {lesson.title}
        </p>
        {lesson.duration && lesson.duration !== "0:00" && (
          <span className="text-xs text-muted-foreground/25">
            {lesson.duration}
          </span>
        )}
      </div>
    </Link>
  );
}
