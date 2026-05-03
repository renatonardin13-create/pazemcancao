import { Play, Pause, Download, Music, Lock, Clock, Gift } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { memo, useState } from "react";
import type { Track } from "@/lib/sample-tracks";
import { usePlayer } from "@/hooks/use-player";
import { motion, AnimatePresence } from "framer-motion";
import { getTrackReleaseMeta } from "@/lib/track-release";
import { PosterCard } from "@/components/PosterCard";
import { UnlockModal } from "@/components/UnlockModal";

interface TrackCardProps {
  track: Track;
  index: number;
  /** Lista de contexto p/ auto-next ao terminar a faixa. */
  queue?: Track[];
}

const categoryGradients: Record<string, string> = {
  Paz: "from-stone-900/45 via-zinc-950/35 to-neutral-950/55",
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

export const TrackCard = memo(function TrackCard({ track, index, queue }: TrackCardProps) {
  const { currentTrack, playing, progress, toggle } = usePlayer();
  const [unlockOpen, setUnlockOpen] = useState(false);
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
    toggle(track, queue);
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

  const fallback = (
    <div
      className={`flex h-16 w-16 items-center justify-center rounded-2xl border backdrop-blur-sm transition-all duration-700 ${
        isPlaying
          ? "border-orange-500/50 bg-orange-500/20 scale-110 shadow-[0_0_20px_rgba(249,115,22,0.3)]"
          : "border-white/[0.06] bg-white/[0.04] md:group-hover/card:scale-105 md:group-hover/card:bg-white/[0.07]"
      }`}
    >
      <Music
        className={`h-7 w-7 transition-colors duration-500 ${
          isPlaying ? "text-orange-500" : "text-white/25 md:group-hover/card:text-white/40"
        }`}
      />
      {isPlaying && (
        <div className="absolute inset-0 rounded-2xl border border-orange-500/50 animate-ping opacity-20" />
      )}
    </div>
  );

  const badgeTopLeft = isComingSoon ? (
    <span className="inline-flex items-center gap-1 rounded-full border border-sky-300/20 bg-sky-500/20 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide text-white backdrop-blur-sm sm:text-[10px]">
      <Clock className="h-2.5 w-2.5" />
      {releaseText || "Em breve"}
    </span>
  ) : isPremiumLocked ? (
    <span className="inline-flex items-center gap-1 rounded-full border border-orange-500/20 bg-gradient-to-r from-orange-500/95 to-red-500/90 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide text-white shadow-lg shadow-black/30 backdrop-blur-sm sm:text-[10px]">
      <Lock className="h-2.5 w-2.5" />
      Premium
    </span>
  ) : null;

  const badgeTopRight =
    track.isBonus && !isComingSoon ? (
      <span className="inline-flex items-center gap-1 rounded-full border border-white/[0.06] bg-black/25 px-2.5 py-1 text-[9px] font-medium uppercase tracking-[0.15em] text-white/35 backdrop-blur-md sm:text-[10px]">
        <Gift className="h-2.5 w-2.5" />
        Bônus
      </span>
    ) : undefined;

  const actionTopRight =
    isPlaying && !isRestricted ? (
      <div className="flex h-7 w-7 items-center justify-center rounded-full border border-orange-500/30 bg-orange-500/20 backdrop-blur-sm animate-pulse">
        <Music className="h-3 w-3 text-gold/80" />
      </div>
    ) : undefined;

  const overlay = isRestricted ? (
    <div className="flex h-full flex-col items-center justify-center gap-2.5 bg-black/25 backdrop-blur-[2px]">
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
  ) : undefined;

  const centerAction = !isRestricted ? (
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
  ) : undefined;

  const meta = !isRestricted ? (
    <>
      <span className="text-[9px] font-medium tracking-wider text-white/40 sm:text-[10px]">
        {track.duration}
      </span>
      <button
        onClick={handleDownload}
        className="inline-flex items-center gap-1 text-[9px] font-semibold uppercase tracking-[0.15em] text-gold/55 transition-colors duration-500 hover:text-gold/80 sm:text-[10px]"
      >
        <Download className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
        Baixar
      </button>
    </>
  ) : undefined;

  if (isPremiumLocked) {
    return (
      <>
        <div
          role="button"
          tabIndex={0}
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setUnlockOpen(true); }}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setUnlockOpen(true); } }}
          className="group/card relative block cursor-pointer"
        >
          <PosterCard
            cover={track.coverUrl}
            coverAlt={track.title}
            fallback={fallback}
            gradientClass={gradient}
            badgeTopLeft={badgeTopLeft}
            badgeTopRight={badgeTopRight}
            overlay={overlay}
            centerAction={centerAction}
            actionTopRight={actionTopRight}
            title=""
            subtitle={undefined}
            meta={meta}
            progress={null}
            locked={isRestricted}
            index={index}
            highlight={isPlaying}
          />
        </div>
        <UnlockModal
          open={unlockOpen}
          onOpenChange={setUnlockOpen}
          title={track.title}
          coverUrl={track.coverUrl}
        />
      </>
    );
  }

  return (
    <div
      onClick={handlePlay}
      className="group/card relative block cursor-pointer"
    >
      <PosterCard
        cover={track.coverUrl}
        coverAlt={track.title}
        fallback={fallback}
        gradientClass={gradient}
        badgeTopLeft={badgeTopLeft}
        badgeTopRight={badgeTopRight}
        overlay={overlay}
        centerAction={centerAction}
        actionTopRight={actionTopRight}
        title=""
        subtitle={undefined}
        meta={meta}
        progress={isPlaying && !isRestricted ? progress : null}
        locked={isRestricted}
        index={index}
        highlight={isPlaying}
      />
    </div>
  );
});
