import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getLessonDetail } from "@/lib/lesson-detail.functions";
import { updateLessonProgress } from "@/lib/courses.functions";
import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
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
  ChevronLeft,
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
  ChevronUp,
} from "lucide-react";
import { EbookReader } from "@/components/EbookReader";

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
  const [countdown, setCountdown] = useState<number | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const navigate = useNavigate();

  const { data, isLoading, error } = useQuery({
    queryKey: ["lesson-detail", courseId, lessonId],
    queryFn: () => getLessonDetail({ data: { courseId, lessonId } }),
  });

  // Track whether completion was triggered by video ending (for auto-advance)
  const completionSourceRef = useRef<"video" | "manual">("manual");

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

      // Only auto-advance for video content completions
      if (completionSourceRef.current === "video") {
        setShowNextUp(true);
        setCountdown(5);
      }
      completionSourceRef.current = "manual"; // reset
    },
  });

  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    return () => {
      videoRef.current?.pause();
      videoRef.current = null;
    };
  }, [lessonId]);

  // Reset countdown on lesson change
  useEffect(() => {
    setCountdown(null);
    setShowNextUp(false);
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
  }, [lessonId]);

  // Countdown timer effect
  useEffect(() => {
    if (countdown === null || countdown <= 0) return;

    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 1) {
          if (countdownRef.current) clearInterval(countdownRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
        countdownRef.current = null;
      }
    };
  }, [countdown !== null && countdown > 0]);

  // Keyboard shortcuts: ← previous, → next, Enter complete
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip if user is typing in an input/textarea
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

      if (e.key === "ArrowLeft" && data?.prevLesson) {
        e.preventDefault();
        navigate({
          to: "/cursos/$courseId/aula/$lessonId",
          params: { courseId, lessonId: data.prevLesson.id },
        });
      } else if (e.key === "ArrowRight" && data?.nextLesson) {
        e.preventDefault();
        navigate({
          to: "/cursos/$courseId/aula/$lessonId",
          params: { courseId, lessonId: data.nextLesson.id },
        });
      } else if (e.key === "Enter" && data && !progressMutation.isPending) {
        const completed = data.progress?.some(
          (p: any) => p.lesson_id === lessonId && p.completed
        );
        if (!completed && data.enrollment) {
          e.preventDefault();
          progressMutation.mutate({ lessonId, watchedSeconds: 0, completed: true });
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [data, courseId, lessonId, navigate, progressMutation]);

  // Navigate when countdown reaches 0
  useEffect(() => {
    if (countdown === 0 && data?.nextLesson) {
      navigate({
        to: "/cursos/$courseId/aula/$lessonId",
        params: { courseId, lessonId: data.nextLesson.id },
      });
    }
  }, [countdown, data?.nextLesson, courseId, navigate]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="relative mx-auto h-12 w-12">
            <div className="absolute inset-0 rounded-full border-2 border-gold/10" />
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-gold/50 animate-spin" />
          </div>
          <p className="text-[10px] uppercase tracking-[0.35em] text-muted-foreground/35 font-medium">
            Preparando sua aula...
          </p>
        </div>
      </div>
    );
  }

  if (error || !data?.lesson) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center space-y-5">
          <div className="mx-auto h-16 w-16 rounded-2xl bg-card/10 border border-border/10 flex items-center justify-center">
            <BookOpen className="h-7 w-7 text-muted-foreground/25" />
          </div>
          <div>
            <p className="text-foreground/60 text-sm font-semibold">Erro ao carregar</p>
            <p className="text-muted-foreground/35 text-xs mt-1">Não foi possível carregar esta aula.</p>
          </div>
          <Button variant="premiumOutline" size="sm" asChild>
            <Link to="/cursos/$courseId" params={{ courseId }}>
              <ChevronLeft className="h-3.5 w-3.5" />
              Voltar ao curso
            </Link>
          </Button>
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

  const currentLessonIndex = allSidebarLessons.findIndex((l) => l.id === lessonId);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* ═══ HEADER — cinematic, minimal ═══ */}
      <header className="sticky top-0 z-30 border-b border-border/10 bg-background/90 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-[1800px] items-center gap-4 px-5 py-3.5 sm:px-8">
          <Button variant="premiumOutline" size="sm" asChild className="shrink-0">
            <Link to="/vitrine">
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Voltar à vitrine</span>
            </Link>
          </Button>

          <div className="hidden h-6 w-px bg-border/10 sm:block" />

          <div className="hidden sm:flex h-10 w-10 shrink-0 overflow-hidden rounded-xl border border-border/10 bg-card/8 shadow-sm">
            {course.cover_image_url ? (
              <img
                src={course.cover_image_url}
                alt={course.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <BookOpen className="h-4 w-4 text-muted-foreground/25" />
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-gold/45">
              Aula {currentLessonIndex >= 0 ? currentLessonIndex + 1 : "–"} · {totalLessons}
            </p>
            <h1 className="truncate text-[13px] sm:text-sm font-bold text-foreground/80 leading-tight mt-0.5">
              {lesson.title}
            </h1>
          </div>

          {/* Progress pill */}
          <div className="flex shrink-0 items-center gap-3 rounded-2xl border border-border/10 bg-card/6 px-4 py-2.5">
            {isCourseCompleted ? (
              <div className="flex items-center gap-2 text-player-completed">
                <Award className="h-4 w-4" />
                <span className="text-[10px] font-bold uppercase tracking-[0.15em]">Concluído</span>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-[10px] text-muted-foreground/40 tabular-nums">
                    <span className="font-bold text-foreground/55">{completedCount}</span>
                    <span className="mx-0.5">/</span>
                    {totalLessons}
                  </span>
                </div>
                <div className="w-20 sm:w-28 h-2 rounded-full bg-player-progress-track overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full rounded-full bg-player-progress-fill"
                  />
                </div>
                <span className="text-[13px] font-black text-gold tabular-nums min-w-[2rem] text-right">
                  {progressPercent}%
                </span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ═══ MAIN LAYOUT ═══ */}
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* ─── Content area ─── */}
        <main className="flex-1 min-w-0 flex flex-col">
          {/* Access restricted */}
          {accessRestricted && (
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center justify-center min-h-[65vh] p-8"
            >
              <div className="max-w-sm text-center space-y-6">
                <div className="mx-auto h-20 w-20 rounded-3xl bg-gold/6 border border-gold/8 flex items-center justify-center">
                  <BookOpen className="h-8 w-8 text-gold/30" />
                </div>
                <div>
                  <h2 className="font-display text-xl font-bold tracking-tight text-foreground/80 mb-2">
                    Aula bloqueada
                  </h2>
                  <p className="text-[13px] leading-relaxed text-muted-foreground/35">
                    Adquira o acesso completo para continuar sua jornada.
                  </p>
                </div>
                <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                  {checkoutUrl && (
                    <a
                      href={checkoutUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-xl bg-gold px-7 py-3.5 text-[11px] font-bold uppercase tracking-[0.15em] text-gold-foreground shadow-lg shadow-gold/20 hover:shadow-gold/30 hover:brightness-110 transition-all"
                    >
                      <Sparkles className="h-4 w-4" />
                      Desbloquear acesso
                    </a>
                  )}
                  <Button variant="premiumOutline" size="sm" asChild>
                    <Link to="/cursos/$courseId" params={{ courseId }}>
                      <ChevronLeft className="h-3.5 w-3.5" />
                      Voltar
                    </Link>
                  </Button>
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
              className="relative"
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
                        completionSourceRef.current = "video";
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
              <EbookReader
                pdfUrl={contentUrl}
                title={lesson.title}
                isCompleted={isCompleted}
                isCompletePending={progressMutation.isPending}
                onComplete={() => {
                  if (!isCompleted && enrollment) {
                    progressMutation.mutate({
                      lessonId,
                      watchedSeconds: 0,
                      completed: true,
                    });
                  }
                }}
                onBack={() => navigate({ to: "/cursos/$courseId", params: { courseId } })}
              />
            </motion.div>
          )}

          {/* External link */}
          {!accessRestricted && isExternalLink && !hasVideo && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-center min-h-[45vh] p-8"
            >
              <div className="text-center space-y-5">
                <div className="mx-auto h-16 w-16 rounded-2xl bg-gold/6 border border-gold/10 flex items-center justify-center">
                  <Link2 className="h-7 w-7 text-gold/30" />
                </div>
                <p className="text-sm text-muted-foreground/40">
                  Esta aula contém um link externo
                </p>
                <Button
                  className="gap-2 bg-gold text-gold-foreground hover:brightness-110 shadow-lg shadow-gold/15"
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
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-center min-h-[45vh] p-8"
            >
              <div className="text-center space-y-5">
                <div className="mx-auto h-16 w-16 rounded-2xl bg-gold/6 border border-gold/10 flex items-center justify-center">
                  <File className="h-7 w-7 text-gold/30" />
                </div>
                <p className="text-sm text-muted-foreground/40">
                  Material disponível para download
                </p>
                <Button
                  className="gap-2 bg-gold text-gold-foreground hover:brightness-110 shadow-lg shadow-gold/15"
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
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-center min-h-[45vh] p-8"
            >
              <div className="max-w-sm text-center space-y-5">
                <div className="mx-auto h-16 w-16 rounded-2xl bg-muted/8 border border-border/12 flex items-center justify-center">
                  <BookOpen className="h-7 w-7 text-muted-foreground/25" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground/70">
                    Esta aula ainda não possui conteúdo disponível
                  </h3>
                  <p className="text-[12px] text-muted-foreground/35 mt-1.5 leading-relaxed">
                    O conteúdo desta aula está sendo preparado. Tente novamente mais tarde.
                  </p>
                </div>
                {nextLesson && (
                  <Link
                    to="/cursos/$courseId/aula/$lessonId"
                    params={{ courseId, lessonId: nextLesson.id }}
                    className="inline-flex items-center gap-2 rounded-xl bg-gold/10 border border-gold/15 px-5 py-3 text-[11px] font-semibold text-gold/75 hover:bg-gold/18 transition-all"
                  >
                    <Play className="h-3.5 w-3.5 fill-current" />
                    Ir para próxima aula
                  </Link>
                )}
              </div>
            </motion.div>
          )}

          {/* ═══ ACTION BAR — below player ═══ */}
          {!accessRestricted && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
              className="border-t border-b border-border/8 bg-card/3 px-4 sm:px-8 py-5"
            >
              <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
                {/* Previous — tertiary / ghost */}
                {prevLesson ? (
                  <Link
                    to="/cursos/$courseId/aula/$lessonId"
                    params={{ courseId, lessonId: prevLesson.id }}
                    className="flex items-center gap-2 rounded-xl border border-border/8 px-4 py-2.5 text-[11px] font-medium text-muted-foreground/40 hover:bg-card/10 hover:text-muted-foreground/65 transition-all group order-1 sm:order-none"
                  >
                    <ChevronLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" />
                    <span className="hidden sm:inline truncate max-w-[120px]">{prevLesson.title}</span>
                    <span className="sm:hidden">Anterior</span>
                  </Link>
                ) : (
                  <div className="hidden sm:flex items-center gap-2 rounded-xl border border-border/6 px-4 py-2.5 text-[11px] font-medium text-muted-foreground/20 opacity-40 order-1 sm:order-none">
                    <ChevronLeft className="h-3.5 w-3.5" />
                    <span>Anterior</span>
                  </div>
                )}

                {/* Mark complete — PRIMARY CTA, largest + gold */}
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
                    className={`gap-2.5 px-8 sm:px-10 py-3.5 text-[12px] font-bold uppercase tracking-[0.14em] transition-all rounded-xl order-0 sm:order-none w-full sm:w-auto ${
                      isCompleted
                        ? "bg-player-completed/10 text-player-completed border border-player-completed/15 hover:bg-player-completed/15 shadow-none"
                        : "bg-gold text-gold-foreground hover:brightness-110 shadow-lg shadow-gold/25 hover:shadow-xl hover:shadow-gold/35 scale-100 hover:scale-[1.02]"
                    }`}
                    variant={isCompleted ? "outline" : "default"}
                  >
                    <CheckCircle2 className="h-4.5 w-4.5" />
                    {isCompleted
                      ? "Concluída ✓"
                      : progressMutation.isPending
                        ? "Salvando..."
                        : "Concluir aula"}
                  </Button>
                )}

                {/* Next — secondary, gold-tinted */}
                {nextLesson ? (
                  <Link
                    to="/cursos/$courseId/aula/$lessonId"
                    params={{ courseId, lessonId: nextLesson.id }}
                    className="flex items-center gap-2 rounded-xl bg-gold/8 border border-gold/12 px-5 py-2.5 text-[11px] font-semibold text-gold/65 hover:bg-gold/15 hover:text-gold transition-all group order-2 sm:order-none"
                  >
                    <span className="hidden sm:inline truncate max-w-[120px]">{nextLesson.title}</span>
                    <span className="sm:hidden">Próxima</span>
                    <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                ) : isCourseCompleted ? (
                  <Link
                    to="/cursos/$courseId"
                    params={{ courseId }}
                    className="flex items-center gap-2 rounded-xl bg-player-completed/8 border border-player-completed/12 px-5 py-2.5 text-[11px] font-semibold text-player-completed/70 hover:bg-player-completed/15 transition-all order-2 sm:order-none"
                  >
                    <Award className="h-3.5 w-3.5" />
                    <span>Concluído!</span>
                  </Link>
                ) : (
                  <div className="hidden sm:flex items-center gap-2 rounded-xl border border-border/6 px-5 py-2.5 text-[11px] font-medium text-muted-foreground/20 opacity-40 order-2 sm:order-none">
                    <span>Próxima</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ─── Lesson info — refined ─── */}
          {!accessRestricted && (
            <div className="border-t border-border/8 px-5 sm:px-8 py-6">
              <div className="max-w-3xl">
                <h2 className="font-display text-lg sm:text-xl font-bold text-foreground/90 tracking-tight leading-tight">
                  {lesson.title}
                </h2>

                <div className="flex items-center gap-3.5 mt-3 flex-wrap">
                  {lesson.duration && lesson.duration !== "0:00" && (
                    <span className="text-[11px] text-muted-foreground/40 flex items-center gap-1.5">
                      <Clock className="h-3 w-3" />
                      {lesson.duration}
                    </span>
                  )}
                  {isCompleted && (
                    <span className="text-[11px] text-player-completed/70 flex items-center gap-1.5 font-semibold">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Concluída
                    </span>
                  )}
                  {lesson.is_free_preview && (
                    <Badge
                      variant="outline"
                      className="text-[10px] text-gold/45 border-gold/10 bg-gold/[0.03]"
                    >
                      Preview gratuito
                    </Badge>
                  )}
                </div>

                {lesson.description && (
                  <p className="mt-5 text-[13px] leading-[1.85] text-muted-foreground/45 whitespace-pre-line">
                    {lesson.description}
                  </p>
                )}

                {/* Supplementary materials */}
                {displayedMaterials.length > 0 && (
                  <div className="mt-6 rounded-2xl border border-border/10 bg-card/4 p-5">
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 mb-3.5">
                      Materiais Complementares
                    </h3>
                    <div className="space-y-2">
                      {displayedMaterials.map((mat: any) => (
                        <div
                          key={mat.id}
                          className="flex items-center gap-3 rounded-xl bg-card/5 border border-border/8 px-4 py-3 hover:bg-card/10 transition-colors"
                        >
                          {mat.material_type === "pdf" ? (
                            <FileText className="h-4 w-4 text-gold/30 shrink-0" />
                          ) : mat.material_type === "link" ? (
                            <ExternalLink className="h-4 w-4 text-gold/30 shrink-0" />
                          ) : (
                            <File className="h-4 w-4 text-gold/30 shrink-0" />
                          )}
                          <span className="flex-1 text-[12px] text-foreground/55 truncate">
                            {mat.title}
                          </span>
                          {mat.material_type === "link" ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 gap-1.5 text-[11px] text-gold/55 hover:text-gold/80"
                              onClick={() => window.open(mat.url, "_blank")}
                            >
                              <ExternalLink className="h-3 w-3" />
                              Acessar
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 gap-1.5 text-[11px] text-gold/55 hover:text-gold/80"
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

          {/* ═══ NEXT UP CARD — Netflix-style with countdown ═══ */}
          <AnimatePresence>
            {(isCompleted || showNextUp) && nextLesson && !accessRestricted && (
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="border-t border-gold/8 bg-gradient-to-r from-gold/[0.03] via-transparent to-gold/[0.03] px-5 sm:px-8 py-6"
              >
                <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-5">
                  {/* Countdown circle */}
                  {countdown !== null && countdown > 0 && (
                    <div className="relative shrink-0 h-14 w-14 flex items-center justify-center">
                      <svg className="absolute inset-0 h-14 w-14 -rotate-90" viewBox="0 0 56 56">
                        <circle
                          cx="28" cy="28" r="24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          className="text-border/10"
                        />
                        <circle
                          cx="28" cy="28" r="24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          className="text-gold"
                          strokeDasharray={2 * Math.PI * 24}
                          strokeDashoffset={2 * Math.PI * 24 * (1 - countdown / 5)}
                          style={{ transition: "stroke-dashoffset 1s linear" }}
                        />
                      </svg>
                      <span className="text-lg font-black text-gold tabular-nums">{countdown}</span>
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-gold/40 mb-1.5 flex items-center gap-2">
                      <Sparkles className="h-3 w-3" />
                      {countdown !== null && countdown > 0
                        ? `Próxima aula em ${countdown}s`
                        : "Continue sua jornada"}
                    </p>
                    <p className="text-sm font-bold text-foreground/80 truncate">
                      {nextLesson.title}
                    </p>
                    {nextLesson.duration && nextLesson.duration !== "0:00" && (
                      <p className="text-[10px] text-muted-foreground/30 mt-1 flex items-center gap-1.5">
                        <Clock className="h-2.5 w-2.5" />
                        {nextLesson.duration}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <Link
                      to="/cursos/$courseId/aula/$lessonId"
                      params={{ courseId, lessonId: nextLesson.id }}
                      className="inline-flex items-center gap-2.5 rounded-xl bg-gold px-7 py-3.5 text-[11px] font-bold uppercase tracking-[0.18em] text-gold-foreground shadow-lg shadow-gold/20 hover:shadow-xl hover:shadow-gold/30 hover:brightness-110 transition-all active:scale-[0.97]"
                    >
                      <Play className="h-3.5 w-3.5 fill-current" />
                      Próxima aula
                    </Link>
                    <button
                      onClick={() => {
                        setShowNextUp(false);
                        setCountdown(null);
                        if (countdownRef.current) {
                          clearInterval(countdownRef.current);
                          countdownRef.current = null;
                        }
                      }}
                      className="text-[10px] text-muted-foreground/25 hover:text-muted-foreground/45 transition-colors px-2"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ═══ COURSE COMPLETED CARD ═══ */}
          <AnimatePresence>
            {isCompleted && !nextLesson && !accessRestricted && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, type: "spring" }}
                className="border-t border-player-completed/8 bg-gradient-to-r from-player-completed/[0.03] via-transparent to-player-completed/[0.03] px-5 sm:px-8 py-8"
              >
                <div className="max-w-sm mx-auto text-center">
                  <div className="mx-auto h-14 w-14 rounded-2xl bg-player-completed/10 border border-player-completed/12 flex items-center justify-center mb-4">
                    <Award className="h-7 w-7 text-player-completed" />
                  </div>
                  <h3 className="font-display text-lg font-bold text-foreground/85">
                    Parabéns! 🎉
                  </h3>
                  <p className="text-[13px] text-muted-foreground/40 mt-2 leading-relaxed">
                    Você concluiu todas as aulas deste curso.
                  </p>
                  <Link
                    to="/cursos/$courseId"
                    params={{ courseId }}
                    className="inline-flex items-center gap-2 mt-5 rounded-xl bg-player-completed/8 border border-player-completed/12 px-6 py-3 text-[11px] font-semibold text-player-completed/70 hover:bg-player-completed/15 transition-all"
                  >
                    Ver resumo do curso
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </main>

        {/* ═══ SIDEBAR — premium playlist ═══ */}
        <aside className="w-full lg:w-[340px] xl:w-[380px] shrink-0 border-t lg:border-t-0 lg:border-l border-border/8 bg-player-sidebar-bg lg:overflow-y-auto lg:max-h-[calc(100vh-52px)] lg:sticky lg:top-[52px]">
          {/* Mobile toggle */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="flex lg:hidden items-center justify-between w-full px-5 py-3.5 text-[13px] font-semibold text-foreground/60 active:bg-card/8 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <List className="h-4 w-4 text-gold/45" />
              <span>Playlist · {completedCount}/{totalLessons}</span>
            </div>
            {sidebarOpen ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground/35" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground/35" />
            )}
          </button>

          <div className={`${sidebarOpen ? "block" : "hidden"} lg:block`}>
            {/* Sidebar header */}
            <div className="border-b border-border/8 p-5">
              <div className="mb-5 flex items-start gap-3.5">
                <div className="flex h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-border/10 bg-card/8 shadow-sm">
                  {course.cover_image_url ? (
                    <img
                      src={course.cover_image_url}
                      alt={course.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <BookOpen className="h-5 w-5 text-muted-foreground/25" />
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="text-[13px] font-bold leading-snug text-foreground/80">
                    {course.title}
                  </h3>
                  <p className="mt-1 text-[10px] text-muted-foreground/35">
                    {completedCount} de {totalLessons} aulas
                  </p>
                </div>

                <span className="text-lg font-black text-gold tabular-nums">
                  {progressPercent}%
                </span>
              </div>

              {/* Progress bar */}
              <div className="mb-4">
                <div className="h-2 w-full rounded-full bg-player-progress-track overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    className={`h-full rounded-full ${isCourseCompleted ? "bg-player-completed" : "bg-player-progress-fill"}`}
                  />
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[10px] text-muted-foreground/35">
                    <span className="font-bold text-foreground/55">{completedCount}</span> de {totalLessons} concluídas
                  </span>
                  {!isCourseCompleted && totalLessons - completedCount > 0 && (
                    <span className="text-[10px] text-gold/35 font-medium">
                      Faltam {totalLessons - completedCount}
                    </span>
                  )}
                </div>
              </div>

              {isCourseCompleted && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mb-4 flex items-center justify-center gap-2.5 rounded-xl border border-player-completed/12 bg-player-completed/8 px-4 py-3"
                >
                  <Award className="h-5 w-5 text-player-completed" />
                  <div className="text-center">
                    <span className="block text-[12px] font-bold text-player-completed">
                      Curso concluído! 🎉
                    </span>
                    <span className="block text-[10px] text-player-completed/50 mt-0.5">
                      Parabéns pela dedicação
                    </span>
                  </div>
                </motion.div>
              )}

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/25" />
                <Input
                  placeholder="Buscar aula..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-9 border-border/10 bg-card/5 pl-9 text-[12px] rounded-xl placeholder:text-muted-foreground/20 focus:border-gold/20 focus:ring-gold/10"
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
                  <div className="p-8 text-center">
                    <p className="text-[11px] text-muted-foreground/25">
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

/* ══ Module collapsible section ══ */

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
          className={`flex items-center gap-3.5 w-full px-5 py-4 text-left transition-all duration-200 group ${
            open
              ? "bg-card/6 border-b border-player-sidebar-border/30"
              : "hover:bg-player-sidebar-hover"
          }`}
        >
          <div
            className={`shrink-0 flex h-9 w-9 items-center justify-center rounded-xl text-[11px] font-bold transition-all duration-200 ${
              allDone
                ? "bg-player-completed/10 ring-1 ring-player-completed/12 text-player-completed"
                : open
                  ? "bg-gold/8 ring-1 ring-gold/12 text-gold/65"
                  : "bg-card/8 ring-1 ring-border/8 text-muted-foreground/30 group-hover:ring-gold/8 group-hover:text-gold/45"
            }`}
          >
            {allDone ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <BookOpen className="h-4 w-4" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <p
              className={`text-[12px] font-bold truncate transition-colors ${
                open ? "text-foreground/80" : "text-foreground/55 group-hover:text-foreground/70"
              }`}
            >
              {title}
            </p>
            <div className="flex items-center gap-2.5 mt-2">
              <div className="h-1 flex-1 max-w-[120px] rounded-full bg-player-progress-track overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    allDone ? "bg-player-completed" : "bg-player-progress-fill"
                  }`}
                  style={{ width: `${modProgress}%` }}
                />
              </div>
              <span
                className={`text-[10px] font-bold tabular-nums ${
                  allDone ? "text-player-completed/55" : "text-muted-foreground/30"
                }`}
              >
                {completedCount}/{totalCount}
              </span>
            </div>
          </div>

          <div
            className={`shrink-0 flex h-7 w-7 items-center justify-center rounded-lg transition-all duration-200 ${
              open ? "bg-gold/6 rotate-180" : "bg-card/5 group-hover:bg-card/8"
            }`}
          >
            <ChevronDown
              className={`h-3.5 w-3.5 transition-colors ${
                open ? "text-gold/50" : "text-muted-foreground/25"
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
          className="bg-background/20"
        >
          {children}
        </motion.div>
      </CollapsibleContent>
    </Collapsible>
  );
}

/* ══ Sidebar lesson item ══ */

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
      className={`group/item flex items-center gap-3.5 px-5 py-4 transition-all duration-200 relative ${
        isActive
          ? "bg-player-sidebar-active"
          : isNext
            ? "bg-gold/[0.02] hover:bg-gold/[0.05]"
            : "hover:bg-player-sidebar-hover"
      }`}
    >
      {/* Active indicator bar */}
      <div
        className={`absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r-full transition-all duration-300 ${
          isActive
            ? "bg-gold shadow-[0_0_10px_rgba(212,175,55,0.25)]"
            : isNext
              ? "bg-gold/20"
              : "bg-transparent group-hover/item:bg-border/15"
        }`}
      />

      {/* Status icon */}
      <div
        className={`shrink-0 flex h-8 w-8 items-center justify-center rounded-xl transition-all duration-200 ${
          isCompleted
            ? "bg-player-completed/10 ring-1 ring-player-completed/12"
            : isActive
              ? "bg-gold/12 ring-1 ring-gold/20 shadow-sm shadow-gold/8"
              : isNext
                ? "bg-gold/6 ring-1 ring-gold/8"
                : "bg-card/6 ring-1 ring-border/6 group-hover/item:ring-border/12"
        }`}
      >
        {isCompleted ? (
          <CheckCircle2 className="h-4 w-4 text-player-completed" />
        ) : isActive ? (
          <div className="relative">
            <Play className="h-3.5 w-3.5 text-gold fill-gold/40" />
            <span className="absolute -inset-1 rounded-full bg-gold/8 animate-ping" />
          </div>
        ) : isNext ? (
          <Play className="h-3 w-3 text-gold/45" />
        ) : (
          <span className="text-muted-foreground/20">{getTypeIcon()}</span>
        )}
      </div>

      {/* Lesson info */}
      <div className="flex-1 min-w-0">
        <p
          className={`text-[12px] truncate leading-snug transition-colors ${
            isActive
              ? "text-gold font-bold"
              : isCompleted
                ? "text-muted-foreground/35 font-medium"
                : isNext
                  ? "text-gold/60 font-semibold"
                  : "text-foreground/55 font-medium group-hover/item:text-foreground/70"
          }`}
        >
          {lesson.title}
        </p>
        <div className="flex items-center gap-2 mt-1.5">
          {lesson.duration && lesson.duration !== "0:00" && (
            <span className="text-[10px] text-muted-foreground/25 tabular-nums flex items-center gap-1">
              <Clock className="h-2.5 w-2.5" />
              {lesson.duration}
            </span>
          )}
          {isActive && (
            <span className="text-[8px] font-bold uppercase tracking-[0.15em] text-gold bg-gold/8 px-2 py-0.5 rounded-full ring-1 ring-gold/12">
              ▶ Assistindo
            </span>
          )}
          {isNext && !isActive && (
            <span className="text-[8px] font-bold uppercase tracking-[0.12em] text-gold/45 bg-gold/[0.05] px-2 py-0.5 rounded-full ring-1 ring-gold/6">
              Próxima
            </span>
          )}
          {isCompleted && (
            <span className="text-[8px] font-semibold uppercase tracking-wider text-player-completed/50 flex items-center gap-1">
              <CheckCircle2 className="h-2.5 w-2.5" />
              Concluída
            </span>
          )}
        </div>
      </div>

      {/* Right arrow on hover */}
      {!isCompleted && !isActive && (
        <div className="shrink-0 opacity-0 group-hover/item:opacity-100 transition-opacity duration-200">
          <ArrowRight className="h-3 w-3 text-gold/35" />
        </div>
      )}
    </Link>
  );
}
