import { Play, Pause, X, Download, SkipBack, SkipForward, Music } from "lucide-react";
import { usePlayer } from "@/hooks/use-player";

export function GlobalPlayer() {
  const { currentTrack, playing, progress, currentTime, duration, pause, play, toggle, seek, stop } = usePlayer();

  if (!currentTrack) return null;

  const handleDownload = async () => {
    try {
      const response = await fetch(currentTrack.downloadUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = currentTrack.title.replace(/[\/\\:*?"<>|]/g, "-") + ".mp3";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch {
      window.open(currentTrack.downloadUrl, "_blank");
    }
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
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/85 backdrop-blur-2xl">
      {/* Progress — clickable */}
      <div
        className="h-[1.5px] w-full bg-muted/6 cursor-pointer group relative"
        onClick={handleProgressClick}
      >
        <div
          className="h-full bg-gradient-to-r from-gold/35 via-gold/60 to-gold/40 transition-all duration-200 ease-linear relative"
          style={{ width: `${progress}%` }}
        >
          <div className="absolute right-0 top-1/2 -translate-y-1/2 h-2.5 w-2.5 rounded-full bg-gold/60 opacity-0 group-hover:opacity-100 transition-opacity duration-500 border border-background" />
        </div>
      </div>

      <div className="flex items-center gap-4 px-5 sm:px-8 py-4 max-w-5xl mx-auto">
        {/* Cover + Track info */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Cover image */}
          <div className="shrink-0 h-10 w-10 rounded-lg overflow-hidden bg-card/20 border border-border/10">
            {currentTrack.coverUrl ? (
              <img
                src={currentTrack.coverUrl}
                alt={currentTrack.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center">
                <Music className="h-4 w-4 text-muted-foreground/20" />
              </div>
            )}
          </div>

          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-foreground/75 truncate leading-tight">
              {currentTrack.title}
            </p>
            <p className="mt-1 text-[10px] text-muted-foreground/25 tracking-wider">
              {currentTrack.category}
              <span className="mx-1.5">·</span>
              <span className="tabular-nums">{formatSecs(currentTime)}</span>
              <span className="mx-1 text-border/15">/</span>
              <span className="tabular-nums">{duration > 0 ? formatSecs(duration) : currentTrack.duration}</span>
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => toggle(currentTrack)}
            className={`flex h-10 w-10 items-center justify-center rounded-full transition-all duration-500 ${
              playing
                ? "bg-gold/80 text-gold-foreground"
                : "bg-gold/10 text-gold/60 hover:bg-gold/20"
            }`}
          >
            {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 ml-0.5" />}
          </button>

          <button
            onClick={handleDownload}
            className="hidden sm:flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground/15 hover:text-gold/35 transition-all duration-500 ml-1"
          >
            <Download className="h-3.5 w-3.5" />
          </button>

          <button
            onClick={stop}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground/15 hover:text-muted-foreground/35 transition-all duration-500"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
