import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listAdminTracks, deleteTrack, updateTrack } from "@/lib/admin-tracks.functions";
import { Music, Plus, Trash2, ToggleLeft, ToggleRight, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { AddTrackForm } from "@/components/AddTrackForm";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/tracks")({
  component: AdminTracksPage,
});

function AdminTracksPage() {
  const [showForm, setShowForm] = useState(false);
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

  const tracks = data?.tracks || [];

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

              <div className="flex items-center gap-1">
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
    </div>
  );
}
