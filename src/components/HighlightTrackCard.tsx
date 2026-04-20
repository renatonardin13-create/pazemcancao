import { Play, Pause, Music } from "lucide-react";
import { usePlayer } from "@/hooks/use-player";
import type { Track } from "@/lib/sample-tracks";
import { getTrackReleaseMeta } from "@/lib/track-release";

interface HighlightTrackCardProps {
  track: Track;
  subtitle?: string;
  /** Lista de contexto p/ auto-next ao terminar a faixa. */
  queue?: Track[];
}

function splitTitle(title: string) {
  const words = title.trim().split(/\s+/);
  if (words.length <= 2) return { line1: words.join(" "), line2: "" };
  const mid = Math.ceil(words.length / 2);
  return { line1: words.slice(0, mid).join(" "), line2: words.slice(mid).join(" ") };
}

export function HighlightTrackCard({ track, subtitle, queue }: HighlightTrackCardProps) {
  const { currentTrack, playing, toggle } = usePlayer();
  const isThis = currentTrack?.id === track.id;
  const isPlaying = isThis && playing;

  const release = getTrackReleaseMeta(track as any);
  const isComingSoon = release.isComingSoon;
  const locked = (track as any).isLocked || isComingSoon;
  const { line1, line2 } = splitTitle(track.title);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (locked) return;
    toggle(track, queue);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="group relative h-[180px] w-[260px] shrink-0 overflow-hidden rounded-[22px] border border-gold/25 bg-card/40 text-left shadow-[0_10px_40px_-18px_rgba(0,0,0,0.85)] transition-all duration-500 hover:-translate-y-1 hover:border-gold/50"
    >
      {track.coverUrl ? (
        <img
          src={track.coverUrl}
          alt={track.title}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/20 via-background to-background">
          <Music className="h-10 w-10 text-primary/50" />
        </div>
      )}

      {/* Vinheta sutil para legibilidade do play/badge sobre a capa */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/20" />


      <div className="absolute bottom-3 right-3">
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-full border transition-all duration-300 ${
            isPlaying
              ? "border-gold bg-gold text-background"
              : "border-gold/60 bg-background/80 text-gold backdrop-blur-md group-hover:scale-110"
          }`}
        >
          {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 fill-current" />}
        </div>
      </div>

      {isComingSoon && (
        <div className="absolute left-3 top-3 rounded-full border border-gold/50 bg-background/85 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-gold backdrop-blur-md">
          Em breve
        </div>
      )}
    </button>
  );
}
