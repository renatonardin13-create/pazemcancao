import { Play, Pause, Download, Music, Lock, Clock, Gift } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { memo } from "react";
import type { Track } from "@/lib/sample-tracks";
import { usePlayer } from "@/hooks/use-player";
import { OptimizedImage } from "@/components/OptimizedImage";
import { getTrackReleaseMeta } from "@/lib/track-release";

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

function formatReleaseDate(date: string | null | undefined) {
  if (!date) return "";
  return new Date(`${date}T12:00:00.000Z`).toLocaleDateString("pt-BR", {
    timeZone: "America/Sao_Paulo",
  });
}

export const TrackCard = memo(function TrackCard({ track, index }: TrackCardProps) {
  const { currentTrack, playing, progress, toggle } = usePlayer();
  const isThis = currentTrack?.id === track.id;
  const isPlaying = isThis && playing;

  const gradient = categoryGradients[track.category] || categoryGradients.Paz;
  const releaseMeta = getTrackReleaseMeta({
    isBonus: track.isBonus,
    bonusReleaseDate: track.bonusReleaseDate,
  });

  const isPremiumLocked = Boolean(track.isLocked);
  const isComingSoon = releaseMeta.isComingSoon;
  const isRestricted = isPremiumLocked || isComingSoon;
  const releaseText = track.releaseLabel || releaseMeta.label;

  const handlePlay = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isRestricted) return;
    toggle(track);
  };

  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isRestricted) return;

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
      to="/musicas/$trackId"
      params={{ trackId: String(track.id) }}
      className="group/card relative block cursor-pointer"
    >
      <div
        className="relative animate-in fade-in slide-in-from-bottom-4 duration-500"
        style={{ animationDelay: `${Math.min(index * 80, 400)}ms`, animationFillMode: "both" }}
      >
        <div className="absolute -inset-4 rounded-3xl bg-gold/0 md:group-hover/card:bg-gold/[0.05] md:transition-all md:duration-700 blur-3xl pointer-events-none" />

        <div className="relative overflow-hidden rounded-[14px] sm:rounded-[16px] bg-card/5 shadow-md shadow-black/25 ring-1 ring-white/[0.04] md:group-hover/card:shadow-[0_12px_40px_-8px_rgba(0,0,0,0.6)] md:group-hover/card:ring-gold/15 md:transition-all md:duration-500 md:group-hover/card:scale-[1.04]">
          <div className={`relative aspect-[9/13] overflow-hidden bg-gradient-to-br ${gradient}`}>
            {track.coverUrl ? (
              <OptimizedImage
                src={track.coverUrl}
                alt={track.title}
                context="card"
                className={`h-full w-full object-cover md:transition-transform md:duration-[900ms] md:ease-out md:group-hover/card:scale-[1.08] ${
                  isRestricted ? "brightness-[0.6] saturate-[0.7]" : ""
                }`}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className={`flex h-16 w-16 items-center justify-center rounded-2xl border backdrop-blur-sm transition-all duration-700 ${
                  isPlaying
                    ? "border-gold/25 bg-gold/15 scale-110"
                    : "border-white/[0.06] bg-white/[0.04] md:group-hover/card:scale-105 md:group-hover/card:bg-white/[0.07]"
                }`}>
                  <Music className={`h-7 w-7 transition-colors duration-500 ${
                    isPlaying ? "text-gold/70" : "text-white/25 md:group-hover/card:text-white/40"
                  }`} />
                </div>
              </div>
            )}

            <div className="absolute inset-x-0 bottom-0 h-[72%] bg-gradient-to-t from-black/95 via-black/55 to-transparent" />
            <div className={`absolute inset-0 md:transition-all md:duration-500 ${isRestricted ? "bg-black/20" : "bg-black/0 md:group-hover/card:bg-black/30"}`} />
            <div className="absolute inset-0 shadow-[inset_0_0_30px_rgba(0,0,0,0.25)] pointer-events-none" />

            {isComingSoon ? (
              <span className="absolute top-2.5 left-2.5 z-10 inline-flex items-center gap-1 rounded-full border border-sky-300/20 bg-sky-500/20 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide text-white backdrop-blur-sm sm:text-[10px]">
                <Clock className="h-2.5 w-2.5" />
                {releaseText || "Em breve"}
              </span>
            ) : isPremiumLocked ? (
              <span className="absolute top-2.5 left-2.5 z-10 inline-flex items-center gap-1 rounded-full border border-gold/20 bg-gradient-to-r from-gold/95 to-amber-500/90 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide text-gold-foreground shadow-lg shadow-black/30 backdrop-blur-sm sm:text-[10px]">
                <Lock className="h-2.5 w-2.5" />
                Premium
              </span>
            ) : (
              <span className="absolute top-2.5 left-2.5 z-10 inline-flex items-center gap-1 rounded-full border border-white/[0.06] bg-black/25 px-2.5 py-1 text-[9px] font-medium uppercase tracking-[0.15em] text-white/35 backdrop-blur-md sm:text-[10px]">
                {categoryEmojis[track.category] || ""} {track.category}
              </span>
            )}

            {track.isBonus && !isComingSoon && (
              <span className="absolute top-2.5 right-2.5 z-10 inline-flex items-center gap-1 rounded-full border border-white/[0.06] bg-black/25 px-2.5 py-1 text-[9px] font-medium uppercase tracking-[0.15em] text-white/35 backdrop-blur-md sm:text-[10px]">
                <Gift className="h-2.5 w-2.5" />
                Bônus
              </span>
            )}

            {isPlaying && !isRestricted && (
              <div className="absolute top-2.5 right-2.5 z-10 flex h-7 w-7 items-center justify-center rounded-full border border-gold/30 bg-gold/20 backdrop-blur-sm animate-pulse">
                <Music className="h-3 w-3 text-gold/80" />
              </div>
            )}

            {isRestricted ? (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2.5 bg-black/25 backdrop-blur-[2px]">
                <div className="relative">
                  <div className="absolute -inset-3 rounded-full bg-gold/10 blur-xl" />
                  <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-gold/25 bg-gradient-to-br from-gold/20 to-amber-600/10 shadow-lg shadow-gold/10">
                    {isComingSoon ? <Clock className="h-6 w-6 text-gold/70" /> : <Lock className="h-6 w-6 text-gold/70" />}
                  </div>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-gold/60">
                  {isComingSoon ? "Liberação programada" : "Conteúdo Premium"}
                </span>
                <span className="text-center text-[9px] font-medium text-gold/40">
                  {isComingSoon
                    ? `${releaseText || "Em breve"}${releaseMeta.releaseDate ? ` · ${formatReleaseDate(releaseMeta.releaseDate)}` : ""}`
                    : "Toque para ver detalhes"}
                </span>
              </div>
            ) : (
              <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
                <button
                  onClick={handlePlay}
                  className={`pointer-events-auto flex h-auto items-center gap-2 rounded-full px-5 py-2.5 shadow-[0_4px_24px_rgba(0,0,0,0.4)] md:transition-all md:duration-500 md:ease-[cubic-bezier(0.22,1,0.36,1)] ${
                    isPlaying
                      ? "scale-100 bg-gold/95 opacity-100"
                      : "scale-[0.5] bg-gold/95 opacity-0 md:group-hover/card:scale-100 md:group-hover/card:opacity-100"
                  }`}
                >
                  {isPlaying ? (
                    <Pause className="h-4 w-4 fill-gold-foreground text-gold-foreground sm:h-5 sm:w-5" />
                  ) : (
                    <Play className="h-4 w-4 fill-gold-foreground text-gold-foreground sm:h-5 sm:w-5" />
                  )}
                </button>
              </div>
            )}

            <div className="absolute inset-x-0 bottom-0 z-10 px-3.5 pb-4 sm:px-4 sm:pb-5">
              <h3 className="line-clamp-2 text-sm font-bold leading-snug tracking-tight text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] sm:text-[15px]">
                {track.title}
              </h3>

              {track.description && (
                <p className="mt-1.5 line-clamp-2 text-[10px] leading-relaxed text-white/35 sm:text-[11px]">
                  {track.description}
                </p>
              )}

              <div className="mt-2 flex items-center gap-3 opacity-80 md:opacity-0 md:group-hover/card:opacity-100 md:transition-opacity md:duration-400">
                <span className="text-[9px] font-medium tracking-wider text-white/40 sm:text-[10px]">
                  {track.duration}
                </span>

                {!isRestricted && (
                  <button
                    onClick={handleDownload}
                    className="inline-flex items-center gap-1 text-[9px] font-semibold uppercase tracking-[0.15em] text-gold/55 transition-colors duration-500 hover:text-gold/80 sm:text-[10px]"
                  >
                    <Download className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                    Baixar
                  </button>
                )}
              </div>
            </div>

            {isPlaying && !isRestricted && (
              <div className="absolute bottom-0 left-0 right-0 z-20 h-[2.5px] bg-white/[0.06]">
                <div className="h-full rounded-r-full bg-gold ease-linear md:transition-all md:duration-200" style={{ width: `${progress}%` }} />
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
});