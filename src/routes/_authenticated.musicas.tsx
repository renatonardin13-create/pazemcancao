import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { ListSkeleton } from "@/components/LoadingSkeletons";
import { logDownload } from "@/lib/analytics.functions";
import { ModuleGuard } from "@/components/ModuleGuard";
import { Music, Play, Pause, Download, Search, Headphones, Lock, Gift, ChevronLeft, ChevronRight, Clock, ListMusic, PlayCircle, Disc3 } from "lucide-react";
import { StudentLayout } from "@/components/StudentLayout";
import { FooterLinks } from "@/components/FooterLinks";
import { useQuery } from "@tanstack/react-query";
import { listAllTracks, listCategories } from "@/lib/tracks.functions";
import { listPlaylistsWithCounts, getPlaylistWithTracks } from "@/lib/playlists.functions";
import { checkBuyerAccess } from "@/lib/access.functions";
import { getNewTracks, getMostPlayedTracks, getContinueListening, getRecommendedTracks } from "@/lib/auto-playlists.functions";
import { Flame, Sparkles, History, TrendingUp } from "lucide-react";
import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { Input } from "@/components/ui/input";
import { usePlayer } from "@/hooks/use-player";
import { motion, AnimatePresence } from "framer-motion";
import { InvisibleFunnelShelves } from "@/components/InvisibleFunnelShelves";
import { StrategicMusicShelves } from "@/components/StrategicMusicShelves";
import type { Track } from "@/lib/sample-tracks";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/musicas")({
  validateSearch: (search: Record<string, unknown>): { categoria?: string } => ({
    categoria: typeof search.categoria === 'string' ? search.categoria : undefined,
  }),
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
  const searchParams = Route.useSearch();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [activePlaylistId, setActivePlaylistId] = useState<string | null>(null);
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
    staleTime: 60_000,
  });

  const { data, isLoading } = useQuery({
    queryKey: ["all-tracks"],
    queryFn: () => listAllTracks(),
    staleTime: 30_000,
  });

  const { data: playlistsData } = useQuery({
    queryKey: ["playlists-with-counts"],
    queryFn: () => listPlaylistsWithCounts(),
    staleTime: 60_000,
  });

  const { data: activePlaylistData } = useQuery({
    queryKey: ["playlist-tracks", activePlaylistId],
    queryFn: () => getPlaylistWithTracks({ data: { playlistId: activePlaylistId! } }),
    enabled: !!activePlaylistId,
    staleTime: 30_000,
  });

  const playlists = playlistsData?.playlists || [];
  const activePlaylistTracks = activePlaylistData?.tracks || [];

  // Auto-playlists
  const { data: newTracksData } = useQuery({
    queryKey: ["auto-new-tracks"],
    queryFn: () => getNewTracks(),
    staleTime: 5 * 60_000,
  });

  const { data: mostPlayedData } = useQuery({
    queryKey: ["auto-most-played"],
    queryFn: () => getMostPlayedTracks(),
    staleTime: 5 * 60_000,
  });

  const { data: continueData } = useQuery({
    queryKey: ["auto-continue-listening"],
    queryFn: () => getContinueListening(),
    staleTime: 2 * 60_000,
  });

  const { data: recommendedData } = useQuery({
    queryKey: ["auto-recommended"],
    queryFn: () => getRecommendedTracks(),
    staleTime: 5 * 60_000,
  });

  const { currentTrack, playing, progress, toggle, setQueue, queue } = usePlayer();

  const handlePlayWithQueue = useCallback((track: any, trackList: any[]) => {
    const playerTracks = trackList.map(dbTrackToPlayerTrack);
    const playerTrack = dbTrackToPlayerTrack(track);
    const idx = playerTracks.findIndex(t => t.id === playerTrack.id);

    if (currentTrack?.id === track.id) {
      // Same track playing — check if queue changed
      const queueChanged = queue.length !== playerTracks.length ||
        queue.some((q, i) => q.id !== playerTracks[i]?.id);

      if (queueChanged && idx >= 0) {
        // Update queue silently without restarting, then toggle
        // We need setQueue which restarts — so just toggle if playing
        if (playing) {
          toggle(playerTrack);
        } else {
          // Paused on same track but new queue context — set new queue
          setQueue(playerTracks, idx);
        }
      } else {
        toggle(playerTrack);
      }
    } else if (idx >= 0) {
      // Different track — set full queue so auto-next works
      setQueue(playerTracks, idx);
    } else {
      toggle(playerTrack);
    }
  }, [currentTrack?.id, playing, queue, toggle, setQueue]);
  

  const dbCategories = catData?.categories || [];
  const tracks = data?.tracks || [];

  // Sync category from URL search params (sidebar navigation)
  useEffect(() => {
    if (searchParams.categoria && dbCategories.length > 0) {
      const found = dbCategories.find((c: any) => c.slug === searchParams.categoria || c.name.toLowerCase() === searchParams.categoria);
      if (found) {
        setActiveCategory(found.name);
        setInitialized(true);
        return;
      }
    }
    if (!initialized && dbCategories.length > 0) {
      const destaques = dbCategories.find((c: any) =>
        c.slug === "destaques" || c.slug === "top-10-mais-fortes" || c.name.toLowerCase().includes("destaque")
      );
      if (destaques) {
        setActiveCategory(destaques.name);
      }
      setInitialized(true);
    }
  }, [dbCategories, initialized, searchParams.categoria]);

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

  const bonusTracks = useMemo(() => {
    return filteredTracks.filter((t: any) => t.is_bonus);
  }, [filteredTracks]);

  const regularTracks = useMemo(() => {
    return filteredTracks.filter((t: any) => !t.is_bonus);
  }, [filteredTracks]);

  const tracksByCategory = useMemo(() => {
    const grouped: Record<string, any[]> = {};
    regularTracks.forEach((track: any) => {
      if (!grouped[track.category]) grouped[track.category] = [];
      grouped[track.category].push(track);
    });
    return Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b));
  }, [regularTracks]);

  return (
    <ModuleGuard moduleKey="louvores">
    <StudentLayout>
    <div className="min-h-screen bg-background flex flex-col">

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-10 xl:px-12 py-6 sm:py-10 pb-28">
        {/* Header */}
        <motion.div initial="hidden" animate="visible" className="mb-10">
          <motion.div variants={fadeUp} custom={0} className="flex items-center gap-3 mb-2">
            <Headphones className="h-5 w-5 text-gold/35" />
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground/85 tracking-tight">
              Músicas
            </h1>
          </motion.div>
          <motion.p
            variants={fadeUp}
            custom={0.1}
            className="mt-2 text-[13px] text-muted-foreground/40 font-light"
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
          className="mb-8"
        >
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/60" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar músicas..."
              className="pl-9 bg-card/20 border-border/30 text-sm h-10"
            />
          </div>
        </motion.div>

        {/* ── Auto Playlists ── */}
        <AutoPlaylistShelf
          title="Continue Ouvindo"
          icon={<History className="h-4 w-4 text-gold/40" />}
          tracks={continueData?.tracks || []}
          delay={0.25}
          activeTrackRef={activeTrackRef}
          currentTrack={currentTrack}
          playing={playing}
          progress={progress}
          handlePlayWithQueue={handlePlayWithQueue}
          canDownload={canDownload}
          isLocked={isLocked}
          setQueue={setQueue}
        />

        <AutoPlaylistShelf
          title="Recomendado para Você"
          icon={<Sparkles className="h-4 w-4 text-gold/40" />}
          tracks={recommendedData?.tracks || []}
          delay={0.3}
          activeTrackRef={activeTrackRef}
          currentTrack={currentTrack}
          playing={playing}
          progress={progress}
          handlePlayWithQueue={handlePlayWithQueue}
          canDownload={canDownload}
          isLocked={isLocked}
          setQueue={setQueue}
        />

        <AutoPlaylistShelf
          title="Mais Acessadas"
          icon={<TrendingUp className="h-4 w-4 text-gold/40" />}
          tracks={mostPlayedData?.tracks || []}
          delay={0.35}
          activeTrackRef={activeTrackRef}
          currentTrack={currentTrack}
          playing={playing}
          progress={progress}
          handlePlayWithQueue={handlePlayWithQueue}
          canDownload={canDownload}
          isLocked={isLocked}
          setQueue={setQueue}
        />

        <AutoPlaylistShelf
          title="Novidades"
          icon={<Flame className="h-4 w-4 text-amber-400/50" />}
          tracks={newTracksData?.tracks || []}
          delay={0.4}
          activeTrackRef={activeTrackRef}
          currentTrack={currentTrack}
          playing={playing}
          progress={progress}
          handlePlayWithQueue={handlePlayWithQueue}
          canDownload={canDownload}
          isLocked={isLocked}
          setQueue={setQueue}
        />

        {/* Playlists Section */}
        {playlists.length > 0 && (
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0.25} className="mb-10">
            <div className="flex items-center gap-3 mb-5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gold/10 border border-gold/15">
                <Disc3 className="h-4 w-4 text-gold/60" />
              </div>
              <div>
                <h2 className="font-display text-lg sm:text-xl font-bold text-foreground/85 tracking-tight">Playlists</h2>
                <p className="text-[11px] text-muted-foreground/40 mt-0.5">Coleções especiais para cada momento</p>
              </div>
              <div className="flex-1 h-px bg-gradient-to-r from-gold/10 to-transparent" />
              <span className="text-[10px] text-muted-foreground/35 uppercase tracking-wider font-medium">
                {playlists.length} playlist{playlists.length !== 1 ? "s" : ""}
              </span>
            </div>

            <ScrollableCarousel>
              {playlists.map((pl: any) => {
                const isActive = activePlaylistId === pl.id;
                return (
                  <button
                    key={pl.id}
                    onClick={() => setActivePlaylistId(isActive ? null : pl.id)}
                    className={`group/plcard snap-start shrink-0 w-[200px] sm:w-[230px] md:w-[250px] rounded-2xl border overflow-hidden transition-all duration-500 text-left ${
                      isActive
                        ? "border-gold/30 shadow-[0_8px_40px_-10px] shadow-gold/15 ring-1 ring-gold/10 scale-[1.02]"
                        : "border-border/15 hover:border-gold/15 shadow-[0_4px_24px_-8px] shadow-black/25 hover:shadow-[0_8px_32px_-8px] hover:shadow-black/30"
                    }`}
                  >
                    {/* Cover area */}
                    <div className="relative h-[130px] sm:h-[150px] md:h-[160px] bg-gradient-to-br from-violet-900/25 via-indigo-950/15 to-slate-950/40 overflow-hidden">
                      {pl.cover_url ? (
                        <img
                          src={pl.cover_url}
                          alt={pl.name}
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover/plcard:scale-[1.06]"
                          loading="lazy"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gold/5 via-transparent to-violet-500/5">
                          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-sm">
                            <Disc3 className={`h-7 w-7 transition-all duration-500 ${isActive ? "text-gold/70 animate-spin" : "text-white/20"}`} style={isActive ? { animationDuration: '3s' } : {}} />
                          </div>
                        </div>
                      )}
                      {/* Gradient overlays */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                      <div className="absolute inset-0 shadow-[inset_0_0_30px_rgba(0,0,0,0.2)] pointer-events-none" />

                      {/* Play overlay */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/plcard:opacity-100 transition-opacity duration-400 z-10">
                        <div className={`flex h-11 w-11 items-center justify-center rounded-full shadow-lg transition-all duration-500 ${
                          isActive ? "bg-gold/90 scale-100" : "bg-gold/80 scale-90 group-hover/plcard:scale-100"
                        }`}>
                          <Play className="h-5 w-5 text-gold-foreground fill-gold-foreground ml-0.5" />
                        </div>
                      </div>

                      {/* Track count badge */}
                      <div className="absolute bottom-2.5 right-2.5 z-10">
                        <span className="flex items-center gap-1 text-[10px] font-semibold tracking-wide rounded-full bg-black/50 backdrop-blur-md border border-white/10 px-2.5 py-1 text-white/60">
                          <Music className="h-2.5 w-2.5" />
                          {pl.track_count}
                        </span>
                      </div>

                      {/* Active indicator */}
                      {isActive && (
                        <div className="absolute top-2.5 left-2.5 z-10">
                          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-gold/90 text-[9px] font-bold text-gold-foreground uppercase tracking-wide shadow-lg">
                            <NowPlayingBars />
                            Aberta
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="p-3.5 bg-gradient-to-b from-card/20 to-card/5">
                      <h3 className={`font-display text-[13px] sm:text-sm font-bold tracking-tight leading-snug line-clamp-1 transition-colors duration-500 ${
                        isActive ? "text-gold" : "text-foreground/85 group-hover/plcard:text-foreground"
                      }`}>{pl.name}</h3>
                      {pl.description ? (
                        <p className="text-[11px] text-muted-foreground/45 mt-1 line-clamp-2 leading-relaxed">{pl.description}</p>
                      ) : (
                        <p className="text-[11px] text-muted-foreground/30 mt-1">
                          {pl.track_count} música{pl.track_count !== 1 ? "s" : ""}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </ScrollableCarousel>

            {/* Expanded playlist tracks */}
            <AnimatePresence>
              {activePlaylistId && activePlaylistTracks.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="mt-6 overflow-hidden"
                >
                  <div className="rounded-2xl border border-gold/10 bg-gradient-to-b from-card/15 to-card/5 p-4 sm:p-6">
                    {/* Playlist header */}
                    <div className="flex items-center gap-3 mb-5 flex-wrap">
                      {activePlaylistData?.playlist?.cover_url && (
                        <img
                          src={activePlaylistData.playlist.cover_url}
                          alt=""
                          className="h-12 w-12 rounded-xl object-cover shadow-lg ring-1 ring-white/10"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-display text-base sm:text-lg font-bold text-foreground/85 truncate">
                          {activePlaylistData?.playlist?.name}
                        </h3>
                        <p className="text-[11px] text-muted-foreground/40 mt-0.5">
                          {activePlaylistTracks.length} música{activePlaylistTracks.length !== 1 ? "s" : ""} · Reprodução contínua
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setActivePlaylistId(null)}
                          className="text-[11px] font-medium text-muted-foreground/50 hover:text-foreground/70 transition-colors rounded-full border border-border/20 hover:border-border/40 px-3 py-1.5"
                        >
                          Fechar
                        </button>
                        {!isLocked && activePlaylistTracks.length > 0 && (
                          <button
                            onClick={() => {
                              const playable = activePlaylistTracks.filter((t: any) => t.is_active);
                              if (playable.length > 0) {
                                setQueue(playable.map(dbTrackToPlayerTrack), 0);
                                toast.success(`▶ Tocando playlist "${activePlaylistData?.playlist?.name}"`);
                              }
                            }}
                            className="flex items-center gap-1.5 text-[11px] font-semibold text-gold-foreground bg-gold/90 hover:bg-gold transition-all duration-300 rounded-full px-4 py-2 shadow-lg shadow-gold/20"
                          >
                            <Play className="h-3 w-3 fill-current" />
                            <span>Tocar todas</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Track list */}
                    <ScrollableCarousel>
                      {activePlaylistTracks.map((track: any, idx: number) => (
                        <TrackCard
                          key={track.id}
                          track={track}
                          idx={idx}
                          icon="🎵"
                          catTracks={activePlaylistTracks}
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
                    </ScrollableCarousel>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Content */}
        {isLoading ? (
          <ListSkeleton rows={6} />
        ) : filteredTracks.length === 0 ? (
          <div className="text-center py-24">
            <Music className="h-10 w-10 text-muted-foreground/50 mx-auto mb-5" />
            <p className="text-sm text-muted-foreground/70">
              Nenhuma música encontrada.
            </p>
          </div>
        ) : (
          <div className="space-y-10">
            {/* Bonus Section */}
            {bonusTracks.length > 0 && (
              <motion.section
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                custom={0.3}
              >
                <div className="rounded-2xl border border-amber-500/15 bg-gradient-to-br from-amber-900/10 via-amber-950/5 to-transparent p-5 sm:p-6">
                  <div className="flex items-center gap-3 mb-5 flex-wrap">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/15 border border-amber-500/20">
                      <Gift className="h-4.5 w-4.5 text-amber-400/70" />
                    </div>
                    <div>
                      <h2 className="font-display text-lg font-bold text-foreground/85 tracking-tight">
                        Bônus Exclusivos
                      </h2>
                      <p className="text-xs text-amber-400/40 mt-0.5">
                        {bonusTracks.length} música{bonusTracks.length !== 1 ? "s" : ""} especiai{bonusTracks.length !== 1 ? "s" : "l"}
                      </p>
                    </div>
                    <div className="flex-1 h-px bg-gradient-to-r from-amber-500/15 to-transparent" />
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setExpandedCategory(expandedCategory === '__bonus__' ? null : '__bonus__')}
                        className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground/60 hover:text-gold/70 transition-colors duration-300 rounded-full border border-border/20 hover:border-gold/20 px-3 py-1.5 bg-card/10 hover:bg-gold/5"
                      >
                        <ListMusic className="h-3 w-3" />
                        <span className="hidden sm:inline">{expandedCategory === '__bonus__' ? 'Carrossel' : 'Ver todas'}</span>
                        <span className="sm:hidden">{expandedCategory === '__bonus__' ? '←' : 'Todas'}</span>
                      </button>
                      {!isLocked && bonusTracks.filter((t: any) => !t.is_bonus || !(
                        !t.bonus_release_date || new Date(t.bonus_release_date + 'T00:00:00') > new Date()
                      )).length > 0 && (
                        <button
                          onClick={() => {
                            const playable = bonusTracks.filter((t: any) => {
                              const notReleased = t.is_bonus && (!t.bonus_release_date || new Date(t.bonus_release_date + 'T00:00:00') > new Date());
                              return !notReleased && t.is_active;
                            });
                            if (playable.length > 0) {
                              setQueue(playable.map(dbTrackToPlayerTrack), 0);
                              toast.success(`▶ Tocando ${playable.length} músicas bônus`);
                            }
                          }}
                          className="flex items-center gap-1.5 text-[11px] font-semibold text-gold/60 hover:text-gold/90 transition-colors duration-300 rounded-full border border-gold/15 hover:border-gold/30 px-3 py-1.5 bg-gold/5 hover:bg-gold/10"
                        >
                          <PlayCircle className="h-3 w-3" />
                          <span className="hidden sm:inline">Tocar playlist</span>
                          <span className="sm:hidden">▶ Play</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {expandedCategory === '__bonus__' ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5 lg:gap-6">
                      {bonusTracks.map((track: any, idx: number) => (
                        <TrackCard
                          key={track.id}
                          track={track}
                          idx={idx}
                          icon="🎁"
                          catTracks={bonusTracks}
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
                    <ScrollableCarousel>
                      {bonusTracks.map((track: any, idx: number) => (
                        <TrackCard
                          key={track.id}
                          track={track}
                          idx={idx}
                          icon="🎁"
                          catTracks={bonusTracks}
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
                    </ScrollableCarousel>
                  )}
                </div>
              </motion.section>
            )}

            {/* Regular categories */}
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
                  <div className="flex items-center gap-3 mb-4 flex-wrap">
                    <span className="text-lg">{icon}</span>
                    <h2 className="font-display text-lg font-bold text-foreground/80 tracking-tight">
                      {displayName}
                    </h2>
                    <div className="flex-1 h-px bg-gradient-to-r from-border/15 to-transparent" />
                    <span className="text-xs text-muted-foreground/60 hidden sm:inline">
                      {catTracks.length} música{catTracks.length !== 1 ? "s" : ""}
                    </span>
                    <div className="flex items-center gap-2">
                      {catTracks.length > 1 && (
                        <button
                          onClick={() => setExpandedCategory(expandedCategory === category ? null : category)}
                          className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground/60 hover:text-gold/70 transition-colors duration-300 rounded-full border border-border/20 hover:border-gold/20 px-3 py-1.5 bg-card/10 hover:bg-gold/5"
                        >
                          <ListMusic className="h-3 w-3" />
                          <span className="hidden sm:inline">{expandedCategory === category ? 'Carrossel' : 'Ver todas'}</span>
                          <span className="sm:hidden">{expandedCategory === category ? '←' : 'Todas'}</span>
                        </button>
                      )}
                      {!isLocked && catTracks.filter((t: any) => t.is_active).length > 0 && (
                        <button
                          onClick={() => {
                            const playable = catTracks.filter((t: any) => t.is_active);
                            if (playable.length > 0) {
                              setQueue(playable.map(dbTrackToPlayerTrack), 0);
                              toast.success(`▶ Tocando ${playable.length} músicas de ${displayName}`);
                            }
                          }}
                          className="flex items-center gap-1.5 text-[11px] font-semibold text-gold/60 hover:text-gold/90 transition-colors duration-300 rounded-full border border-gold/15 hover:border-gold/30 px-3 py-1.5 bg-gold/5 hover:bg-gold/10"
                        >
                          <PlayCircle className="h-3 w-3" />
                          <span className="hidden sm:inline">Tocar playlist</span>
                          <span className="sm:hidden">▶ Play</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {expandedCategory === category ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5 lg:gap-6">
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
                    <ScrollableCarousel>
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
                    </ScrollableCarousel>
                  )}
                </motion.section>
              );
            })}
          </div>
        )}

        {/* Strategic conversion playlists */}
        <StrategicMusicShelves />

        {/* Invisible funnel shelves */}
        <div className="mt-10">
          <InvisibleFunnelShelves context="musicas" />
        </div>
      </main>

      <FooterLinks />
    </div>
    </StudentLayout>
    </ModuleGuard>
  );
}

/* ── Auto Playlist Shelf ── */
function AutoPlaylistShelf({
  title, icon, tracks, delay, activeTrackRef,
  currentTrack, playing, progress, handlePlayWithQueue, canDownload, isLocked, setQueue,
}: {
  title: string;
  icon: React.ReactNode;
  tracks: any[];
  delay: number;
  activeTrackRef: React.RefObject<HTMLDivElement | null>;
  currentTrack: Track | null;
  playing: boolean;
  progress: number;
  handlePlayWithQueue: (track: any, trackList: any[]) => void;
  canDownload: boolean;
  isLocked: boolean;
  setQueue: (tracks: Track[], startIndex?: number) => void;
}) {
  if (!tracks || tracks.length === 0) return null;

  return (
    <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={delay} className="mb-8">
      <div className="flex items-center gap-3 mb-4">
        {icon}
        <h2 className="font-display text-lg font-bold text-foreground/80 tracking-tight">{title}</h2>
        <div className="flex-1 h-px bg-gradient-to-r from-border/15 to-transparent" />
        <span className="text-xs text-muted-foreground/50">{tracks.length} música{tracks.length !== 1 ? "s" : ""}</span>
        {!isLocked && tracks.length > 1 && (
          <button
            onClick={() => {
              const playable = tracks.filter((t: any) => t.is_active);
              if (playable.length > 0) {
                setQueue(playable.map(dbTrackToPlayerTrack), 0);
                toast.success(`▶ Tocando "${title}"`);
              }
            }}
            className="flex items-center gap-1.5 text-[11px] font-semibold text-gold/60 hover:text-gold/90 transition-colors duration-300 rounded-full border border-gold/15 hover:border-gold/30 px-3 py-1.5 bg-gold/5 hover:bg-gold/10"
          >
            <PlayCircle className="h-3 w-3" />
            <span className="hidden sm:inline">Tocar todas</span>
            <span className="sm:hidden">▶</span>
          </button>
        )}
      </div>
      <ScrollableCarousel>
        {tracks.map((track: any, idx: number) => (
          <TrackCard
            key={track.id}
            track={track}
            idx={idx}
            icon="🎵"
            catTracks={tracks}
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
      </ScrollableCarousel>
    </motion.div>
  );
}

/* ── Scrollable Carousel with arrows ── */
function ScrollableCarousel({ children }: { children: React.ReactNode }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }, []);

  useEffect(() => {
    const timer = setTimeout(checkScroll, 150);
    const el = scrollRef.current;
    const ro = el ? new ResizeObserver(checkScroll) : null;
    if (el && ro) ro.observe(el);
    return () => { clearTimeout(timer); ro?.disconnect(); };
  }, [checkScroll]);

  const scroll = useCallback((dir: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.75;
    el.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
  }, []);

  return (
    <div className="relative group/carousel -mx-4 sm:-mx-6 lg:-mx-10 xl:-mx-12">
      {canScrollLeft && (
        <button
          onClick={() => scroll('left')}
          aria-label="Anterior"
          className="absolute left-1 top-1/2 -translate-y-1/2 z-20 flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-background/90 border border-border/30 shadow-lg backdrop-blur-sm text-foreground/60 hover:text-gold hover:border-gold/30 transition-all sm:opacity-0 sm:group-hover/carousel:opacity-100"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
      )}
      {canScrollRight && (
        <button
          onClick={() => scroll('right')}
          aria-label="Próximo"
          className="absolute right-1 top-1/2 -translate-y-1/2 z-20 flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-background/90 border border-border/30 shadow-lg backdrop-blur-sm text-foreground/60 hover:text-gold hover:border-gold/30 transition-all sm:opacity-0 sm:group-hover/carousel:opacity-100"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      )}
      <div
        ref={scrollRef}
        onScroll={checkScroll}
        className="flex gap-3.5 sm:gap-4 overflow-x-auto pb-4 px-4 sm:px-6 lg:px-10 xl:px-12 scrollbar-hide snap-x snap-mandatory touch-pan-x"
        style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
      >
        {children}
      </div>
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
  // Track is not yet active (future/coming soon) — not the same as user-locked
  const isInactive = !track.is_active;

  // Bonus track with release date in the future (or no date yet)
  const isBonusNotYetReleased = track.is_bonus && (
    !track.bonus_release_date || new Date(track.bonus_release_date + 'T00:00:00') > new Date()
  );

  // Released bonus tracks are FREE — never locked by buyer access
  const isBonusReleased = track.is_bonus && !isBonusNotYetReleased;

  // Determine effective lock state:
  // - Inactive tracks are always locked (coming soon)
  // - Bonus not yet released → locked with countdown
  // - Released bonus → always accessible (free)
  // - Regular tracks → locked if user has no buyer access
  const effectiveLocked = isInactive || isBonusNotYetReleased || (!isBonusReleased && isLocked);

  const bonusCountdown = (() => {
    if (!track.bonus_release_date) return null;
    const release = new Date(track.bonus_release_date + 'T00:00:00');
    const now = new Date();
    const diffMs = release.getTime() - now.getTime();
    if (diffMs <= 0) return null;
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 1) return 'Libera amanhã';
    return `Libera em ${diffDays} dias`;
  })();

  const SALES_URL = "https://pazemcancao-oficial.lovable.app";

  const Wrapper = effectiveLocked ? 'div' : Link;
  const wrapperProps = effectiveLocked
    ? {}
    : { to: "/musicas/$trackId" as const, params: { trackId: track.id } };

  const handleLockedClick = () => {
    if (isInactive) {
      toast.info("🕐 Este louvor estará disponível em breve!");
    } else if (isBonusNotYetReleased) {
      toast.info(bonusCountdown
        ? `🎁 ${bonusCountdown}`
        : "🎁 Este bônus ainda não tem data de liberação definida"
      );
    } else {
      // Redirect to sales page for locked content
      window.open(SALES_URL, "_blank");
    }
  };

  return (
    <div ref={isThis ? activeTrackRef : undefined}>
      <Wrapper
        {...(wrapperProps as any)}
        onClick={effectiveLocked ? handleLockedClick : undefined}
        className={`group relative cursor-pointer block ${
          isCarousel ? "snap-start shrink-0 w-[165px] sm:w-[200px] md:w-[210px] lg:w-[220px]" : ""
        }`}
      >
        <motion.div
          layout={false}
          initial={isCarousel ? { opacity: 0, x: 30 } : { opacity: 0, scale: 0.95 }}
          animate={isCarousel ? { opacity: 1, x: 0 } : { opacity: 1, scale: 1 }}
          transition={{ duration: isCarousel ? 0.4 : 0.3, delay: Math.min(idx * (isCarousel ? 0.04 : 0.02), 0.3), ease: "easeOut" }}
          whileHover={window.matchMedia('(hover: hover)').matches ? { scale: 1.04, y: -4 } : undefined}
          whileTap={{ scale: 0.97 }}
          className={`relative rounded-2xl border transition-all duration-500 overflow-hidden h-[280px] sm:h-[310px] lg:h-[320px] flex flex-col ${
            effectiveLocked
              ? "border-border/25 shadow-[0_4px_30px_-10px] shadow-black/20 opacity-70 grayscale-[30%]"
              : isPlaying
                ? "border-gold/30 shadow-[0_8px_50px_-12px] shadow-gold/20 ring-1 ring-gold/10"
                : isThis
                  ? "border-gold/15 shadow-[0_4px_30px_-10px] shadow-gold/10"
                  : "border-border/20 shadow-[0_4px_30px_-10px] shadow-black/20 hover:border-gold/15"
          } bg-card/20`}
        >
          {/* Cover area — fixed height */}
          <div className={`relative h-[185px] sm:h-[210px] lg:h-[220px] w-full bg-gradient-to-br ${gradient} overflow-hidden shrink-0`}>
            {track.cover_url && (
              <img
                src={track.cover_url}
                alt={track.title}
                className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ${
                  effectiveLocked ? "brightness-50" : isPlaying ? "scale-105 brightness-90" : "group-hover:scale-110"
                }`}
                loading="lazy"
                decoding="async"
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
                <div className="flex h-14 w-14 rounded-2xl items-center justify-center backdrop-blur-sm bg-black/30 border border-white/10">
                  {isInactive ? (
                    <Clock className="h-6 w-6 text-sky-400/70" />
                  ) : isBonusNotYetReleased ? (
                    <Gift className="h-6 w-6 text-amber-400/70" />
                  ) : (
                    <Lock className="h-6 w-6 text-white/50" />
                  )}
                </div>
                {isInactive && (
                  <div className="rounded-full bg-black/50 backdrop-blur-sm border border-sky-400/20 px-3 py-1">
                    <p className="text-[11px] font-semibold text-sky-300/80 tracking-wider uppercase text-center">
                      🕐 Em breve
                    </p>
                  </div>
                )}
                {isBonusNotYetReleased && bonusCountdown && (
                  <div className="rounded-full bg-black/50 backdrop-blur-sm border border-amber-400/20 px-3 py-1">
                    <p className="text-[11px] font-semibold text-amber-300/80 tracking-wider uppercase text-center">
                      ⏳ {bonusCountdown}
                    </p>
                  </div>
                )}
              </div>
            )}

            {!effectiveLocked && !track.cover_url && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className={`flex h-14 w-14 rounded-2xl items-center justify-center backdrop-blur-sm transition-all duration-700 ${
                  isPlaying ? "bg-gold/15 border border-gold/25 scale-110" : "bg-white/[0.04] border border-white/[0.06] group-hover:scale-105"
                }`}>
                  {isPlaying ? (
                    <NowPlayingBars />
                  ) : (
                    <Music className="h-6 w-6 transition-colors duration-500 text-white/25 group-hover:text-white/40" />
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

            {/* Play button overlay */}
            {!effectiveLocked && (
              <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
                isPlaying ? "opacity-100" : "opacity-0 group-hover:opacity-100"
              }`}>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); handlePlayWithQueue(track, catTracks); }}
                  className={`flex h-12 w-12 items-center justify-center rounded-full transition-all duration-300 ${
                    isPlaying
                      ? "bg-gold/90 text-background shadow-xl shadow-gold/30"
                      : "bg-gold/80 text-background shadow-xl shadow-gold/20 hover:bg-gold hover:scale-110"
                  }`}
                >
                  {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
                </motion.button>
              </div>
            )}

            {/* Category badge */}
            <span className="absolute top-3 right-3 text-[10px] font-medium tracking-[0.15em] uppercase rounded-full bg-black/30 backdrop-blur-sm border border-white/[0.08] px-2 py-0.5 text-white/40">
              {icon} {track.category.replace(/^[^\w\s]+\s*/, '')}
            </span>

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

          {/* Info section — fixed height */}
          <div className="p-3.5 flex flex-col flex-1 min-h-0">
            <h3 className={`font-display text-[13px] font-bold tracking-tight leading-snug line-clamp-2 transition-colors duration-500 ${
              effectiveLocked ? "text-muted-foreground/70" : isPlaying ? "text-gold" : isThis ? "text-gold/70" : "text-foreground/85 group-hover:text-foreground"
            }`}>
              {track.title}
            </h3>
            <div className="flex items-center justify-between mt-auto pt-1.5">
              <div className="flex items-center gap-2">
                <p className={`text-xs tracking-[0.1em] font-medium transition-colors duration-500 ${
                  isPlaying ? "text-gold/70" : "text-muted-foreground/60"
                }`}>
                  {track.duration}
                </p>
                {effectiveLocked && (
                  <span className={`text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded-full ${
                    isInactive ? "text-sky-400/60 bg-sky-400/10" : isBonusNotYetReleased ? "text-amber-400/60 bg-amber-400/10" : "text-destructive/40 bg-destructive/8"
                  }`}>
                    {isInactive ? "🕐 Em breve" : isBonusNotYetReleased ? "🎁 Bônus" : "Bloqueado"}
                  </span>
                )}
                {!effectiveLocked && isPlaying && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-[10px] font-semibold tracking-wider uppercase text-gold/70 bg-gold/8 px-1.5 py-0.5 rounded-full"
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
                    logDownload({ data: { trackId: track.id } }).catch(() => {});
                    const link = document.createElement("a");
                    link.href = track.download_url || getStoragePublicUrl(track.storage_path);
                    link.download = `${track.title}.mp3`;
                    link.click();
                  }}
                  className="text-muted-foreground/50 hover:text-gold/70 transition-colors duration-300"
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