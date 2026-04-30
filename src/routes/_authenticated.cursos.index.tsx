import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  BookOpen,
  Search,
  ArrowRight,
  Play,
  CheckCircle2,
  Sparkles,
  Clock,
  LibraryBig,
} from "lucide-react";
import { useMemo, useState } from "react";

import { EmptyState } from "@/components/EmptyState";
import { useArea } from "@/providers/AreaProvider";
import { CardGridSkeleton } from "@/components/LoadingSkeletons";
import { StudentLayout } from "@/components/StudentLayout";
import { FooterLinks } from "@/components/FooterLinks";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ShelfRow } from "@/components/vitrine/ShelfRow";
import { CoursePosterCard } from "@/components/vitrine/CoursePosterCard";
import type { VitrineCourse } from "@/components/vitrine/types";
import { CardScopeProvider } from "@/hooks/use-cards-config";
// CoursePosterCard re-exportado abaixo para compatibilidade.
import { useAuth } from "@/hooks/use-auth";
import { getMyProfile } from "@/lib/profile.functions";
import { getMyCoursesData } from "@/lib/my-courses.functions";
import { getContinueWatching } from "@/lib/continue-watching.functions";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/cursos/")({
  component: MeusCursosPageWithScope,
});

function MeusCursosPageWithScope() {
  return (
    <CardScopeProvider scope="cursos">
      <MeusCursosPage />
    </CardScopeProvider>
  );
}

type StatusFilter = "all" | "in_progress" | "not_started" | "completed" | "recent";

const NEW_THRESHOLD_DAYS = 14;

function isNewCourse(course: VitrineCourse): boolean {
  const ref = (course as any).granted_at || (course as any).enrolled_at;
  if (!ref) return false;
  const days = (Date.now() - new Date(ref).getTime()) / (1000 * 60 * 60 * 24);
  return days <= NEW_THRESHOLD_DAYS && Number(course.progress_pct ?? 0) === 0;
}

function getStatus(course: VitrineCourse): "new" | "not_started" | "in_progress" | "completed" {
  const p = Number(course.progress_pct ?? 0);
  if (p >= 100) return "completed";
  if (p > 0) return "in_progress";
  if (isNewCourse(course)) return "new";
  return "not_started";
}

const STATUS_LABEL: Record<ReturnType<typeof getStatus>, string> = {
  new: "Novo",
  not_started: "Não iniciado",
  in_progress: "Em andamento",
  completed: "Concluído",
};

const STATUS_CLASS: Record<ReturnType<typeof getStatus>, string> = {
  new: "bg-primary/15 text-primary border-primary/30",
  not_started: "bg-muted/40 text-muted-foreground border-border/40",
  in_progress: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  completed: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
};

/**
 * Biblioteca premium do aluno.
 * Mostra APENAS cursos com entitlement real ativo. Catálogo em /vitrine.
 */
function MeusCursosPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { currentArea } = useArea();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const { data: profileData } = useQuery({
    queryKey: ["my-profile"],
    queryFn: () => getMyProfile(),
    staleTime: 60_000,
  });

  const { data: myData, isLoading } = useQuery({
    queryKey: ["my-courses-library", "v2", currentArea?.id],
    queryFn: () => getMyCoursesData({ data: { areaId: currentArea?.id } }),
    staleTime: 30_000,
  });

  const { data: continueData } = useQuery({
    queryKey: ["my-courses-library", "continue-watching"],
    queryFn: () => getContinueWatching(),
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });

  const displayName = profileData?.profile?.display_name || user?.email?.split("@")[0] || "aluno";
  const firstName = displayName.split(" ")[0];

  const myCourses: VitrineCourse[] = useMemo(
    () => (Array.isArray(myData?.courses) ? myData.courses.filter((c) => Boolean(c?.id)) : []),
    [myData],
  );
  const ownedIds = useMemo(() => new Set(myCourses.map((c) => c.id)), [myCourses]);

  const counts = useMemo(() => {
    let inProgress = 0;
    let completed = 0;
    let novos = 0;
    for (const c of myCourses) {
      const s = getStatus(c);
      if (s === "in_progress") inProgress++;
      else if (s === "completed") completed++;
      else if (s === "new") novos++;
    }
    return { total: myCourses.length, inProgress, completed, novos };
  }, [myCourses]);

  const continueWatching: VitrineCourse[] = useMemo(
    () =>
      (Array.isArray(continueData?.courses) ? continueData.courses : []).filter(
        (c: VitrineCourse) => Boolean(c?.id) && ownedIds.has(c.id),
      ),
    [continueData, ownedIds],
  );

  // Hero "Continue de onde parou" = curso com maior recência em progresso
  const heroCourse: VitrineCourse | null = useMemo(() => {
    if (continueWatching.length > 0) return continueWatching[0];
    const inProg = myCourses.filter((c) => {
      const p = Number(c.progress_pct ?? 0);
      return p > 0 && p < 100;
    });
    return inProg[0] || null;
  }, [continueWatching, myCourses]);

  // Recentemente acessados (excluindo o hero)
  const recentlyAccessed: VitrineCourse[] = useMemo(() => {
    const list = [...myCourses]
      .filter((c) => Boolean((c as any).last_accessed_at))
      .sort(
        (a, b) =>
          new Date((b as any).last_accessed_at).getTime() -
          new Date((a as any).last_accessed_at).getTime(),
      );
    return list.filter((c) => c.id !== heroCourse?.id).slice(0, 8);
  }, [myCourses, heroCourse]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    let arr = [...myCourses];

    if (statusFilter === "in_progress") {
      arr = arr.filter((c) => getStatus(c) === "in_progress");
    } else if (statusFilter === "not_started") {
      arr = arr.filter((c) => {
        const s = getStatus(c);
        return s === "not_started" || s === "new";
      });
    } else if (statusFilter === "completed") {
      arr = arr.filter((c) => getStatus(c) === "completed");
    } else if (statusFilter === "recent") {
      arr.sort((a, b) => {
        const ad = new Date((a as any).last_accessed_at || (a as any).granted_at || 0).getTime();
        const bd = new Date((b as any).last_accessed_at || (b as any).granted_at || 0).getTime();
        return bd - ad;
      });
    }

    if (term) {
      arr = arr.filter((c) =>
        [c.title, c.short_description]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(term)),
      );
    }
    return arr;
  }, [myCourses, statusFilter, search]);

  const handleOpenCourse = (id: string) => {
    navigate({ to: "/cursos/$courseId", params: { courseId: id } });
  };

  const filterTabs: { value: StatusFilter; label: string; count?: number }[] = [
    { value: "all", label: "Todos", count: counts.total },
    { value: "in_progress", label: "Em andamento", count: counts.inProgress },
    { value: "not_started", label: "Não iniciados" },
    { value: "completed", label: "Concluídos", count: counts.completed },
    { value: "recent", label: "Recentes" },
  ];

  return (
    <StudentLayout>
      <div className="flex min-h-screen flex-col bg-background">
        <main className="flex-1 pt-8 pb-20 sm:pt-10">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-8 lg:px-10">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="mb-8"
            >
              <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-primary/80">
                Olá, {firstName}
              </span>
              <h1 className="mt-1 font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                Meus{" "}
                <span className="bg-gradient-to-r from-primary via-amber-300 to-primary bg-clip-text text-transparent">
                  Cursos
                </span>
              </h1>
              <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-muted-foreground/75">
                Sua biblioteca pessoal — tudo o que você liberou, pronto pra continuar.
              </p>
            </motion.div>

            {isLoading ? (
              <CardGridSkeleton count={6} />
            ) : myCourses.length === 0 ? (
              <EmptyState
                icon={BookOpen}
                title="Sua biblioteca está esperando você"
                description="Você ainda não possui cursos liberados. Conheça o catálogo completo na Vitrine."
                actionTo="/home"
                actionLabel="Ir para a Vitrine"
              />
            ) : (
              <>
                {/* Resumo */}
                <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
                  <SummaryCard
                    icon={LibraryBig}
                    label="Comprados"
                    value={counts.total}
                    tone="primary"
                  />
                  <SummaryCard
                    icon={Play}
                    label="Em andamento"
                    value={counts.inProgress}
                    tone="amber"
                  />
                  <SummaryCard
                    icon={CheckCircle2}
                    label="Concluídos"
                    value={counts.completed}
                    tone="emerald"
                  />
                  <SummaryCard
                    icon={Sparkles}
                    label="Novos"
                    value={counts.novos}
                    tone="primary"
                  />
                </div>

                {/* Busca + filtros */}
                <div className="mb-8 flex flex-col gap-4">
                  <div className="relative w-full max-w-md">
                    <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/40" />
                    <Input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Buscar nos seus cursos..."
                      className="h-12 rounded-xl border-border/30 bg-card/40 pl-11 text-sm placeholder:text-muted-foreground/40 focus:border-primary/40 focus:ring-primary/15"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {filterTabs.map((tab) => {
                      const active = statusFilter === tab.value;
                      return (
                        <button
                          key={tab.value}
                          onClick={() => setStatusFilter(tab.value)}
                          className={cn(
                            "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-wide transition-all",
                            active
                              ? "border-primary/50 bg-primary/15 text-primary shadow-[0_0_0_1px_rgba(255,165,0,0.15)]"
                              : "border-border/30 bg-card/40 text-muted-foreground/80 hover:border-border/60 hover:text-foreground",
                          )}
                        >
                          {tab.label}
                          {typeof tab.count === "number" && (
                            <span
                              className={cn(
                                "rounded-full px-1.5 text-[10px] tabular-nums",
                                active ? "bg-primary/20 text-primary" : "bg-muted/40 text-muted-foreground/70",
                              )}
                            >
                              {tab.count}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Hero: Continue de onde parou */}
                {heroCourse && statusFilter === "all" && !search && (
                  <ContinueHero course={heroCourse} onOpen={handleOpenCourse} />
                )}

                {/* Seus Cursos */}
                <div className="mt-10 space-y-12">
                  {filtered.length > 0 ? (
                    <ShelfRow
                      title={statusFilter === "all" ? "Seus Cursos" : filterTabs.find((t) => t.value === statusFilter)?.label || "Seus Cursos"}
                      courses={filtered}
                    />
                  ) : (
                    <EmptyState
                      icon={Search}
                      title="Nenhum curso encontrado"
                      description="Tente outro filtro ou termo de busca."
                    />
                  )}

                  {/* Recentemente acessados */}
                  {statusFilter === "all" && !search && recentlyAccessed.length > 0 && (
                    <ShelfRow title="Recentemente acessados" courses={recentlyAccessed} />
                  )}

                  {/* CTA Vitrine */}
                  <div className="rounded-2xl border border-border/25 bg-gradient-to-br from-card/50 via-card/30 to-card/50 p-6 sm:p-8">
                    <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="space-y-1">
                        <h3 className="font-display text-lg font-semibold text-foreground sm:text-xl">
                          Quer mais conteúdo?
                        </h3>
                        <p className="text-sm text-muted-foreground/70">
                          Descubra novos cursos disponíveis na Vitrine.
                        </p>
                      </div>
                      <Link
                        to="/home"
                        className="group inline-flex shrink-0 items-center gap-2 rounded-full border border-primary/30 bg-primary/[0.08] px-5 py-2.5 text-sm font-semibold text-primary transition-all duration-300 hover:border-primary/50 hover:bg-primary/[0.12]"
                      >
                        Ir para a Vitrine
                        <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                      </Link>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </main>

        <FooterLinks />
      </div>
    </StudentLayout>
  );
}

/* ---------- Subcomponentes ---------- */

function SummaryCard({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  tone: "primary" | "amber" | "emerald";
}) {
  const toneClass =
    tone === "primary"
      ? "text-primary bg-primary/10 border-primary/20"
      : tone === "amber"
      ? "text-amber-300 bg-amber-500/10 border-amber-500/20"
      : "text-emerald-300 bg-emerald-500/10 border-emerald-500/20";
  return (
    <div className="rounded-xl border border-border/25 bg-card/40 p-4 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg border", toneClass)}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <div className="text-2xl font-bold tabular-nums text-foreground">{value}</div>
          <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground/70">
            {label}
          </div>
        </div>
      </div>
    </div>
  );
}

function ContinueHero({
  course,
  onOpen,
}: {
  course: VitrineCourse;
  onOpen: (id: string) => void;
}) {
  const progress = Math.round(Number(course.progress_pct ?? 0));
  const status = getStatus(course);
  const banner =
    (course as any).banner_image_url ||
    (course as any).cover_image_url ||
    null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative mb-2 overflow-hidden rounded-3xl border border-border/30 bg-card/40 shadow-[0_8px_40px_rgba(0,0,0,0.4)]"
    >
      <div className="relative aspect-[16/7] w-full sm:aspect-[21/8]">
        {banner ? (
          <img
            src={banner}
            alt={course.title}
            className="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-card to-card" />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-background/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />

        <div className="relative z-10 flex h-full flex-col justify-end gap-4 p-6 sm:p-10">
          <div className="flex items-center gap-2">
            <Clock className="h-3.5 w-3.5 text-primary" />
            <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-primary/90">
              Continue de onde parou
            </span>
          </div>
          <h2 className="max-w-2xl font-display text-2xl font-bold tracking-tight text-foreground sm:text-4xl">
            {course.title}
          </h2>
          {course.short_description && (
            <p className="max-w-xl text-sm text-muted-foreground/85 sm:text-base line-clamp-2">
              {course.short_description}
            </p>
          )}

          {/* Progresso */}
          <div className="max-w-md space-y-2">
            <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wide text-muted-foreground/80">
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px]",
                  STATUS_CLASS[status],
                )}
              >
                {STATUS_LABEL[status]}
              </span>
              <span className="tabular-nums text-primary">{progress}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-muted/30">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary to-amber-300 transition-all"
                style={{ width: `${Math.max(2, progress)}%` }}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <Button
              onClick={() => onOpen(course.id)}
              className="group h-11 rounded-full bg-primary px-6 text-sm font-bold text-primary-foreground hover:bg-primary/90"
            >
              <Play className="mr-2 h-4 w-4 fill-current" />
              {progress > 0 ? "Continuar" : "Começar agora"}
            </Button>
            <Button
              variant="outline"
              onClick={() => onOpen(course.id)}
              className="h-11 rounded-full border-border/50 bg-background/40 px-6 text-sm font-semibold backdrop-blur-sm hover:bg-background/60"
            >
              Ver detalhes
            </Button>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

// Re-export to keep the old named import working if referenced anywhere
export { CoursePosterCard };
