import { useQuery } from "@tanstack/react-query";
import { getDashboardStats } from "@/lib/admin-dashboard.functions";
import { LayoutDashboard, Users, GraduationCap, Music, CreditCard, Activity, TrendingUp, CheckCircle2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function AdminDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["admin-dashboard-stats"],
    queryFn: () => getDashboardStats(),
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700">
      <div>
        <h1 className="font-display text-3xl font-black text-foreground tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground/50 mt-1 uppercase tracking-widest font-medium">Bem-vindo ao seu painel de controle</p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard 
          icon={CreditCard} 
          label="Receita Total" 
          value={isLoading ? null : new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats?.totalRevenue ?? 0)} 
          isLoading={isLoading}
        />
        <StatCard 
          icon={Users} 
          label="Total de Alunos" 
          value={isLoading ? null : (stats?.totalStudents ?? 0).toString()} 
          isLoading={isLoading}
        />
        <StatCard 
          icon={GraduationCap} 
          label="Produtos Ativos" 
          value={isLoading ? null : (stats?.activeCourses ?? 0).toString()} 
          isLoading={isLoading}
        />
        <StatCard 
          icon={Music} 
          label="Louvores Ativos" 
          value={isLoading ? null : (stats?.activeTracks ?? 0).toString()} 
          isLoading={isLoading}
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Performance Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card/40 backdrop-blur-sm rounded-3xl border border-border/10 p-8 shadow-xl shadow-black/10">
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-display text-xl font-bold text-foreground/80 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-gold" />
                Desempenho de Vendas
              </h3>
              <div className="px-3 py-1 rounded-full bg-gold/10 border border-gold/10 text-[10px] font-bold text-gold uppercase tracking-widest">
                Tempo Real
              </div>
            </div>
            
            <div className="h-[240px] flex flex-col items-center justify-center text-center space-y-4 border border-dashed border-border/20 rounded-2xl bg-black/5">
              <Activity className="h-8 w-8 text-muted-foreground/20 animate-pulse" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground/60">Gráfico em processamento</p>
                <p className="text-[11px] text-muted-foreground/40 max-w-[200px] mx-auto">As estatísticas detalhadas de vendas estão sendo compiladas.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Top Courses Section */}
        <div className="space-y-6">
          <div className="bg-card/40 backdrop-blur-sm rounded-3xl border border-border/10 p-8 shadow-xl shadow-black/10 h-full">
            <h3 className="font-display text-xl font-bold text-foreground/80 mb-6 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-gold" />
              Top Performance
            </h3>
            
            <div className="space-y-5">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-12 w-12 rounded-xl" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                ))
              ) : stats?.topCourses?.length ? (
                stats.topCourses.map((course) => (
                  <div key={course.id} className="flex items-center gap-4 group cursor-default">
                    <div className="h-12 w-12 rounded-xl bg-muted/20 overflow-hidden shrink-0 border border-border/10 group-hover:border-gold/30 transition-colors">
                      {course.coverUrl ? (
                        <img src={course.coverUrl} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center bg-gold/5">
                          <GraduationCap className="h-5 w-5 text-gold/40" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-foreground/80 truncate">{course.title}</p>
                      <p className="text-[11px] text-muted-foreground/50">{course.students} alunos ativos</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <p className="text-xs text-muted-foreground/40">Nenhum dado disponível</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


function StatCard({ icon: Icon, label, value, isLoading }: { icon: any, label: string, value: string | null, isLoading: boolean }) {
  return (
    <div className="bg-card/40 backdrop-blur-sm rounded-3xl border border-border/10 p-6 flex items-center gap-5 shadow-lg shadow-black/5 hover:border-gold/20 transition-all duration-300 group">
      <div className="h-14 w-14 rounded-2xl bg-gold/10 flex items-center justify-center border border-gold/10 group-hover:scale-110 transition-transform duration-500">
        <Icon className="h-7 w-7 text-gold drop-shadow-[0_0_8px_rgba(212,175,55,0.3)]" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-black text-muted-foreground/50 uppercase tracking-[0.2em] mb-0.5">{label}</p>
        {isLoading ? (
          <Skeleton className="h-7 w-20 bg-muted/20 mt-1" />
        ) : (
          <p className="text-2xl font-black text-foreground/90 tracking-tight tabular-nums">{value}</p>
        )}
      </div>
    </div>
  );
}