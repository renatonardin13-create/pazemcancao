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
  Search,
  Share2,
  List,

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
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
          <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground/60 animate-pulse">
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
          <BookOpen className="mx-auto mb-4 h-10 w-10 text-muted-foreground/50" />
          <p className="text-muted-foreground/50 mb-4">Erro ao carregar a aula.</p>
          <Link
            to="/cursos/$courseId"
            params={{ courseId }}
            className="inline-flex items-center gap-2 text-gold/70 hover:text-gold/80 text-sm transition-colors"
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
      modLessons.forEach((l: any) => allSidebarLessons.push({ ...l, moduleName: mod.title }));
    }
  }
  unmoduled.forEach((l: any) => allSidebarLessons.push(l));

  const filteredBySearch = searchQuery.trim()
    ? allSidebarLessons.filter((l) =>
        l.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Course header */}
      <header className="sticky top-0 z-30 border-b border-border/20 bg-background/95 backdrop-blur-xl">
        <div className="mx-auto max-w-[1800px] flex items-center gap-4 px-4 sm:px-6 h-14">
          <Link
            to="/cursos/$courseId"
            params={{ courseId }}
            className="flex items-center gap-2 text-muted-foreground/60 hover:text-gold/70 transition-colors shrink-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Link>
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <Play className="h-5 w-5 text-gold/70 shrink-0" />
            <div className="min-w-0">
              <h2 className="text-sm font-bold text-foreground/80 truncate">
                {course.title}
              </h2>
            </div>
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
              <div className="max-w-md text-center">
                <div className="mx-auto mb-6 h-20 w-20 rounded-2xl bg-gold/10 border border-gold/15 flex items-center justify-center">
                  <BookOpen className="h-8 w-8 text-gold/40" />
                </div>
                <h1 className="font-display text-2xl font-bold tracking-tight text-foreground/85 mb-3">
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
                      className="inline-flex items-center gap-2 rounded-xl bg-gold/90 text-gold-foreground px-6 py-3 text-[12px] font-bold uppercase tracking-wider hover:bg-gold transition-colors"
                    >
                      <Sparkles className="h-4 w-4" />
                      Desbloquear curso
                    </a>
                  )}
                  <Link
                    to="/cursos/$courseId"
                    params={{ courseId }}
                    className="inline-flex items-center gap-2 rounded-xl border border-border/30 bg-card/20 px-5 py-3 text-[12px] font-semibold text-muted-foreground/50 hover:text-foreground/70 transition-colors"
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
              transition={{ duration: 0.4 }}
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
              <div className="bg-card/15">
                <iframe
                  src={contentUrl}
                  className="w-full h-[75vh]"
                  title={lesson.title}
                />
                <div className="flex items-center justify-center gap-3 p-3 border-t border-border/20 bg-card/8">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 text-xs border-border/30"
                    onClick={() => window.open(contentUrl, "_blank")}
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Abrir em nova aba
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 text-xs border-border/30"
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
                <BookOpen className="mx-auto h-10 w-10 text-muted-foreground/50 mb-4" />
                <p className="text-sm text-muted-foreground/70">
                  Conteúdo em breve.
                </p>
              </div>
            </motion.div>
          )}

          {/* Lesson info below content */}
          {!accessRestricted && (
            <div className="border-t border-border/15 px-4 sm:px-6 py-4">
              <div className="max-w-4xl">
                {/* Title row */}
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <h1 className="font-display text-lg sm:text-xl font-bold text-gold/90 tracking-tight">
                      {lesson.title}
                    </h1>
                    <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                      {lesson.duration && lesson.duration !== "0:00" && (
                        <span className="text-xs text-muted-foreground/60 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {lesson.duration}
                        </span>
                      )}
                      {lesson.is_free_preview && (
                        <Badge
                          variant="outline"
                          className="text-[10px] text-gold/60 border-gold/15"
                        >
                          Preview gratuito
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button className="p-2 rounded-lg text-muted-foreground/50 hover:text-gold/60 hover:bg-gold/5 transition-colors">
                      <Share2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Description */}
                {lesson.description && (
                  <p className="mt-3 text-[13px] leading-[1.8] text-muted-foreground/45 whitespace-pre-line">
                    {lesson.description}
                  </p>
                )}

                {/* Supplementary materials */}
                {displayedMaterials.length > 0 && (
                  <div className="mt-5 rounded-xl border border-border/20 bg-card/10 p-4">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/60 mb-3">
                      Materiais Complementares
                    </h3>
                    <div className="space-y-2">
                      {displayedMaterials.map((mat: any) => (
                        <div
                          key={mat.id}
                          className="flex items-center gap-3 rounded-lg bg-muted/5 border border-border/15 px-4 py-3"
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
                              className="h-8 gap-1.5 text-xs text-gold/70 hover:text-gold/80"
                              onClick={() => window.open(mat.url, "_blank")}
                            >
                              <ExternalLink className="h-3 w-3" />
                              Acessar
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 gap-1.5 text-xs text-gold/70 hover:text-gold/80"
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

          {/* Bottom navigation */}
          {!accessRestricted && (
            <div className="border-t border-border/20 bg-background/95 backdrop-blur-xl mt-auto">
            <div className="flex items-center justify-center gap-2 sm:gap-3 px-3 sm:px-6 py-3 flex-wrap">
                {prevLesson ? (
                  <Link
                    to="/cursos/$courseId/aula/$lessonId"
                    params={{ courseId, lessonId: prevLesson.id }}
                    className="flex items-center gap-1.5 sm:gap-2 rounded-xl border border-border/25 bg-card/10 px-3 sm:px-5 py-2 sm:py-2.5 text-[11px] sm:text-[12px] font-medium text-muted-foreground/60 hover:bg-card/20 hover:text-foreground/70 transition-all"
                  >
                    <ChevronLeft className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                    <span className="hidden sm:inline">Anterior</span>
                    <span className="sm:hidden">Ant.</span>
                  </Link>
                ) : (
                  <button
                    disabled
                    className="flex items-center gap-1.5 sm:gap-2 rounded-xl border border-border/10 bg-card/5 px-3 sm:px-5 py-2 sm:py-2.5 text-[11px] sm:text-[12px] font-medium text-muted-foreground/25 cursor-not-allowed"
                  >
                    <ChevronLeft className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                    <span className="hidden sm:inline">Anterior</span>
                    <span className="sm:hidden">Ant.</span>
                  </button>
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
                    size="sm"
                    className={`gap-1.5 sm:gap-2 px-3 sm:px-6 text-[11px] sm:text-[12px] font-bold uppercase tracking-wider ${
                      isCompleted
                        ? "bg-emerald-500/15 text-emerald-400/70 border border-emerald-500/15 hover:bg-emerald-500/20"
                        : "bg-gold/90 text-gold-foreground hover:bg-gold"
                    }`}
                    variant={isCompleted ? "outline" : "default"}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    {isCompleted
                      ? "Concluída"
                      : progressMutation.isPending
                        ? "..."
                        : "Concluir"}
                  </Button>
                )}

                {nextLesson ? (
                  <Link
                    to="/cursos/$courseId/aula/$lessonId"
                    params={{ courseId, lessonId: nextLesson.id }}
                    className="flex items-center gap-1.5 sm:gap-2 rounded-xl border border-gold/25 bg-gold/[0.08] px-3 sm:px-5 py-2 sm:py-2.5 text-[11px] sm:text-[12px] font-medium text-gold/70 hover:bg-gold/15 hover:text-gold transition-all"
                  >
                    <span className="hidden sm:inline">Próximo</span>
                    <span className="sm:hidden">Próx.</span>
                    <ArrowRight className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  </Link>
                ) : (
                  <button
                    disabled
                    className="flex items-center gap-1.5 sm:gap-2 rounded-xl border border-border/10 bg-card/5 px-3 sm:px-5 py-2 sm:py-2.5 text-[11px] sm:text-[12px] font-medium text-muted-foreground/25 cursor-not-allowed"
                  >
                    <span className="hidden sm:inline">Próximo</span>
                    <span className="sm:hidden">Próx.</span>
                    <ArrowRight className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  </button>
                )}
              </div>
            </div>
          )}
        </main>

        {/* Right Sidebar - Playlist */}
        <aside className="w-full lg:w-[340px] xl:w-[380px] shrink-0 border-t lg:border-t-0 lg:border-l border-player-sidebar-border bg-player-sidebar-bg lg:overflow-y-auto lg:max-h-[calc(100vh-56px)] lg:sticky lg:top-14">
          {/* Sidebar header */}
          <div className="p-4 border-b border-player-sidebar-border">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-bold text-foreground/80">Aulas</h3>
              <span className="text-sm font-bold text-gold">
                {progressPercent}%
              </span>
            </div>
            <p className="text-xs text-muted-foreground/50 mb-3">
              {completedCount}/{totalLessons} assistidas
            </p>
            <Progress value={progressPercent} className="h-1.5 mb-3" />

            {isCourseCompleted && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center justify-center gap-2 rounded-lg bg-player-completed/10 border border-player-completed/15 py-2 px-3 mb-3"
              >
                <Award className="h-4 w-4 text-player-completed/70" />
                <span className="text-xs font-semibold text-player-completed/70">
                  Curso concluído!
                </span>
              </motion.div>
            )}

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/40" />
              <Input
                placeholder="Buscar nesta playlist..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-xs bg-card/10 border-border/20 placeholder:text-muted-foreground/30"
              />
            </div>
          </div>

          {/* Lesson list */}
          <div className="divide-y divide-border/6">
            {filteredBySearch ? (
              filteredBySearch.length > 0 ? (
                filteredBySearch.map((l: any) => (
                  <LessonSidebarItem
                    key={l.id}
                    lesson={l}
                    courseId={courseId}
                    isActive={l.id === lessonId}
                    isCompleted={isLessonCompleted(l.id)}
                    courseCoverUrl={course.cover_image_url}
                  />
                ))
              ) : (
                <div className="p-6 text-center">
                  <p className="text-xs text-muted-foreground/40">
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
                            courseCoverUrl={course.cover_image_url}
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
                        courseCoverUrl={course.cover_image_url}
                      />
                    ))}
                  </ModuleSection>
                )}
              </>
            )}
          </div>
        </aside>
      </div>
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
        <button className="flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-card/8 transition-colors group">
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-semibold text-foreground/70 truncate">
              {title}
            </p>
            <p className="text-[11px] text-muted-foreground/50 mt-0.5">
              {completedCount}/{totalCount} concluídas
            </p>
          </div>
          {open ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground/50 shrink-0" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground/50 shrink-0" />
          )}
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div>{children}</div>
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
  courseCoverUrl,
}: {
  lesson: any;
  courseId: string;
  isActive: boolean;
  isCompleted: boolean;
  courseCoverUrl?: string | null;
}) {
  return (
    <Link
      to="/cursos/$courseId/aula/$lessonId"
      params={{ courseId, lessonId: lesson.id }}
      className={`flex items-center gap-3 px-4 py-2.5 transition-all ${
        isActive
          ? "bg-player-sidebar-active border-l-2 border-l-player-sidebar-active-border"
          : "hover:bg-player-sidebar-hover border-l-2 border-l-transparent"
      }`}
    >
      {/* Status icon */}
      <div className="shrink-0">
        {isCompleted ? (
          <CheckCircle2 className="h-4 w-4 text-player-completed/60" />
        ) : isActive ? (
          <Play className="h-4 w-4 text-gold/70 fill-gold/30" />
        ) : (
          <Circle className="h-4 w-4 text-muted-foreground/30" />
        )}
      </div>

      {/* Thumbnail */}
      {courseCoverUrl && (
        <div className="shrink-0 w-12 h-8 rounded overflow-hidden bg-card/20 border border-border/15">
          <img
            src={courseCoverUrl}
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Lesson info */}
      <div className="flex-1 min-w-0">
        <p
          className={`text-[11px] font-medium truncate ${
            isActive
              ? "text-gold/80"
              : isCompleted
                ? "text-muted-foreground/60"
                : "text-foreground/60"
          }`}
        >
          {lesson.title}
        </p>
        {lesson.duration && lesson.duration !== "0:00" && (
          <span className="text-[10px] text-muted-foreground/50">
            {lesson.duration}
          </span>
        )}
      </div>
    </Link>
  );
}
