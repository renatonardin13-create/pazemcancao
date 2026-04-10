import { createFileRoute, Link } from "@tanstack/react-router";
import { Music, Play, Pause, Download, Search, Headphones } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { FooterLinks } from "@/components/FooterLinks";
import { useQuery } from "@tanstack/react-query";
import { listActiveTracks, listCategories } from "@/lib/tracks.functions";
import { useState, useMemo, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { usePlayer } from "@/hooks/use-player";
import { motion } from "framer-motion";
import type { Track } from "@/lib/sample-tracks";

export const Route = createFileRoute("/_authenticated/musicas")({
  component: MusicLibraryPage,
});

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1], delay },
  }),
};

const categoryGradients: Record<string, string> = {
  Paz: "from-sky-900/40 via-blue-950/30 to-slate-950/50",
  Cura: "from-amber-900/35 via-yellow-950/25 to-stone-950/50",
  Força: "from-orange-900/35 via-red-950/25 to-stone-950/50",
  Oração: "from-violet-900/35 via-purple-950/25 to-slate-950/50",
  Madrugada: "from-indigo-900/40 via-slate-950/30 to-zinc-950/50",
  Presença: "from-emerald-900/35 via-teal-950/25 to-slate-950/50",
  Refúgio: "from-stone-800/35 via-zinc-900/30 to-neutral-950/50",
};

function getStoragePublicUrl(storagePath: string): string {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  return `${supabaseUrl}/storage/v1/object/public/tracks/${storagePath}`;
}

function dbTrackToPlayerTrack(track: any): Track {
  const audioUrl = getStoragePublicUrl(track.storage_path);
  return {
    id: track.id,
    title: track.title,
    duration: track.duration,
    category: track.category,
    audioUrl,
    downloadUrl: track.download_url || audioUrl,
    description: track.description || "",
    coverUrl: track.cover_url || undefined,
  };
}

function MusicLibraryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  const { data: catData } = useQuery({
    queryKey: ["categories"],
    queryFn: () => listCategories(),
  });

  const { data, isLoading } = useQuery({
    queryKey: ["active-tracks"],
    queryFn: () => listActiveTracks(),
  });

  const { currentTrack, playing, progress, toggle, setQueue } = usePlayer();

  const handlePlayWithQueue = useCallback((track: any, trackList: any[]) => {
    const playerTracks = trackList.map(dbTrackToPlayerTrack);
    const playerTrack = dbTrackToPlayerTrack(track);
    const idx = playerTracks.findIndex(t => t.id === playerTrack.id);
    if (currentTrack?.id === track.id) {
      toggle(playerTrack);
    } else {
      setQueue(playerTracks, idx >= 0 ? idx : 0);
    }
  }, [currentTrack?.id, toggle, setQueue]);

  const dbCategories = catData?.categories || [];
  const tracks = data?.tracks || [];

  // Set "Destaques" as default category once loaded
  useEffect(() => {
    if (!initialized && dbCategories.length > 0) {
      const destaques = dbCategories.find((c: any) =>
        c.slug === "destaques" || c.slug === "top-10-mais-fortes" || c.name.toLowerCase().includes("destaque")
      );
      if (destaques) {
        setActiveCategory(destaques.name);
      }
      setInitialized(true);
    }
  }, [dbCategories, initialized]);

  const filteredTracks = useMemo(() => {
    return tracks.filter((track: any) => {
      const matchesSearch =
        !searchTerm ||
        track.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        track.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !activeCategory || track.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [tracks, searchTerm, activeCategory]);

  // Group by category
  const tracksByCategory = useMemo(() => {
    const grouped: Record<string, any[]> = {};
    filteredTracks.forEach((track: any) => {
      if (!grouped[track.category]) grouped[track.category] = [];
      grouped[track.category].push(track);
    });
    return Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b));
  }, [filteredTracks]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppHeader />

      <main className="flex-1 mx-auto w-full max-w-6xl px-4 sm:px-6 py-8 pb-28">
        {/* Header */}
        <motion.div initial="hidden" animate="visible" className="mb-10">
          <motion.div variants={fadeUp} custom={0} className="flex items-center gap-3 mb-2">
            <Headphones className="h-6 w-6 text-gold/40" />
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground/90 tracking-tight">
              Músicas
            </h1>
          </motion.div>
          <motion.p
            variants={fadeUp}
            custom={0.1}
            className="mt-2 text-[14px] text-muted-foreground/50 font-light"
          >
            Ouça e baixe os louvores exclusivos
          </motion.p>
        </motion.div>

        {/* Search & filters */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={0.2}
          className="flex flex-col sm:flex-row gap-4 mb-8"
        >
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/25" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar músicas..."
              className="pl-9 bg-card/10 border-border/15 text-sm h-10"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setActiveCategory(null)}
              className={`px-3 py-1.5 rounded-full text-[11px] font-medium transition-all duration-300 border ${
                !activeCategory
                  ? "border-gold/30 bg-gold/10 text-gold/80"
                  : "border-border/15 bg-card/5 text-muted-foreground/40 hover:text-muted-foreground/60"
              }`}
            >
              Todas
            </button>
            {dbCategories.map((cat: any) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.name)}
                className={`px-3 py-1.5 rounded-full text-[11px] font-medium transition-all duration-300 border ${
                  activeCategory === cat.name
                    ? "border-gold/30 bg-gold/10 text-gold/80"
                    : "border-border/15 bg-card/5 text-muted-foreground/40 hover:text-muted-foreground/60"
                }`}
              >
                {cat.icon || "🎵"} {cat.name.replace(/^[^\w\s]+\s*/, '')}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Content */}
        {isLoading ? (
          <div className="text-center py-24">
            <div className="w-px h-12 mx-auto bg-gradient-to-b from-transparent via-gold/15 to-transparent animate-breathe mb-6" />
            <p className="text-[11px] uppercase tracking-[0.4em] text-gold/25">
              Carregando músicas...
            </p>
          </div>
        ) : filteredTracks.length === 0 ? (
          <div className="text-center py-24">
            <Music className="h-10 w-10 text-muted-foreground/15 mx-auto mb-5" />
            <p className="text-sm text-muted-foreground/40">
              Nenhuma música encontrada.
            </p>
          </div>
        ) : (
          <div className="space-y-10">
            {tracksByCategory.map(([category, catTracks], catIdx) => {
              const dbCat = dbCategories.find((c: any) => c.name === category);
              const icon = dbCat?.icon || "🎵";
              const displayName = category.replace(/^[^\w\s]+\s*/, '');

              return (
                <motion.section
                  key={category}
                  initial="hidden"
                  animate="visible"
                  variants={fadeUp}
                  custom={0.3 + catIdx * 0.1}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-lg">{icon}</span>
                    <h2 className="font-display text-lg font-bold text-foreground/80 tracking-tight">
                      {displayName}
                    </h2>
                    <div className="flex-1 h-px bg-gradient-to-r from-border/15 to-transparent" />
                    <span className="text-[10px] text-muted-foreground/25">
                      {catTracks.length} música{catTracks.length !== 1 ? "s" : ""}
                    </span>
                    {catTracks.length > 4 && (
                      <button
                        onClick={() => setExpandedCategory(expandedCategory === category ? null : category)}
                        className="text-[11px] font-medium text-gold/50 hover:text-gold/80 transition-colors duration-300 whitespace-nowrap"
                      >
                        {expandedCategory === category ? "← Voltar" : "Ver todas →"}
                      </button>
                    )}
                  </div>

                  {expandedCategory === category ? (
                    /* Grid view - all tracks */
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {catTracks.map((track: any, idx: number) => {
                        const playerTrack = dbTrackToPlayerTrack(track);
                        const isThis = currentTrack?.id === track.id;
                        const isPlaying = isThis && playing;
                        const gradient = categoryGradients[track.category] || "from-sky-900/40 via-blue-950/30 to-slate-950/50";

                        return (
                          <Link
                            key={track.id}
                            to="/musicas/$trackId"
                            params={{ trackId: track.id }}
                            className="group relative cursor-pointer block"
                          >
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ duration: 0.4, delay: idx * 0.03 }}
                              whileHover={{ scale: 1.05, y: -4 }}
                              className={`relative rounded-2xl border transition-all duration-700 overflow-hidden ${
                                isPlaying
                                  ? "border-gold/25 shadow-[0_8px_50px_-12px] shadow-gold/15"
                                  : "border-border/8 shadow-[0_4px_30px_-10px] shadow-black/20 hover:border-gold/15"
                              } bg-card/10`}
                            >
                              <div className={`relative aspect-square w-full bg-gradient-to-br ${gradient} overflow-hidden`}>
                                {track.cover_url && (
                                  <img src={track.cover_url} alt={track.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                                {!track.cover_url && (
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/[0.04] border border-white/[0.06]">
                                      <Music className="h-5 w-5 text-white/25" />
                                    </div>
                                  </div>
                                )}
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                  <button
                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle(playerTrack); }}
                                    className="flex h-12 w-12 items-center justify-center rounded-full bg-gold/80 text-background shadow-xl shadow-gold/20 hover:bg-gold transition-all duration-300"
                                  >
                                    {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
                                  </button>
                                </div>
                                {isPlaying && (
                                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/30">
                                    <div className="h-full bg-gradient-to-r from-gold/60 to-gold/90 transition-all duration-200" style={{ width: `${progress}%` }} />
                                  </div>
                                )}
                              </div>
                              <div className="p-3">
                                <h3 className={`font-display text-[13px] font-bold tracking-tight leading-snug truncate ${isPlaying ? "text-gold/85" : "text-foreground/85"}`}>
                                  {track.title}
                                </h3>
                                <p className="text-[10px] text-muted-foreground/25 mt-1">{track.duration}</p>
                              </div>
                            </motion.div>
                          </Link>
                        );
                      })}
                    </div>
                  ) : (
                    /* Horizontal carousel */
                    <div className="relative -mx-4 sm:-mx-6 px-4 sm:px-6">
                      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory">
                        {catTracks.map((track: any, idx: number) => {
                          const playerTrack = dbTrackToPlayerTrack(track);
                          const isThis = currentTrack?.id === track.id;
                          const isPlaying = isThis && playing;
                          const gradient = categoryGradients[track.category] || "from-sky-900/40 via-blue-950/30 to-slate-950/50";

                          return (
                            <Link
                              key={track.id}
                              to="/musicas/$trackId"
                              params={{ trackId: track.id }}
                              className="group relative cursor-pointer snap-start shrink-0 w-[260px] sm:w-[280px] block"
                            >
                              <motion.div
                                initial={{ opacity: 0, x: 30 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5, delay: idx * 0.06, ease: "easeOut" }}
                                whileHover={{ scale: 1.05, y: -6 }}
                                whileTap={{ scale: 0.97 }}
                                className={`relative rounded-2xl border transition-all duration-700 overflow-hidden h-full flex flex-col ${
                                  isPlaying
                                    ? "border-gold/25 shadow-[0_8px_50px_-12px] shadow-gold/15"
                                    : "border-border/8 shadow-[0_4px_30px_-10px] shadow-black/20 hover:border-gold/15 hover:shadow-[0_8px_40px_-10px] hover:shadow-gold/8"
                                } bg-card/10`}
                              >
                                <div className={`relative aspect-square w-full bg-gradient-to-br ${gradient} overflow-hidden`}>
                                  {track.cover_url && (
                                    <img src={track.cover_url} alt={track.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
                                  )}
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                                  {!track.cover_url && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                      <div className={`flex h-16 w-16 items-center justify-center rounded-2xl backdrop-blur-sm transition-all duration-700 ${
                                        isPlaying ? "bg-gold/15 border border-gold/25 scale-110" : "bg-white/[0.04] border border-white/[0.06] group-hover:scale-105"
                                      }`}>
                                        <Music className={`h-7 w-7 transition-colors duration-500 ${isPlaying ? "text-gold/70" : "text-white/25 group-hover:text-white/40"}`} />
                                      </div>
                                    </div>
                                  )}
                                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <button
                                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle(playerTrack); }}
                                      className="flex h-14 w-14 items-center justify-center rounded-full bg-gold/80 text-background shadow-xl shadow-gold/20 hover:bg-gold transition-all duration-300 hover:scale-110"
                                    >
                                      {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-0.5" />}
                                    </button>
                                  </div>
                                  <span className="absolute top-3 right-3 text-[9px] font-medium tracking-[0.15em] uppercase rounded-full bg-black/30 backdrop-blur-sm border border-white/[0.08] px-2.5 py-0.5 text-white/40">
                                    {icon} {track.category.replace(/^[^\w\s]+\s*/, '')}
                                  </span>
                                  {isPlaying && (
                                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/30">
                                      <div className="h-full bg-gradient-to-r from-gold/60 to-gold/90 transition-all duration-200 ease-linear" style={{ width: `${progress}%` }} />
                                    </div>
                                  )}
                                </div>
                                <div className="p-4">
                                  <h3 className={`font-display text-[14px] font-bold tracking-tight leading-snug truncate transition-colors duration-500 ${
                                    isPlaying ? "text-gold/85" : "text-foreground/85 group-hover:text-foreground"
                                  }`}>
                                    {track.title}
                                  </h3>
                                  <div className="flex items-center justify-between mt-2">
                                    <p className={`text-[10px] tracking-[0.1em] font-medium transition-colors duration-500 ${
                                      isPlaying ? "text-gold/40" : "text-muted-foreground/25"
                                    }`}>
                                      {track.duration}
                                    </p>
                                    {(track.download_url || track.storage_path) && (
                                      <button
                                        onClick={(e) => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          const link = document.createElement("a");
                                          link.href = track.download_url || getStoragePublicUrl(track.storage_path);
                                          link.download = `${track.title}.mp3`;
                                          link.click();
                                        }}
                                        className="text-muted-foreground/20 hover:text-gold/50 transition-colors duration-300"
                                        title="Baixar"
                                      >
                                        <Download className="h-3.5 w-3.5" />
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </motion.div>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </motion.section>
              );
            })}
          </div>
        )}
      </main>

      <FooterLinks />
    </div>
  );
}
