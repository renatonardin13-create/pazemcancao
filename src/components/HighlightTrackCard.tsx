import { Play, Pause, Music } from "lucide-react";
import { usePlayer } from "@/hooks/use-player";
import type { Track } from "@/lib/sample-tracks";
import { getTrackReleaseMeta } from "@/lib/track-release";

interface HighlightTrackCardProps {
  track: Track;
  subtitle?: string;
}

export function HighlightTrackCard({ track, subtitle }: HighlightTrackCardProps) {
  const { currentTrack, playing, toggle } = usePlayer();
  const isThis = currentTrack?.id === track.id;
  const isPlaying = isThis && playing;

  const release = getTrackReleaseMeta(track as any);
  const isComingSoon = release.isComingSoon;
  const locked = (track as any).isLocked || isComingSoon;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (locked) return;
    toggle(track);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="group relative h-44 w-72 shrink-0 overflow-hidden rounded-2xl border border-gold/20 bg-card/40 text-left shadow-[0_8px_30px_-12px_rgba(0,0,0,0.6)] transition-all duration-500 hover:-translate-y-1 hover:border-gold/40 hover:shadow-[0_20px_50px_-15px_rgba(0,0,0,0.8)]"
    >
      {track.coverUrl ? (
        <img
          src={track.coverUrl}
          alt={track.title}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/30 to-background">
          <Music className="h-10 w-10 text-primary/50" />
        </div>
      )}

      {/* Dark gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-between p-4">
        <div />
        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="font-display text-base font-bold uppercase leading-tight tracking-tight text-white drop-shadow-lg line-clamp-2">
              {track.title}
            </h3>
            <p className="mt-1 text-[11px] text-white/70 line-clamp-1">
              {subtitle || track.description || "Ministério Paz em Canção"}
            </p>
          </div>
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-all duration-300 ${
              isPlaying
                ? "border-gold/60 bg-gold text-background"
                : "border-gold/40 bg-gold/20 text-gold backdrop-blur-sm group-hover:scale-110 group-hover:bg-gold/40"
            }`}
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 fill-current" />}
          </div>
        </div>
      </div>

      {isComingSoon && (
        <div className="absolute right-3 top-3 rounded-full border border-gold/50 bg-background/80 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-gold backdrop-blur-md">
          Em breve
        </div>
      )}
    </button>
  );
}
