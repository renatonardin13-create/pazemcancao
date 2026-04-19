import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Eye, Search, Loader2, History, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { listApprovedBuyers } from "@/lib/admin-users.functions";
import {
  startImpersonation,
  listImpersonationLogs,
} from "@/lib/impersonation.functions";
import { setImpersonationState } from "@/components/ImpersonationBanner";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/_authenticated/admin/impersonar")({
  component: ImpersonarPage,
});

function ImpersonarPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [courseFilter, setCourseFilter] = useState<string>("all");
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);

  const listBuyersFn = useServerFn(listApprovedBuyers);
  const listLogsFn = useServerFn(listImpersonationLogs);
  const startFn = useServerFn(startImpersonation);

  const buyersQuery = useQuery({
    queryKey: ["admin", "impersonar", "buyers"],
    queryFn: async () => {
      const r = await listBuyersFn();
      return (r as any).buyers ?? r ?? [];
    },
  });

  const logsQuery = useQuery({
    queryKey: ["admin", "impersonar", "logs"],
    queryFn: async () => {
      const r = await listLogsFn();
      return r.logs ?? [];
    },
  });

  const startMut = useMutation({
    mutationFn: (targetEmail: string) =>
      startFn({ data: { targetEmail } }),
    onSuccess: async (res, targetEmail) => {
      setImpersonationState({
        logId: res.logId,
        adminEmail: res.adminEmail,
        targetEmail: res.targetEmail,
        startedAt: new Date().toISOString(),
      });
      // Desloga admin para isolar contexto, depois redireciona ao magic link
      await supabase.auth.signOut();
      toast.success(`Entrando como ${targetEmail}...`);
      window.location.href = res.magicLink;
    },
    onError: (err: any) => {
      setPendingEmail(null);
      toast.error(err?.message || "Falha ao iniciar impersonação.");
    },
  });

  const filteredBuyers = useMemo(() => {
    const list = (buyersQuery.data ?? []) as any[];
    const q = search.trim().toLowerCase();
    if (!q) return list.slice(0, 50);
    return list
      .filter(
        (b) =>
          b.email?.toLowerCase().includes(q) ||
          b.nome?.toLowerCase().includes(q)
      )
      .slice(0, 50);
  }, [buyersQuery.data, search]);

  const handleStart = (email: string) => {
    if (!confirm(
      `Iniciar impersonação como ${email}?\n\nVocê será deslogado do admin e entrará na sessão real do aluno. Use o botão "Encerrar impersonação" no topo da tela para voltar.`
    )) return;
    setPendingEmail(email);
    startMut.mutate(email);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">
          Impersonar aluno
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Visualize a área de membros exatamente como o aluno enxerga. Toda
          impersonação é registrada para auditoria.
        </p>
      </div>

      <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-xs text-amber-300/90">
        <strong>Atenção:</strong> ao impersonar, sua sessão de admin é encerrada
        e você entra como o aluno em uma sessão real. Use o botão fixo no topo
        da tela para encerrar e voltar a fazer login como admin.
      </div>

      {/* Lista de alunos */}
      <section className="rounded-xl border border-border/40 bg-card/40 p-4">
        <div className="mb-3 flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por email ou nome..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9"
          />
        </div>

        {buyersQuery.isLoading ? (
          <div className="flex items-center justify-center py-10 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
          </div>
        ) : filteredBuyers.length === 0 ? (
          <div className="py-10 text-center text-sm text-muted-foreground">
            Nenhum aluno encontrado.
          </div>
        ) : (
          <div className="divide-y divide-border/30">
            {filteredBuyers.map((b: any) => (
              <div
                key={b.id}
                className="flex items-center justify-between gap-3 py-2.5"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-medium text-foreground">
                      {b.nome || "Sem nome"}
                    </span>
                    {b.is_trial ? (
                      <Badge className="border-0 bg-sky-500/15 text-[10px] text-sky-400">
                        Teste
                      </Badge>
                    ) : null}
                    {b.access_enabled === false ? (
                      <Badge className="border-0 bg-rose-500/15 text-[10px] text-rose-400">
                        Bloqueado
                      </Badge>
                    ) : null}
                  </div>
                  <div className="truncate text-xs text-muted-foreground">
                    {b.email}
                  </div>
                </div>
                <button
                  onClick={() => handleStart(b.email)}
                  disabled={startMut.isPending && pendingEmail === b.email}
                  className="inline-flex items-center gap-1.5 rounded-md border border-gold/30 bg-gold/10 px-3 py-1.5 text-xs font-semibold text-gold hover:bg-gold/15 disabled:opacity-50"
                >
                  {startMut.isPending && pendingEmail === b.email ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Eye className="h-3.5 w-3.5" />
                  )}
                  Impersonar
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Histórico */}
      <section className="rounded-xl border border-border/40 bg-card/40 p-4">
        <div className="mb-3 flex items-center gap-2">
          <History className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold text-foreground">
            Histórico de impersonações
          </h2>
        </div>
        {logsQuery.isLoading ? (
          <div className="flex items-center justify-center py-6 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
          </div>
        ) : (logsQuery.data ?? []).length === 0 ? (
          <p className="py-4 text-center text-xs text-muted-foreground">
            Nenhum registro ainda.
          </p>
        ) : (
          <div className="space-y-1.5 text-xs">
            {(logsQuery.data ?? []).map((log: any) => (
              <div
                key={log.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded border border-border/30 px-3 py-2"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <ExternalLink className="h-3 w-3 shrink-0 text-muted-foreground" />
                  <span className="truncate">
                    <span className="text-muted-foreground">{log.admin_email}</span>
                    <span className="mx-1.5 text-muted-foreground/50">→</span>
                    <span className="font-medium text-foreground">
                      {log.target_email}
                    </span>
                  </span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span>{new Date(log.started_at).toLocaleString("pt-BR")}</span>
                  {log.ended_at ? (
                    <Badge className="border-0 bg-emerald-500/15 text-[10px] text-emerald-400">
                      Encerrada
                    </Badge>
                  ) : (
                    <Badge className="border-0 bg-amber-500/15 text-[10px] text-amber-400">
                      Ativa
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
