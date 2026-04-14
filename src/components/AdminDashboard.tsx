import { useState } from "react";
import { motion } from "framer-motion";
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
    <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
      {/* Header bar */}
      <div className="relative rounded-2xl border border-gold/10 bg-gradient-to-r from-card via-card/80 to-card backdrop-blur-sm p-4 sm:p-6 overflow-hidden shadow-xl shadow-black/10">
        {/* Decorative glow */}
        <div className="pointer-events-none absolute -top-20 -right-20 h-56 w-56 rounded-full bg-gold/[0.06] blur-[80px]" />
        <div className="pointer-events-none absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-gold/[0.04] blur-[60px]" />

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 relative z-10">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-black text-foreground tracking-tight">
              Dashboard
            </h1>
            <p className="text-sm text-muted-foreground/70 mt-1.5">
              Bem-vindo de volta! Aqui está um resumo da sua plataforma.
            </p>
          </div>

          <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
            {/* Search */}
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/70" />
              <Input
                placeholder="Buscar cursos, alunos..."
                className="pl-9 h-10 w-56 bg-background/40 border-border/20 rounded-xl text-sm placeholder:text-muted-foreground/70 focus-visible:ring-gold/30 focus-visible:border-gold/30 transition-all"
              />
            </div>

            {/* New Course CTA */}
            <Link
              to="/admin/courses/new"
              className="flex items-center gap-2 h-10 px-5 rounded-xl bg-gradient-to-r from-gold to-gold/85 text-background text-sm font-bold hover:shadow-lg hover:shadow-gold/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shrink-0"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Novo Curso</span>
            </Link>

            {/* Divider */}
            <div className="hidden sm:block h-6 w-px bg-border/15" />

            {/* Settings */}
            <Link
              to="/admin/settings"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-border/30 bg-background/30 text-muted-foreground/50 hover:text-gold hover:border-gold/20 hover:bg-gold/5 transition-all duration-200"
            >
              <Settings className="h-[18px] w-[18px]" />
            </Link>

            {/* Notifications */}
            <button className="flex h-10 w-10 items-center justify-center rounded-xl border border-border/30 bg-background/30 text-muted-foreground/50 hover:text-gold hover:border-gold/20 hover:bg-gold/5 transition-all duration-200 relative">
              <Bell className="h-[18px] w-[18px]" />
              <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold/60 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-gold border-2 border-background" />
              </span>
            </button>

            {/* Avatar */}
            <button className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-gold/20 to-gold/10 border-2 border-gold/25 hover:border-gold/40 hover:shadow-lg hover:shadow-gold/10 transition-all duration-200">
              <UserCircle className="h-5 w-5 text-gold" />
            </button>
          </div>
        </div>

        {/* Period selector row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-4 pt-4 border-t border-border/25 relative z-10 gap-3">
          <span className="text-xs text-muted-foreground/70 font-medium">Período de análise</span>
          <div className="flex gap-1 rounded-xl bg-background/30 border border-border/30 p-1 w-full sm:w-auto">
            {PERIOD_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setDays(opt.value)}
                className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 text-center ${
                  days === opt.value
                    ? "bg-gold/15 text-gold border border-gold/25 shadow-sm shadow-gold/10"
                    : "text-muted-foreground/70 hover:text-muted-foreground/70 border border-transparent"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 4 Main Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Receita Total */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="relative rounded-2xl border border-emerald-400/25 bg-gradient-to-br from-emerald-400/[0.08] via-card to-card p-4 sm:p-6 transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-400/10 hover:border-emerald-400/35 group overflow-hidden shadow-lg shadow-black/10">
          <div className="pointer-events-none absolute -top-12 -right-12 h-44 w-44 rounded-full bg-emerald-400/[0.07] blur-[50px] group-hover:bg-emerald-400/[0.12] transition-all duration-500" />
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground/60 font-bold">
              Receita Total
            </span>
            <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-emerald-400/15 border border-emerald-400/25 shadow-lg shadow-emerald-400/10">
              <DollarSign className="h-7 w-7 text-emerald-400" />
            </div>
          </div>
          <p className="font-display text-2xl sm:text-4xl font-black text-foreground tracking-tight leading-none">
            {isLoading ? (
              <span className="inline-block h-11 w-36 animate-pulse rounded-xl bg-muted/20" />
            ) : (data?.totalRevenue ?? 0) > 0 ? (
              formatCurrency(data?.totalRevenue ?? 0)
            ) : (
              <span className="text-2xl text-muted-foreground/60">R$ 0,00</span>
            )}
          </p>
          <div className="flex items-center gap-2 mt-4">
            {(data?.totalRevenue ?? 0) > 0 ? (
              <>
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-400/12 border border-emerald-400/15">
                  <ArrowUpRight className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-xs font-bold text-emerald-400">Receita total</span>
                </div>
                <span className="text-xs text-muted-foreground/70">vendas confirmadas</span>
              </>
            ) : (
              <span className="text-xs text-muted-foreground/70">Nenhuma venda registrada ainda</span>
            )}
          </div>
        </motion.div>

        {/* Alunos Registrados */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="relative rounded-2xl border border-gold/25 bg-gradient-to-br from-gold/[0.08] via-card to-card p-4 sm:p-6 transition-all duration-300 hover:shadow-2xl hover:shadow-gold/10 hover:border-gold/35 group overflow-hidden shadow-lg shadow-black/10">
          <div className="pointer-events-none absolute -top-12 -right-12 h-44 w-44 rounded-full bg-gold/[0.07] blur-[50px] group-hover:bg-gold/[0.12] transition-all duration-500" />
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground/60 font-bold">
              Alunos Registrados
            </span>
            <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-gold/15 border border-gold/25 shadow-lg shadow-gold/10">
              <GraduationCap className="h-7 w-7 text-gold" />
            </div>
          </div>
          <p className="font-display text-2xl sm:text-4xl font-black text-foreground tracking-tight leading-none">
            {isLoading ? (
              <span className="inline-block h-11 w-24 animate-pulse rounded-xl bg-muted/20" />
            ) : (data?.totalStudents ?? 0) > 0 ? (
              data?.totalStudents ?? 0
            ) : (
              <span className="text-2xl text-muted-foreground/60">0</span>
            )}
          </p>
          <div className="flex items-center gap-2 mt-4">
            {(data?.totalStudents ?? 0) > 0 ? (
              <>
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gold/12 border border-gold/15">
                  <Users className="h-3.5 w-3.5 text-gold" />
                  <span className="text-xs font-bold text-gold">Compradores</span>
                </div>
                <span className="text-xs text-muted-foreground/70">com acesso ativo</span>
              </>
            ) : (
              <span className="text-xs text-muted-foreground/70">Libere acesso para seus primeiros alunos</span>
            )}
          </div>
        </motion.div>

        {/* Cursos Ativos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="relative rounded-2xl border border-blue-400/25 bg-gradient-to-br from-blue-400/[0.08] via-card to-card p-4 sm:p-6 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-400/10 hover:border-blue-400/35 group overflow-hidden shadow-lg shadow-black/10">
          <div className="pointer-events-none absolute -top-12 -right-12 h-44 w-44 rounded-full bg-blue-400/[0.07] blur-[50px] group-hover:bg-blue-400/[0.12] transition-all duration-500" />
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground/60 font-bold">
              Cursos Ativos
            </span>
            <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-blue-400/15 border border-blue-400/25 shadow-lg shadow-blue-400/10">
              <BookOpen className="h-7 w-7 text-blue-400" />
            </div>
          </div>
          <p className="font-display text-2xl sm:text-4xl font-black text-foreground tracking-tight leading-none">
            {isLoading ? (
              <span className="inline-block h-11 w-16 animate-pulse rounded-xl bg-muted/20" />
            ) : (data?.activeCourses ?? 0) > 0 ? (
              data?.activeCourses ?? 0
            ) : (
              <span className="text-2xl text-muted-foreground/60">0</span>
            )}
          </p>
          <div className="flex items-center gap-2 mt-4">
            {(data?.activeCourses ?? 0) > 0 ? (
              <>
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-400/12 border border-blue-400/15">
                  <BookOpen className="h-3.5 w-3.5 text-blue-400" />
                  <span className="text-xs font-bold text-blue-400">Publicados</span>
                </div>
                <span className="text-xs text-muted-foreground/70">de {isLoading ? "—" : data?.totalCourses ?? 0} total</span>
              </>
            ) : (
              <Link to="/admin/courses/new" className="text-xs text-gold/60 hover:text-gold transition-colors">
                + Crie seu primeiro curso
              </Link>
            )}
          </div>
        </motion.div>

        {/* Matrículas Pendentes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="relative rounded-2xl border border-amber-400/25 bg-gradient-to-br from-amber-400/[0.08] via-card to-card p-4 sm:p-6 transition-all duration-300 hover:shadow-2xl hover:shadow-amber-400/10 hover:border-amber-400/35 group overflow-hidden shadow-lg shadow-black/10">
          <div className="pointer-events-none absolute -top-12 -right-12 h-44 w-44 rounded-full bg-amber-400/[0.07] blur-[50px] group-hover:bg-amber-400/[0.12] transition-all duration-500" />
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground/60 font-bold">
              Matrículas Pendentes
            </span>
            <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-amber-400/15 border border-amber-400/25 shadow-lg shadow-amber-400/10">
              <Clock className="h-7 w-7 text-amber-400" />
            </div>
          </div>
          <p className="font-display text-2xl sm:text-4xl font-black text-foreground tracking-tight leading-none">
            {isLoading ? (
              <span className="inline-block h-11 w-16 animate-pulse rounded-xl bg-muted/20" />
            ) : data?.pendingEnrollments ?? 0}
          </p>
          <div className="flex items-center gap-2 mt-4">
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-400/12 border border-amber-400/15">
              {(data?.pendingEnrollments ?? 0) > 0 ? (
                <ArrowUpRight className="h-3.5 w-3.5 text-amber-400" />
              ) : (
                <ArrowDownRight className="h-3.5 w-3.5 text-emerald-400" />
              )}
              <span className={`text-xs font-bold ${(data?.pendingEnrollments ?? 0) > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {(data?.pendingEnrollments ?? 0) > 0 ? 'Ação necessária' : 'Tudo em dia'}
              </span>
            </div>
            <span className="text-xs text-muted-foreground/70">aguardando aprovação</span>
          </div>
        </motion.div>
      </div>

      {/* Secondary metrics row */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.25 }}
        className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
        {[
          { label: "Categorias", value: data?.totalCategories ?? 0, icon: BarChart3, color: "text-purple-400", bg: "bg-purple-400/10", border: "border-purple-400/20" },
          { label: "Músicas Ativas", value: data?.activeTracks ?? 0, icon: Music, color: "text-pink-400", bg: "bg-pink-400/10", border: "border-pink-400/20" },
          { label: "Sessões Ativas", value: data?.activeSessions ?? 0, icon: Activity, color: "text-cyan-400", bg: "bg-cyan-400/10", border: "border-cyan-400/20" },
          { label: "Total de Músicas", value: data?.totalTracks ?? 0, icon: Headphones, color: "text-indigo-400", bg: "bg-indigo-400/10", border: "border-indigo-400/20" },
        ].map((s) => (
          <div key={s.label} className={`flex items-center gap-2.5 sm:gap-3.5 rounded-xl border ${s.border} ${s.bg} px-3 sm:px-4 py-3 sm:py-3.5 transition-all hover:shadow-md bg-card shadow-md shadow-black/5`}>
            <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${s.bg} border ${s.border} shrink-0`}>
              <s.icon className={`h-4.5 w-4.5 ${s.color}`} />
            </div>
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground/50 font-bold truncate">{s.label}</p>
              <p className="text-xl font-black text-foreground/90">
                {isLoading ? <span className="inline-block h-6 w-10 animate-pulse rounded bg-muted/20" /> : s.value}
              </p>
            </div>
          </div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-5">
        {/* Sales Chart — large, prominent */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="lg:col-span-2 relative rounded-2xl border border-gold/20 bg-gradient-to-br from-gold/[0.04] via-card to-card p-4 sm:p-7 overflow-hidden shadow-xl shadow-black/10">
          <div className="pointer-events-none absolute -top-32 -right-32 h-72 w-72 rounded-full bg-gold/[0.08] blur-[100px]" />

          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-5 relative">
            <div className="flex items-center gap-4">
              <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-gold/15 border border-gold/25 shadow-xl shadow-gold/10">
                <TrendingUp className="h-7 w-7 text-gold" />
              </div>
              <div>
                <h3 className="text-base sm:text-xl font-black text-foreground tracking-tight">Visão Geral de Vendas</h3>
                <p className="text-xs text-muted-foreground/50 mt-0.5">Desempenho de receita mensal</p>
              </div>
            </div>
            <div className="flex gap-1 rounded-xl bg-muted/10 border border-border/30 p-1 self-start">
              {PERIOD_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setDays(opt.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    days === opt.value
                      ? "bg-gold/15 text-gold border border-gold/20 shadow-sm"
                      : "text-muted-foreground/70 hover:text-muted-foreground/70"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Summary strip */}
          <div className="flex flex-wrap items-center gap-5 mb-4">
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
              <div className="flex items-center justify-center py-16">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold/20 border-t-gold/60" />
              </div>
            ) : !analytics?.dailyPlayData?.length ? (
               <div className="flex flex-col items-center justify-center py-16 text-center">
                 <BarChart3 className="h-12 w-12 text-gold/40 mb-4" />
                 <p className="text-sm text-muted-foreground/50 font-semibold">Aguardando primeiros dados</p>
                 <p className="text-xs text-muted-foreground/60 mt-1.5 max-w-xs">O gráfico será exibido automaticamente quando houver atividade de plays ou vendas na plataforma.</p>
               </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
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
        </motion.div>

        {/* Best Performing Courses — sidebar card */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="lg:col-span-1 rounded-2xl border border-gold/15 bg-gradient-to-br from-card via-card/90 to-card p-5 flex flex-col shadow-xl shadow-black/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gold/15 border border-gold/25 shadow-lg shadow-gold/10">
              <GraduationCap className="h-5.5 w-5.5 text-gold" />
            </div>
            <div>
              <h3 className="text-base font-black text-foreground tracking-tight">Melhor Desempenho</h3>
              <p className="text-xs text-muted-foreground/45">Mais vendidos este mês</p>
            </div>
          </div>

          <div className="mt-2 flex-1">
            {isLoading ? (
              <div className="flex items-center justify-center py-10">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-gold/20 border-t-gold/60" />
              </div>
            ) : !data?.topCourses?.length ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <BookOpen className="h-10 w-10 text-gold/40 mb-3" />
                <p className="text-sm text-muted-foreground/50 font-semibold">Sem ranking ainda</p>
                <p className="text-xs text-muted-foreground/60 mt-1 max-w-[200px]">Nenhum curso com vendas suficientes para exibir o ranking.</p>
                <Link to="/admin/courses/new" className="mt-3 text-xs text-gold/60 hover:text-gold transition-colors font-semibold">+ Criar curso</Link>
              </div>
            ) : (
              <div className="space-y-1">
                {data.topCourses.map((course, i) => {
                  const medals = ['🥇', '🥈', '🥉'];
                  return (
                    <div key={course.id} className="flex items-center gap-3 py-3 px-3 rounded-xl hover:bg-card/20 transition-colors group">
                      <span className="text-lg w-7 text-center shrink-0">
                        {i < 3 ? medals[i] : <span className="text-sm font-bold text-muted-foreground/60">{i + 1}</span>}
                      </span>
                      {course.coverUrl ? (
                        <img src={course.coverUrl} alt="" className="h-12 w-12 rounded-xl object-cover shrink-0 border border-border/25 shadow-sm" />
                      ) : (
                        <div className="h-12 w-12 rounded-xl bg-muted/15 flex items-center justify-center shrink-0 border border-border/25">
                          <BookOpen className="h-5 w-5 text-muted-foreground/50" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground/90 truncate font-bold group-hover:text-foreground transition-colors">{course.title}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-muted-foreground/70 flex items-center gap-1">
                            <Users className="h-3 w-3" /> {course.students}
                          </span>
                          <span className="text-xs font-bold text-gold/60">
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
            className="mt-4 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-border/25 text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground/70 hover:text-gold hover:border-gold/20 hover:bg-gold/5 transition-all"
          >
            Ver todos os cursos
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </motion.div>
      </div>

      {/* Engagement Analytics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
        className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-400/15 border border-purple-400/20 shadow-lg shadow-purple-400/5">
            <Zap className="h-5 w-5 text-purple-400" />
          </div>
          <div>
            <h2 className="text-lg font-black text-foreground tracking-tight">Análise de Engajamento</h2>
            <p className="text-xs text-muted-foreground/45">Detalhes de uso da plataforma</p>
          </div>
        </div>

        <Tabs defaultValue="top-played" className="space-y-4">
          <TabsList className="bg-card/20 border border-border/30 p-1 rounded-xl">
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
            <div className="rounded-2xl border border-border/30 bg-card overflow-hidden shadow-lg shadow-black/10">
              {analyticsLoading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-gold/20 border-t-gold/60" />
                </div>
              ) : !analytics?.topPlayed?.length ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <Headphones className="h-10 w-10 text-muted-foreground/50 mb-3" />
                  <p className="text-sm text-muted-foreground/70">Nenhum dado ainda</p>
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
                  <div className="border-t border-border/25">
                    {analytics.topPlayed.map((t: any, i: number) => (
                      <div key={t.trackId} className="flex items-center gap-3 px-5 py-3 border-b border-border/5 last:border-0 hover:bg-card/15 transition-colors">
                        <span className="text-xs text-muted-foreground/60 w-6 text-right font-mono font-bold">{i + 1}</span>
                        {t.coverUrl ? (
                          <img src={t.coverUrl} alt="" className="h-9 w-9 rounded-lg object-cover border border-border/25" />
                        ) : (
                          <div className="h-9 w-9 rounded-lg bg-muted/15 flex items-center justify-center border border-border/25"><Music className="h-4 w-4 text-muted-foreground/50" /></div>
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
            <div className="rounded-2xl border border-border/30 bg-card overflow-hidden shadow-lg shadow-black/10">
              {analyticsLoading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-400/20 border-t-emerald-400/60" />
                </div>
              ) : !analytics?.topDownloaded?.length ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <Download className="h-10 w-10 text-muted-foreground/50 mb-3" />
                  <p className="text-sm text-muted-foreground/70">Nenhum download registrado</p>
                </div>
              ) : (
                <>
                  {analytics.topDownloaded.map((t: any, i: number) => (
                    <div key={t.trackId} className="flex items-center gap-3 px-5 py-3 border-b border-border/5 last:border-0 hover:bg-card/15 transition-colors">
                      <span className="text-xs text-muted-foreground/60 w-6 text-right font-mono font-bold">{i + 1}</span>
                      {t.coverUrl ? (
                        <img src={t.coverUrl} alt="" className="h-9 w-9 rounded-lg object-cover border border-border/25" />
                      ) : (
                        <div className="h-9 w-9 rounded-lg bg-muted/15 flex items-center justify-center border border-border/25"><Music className="h-4 w-4 text-muted-foreground/50" /></div>
                      )}
                      <span className="flex-1 text-sm text-foreground/75 truncate font-medium">{t.title}</span>
                      <span className="text-xs font-bold text-emerald-400/70 bg-emerald-400/8 px-2 py-1 rounded-lg">{t.downloads} downloads</span>
                    </div>
                  ))}
                  {analytics.recentDownloads?.length > 0 && (
                    <div className="border-t border-border/30 p-5">
                      <h4 className="text-xs uppercase tracking-[0.2em] text-muted-foreground/70 mb-4 font-medium">Downloads Recentes</h4>
                      <div className="space-y-2">
                        {analytics.recentDownloads.slice(0, 10).map((d: any, i: number) => (
                          <div key={i} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-card/15 transition-colors">
                            <span className="text-xs text-foreground/55 truncate flex-1">{d.email}</span>
                            <span className="text-xs text-muted-foreground/70 shrink-0 ml-3">{d.trackTitle}</span>
                            <span className="text-xs text-muted-foreground/60 ml-3 shrink-0">
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
            <div className="rounded-2xl border border-border/30 bg-card overflow-hidden shadow-lg shadow-black/10">
              {analyticsLoading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-400/20 border-t-blue-400/60" />
                </div>
              ) : !analytics?.userActivity?.length ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <Users className="h-10 w-10 text-muted-foreground/50 mb-3" />
                  <p className="text-sm text-muted-foreground/70">Nenhuma atividade registrada</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-[1fr_80px_80px] gap-2 px-5 py-3.5 border-b border-border/30 bg-card/15">
                    <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground/60 font-medium">Usuário</span>
                    <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground/60 text-right font-medium">Plays</span>
                    <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground/60 text-right font-medium">Downloads</span>
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
      </motion.div>
    </div>
  );
}
