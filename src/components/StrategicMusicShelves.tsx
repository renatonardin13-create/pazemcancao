import { useQuery } from "@tanstack/react-query";
import { getStrategicPlaylists, type StrategicPlaylist } from "@/lib/strategic-playlists.functions";
import { Lock, Play, ChevronLeft, ChevronRight, Sparkles, Crown, Music } from "lucide-react";
import { useRef, useState, useCallback, useEffect, memo } from "react";
import { OptimizedImage } from "@/components/OptimizedImage";
import { usePlayer } from "@/hooks/use-player";
import { toast } from "sonner";

function getStoragePublicUrl(storagePath: string): string {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  return `${supabaseUrl}/storage/v1/object/public/tracks/${storagePath}`;
}

export function StrategicMusicShelves() {
  const { data, isLoading } = useQuery({
    queryKey: ["strategic-playlists"],
    queryFn: () => getStrategicPlaylists(),
    staleTime: 5 * 60_000,
    refetchOnWindowFocus: false,
  });

  if (isLoading || !data?.playlists?.length) {
    return <div className="hidden" aria-hidden="true" />;
  }

  return (
    <div className="space-y-8 mt-8">
      {data.playlists.map((pl, idx) => (
        <StrategicShelf key={pl.key} playlist={pl} shelfIdx={idx} />
      ))}
    </div>
  );
}

function StrategicShelf({ playlist, shelfIdx }: { playlist: StrategicPlaylist; shelfIdx: number }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const { currentTrack, playing, toggle, setQueue } = usePlayer();

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }, []);

  useEffect(() => {
    const timer = setTimeout(checkScroll, 150);
    const el = scrollRef.current;
    const ro = el && typeof ResizeObserver !== "undefined" ? new ResizeObserver(checkScroll) : null;
    if (el && ro) ro.observe(el);
    return () => { clearTimeout(timer); ro?.disconnect(); };
  }, [checkScroll]);

  const scroll = useCallback((dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === "left" ? -el.clientWidth * 0.8 : el.clientWidth * 0.8, behavior: "smooth" });
  }, []);

  const playAll = useCallback(() => {
    const playable = playlist.tracks.filter((t) => !t._locked);
    if (playable.length > 0) {
      const playerTracks = playable.map((t) => ({
        id: t.id,
        title: t.title,
        duration: t.duration,
        category: t.category,
        audioUrl: getStoragePublicUrl(t.storage_path),
        downloadUrl: t.download_url || getStoragePublicUrl(t.storage_path),
        description: t.description || "",
        coverUrl: t.cover_url || undefined,
      }));
      setQueue(playerTracks, 0);
      toast.success(`▶ Tocando "${playlist.title}"`);
    }
  }, [playlist, setQueue]);

  return (
    <section
      className="animate-in fade-in slide-in-from-bottom-4 duration-500"
      style={{ animationDelay: `${shelfIdx * 100}ms`, animationFillMode: "both" }}
    >
      <div className="flex items-center gap-2.5 mb-3">
        <span className="text-base">{playlist.icon}</span>
        <h2 className="font-display text-lg sm:text-xl font-bold text-foreground/90 tracking-tight">
          {playlist.title}
        </h2>
        <div className="flex-1 h-px bg-gradient-to-r from-gold/10 to-transparent" />
        {playlist.hasLockedTracks && (
          <span className="flex items-center gap-1 text-[10px] font-semibold text-gold/50 uppercase tracking-wider">
            <Lock className="h-2.5 w-2.5" />
            Premium
          </span>
        )}
      </div>
      <p className="text-[11px] text-muted-foreground/40 mb-4 ml-[30px]">{playlist.subtitle}</p>

      <div className="relative group/shelf">
        {canScrollLeft && (
          <button
            onClick={() => scroll("left")}
            aria-label="Anterior"
            className="absolute left-0 top-0 bottom-0 z-20 w-10 sm:w-14 flex items-center justify-center bg-gradient-to-r from-background/95 via-background/70 to-transparent text-foreground/60 active:text-gold transition-colors lg:opacity-0 lg:group-hover/shelf:opacity-100"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
        )}
        {canScrollRight && (
          <button
            onClick={() => scroll("right")}
            aria-label="Próximo"
            className="absolute right-0 top-0 bottom-0 z-20 w-10 sm:w-14 flex items-center justify-center bg-gradient-to-l from-background/95 via-background/70 to-transparent text-foreground/60 active:text-gold transition-colors lg:opacity-0 lg:group-hover/shelf:opacity-100"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        )}

        <div
          ref={scrollRef}
          onScroll={checkScroll}
          className="flex gap-3 sm:gap-4 overflow-x-auto pb-4 px-1 scrollbar-hide snap-x snap-mandatory touch-pan-x"
          style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" } as any}
        >
          {playlist.tracks.map((track, idx) => (
            <div key={track.id} className="w-[150px] sm:w-[180px] md:w-[200px] shrink-0 snap-start">
              <StrategicTrackCard track={track} index={idx} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const StrategicTrackCard = memo(function StrategicTrackCard({ track, index }: { track: any; index: number }) {
  const isLocked = track._locked;
  const { currentTrack, playing, toggle, setQueue } = usePlayer();
  const isPlaying = currentTrack?.id === track.id && playing;

  const handleClick = useCallback(() => {
    if (isLocked) return; // locked clicks handled by wrapper
    const playerTrack = {
      id: track.id,
      title: track.title,
      duration: track.duration,
      category: track.category,
      audioUrl: getStoragePublicUrl(track.storage_path),
      downloadUrl: track.download_url || getStoragePublicUrl(track.storage_path),
      description: track.description || "",
      coverUrl: track.cover_url || undefined,
    };
    toggle(playerTrack);
  }, [track, isLocked, toggle]);

  const salesUrl = "https://pazemcancao-oficial.lovable.app";

  return (
    <div
      className="group/card relative cursor-pointer animate-in fade-in slide-in-from-bottom-3 duration-500"
      style={{ animationDelay: `${Math.min(index * 60, 400)}ms`, animationFillMode: "both" }}
      onClick={isLocked ? undefined : handleClick}
    >
      {isLocked ? (
        <a href={salesUrl} target="_blank" rel="noopener noreferrer" className="block">
          <CardInner track={track} isLocked={isLocked} isPlaying={false} />
        </a>
      ) : (
        <CardInner track={track} isLocked={false} isPlaying={isPlaying} />
      )}
    </div>
  );
});

function CardInner({ track, isLocked, isPlaying }: { track: any; isLocked: boolean; isPlaying: boolean }) {
  return (
    <div className="relative rounded-[14px] overflow-hidden bg-card/5 shadow-md shadow-black/25 ring-1 ring-white/[0.04] md:group-hover/card:shadow-[0_12px_40px_-8px_rgba(0,0,0,0.6)] md:group-hover/card:ring-gold/15 md:transition-all md:duration-500 md:group-hover/card:scale-[1.04]">
      <div className={`relative aspect-square overflow-hidden ${
        isLocked ? "bg-gradient-to-br from-stone-900/40 via-zinc-950/30 to-neutral-950/50" : "bg-gradient-to-br from-sky-900/40 via-blue-950/30 to-slate-950/50"
      }`}>
        {track.cover_url ? (
          <OptimizedImage
            src={track.cover_url}
            alt={track.title}
            context="card"
            className={`w-full h-full object-cover md:transition-transform md:duration-[900ms] md:ease-out md:group-hover/card:scale-[1.08] ${
              isLocked ? "saturate-[0.45] brightness-[0.5]" : ""
            }`}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Music className="h-10 w-10 text-white/15" />
          </div>
        )}

        {/* Bottom gradient */}
        <div className="absolute inset-x-0 bottom-0 h-[60%] bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

        {/* Lock overlay */}
        {isLocked && (
          <>
            <div className="absolute inset-0 bg-black/30" />
            <div className="absolute inset-0 flex flex-col items-center justify-center z-10 gap-2">
              <div className="flex h-12 w-12 rounded-2xl items-center justify-center backdrop-blur-sm bg-black/30 border border-white/10">
                <Lock className="h-5 w-5 text-white/50" />
              </div>
              <span className="text-[10px] font-bold text-gold/70 bg-black/40 backdrop-blur-sm rounded-full px-3 py-0.5 border border-gold/15">
                Desbloquear
              </span>
            </div>
          </>
        )}

        {/* Lock badge */}
        {isLocked && (
          <span className="absolute top-2 left-2 z-10 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-gold/95 to-amber-500/90 text-[9px] font-bold text-gold-foreground uppercase tracking-wide shadow-lg shadow-black/30 border border-gold/20">
            <Lock className="h-2.5 w-2.5" />
            Premium
          </span>
        )}

        {/* Play indicator */}
        {!isLocked && isPlaying && (
          <div className="absolute top-2 left-2 z-10 flex items-center gap-1 px-2 py-0.5 rounded-full bg-gold/90 text-[9px] font-bold text-gold-foreground">
            <Play className="h-2.5 w-2.5 fill-current" />
            Tocando
          </div>
        )}

        {/* Play button hover */}
        {!isLocked && !isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gold/95 shadow-lg scale-[0.5] opacity-0 md:group-hover/card:opacity-100 md:group-hover/card:scale-100 md:transition-all md:duration-500">
              <Play className="h-4 w-4 text-gold-foreground fill-gold-foreground" />
            </div>
          </div>
        )}

        {/* Title */}
        <div className="absolute inset-x-0 bottom-0 px-3 pb-3 z-10">
          <h3 className={`text-[13px] font-bold line-clamp-2 leading-snug drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] tracking-tight ${
            isLocked ? "text-white/60" : "text-white"
          }`}>
            {track.title}
          </h3>
          <p className="text-[10px] text-white/35 mt-0.5">{track.category} · {track.duration}</p>
        </div>
      </div>
    </div>
  );
}
