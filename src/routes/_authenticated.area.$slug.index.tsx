import { createFileRoute, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { ContentCard } from "@/components/ContentCard";
import { TrackCard } from "@/components/TrackCard";
import { Search, Music, BookOpen, GraduationCap, LayoutGrid } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { CardGridSkeleton } from "@/components/LoadingSkeletons";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
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
      {/* Welcome & Banner Section */}
      <section className="relative overflow-hidden rounded-3xl min-h-[300px] sm:min-h-[400px] flex flex-col justify-end p-8 sm:p-12 shadow-2xl border border-white/5">
        {area?.banner_url ? (
          <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-[2s] hover:scale-105"
            style={{ backgroundImage: `url(${area.banner_url})` }}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-primary/5 to-background" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        
        <div className="relative z-10 space-y-4 max-w-2xl animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="space-y-1">
            <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-white drop-shadow-sm">
              Bem-vindo, <span className="text-primary">{user?.user_metadata?.full_name || user?.email?.split('@')[0]}</span>!
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground/90 font-medium leading-relaxed max-w-lg">
              {area?.description || "Sua jornada de paz e espiritualidade começa aqui. Explore os louvores e conteúdos exclusivos preparados para você."}
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-4 pt-6">
            <Button className="rounded-full px-10 h-14 text-lg font-bold shadow-[0_8px_30px_rgba(0,0,0,0.3)] shadow-primary/25 hover:scale-105 transition-all">
              Continuar Assistindo
            </Button>
            <Button variant="outline" className="rounded-full px-10 h-14 text-lg font-bold bg-white/5 border-white/10 hover:bg-white/10 backdrop-blur-md transition-all">
              Minha Lista
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Content Row */}
      {featuredContent.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <LayoutGrid className="h-6 w-6 text-primary" />
              Recomendados para você
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
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
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between border-b border-white/5 pb-8">
          <div className="relative w-full md:w-[400px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/60" />
            <Input
              placeholder="O que você quer vivenciar hoje?"
              className="pl-12 h-14 bg-muted/30 border-white/5 focus:border-primary/50 transition-all rounded-2xl text-lg"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3 overflow-x-auto pb-2 w-full md:w-auto no-scrollbar scroll-smooth">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-6 py-3 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-300 ${
                selectedCategory === "all"
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-105"
                  : "bg-muted/30 text-muted-foreground hover:bg-muted/50 border border-white/5"
              }`}
            >
              Todos
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-6 py-3 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-300 ${
                  selectedCategory === cat.id
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-105"
                    : "bg-muted/30 text-muted-foreground hover:bg-muted/50 border border-white/5"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="bg-muted/20 border border-white/5 p-1.5 rounded-2xl mb-10 h-auto">
            <TabsTrigger value="all" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all px-8 py-3 font-bold text-sm">
              Catálogo Geral
            </TabsTrigger>
            <TabsTrigger value="music" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all px-8 py-3 font-bold text-sm flex items-center gap-2">
              <Music className="h-4 w-4" /> Louvores
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-0 focus-visible:ring-0">
            {filteredContents.length === 0 && (
              <div className="flex flex-col items-center justify-center py-32 text-center space-y-6">
                <div className="h-20 w-20 rounded-full bg-muted/20 flex items-center justify-center">
                  <LayoutGrid className="h-10 w-10 text-muted-foreground/30" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold">Nenhum conteúdo encontrado</h3>
                  <p className="text-muted-foreground max-w-sm mx-auto">Tente buscar por outro termo ou selecione uma categoria diferente.</p>
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-8">
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

          <TabsContent value="music" className="mt-0 space-y-16 focus-visible:ring-0">
            {Object.entries(tracksByCategory).length === 0 ? (
              <div className="flex flex-col items-center justify-center py-32 text-center space-y-6">
                <div className="h-20 w-20 rounded-full bg-muted/20 flex items-center justify-center">
                  <Music className="h-10 w-10 text-muted-foreground/30" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold">Nenhuma música encontrada</h3>
                  <p className="text-muted-foreground max-w-sm mx-auto">Esta área ainda não possui músicas cadastradas em seu catálogo.</p>
                </div>
              </div>
            ) : (
              Object.entries(tracksByCategory).map(([category, catTracks]) => (
                <section key={category} className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="h-1 w-8 bg-primary rounded-full" />
                    <h3 className="text-2xl font-bold tracking-tight">{category}</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-8">
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
