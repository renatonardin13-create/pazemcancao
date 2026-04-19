import { Play, Pause, Music } from "lucide-react";
import { usePlayer } from "@/hooks/use-player";
import type { Track } from "@/lib/sample-tracks";
import { getTrackReleaseMeta } from "@/lib/track-release";

interface HighlightTrackCardProps {
  track: Track;
  subtitle?: string;
}

function emphasizeTitle(title: string) {
  const words = title.trim().split(/\s+/);
  if (words.length <= 2) {
    return { lead: title, accent: "" };
  }

  const accentSize = words.length >= 5 ? 2 : 1;
  const lead = words.slice(0, words.length - accentSize).join(" ");
  const accent = words.slice(words.length - accentSize).join(" ");
  return { lead, accent };
}

export function HighlightTrackCard({ track, subtitle }: HighlightTrackCardProps) {
  const { currentTrack, playing, toggle } = usePlayer();
  const isThis = currentTrack?.id === track.id;
  const isPlaying = isThis && playing;

  const release = getTrackReleaseMeta(track as any);
  const isComingSoon = release.isComingSoon;
  const locked = (track as any).isLocked || isComingSoon;
  const titleParts = emphasizeTitle(track.title);

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
      className="group relative h-[168px] w-[308px] shrink-0 overflow-hidden rounded-[26px] border border-gold/30 bg-card/40 text-left shadow-[0_10px_40px_-18px_rgba(0,0,0,0.85)] transition-all duration-500 hover:-translate-y-1 hover:border-gold/50"
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

      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.92)_0%,rgba(0,0,0,0.58)_42%,rgba(0,0,0,0.22)_72%,rgba(0,0,0,0.55)_100%)]" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/10" />

      <div className="relative flex h-full flex-col justify-end px-7 pb-5 pr-16">
        <h3 className="font-display text-[18px] font-bold uppercase leading-[0.95] tracking-tight text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.65)] sm:text-[20px]">
          <span className="block whitespace-pre-line">{titleParts.lead}</span>
          {titleParts.accent ? <span className="mt-1 block text-gold">{titleParts.accent}</span> : null}
        </h3>
        <p className="mt-3 line-clamp-1 text-[12px] text-white/78">
          {subtitle || track.description || `Louvor: ${track.title}`}
        </p>
      </div>

      <div className="absolute bottom-4 right-0 translate-x-[-10px]">
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-full border shadow-[0_10px_24px_-12px_rgba(0,0,0,0.8)] transition-all duration-300 ${
            isPlaying
              ? "border-gold bg-gold text-background"
              : "border-gold/60 bg-background/88 text-gold backdrop-blur-md group-hover:scale-110 group-hover:bg-gold/15"
          }`}
        >
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 fill-current" />}
        </div>
      </div>

      {isComingSoon && (
        <div className="absolute left-4 top-4 rounded-full border border-gold/50 bg-background/85 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-gold backdrop-blur-md">
          Em breve
        </div>
      )}
    </button>
  );
}
