import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { getDashboardStats } from "@/lib/admin-dashboard.functions";
import { getDashboardAnalytics } from "@/lib/analytics.functions";
import {
  Users, Activity, BarChart3, Music, Headphones, Download,
  TrendingUp, DollarSign, BookOpen, Clock, GraduationCap,
  ArrowUpRight, ArrowDownRight, CalendarDays, Zap,
  Search, Plus, Settings, Bell, UserCircle,
} from "lucide-react";
import { Input } from "@/components/ui/input";
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

  const formatCurrency = (val: number) =>
    val.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      {/* Header bar */}
      <div className="flex flex-col gap-3 pb-4 border-b border-border/15">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground tracking-tight">
              Dashboard
            </h1>
            <p className="text-sm text-muted-foreground/50 mt-1">
              Bem-vindo de volta! Aqui está um resumo da sua plataforma.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/30" />
              <Input
                placeholder="Buscar..."
                className="pl-9 h-9 w-48 bg-card/10 border-border/15 rounded-xl text-sm placeholder:text-muted-foreground/30 focus-visible:ring-gold/20"
              />
            </div>
            <Link
              to="/admin/courses/new"
              className="flex items-center gap-1.5 h-9 px-4 rounded-xl bg-gold text-background text-xs font-bold hover:bg-gold/90 transition-colors shrink-0"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Novo Curso</span>
            </Link>
            <Link
              to="/admin/settings"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-border/15 bg-card/10 text-muted-foreground/40 hover:text-foreground/70 hover:bg-card/20 transition-colors"
            >
              <Settings className="h-4 w-4" />
            </Link>
            <button className="flex h-9 w-9 items-center justify-center rounded-xl border border-border/15 bg-card/10 text-muted-foreground/40 hover:text-foreground/70 hover:bg-card/20 transition-colors relative">
              <Bell className="h-4 w-4" />
              <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-gold" />
            </button>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gold/15 border border-gold/20">
              <UserCircle className="h-5 w-5 text-gold" />
            </div>
          </div>
        </div>

        {/* Period selector */}
        <div className="flex items-center justify-end">
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

      {/* 4 Main Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Receita Total */}
        <div className="relative rounded-2xl border border-emerald-400/20 bg-gradient-to-br from-emerald-400/[0.06] to-card/5 p-6 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-400/5 group overflow-hidden">
          <div className="pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full bg-emerald-400/[0.05] blur-[60px] group-hover:bg-emerald-400/[0.08] transition-all" />
          <div className="flex items-center justify-between mb-5">
            <span className="text-xs uppercase tracking-[0.15em] text-muted-foreground/50 font-semibold">
              Receita Total
            </span>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-400/10 border border-emerald-400/20">
              <DollarSign className="h-6 w-6 text-emerald-400" />
            </div>
          </div>
          <p className="font-display text-4xl font-black text-foreground/95 tracking-tight">
            {isLoading ? (
              <span className="inline-block h-10 w-32 animate-pulse rounded-xl bg-muted/15" />
            ) : formatCurrency(data?.totalRevenue ?? 0)}
          </p>
          <div className="flex items-center gap-1.5 mt-3">
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-400/10">
              <ArrowUpRight className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-[11px] font-bold text-emerald-400">Receita total</span>
            </div>
            <span className="text-[10px] text-muted-foreground/30">vendas confirmadas</span>
          </div>
        </div>

        {/* Alunos Registrados */}
        <div className="relative rounded-2xl border border-gold/20 bg-gradient-to-br from-gold/[0.06] to-card/5 p-6 transition-all duration-300 hover:shadow-xl hover:shadow-gold/5 group overflow-hidden">
          <div className="pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full bg-gold/[0.05] blur-[60px] group-hover:bg-gold/[0.08] transition-all" />
          <div className="flex items-center justify-between mb-5">
            <span className="text-xs uppercase tracking-[0.15em] text-muted-foreground/50 font-semibold">
              Alunos Registrados
            </span>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gold/10 border border-gold/20">
              <GraduationCap className="h-6 w-6 text-gold" />
            </div>
          </div>
          <p className="font-display text-4xl font-black text-foreground/95 tracking-tight">
            {isLoading ? (
              <span className="inline-block h-10 w-20 animate-pulse rounded-xl bg-muted/15" />
            ) : data?.totalStudents ?? 0}
          </p>
          <div className="flex items-center gap-1.5 mt-3">
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-gold/10">
              <Users className="h-3.5 w-3.5 text-gold" />
              <span className="text-[11px] font-bold text-gold">Compradores</span>
            </div>
            <span className="text-[10px] text-muted-foreground/30">com acesso ativo</span>
          </div>
        </div>

        {/* Cursos Ativos */}
        <div className="relative rounded-2xl border border-blue-400/20 bg-gradient-to-br from-blue-400/[0.06] to-card/5 p-6 transition-all duration-300 hover:shadow-xl hover:shadow-blue-400/5 group overflow-hidden">
          <div className="pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full bg-blue-400/[0.05] blur-[60px] group-hover:bg-blue-400/[0.08] transition-all" />
          <div className="flex items-center justify-between mb-5">
            <span className="text-xs uppercase tracking-[0.15em] text-muted-foreground/50 font-semibold">
              Cursos Ativos
            </span>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-400/10 border border-blue-400/20">
              <BookOpen className="h-6 w-6 text-blue-400" />
            </div>
          </div>
          <p className="font-display text-4xl font-black text-foreground/95 tracking-tight">
            {isLoading ? (
              <span className="inline-block h-10 w-14 animate-pulse rounded-xl bg-muted/15" />
            ) : data?.activeCourses ?? 0}
          </p>
          <div className="flex items-center gap-1.5 mt-3">
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-blue-400/10">
              <BookOpen className="h-3.5 w-3.5 text-blue-400" />
              <span className="text-[11px] font-bold text-blue-400">Publicados</span>
            </div>
            <span className="text-[10px] text-muted-foreground/30">de {isLoading ? "—" : data?.totalCourses ?? 0} total</span>
          </div>
        </div>

        {/* Matrículas Pendentes */}
        <div className="relative rounded-2xl border border-amber-400/20 bg-gradient-to-br from-amber-400/[0.06] to-card/5 p-6 transition-all duration-300 hover:shadow-xl hover:shadow-amber-400/5 group overflow-hidden">
          <div className="pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full bg-amber-400/[0.05] blur-[60px] group-hover:bg-amber-400/[0.08] transition-all" />
          <div className="flex items-center justify-between mb-5">
            <span className="text-xs uppercase tracking-[0.15em] text-muted-foreground/50 font-semibold">
              Matrículas Pendentes
            </span>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-400/10 border border-amber-400/20">
              <Clock className="h-6 w-6 text-amber-400" />
            </div>
          </div>
          <p className="font-display text-4xl font-black text-foreground/95 tracking-tight">
            {isLoading ? (
              <span className="inline-block h-10 w-14 animate-pulse rounded-xl bg-muted/15" />
            ) : data?.pendingEnrollments ?? 0}
          </p>
          <div className="flex items-center gap-1.5 mt-3">
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-400/10">
              {(data?.pendingEnrollments ?? 0) > 0 ? (
                <ArrowUpRight className="h-3.5 w-3.5 text-amber-400" />
              ) : (
                <ArrowDownRight className="h-3.5 w-3.5 text-emerald-400" />
              )}
              <span className={`text-[11px] font-bold ${(data?.pendingEnrollments ?? 0) > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {(data?.pendingEnrollments ?? 0) > 0 ? 'Ação necessária' : 'Tudo em dia'}
              </span>
            </div>
            <span className="text-[10px] text-muted-foreground/30">aguardando aprovação</span>
          </div>
        </div>
      </div>

      {/* Main Sales Chart + Best Performing Courses */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Sales Chart — large, prominent */}
        <div className="lg:col-span-2 relative rounded-2xl border border-gold/15 bg-gradient-to-br from-gold/[0.03] to-card/5 p-6 sm:p-8 overflow-hidden">
          <div className="pointer-events-none absolute -top-32 -right-32 h-72 w-72 rounded-full bg-gold/[0.04] blur-[100px]" />

          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6 relative">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gold/10 border border-gold/20 shadow-lg shadow-gold/5">
                <TrendingUp className="h-6 w-6 text-gold" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground/90 tracking-tight">Visão Geral de Vendas</h3>
                <p className="text-xs text-muted-foreground/40 mt-0.5">Desempenho de receita mensal</p>
              </div>
            </div>
            <div className="flex gap-1 rounded-xl bg-muted/10 border border-border/15 p-1 self-start">
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

          {/* Summary strip */}
          <div className="flex flex-wrap items-center gap-6 mb-6">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-gold" />
              <span className="text-xs text-muted-foreground/50">Plays</span>
              <span className="text-sm font-bold text-foreground/80">
                {analyticsLoading ? "—" : analytics?.totalPlays ?? 0}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
              <span className="text-xs text-muted-foreground/50">Downloads</span>
              <span className="text-sm font-bold text-foreground/80">
                {analyticsLoading ? "—" : analytics?.totalDownloads ?? 0}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-blue-400" />
              <span className="text-xs text-muted-foreground/50">Receita</span>
              <span className="text-sm font-bold text-foreground/80">
                {isLoading ? "—" : formatCurrency(data?.totalRevenue ?? 0)}
              </span>
            </div>
          </div>

          <div className="relative">
            {analyticsLoading ? (
              <div className="flex items-center justify-center py-24">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold/20 border-t-gold/60" />
              </div>
            ) : !analytics?.dailyPlayData?.length ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <BarChart3 className="h-14 w-14 text-muted-foreground/10 mb-4" />
                <p className="text-sm text-muted-foreground/40 font-medium">Nenhum dado de atividade ainda</p>
                <p className="text-[11px] text-muted-foreground/25 mt-1.5">Os dados aparecerão aqui quando houver atividade</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <AreaChart data={analytics.dailyPlayData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                  <defs>
                    <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--gold))" stopOpacity={0.4} />
                      <stop offset="50%" stopColor="hsl(var(--gold))" stopOpacity={0.1} />
                      <stop offset="100%" stopColor="hsl(var(--gold))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="date"
                    tickFormatter={(v: string) => { const d = new Date(v + 'T12:00:00'); return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }); }}
                    tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground) / 0.3)' }}
                    axisLine={false}
                    tickLine={false}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground) / 0.3)' }}
                    axisLine={false}
                    tickLine={false}
                    width={35}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--gold) / 0.2)',
                      borderRadius: '14px',
                      fontSize: '12px',
                      boxShadow: '0 8px 32px -8px rgba(0,0,0,0.4)',
                      padding: '10px 14px',
                    }}
                    labelFormatter={(v: string) => { const d = new Date(v + 'T12:00:00'); return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }); }}
                    cursor={{ stroke: 'hsl(var(--gold) / 0.15)', strokeWidth: 1.5 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="plays"
                    stroke="hsl(var(--gold))"
                    fill="url(#salesGrad)"
                    strokeWidth={3}
                    dot={false}
                    activeDot={{ r: 5, stroke: 'hsl(var(--gold))', strokeWidth: 2, fill: 'hsl(var(--background))' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Best Performing Courses — sidebar card */}
        <div className="lg:col-span-1 rounded-2xl border border-border/15 bg-gradient-to-br from-card/10 to-card/5 p-6 flex flex-col">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gold/10 border border-gold/20">
              <GraduationCap className="h-5 w-5 text-gold" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground/85 tracking-tight">Cursos com Melhor Desempenho</h3>
              <p className="text-[11px] text-muted-foreground/35">Mais vendidos este mês</p>
            </div>
          </div>

          <div className="mt-4 flex-1">
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-gold/20 border-t-gold/60" />
              </div>
            ) : !data?.topCourses?.length ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <BookOpen className="h-10 w-10 text-muted-foreground/10 mb-3" />
                <p className="text-sm text-muted-foreground/35">Nenhum curso publicado</p>
                <p className="text-[11px] text-muted-foreground/25 mt-1">Publique cursos para ver o ranking</p>
              </div>
            ) : (
              <div className="space-y-1">
                {data.topCourses.map((course, i) => {
                  const medals = ['🥇', '🥈', '🥉'];
                  return (
                    <div key={course.id} className="flex items-center gap-3 py-3 px-3 rounded-xl hover:bg-card/20 transition-colors group">
                      <span className="text-lg w-7 text-center shrink-0">
                        {i < 3 ? medals[i] : <span className="text-sm font-bold text-muted-foreground/25">{i + 1}</span>}
                      </span>
                      {course.coverUrl ? (
                        <img src={course.coverUrl} alt="" className="h-12 w-12 rounded-xl object-cover shrink-0 border border-border/10 shadow-sm" />
                      ) : (
                        <div className="h-12 w-12 rounded-xl bg-muted/15 flex items-center justify-center shrink-0 border border-border/10">
                          <BookOpen className="h-5 w-5 text-muted-foreground/20" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground/80 truncate font-semibold group-hover:text-foreground transition-colors">{course.title}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[11px] text-muted-foreground/40 flex items-center gap-1">
                            <Users className="h-3 w-3" /> {course.students}
                          </span>
                          <span className="text-[11px] font-bold text-gold/60">
                            R$ {course.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer link */}
          <Link
            to="/admin/courses"
            className="mt-4 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-border/10 text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/40 hover:text-gold hover:border-gold/20 hover:bg-gold/5 transition-all"
          >
            Ver todos os cursos
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
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
