import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listAdminPlaylists,
  createPlaylist,
  updatePlaylist,
  deletePlaylist,
  listPlaylistTracks,
  addTrackToPlaylist,
  removeTrackFromPlaylist,
  reorderPlaylistTracks,
  listAllTracksForPicker,
} from "@/lib/admin-playlists.functions";
import {
  Disc3, Plus, Trash2, ToggleLeft, ToggleRight, Pencil, Music, Search,
  GripVertical, X, ChevronUp, ChevronDown, Image as ImageIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import { toast } from "sonner";
import { EmptyState } from "@/components/EmptyState";

export const Route = createFileRoute("/_authenticated/admin/playlists")({
  component: AdminPlaylistsPage,
});

function AdminPlaylistsPage() {
  const queryClient = useQueryClient();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingPlaylist, setEditingPlaylist] = useState<any>(null);
  const [managingPlaylistId, setManagingPlaylistId] = useState<string | null>(null);
  const [showTrackPicker, setShowTrackPicker] = useState(false);
  const [trackSearch, setTrackSearch] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-playlists"],
    queryFn: () => listAdminPlaylists(),
    staleTime: 30_000,
  });

  const playlists = data?.playlists || [];

  const createMutation = useMutation({
    mutationFn: (input: { name: string; description?: string; cover_url?: string }) =>
      createPlaylist({ data: input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-playlists"] });
      toast.success("Playlist criada!");
      setShowCreateDialog(false);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const updateMutation = useMutation({
    mutationFn: (input: { id: string; name?: string; description?: string; cover_url?: string; is_active?: boolean }) =>
      updatePlaylist({ data: input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-playlists"] });
      toast.success("Playlist atualizada!");
      setEditingPlaylist(null);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deletePlaylist({ data: { id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-playlists"] });
      toast.success("Playlist removida");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Disc3 className="h-5 w-5 text-gold/50" />
          <h1 className="text-xl font-bold text-foreground/85 tracking-tight">Playlists</h1>
          <Badge variant="secondary" className="text-xs">{playlists.length}</Badge>
        </div>
        <Button size="sm" onClick={() => setShowCreateDialog(true)} className="gap-1.5 bg-gold/15 text-gold border border-gold/20 hover:bg-gold/25">
          <Plus className="h-3.5 w-3.5" /> Nova Playlist
        </Button>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="text-center py-16 text-muted-foreground/50 text-sm">Carregando...</div>
      ) : playlists.length === 0 ? (
        <EmptyState
          icon={<Disc3 className="h-10 w-10 text-muted-foreground/30" />}
          title="Nenhuma playlist"
          description="Crie playlists para organizar seus louvores"
        />
      ) : (
        <div className="grid gap-3">
          {playlists.map((pl: any) => (
            <div
              key={pl.id}
              className={`rounded-xl border p-4 transition-all duration-300 ${
                pl.is_active ? "border-border/30 bg-card/20" : "border-border/15 bg-card/5 opacity-60"
              }`}
            >
              <div className="flex items-center gap-4">
                {/* Cover */}
                <div className="h-14 w-14 rounded-lg bg-gradient-to-br from-violet-900/30 to-slate-950/40 border border-border/20 overflow-hidden shrink-0 flex items-center justify-center">
                  {pl.cover_url ? (
                    <img src={pl.cover_url} alt={pl.name} className="w-full h-full object-cover" />
                  ) : (
                    <Disc3 className="h-6 w-6 text-muted-foreground/30" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-sm text-foreground/85 truncate">{pl.name}</h3>
                  {pl.description && (
                    <p className="text-xs text-muted-foreground/50 truncate mt-0.5">{pl.description}</p>
                  )}
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-[11px] text-muted-foreground/40">
                      {pl.track_count} música{pl.track_count !== 1 ? "s" : ""}
                    </span>
                    <Badge variant={pl.is_active ? "default" : "secondary"} className="text-[10px]">
                      {pl.is_active ? "Ativa" : "Inativa"}
                    </Badge>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => setManagingPlaylistId(managingPlaylistId === pl.id ? null : pl.id)}
                    className="p-2 rounded-lg text-muted-foreground/50 hover:text-gold/70 hover:bg-gold/5 transition-colors"
                    title="Gerenciar músicas"
                  >
                    <Music className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setEditingPlaylist(pl)}
                    className="p-2 rounded-lg text-muted-foreground/50 hover:text-gold/70 hover:bg-gold/5 transition-colors"
                    title="Editar"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => updateMutation.mutate({ id: pl.id, is_active: !pl.is_active })}
                    className="p-2 rounded-lg text-muted-foreground/50 hover:text-gold/70 hover:bg-gold/5 transition-colors"
                    title={pl.is_active ? "Desativar" : "Ativar"}
                  >
                    {pl.is_active ? <ToggleRight className="h-4 w-4 text-emerald-500/60" /> : <ToggleLeft className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={() => {
                      if (confirm("Remover esta playlist?")) deleteMutation.mutate(pl.id);
                    }}
                    className="p-2 rounded-lg text-muted-foreground/50 hover:text-destructive/70 hover:bg-destructive/5 transition-colors"
                    title="Excluir"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Track management panel */}
              {managingPlaylistId === pl.id && (
                <div className="mt-4 pt-4 border-t border-border/20">
                  <PlaylistTracksManager
                    playlistId={pl.id}
                    onAddTrack={() => setShowTrackPicker(true)}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create Dialog */}
      <PlaylistFormDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        title="Nova Playlist"
        onSubmit={(values) => createMutation.mutate(values)}
        loading={createMutation.isPending}
      />

      {/* Edit Dialog */}
      <PlaylistFormDialog
        open={!!editingPlaylist}
        onOpenChange={(open) => !open && setEditingPlaylist(null)}
        title="Editar Playlist"
        initialValues={editingPlaylist}
        onSubmit={(values) => editingPlaylist && updateMutation.mutate({ id: editingPlaylist.id, ...values })}
        loading={updateMutation.isPending}
      />

      {/* Track Picker Dialog */}
      {managingPlaylistId && (
        <TrackPickerDialog
          open={showTrackPicker}
          onOpenChange={setShowTrackPicker}
          playlistId={managingPlaylistId}
          trackSearch={trackSearch}
          setTrackSearch={setTrackSearch}
        />
      )}
    </div>
  );
}

/* ── Playlist Form Dialog ── */
function PlaylistFormDialog({
  open, onOpenChange, title, initialValues, onSubmit, loading,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  initialValues?: any;
  onSubmit: (values: { name: string; description?: string; cover_url?: string }) => void;
  loading: boolean;
}) {
  const [name, setName] = useState(initialValues?.name || "");
  const [description, setDescription] = useState(initialValues?.description || "");
  const [coverUrl, setCoverUrl] = useState(initialValues?.cover_url || "");

  // Reset when dialog opens with new values
  const handleOpenChange = (open: boolean) => {
    if (open) {
      setName(initialValues?.name || "");
      setDescription(initialValues?.description || "");
      setCoverUrl(initialValues?.cover_url || "");
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!name.trim()) return;
            onSubmit({ name: name.trim(), description: description.trim() || undefined, cover_url: coverUrl.trim() || undefined });
          }}
          className="space-y-4 mt-2"
        >
          <div>
            <label className="text-xs font-semibold text-muted-foreground/70 mb-1.5 block">Nome *</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome da playlist" required />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground/70 mb-1.5 block">Descrição</label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Descrição opcional" />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground/70 mb-1.5 block">URL da capa</label>
            <Input value={coverUrl} onChange={(e) => setCoverUrl(e.target.value)} placeholder="https://..." />
            {coverUrl && (
              <div className="mt-2 h-20 w-20 rounded-lg overflow-hidden border border-border/20">
                <img src={coverUrl} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" size="sm" disabled={loading || !name.trim()} className="bg-gold/15 text-gold border border-gold/20 hover:bg-gold/25">
              {loading ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ── Playlist Tracks Manager ── */
function PlaylistTracksManager({ playlistId, onAddTrack }: { playlistId: string; onAddTrack: () => void }) {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["playlist-tracks-admin", playlistId],
    queryFn: () => listPlaylistTracks({ data: { playlistId } }),
    staleTime: 15_000,
  });

  const removeMutation = useMutation({
    mutationFn: (ptId: string) => removeTrackFromPlaylist({ data: { ptId } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["playlist-tracks-admin", playlistId] });
      queryClient.invalidateQueries({ queryKey: ["admin-playlists"] });
      toast.success("Música removida da playlist");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const reorderMutation = useMutation({
    mutationFn: (trackIds: string[]) => reorderPlaylistTracks({ data: { playlistId, trackIds } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["playlist-tracks-admin", playlistId] });
    },
  });

  const tracks = data?.tracks || [];

  const moveTrack = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= tracks.length) return;
    const newOrder = [...tracks];
    [newOrder[index], newOrder[newIndex]] = [newOrder[newIndex], newOrder[index]];
    reorderMutation.mutate(newOrder.map((t: any) => t.id));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-muted-foreground/60">
          {tracks.length} música{tracks.length !== 1 ? "s" : ""} na playlist
        </span>
        <Button size="sm" variant="outline" onClick={onAddTrack} className="gap-1.5 text-xs h-8">
          <Plus className="h-3 w-3" /> Adicionar música
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-6 text-xs text-muted-foreground/40">Carregando...</div>
      ) : tracks.length === 0 ? (
        <div className="text-center py-6 text-xs text-muted-foreground/40">
          Nenhuma música ainda. Clique em "Adicionar música" para começar.
        </div>
      ) : (
        <div className="space-y-1.5">
          {tracks.map((track: any, idx: number) => (
            <div
              key={track.id}
              className="flex items-center gap-3 rounded-lg border border-border/15 bg-card/10 px-3 py-2.5 group"
            >
              <span className="text-[11px] font-bold text-muted-foreground/30 w-5 text-right shrink-0">{idx + 1}</span>
              <div className="h-8 w-8 rounded-md bg-gradient-to-br from-slate-800 to-slate-900 border border-border/15 overflow-hidden shrink-0 flex items-center justify-center">
                {track.cover_url ? (
                  <img src={track.cover_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <Music className="h-3.5 w-3.5 text-muted-foreground/25" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-foreground/80 truncate">{track.title}</p>
                <p className="text-[10px] text-muted-foreground/40">{track.category} · {track.duration}</p>
              </div>
              <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => moveTrack(idx, 'up')}
                  disabled={idx === 0}
                  className="p-1.5 rounded text-muted-foreground/40 hover:text-foreground/60 disabled:opacity-20 transition-colors"
                >
                  <ChevronUp className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => moveTrack(idx, 'down')}
                  disabled={idx === tracks.length - 1}
                  className="p-1.5 rounded text-muted-foreground/40 hover:text-foreground/60 disabled:opacity-20 transition-colors"
                >
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => removeMutation.mutate(track.pt_id)}
                  className="p-1.5 rounded text-muted-foreground/40 hover:text-destructive/70 transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Track Picker Dialog ── */
function TrackPickerDialog({
  open, onOpenChange, playlistId, trackSearch, setTrackSearch,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  playlistId: string;
  trackSearch: string;
  setTrackSearch: (v: string) => void;
}) {
  const queryClient = useQueryClient();

  const { data: allTracksData } = useQuery({
    queryKey: ["all-tracks-picker"],
    queryFn: () => listAllTracksForPicker(),
    staleTime: 60_000,
    enabled: open,
  });

  const { data: plTracksData } = useQuery({
    queryKey: ["playlist-tracks-admin", playlistId],
    queryFn: () => listPlaylistTracks({ data: { playlistId } }),
    staleTime: 15_000,
    enabled: open,
  });

  const addMutation = useMutation({
    mutationFn: (trackId: string) => addTrackToPlaylist({ data: { playlistId, trackId } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["playlist-tracks-admin", playlistId] });
      queryClient.invalidateQueries({ queryKey: ["admin-playlists"] });
      toast.success("Música adicionada!");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const allTracks = allTracksData?.tracks || [];
  const existingIds = new Set((plTracksData?.tracks || []).map((t: any) => t.id));

  const filtered = allTracks.filter((t: any) => {
    if (existingIds.has(t.id)) return false;
    if (!trackSearch) return true;
    return t.title.toLowerCase().includes(trackSearch.toLowerCase()) ||
      t.category.toLowerCase().includes(trackSearch.toLowerCase());
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Adicionar Música</DialogTitle>
        </DialogHeader>
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50" />
          <Input
            value={trackSearch}
            onChange={(e) => setTrackSearch(e.target.value)}
            placeholder="Buscar músicas..."
            className="pl-9 h-9 text-sm"
          />
        </div>
        <div className="flex-1 overflow-y-auto space-y-1 min-h-0 max-h-[50vh]">
          {filtered.length === 0 ? (
            <div className="text-center py-8 text-xs text-muted-foreground/40">
              {allTracks.length === 0 ? "Carregando..." : "Nenhuma música disponível"}
            </div>
          ) : (
            filtered.map((track: any) => (
              <button
                key={track.id}
                onClick={() => addMutation.mutate(track.id)}
                disabled={addMutation.isPending}
                className="w-full flex items-center gap-3 rounded-lg border border-border/15 bg-card/10 px-3 py-2.5 hover:bg-gold/5 hover:border-gold/15 transition-all text-left"
              >
                <div className="h-8 w-8 rounded-md bg-gradient-to-br from-slate-800 to-slate-900 border border-border/15 overflow-hidden shrink-0 flex items-center justify-center">
                  {track.cover_url ? (
                    <img src={track.cover_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Music className="h-3.5 w-3.5 text-muted-foreground/25" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-foreground/80 truncate">{track.title}</p>
                  <p className="text-[10px] text-muted-foreground/40">{track.category} · {track.duration}</p>
                </div>
                <Plus className="h-4 w-4 text-gold/50 shrink-0" />
              </button>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
