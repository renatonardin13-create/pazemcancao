import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getLessonDetail } from "@/lib/lesson-detail.functions";
import { updateLessonProgress } from "@/lib/courses.functions";
import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
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
  Search,
  List,
} from "lucide-react";

export const Route = createFileRoute(
  "/_authenticated/cursos/$courseId/aula/$lessonId"
)({
  component: LessonDetailPage,
  notFoundComponent: () => (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <BookOpen className="mx-auto h-10 w-10 text-muted-foreground/30" />
        <p className="text-muted-foreground/50 text-sm">Aula não encontrada.</p>
      </div>
    </div>
  ),
});

function LessonDetailPage() {
  const { courseId, lessonId } = Route.useParams();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showNextUp, setShowNextUp] = useState(false);

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
      toast.success("Aula concluída! ✓");
      setShowNextUp(true);
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
        <div className="text-center space-y-3">
          <div className="w-8 h-8 mx-auto rounded-full border-2 border-gold/20 border-t-gold/60 animate-spin" />
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground/40">
            Carregando aula...
          </p>
        </div>
      </div>
    );
  }

  if (error || !data?.lesson) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <BookOpen className="mx-auto h-10 w-10 text-muted-foreground/30" />
          <p className="text-muted-foreground/50 text-sm">Erro ao carregar a aula.</p>
          <Link
            to="/cursos/$courseId"
            params={{ courseId }}
            className="inline-flex items-center gap-2 text-gold/60 hover:text-gold text-sm transition-colors"
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

  // Build flat list for sidebar search
  const allSidebarLessons: any[] = [];
  if (modules.length > 0) {
    for (const mod of modules) {
      const modLessons = (moduleMap[mod.id] || []) as any[];
      modLessons.forEach((l: any) =>
        allSidebarLessons.push({ ...l, moduleName: mod.title })
      );
    }
  }
  unmoduled.forEach((l: any) => allSidebarLessons.push(l));

  const filteredBySearch = searchQuery.trim()
    ? allSidebarLessons.filter((l) =>
        l.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : null;

  // Find current lesson index for counter
  const currentLessonIndex = allSidebarLessons.findIndex((l) => l.id === lessonId);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Compact course header */}
      <header className="sticky top-0 z-30 border-b border-border/15 bg-background/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1800px] items-center gap-3 px-4 py-3 sm:px-6">
          <Link
            to="/cursos/$courseId"
            params={{ courseId }}
            className="flex shrink-0 items-center gap-1.5 text-muted-foreground/50 transition-colors hover:text-foreground/70"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="text-xs font-medium hidden sm:inline">Voltar</span>
          </Link>

          <div className="hidden h-8 w-px bg-border/15 sm:block" />

          <div className="hidden sm:flex h-11 w-11 shrink-0 overflow-hidden rounded-2xl border border-border/15 bg-card/10">
            {course.cover_image_url ? (
              <img
                src={course.cover_image_url}
                alt={course.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <BookOpen className="h-4 w-4 text-muted-foreground/35" />
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-gold/55">
              Aula {currentLessonIndex >= 0 ? currentLessonIndex + 1 : "–"} de {totalLessons}
            </p>
            <h1 className="truncate text-sm font-semibold text-foreground/78 sm:text-base">
              {lesson.title}
            </h1>
            <p className="hidden truncate text-[11px] text-muted-foreground/45 sm:block">
              {course.title}
            </p>
          </div>

          {/* Progress indicator — prominent */}
          <div className="flex shrink-0 items-center gap-3 rounded-2xl border border-border/15 bg-card/10 px-4 py-2.5">
            {isCourseCompleted ? (
              <div className="flex items-center gap-2 text-player-completed">
                <Award className="h-4 w-4" />
                <span className="text-[11px] font-bold uppercase tracking-wider">Concluído!</span>
              </div>
            ) : (
              <>
                <div className="hidden sm:block text-right">
                  <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground/30 mb-0.5">
                    Progresso
                  </p>
                  <p className="text-[10px] text-muted-foreground/45">
                    <span className="font-bold text-foreground/65">{completedCount}</span>/{totalLessons} aulas
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-20 sm:w-28 h-2.5 rounded-full bg-player-progress-track overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercent}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className={`h-full rounded-full ${isCourseCompleted ? "bg-player-completed" : "bg-player-progress-fill"}`}
                    />
                  </div>
                  <span className="text-sm font-black text-gold tabular-nums min-w-[2.5rem] text-right">
                    {progressPercent}%
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main layout */}
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Left: Content area */}
        <main className="flex-1 min-w-0 flex flex-col">
          {/* Access restricted */}
          {accessRestricted && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center justify-center min-h-[60vh] p-6"
            >
              <div className="max-w-md text-center space-y-5">
                <div className="mx-auto h-16 w-16 rounded-2xl bg-gold/8 border border-gold/12 flex items-center justify-center">
                  <BookOpen className="h-7 w-7 text-gold/35" />
                </div>
                <div>
                  <h1 className="font-display text-xl font-bold tracking-tight text-foreground/80 mb-2">
                    Aula bloqueada
                  </h1>
                  <p className="text-[13px] leading-relaxed text-muted-foreground/40">
                    Adquira o acesso completo para continuar.
                  </p>
                </div>
                <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                  {checkoutUrl && (
                    <a
                      href={checkoutUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-xl bg-gold/90 text-gold-foreground px-6 py-3 text-[11px] font-bold uppercase tracking-wider hover:bg-gold transition-colors"
                    >
                      <Sparkles className="h-4 w-4" />
                      Desbloquear
                    </a>
                  )}
                  <Link
                    to="/cursos/$courseId"
                    params={{ courseId }}
                    className="inline-flex items-center gap-2 rounded-xl border border-border/20 bg-card/10 px-5 py-3 text-[11px] font-semibold text-muted-foreground/50 hover:text-foreground/70 transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Voltar
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
              transition={{ duration: 0.3 }}
            >
              {isYouTube || isVimeo ? (
                <div className="w-full aspect-video bg-black">
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
                <div className="w-full bg-black">
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
              className="w-full"
            >
              <div className="bg-card/5">
                <iframe
                  src={contentUrl}
                  className="w-full h-[75vh]"
                  title={lesson.title}
                />
                <div className="flex items-center justify-center gap-3 p-3 border-t border-border/15">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 text-xs border-border/20"
                    onClick={() => window.open(contentUrl, "_blank")}
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Abrir em nova aba
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 text-xs border-border/20"
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
          {!accessRestricted && isExternalLink && !hasVideo && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-center min-h-[40vh] p-6"
            >
              <div className="text-center space-y-4">
                <div className="mx-auto h-14 w-14 rounded-2xl bg-gold/8 border border-gold/12 flex items-center justify-center">
                  <Link2 className="h-6 w-6 text-gold/35" />
                </div>
                <p className="text-sm text-muted-foreground/45">
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
          {!accessRestricted && isDownloadableFile && !hasVideo && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-center min-h-[40vh] p-6"
            >
              <div className="text-center space-y-4">
                <div className="mx-auto h-14 w-14 rounded-2xl bg-gold/8 border border-gold/12 flex items-center justify-center">
                  <File className="h-6 w-6 text-gold/35" />
                </div>
                <p className="text-sm text-muted-foreground/45">
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
              <div className="text-center space-y-3">
                <BookOpen className="mx-auto h-8 w-8 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground/45">
                  Conteúdo em breve.
                </p>
              </div>
            </motion.div>
          )}

          {/* Lesson info — clean and focused */}
          {!accessRestricted && (
            <div className="border-t border-border/10 px-4 sm:px-6 py-5">
              <div className="max-w-3xl">
                {/* Title */}
                <h1 className="font-display text-lg sm:text-xl font-bold text-foreground/85 tracking-tight">
                  {lesson.title}
                </h1>

                {/* Meta */}
                <div className="flex items-center gap-3 mt-2 flex-wrap">
                  {lesson.duration && lesson.duration !== "0:00" && (
                    <span className="text-[11px] text-muted-foreground/45 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {lesson.duration}
                    </span>
                  )}
                  {isCompleted && (
                    <span className="text-[11px] text-emerald-400/60 flex items-center gap-1 font-medium">
                      <CheckCircle2 className="h-3 w-3" />
                      Concluída
                    </span>
                  )}
                  {lesson.is_free_preview && (
                    <Badge
                      variant="outline"
                      className="text-[10px] text-gold/50 border-gold/10"
                    >
                      Preview gratuito
                    </Badge>
                  )}
                </div>

                {/* Description */}
                {lesson.description && (
                  <p className="mt-4 text-[13px] leading-[1.9] text-muted-foreground/40 whitespace-pre-line">
                    {lesson.description}
                  </p>
                )}

                {/* Supplementary materials */}
                {displayedMaterials.length > 0 && (
                  <div className="mt-5 rounded-xl border border-border/12 bg-card/5 p-4">
                    <h3 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/45 mb-3">
                      Materiais Complementares
                    </h3>
                    <div className="space-y-1.5">
                      {displayedMaterials.map((mat: any) => (
                        <div
                          key={mat.id}
                          className="flex items-center gap-3 rounded-lg bg-card/5 border border-border/10 px-3.5 py-2.5"
                        >
                          {mat.material_type === "pdf" ? (
                            <FileText className="h-3.5 w-3.5 text-gold/35 shrink-0" />
                          ) : mat.material_type === "link" ? (
                            <ExternalLink className="h-3.5 w-3.5 text-gold/35 shrink-0" />
                          ) : (
                            <File className="h-3.5 w-3.5 text-gold/35 shrink-0" />
                          )}
                          <span className="flex-1 text-[12px] text-foreground/55 truncate">
                            {mat.title}
                          </span>
                          {mat.material_type === "link" ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 gap-1.5 text-[11px] text-gold/60 hover:text-gold/80"
                              onClick={() => window.open(mat.url, "_blank")}
                            >
                              <ExternalLink className="h-3 w-3" />
                              Acessar
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 gap-1.5 text-[11px] text-gold/60 hover:text-gold/80"
                              onClick={() => handleDownload(mat.url, mat.title)}
                            >
                              <Download className="h-3 w-3" />
                              Baixar
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Bottom navigation — premium */}
          {!accessRestricted && (
            <div className="border-t border-border/12 bg-background/95 backdrop-blur-xl mt-auto">
              <div className="flex items-center justify-between px-4 sm:px-6 py-3 gap-3">
                {/* Left: previous */}
                {prevLesson ? (
                  <Link
                    to="/cursos/$courseId/aula/$lessonId"
                    params={{ courseId, lessonId: prevLesson.id }}
                    className="flex items-center gap-2 rounded-xl border border-border/15 bg-card/5 px-4 py-2.5 text-[11px] font-medium text-muted-foreground/50 hover:bg-card/15 hover:text-foreground/70 transition-all"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                    <div className="hidden sm:block text-left">
                      <span className="block text-[9px] uppercase tracking-wider text-muted-foreground/30">Anterior</span>
                      <span className="block text-[11px] text-foreground/55 truncate max-w-[120px]">{prevLesson.title}</span>
                    </div>
                    <span className="sm:hidden">Anterior</span>
                  </Link>
                ) : (
                  <div />
                )}

                {/* Center: mark complete */}
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
                    size="sm"
                    className={`gap-1.5 px-5 text-[11px] font-bold uppercase tracking-wider ${
                      isCompleted
                        ? "bg-player-completed/10 text-player-completed border border-player-completed/15 hover:bg-player-completed/15"
                        : "bg-gold/90 text-gold-foreground hover:bg-gold"
                    }`}
                    variant={isCompleted ? "outline" : "default"}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {isCompleted
                      ? "Concluída"
                      : progressMutation.isPending
                        ? "..."
                        : "Concluir aula"}
                  </Button>
                )}

                {/* Right: next lesson — prominent */}
                {nextLesson ? (
                  <Link
                    to="/cursos/$courseId/aula/$lessonId"
                    params={{ courseId, lessonId: nextLesson.id }}
                    className="flex items-center gap-2 rounded-xl bg-gold/12 border border-gold/20 px-4 py-2.5 text-[11px] font-semibold text-gold/80 hover:bg-gold/20 hover:text-gold transition-all group"
                  >
                    <div className="hidden sm:block text-right">
                      <span className="block text-[9px] uppercase tracking-wider text-gold/40">Próxima aula</span>
                      <span className="block text-[11px] text-gold/70 truncate max-w-[120px] group-hover:text-gold">{nextLesson.title}</span>
                    </div>
                    <span className="sm:hidden">Próxima</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                ) : isCourseCompleted ? (
                  <Link
                    to="/cursos/$courseId"
                    params={{ courseId }}
                    className="flex items-center gap-2 rounded-xl bg-player-completed/10 border border-player-completed/15 px-4 py-2.5 text-[11px] font-semibold text-player-completed/70 hover:bg-player-completed/15 transition-all"
                  >
                    <Award className="h-3.5 w-3.5" />
                    <span>Curso concluído!</span>
                  </Link>
                ) : (
                  <div />
                )}
              </div>
            </div>
          )}
        </main>

        {/* Right Sidebar */}
        <aside className="w-full lg:w-[320px] xl:w-[360px] shrink-0 border-t lg:border-t-0 lg:border-l border-border/12 bg-player-sidebar-bg lg:overflow-y-auto lg:max-h-[calc(100vh-48px)] lg:sticky lg:top-12">
          {/* Mobile toggle */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="flex lg:hidden items-center justify-between w-full px-4 py-3 text-sm font-semibold text-foreground/65 active:bg-card/10"
          >
            <div className="flex items-center gap-2">
              <List className="h-4 w-4 text-gold/50" />
              <span>Playlist · {completedCount}/{totalLessons}</span>
            </div>
            {sidebarOpen ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground/40" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground/40" />
            )}
          </button>

          <div className={`${sidebarOpen ? "block" : "hidden"} lg:block`}>
            {/* Sidebar header */}
            <div className="border-b border-border/10 p-4">
              <div className="mb-4 flex items-start gap-3">
                <div className="flex h-14 w-14 shrink-0 overflow-hidden rounded-2xl border border-border/12 bg-card/10">
                  {course.cover_image_url ? (
                    <img
                      src={course.cover_image_url}
                      alt={course.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <BookOpen className="h-5 w-5 text-muted-foreground/35" />
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-gold/55">
                    Navegação do curso
                  </p>
                  <h3 className="mt-1 text-sm font-bold leading-snug text-foreground/75">
                    {course.title}
                  </h3>
                  <p className="mt-1 text-[10px] text-muted-foreground/40">
                    {completedCount} de {totalLessons} aulas concluídas
                  </p>
                </div>

                <span className="text-lg font-black text-gold tabular-nums">
                  {progressPercent}%
                </span>
              </div>

              {/* Enhanced progress bar */}
              <div className="mb-3">
                <div className="h-2.5 w-full rounded-full bg-player-progress-track overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className={`h-full rounded-full transition-colors ${isCourseCompleted ? "bg-player-completed" : "bg-player-progress-fill"}`}
                  />
                </div>
                <div className="flex items-center justify-between mt-1.5">
                  <span className="text-[10px] text-muted-foreground/40">
                    <span className="font-bold text-foreground/60">{completedCount}</span> de {totalLessons} aulas concluídas
                  </span>
                  {!isCourseCompleted && totalLessons - completedCount > 0 && (
                    <span className="text-[10px] text-gold/40 font-medium">
                      Faltam {totalLessons - completedCount}
                    </span>
                  )}
                </div>
              </div>

              {isCourseCompleted && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 5 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: 0.5, type: "spring" }}
                  className="mb-3 flex items-center justify-center gap-2.5 rounded-xl border border-player-completed/15 bg-player-completed/10 px-4 py-3"
                >
                  <Award className="h-5 w-5 text-player-completed" />
                  <div className="text-center">
                    <span className="block text-[12px] font-bold text-player-completed">
                      🎉 Curso concluído!
                    </span>
                    <span className="block text-[10px] text-player-completed/60 mt-0.5">
                      Parabéns por completar todas as aulas
                    </span>
                  </div>
                </motion.div>
              )}

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground/30" />
                <Input
                  placeholder="Buscar aula..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-8 border-border/12 bg-card/5 pl-8 text-[11px] placeholder:text-muted-foreground/25"
                />
              </div>
            </div>

            {/* Lesson list */}
            <div className="divide-y divide-border/5 max-h-[50vh] lg:max-h-none overflow-y-auto">
              {filteredBySearch ? (
                filteredBySearch.length > 0 ? (
                  filteredBySearch.map((l: any) => (
                    <LessonSidebarItem
                      key={l.id}
                      lesson={l}
                      courseId={courseId}
                      isActive={l.id === lessonId}
                      isCompleted={isLessonCompleted(l.id)}
                      isNext={l.id === nextLesson?.id}
                    />
                  ))
                ) : (
                  <div className="p-6 text-center">
                    <p className="text-[11px] text-muted-foreground/30">
                      Nenhuma aula encontrada
                    </p>
                  </div>
                )
              ) : (
                <>
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
                              isNext={l.id === nextLesson?.id}
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
                          isNext={l.id === nextLesson?.id}
                        />
                      ))}
                    </ModuleSection>
                  )}
                </>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

/* ── Module collapsible section — premium ── */

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
  const allDone = completedCount === totalCount;
  const modProgress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <button
          className={`flex items-center gap-3 w-full px-4 py-3.5 text-left transition-all duration-200 group ${
            open
              ? "bg-card/8 border-b border-player-sidebar-border/40"
              : "hover:bg-player-sidebar-hover"
          }`}
        >
          {/* Module number / status badge */}
          <div
            className={`shrink-0 flex h-9 w-9 items-center justify-center rounded-xl text-[11px] font-bold transition-all duration-200 ${
              allDone
                ? "bg-player-completed/12 ring-1 ring-player-completed/15 text-player-completed"
                : open
                  ? "bg-gold/10 ring-1 ring-gold/15 text-gold/70"
                  : "bg-card/10 ring-1 ring-border/10 text-muted-foreground/35 group-hover:ring-gold/10 group-hover:text-gold/50"
            }`}
          >
            {allDone ? (
              <CheckCircle2 className="h-4.5 w-4.5" />
            ) : (
              <BookOpen className="h-4 w-4" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <p
              className={`text-[12px] font-bold truncate transition-colors ${
                open ? "text-foreground/80" : "text-foreground/60 group-hover:text-foreground/75"
              }`}
            >
              {title}
            </p>
            {/* Progress bar + count */}
            <div className="flex items-center gap-2.5 mt-1.5">
              <div className="h-1 flex-1 max-w-[120px] rounded-full bg-player-progress-track overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    allDone ? "bg-player-completed" : "bg-player-progress-fill"
                  }`}
                  style={{ width: `${modProgress}%` }}
                />
              </div>
              <span
                className={`text-[10px] font-bold tabular-nums ${
                  allDone ? "text-player-completed/60" : "text-muted-foreground/35"
                }`}
              >
                {completedCount}/{totalCount}
              </span>
            </div>
          </div>

          <div
            className={`shrink-0 flex h-7 w-7 items-center justify-center rounded-lg transition-all duration-200 ${
              open ? "bg-gold/8 rotate-180" : "bg-card/5 group-hover:bg-card/10"
            }`}
          >
            <ChevronDown
              className={`h-3.5 w-3.5 transition-colors ${
                open ? "text-gold/55" : "text-muted-foreground/30"
              }`}
            />
          </div>
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.15 }}
          className="bg-background/30"
        >
          {children}
        </motion.div>
      </CollapsibleContent>
    </Collapsible>
  );
}

/* ── Sidebar lesson item — premium ── */

function LessonSidebarItem({
  lesson,
  courseId,
  isActive,
  isCompleted,
  isNext,
}: {
  lesson: any;
  courseId: string;
  isActive: boolean;
  isCompleted: boolean;
  isNext: boolean;
}) {
  const contentType = lesson.content_type || "video";

  const getTypeIcon = () => {
    if (contentType === "pdf") return <FileText className="h-3 w-3" />;
    if (contentType === "file") return <File className="h-3 w-3" />;
    if (contentType === "link") return <Link2 className="h-3 w-3" />;
    return <Video className="h-3 w-3" />;
  };

  return (
    <Link
      to="/cursos/$courseId/aula/$lessonId"
      params={{ courseId, lessonId: lesson.id }}
      className={`group/item flex items-center gap-3.5 px-5 py-3.5 transition-all duration-200 relative ${
        isActive
          ? "bg-player-sidebar-active"
          : isNext
            ? "bg-gold/[0.03] hover:bg-gold/[0.06]"
            : "hover:bg-player-sidebar-hover"
      }`}
    >
      {/* Active indicator bar */}
      <div
        className={`absolute left-0 top-1 bottom-1 w-[3px] rounded-r-full transition-all duration-300 ${
          isActive
            ? "bg-gold shadow-[0_0_8px_rgba(212,175,55,0.3)]"
            : isNext
              ? "bg-gold/25"
              : "bg-transparent group-hover/item:bg-border/20"
        }`}
      />

      {/* Status icon */}
      <div
        className={`shrink-0 flex h-8 w-8 items-center justify-center rounded-xl transition-all duration-200 ${
          isCompleted
            ? "bg-player-completed/12 ring-1 ring-player-completed/15"
            : isActive
              ? "bg-gold/15 ring-1 ring-gold/25 shadow-sm shadow-gold/10"
              : isNext
                ? "bg-gold/8 ring-1 ring-gold/10"
                : "bg-card/8 ring-1 ring-border/8 group-hover/item:ring-border/15"
        }`}
      >
        {isCompleted ? (
          <CheckCircle2 className="h-4 w-4 text-player-completed" />
        ) : isActive ? (
          <div className="relative">
            <Play className="h-3.5 w-3.5 text-gold fill-gold/40" />
            {/* Pulse animation for active */}
            <span className="absolute -inset-1 rounded-full bg-gold/10 animate-ping" />
          </div>
        ) : isNext ? (
          <Play className="h-3 w-3 text-gold/50" />
        ) : (
          <span className="text-muted-foreground/25">{getTypeIcon()}</span>
        )}
      </div>

      {/* Lesson info */}
      <div className="flex-1 min-w-0">
        <p
          className={`text-[12px] font-medium truncate leading-snug transition-colors ${
            isActive
              ? "text-gold font-semibold"
              : isCompleted
                ? "text-muted-foreground/40"
                : isNext
                  ? "text-gold/65 font-medium"
                  : "text-foreground/55 group-hover/item:text-foreground/70"
          }`}
        >
          {lesson.title}
        </p>
        <div className="flex items-center gap-2 mt-1">
          {/* Type icon for non-active */}
          {!isActive && !isCompleted && !isNext && (
            <span className="text-muted-foreground/20">{getTypeIcon()}</span>
          )}
          {lesson.duration && lesson.duration !== "0:00" && (
            <span className="text-[10px] text-muted-foreground/30 tabular-nums flex items-center gap-1">
              <Clock className="h-2.5 w-2.5" />
              {lesson.duration}
            </span>
          )}
          {isActive && (
            <span className="text-[8px] font-bold uppercase tracking-[0.15em] text-gold bg-gold/10 px-2 py-0.5 rounded-full ring-1 ring-gold/15">
              ▶ Assistindo
            </span>
          )}
          {isNext && !isActive && (
            <span className="text-[8px] font-bold uppercase tracking-[0.12em] text-gold/50 bg-gold/[0.06] px-2 py-0.5 rounded-full ring-1 ring-gold/8">
              Próxima
            </span>
          )}
          {isCompleted && (
            <span className="text-[8px] font-semibold uppercase tracking-wider text-player-completed/55 flex items-center gap-1">
              <CheckCircle2 className="h-2.5 w-2.5" />
              Concluída
            </span>
          )}
        </div>
      </div>

      {/* Right arrow on hover */}
      {!isCompleted && !isActive && (
        <div className="shrink-0 opacity-0 group-hover/item:opacity-100 transition-opacity duration-200">
          <ArrowRight className="h-3 w-3 text-gold/40" />
        </div>
      )}
    </Link>
  );
}
