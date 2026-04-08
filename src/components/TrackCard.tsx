import { Play, Pause, Download, Volume2, Clock } from "lucide-react";
import type { Track } from "@/lib/sample-tracks";
import { usePlayer } from "@/hooks/use-player";

interface TrackCardProps {
  track: Track;
  index: number;
}

const categoryColors: Record<string, string> = {
  Paz: "bg-sky-500/8 text-sky-400/80 border-sky-500/10",
  Cura: "bg-emerald-500/8 text-emerald-400/80 border-emerald-500/10",
  Força: "bg-amber-500/8 text-amber-400/80 border-amber-500/10",
  Oração: "bg-violet-500/8 text-violet-400/80 border-violet-500/10",
  Madrugada: "bg-indigo-500/8 text-indigo-400/80 border-indigo-500/10",
  Presença: "bg-rose-500/8 text-rose-400/80 border-rose-500/10",
  Refúgio: "bg-teal-500/8 text-teal-400/80 border-teal-500/10",
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
      className={`group relative rounded-2xl border backdrop-blur-sm transition-all duration-700 ease-out overflow-hidden ${
        isPlaying
          ? "border-gold/15 bg-card/50 shadow-[0_0_60px_-15px_var(--color-gold)/0.08]"
          : "border-border/20 bg-card/20 hover:border-gold/10 hover:bg-card/35"
      }`}
      style={{
        animationDelay: `${index * 50}ms`,
        animationFillMode: "backwards",
      }}
    >
      {/* Subtle gold glow when playing */}
      {isPlaying && (
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-12 -right-12 h-28 w-28 rounded-full bg-gold/[0.04] blur-3xl animate-breathe" />
        </div>
      )}

      {/* Playing progress overlay */}
      {isPlaying && (
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="h-full bg-gold/[0.015] transition-all duration-150 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      <div className="relative p-4 sm:p-5">
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Track number */}
          <div className="relative">
            <div
              className={`flex h-12 w-12 sm:h-13 sm:w-13 shrink-0 items-center justify-center rounded-2xl transition-all duration-500 ${
                isPlaying
                  ? "bg-gold/90 text-gold-foreground shadow-xl shadow-gold/20"
                  : "bg-muted/15 border border-border/20 text-muted-foreground/50 group-hover:bg-gold/8 group-hover:border-gold/15 group-hover:text-gold/70"
              }`}
            >
              {isPlaying ? (
                <div className="flex items-center gap-[3px]">
                  <div className="w-[2.5px] h-2.5 bg-gold-foreground/80 rounded-full animate-pulse" />
                  <div className="w-[2.5px] h-3.5 bg-gold-foreground/80 rounded-full animate-pulse" style={{ animationDelay: '0.15s' }} />
                  <div className="w-[2.5px] h-2 bg-gold-foreground/80 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }} />
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
                <Volume2 className="h-3 w-3 text-gold/60 shrink-0 animate-pulse" />
              )}
              <h3
                className={`text-sm sm:text-[15px] font-bold truncate transition-colors duration-500 leading-tight ${
                  isPlaying ? "text-gold/90" : "text-foreground/85"
                }`}
              >
                {track.title}
              </h3>
            </div>
            <p className="mt-1.5 text-[11px] sm:text-xs leading-relaxed text-muted-foreground/40 line-clamp-1 sm:line-clamp-2">
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
              <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground/30 font-medium">
                <Clock className="h-2.5 w-2.5" />
                {track.duration}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => toggle(track)}
              className={`flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-500 active:scale-90 ${
                isPlaying
                  ? "bg-gold/15 text-gold/80 hover:bg-gold/20"
                  : "bg-transparent text-muted-foreground/35 hover:bg-gold/8 hover:text-gold/60"
              }`}
            >
              {isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4 ml-0.5" />
              )}
            </button>

            <button
              onClick={handleDownload}
              className="flex h-10 w-10 items-center justify-center rounded-xl text-muted-foreground/25 hover:bg-gold/8 hover:text-gold/60 transition-all duration-500 active:scale-95"
            >
              <Download className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Progress bar when playing */}
        {isPlaying && (
          <div className="mt-4 h-0.5 rounded-full bg-muted/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-gold/40 via-gold/70 to-gold/50 transition-all duration-150 ease-linear relative"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-gold/80 shadow-md shadow-gold/30" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
