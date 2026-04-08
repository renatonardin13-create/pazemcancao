import { useState, useRef, useEffect } from "react";
import { Play, Pause, Download, Music, Volume2 } from "lucide-react";
import { motion } from "framer-motion";
import type { Track } from "@/lib/sample-tracks";

interface TrackCardProps {
  track: Track;
  index: number;
}

const categoryColors: Record<string, string> = {
  Paz: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  Cura: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  Força: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  Oração: "bg-violet-500/10 text-violet-500 border-violet-500/20",
  Madrugada: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
  Presença: "bg-rose-500/10 text-rose-500 border-rose-500/20",
  Refúgio: "bg-teal-500/10 text-teal-500 border-teal-500/20",
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

  // Simulate progress when playing
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.5, ease: "easeOut" }}
      className="group relative rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm p-4 sm:p-5 transition-all duration-300 hover:bg-card hover:shadow-[0_8px_30px_-12px_rgba(0,0,0,0.12)] hover:border-gold/20"
    >
      {/* Progress bar background */}
      {playing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none"
        >
          <div
            className="h-full bg-gold/[0.04] transition-all duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </motion.div>
      )}

      <div className="relative flex items-center gap-3 sm:gap-4">
        {/* Track number — desktop */}
        <span className="hidden sm:flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-muted/60 text-sm font-bold text-muted-foreground font-display">
          {String(track.id).padStart(2, "0")}
        </span>

        {/* Play button */}
        <button
          onClick={togglePlay}
          className={`flex h-12 w-12 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl transition-all duration-200 ${
            playing
              ? "bg-gold text-gold-foreground shadow-lg shadow-gold/20 scale-105"
              : "bg-gold/10 text-gold hover:bg-gold/20 hover:scale-105"
          }`}
        >
          {playing ? (
            <Pause className="h-4.5 w-4.5" />
          ) : (
            <Play className="h-4.5 w-4.5 ml-0.5" />
          )}
        </button>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {playing && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="shrink-0"
              >
                <Volume2 className="h-3.5 w-3.5 text-gold animate-pulse" />
              </motion.div>
            )}
            <h3 className={`text-sm sm:text-base font-semibold truncate transition-colors ${playing ? "text-gold" : "text-foreground"}`}>
              {track.title}
            </h3>
          </div>
          <div className="mt-1.5 flex items-center gap-2 flex-wrap">
            <span
              className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] sm:text-[11px] font-medium ${
                categoryColors[track.category] || "bg-muted text-muted-foreground border-border"
              }`}
            >
              <span className="text-[10px]">{categoryIcons[track.category]}</span>
              {track.category}
            </span>
            <span className="text-xs text-muted-foreground/70">{track.duration}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Ouvir — mobile-friendly large tap target */}
          <button
            onClick={togglePlay}
            className="flex h-10 sm:h-9 items-center gap-1.5 rounded-xl px-3 sm:px-4 text-xs font-medium text-muted-foreground transition-all hover:bg-gold/10 hover:text-gold active:scale-95"
          >
            <Music className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Ouvir</span>
          </button>
          {/* Baixar */}
          <button className="flex h-10 sm:h-9 items-center gap-1.5 rounded-xl px-3 sm:px-4 text-xs font-medium text-muted-foreground transition-all hover:bg-gold/10 hover:text-gold active:scale-95">
            <Download className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Baixar</span>
          </button>
        </div>
      </div>

      {/* Mini progress bar */}
      {playing && (
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          className="mt-3 h-1 rounded-full bg-muted/50 overflow-hidden origin-left"
        >
          <div
            className="h-full rounded-full bg-gold/60 transition-all duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </motion.div>
      )}
    </motion.div>
  );
}
