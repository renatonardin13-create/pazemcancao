import { Play, Pause, Music } from "lucide-react";
import { usePlayer } from "@/hooks/use-player";
import type { Track } from "@/lib/sample-tracks";
import { getTrackReleaseMeta } from "@/lib/track-release";
import { PosterCard } from "@/components/PosterCard";

interface HighlightTrackCardProps {
  track: Track;
  /** Compatibilidade — não é renderizado (cards mostram apenas a capa). */
  subtitle?: string;
  /** Lista de contexto p/ auto-next ao terminar a faixa. */
  queue?: Track[];
}

/**
 * HighlightTrackCard — usa o PosterCard master (5:8) para ficar idêntico
 * aos demais cards de /home, /musicas e /cursos. Sem texto sobreposto:
 * apenas capa + botão play + badge "Em breve" quando aplicável.
 */
export function HighlightTrackCard({ track, queue }: HighlightTrackCardProps) {
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
    toggle(track, queue);
  };

  const fallback = (
    <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/[0.06] bg-white/[0.04]">
      <Music className="h-7 w-7 text-white/25" />
    </div>
  );

  const badgeTopLeft = isComingSoon ? (
    <span className="rounded-full border border-gold/50 bg-background/85 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-gold backdrop-blur-md">
      Em breve
    </span>
  ) : undefined;

  const centerAction = !locked ? (
    <button
      type="button"
      onClick={handleClick}
      className={`pointer-events-auto flex items-center justify-center rounded-full px-5 py-2.5 shadow-[0_4px_24px_rgba(0,0,0,0.4)] md:transition-all md:duration-500 ${
        isPlaying
          ? "scale-100 bg-gold/95 opacity-100"
          : "scale-[0.5] bg-gold/95 opacity-0 md:group-hover/card:scale-100 md:group-hover/card:opacity-100"
      }`}
    >
      {isPlaying ? (
        <Pause className="h-5 w-5 fill-gold-foreground text-gold-foreground" />
      ) : (
        <Play className="h-5 w-5 fill-gold-foreground text-gold-foreground" />
      )}
    </button>
  ) : undefined;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleClick(e as unknown as React.MouseEvent);
        }
      }}
      className="group/card relative block cursor-pointer"
    >
      <PosterCard
        cover={track.coverUrl}
        coverAlt={track.title}
        fallback={fallback}
        badgeTopLeft={badgeTopLeft}
        centerAction={centerAction}
        title=""
        subtitle={undefined}
        locked={locked}
      />
    </div>
  );
}
