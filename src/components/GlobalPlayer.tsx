import { Play, Pause, X, Download, SkipBack, SkipForward, Music } from "lucide-react";
import { usePlayer } from "@/hooks/use-player";
import { useQuery } from "@tanstack/react-query";
import { checkBuyerAccess } from "@/lib/access.functions";

export function GlobalPlayer() {
  const {
    currentTrack, playing, progress, currentTime, duration,
    queue, queueIndex,
    pause, play, toggle, seek, stop, next, previous,
  } = usePlayer();

  const { data: accessData } = useQuery({
    queryKey: ["buyer-access"],
    queryFn: () => checkBuyerAccess(),
    staleTime: 5 * 60 * 1000,
  });

  const canDownload = accessData?.canDownload !== false;

  if (!currentTrack) return null;

  const hasQueue = queue.length > 1;

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = currentTrack.downloadUrl;
    link.download = `${currentTrack.title}.mp3`;
    link.click();
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = ((e.clientX - rect.left) / rect.width) * 100;
    seek(Math.max(0, Math.min(100, pct)));
  };

  const formatSecs = (secs: number) => {
    if (!secs || !isFinite(secs)) return "0:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${String(s).padStart(2, "0")}`;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-2xl border-t border-border/25 pb-[env(safe-area-inset-bottom,0px)]">
      {/* Progress bar — touch-friendly height on mobile */}
      <div
        className="h-1.5 sm:h-1 w-full bg-muted/10 cursor-pointer group relative"
        onClick={handleProgressClick}
      >
        <div
          className="h-full bg-gradient-to-r from-gold/40 via-gold/70 to-gold/50 transition-all duration-150 ease-linear relative"
          style={{ width: `${progress}%` }}
        >
          <div className="absolute right-0 top-1/2 -translate-y-1/2 h-3 w-3 rounded-full bg-gold opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-lg shadow-gold/30" />
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-6 py-2.5 sm:py-3 max-w-5xl mx-auto">
        {/* Cover + info */}
        <div className="flex items-center gap-2.5 sm:gap-3 flex-1 min-w-0">
          <div className="shrink-0 h-10 w-10 sm:h-11 sm:w-11 rounded-lg overflow-hidden bg-card/20 border border-border/25 shadow-md">
            {currentTrack.coverUrl ? (
              <img src={currentTrack.coverUrl} alt={currentTrack.title} className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-gold/5 to-transparent">
                <Music className="h-4 w-4 text-muted-foreground/60" />
              </div>
            )}
          </div>

          <div className="min-w-0">
            <p className="text-[12px] sm:text-[13px] font-semibold text-foreground/80 truncate leading-tight">
              {currentTrack.title}
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[9px] sm:text-[10px] text-muted-foreground/60">{currentTrack.category}</span>
              {hasQueue && (
                <>
                  <span className="text-[9px] sm:text-[10px] text-border/20">·</span>
                  <span className="text-[9px] sm:text-[10px] text-gold/40 tabular-nums">{queueIndex + 1}/{queue.length}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Time */}
        <div className="hidden sm:flex items-center gap-1 text-[10px] text-muted-foreground/60 tabular-nums shrink-0">
          <span>{formatSecs(currentTime)}</span>
          <span className="text-border/15">/</span>
          <span>{duration > 0 ? formatSecs(duration) : currentTrack.duration}</span>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-0 sm:gap-0.5 shrink-0">
          {hasQueue && (
            <button
              onClick={previous}
              className="flex h-9 w-9 sm:h-8 sm:w-8 items-center justify-center rounded-lg text-muted-foreground/60 hover:text-foreground/60 transition-colors duration-300 active:scale-90"
            >
              <SkipBack className="h-3.5 w-3.5" />
            </button>
          )}

          <button
            onClick={() => toggle(currentTrack)}
            className={`flex h-11 w-11 sm:h-10 sm:w-10 items-center justify-center rounded-full transition-all duration-300 active:scale-90 ${
              playing
                ? "bg-gold/80 text-gold-foreground shadow-lg shadow-gold/20"
                : "bg-gold/15 text-gold/70 hover:bg-gold/25"
            }`}
          >
            {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
          </button>

          {hasQueue && (
            <button
              onClick={next}
              className="flex h-9 w-9 sm:h-8 sm:w-8 items-center justify-center rounded-lg text-muted-foreground/60 hover:text-foreground/60 transition-colors duration-300 active:scale-90"
            >
              <SkipForward className="h-3.5 w-3.5" />
            </button>
          )}

          {canDownload && (
            <button
              onClick={handleDownload}
              className="hidden sm:flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground/50 hover:text-gold/40 transition-colors duration-300 ml-1"
            >
              <Download className="h-3.5 w-3.5" />
            </button>
          )}

          <button
            onClick={stop}
            className="flex h-8 w-8 sm:h-7 sm:w-7 items-center justify-center rounded-lg text-muted-foreground/50 hover:text-muted-foreground/70 transition-colors duration-300 active:scale-90"
          >
            <X className="h-3.5 w-3.5 sm:h-3 sm:w-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
