import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Users, ShieldCheck, Ban, Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { listApprovedBuyers } from "@/lib/admin-users.functions";

export const Route = createFileRoute("/_authenticated/admin/users")({
  component: AdminUsersPage,
});

function AdminUsersPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => listApprovedBuyers(),
  });

  const buyers = data?.buyers ?? [];
  const activeSessions = data?.activeSessions ?? [];
  const activeSessionEmails = new Set(
    activeSessions.map((session: { email: string }) => session.email.toLowerCase())
  );

  const totalUsers = buyers.length;
  const enabledUsers = buyers.filter((buyer: { access_enabled: boolean }) => buyer.access_enabled).length;
  const blockedUsers = buyers.filter((buyer: { access_enabled: boolean }) => !buyer.access_enabled).length;
  const onlineUsers = buyers.filter((buyer: { email: string }) => activeSessionEmails.has(buyer.email.toLowerCase())).length;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground/85 tracking-tight">
          Usuários
        </h1>
        <p className="mt-1 text-[13px] text-muted-foreground/40">
          Gerencie os compradores com acesso ao pack de músicas
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Usuários",
            value: totalUsers,
            icon: Users,
            color: "text-foreground/70",
          },
          {
            label: "Com acesso",
            value: enabledUsers,
            icon: ShieldCheck,
            color: "text-emerald-400/60",
          },
          {
            label: "Bloqueados",
            value: blockedUsers,
            icon: Ban,
            color: "text-destructive/60",
          },
          {
            label: "Online",
            value: onlineUsers,
            icon: Activity,
            color: "text-gold/60",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-border/15 bg-card/10 p-5 transition-colors hover:bg-card/15"
          >
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-muted/20">
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
            <p className="font-display text-2xl font-bold text-foreground/80">
              {isLoading ? "—" : stat.value}
            </p>
            <p className="mt-1 text-[10px] uppercase tracking-[0.3em] text-muted-foreground/30">
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {isLoading ? (
        <div className="py-16 text-center">
          <p className="text-[11px] uppercase tracking-[0.4em] text-muted-foreground/25 animate-pulse">
            Carregando usuários...
          </p>
        </div>
      ) : !buyers.length ? (
        <div className="rounded-2xl border border-border/15 bg-card/5 py-16 text-center">
          <Users className="mx-auto mb-4 h-8 w-8 text-muted-foreground/15" />
          <p className="text-sm text-muted-foreground/35">Nenhum usuário encontrado.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border/15">
          {buyers.map((buyer: any) => {
            const isOnline = activeSessionEmails.has(buyer.email.toLowerCase());
            const isEnabled = buyer.access_enabled;

            return (
              <div
                key={buyer.id}
                className="flex items-center gap-4 border-b border-border/8 px-5 py-4 transition-colors hover:bg-card/10 last:border-0"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted/15 text-sm font-semibold text-foreground/70 shrink-0">
                  {(buyer.nome || buyer.email).slice(0, 1).toUpperCase()}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground/80">
                    {buyer.nome || "Sem nome"}
                  </p>
                  <p className="truncate text-[11px] text-muted-foreground/30">{buyer.email}</p>
                </div>

                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={isOnline
                      ? "border-gold/20 bg-gold/10 text-gold/70"
                      : "border-border/20 text-muted-foreground/35"}
                  >
                    {isOnline ? "Online" : "Offline"}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={isEnabled
                      ? "border-emerald-500/15 bg-emerald-500/8 text-emerald-400/60"
                      : "border-destructive/15 bg-destructive/8 text-destructive/60"}
                  >
                    {isEnabled ? "Ativo" : "Bloqueado"}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
