import { Play, Pause, Download, Volume2, Clock } from "lucide-react";
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

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = track.downloadUrl;
    link.download = `${String(track.id).padStart(2, "0")} - ${track.title}.mp3`;
    link.click();
  };

  return (
    <div
      className={`group relative rounded-2xl transition-all duration-700 ease-out overflow-hidden ${
        isPlaying
          ? "bg-card/50 shadow-[0_0_80px_-20px_var(--color-gold)/0.06]"
          : "hover:bg-card/25"
      }`}
      style={{
        animationDelay: `${index * 40}ms`,
        animationFillMode: "backwards",
      }}
    >
      {/* Breathing glow when playing */}
      {isPlaying && (
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-16 -right-16 h-32 w-32 rounded-full bg-gold/[0.03] blur-[50px] animate-breathe" />
        </div>
      )}

      {/* Progress fill */}
      {isPlaying && (
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="h-full bg-gold/[0.012] transition-all duration-150 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      <div className="relative px-4 py-4 sm:px-5 sm:py-5">
        <div className="flex items-start gap-4">
          {/* Play button / Track number — the doorway */}
          <button
            onClick={() => toggle(track)}
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-all duration-500 mt-0.5 ${
              isPlaying
                ? "bg-gold/90 text-gold-foreground shadow-lg shadow-gold/15"
                : "bg-transparent border border-border/20 text-muted-foreground/35 group-hover:border-gold/15 group-hover:text-gold/50 group-hover:bg-gold/5"
            }`}
          >
            {isPlaying ? (
              <Pause className="h-4 w-4" />
            ) : (
              <span className="text-xs font-bold font-display group-hover:hidden">
                {String(track.id).padStart(2, "0")}
              </span>
            )}
            {!isPlaying && (
              <Play className="h-3.5 w-3.5 ml-0.5 hidden group-hover:block" />
            )}
          </button>

          {/* Track content — intimate, descriptive */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              {isPlaying && (
                <Volume2 className="h-3 w-3 text-gold/50 shrink-0 animate-pulse" />
              )}
              <h3
                className={`text-[15px] font-bold truncate transition-colors duration-500 leading-tight ${
                  isPlaying ? "text-gold/85" : "text-foreground/80 group-hover:text-foreground/95"
                }`}
              >
                {track.title}
              </h3>
            </div>

            {/* Description — the soul of each track */}
            <p className={`mt-2 text-[12px] sm:text-[13px] leading-[1.8] transition-colors duration-500 ${
              isPlaying
                ? "text-muted-foreground/50 line-clamp-3"
                : "text-muted-foreground/30 line-clamp-2 group-hover:text-muted-foreground/45 group-hover:line-clamp-3"
            }`}>
              {track.description}
            </p>

            <div className="mt-3 flex items-center gap-3">
              <span className="text-[10px] text-gold/30 font-medium tracking-wider uppercase">
                {track.category}
              </span>
              <span className="w-px h-2.5 bg-border/20" />
              <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground/25">
                <Clock className="h-2.5 w-2.5" />
                {track.duration}
              </span>
            </div>
          </div>

          {/* Download — secondary, quiet */}
          <button
            onClick={handleDownload}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground/15 hover:bg-gold/6 hover:text-gold/40 transition-all duration-500 active:scale-95 mt-1 opacity-0 group-hover:opacity-100"
          >
            <Download className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Progress bar when playing */}
        {isPlaying && (
          <div className="mt-4 ml-16 h-[2px] rounded-full bg-muted/8 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-gold/30 via-gold/60 to-gold/40 transition-all duration-150 ease-linear relative"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full bg-gold/70" />
            </div>
          </div>
        )}
      </div>

      {/* Bottom separator — barely visible */}
      <div className="mx-16 h-px bg-gradient-to-r from-transparent via-border/15 to-transparent" />
    </div>
  );
}
