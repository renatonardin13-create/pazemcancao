import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listAdminTracks, deleteTrack, updateTrack } from "@/lib/admin-tracks.functions";
import { Plus, Music, MoreHorizontal, Pencil, Trash2, Link as LinkIcon, Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { StatusBadge } from "@/components/StatusBadge";
import { toast } from "sonner";
import { useState, useMemo } from "react";
import { TableSkeleton } from "@/components/LoadingSkeletons";

export const Route = createFileRoute("/_authenticated/admin/musicas")({
  component: AdminTracksPage,
});

function AdminTracksPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-tracks"],
    queryFn: () => listAdminTracks(),
  });

  const deleteM = useMutation({
    mutationFn: (id: string) => deleteTrack({ data: { id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-tracks"] });
      toast.success("Música excluída com sucesso");
    },
  });

  const toggleStatusM = useMutation({
    mutationFn: ({ id, is_active }: { id: string; is_active: boolean }) =>
      updateTrack({ data: { id, is_active: !is_active } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-tracks"] });
      toast.success("Status atualizado");
    },
  });

  const filtered = useMemo(() => {
    return (data?.tracks || []).filter((t: any) => 
      t.title?.toLowerCase().includes(search.toLowerCase())
    );
  }, [data?.tracks, search]);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="relative rounded-2xl border border-gold/10 bg-card p-6 overflow-hidden shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-black text-foreground tracking-tight">Músicas</h1>
            <p className="text-xs text-muted-foreground/50 mt-0.5">Gerencie os louvores da plataforma.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
              <Input
                placeholder="Buscar música..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 w-full sm:w-64 bg-background/40 border-border/20 rounded-xl"
              />
            </div>
            <Button className="rounded-xl bg-gold text-background font-bold hover:bg-gold/90">
              <Plus className="h-4 w-4 mr-2" />
              Nova Música
            </Button>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border/30 bg-card overflow-hidden shadow-lg">
        <Table>
          <TableHeader>
            <TableRow className="border-border/25">
              <TableHead className="w-16">Capa</TableHead>
              <TableHead>Título</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-20 text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableSkeleton rows={5} cols={4} />
            ) : filtered.map((track: any) => (
              <TableRow key={track.id} className="border-border/10 hover:bg-card/20">
                <TableCell>
                  <div className="h-12 w-12 rounded-lg bg-muted/20 overflow-hidden">
                    {track.cover_url ? (
                      <img src={track.cover_url} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center">
                        <Music className="h-5 w-5 text-gold/30" />
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <p className="text-sm font-medium">{track.title}</p>
                </TableCell>
                <TableCell>
                  <StatusBadge status={track.is_active ? "published" : "draft"} />
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem className="gap-2"><Pencil className="h-3.5 w-3.5" /> Editar</DropdownMenuItem>
                      <DropdownMenuItem className="gap-2" onClick={() => toggleStatusM.mutate({ id: track.id, is_active: track.is_active })}>
                        {track.is_active ? "Inativar" : "Ativar"}
                      </DropdownMenuItem>
                      <DropdownMenuItem className="gap-2"><LinkIcon className="h-3.5 w-3.5" /> Copiar Link</DropdownMenuItem>
                      <DropdownMenuItem className="gap-2"><Bell className="h-3.5 w-3.5" /> Notificar</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="gap-2 text-destructive" onClick={() => deleteM.mutate(track.id)}><Trash2 className="h-3.5 w-3.5" /> Excluir</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}