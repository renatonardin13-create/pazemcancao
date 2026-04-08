import { Play, Pause, Download, Volume2, Clock, Music } from "lucide-react";
import type { Track } from "@/lib/sample-tracks";
import { usePlayer } from "@/hooks/use-player";

interface TrackCardProps {
  track: Track;
  index: number;
}

const categoryColors: Record<string, string> = {
  Paz: "bg-sky-500/10 text-sky-400 border-sky-500/15",
  Cura: "bg-emerald-500/10 text-emerald-400 border-emerald-500/15",
  Força: "bg-amber-500/10 text-amber-400 border-amber-500/15",
  Oração: "bg-violet-500/10 text-violet-400 border-violet-500/15",
  Madrugada: "bg-indigo-500/10 text-indigo-400 border-indigo-500/15",
  Presença: "bg-rose-500/10 text-rose-400 border-rose-500/15",
  Refúgio: "bg-teal-500/10 text-teal-400 border-teal-500/15",
};

const categoryIcons: Record<string, string> = {
  Paz: "🕊️",
  Cura: "💚",
  Força: "🔥",
  Oração: "🙏",
  Madrugada: "🌅",
  Presença: "✨",
  Refúgio: "🏔️",
};

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
      className={`group relative rounded-2xl border backdrop-blur-sm transition-all duration-500 ease-out overflow-hidden ${
        isPlaying
          ? "border-gold/25 bg-card/80 shadow-[0_0_40px_-10px_var(--color-gold)/0.12]"
          : "border-border/30 bg-card/40 hover:border-gold/15 hover:bg-card/60 hover:shadow-[0_12px_48px_-16px_rgba(0,0,0,0.4)]"
      }`}
      style={{
        animationDelay: `${index * 40}ms`,
        animationFillMode: "backwards",
      }}
    >
      {/* Subtle gold glow when playing */}
      {isPlaying && (
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-10 -right-10 h-24 w-24 rounded-full bg-gold/[0.06] blur-2xl" />
          <div className="absolute -bottom-8 -left-8 h-20 w-20 rounded-full bg-gold/[0.04] blur-2xl" />
        </div>
      )}

      {/* Playing progress overlay */}
      {isPlaying && (
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="h-full bg-gold/[0.025] transition-all duration-150 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      <div className="relative p-4 sm:p-5">
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Track number + icon */}
          <div className="relative">
            <div
              className={`flex h-13 w-13 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-2xl transition-all duration-300 ${
                isPlaying
                  ? "bg-gold text-gold-foreground shadow-xl shadow-gold/30 scale-105"
                  : "bg-muted/30 border border-border/30 text-muted-foreground group-hover:bg-gold/10 group-hover:border-gold/20 group-hover:text-gold"
              }`}
            >
              {isPlaying ? (
                <div className="flex items-center gap-[3px]">
                  <div className="w-[3px] h-3 bg-gold-foreground rounded-full animate-pulse" />
                  <div className="w-[3px] h-4 bg-gold-foreground rounded-full animate-pulse" style={{ animationDelay: '0.15s' }} />
                  <div className="w-[3px] h-2.5 bg-gold-foreground rounded-full animate-pulse" style={{ animationDelay: '0.3s' }} />
                </div>
              ) : (
                <span className="text-sm font-bold font-display">
                  {String(track.id).padStart(2, "0")}
                </span>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              {isPlaying && (
                <Volume2 className="h-3.5 w-3.5 text-gold shrink-0 animate-pulse" />
              )}
              <h3
                className={`text-sm sm:text-[15px] font-bold truncate transition-colors duration-300 leading-tight ${
                  isPlaying ? "text-gold" : "text-foreground"
                }`}
              >
                {track.title}
              </h3>
            </div>
            <p className="mt-1.5 text-[11px] sm:text-xs leading-relaxed text-muted-foreground/60 line-clamp-1 sm:line-clamp-2">
              {track.description}
            </p>
            <div className="mt-2 flex items-center gap-2 flex-wrap">
              <span
                className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-semibold tracking-wide ${
                  categoryColors[track.category] ||
                  "bg-muted text-muted-foreground border-border"
                }`}
              >
                <span className="text-[10px] leading-none">
                  {categoryIcons[track.category]}
                </span>
                {track.category}
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground/40 font-medium">
                <Clock className="h-2.5 w-2.5" />
                {track.duration}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Play/Pause button */}
            <button
              onClick={() => toggle(track)}
              className={`flex h-11 w-11 sm:h-10 sm:w-10 items-center justify-center rounded-xl transition-all duration-300 active:scale-90 ${
                isPlaying
                  ? "bg-gold/20 text-gold hover:bg-gold/30"
                  : "bg-transparent text-muted-foreground/60 hover:bg-gold/10 hover:text-gold"
              }`}
            >
              {isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4 ml-0.5" />
              )}
            </button>

            {/* Download button */}
            <button
              onClick={handleDownload}
              className="flex h-11 w-11 sm:h-10 sm:w-10 items-center justify-center rounded-xl text-muted-foreground/40 hover:bg-gold/10 hover:text-gold transition-all duration-300 active:scale-95"
            >
              <Download className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Progress bar when playing */}
        {isPlaying && (
          <div className="mt-4 h-1 rounded-full bg-muted/20 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-gold/60 via-gold to-gold/80 transition-all duration-150 ease-linear relative"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 h-2.5 w-2.5 rounded-full bg-gold shadow-md shadow-gold/40" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
