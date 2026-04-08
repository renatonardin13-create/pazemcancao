import { useState, useEffect } from "react";
import { Play, Pause, Download, Volume2, Clock } from "lucide-react";
import type { Track } from "@/lib/sample-tracks";

interface TrackCardProps {
  track: Track;
  index: number;
}

const categoryColors: Record<string, string> = {
  Paz: "bg-blue-500/15 text-blue-400 border-blue-500/20",
  Cura: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  Força: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  Oração: "bg-violet-500/15 text-violet-400 border-violet-500/20",
  Madrugada: "bg-indigo-500/15 text-indigo-400 border-indigo-500/20",
  Presença: "bg-rose-500/15 text-rose-400 border-rose-500/20",
  Refúgio: "bg-teal-500/15 text-teal-400 border-teal-500/20",
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
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!playing) return;
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          setPlaying(false);
          return 0;
        }
        return p + 0.5;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [playing]);

  const togglePlay = () => {
    if (playing) {
      setPlaying(false);
    } else {
      setProgress(0);
      setPlaying(true);
    }
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = track.downloadUrl;
    link.download = `${String(track.id).padStart(2, "0")} - ${track.title}.mp3`;
    link.click();
  };

  return (
    <div
      className={`group relative rounded-2xl border bg-card/60 backdrop-blur-sm p-4 sm:p-5 transition-all duration-500 ease-out ${
        playing
          ? "border-gold/30 shadow-[0_0_30px_-8px_var(--color-gold)/0.15]"
          : "border-border/40 hover:border-gold/20 hover:shadow-[0_8px_40px_-12px_rgba(0,0,0,0.3)] hover:bg-card/80"
      }`}
      style={{
        animationDelay: `${index * 30}ms`,
        animationFillMode: "backwards",
      }}
    >
      {/* Progress bar background */}
      {playing && (
        <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
          <div
            className="h-full bg-gold/[0.03] transition-all duration-150 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      <div className="relative flex items-center gap-3 sm:gap-4">
        {/* Track number — desktop */}
        <span className="hidden sm:flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-muted/40 text-sm font-bold text-muted-foreground/60 font-display transition-colors group-hover:text-muted-foreground">
          {String(track.id).padStart(2, "0")}
        </span>

        {/* Play button */}
        <button
          onClick={togglePlay}
          className={`flex h-12 w-12 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl transition-all duration-300 active:scale-90 ${
            playing
              ? "bg-gold text-gold-foreground shadow-lg shadow-gold/25 scale-105"
              : "bg-gold/10 text-gold hover:bg-gold/20 hover:scale-105 hover:shadow-md hover:shadow-gold/10"
          }`}
        >
          {playing ? (
            <Pause className="h-5 w-5" />
          ) : (
            <Play className="h-5 w-5 ml-0.5" />
          )}
        </button>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {playing && (
              <Volume2 className="h-3.5 w-3.5 text-gold animate-pulse shrink-0" />
            )}
            <h3
              className={`text-sm sm:text-base font-semibold truncate transition-colors duration-300 ${
                playing ? "text-gold" : "text-foreground group-hover:text-foreground"
              }`}
            >
              {track.title}
            </h3>
          </div>
          <p className="mt-1 text-[11px] sm:text-xs leading-relaxed text-muted-foreground/70 line-clamp-2 italic">
            {track.description}
          </p>
          <div className="mt-1.5 flex items-center gap-2 flex-wrap">
            <span
              className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] sm:text-[11px] font-medium ${
                categoryColors[track.category] ||
                "bg-muted text-muted-foreground border-border"
              }`}
            >
              <span className="text-[10px]">
                {categoryIcons[track.category]}
              </span>
              {track.category}
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground/50">
              <Clock className="h-3 w-3" />
              {track.duration}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          <button
            onClick={togglePlay}
            className="flex h-10 sm:h-9 items-center gap-1.5 rounded-xl px-3 sm:px-4 text-xs font-medium text-muted-foreground transition-all duration-200 hover:bg-gold/10 hover:text-gold active:scale-95"
          >
            {playing ? (
              <Pause className="h-3.5 w-3.5" />
            ) : (
              <Play className="h-3.5 w-3.5" />
            )}
            <span className="hidden sm:inline">
              {playing ? "Pausar" : "Ouvir"}
            </span>
          </button>
          <button
            onClick={handleDownload}
            className="flex h-10 sm:h-9 items-center gap-1.5 rounded-xl px-3 sm:px-4 text-xs font-medium text-muted-foreground transition-all duration-200 hover:bg-gold/10 hover:text-gold active:scale-95"
          >
            <Download className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Baixar</span>
          </button>
        </div>
      </div>

      {/* Mini progress bar */}
      {playing && (
        <div className="mt-3 h-1 rounded-full bg-muted/30 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-gold/80 to-gold transition-all duration-150 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}
