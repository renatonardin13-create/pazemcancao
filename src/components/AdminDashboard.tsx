import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getDashboardStats } from "@/lib/admin-dashboard.functions";
import { getDashboardAnalytics } from "@/lib/analytics.functions";
import {
  Users, Activity, BarChart3, Music, Headphones, Download,
  TrendingUp, DollarSign, BookOpen, Clock, GraduationCap,
  ArrowUpRight, ArrowDownRight, CalendarDays, Zap,
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
    staleTime: 60_000,
  });

  const { data: rawAnalytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ["admin-analytics", days],
    queryFn: () => getDashboardAnalytics({ data: { days } }),
    staleTime: 60_000,
  });

  const analytics = rawAnalytics as any;

  const statCards = [
    {
      label: "Total de Alunos",
      value: data?.totalStudents ?? "—",
      icon: GraduationCap,
      color: "text-emerald-400",
      bg: "bg-emerald-400/10",
      border: "border-emerald-400/20",
      trend: "+12%",
      trendUp: true,
    },
    {
      label: "Cursos Ativos",
      value: data?.activeCourses ?? "—",
      icon: BookOpen,
      color: "text-gold",
      bg: "bg-gold/10",
      border: "border-gold/20",
      trend: null,
      trendUp: true,
    },
    {
      label: "Matrículas Pendentes",
      value: data?.pendingEnrollments ?? "—",
      icon: Clock,
      color: "text-amber-400",
      bg: "bg-amber-400/10",
      border: "border-amber-400/20",
      trend: null,
      trendUp: false,
    },
    {
      label: "Sessões Ativas",
      value: data?.activeSessions ?? "—",
      icon: Activity,
      color: "text-blue-400",
      bg: "bg-blue-400/10",
      border: "border-blue-400/20",
      trend: null,
      trendUp: true,
    },
    {
      label: "Músicas Ativas",
      value: data?.activeTracks ?? "—",
      icon: Music,
      color: "text-purple-400",
      bg: "bg-purple-400/10",
      border: "border-purple-400/20",
      trend: null,
      trendUp: true,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-border/15">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold/10 border border-gold/20">
              <BarChart3 className="h-5 w-5 text-gold" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-foreground tracking-tight">
                Dashboard
              </h1>
              <p className="text-sm text-muted-foreground/50">
                Visão geral da plataforma
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground/40">
            <CalendarDays className="h-3.5 w-3.5" />
            {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}
          </div>
          <div className="flex gap-1 rounded-xl bg-muted/10 border border-border/15 p-1">
            {PERIOD_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setDays(opt.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  days === opt.value
                    ? "bg-gold/15 text-gold border border-gold/20 shadow-sm"
                    : "text-muted-foreground/40 hover:text-muted-foreground/70"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className={`relative rounded-2xl border ${stat.border} bg-card/8 p-5 transition-all duration-300 hover:bg-card/15 hover:shadow-lg hover:shadow-black/10 group overflow-hidden`}
          >
            <div className="pointer-events-none absolute -top-10 -right-10 h-24 w-24 rounded-full opacity-[0.04] group-hover:opacity-[0.08] transition-opacity" style={{ background: 'currentColor' }} />
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground/50 font-medium">
                {stat.label}
              </span>
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.bg} border ${stat.border}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </div>
            <p className="font-display text-3xl font-bold text-foreground/90 mb-1">
              {isLoading ? (
                <span className="inline-block h-8 w-16 animate-pulse rounded-lg bg-muted/15" />
              ) : stat.value}
            </p>
            {stat.trend && (
              <div className="flex items-center gap-1 mt-1">
                {stat.trendUp ? (
                  <ArrowUpRight className="h-3.5 w-3.5 text-emerald-400/70" />
                ) : (
                  <ArrowDownRight className="h-3.5 w-3.5 text-red-400/70" />
                )}
                <span className={`text-[11px] font-medium ${stat.trendUp ? 'text-emerald-400/70' : 'text-red-400/70'}`}>
                  {stat.trend}
                </span>
                <span className="text-[10px] text-muted-foreground/30">vs mês anterior</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Two-column: Chart + Top Courses */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Plays chart */}
        <div className="lg:col-span-3 rounded-2xl border border-border/15 bg-card/8 p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gold/10 border border-gold/15">
                <TrendingUp className="h-4 w-4 text-gold" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground/80">Visão Geral de Plays</h3>
                <p className="text-[11px] text-muted-foreground/35">Reproduções no período selecionado</p>
              </div>
            </div>
          </div>
          <div>
            {analyticsLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-gold/20 border-t-gold/60" />
              </div>
            ) : !analytics?.dailyPlayData?.length ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Headphones className="h-10 w-10 text-muted-foreground/15 mb-3" />
                <p className="text-sm text-muted-foreground/40">Nenhum dado de reprodução ainda</p>
                <p className="text-[11px] text-muted-foreground/25 mt-1">Os dados aparecerão aqui quando houver atividade</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={analytics.dailyPlayData}>
                  <defs>
                    <linearGradient id="playGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--gold))" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="hsl(var(--gold))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="date"
                    tickFormatter={(v: string) => { const d = new Date(v + 'T12:00:00'); return String(d.getDate()); }}
                    tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground) / 0.3)' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground) / 0.3)' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border) / 0.2)', borderRadius: '12px', fontSize: '12px' }}
                    labelFormatter={(v: string) => { const d = new Date(v + 'T12:00:00'); return d.toLocaleDateString('pt-BR'); }}
                  />
                  <Area type="monotone" dataKey="plays" stroke="hsl(var(--gold))" fill="url(#playGrad)" strokeWidth={2.5} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Top Courses */}
        <div className="lg:col-span-2 rounded-2xl border border-border/15 bg-card/8 p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 border border-primary/15">
              <BookOpen className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground/80">Top Cursos</h3>
              <p className="text-[11px] text-muted-foreground/35">Mais alunos matriculados</p>
            </div>
          </div>
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary/20 border-t-primary/60" />
            </div>
          ) : !data?.topCourses?.length ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <BookOpen className="h-10 w-10 text-muted-foreground/15 mb-3" />
              <p className="text-sm text-muted-foreground/40">Nenhum curso publicado</p>
            </div>
          ) : (
            <div className="space-y-1">
              {data.topCourses.map((course, i) => (
                <div key={course.id} className="flex items-center gap-3 py-3 px-3 rounded-xl hover:bg-card/20 transition-colors group">
                  <span className="text-sm font-bold text-muted-foreground/25 w-6 text-center">{i + 1}</span>
                  {course.coverUrl ? (
                    <img src={course.coverUrl} alt="" className="h-11 w-11 rounded-xl object-cover shrink-0 border border-border/10" />
                  ) : (
                    <div className="h-11 w-11 rounded-xl bg-muted/15 flex items-center justify-center shrink-0 border border-border/10">
                      <BookOpen className="h-5 w-5 text-muted-foreground/20" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground/80 truncate font-medium group-hover:text-foreground transition-colors">{course.title}</p>
                    <p className="text-[11px] text-muted-foreground/40 flex items-center gap-1.5 mt-0.5">
                      <Users className="h-3 w-3" /> {course.students} alunos
                    </p>
                  </div>
                  <span className="text-xs font-bold text-gold/70 shrink-0 bg-gold/8 px-2 py-1 rounded-lg">
                    R$ {course.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Engagement Analytics */}
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-400/10 border border-purple-400/15">
            <Zap className="h-4 w-4 text-purple-400" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-foreground/80">Análise de Engajamento</h2>
            <p className="text-[11px] text-muted-foreground/35">Detalhes de uso da plataforma</p>
          </div>
        </div>

        <Tabs defaultValue="top-played" className="space-y-4">
          <TabsList className="bg-card/10 border border-border/15 p-1 rounded-xl">
            <TabsTrigger value="top-played" className="text-xs rounded-lg data-[state=active]:bg-gold/10 data-[state=active]:text-gold data-[state=active]:border-gold/15 data-[state=active]:border">
              <Headphones className="h-4 w-4 mr-2" /> Mais Ouvidas
            </TabsTrigger>
            <TabsTrigger value="top-downloaded" className="text-xs rounded-lg data-[state=active]:bg-emerald-400/10 data-[state=active]:text-emerald-400 data-[state=active]:border-emerald-400/15 data-[state=active]:border">
              <Download className="h-4 w-4 mr-2" /> Mais Baixadas
            </TabsTrigger>
            <TabsTrigger value="users" className="text-xs rounded-lg data-[state=active]:bg-blue-400/10 data-[state=active]:text-blue-400 data-[state=active]:border-blue-400/15 data-[state=active]:border">
              <Users className="h-4 w-4 mr-2" /> Atividade
            </TabsTrigger>
          </TabsList>

          {/* Top Played */}
          <TabsContent value="top-played">
            <div className="rounded-2xl border border-border/15 bg-card/8 overflow-hidden">
              {analyticsLoading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-gold/20 border-t-gold/60" />
                </div>
              ) : !analytics?.topPlayed?.length ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <Headphones className="h-10 w-10 text-muted-foreground/15 mb-3" />
                  <p className="text-sm text-muted-foreground/40">Nenhum dado ainda</p>
                </div>
              ) : (
                <>
                  <div className="p-5">
                    <ResponsiveContainer width="100%" height={240}>
                      <BarChart data={analytics.topPlayed.slice(0, 8)} layout="vertical">
                        <XAxis type="number" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground) / 0.3)' }} axisLine={false} tickLine={false} />
                        <YAxis type="category" dataKey="title" width={160} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground) / 0.5)' }} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border) / 0.2)', borderRadius: '12px', fontSize: '12px' }} />
                        <Bar dataKey="plays" fill="hsl(var(--gold) / 0.5)" radius={[0, 8, 8, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="border-t border-border/10">
                    {analytics.topPlayed.map((t: any, i: number) => (
                      <div key={t.trackId} className="flex items-center gap-3 px-5 py-3 border-b border-border/5 last:border-0 hover:bg-card/15 transition-colors">
                        <span className="text-xs text-muted-foreground/30 w-6 text-right font-mono font-bold">{i + 1}</span>
                        {t.coverUrl ? (
                          <img src={t.coverUrl} alt="" className="h-9 w-9 rounded-lg object-cover border border-border/10" />
                        ) : (
                          <div className="h-9 w-9 rounded-lg bg-muted/15 flex items-center justify-center border border-border/10"><Music className="h-4 w-4 text-muted-foreground/20" /></div>
                        )}
                        <span className="flex-1 text-sm text-foreground/75 truncate font-medium">{t.title}</span>
                        <span className="text-xs font-bold text-gold/70 bg-gold/8 px-2 py-1 rounded-lg">{t.plays} plays</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </TabsContent>

          {/* Top Downloaded */}
          <TabsContent value="top-downloaded">
            <div className="rounded-2xl border border-border/15 bg-card/8 overflow-hidden">
              {analyticsLoading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-400/20 border-t-emerald-400/60" />
                </div>
              ) : !analytics?.topDownloaded?.length ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <Download className="h-10 w-10 text-muted-foreground/15 mb-3" />
                  <p className="text-sm text-muted-foreground/40">Nenhum download registrado</p>
                </div>
              ) : (
                <>
                  {analytics.topDownloaded.map((t: any, i: number) => (
                    <div key={t.trackId} className="flex items-center gap-3 px-5 py-3 border-b border-border/5 last:border-0 hover:bg-card/15 transition-colors">
                      <span className="text-xs text-muted-foreground/30 w-6 text-right font-mono font-bold">{i + 1}</span>
                      {t.coverUrl ? (
                        <img src={t.coverUrl} alt="" className="h-9 w-9 rounded-lg object-cover border border-border/10" />
                      ) : (
                        <div className="h-9 w-9 rounded-lg bg-muted/15 flex items-center justify-center border border-border/10"><Music className="h-4 w-4 text-muted-foreground/20" /></div>
                      )}
                      <span className="flex-1 text-sm text-foreground/75 truncate font-medium">{t.title}</span>
                      <span className="text-xs font-bold text-emerald-400/70 bg-emerald-400/8 px-2 py-1 rounded-lg">{t.downloads} downloads</span>
                    </div>
                  ))}
                  {analytics.recentDownloads?.length > 0 && (
                    <div className="border-t border-border/15 p-5">
                      <h4 className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground/35 mb-4 font-medium">Downloads Recentes</h4>
                      <div className="space-y-2">
                        {analytics.recentDownloads.slice(0, 10).map((d: any, i: number) => (
                          <div key={i} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-card/15 transition-colors">
                            <span className="text-xs text-foreground/55 truncate flex-1">{d.email}</span>
                            <span className="text-[11px] text-muted-foreground/35 shrink-0 ml-3">{d.trackTitle}</span>
                            <span className="text-[10px] text-muted-foreground/25 ml-3 shrink-0">
                              {new Date(d.downloadedAt).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </TabsContent>

          {/* User Activity */}
          <TabsContent value="users">
            <div className="rounded-2xl border border-border/15 bg-card/8 overflow-hidden">
              {analyticsLoading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-400/20 border-t-blue-400/60" />
                </div>
              ) : !analytics?.userActivity?.length ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <Users className="h-10 w-10 text-muted-foreground/15 mb-3" />
                  <p className="text-sm text-muted-foreground/40">Nenhuma atividade registrada</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-[1fr_80px_80px] gap-2 px-5 py-3.5 border-b border-border/15 bg-card/5">
                    <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground/30 font-medium">Usuário</span>
                    <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground/30 text-right font-medium">Plays</span>
                    <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground/30 text-right font-medium">Downloads</span>
                  </div>
                  {analytics.userActivity.map((u: any) => (
                    <div key={u.email} className="grid grid-cols-[1fr_80px_80px] gap-2 px-5 py-3 border-b border-border/5 hover:bg-card/15 transition-colors">
                      <span className="text-sm text-foreground/65 truncate">{u.email}</span>
                      <span className="text-sm font-bold text-gold/60 text-right">{u.plays}</span>
                      <span className="text-sm font-bold text-emerald-400/60 text-right">{u.downloads}</span>
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
