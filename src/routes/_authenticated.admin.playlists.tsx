import { createFileRoute } from "@tanstack/react-router";
import { Compass, Plus, MoreHorizontal, Music, ListMusic, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { StatusBadge } from "@/components/StatusBadge";
import { useState } from "react";

export const Route = createFileRoute("/_authenticated/admin/playlists")({
  component: AdminPlaylistsPage,
});

function AdminPlaylistsPage() {
  const [search, setSearch] = useState("");

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="relative rounded-2xl border border-gold/10 bg-card p-6 overflow-hidden shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-black text-foreground tracking-tight">Playlists</h1>
            <p className="text-xs text-muted-foreground/50 mt-0.5">Organize coleções de louvores para os alunos.</p>
          </div>
          <div className="flex items-center gap-3">
             <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
              <Input
                placeholder="Buscar playlist..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 w-full sm:w-64 bg-background/40 border-border/20 rounded-xl"
              />
            </div>
            <Button className="rounded-xl bg-gold text-background font-bold hover:bg-gold/90">
              <Plus className="h-4 w-4 mr-2" />
              Nova Playlist
            </Button>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border/30 bg-card p-12 text-center">
        <ListMusic className="h-12 w-12 text-muted-foreground/20 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-foreground/80">Gestão de Playlists</h3>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
          Crie playlists temáticas para ajudar seus alunos em diferentes momentos da jornada espiritual.
        </p>
        <Button variant="outline" className="mt-6 rounded-xl border-gold/20 text-gold hover:bg-gold/5">
          Criar Playlist
        </Button>
      </div>
    </div>
  );
}