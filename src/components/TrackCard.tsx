import { Play, Pause, Download, Music } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import type { Track } from "@/lib/sample-tracks";
import { usePlayer } from "@/hooks/use-player";

interface TrackCardProps {
  track: Track;
  index: number;
}

const categoryGradients: Record<string, string> = {
  Paz: "from-sky-900/40 via-blue-950/30 to-slate-950/50",
  Cura: "from-amber-900/35 via-yellow-950/25 to-stone-950/50",
  Força: "from-orange-900/35 via-red-950/25 to-stone-950/50",
  Oração: "from-violet-900/35 via-purple-950/25 to-slate-950/50",
  Madrugada: "from-indigo-900/40 via-slate-950/30 to-zinc-950/50",
  Presença: "from-emerald-900/35 via-teal-950/25 to-slate-950/50",
  Refúgio: "from-stone-800/35 via-zinc-900/30 to-neutral-950/50",
};

const categoryEmojis: Record<string, string> = {
  Paz: "🕊️",
  Cura: "💛",
  Força: "🔥",
  Oração: "🙏",
  Madrugada: "🌙",
  Presença: "✨",
  Refúgio: "🏔️",
};

export function TrackCard({ track, index }: TrackCardProps) {
  const { currentTrack, playing, progress, toggle } = usePlayer();
  const isThis = currentTrack?.id === track.id;
  const isPlaying = isThis && playing;

  const gradient = categoryGradients[track.category] || categoryGradients["Paz"];

  const handlePlay = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggle(track);
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const link = document.createElement("a");
    link.href = track.downloadUrl;
    link.download = `${String(track.id).padStart(2, "0")} - ${track.title}.mp3`;
    link.click();
  };

  return (
    <Link
      to="/louvor/$trackId"
      params={{ trackId: String(track.id) }}
      className="group relative cursor-pointer h-full block"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.08, ease: "easeOut" }}
        whileHover={{ scale: 1.03, y: -4 }}
        whileTap={{ scale: 0.98 }}
        className={`relative rounded-3xl border transition-all duration-700 overflow-hidden h-full flex flex-col ${
          isPlaying
            ? "border-gold/25 shadow-[0_8px_50px_-12px] shadow-gold/15"
            : "border-border/8 shadow-[0_4px_30px_-10px] shadow-black/20 hover:border-gold/15 hover:shadow-[0_8px_40px_-10px] hover:shadow-gold/8"
        } bg-card/10`}
      >
        {/* Cover image area */}
        <div className={`relative h-40 sm:h-44 w-full bg-gradient-to-br ${gradient} overflow-hidden`}>
          {/* Texture overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_40%,transparent_30%,rgba(0,0,0,0.4))]" />
          {/* Soft glow on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/[0.03] to-white/[0.06] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

          {/* Floating icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className={`flex h-16 w-16 items-center justify-center rounded-2xl backdrop-blur-sm transition-all duration-700 ${
              isPlaying
                ? "bg-gold/15 border border-gold/25 scale-110"
                : "bg-white/[0.04] border border-white/[0.06] group-hover:scale-105 group-hover:bg-white/[0.07]"
            }`}>
              <Music className={`h-7 w-7 transition-colors duration-500 ${
                isPlaying ? "text-gold/70" : "text-white/25 group-hover:text-white/40"
              }`} />
            </div>
          </div>

          {/* Track number */}
          <span className="absolute top-4 left-5 text-[10px] font-bold tracking-[0.3em] text-white/15">
            {String(track.id).padStart(2, "0")}
          </span>

          {/* Category badge */}
          <span className="absolute top-4 right-4 text-[9px] font-medium tracking-[0.2em] uppercase rounded-full bg-black/20 backdrop-blur-sm border border-white/[0.06] px-3 py-1 text-white/30">
            {categoryEmojis[track.category] || ""} {track.category}
          </span>

          {/* Playing indicator */}
          {isPlaying && (
            <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-gold/10 to-transparent" />
          )}
        </div>

        {/* Content */}
        <div className="relative p-5 sm:p-6 flex flex-col flex-1">
          {/* Title */}
          <h3
            className={`font-display text-[16px] sm:text-[17px] font-bold tracking-tight leading-snug transition-colors duration-500 ${
              isPlaying
                ? "text-gold/85"
                : "text-foreground/85 group-hover:text-foreground"
            }`}
          >
            {track.title}
          </h3>

          {/* Description */}
          <p
            className={`mt-2.5 text-[12px] leading-[1.9] line-clamp-2 transition-colors duration-500 flex-1 ${
              isPlaying
                ? "text-muted-foreground/50"
                : "text-muted-foreground/35 group-hover:text-muted-foreground/45"
            }`}
          >
            {track.description}
          </p>

          {/* Duration */}
          <p
            className={`mt-3 text-[10px] tracking-[0.15em] font-medium transition-colors duration-500 ${
              isPlaying ? "text-gold/40" : "text-muted-foreground/20"
            }`}
          >
            {track.duration}
          </p>

          {/* Progress bar */}
          {isPlaying && (
            <div className="mt-3 h-[2px] rounded-full bg-muted/8 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-gold/30 via-gold/55 to-gold/35 transition-all duration-200 ease-linear"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}

          {/* Actions */}
          <div
            className={`mt-4 pt-3.5 border-t border-border/6 flex items-center gap-3 transition-all duration-500 ${
              isPlaying ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            }`}
          >
            <button
              onClick={handlePlay}
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
                  Ouvir Agora
                </>
              )}
            </button>

            <span className="w-px h-3 bg-border/8" />

            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-2 text-[10px] font-semibold tracking-[0.2em] uppercase text-muted-foreground/20 hover:text-gold/45 transition-colors duration-500"
            >
              <Download className="h-3 w-3" />
              Baixar Louvor
            </button>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
