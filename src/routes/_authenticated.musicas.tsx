import { createFileRoute, Link } from "@tanstack/react-router";
import { Music, Play, Pause, Download, Search, Headphones, Lock, Gift } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { FooterLinks } from "@/components/FooterLinks";
import { useQuery } from "@tanstack/react-query";
import { listActiveTracks, listCategories } from "@/lib/tracks.functions";
import { checkBuyerAccess } from "@/lib/access.functions";
import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { Input } from "@/components/ui/input";
import { usePlayer } from "@/hooks/use-player";
import { motion, AnimatePresence } from "framer-motion";
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

/* ── Equalizer bars for "now playing" indicator ── */
function NowPlayingBars() {
  return (
    <div className="flex items-end gap-[2px] h-3.5">
      {[0, 0.15, 0.3].map((delay, i) => (
        <motion.div
          key={i}
          className="w-[2.5px] rounded-full bg-gold/70"
          animate={{ height: ["35%", "100%", "50%", "85%", "35%"] }}
          transition={{ duration: 1.2, repeat: Infinity, delay, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

function MusicLibraryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);
  const activeTrackRef = useRef<HTMLDivElement>(null);
  const prevTrackId = useRef<string | number | null>(null);

  const { data: accessData } = useQuery({
    queryKey: ["buyer-access"],
    queryFn: () => checkBuyerAccess(),
    staleTime: 5 * 60 * 1000,
  });

  const canDownload = accessData?.canDownload !== false;
  const isBlocked = accessData?.isBlocked === true;
  const isLocked = accessData?.trialExpired === true || isBlocked;

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

  // Auto-scroll to active track when it changes
  useEffect(() => {
    if (currentTrack && currentTrack.id !== prevTrackId.current) {
      prevTrackId.current = currentTrack.id;
      // Small delay so DOM has rendered the ref
      const timer = setTimeout(() => {
        activeTrackRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        });
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [currentTrack?.id]);

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

        {/* Trial expired banner */}
        {isLocked && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 rounded-2xl border border-gold/20 bg-gold/5 p-5 text-center"
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <Lock className="h-5 w-5 text-gold/60" />
              <h3 className="font-display text-lg font-bold text-foreground/80">
                {isBlocked ? "Acesso bloqueado" : "Período de teste encerrado"}
              </h3>
            </div>
            <p className="text-[13px] text-muted-foreground/50 mb-4">
              {isBlocked
                ? "Seu acesso foi desativado. Adquira o acesso completo para ouvir os louvores."
                : "Seu acesso de teste expirou. Adquira o acesso completo para continuar ouvindo os louvores."}
            </p>
            <a
              href="https://pazemcancao-oficial.lovable.app"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-gold/15 text-gold/70 border border-gold/20 px-6 py-2.5 text-[12px] font-semibold tracking-wider uppercase hover:bg-gold/25 hover:text-gold/90 transition-all duration-500"
            >
              Adquira aqui
            </a>
          </motion.div>
        )}

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
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {catTracks.map((track: any, idx: number) => (
                        <TrackCard
                          key={track.id}
                          track={track}
                          idx={idx}
                          icon={icon}
                          catTracks={catTracks}
                          isCarousel={false}
                          activeTrackRef={activeTrackRef}
                          currentTrack={currentTrack}
                          playing={playing}
                          progress={progress}
                          handlePlayWithQueue={handlePlayWithQueue}
                          canDownload={canDownload}
                          isLocked={isLocked}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="relative -mx-4 sm:-mx-6 px-4 sm:px-6">
                      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory">
                        {catTracks.map((track: any, idx: number) => (
                          <TrackCard
                            key={track.id}
                            track={track}
                            idx={idx}
                            icon={icon}
                            catTracks={catTracks}
                            isCarousel={true}
                            activeTrackRef={activeTrackRef}
                            currentTrack={currentTrack}
                            playing={playing}
                            progress={progress}
                            handlePlayWithQueue={handlePlayWithQueue}
                            canDownload={canDownload}
                            isLocked={isLocked}
                          />
                        ))}
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

/* ── Track Card Component ── */
interface TrackCardProps {
  track: any;
  idx: number;
  icon: string;
  catTracks: any[];
  isCarousel: boolean;
  activeTrackRef: React.RefObject<HTMLDivElement | null>;
  currentTrack: Track | null;
  playing: boolean;
  progress: number;
  handlePlayWithQueue: (track: any, trackList: any[]) => void;
  canDownload: boolean;
  isLocked: boolean;
}

function TrackCard({
  track, idx, icon, catTracks, isCarousel,
  activeTrackRef, currentTrack, playing, progress, handlePlayWithQueue, canDownload, isLocked,
}: TrackCardProps) {
  const isThis = currentTrack?.id === track.id;
  const isPlaying = isThis && playing;
  const gradient = categoryGradients[track.category] || "from-sky-900/40 via-blue-950/30 to-slate-950/50";

  // Check if bonus track is still locked (release date in the future or no date set)
  const isBonusLocked = track.is_bonus && (
    !track.bonus_release_date || new Date(track.bonus_release_date + 'T00:00:00') > new Date()
  );
  const effectiveLocked = isLocked || isBonusLocked;

  const bonusReleaseFormatted = track.bonus_release_date
    ? new Date(track.bonus_release_date + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
    : null;

  const Wrapper = effectiveLocked ? 'div' : Link;
  const wrapperProps = effectiveLocked
    ? {}
    : { to: "/musicas/$trackId" as const, params: { trackId: track.id } };

  return (
    <div ref={isThis ? activeTrackRef : undefined}>
      <Wrapper
        {...(wrapperProps as any)}
        className={`group relative cursor-pointer block ${
          isCarousel ? "snap-start shrink-0 w-[260px] sm:w-[280px]" : ""
        }`}
      >
        <motion.div
          layout
          initial={isCarousel ? { opacity: 0, x: 30 } : { opacity: 0, scale: 0.95 }}
          animate={isCarousel ? { opacity: 1, x: 0 } : { opacity: 1, scale: 1 }}
          transition={{ duration: isCarousel ? 0.5 : 0.4, delay: idx * (isCarousel ? 0.06 : 0.03), ease: "easeOut" }}
          whileHover={{ scale: 1.04, y: -4 }}
          whileTap={{ scale: 0.97 }}
          className={`relative rounded-2xl border transition-all duration-500 overflow-hidden ${
            isCarousel ? "h-full flex flex-col" : ""
          } ${
            effectiveLocked
              ? "border-border/10 shadow-[0_4px_30px_-10px] shadow-black/20 opacity-70 grayscale-[30%]"
              : isPlaying
                ? "border-gold/30 shadow-[0_8px_50px_-12px] shadow-gold/20 ring-1 ring-gold/10"
                : isThis
                  ? "border-gold/15 shadow-[0_4px_30px_-10px] shadow-gold/10"
                  : "border-border/8 shadow-[0_4px_30px_-10px] shadow-black/20 hover:border-gold/15"
          } bg-card/10`}
        >
          {/* Cover area */}
          <div className={`relative ${isCarousel ? "aspect-square" : "aspect-square"} w-full bg-gradient-to-br ${gradient} overflow-hidden`}>
            {track.cover_url && (
              <img
                src={track.cover_url}
                alt={track.title}
                className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ${
                  effectiveLocked ? "brightness-50" : isPlaying ? "scale-105 brightness-90" : "group-hover:scale-110"
                }`}
                loading="lazy"
              />
            )}
            <div className={`absolute inset-0 transition-all duration-500 ${
              effectiveLocked
                ? "bg-gradient-to-t from-black/80 via-black/40 to-black/20"
                : isPlaying
                  ? "bg-gradient-to-t from-black/70 via-black/20 to-black/10"
                  : "bg-gradient-to-t from-black/60 via-transparent to-transparent"
            }`} />

            {/* Locked padlock overlay */}
            {effectiveLocked && (
              <div className="absolute inset-0 flex flex-col items-center justify-center z-10 gap-2">
                <div className={`flex ${isCarousel ? "h-16 w-16 rounded-2xl" : "h-12 w-12 rounded-xl"} items-center justify-center backdrop-blur-sm bg-black/30 border border-white/10`}>
                  {isBonusLocked ? (
                    <Gift className={`${isCarousel ? "h-7 w-7" : "h-5 w-5"} text-amber-400/70`} />
                  ) : (
                    <Lock className={`${isCarousel ? "h-7 w-7" : "h-5 w-5"} text-white/50`} />
                  )}
                </div>
                {isBonusLocked && bonusReleaseFormatted && (
                  <div className="rounded-full bg-black/50 backdrop-blur-sm border border-amber-400/20 px-3 py-1">
                    <p className="text-[9px] font-semibold text-amber-300/80 tracking-wider uppercase text-center">
                      Liberação: {bonusReleaseFormatted}
                    </p>
                  </div>
                )}
              </div>
            )}

            {!effectiveLocked && !track.cover_url && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className={`flex ${isCarousel ? "h-16 w-16 rounded-2xl" : "h-12 w-12 rounded-xl"} items-center justify-center backdrop-blur-sm transition-all duration-700 ${
                  isPlaying ? "bg-gold/15 border border-gold/25 scale-110" : "bg-white/[0.04] border border-white/[0.06] group-hover:scale-105"
                }`}>
                  {isPlaying ? (
                    <NowPlayingBars />
                  ) : (
                    <Music className={`${isCarousel ? "h-7 w-7" : "h-5 w-5"} transition-colors duration-500 ${isThis ? "text-gold/50" : "text-white/25 group-hover:text-white/40"}`} />
                  )}
                </div>
              </div>
            )}

            {/* Now Playing overlay for covers */}
            {!effectiveLocked && (
              <AnimatePresence>
                {isPlaying && track.cover_url && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute bottom-3 left-3"
                  >
                    <NowPlayingBars />
                  </motion.div>
                )}
              </AnimatePresence>
            )}

            {/* Play button overlay — hidden when locked */}
            {!effectiveLocked && (
              <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
                isPlaying ? "opacity-100" : "opacity-0 group-hover:opacity-100"
              }`}>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); handlePlayWithQueue(track, catTracks); }}
                  className={`flex ${isCarousel ? "h-14 w-14" : "h-12 w-12"} items-center justify-center rounded-full transition-all duration-300 ${
                    isPlaying
                      ? "bg-gold/90 text-background shadow-xl shadow-gold/30"
                      : "bg-gold/80 text-background shadow-xl shadow-gold/20 hover:bg-gold hover:scale-110"
                  }`}
                >
                  {isPlaying ? <Pause className={`${isCarousel ? "h-6 w-6" : "h-5 w-5"}`} /> : <Play className={`${isCarousel ? "h-6 w-6" : "h-5 w-5"} ml-0.5`} />}
                </motion.button>
              </div>
            )}

            {/* Category badge */}
            {isCarousel && (
              <span className="absolute top-3 right-3 text-[9px] font-medium tracking-[0.15em] uppercase rounded-full bg-black/30 backdrop-blur-sm border border-white/[0.08] px-2.5 py-0.5 text-white/40">
                {icon} {track.category.replace(/^[^\w\s]+\s*/, '')}
              </span>
            )}

            {/* Progress bar on card */}
            {!effectiveLocked && (
              <AnimatePresence>
                {isThis && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute bottom-0 left-0 right-0 h-1 bg-black/40"
                  >
                    <motion.div
                      className="h-full bg-gradient-to-r from-gold/60 to-gold/90"
                      style={{ width: `${progress}%` }}
                      transition={{ duration: 0.15, ease: "linear" }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </div>

          {/* Info section */}
          <div className={`${isCarousel ? "p-4" : "p-3"}`}>
            <h3 className={`font-display ${isCarousel ? "text-[14px]" : "text-[13px]"} font-bold tracking-tight leading-snug truncate transition-colors duration-500 ${
              effectiveLocked ? "text-muted-foreground/40" : isPlaying ? "text-gold" : isThis ? "text-gold/70" : "text-foreground/85 group-hover:text-foreground"
            }`}>
              {track.title}
            </h3>
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-2">
                <p className={`text-[10px] tracking-[0.1em] font-medium transition-colors duration-500 ${
                  isPlaying ? "text-gold/50" : "text-muted-foreground/25"
                }`}>
                  {track.duration}
                </p>
                {effectiveLocked && (
                  <span className={`text-[9px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded-full ${
                    isBonusLocked ? "text-amber-400/60 bg-amber-400/10" : "text-destructive/40 bg-destructive/8"
                  }`}>
                    {isBonusLocked ? "🎁 Bônus" : "Bloqueado"}
                  </span>
                )}
                )}
                {!effectiveLocked && isPlaying && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-[9px] font-semibold tracking-wider uppercase text-gold/50 bg-gold/8 px-1.5 py-0.5 rounded-full"
                  >
                    Tocando
                  </motion.span>
                )}
              </div>
              {!effectiveLocked && canDownload && (track.download_url || track.storage_path) && (
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
      </Wrapper>
    </div>
  );
}
