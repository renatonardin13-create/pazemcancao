import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getLessonDetail } from "@/lib/lesson-detail.functions";
import { updateLessonProgress } from "@/lib/courses.functions";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronDown,
  Play,
  Download,
  Video,
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
    <div className="flex min-h-screen items-center justify-center bg-[#0b0b0b]">
      <div className="text-center space-y-4">
        <BookOpen className="mx-auto h-10 w-10 text-white/10" />
        <p className="text-white/20 text-sm">Aula não encontrada.</p>
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

      if (completionSourceRef.current === "video") {
        setShowNextUp(true);
        setCountdown(5);
      }
      completionSourceRef.current = "manual";
    },
  });

  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    return () => {
      videoRef.current?.pause();
      videoRef.current = null;
    };
  }, [lessonId]);

  useEffect(() => {
    setCountdown(null);
    setShowNextUp(false);
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
  }, [lessonId]);

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
  }, [countdown]);

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
      <div className="flex min-h-screen items-center justify-center bg-[#0b0b0b]">
        <div className="text-center space-y-4">
          <div className="relative mx-auto h-12 w-12">
            <div className="absolute inset-0 rounded-full border-2 border-white/5" />
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-gold animate-spin" />
          </div>
          <p className="text-[10px] uppercase tracking-[0.35em] text-white/20 font-black">
            Carregando sua aula...
          </p>
        </div>
      </div>
    );
  }

  if (error || !data?.lesson) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0b0b0b]">
        <div className="text-center space-y-5">
          <div className="mx-auto h-16 w-16 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center">
            <BookOpen className="h-7 w-7 text-white/20" />
          </div>
          <Button variant="premiumOutline" size="sm" asChild>
            <Link to="/home">Voltar</Link>
          </Button>
        </div>
      </div>
    );
  }

  const {
    course,
    lesson,
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
  const isYouTube =
    hasVideo &&
    (videoUrl.includes("youtube.com") || videoUrl.includes("youtu.be"));
  const isVimeo = hasVideo && videoUrl.includes("vimeo.com");
  const isCourseCompleted = progressPercent >= 100;

  const legacySupplementaryMaterial =
    hasVideo && contentUrl
      ? {
          id: "legacy-content-url",
          title: lesson.title,
          material_type: contentType === "link" ? "link" : contentType === "pdf" ? "pdf" : "file",
          url: contentUrl,
        }
      : null;

  const displayedMaterials = legacySupplementaryMaterial
    ? [legacySupplementaryMaterial, ...(materials || [])]
    : materials || [];

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

  return (
    <div className="min-h-screen bg-[#0b0b0b] flex flex-col">
      {/* ═══ HEADER ═══ */}
      <header className="sticky top-0 z-30 border-b border-white/5 bg-[#0b0b0b]/90 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-[1800px] items-center gap-4 px-5 py-4 sm:px-8">
          <Link 
            to="/home" 
            className="group flex items-center gap-2 text-white/40 hover:text-white transition-colors"
          >
            <ChevronLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
            <span className="hidden sm:inline text-sm font-black uppercase tracking-widest">Sair do player</span>
          </Link>

          <div className="hidden h-6 w-px bg-white/5 sm:block" />

          <div className="min-w-0 flex-1">
            <h1 className="truncate text-base sm:text-lg font-black text-white leading-tight">
              {lesson.title}
            </h1>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold/60 mt-0.5">
              {course.title}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-4 rounded-2xl border border-white/5 bg-white/5 px-5 py-2.5">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-[10px] font-black uppercase tracking-widest text-white/20">Progresso</span>
            </div>
            <div className="w-24 sm:w-32 h-1.5 rounded-full bg-white/10 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                className="h-full rounded-full bg-gold shadow-[0_0_10px_rgba(234,179,8,0.5)]"
              />
            </div>
            <span className="text-sm font-black text-gold">{progressPercent}%</span>
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row">
        <main className="flex-1 min-w-0 flex flex-col">
          {accessRestricted && (
            <div className="flex items-center justify-center min-h-[65vh] p-8">
              <div className="max-w-sm text-center space-y-6">
                <div className="mx-auto h-20 w-20 rounded-3xl bg-gold/5 border border-gold/10 flex items-center justify-center">
                  <Award className="h-8 w-8 text-gold/20" />
                </div>
                <h2 className="text-xl font-black text-white">Aula bloqueada</h2>
                <Button variant="premiumOutline" size="lg" asChild className="rounded-2xl h-14 px-10">
                  <Link to="/home">Voltar para vitrine</Link>
                </Button>
              </div>
            </div>
          )}

          {!accessRestricted && hasVideo && (
            <div className="relative aspect-video bg-black">
              {isYouTube || isVimeo ? (
                <iframe
                  src={isYouTube ? getYouTubeEmbedUrl(videoUrl) : getVimeoEmbedUrl(videoUrl)}
                  className="w-full h-full"
                  allowFullScreen
                />
              ) : (
                <video
                  ref={videoRef}
                  src={videoUrl}
                  controls
                  className="w-full h-full"
                  onEnded={() => {
                    if (!isCompleted) {
                      completionSourceRef.current = "video";
                      progressMutation.mutate({ lessonId, watchedSeconds: 0, completed: true });
                    }
                  }}
                />
              )}
            </div>
          )}

          {(isPdf || isEbook) && (
            <EbookReader
              pdfUrl={contentUrl}
              title={lesson.title}
              onComplete={() => {
                if (!isCompleted) progressMutation.mutate({ lessonId, watchedSeconds: 0, completed: true });
              }}
            />
          )}

          <div className="p-8 sm:p-12 space-y-12">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="space-y-2">
                <h2 className="text-3xl font-black text-white">{lesson.title}</h2>
                <p className="text-white/40 text-sm leading-relaxed max-w-2xl">
                  {lesson.description || "Nenhuma descrição disponível para esta aula."}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  onClick={() => progressMutation.mutate({ lessonId, watchedSeconds: 0, completed: !isCompleted })}
                  className={`h-14 px-8 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
                    isCompleted ? "bg-emerald-500 text-white" : "bg-white/5 text-white/40 hover:bg-white/10"
                  }`}
                >
                  {isCompleted ? <CheckCircle2 className="mr-2 h-4 w-4" /> : null}
                  {isCompleted ? "Concluída" : "Marcar como concluída"}
                </Button>
              </div>
            </div>

            {displayedMaterials.length > 0 && (
              <div className="space-y-6">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/20">Materiais complementares</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {displayedMaterials.map((m: any) => (
                    <button
                      key={m.id}
                      onClick={() => window.open(m.url, "_blank")}
                      className="flex items-center gap-4 p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-gold/30 hover:bg-white/10 transition-all text-left"
                    >
                      <div className="h-12 w-12 rounded-xl bg-gold/10 flex items-center justify-center">
                        <Download className="h-5 w-5 text-gold" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-black text-white truncate">{m.title}</p>
                        <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mt-1">Baixar arquivo</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>

        <aside className="w-full lg:w-[360px] xl:w-[400px] shrink-0 border-t lg:border-t-0 lg:border-l border-white/5 bg-[#111] lg:overflow-y-auto lg:max-h-[calc(100vh-80px)] lg:sticky lg:top-[80px]">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="flex lg:hidden items-center justify-between w-full px-5 py-4 text-[13px] font-black text-white/60 active:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <List className="h-4 w-4 text-gold" />
              <span>Conteúdo · {completedCount}/{totalLessons}</span>
            </div>
            <ChevronDown className={`h-4 w-4 transition-transform ${sidebarOpen ? "rotate-180" : ""}`} />
          </button>

          <div className={`${sidebarOpen ? "block" : "hidden"} lg:block`}>
            <div className="border-b border-white/5 p-6 space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-white/5 bg-white/5">
                  <img src={course.cover_image_url} alt={course.title} className="h-full w-full object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-black text-white line-clamp-2">{course.title}</h3>
                  <div className="mt-2 h-1 w-full bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-gold" style={{ width: `${progressPercent}%` }} />
                  </div>
                </div>
              </div>

              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/20" />
                <Input
                  placeholder="Buscar aula..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-11 border-white/5 bg-white/5 pl-10 text-xs rounded-xl focus:border-gold/30 focus:ring-gold/10"
                />
              </div>
            </div>

            <div className="divide-y divide-white/5">
              {modules.length > 0 ? (
                modules.map((mod: any) => {
                  const modLessons = (moduleMap[mod.id] || []) as any[];
                  if (modLessons.length === 0) return null;
                  return (
                    <ModuleSection
                      key={mod.id}
                      title={mod.title}
                      completedCount={modLessons.filter((l: any) => isLessonCompleted(l.id)).length}
                      totalCount={modLessons.length}
                      defaultOpen={modLessons.some((l: any) => l.id === lessonId)}
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
                })
              ) : (
                unmoduled.map((l: any) => (
                  <LessonSidebarItem
                    key={l.id}
                    lesson={l}
                    courseId={courseId}
                    isActive={l.id === lessonId}
                    isCompleted={isLessonCompleted(l.id)}
                    isNext={l.id === nextLesson?.id}
                  />
                ))
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function ModuleSection({ title, completedCount, totalCount, defaultOpen, children }: any) {
  const [open, setOpen] = useState(defaultOpen);
  const allDone = completedCount === totalCount;

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <button className={`flex items-center gap-4 w-full px-6 py-5 text-left transition-all ${open ? "bg-white/[0.03]" : "hover:bg-white/[0.02]"}`}>
          <div className={`shrink-0 flex h-10 w-10 items-center justify-center rounded-xl font-black ${allDone ? "bg-emerald-500/10 text-emerald-500" : "bg-white/5 text-white/20"}`}>
            {allDone ? <CheckCircle2 className="h-4 w-4" /> : <BookOpen className="h-4 w-4" />}
          </div>
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-black truncate ${open ? "text-white" : "text-white/40"}`}>{title}</p>
            <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mt-1">{completedCount}/{totalCount} aulas</p>
          </div>
          <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180 text-gold" : "text-white/10"}`} />
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent>{children}</CollapsibleContent>
    </Collapsible>
  );
}

function LessonSidebarItem({ lesson, courseId, isActive, isCompleted, isNext }: any) {
  return (
    <Link
      to="/cursos/$courseId/aula/$lessonId"
      params={{ courseId, lessonId: lesson.id }}
      className={`group flex items-center gap-4 px-6 py-5 transition-all relative ${isActive ? "bg-gold/10" : "hover:bg-white/[0.02]"}`}
    >
      <div className={`absolute left-0 top-0 bottom-0 w-[4px] transition-all ${isActive ? "bg-gold" : "bg-transparent"}`} />
      <div className={`shrink-0 flex h-10 w-10 items-center justify-center rounded-2xl transition-all ${isCompleted ? "bg-emerald-500/10 text-emerald-500" : isActive ? "bg-gold text-black" : "bg-white/5 text-white/20"}`}>
        {isCompleted ? <CheckCircle2 className="h-5 w-5" /> : isActive ? <Play className="h-4 w-4 fill-current" /> : <div className="text-[10px] font-black">•</div>}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className={`text-sm font-black leading-tight ${isActive ? "text-white" : "text-white/40 group-hover:text-white/80"}`}>{lesson.title}</h4>
        {lesson.duration && lesson.duration !== "0:00" && (
          <div className="mt-1.5 flex items-center gap-1 text-[10px] font-bold text-white/20">
            <Clock className="h-3 w-3" /> {lesson.duration}
          </div>
        )}
      </div>
    </Link>
  );
}
