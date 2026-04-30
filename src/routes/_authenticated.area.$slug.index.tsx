import { createFileRoute, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { ContentCard } from "@/components/ContentCard";
import { TrackCard } from "@/components/TrackCard";
import { Search, Filter, Music, BookOpen, GraduationCap, LayoutGrid } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useArea } from "@/providers/AreaProvider";
import type { Track } from "@/lib/sample-tracks";

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

export const Route = createFileRoute("/_authenticated/area/$slug/")({
  component: AreaDashboard,
});

function AreaDashboard() {
  const { slug } = useParams({ from: "/_authenticated/area/$slug/" });
  const { user } = useAuth();
  const { switchArea, currentArea } = useArea();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

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

  // Sync current area in provider
  useEffect(() => {
    if (area && currentArea?.id !== area.id) {
      switchArea(area.id);
    }
  }, [area, currentArea?.id, switchArea]);

  const { data: categories = [] } = useQuery({
    queryKey: ["categories", area?.id],
    enabled: !!area?.id,
    queryFn: async () => {
      if (!area?.id) return [];
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("area_id", area.id)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const { data: contents = [] } = useQuery({
    queryKey: ["area-contents", area?.id],
    enabled: !!area?.id,
    queryFn: async () => {
      if (!area?.id) return [];
      const { data, error } = await supabase
        .from("contents")
        .select("*, categories(name)")
        .eq("area_id", area.id)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const { data: rawTracks = [] } = useQuery({
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

  const filteredContents = useMemo(() => {
    return contents.filter((item) => {
      const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = selectedCategory === "all" || item.category_id === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [contents, search, selectedCategory]);

  const featuredContent = useMemo(() => {
    // For now, let's say the first 3 are featured or if there's an is_featured flag (which I didn't see in contents, but let's check content_items)
    return contents.slice(0, 3);
  }, [contents]);

  const tracksByCategory = useMemo(() => {
    const groups: Record<string, any[]> = {};
    tracks.forEach((track) => {
      const cat = track.category || "Geral";
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(track);
    });
    return groups;
  }, [tracks]);

  return (
    <div className="p-6 space-y-10 pb-32">
      {/* Welcome Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">
          Bem-vindo de volta, <span className="text-primary">{user?.user_metadata?.full_name || user?.email?.split('@')[0]}</span>!
        </h1>
        <p className="text-muted-foreground">Continue sua jornada de onde parou.</p>
      </div>

      {/* Featured Section */}
      {featuredContent.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <LayoutGrid className="h-5 w-5 text-primary" />
              Destaques
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredContent.map((item, index) => (
              <ContentCard
                key={item.id}
                item={item}
                index={index}
                hasAccess={true}
                gradient="from-primary/20 to-transparent"
                TypeIcon={item.type === 'ebook' ? BookOpen : GraduationCap}
              />
            ))}
          </div>
        </section>
      )}

      {/* Main Content Explorer */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar conteúdos..."
              className="pl-10 bg-muted/50 border-white/5 focus:border-primary/50 transition-all rounded-xl"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 w-full md:w-auto no-scrollbar">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                selectedCategory === "all"
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted"
              }`}
            >
              Todos
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="bg-muted/30 border border-white/5 p-1 rounded-xl mb-6">
            <TabsTrigger value="all" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all px-6">
              Todos
            </TabsTrigger>
            <TabsTrigger value="music" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all px-6 flex items-center gap-2">
              <Music className="h-4 w-4" /> Músicas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-0">
            {filteredContents.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                <div className="h-16 w-16 rounded-full bg-muted/30 flex items-center justify-center">
                  <LayoutGrid className="h-8 w-8 text-muted-foreground/50" />
                </div>
                <div>
                  <h3 className="text-lg font-medium">Nenhum conteúdo encontrado</h3>
                  <p className="text-muted-foreground">Tente ajustar sua busca ou filtros.</p>
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredContents.map((item, index) => (
                <ContentCard
                  key={item.id}
                  item={item}
                  index={index}
                  hasAccess={true}
                  gradient="from-primary/10 to-transparent"
                  TypeIcon={item.type === 'ebook' ? BookOpen : GraduationCap}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="music" className="mt-0 space-y-10">
            {Object.entries(tracksByCategory).length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                <div className="h-16 w-16 rounded-full bg-muted/30 flex items-center justify-center">
                  <Music className="h-8 w-8 text-muted-foreground/50" />
                </div>
                <div>
                  <h3 className="text-lg font-medium">Nenhuma música encontrada</h3>
                  <p className="text-muted-foreground">Esta área ainda não possui músicas cadastradas.</p>
                </div>
              </div>
            ) : (
              Object.entries(tracksByCategory).map(([category, catTracks]) => (
                <section key={category} className="space-y-4">
                  <h3 className="text-xl font-semibold px-1">{category}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {catTracks.map((track, idx) => (
                      <TrackCard key={track.id} track={track} index={idx} queue={catTracks} />
                    ))}
                  </div>
                </section>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
