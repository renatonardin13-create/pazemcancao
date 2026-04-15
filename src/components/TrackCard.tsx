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

  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const response = await fetch(track.downloadUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = track.title.replace(/[\/\\:*?"<>|]/g, "-") + ".mp3";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch {
      window.open(track.downloadUrl, "_blank");
    }
  };

  return (
    <Link
      to="/conteudo/$trackId"
      params={{ trackId: String(track.id) }}
      className="group/card relative cursor-pointer block"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.08, ease: "easeOut" }}
        className="relative"
      >
        {/* Ambient glow */}
        <div className="absolute -inset-4 rounded-3xl bg-gold/0 md:group-hover/card:bg-gold/[0.05] md:transition-all md:duration-700 blur-3xl pointer-events-none" />

        <div className={`relative rounded-[14px] sm:rounded-[16px] overflow-hidden bg-card/5 shadow-md shadow-black/25 ring-1 ring-white/[0.04] md:group-hover/card:shadow-[0_12px_40px_-8px_rgba(0,0,0,0.6)] md:group-hover/card:ring-gold/15 md:transition-all md:duration-500 md:group-hover/card:scale-[1.04]`}>

          {/* Image — vertical poster 9:13 */}
          <div className={`relative aspect-[9/13] overflow-hidden bg-gradient-to-br ${gradient}`}>
            {track.coverUrl ? (
              <img
                src={track.coverUrl}
                alt={track.title}
                className="w-full h-full object-cover md:transition-transform md:duration-[900ms] md:ease-out md:group-hover/card:scale-[1.08]"
                loading="lazy"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className={`flex h-16 w-16 items-center justify-center rounded-2xl backdrop-blur-sm transition-all duration-700 ${
                  isPlaying
                    ? "bg-gold/15 border border-gold/25 scale-110"
                    : "bg-white/[0.04] border border-white/[0.06] md:group-hover/card:scale-105 md:group-hover/card:bg-white/[0.07]"
                }`}>
                  <Music className={`h-7 w-7 transition-colors duration-500 ${
                    isPlaying ? "text-gold/70" : "text-white/25 md:group-hover/card:text-white/40"
                  }`} />
                </div>
              </div>
            )}

            {/* Bottom gradient */}
            <div className="absolute inset-x-0 bottom-0 h-[70%] bg-gradient-to-t from-black/95 via-black/50 to-transparent" />

            {/* Hover darken overlay */}
            <div className="absolute inset-0 bg-black/0 md:group-hover/card:bg-black/30 md:transition-all md:duration-500" />

            {/* Inner vignette */}
            <div className="absolute inset-0 shadow-[inset_0_0_30px_rgba(0,0,0,0.25)] pointer-events-none" />

            {/* Category badge — top left */}
            <span className="absolute top-2.5 left-2.5 z-10 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/25 backdrop-blur-md border border-white/[0.06] text-[9px] sm:text-[10px] font-medium tracking-[0.15em] uppercase text-white/35">
              {categoryEmojis[track.category] || ""} {track.category}
            </span>

            {/* Playing indicator badge — top right */}
            {isPlaying && (
              <div className="absolute top-2.5 right-2.5 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-gold/20 backdrop-blur-sm border border-gold/30 animate-pulse">
                <Music className="h-3 w-3 text-gold/80" />
              </div>
            )}

            {/* Play/Pause button — center on hover */}
            <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
              <button
                onClick={handlePlay}
                className={`flex items-center gap-2 h-auto px-5 py-2.5 sm:px-6 sm:py-3 rounded-full shadow-[0_4px_24px_rgba(0,0,0,0.4)] pointer-events-auto md:transition-all md:duration-500 md:ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  isPlaying
                    ? "bg-gold/95 scale-100 opacity-100"
                    : "bg-gold/95 scale-[0.5] opacity-0 md:group-hover/card:opacity-100 md:group-hover/card:scale-100"
                }`}
              >
                {isPlaying ? (
                  <Pause className="h-4 w-4 sm:h-5 sm:w-5 text-gold-foreground fill-gold-foreground" />
                ) : (
                  <Play className="h-4 w-4 sm:h-5 sm:w-5 text-gold-foreground fill-gold-foreground" />
                )}
              </button>
            </div>

            {/* Title + meta — bottom */}
            <div className="absolute inset-x-0 bottom-0 px-3.5 sm:px-4 pb-4 sm:pb-5 z-10">
              <h3 className="text-sm sm:text-[15px] font-bold text-white line-clamp-2 leading-snug drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] tracking-tight">
                {track.title}
              </h3>

              {track.description && (
                <p className="text-[10px] sm:text-[11px] text-white/35 mt-1.5 line-clamp-2 leading-relaxed">
                  {track.description}
                </p>
              )}

              <div className="flex items-center gap-3 mt-2 opacity-80 md:opacity-0 md:group-hover/card:opacity-100 md:transition-opacity md:duration-400">
                <span className="text-[9px] sm:text-[10px] text-white/40 font-medium tracking-wider">
                  {track.duration}
                </span>

                <button
                  onClick={handleDownload}
                  className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-semibold tracking-[0.15em] uppercase text-gold/55 hover:text-gold/80 transition-colors duration-500"
                >
                  <Download className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                  Baixar
                </button>
              </div>
            </div>

            {/* Progress bar — bottom edge */}
            {isPlaying && (
              <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-white/[0.06] z-20">
                <div
                  className="h-full rounded-r-full bg-gold md:transition-all md:duration-200 ease-linear"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
