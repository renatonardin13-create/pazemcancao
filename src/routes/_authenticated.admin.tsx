import { createFileRoute, Outlet, Link } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/AdminSidebar";
import { LogOut, ShieldAlert, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminLayout,
});

function AdminLayout() {
  const { isAdmin, adminLoading, logout, user } = useAuth();

  if (adminLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-[11px] uppercase tracking-[0.4em] text-gold/25 animate-pulse">
          Verificando acesso...
        </p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_50%_40%,var(--color-gold)/0.02,transparent_70%)]" />
        <div className="relative text-center max-w-sm px-8 animate-in fade-in slide-in-from-bottom-6 duration-1000">
          <ShieldAlert className="h-8 w-8 text-destructive/50 mx-auto mb-6" />
          <h1 className="font-display text-2xl font-bold text-foreground/85 tracking-tight">
            Acesso restrito
          </h1>
          <div className="mx-auto mt-4 h-px w-10 bg-gradient-to-r from-transparent via-destructive/20 to-transparent" />
          <p className="mt-5 text-[14px] leading-[2] text-muted-foreground/50 font-light">
            Você não tem permissão de administrador para acessar esta área.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3">
            <Link
              to="/downloads"
              className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.3em] text-gold/45 hover:text-gold/65 transition-colors duration-500"
            >
              <ArrowLeft className="h-3 w-3" />
              Voltar à biblioteca
            </Link>
            <button
              onClick={() => logout()}
              className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.3em] text-muted-foreground/30 hover:text-muted-foreground/50 transition-colors duration-500"
            >
              <LogOut className="h-3 w-3" />
              Sair
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar />

        <div className="flex-1 flex flex-col min-w-0">
          {/* Top bar */}
          <header className="sticky top-0 z-40 h-14 flex items-center gap-3 border-b border-border/15 bg-background/80 backdrop-blur-xl px-4">
            <SidebarTrigger className="text-muted-foreground/40 hover:text-muted-foreground/70" />
            <div className="h-4 w-px bg-border/20" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-muted-foreground/30">
              Painel Administrativo
            </span>
            <div className="ml-auto flex items-center gap-3">
              <span className="text-[10px] text-muted-foreground/25 hidden sm:inline">
                {user?.email}
              </span>
              <button
                onClick={() => logout()}
                className="flex items-center gap-1.5 text-[10px] text-muted-foreground/30 hover:text-muted-foreground/60 transition-colors"
              >
                <LogOut className="h-3 w-3" />
              </button>
            </div>
          </header>

          {/* Content */}
          <main className="flex-1 p-6 sm:p-8">
            <AdminDashboard />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

// Inline dashboard since this is the main /admin route
import { useQuery } from "@tanstack/react-query";
import { listApprovedBuyers } from "@/lib/admin-users.functions";
import { supabase } from "@/integrations/supabase/client";
import { Users, Music, Shield, Activity, Search, MoreHorizontal, CheckCircle, XCircle, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

function AdminDashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"users" | "tracks">("users");

  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => listApprovedBuyers(),
  });

  const { data: tracks, isLoading: tracksLoading } = useQuery({
    queryKey: ["admin-tracks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tracks")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const buyers = usersData?.buyers || [];
  const activeSessions = usersData?.activeSessions || [];

  const filteredBuyers = buyers.filter(
    (b) =>
      b.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeCount = buyers.filter((b) => b.access_enabled).length;
  const sessionCount = activeSessions.length;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Usuários", value: buyers.length, icon: Users, color: "text-gold/60" },
          { label: "Ativos", value: activeCount, icon: CheckCircle, color: "text-emerald-500/60" },
          { label: "Sessões", value: sessionCount, icon: Activity, color: "text-blue-400/60" },
          { label: "Louvores", value: tracks?.length || 0, icon: Music, color: "text-gold/60" },
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
              {usersLoading || tracksLoading ? "—" : stat.value}
            </p>
            <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground/30 mt-1">
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-border/15 pb-0">
        {(["users", "tracks"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.2em] transition-all duration-300 border-b-2 -mb-px ${
              activeTab === tab
                ? "border-gold/50 text-gold/70"
                : "border-transparent text-muted-foreground/30 hover:text-muted-foreground/50"
            }`}
          >
            {tab === "users" ? "Usuários" : "Louvores"}
          </button>
        ))}
      </div>

      {/* Users Tab */}
      {activeTab === "users" && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/25" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por nome ou email..."
                className="pl-9 bg-card/10 border-border/15 text-sm h-10"
              />
            </div>
            <span className="text-[10px] text-muted-foreground/25">
              {filteredBuyers.length} resultado{filteredBuyers.length !== 1 ? "s" : ""}
            </span>
          </div>

          {usersLoading ? (
            <div className="text-center py-16">
              <p className="text-[11px] uppercase tracking-[0.4em] text-muted-foreground/25 animate-pulse">
                Carregando usuários...
              </p>
            </div>
          ) : filteredBuyers.length === 0 ? (
            <div className="text-center py-16">
              <Users className="h-8 w-8 text-muted-foreground/15 mx-auto mb-4" />
              <p className="text-sm text-muted-foreground/35">Nenhum usuário encontrado.</p>
            </div>
          ) : (
            <div className="rounded-2xl border border-border/15 overflow-hidden">
              {/* Header */}
              <div className="hidden sm:grid grid-cols-[1fr_1fr_120px_120px_60px] gap-4 px-5 py-3 bg-muted/5 border-b border-border/10">
                <span className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground/30 font-semibold">Nome</span>
                <span className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground/30 font-semibold">Email</span>
                <span className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground/30 font-semibold">Status</span>
                <span className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground/30 font-semibold">Último acesso</span>
                <span />
              </div>

              {/* Rows */}
              {filteredBuyers.map((buyer) => {
                const hasActiveSession = activeSessions.some((s) => s.email === buyer.email);
                const statusColor = !buyer.access_enabled
                  ? "text-destructive/60 bg-destructive/10 border-destructive/15"
                  : hasActiveSession
                    ? "text-emerald-400/70 bg-emerald-500/10 border-emerald-500/15"
                    : "text-gold/50 bg-gold/8 border-gold/12";
                const statusLabel = !buyer.access_enabled
                  ? "Bloqueado"
                  : hasActiveSession
                    ? "Online"
                    : "Ativo";

                return (
                  <div
                    key={buyer.id}
                    className="grid sm:grid-cols-[1fr_1fr_120px_120px_60px] gap-2 sm:gap-4 px-5 py-4 border-b border-border/8 last:border-0 hover:bg-card/10 transition-colors items-center"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted/15 text-[11px] font-bold text-foreground/50">
                        {buyer.nome.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground/75 truncate">
                          {buyer.nome}
                        </p>
                        <p className="sm:hidden text-[11px] text-muted-foreground/30 truncate">
                          {buyer.email}
                        </p>
                      </div>
                    </div>

                    <p className="hidden sm:block text-[12px] text-muted-foreground/45 truncate">
                      {buyer.email}
                    </p>

                    <div>
                      <Badge
                        variant="outline"
                        className={`text-[9px] font-semibold uppercase tracking-[0.15em] rounded-full px-2.5 py-0.5 border ${statusColor}`}
                      >
                        {statusLabel}
                      </Badge>
                    </div>

                    <p className="hidden sm:block text-[11px] text-muted-foreground/30">
                      {buyer.last_login_at
                        ? new Date(buyer.last_login_at).toLocaleDateString("pt-BR")
                        : "Nunca"}
                    </p>

                    <div className="flex justify-end">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground/25 hover:text-muted-foreground/50"
                      >
                        <MoreHorizontal className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tracks Tab */}
      {activeTab === "tracks" && (
        <div className="space-y-3">
          {tracksLoading ? (
            <p className="text-center text-[11px] uppercase tracking-[0.4em] text-muted-foreground/25 py-12 animate-pulse">
              Carregando...
            </p>
          ) : !tracks?.length ? (
            <div className="text-center py-16">
              <Music className="h-8 w-8 text-muted-foreground/15 mx-auto mb-4" />
              <p className="text-sm text-muted-foreground/35">Nenhum louvor adicionado.</p>
            </div>
          ) : (
            tracks.map((track, i) => (
              <div
                key={track.id}
                className="flex items-center gap-4 rounded-xl border border-border/15 bg-card/10 px-5 py-4 transition-colors hover:bg-card/20"
              >
                <span className="text-[11px] font-mono text-muted-foreground/25 w-6">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground/75 truncate">{track.title}</p>
                  <p className="text-[11px] text-muted-foreground/30">
                    {track.category} · {track.duration}
                  </p>
                </div>
                <Badge variant="outline" className="text-[9px] rounded-full px-2 border-border/20 text-muted-foreground/30">
                  {track.is_active ? "Ativo" : "Inativo"}
                </Badge>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
