import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listAdminTracks, deleteTrack, updateTrack, regenerateCover } from "@/lib/admin-tracks.functions";
import { sendBonusNotification } from "@/lib/notifications.functions";
import { Music, Plus, Trash2, ToggleLeft, ToggleRight, ExternalLink, ImageIcon, Loader2, Pencil, Gift, Bell, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { AddTrackForm } from "@/components/AddTrackForm";
import { EditTrackDialog } from "@/components/EditTrackDialog";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/tracks")({
  component: AdminTracksPage,
});

function AdminTracksPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingTrack, setEditingTrack] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-tracks"],
    queryFn: () => listAdminTracks(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteTrack({ data: { id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-tracks"] });
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
      toast.error("Erro ao gerar capa: " + err.message);
    },
  });

  const notifyMutation = useMutation({
    mutationFn: ({ trackTitle, releaseDate }: { trackTitle: string; releaseDate?: string }) =>
      sendBonusNotification({ data: { trackTitle, releaseDate } }),
    onSuccess: (result) => {
      toast.success(`Notificação enviada para ${result.sent} clientes!`);
    },
    onError: (err: Error) => {
      toast.error("Erro ao notificar: " + err.message);
    },
  });

  const allTracks = data?.tracks || [];

  const categories = Array.from(new Set(allTracks.map((t: any) => t.category))).sort();

  const tracks = allTracks.filter((track: any) => {
    const matchesSearch = !searchQuery || track.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === "all" || track.category === filterCategory;
    const matchesStatus = filterStatus === "all" || (filterStatus === "active" ? track.is_active : !track.is_active);
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground/85 tracking-tight">
            Músicas
          </h1>
          <p className="mt-1 text-[13px] text-muted-foreground/40">
            Gerencie as músicas disponíveis para ouvir e baixar
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 rounded-xl h-10 px-4 text-[11px] font-semibold uppercase tracking-wider bg-gold/15 text-gold/70 border border-gold/12 hover:bg-gold/22 transition-all duration-500"
        >
          <Plus className="h-3.5 w-3.5" />
          Nova Música
        </button>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/30" />
          <input
            type="text"
            placeholder="Buscar por título..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-9 pl-9 pr-3 rounded-xl border border-border/15 bg-card/10 text-sm text-foreground/75 placeholder:text-muted-foreground/25 focus:outline-none focus:border-gold/25 transition-colors"
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="h-9 px-3 rounded-xl border border-border/15 bg-card/10 text-[11px] font-semibold uppercase tracking-wider text-foreground/60 focus:outline-none focus:border-gold/25 transition-colors"
        >
          <option value="all">Todas categorias</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as any)}
          className="h-9 px-3 rounded-xl border border-border/15 bg-card/10 text-[11px] font-semibold uppercase tracking-wider text-foreground/60 focus:outline-none focus:border-gold/25 transition-colors"
        >
          <option value="all">Todos status</option>
          <option value="active">Ativos</option>
          <option value="inactive">Inativos</option>
        </select>
        {(searchQuery || filterCategory !== "all" || filterStatus !== "all") && (
          <span className="text-[10px] text-muted-foreground/30 self-center">
            {tracks.length} de {allTracks.length}
          </span>
        )}
      </div>

      {showForm && (
        <div className="rounded-2xl border border-border/15 bg-card/10 p-6">
          <AddTrackForm
            onSuccess={() => {
              setShowForm(false);
              queryClient.invalidateQueries({ queryKey: ["admin-tracks"] });
            }}
          />
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-16">
          <p className="text-[11px] uppercase tracking-[0.4em] text-muted-foreground/25 animate-pulse">
            Carregando...
          </p>
        </div>
      ) : !tracks.length ? (
        <div className="text-center py-16 rounded-2xl border border-border/15 bg-card/5">
          <Music className="h-8 w-8 text-muted-foreground/15 mx-auto mb-4" />
          <p className="text-sm text-muted-foreground/35">Nenhuma música cadastrada.</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-border/15 overflow-hidden">
          {tracks.map((track: any) => (
            <div
              key={track.id}
              className="flex items-center gap-4 px-5 py-4 border-b border-border/8 last:border-0 hover:bg-card/10 transition-colors"
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
                <p className="text-[11px] text-muted-foreground/30">
                  {track.category} · {track.duration}
                </p>
              </div>

              <div className="flex items-center gap-1.5">
                <Badge
                  variant="outline"
                  className={`text-[9px] rounded-full px-2 border ${
                    track.is_active
                      ? "text-emerald-400/60 border-emerald-500/15 bg-emerald-500/8"
                      : "text-muted-foreground/30 border-border/20"
                  }`}
                >
                  {track.is_active ? "Ativo" : "Inativo"}
                </Badge>
                {track.is_bonus && (
                  <Badge
                    variant="outline"
                    className="text-[9px] rounded-full px-2 border text-amber-400/60 border-amber-500/15 bg-amber-500/8"
                  >
                    <Gift className="h-2.5 w-2.5 mr-1" />
                    Bônus{track.bonus_release_date ? ` · ${new Date(track.bonus_release_date + 'T00:00:00').toLocaleDateString('pt-BR')}` : ''}
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setEditingTrack(track)}
                  className="p-2 text-muted-foreground/30 hover:text-gold/60 transition-colors"
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
                    className="p-2 text-muted-foreground/30 hover:text-amber-400/60 transition-colors"
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
                    className="p-2 text-muted-foreground/30 hover:text-gold/60 transition-colors"
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
                    className="p-2 text-muted-foreground/30 hover:text-gold/60 transition-colors"
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
                  className="p-2 text-muted-foreground/30 hover:text-gold/60 transition-colors"
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
                  className="p-2 text-muted-foreground/30 hover:text-destructive/60 transition-colors"
                  title="Remover"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
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
