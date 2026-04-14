import { toastError } from "@/lib/toast-utils";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listAdminTracks, listAdminTrackCategories, deleteTrack, updateTrack, regenerateCover } from "@/lib/admin-tracks.functions";
import { sendBonusNotification } from "@/lib/notifications.functions";
import { Music, Plus, Trash2, ToggleLeft, ToggleRight, ExternalLink, ImageIcon, Loader2, Pencil, Gift, Bell, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { AddTrackForm } from "@/components/AddTrackForm";
import { EditTrackDialog } from "@/components/EditTrackDialog";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/tracks")({
  component: AdminTracksPage,
});

const PAGE_SIZE = 20;

function AdminTracksPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingTrack, setEditingTrack] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  // Debounce search
  const searchTimeoutRef = useState<ReturnType<typeof setTimeout> | null>(null);
  const handleSearch = (value: string) => {
    setSearchQuery(value);
    if (searchTimeoutRef[0]) clearTimeout(searchTimeoutRef[0]);
    searchTimeoutRef[0] = setTimeout(() => {
      setDebouncedSearch(value);
      setPage(1);
    }, 400);
  };

  const { data, isLoading } = useQuery({
    queryKey: ["admin-tracks", page, debouncedSearch, filterCategory, filterStatus],
    queryFn: () => listAdminTracks({ data: { page, pageSize: PAGE_SIZE, search: debouncedSearch, category: filterCategory, status: filterStatus } }),
    staleTime: 30_000,
  });

  const { data: catData } = useQuery({
    queryKey: ["admin-track-categories"],
    queryFn: () => listAdminTrackCategories(),
    staleTime: 60_000,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteTrack({ data: { id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-tracks"] });
      queryClient.invalidateQueries({ queryKey: ["admin-track-categories"] });
      toast.success("Música removida");
    },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, is_active }: { id: string; is_active: boolean }) =>
      updateTrack({ data: { id, is_active } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-tracks"] });
      toast.success("Status atualizado");
    },
  });

  const coverMutation = useMutation({
    mutationFn: ({ trackId, title }: { trackId: string; title: string }) =>
      regenerateCover({ data: { trackId, title } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-tracks"] });
      toast.success("Capa gerada com sucesso!");
    },
    onError: (err: Error) => {
      toastError(err, "Erro ao gerar capa");
    },
  });

  const notifyMutation = useMutation({
    mutationFn: ({ trackTitle, releaseDate }: { trackTitle: string; releaseDate?: string }) =>
      sendBonusNotification({ data: { trackTitle, releaseDate } }),
    onSuccess: (result) => {
      toast.success(`Notificação enviada para ${result.sent} clientes!`);
    },
    onError: (err: Error) => {
      toastError(err, "Erro ao notificar");
    },
  });

  const tracks = data?.tracks || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const categories = catData?.categories || [];

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      {/* Header */}
      <div className="relative rounded-2xl border border-gold/10 bg-gradient-to-r from-card via-card/80 to-card px-6 py-4 overflow-hidden shadow-xl shadow-black/10">
        <div className="pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full bg-gold/[0.05] blur-[60px]" />
        <div className="flex items-center justify-between relative z-10">
          <div>
            <h1 className="font-display text-xl font-black text-foreground tracking-tight">
              Músicas
            </h1>
            <p className="text-xs text-muted-foreground/50 mt-0.5">
              Gerencie as músicas disponíveis para ouvir e baixar
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 h-9 px-5 rounded-xl bg-gradient-to-r from-gold to-gold/85 text-background text-sm font-bold hover:shadow-lg hover:shadow-gold/20 transition-all shrink-0"
          >
            <Plus className="h-4 w-4" />
            Nova Música
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/60" />
          <input
            type="text"
            placeholder="Buscar por título..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-3 rounded-xl border border-border/30 bg-card/20 text-sm text-foreground/75 placeholder:text-muted-foreground/60 focus:outline-none focus:border-gold/25 transition-colors"
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => { setFilterCategory(e.target.value); setPage(1); }}
          className="h-9 px-3 rounded-xl border border-border/30 bg-card/20 text-xs font-semibold uppercase tracking-wider text-foreground/60 focus:outline-none focus:border-gold/25 transition-colors"
        >
          <option value="all">Todas categorias</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => { setFilterStatus(e.target.value as any); setPage(1); }}
          className="h-9 px-3 rounded-xl border border-border/30 bg-card/20 text-xs font-semibold uppercase tracking-wider text-foreground/60 focus:outline-none focus:border-gold/25 transition-colors"
        >
          <option value="all">Todos status</option>
          <option value="active">Ativos</option>
          <option value="inactive">Inativos</option>
        </select>
        <span className="text-xs text-muted-foreground/60 self-center">
          {total} música{total !== 1 ? 's' : ''}
        </span>
      </div>

      {showForm && (
        <div className="rounded-2xl border border-border/30 bg-card/20 p-6">
          <AddTrackForm
            onSuccess={() => {
              setShowForm(false);
              queryClient.invalidateQueries({ queryKey: ["admin-tracks"] });
              queryClient.invalidateQueries({ queryKey: ["admin-track-categories"] });
            }}
          />
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-16">
          <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground/60 animate-pulse">
            Carregando...
          </p>
        </div>
      ) : !tracks.length ? (
        <div className="text-center py-16 rounded-2xl border border-border/30 bg-card/15">
          <Music className="h-8 w-8 text-muted-foreground/50 mx-auto mb-4" />
          <p className="text-sm text-muted-foreground/70">Nenhuma música encontrada.</p>
        </div>
      ) : (
        <>
          <div className="rounded-2xl border border-border/30 overflow-hidden">
            {tracks.map((track: any) => (
              <div
                key={track.id}
                className="flex items-center gap-4 px-5 py-4 border-b border-border/20 last:border-0 hover:bg-card/20 transition-colors"
              >
                {track.cover_url ? (
                  <img
                    src={track.cover_url}
                    alt={track.title}
                    className="h-10 w-10 rounded-lg object-cover shrink-0"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted/15 shrink-0">
                    <Music className="h-4 w-4 text-gold/40" />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground/75 truncate">
                    {track.title}
                  </p>
                  <p className="text-xs text-muted-foreground/60">
                    {track.category} · {track.duration}
                  </p>
                </div>

                <div className="flex items-center gap-1.5">
                  <Badge
                    variant="outline"
                    className={`text-[11px] rounded-full px-2 border ${
                      track.is_active
                        ? "text-emerald-400/60 border-emerald-500/15 bg-emerald-500/8"
                        : "text-muted-foreground/60 border-border/20"
                    }`}
                  >
                    {track.is_active ? "Ativo" : "Inativo"}
                  </Badge>
                  {track.is_bonus && (
                    <Badge
                      variant="outline"
                      className="text-[11px] rounded-full px-2 border text-amber-400/60 border-amber-500/15 bg-amber-500/8"
                    >
                      <Gift className="h-2.5 w-2.5 mr-1" />
                      Bônus{track.bonus_release_date ? ` · ${new Date(track.bonus_release_date + 'T00:00:00').toLocaleDateString('pt-BR')}` : ''}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setEditingTrack(track)}
                    className="p-2 text-muted-foreground hover:text-gold transition-colors"
                    title="Editar"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  {track.is_bonus && (
                    <button
                      onClick={() => {
                        if (confirm(`Enviar notificação de bônus para todos os clientes sobre "${track.title}"?`)) {
                          notifyMutation.mutate({
                            trackTitle: track.title,
                            releaseDate: track.bonus_release_date || undefined,
                          });
                        }
                      }}
                      disabled={notifyMutation.isPending}
                      className="p-2 text-muted-foreground/60 hover:text-amber-400/60 transition-colors"
                      title="Notificar clientes sobre este bônus"
                    >
                      {notifyMutation.isPending && notifyMutation.variables?.trackTitle === track.title ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Bell className="h-3.5 w-3.5" />
                      )}
                    </button>
                  )}
                  {!track.cover_url && (
                    <button
                      onClick={() =>
                        coverMutation.mutate({ trackId: track.id, title: track.title })
                      }
                      disabled={coverMutation.isPending}
                      className="p-2 text-muted-foreground hover:text-gold transition-colors"
                      title="Gerar capa com IA"
                    >
                      {coverMutation.isPending && coverMutation.variables?.trackId === track.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <ImageIcon className="h-3.5 w-3.5" />
                      )}
                    </button>
                  )}
                  {track.download_url && (
                    <a
                      href={track.download_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-muted-foreground hover:text-gold transition-colors"
                      title="Abrir link de download"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                  <button
                    onClick={() =>
                      toggleMutation.mutate({
                        id: track.id,
                        is_active: !track.is_active,
                      })
                    }
                    className="p-2 text-muted-foreground hover:text-gold transition-colors"
                    title={track.is_active ? "Desativar" : "Ativar"}
                  >
                    {track.is_active ? (
                      <ToggleRight className="h-4 w-4" />
                    ) : (
                      <ToggleLeft className="h-4 w-4" />
                    )}
                  </button>
                  <button
                    onClick={() => {
                      if (confirm("Remover esta música?")) {
                        deleteMutation.mutate(track.id);
                      }
                    }}
                    className="p-2 text-muted-foreground/60 hover:text-destructive/60 transition-colors"
                    title="Remover"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Paginação */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="flex items-center gap-1 h-8 px-3 rounded-lg border border-border/30 text-xs font-semibold text-foreground/50 hover:bg-card/15 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                Anterior
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                  .reduce<(number | string)[]>((acc, p, idx, arr) => {
                    if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push('...');
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((item, idx) =>
                    typeof item === 'string' ? (
                      <span key={`ellipsis-${idx}`} className="w-8 text-center text-muted-foreground/60 text-xs">…</span>
                    ) : (
                      <button
                        key={item}
                        onClick={() => setPage(item)}
                        className={`h-8 w-8 rounded-lg text-xs font-semibold transition-colors ${
                          item === page
                            ? "bg-gold/20 text-gold/80 border border-gold/20"
                            : "text-foreground/40 hover:bg-card/15 border border-transparent"
                        }`}
                      >
                        {item}
                      </button>
                    )
                  )}
              </div>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="flex items-center gap-1 h-8 px-3 rounded-lg border border-border/30 text-xs font-semibold text-foreground/50 hover:bg-card/15 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                Próximo
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </>
      )}

      {editingTrack && (
        <EditTrackDialog
          track={editingTrack}
          open={!!editingTrack}
          onOpenChange={(open) => { if (!open) setEditingTrack(null); }}
        />
      )}
    </div>
  );
}