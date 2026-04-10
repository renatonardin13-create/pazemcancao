import { useQuery } from "@tanstack/react-query";
import { getDashboardStats } from "@/lib/admin-dashboard.functions";
import {
  Users,
  Activity,
  BarChart3,
  Music,
} from "lucide-react";

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
          Visão geral da plataforma
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Músicas",
            value: data?.activeTracks ?? "—",
            total: data?.totalTracks,
            icon: Music,
            color: "text-purple-400/60",
          },
          {
            label: "Alunos",
            value: data?.totalStudents ?? "—",
            icon: Users,
            color: "text-emerald-500/60",
          },
          {
            label: "Sessões Ativas",
            value: data?.activeSessions ?? "—",
            icon: Activity,
            color: "text-amber-400/60",
          },
          {
            label: "Categorias",
            value: data?.totalCategories ?? "—",
            icon: BarChart3,
            color: "text-gold/60",
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
          </div>
        ))}
      </div>
    </div>
  );
}
