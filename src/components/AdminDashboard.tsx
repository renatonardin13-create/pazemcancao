import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getDashboardStats } from "@/lib/admin-dashboard.functions";
import { getDashboardAnalytics } from "@/lib/analytics.functions";
import {
  Users, Activity, BarChart3, Music, Headphones, Download,
  TrendingUp,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  AreaChart, Area,
} from "recharts";

const PERIOD_OPTIONS = [
  { label: "7 dias", value: 7 },
  { label: "30 dias", value: 30 },
  { label: "90 dias", value: 90 },
] as const;

export function AdminDashboard() {
  const [days, setDays] = useState(30);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: () => getDashboardStats(),
    staleTime: 60_000, // 1 min cache
  });

  const { data: rawAnalytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ["admin-analytics", days],
    queryFn: () => getDashboardAnalytics({ data: { days } }),
    staleTime: 60_000,
  });

  const analytics = rawAnalytics as any;

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
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: "Músicas", value: data?.activeTracks ?? "—", total: data?.totalTracks, icon: Music, color: "text-purple-400/60" },
          { label: "Alunos", value: data?.totalStudents ?? "—", icon: Users, color: "text-emerald-500/60" },
          { label: "Sessões Ativas", value: data?.activeSessions ?? "—", icon: Activity, color: "text-amber-400/60" },
          { label: "Total Plays", value: analytics?.totalPlays ?? "—", icon: Headphones, color: "text-blue-400/60" },
          { label: "Downloads", value: analytics?.totalDownloads ?? "—", icon: Download, color: "text-gold/60" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-border/15 bg-card/10 p-5 transition-colors hover:bg-card/15">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted/20">
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </div>
            <p className="font-display text-2xl font-bold text-foreground/80">
              {isLoading || analyticsLoading ? "—" : stat.value}
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

      {/* Period filter + Analytics Tabs */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground/60">Análise de Engajamento</h2>
          <div className="flex gap-1 rounded-xl bg-muted/10 border border-border/10 p-0.5">
            {PERIOD_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setDays(opt.value)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
                  days === opt.value
                    ? "bg-primary/20 text-primary shadow-sm"
                    : "text-muted-foreground/40 hover:text-muted-foreground/60"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="bg-muted/10 border border-border/10">
          <TabsTrigger value="overview" className="text-[11px] data-[state=active]:bg-card/20">
            <TrendingUp className="h-3.5 w-3.5 mr-1.5" /> Evolução
          </TabsTrigger>
          <TabsTrigger value="top-played" className="text-[11px] data-[state=active]:bg-card/20">
            <Headphones className="h-3.5 w-3.5 mr-1.5" /> Mais Ouvidas
          </TabsTrigger>
          <TabsTrigger value="top-downloaded" className="text-[11px] data-[state=active]:bg-card/20">
            <Download className="h-3.5 w-3.5 mr-1.5" /> Mais Baixadas
          </TabsTrigger>
          <TabsTrigger value="users" className="text-[11px] data-[state=active]:bg-card/20">
            <Users className="h-3.5 w-3.5 mr-1.5" /> Atividade Usuários
          </TabsTrigger>
        </TabsList>

        {/* Daily plays chart */}
        <TabsContent value="overview">
          <div className="rounded-2xl border border-border/15 bg-card/5 p-6">
            <h3 className="text-sm font-semibold text-foreground/70 mb-4">Plays nos últimos {days} dias</h3>
            {analyticsLoading ? (
              <p className="text-[11px] text-muted-foreground/25 animate-pulse py-12 text-center">Carregando...</p>
            ) : !analytics?.dailyPlayData?.length ? (
              <p className="text-[11px] text-muted-foreground/30 py-12 text-center">Nenhum dado de reprodução ainda. Os plays serão registrados conforme os usuários ouvem as músicas.</p>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={analytics.dailyPlayData}>
                  <defs>
                    <linearGradient id="playGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--gold))" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="hsl(var(--gold))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="date"
                    tickFormatter={(v: string) => { const d = new Date(v + 'T12:00:00'); return `${d.getDate()}/${d.getMonth() + 1}`; }}
                    tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground) / 0.3)' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground) / 0.3)' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border) / 0.2)', borderRadius: '12px', fontSize: '11px' }}
                    labelFormatter={(v: string) => { const d = new Date(v + 'T12:00:00'); return d.toLocaleDateString('pt-BR'); }}
                  />
                  <Area type="monotone" dataKey="plays" stroke="hsl(var(--gold))" fill="url(#playGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </TabsContent>

        {/* Top Played */}
        <TabsContent value="top-played">
          <div className="rounded-2xl border border-border/15 bg-card/5 overflow-hidden">
            {analyticsLoading ? (
              <p className="text-[11px] text-muted-foreground/25 animate-pulse py-12 text-center">Carregando...</p>
            ) : !analytics?.topPlayed?.length ? (
              <p className="text-[11px] text-muted-foreground/30 py-12 text-center">Nenhum dado ainda.</p>
            ) : (
              <>
                <div className="p-4">
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={analytics.topPlayed.slice(0, 8)} layout="vertical">
                      <XAxis type="number" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground) / 0.3)' }} axisLine={false} tickLine={false} />
                      <YAxis
                        type="category"
                        dataKey="title"
                        width={150}
                        tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground) / 0.5)' }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border) / 0.2)', borderRadius: '12px', fontSize: '11px' }} />
                      <Bar dataKey="plays" fill="hsl(var(--gold) / 0.5)" radius={[0, 6, 6, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                {analytics.topPlayed.map((t: any, i: number) => (
                  <div key={t.trackId} className="flex items-center gap-3 px-5 py-3 border-t border-border/8">
                    <span className="text-[11px] text-muted-foreground/25 w-5 text-right font-mono">{i + 1}</span>
                    {t.coverUrl ? (
                      <img src={t.coverUrl} alt="" className="h-8 w-8 rounded-md object-cover" />
                    ) : (
                      <div className="h-8 w-8 rounded-md bg-muted/15 flex items-center justify-center"><Music className="h-3.5 w-3.5 text-muted-foreground/20" /></div>
                    )}
                    <span className="flex-1 text-sm text-foreground/70 truncate">{t.title}</span>
                    <span className="text-[11px] font-semibold text-gold/60">{t.plays} plays</span>
                  </div>
                ))}
              </>
            )}
          </div>
        </TabsContent>

        {/* Top Downloaded */}
        <TabsContent value="top-downloaded">
          <div className="rounded-2xl border border-border/15 bg-card/5 overflow-hidden">
            {analyticsLoading ? (
              <p className="text-[11px] text-muted-foreground/25 animate-pulse py-12 text-center">Carregando...</p>
            ) : !analytics?.topDownloaded?.length ? (
              <p className="text-[11px] text-muted-foreground/30 py-12 text-center">Nenhum download registrado ainda.</p>
            ) : (
              <>
                {analytics.topDownloaded.map((t: any, i: number) => (
                  <div key={t.trackId} className="flex items-center gap-3 px-5 py-3 border-b border-border/8 last:border-0">
                    <span className="text-[11px] text-muted-foreground/25 w-5 text-right font-mono">{i + 1}</span>
                    {t.coverUrl ? (
                      <img src={t.coverUrl} alt="" className="h-8 w-8 rounded-md object-cover" />
                    ) : (
                      <div className="h-8 w-8 rounded-md bg-muted/15 flex items-center justify-center"><Music className="h-3.5 w-3.5 text-muted-foreground/20" /></div>
                    )}
                    <span className="flex-1 text-sm text-foreground/70 truncate">{t.title}</span>
                    <span className="text-[11px] font-semibold text-emerald-400/60">{t.downloads} downloads</span>
                  </div>
                ))}

                {/* Recent downloads */}
                {analytics.recentDownloads?.length > 0 && (
                  <div className="border-t border-border/15 p-5">
                    <h4 className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground/30 mb-3">Downloads Recentes</h4>
                    {analytics.recentDownloads.slice(0, 10).map((d: any, i: number) => (
                      <div key={i} className="flex items-center justify-between py-1.5">
                        <span className="text-[11px] text-foreground/50 truncate">{d.email}</span>
                        <span className="text-[10px] text-muted-foreground/30 shrink-0 ml-2">{d.trackTitle}</span>
                        <span className="text-[9px] text-muted-foreground/20 ml-2 shrink-0">
                          {new Date(d.downloadedAt).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </TabsContent>

        {/* User Activity */}
        <TabsContent value="users">
          <div className="rounded-2xl border border-border/15 bg-card/5 overflow-hidden">
            {analyticsLoading ? (
              <p className="text-[11px] text-muted-foreground/25 animate-pulse py-12 text-center">Carregando...</p>
            ) : !analytics?.userActivity?.length ? (
              <p className="text-[11px] text-muted-foreground/30 py-12 text-center">Nenhuma atividade registrada ainda.</p>
            ) : (
              <>
                <div className="grid grid-cols-[1fr_80px_80px] gap-2 px-5 py-3 border-b border-border/10">
                  <span className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground/25">Usuário</span>
                  <span className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground/25 text-right">Plays</span>
                  <span className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground/25 text-right">Downloads</span>
                </div>
                {analytics.userActivity.map((u: any) => (
                  <div key={u.email} className="grid grid-cols-[1fr_80px_80px] gap-2 px-5 py-2.5 border-b border-border/5 hover:bg-card/10 transition-colors">
                    <span className="text-[12px] text-foreground/60 truncate">{u.email}</span>
                    <span className="text-[12px] font-semibold text-gold/50 text-right">{u.plays}</span>
                    <span className="text-[12px] font-semibold text-emerald-400/50 text-right">{u.downloads}</span>
                  </div>
                ))}
              </>
            )}
          </div>
        </TabsContent>
      </Tabs>
      </div>
    </div>
  );
}
