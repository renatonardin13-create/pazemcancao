import { createFileRoute, Link } from "@tanstack/react-router";
import { Music, Play, Pause, Download, Search, Headphones } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { FooterLinks } from "@/components/FooterLinks";
import { useQuery } from "@tanstack/react-query";
import { listActiveTracks } from "@/lib/tracks.functions";
import { useState, useMemo } from "react";
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

const categoryEmojis: Record<string, string> = {
  Paz: "🕊️",
  Cura: "💛",
  Força: "🔥",
  Oração: "🙏",
  Madrugada: "🌙",
  Presença: "✨",
  Refúgio: "🏔️",
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

  const { data, isLoading } = useQuery({
    queryKey: ["active-tracks"],
    queryFn: () => listActiveTracks(),
  });

  const { currentTrack, playing, progress, toggle } = usePlayer();

  const tracks = data?.tracks || [];

  const categories = useMemo(() => {
    const cats = [...new Set(tracks.map((t: any) => t.category))];
    return cats.sort();
  }, [tracks]);

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
            {categories.map((cat: string) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-[11px] font-medium transition-all duration-300 border ${
                  activeCategory === cat
                    ? "border-gold/30 bg-gold/10 text-gold/80"
                    : "border-border/15 bg-card/5 text-muted-foreground/40 hover:text-muted-foreground/60"
                }`}
              >
                {categoryEmojis[cat] || "🎵"} {cat}
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
          <div className="space-y-12">
            {tracksByCategory.map(([category, catTracks], catIdx) => (
              <motion.section
                key={category}
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                custom={0.3 + catIdx * 0.1}
              >
                <div className="flex items-center gap-3 mb-5">
                  <span className="text-lg">{categoryEmojis[category] || "🎵"}</span>
                  <h2 className="font-display text-lg font-bold text-foreground/80 tracking-tight">
                    {category}
                  </h2>
                  <div className="flex-1 h-px bg-gradient-to-r from-border/15 to-transparent" />
                  <span className="text-[10px] text-muted-foreground/25">
                    {catTracks.length} música{catTracks.length !== 1 ? "s" : ""}
                  </span>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {catTracks.map((track: any, idx: number) => {
                    const playerTrack = dbTrackToPlayerTrack(track);
                    const isThis = currentTrack?.id === track.id;
                    const isPlaying = isThis && playing;
                    const gradient = categoryGradients[track.category] || categoryGradients["Paz"];

                    return (
                      <Link
                        key={track.id}
                        to="/musicas/$trackId"
                        params={{ trackId: track.id }}
                        className="group relative cursor-pointer h-full block"
                      >
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: idx * 0.06, ease: "easeOut" }}
                          whileHover={{ scale: 1.03, y: -4 }}
                          whileTap={{ scale: 0.98 }}
                          className={`relative rounded-3xl border transition-all duration-700 overflow-hidden h-full flex flex-col ${
                            isPlaying
                              ? "border-gold/25 shadow-[0_8px_50px_-12px] shadow-gold/15"
                              : "border-border/8 shadow-[0_4px_30px_-10px] shadow-black/20 hover:border-gold/15 hover:shadow-[0_8px_40px_-10px] hover:shadow-gold/8"
                          } bg-card/10`}
                        >
                          {/* Cover */}
                          <div className={`relative h-40 sm:h-44 w-full bg-gradient-to-br ${gradient} overflow-hidden`}>
                            {track.cover_url && (
                              <img
                                src={track.cover_url}
                                alt={track.title}
                                className="absolute inset-0 w-full h-full object-cover"
                                loading="lazy"
                              />
                            )}
                            <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_40%,transparent_30%,rgba(0,0,0,0.4))]" />

                            {!track.cover_url && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className={`flex h-16 w-16 items-center justify-center rounded-2xl backdrop-blur-sm transition-all duration-700 ${
                                  isPlaying
                                    ? "bg-gold/15 border border-gold/25 scale-110"
                                    : "bg-white/[0.04] border border-white/[0.06] group-hover:scale-105"
                                }`}>
                                  <Music className={`h-7 w-7 transition-colors duration-500 ${
                                    isPlaying ? "text-gold/70" : "text-white/25 group-hover:text-white/40"
                                  }`} />
                                </div>
                              </div>
                            )}

                            <span className="absolute top-4 right-4 text-[9px] font-medium tracking-[0.2em] uppercase rounded-full bg-black/20 backdrop-blur-sm border border-white/[0.06] px-3 py-1 text-white/30">
                              {categoryEmojis[track.category] || ""} {track.category}
                            </span>

                            {isPlaying && (
                              <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-gold/10 to-transparent" />
                            )}
                          </div>

                          {/* Content */}
                          <div className="relative p-5 sm:p-6 flex flex-col flex-1">
                            <h3 className={`font-display text-[16px] sm:text-[17px] font-bold tracking-tight leading-snug transition-colors duration-500 ${
                              isPlaying ? "text-gold/85" : "text-foreground/85 group-hover:text-foreground"
                            }`}>
                              {track.title}
                            </h3>

                            {track.description && (
                              <p className={`mt-2.5 text-[12px] leading-[1.9] line-clamp-2 transition-colors duration-500 flex-1 ${
                                isPlaying ? "text-muted-foreground/50" : "text-muted-foreground/35"
                              }`}>
                                {track.description}
                              </p>
                            )}

                            <p className={`mt-3 text-[10px] tracking-[0.15em] font-medium transition-colors duration-500 ${
                              isPlaying ? "text-gold/40" : "text-muted-foreground/20"
                            }`}>
                              {track.duration}
                            </p>

                            {isPlaying && (
                              <div className="mt-3 h-[2px] rounded-full bg-muted/8 overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-gradient-to-r from-gold/30 via-gold/55 to-gold/35 transition-all duration-200 ease-linear"
                                  style={{ width: `${progress}%` }}
                                />
                              </div>
                            )}

                            {/* Actions */}
                            <div className={`mt-4 pt-3.5 border-t border-border/6 flex items-center gap-3 transition-all duration-500 ${
                              isPlaying ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                            }`}>
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  toggle(playerTrack);
                                }}
                                className={`inline-flex items-center gap-2 text-[10px] font-semibold tracking-[0.2em] uppercase transition-colors duration-500 ${
                                  isPlaying ? "text-gold/55" : "text-muted-foreground/30"
                                }`}
                              >
                                {isPlaying ? (
                                  <><Pause className="h-3 w-3" /> Pausar</>
                                ) : (
                                  <><Play className="h-3 w-3 ml-0.5" /> Ouvir</>
                                )}
                              </button>

                              {(track.download_url || track.storage_path) && (
                                <>
                                  <span className="w-px h-3 bg-border/8" />
                                  <button
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      const link = document.createElement("a");
                                      link.href = track.download_url || getStoragePublicUrl(track.storage_path);
                                      link.download = `${track.title}.mp3`;
                                      link.click();
                                    }}
                                    className="inline-flex items-center gap-2 text-[10px] font-semibold tracking-[0.2em] uppercase text-muted-foreground/20 hover:text-gold/45 transition-colors duration-500"
                                  >
                                    <Download className="h-3 w-3" /> Baixar
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      </Link>
                    );
                  })}
                </div>
              </motion.section>
            ))}
          </div>
        )}
      </main>

      <FooterLinks />
    </div>
  );
}
