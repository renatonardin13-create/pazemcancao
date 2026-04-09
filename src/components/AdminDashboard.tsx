import { useQuery } from "@tanstack/react-query";
import { getDashboardStats } from "@/lib/admin-dashboard.functions";
import {
  BookOpen,
  Users,
  GraduationCap,
  Activity,
  TrendingUp,
  Video,
  BookText,
  BarChart3,
  Music,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function AdminDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: () => getDashboardStats(),
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Page title */}
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground/85 tracking-tight">
          Dashboard
        </h1>
        <p className="mt-1 text-[13px] text-muted-foreground/40">
          Visão geral da plataforma de cursos
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Cursos Ativos",
            value: data?.publishedCourses ?? "—",
            total: data?.totalCourses,
            icon: BookOpen,
            color: "text-gold/60",
          },
          {
            label: "Alunos",
            value: data?.totalStudents ?? "—",
            icon: Users,
            color: "text-emerald-500/60",
          },
          {
            label: "Matrículas",
            value: data?.totalEnrollments ?? "—",
            active: data?.activeEnrollments,
            icon: GraduationCap,
            color: "text-blue-400/60",
          },
          {
            label: "Sessões Ativas",
            value: data?.activeSessions ?? "—",
            icon: Activity,
            color: "text-amber-400/60",
          },
          {
            label: "Músicas",
            value: data?.activeTracks ?? "—",
            total: data?.totalTracks,
            icon: Music,
            color: "text-purple-400/60",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-border/15 bg-card/10 p-5 transition-colors hover:bg-card/15"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted/20">
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </div>
            <p className="font-display text-2xl font-bold text-foreground/80">
              {isLoading ? "—" : stat.value}
            </p>
            <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground/30 mt-1">
              {stat.label}
            </p>
            {"total" in stat && stat.total != null && !isLoading && (
              <p className="text-[10px] text-muted-foreground/25 mt-0.5">
                de {stat.total} total
              </p>
            )}
            {"active" in stat && stat.active != null && !isLoading && (
              <p className="text-[10px] text-emerald-500/40 mt-0.5">
                {stat.active} ativas
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Recent courses */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground/70 tracking-tight">
            Cursos Recentes
          </h2>
          <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/25">
            {data?.totalCourses ?? 0} cursos
          </span>
        </div>

        {isLoading ? (
          <div className="text-center py-16">
            <p className="text-[11px] uppercase tracking-[0.4em] text-muted-foreground/25 animate-pulse">
              Carregando...
            </p>
          </div>
        ) : !data?.recentCourses?.length ? (
          <div className="text-center py-16 rounded-2xl border border-border/15 bg-card/5">
            <BookOpen className="h-8 w-8 text-muted-foreground/15 mx-auto mb-4" />
            <p className="text-sm text-muted-foreground/35">
              Nenhum curso cadastrado ainda.
            </p>
            <p className="text-[12px] text-muted-foreground/25 mt-1">
              Crie seu primeiro curso na aba "Cursos".
            </p>
          </div>
        ) : (
          <div className="rounded-2xl border border-border/15 overflow-hidden">
            {data.recentCourses.map((course: any) => (
              <div
                key={course.id}
                className="flex items-center gap-4 px-5 py-4 border-b border-border/8 last:border-0 hover:bg-card/10 transition-colors"
              >
                {course.cover_image_url ? (
                  <img
                    src={course.cover_image_url}
                    alt={course.title}
                    className="h-10 w-10 rounded-lg object-cover shrink-0"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted/15 shrink-0">
                    {course.course_type === "video" ? (
                      <Video className="h-4 w-4 text-gold/40" />
                    ) : (
                      <BookText className="h-4 w-4 text-blue-400/40" />
                    )}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground/75 truncate">
                    {course.title}
                  </p>
                  <p className="text-[11px] text-muted-foreground/30">
                    {course.course_type === "video" ? "Vídeo" : "eBook"} ·{" "}
                    R$ {Number(course.price).toFixed(2)}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className={`text-[9px] rounded-full px-2 border ${
                    course.status === "published"
                      ? "text-emerald-400/60 border-emerald-500/15 bg-emerald-500/8"
                      : course.status === "draft"
                        ? "text-gold/50 border-gold/12 bg-gold/8"
                        : "text-muted-foreground/30 border-border/20"
                  }`}
                >
                  {course.status === "published"
                    ? "Publicado"
                    : course.status === "draft"
                      ? "Rascunho"
                      : "Arquivado"}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Indicators */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-border/15 bg-card/10 p-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-4 w-4 text-gold/40" />
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/40">
              Categorias
            </h3>
          </div>
          <p className="font-display text-3xl font-bold text-foreground/80">
            {isLoading ? "—" : data?.totalCategories ?? 0}
          </p>
          <p className="text-[11px] text-muted-foreground/30 mt-1">
            categorias cadastradas
          </p>
        </div>

        <div className="rounded-2xl border border-border/15 bg-card/10 p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-4 w-4 text-emerald-500/40" />
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/40">
              Taxa de Atividade
            </h3>
          </div>
          <p className="font-display text-3xl font-bold text-foreground/80">
            {isLoading || !data?.totalEnrollments
              ? "—"
              : data.totalEnrollments > 0
                ? `${Math.round(((data.activeEnrollments || 0) / data.totalEnrollments) * 100)}%`
                : "0%"}
          </p>
          <p className="text-[11px] text-muted-foreground/30 mt-1">
            matrículas ativas
          </p>
        </div>
      </div>
    </div>
  );
}
