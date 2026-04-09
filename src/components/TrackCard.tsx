import { Play, Pause, Download } from "lucide-react";
import type { Track } from "@/lib/sample-tracks";
import { usePlayer } from "@/hooks/use-player";

interface TrackCardProps {
  track: Track;
  index: number;
}

export function TrackCard({ track, index }: TrackCardProps) {
  const { currentTrack, playing, progress, toggle } = usePlayer();
  const isThis = currentTrack?.id === track.id;
  const isPlaying = isThis && playing;

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    const link = document.createElement("a");
    link.href = track.downloadUrl;
    link.download = `${String(track.id).padStart(2, "0")} - ${track.title}.mp3`;
    link.click();
  };

  return (
    <div
      className="group relative cursor-pointer h-full"
      onClick={() => toggle(track)}
    >
      <div
        className={`relative rounded-2xl border transition-all duration-700 overflow-hidden h-full flex flex-col ${
          isPlaying
            ? "bg-card/50 border-gold/20 shadow-[0_0_40px_-12px] shadow-gold/10"
            : "bg-card/10 border-border/10 hover:border-gold/12 hover:bg-card/20"
        }`}
      >
        {/* Ambient glow */}
        {isPlaying && (
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 h-20 w-32 rounded-full bg-gold/[0.04] blur-[50px] animate-breathe" />
          </div>
        )}

        <div className="relative p-6 sm:p-7 flex flex-col flex-1">
          {/* Top row: number + category */}
          <div className="flex items-center justify-between mb-5">
            <span
              className={`text-[10px] font-semibold tracking-[0.3em] uppercase transition-colors duration-500 ${
                isPlaying ? "text-gold/50" : "text-muted-foreground/25"
              }`}
            >
              {String(track.id).padStart(2, "0")}
            </span>
            <span
              className={`text-[9px] font-medium tracking-[0.2em] uppercase rounded-full px-3 py-1 transition-all duration-500 ${
                isPlaying
                  ? "bg-gold/10 text-gold/50"
                  : "bg-muted/5 text-muted-foreground/20"
              }`}
            >
              {track.category}
            </span>
          </div>

          {/* Title */}
          <h3
            className={`font-display text-[17px] sm:text-lg font-bold tracking-tight leading-snug transition-colors duration-500 ${
              isPlaying
                ? "text-gold/85"
                : "text-foreground/80 group-hover:text-foreground/95"
            }`}
          >
            {track.title}
          </h3>

          {/* Description */}
          <p
            className={`mt-3 text-[12.5px] leading-[2] line-clamp-2 transition-colors duration-500 flex-1 ${
              isPlaying
                ? "text-muted-foreground/50"
                : "text-muted-foreground/30 group-hover:text-muted-foreground/40"
            }`}
          >
            {track.description}
          </p>

          {/* Duration */}
          <p
            className={`mt-4 text-[10px] tracking-[0.15em] font-medium transition-colors duration-500 ${
              isPlaying ? "text-gold/35" : "text-muted-foreground/18"
            }`}
          >
            {track.duration}
          </p>

          {/* Progress bar */}
          {isPlaying && (
            <div className="mt-4 h-[1.5px] rounded-full bg-muted/8 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-gold/30 via-gold/55 to-gold/35 transition-all duration-200 ease-linear"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}

          {/* Actions */}
          <div
            className={`mt-5 pt-4 border-t border-border/6 flex items-center gap-3 transition-all duration-500 ${
              isPlaying ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            }`}
          >
            <span
              className={`inline-flex items-center gap-2 text-[10px] font-semibold tracking-[0.2em] uppercase transition-colors duration-500 ${
                isPlaying ? "text-gold/55" : "text-muted-foreground/30"
              }`}
            >
              {isPlaying ? (
                <>
                  <Pause className="h-3 w-3" />
                  Pausar
                </>
              ) : (
                <>
                  <Play className="h-3 w-3 ml-0.5" />
                  Ouvir
                </>
              )}
            </span>

            <span className="w-px h-3 bg-border/8" />

            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-2 text-[10px] font-semibold tracking-[0.2em] uppercase text-muted-foreground/20 hover:text-gold/45 transition-colors duration-500"
            >
              <Download className="h-3 w-3" />
              Baixar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
