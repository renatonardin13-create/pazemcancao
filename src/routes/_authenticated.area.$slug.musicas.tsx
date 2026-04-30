import { createFileRoute, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TrackCard } from "@/components/TrackCard";
import { Music, Search, Play, Headphones, ListMusic } from "lucide-react";
import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { usePlayer } from "@/hooks/use-player";
import type { Track } from "@/lib/sample-tracks";

export const Route = createFileRoute("/_authenticated/area/$slug/musicas")({
  component: AreaMusicLibrary,
});

function getStoragePublicUrl(storagePath: string | null | undefined) {
  if (!storagePath) return "";
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  return `${supabaseUrl}/storage/v1/object/public/tracks/${storagePath}`;
}

function dbTrackToPlayerTrack(track: any): Track {
  const audioUrl = getStoragePublicUrl(track?.storage_path);
  return {
    id: String(track?.id ?? ""),
    title: track?.title || "Música sem título",
    duration: track?.duration || "0:00",
    category: track?.category || "Sem categoria",
    audioUrl,
    downloadUrl: track?.download_url || audioUrl,
    description: track?.description || "",
    coverUrl: track?.cover_url || undefined,
    isBonus: Boolean(track?.is_bonus),
    bonusReleaseDate: track?.bonus_release_date ?? null,
    isLocked: track?.is_active === false,
  };
}

function AreaMusicLibrary() {
  const { slug } = useParams({ from: "/_authenticated/area/$slug/musicas" });
  const [searchTerm, setSearchTerm] = useState("");
  const { setQueue, toggle } = usePlayer();

  const { data: area } = useQuery({
    queryKey: ["area", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("areas")
        .select("*")
        .eq("slug", slug)
        .single();
      if (error) throw error;
      return data;
    },
  });

  const { data: rawTracks = [], isLoading } = useQuery({
    queryKey: ["area-tracks", area?.id],
    enabled: !!area?.id,
    queryFn: async () => {
      if (!area?.id) return [];
      const { data, error } = await supabase
        .from("tracks")
        .select("*")
        .eq("area_id", area.id)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const tracks = useMemo(() => rawTracks.map(dbTrackToPlayerTrack), [rawTracks]);

  const filteredTracks = useMemo(() => {
    return tracks.filter((track) =>
      track.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (track.category && track.category.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [tracks, searchTerm]);

  const categories = useMemo(() => {
    const cats = new Set<string>();
    tracks.forEach((t) => {
      if (t.category) cats.add(t.category);
    });
    return Array.from(cats).sort();
  }, [tracks]);

  const handlePlayAll = () => {
    if (filteredTracks.length > 0) {
      const playable = filteredTracks.filter(t => t.audioUrl && !t.isLocked);
      if (playable.length > 0) {
        setQueue(playable, 0);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 pb-32">
      {/* Header Section */}
      <section className="relative overflow-hidden rounded-3xl border border-white/5 bg-gradient-to-br from-card/50 via-card/20 to-background/50 p-8 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row gap-6 items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-primary/80">
              <Headphones className="h-4 w-4" />
              <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Music Experience</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Sua Biblioteca</h1>
            <p className="text-muted-foreground">Explore os louvores exclusivos desta área.</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar louvores..."
                className="bg-background/40 border-white/5 pl-10 h-12 rounded-xl"
              />
            </div>
            <Button 
              onClick={handlePlayAll} 
              disabled={filteredTracks.filter(t => t.audioUrl && !t.isLocked).length === 0}
              className="h-12 px-6 gap-2 rounded-xl shadow-lg shadow-primary/20 w-full sm:w-auto"
            >
              <Play className="h-4 w-4 fill-current" /> Tocar Tudo
            </Button>
          </div>
        </div>
      </section>

      {/* Categories Filter */}
      {categories.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <ListMusic className="h-4 w-4" />
            <h2 className="text-xs font-bold uppercase tracking-widest">Filtrar por Categoria</h2>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            <Button variant="ghost" className="rounded-full bg-muted/50 hover:bg-muted">Todas</Button>
            {categories.map((cat) => (
              <Button key={cat} variant="ghost" className="rounded-full bg-muted/30 hover:bg-muted/50 transition-all">{cat}</Button>
            ))}
          </div>
        </section>
      )}

      {/* Tracks Grid */}
      <section className="space-y-6">
        {filteredTracks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center opacity-50">
            <Music className="h-12 w-12 mb-4" />
            <p>Nenhuma música encontrada.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredTracks.map((track, index) => (
              <TrackCard key={track.id} track={track} index={index} queue={filteredTracks} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
