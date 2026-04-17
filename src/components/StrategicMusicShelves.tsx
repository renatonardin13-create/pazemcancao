import { useQuery } from "@tanstack/react-query";
import { getStrategicPlaylists, type StrategicPlaylist } from "@/lib/strategic-playlists.functions";
import { ChevronLeft, ChevronRight, Lock } from "lucide-react";
import { useRef, useState, useCallback, useEffect, memo } from "react";
import { TrackCard } from "@/components/TrackCard";
import { POSTER_SHELF_ITEM } from "@/lib/card-grid";
import type { Track } from "@/lib/sample-tracks";

function getStoragePublicUrl(storagePath: string | null | undefined): string {
  if (!storagePath) return "";
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  return `${supabaseUrl}/storage/v1/object/public/tracks/${storagePath}`;
}

function mapTrack(track: any): Track {
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
    isBonus: track.is_bonus,
    bonusReleaseDate: track.bonus_release_date,
    isLocked: Boolean(track._locked),
    releaseLabel: track.release_label || null,
  };
}

export const StrategicMusicShelves = memo(function StrategicMusicShelves() {
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
    <div className="space-y-8 sm:space-y-12 mt-8">
      {data.playlists.map((playlist, idx) => (
        <StrategicShelf key={playlist.key} playlist={playlist} shelfIdx={idx} />
      ))}
    </div>
  );
});

function StrategicShelf({ playlist, shelfIdx }: { playlist: StrategicPlaylist; shelfIdx: number }) {
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
    const ro = el && typeof ResizeObserver !== "undefined" ? new ResizeObserver(checkScroll) : null;
    if (el && ro) ro.observe(el);
    return () => {
      clearTimeout(timer);
      ro?.disconnect();
    };
  }, [checkScroll]);

  const scroll = useCallback((dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === "left" ? -el.clientWidth * 0.8 : el.clientWidth * 0.8, behavior: "smooth" });
  }, []);

  const tracks = playlist.tracks.map(mapTrack);

  return (
    <section
      className="animate-in fade-in slide-in-from-bottom-4 duration-500"
      style={{ animationDelay: `${shelfIdx * 100}ms`, animationFillMode: "both" }}
    >
      <div className="mb-3 sm:mb-4 flex items-center gap-2.5">
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
            className="absolute left-0 top-0 bottom-0 z-20 w-10 sm:w-14 lg:w-16 flex items-center justify-center bg-gradient-to-r from-background/95 via-background/70 to-transparent text-foreground/60 active:text-gold transition-colors lg:opacity-0 lg:group-hover/shelf:opacity-100"
          >
            <ChevronLeft className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8" />
          </button>
        )}
        {canScrollRight && (
          <button
            onClick={() => scroll("right")}
            aria-label="Próximo"
            className="absolute right-0 top-0 bottom-0 z-20 w-10 sm:w-14 lg:w-16 flex items-center justify-center bg-gradient-to-l from-background/95 via-background/70 to-transparent text-foreground/60 active:text-gold transition-colors lg:opacity-0 lg:group-hover/shelf:opacity-100"
          >
            <ChevronRight className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8" />
          </button>
        )}

        <div
          ref={scrollRef}
          onScroll={checkScroll}
          className="flex gap-2.5 sm:gap-3 lg:gap-4 overflow-x-auto pb-4 px-1 sm:px-0 scrollbar-hide snap-x snap-mandatory touch-pan-x"
          style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" } as any}
        >
          {tracks.map((track, idx) => (
            <div key={track.id} className={POSTER_SHELF_ITEM}>
              <TrackCard track={track} index={idx} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
