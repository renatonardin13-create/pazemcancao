import { useEffect } from "react";
import { Play, Pause, X, Download, Music, SkipBack, SkipForward, Volume2 } from "lucide-react";
import { usePlayer } from "@/hooks/use-player";
import { sampleTracks } from "@/lib/sample-tracks";

export function GlobalPlayer() {
  const { currentTrack, playing, progress, pause, play, toggle, setProgress, stop } = usePlayer();

  useEffect(() => {
    if (!playing) return;
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          pause();
          return 0;
        }
        return prev + 0.5;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [playing, setProgress, pause]);

  if (!currentTrack) return null;

  const currentIndex = sampleTracks.findIndex((t) => t.id === currentTrack.id);

  const prevTrack = () => {
    const idx = currentIndex > 0 ? currentIndex - 1 : sampleTracks.length - 1;
    play(sampleTracks[idx]);
  };

  const nextTrack = () => {
    const idx = currentIndex < sampleTracks.length - 1 ? currentIndex + 1 : 0;
    play(sampleTracks[idx]);
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = currentTrack.downloadUrl;
    link.download = `${String(currentTrack.id).padStart(2, "0")} - ${currentTrack.title}.mp3`;
    link.click();
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = ((e.clientX - rect.left) / rect.width) * 100;
    setProgress(Math.max(0, Math.min(100, pct)));
  };

  // Format fake time from progress
  const formatTime = (pct: number, duration: string) => {
    const parts = duration.split(":").map(Number);
    const totalSecs = (parts[0] || 0) * 60 + (parts[1] || 0);
    const currentSecs = Math.floor((pct / 100) * totalSecs);
    const m = Math.floor(currentSecs / 60);
    const s = currentSecs % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-gold/10 bg-card/90 backdrop-blur-2xl shadow-[0_-12px_60px_-15px_rgba(0,0,0,0.6)]">
      {/* Progress bar — clickable */}
      <div
        className="h-[3px] w-full bg-muted/20 cursor-pointer group relative"
        onClick={handleProgressClick}
      >
        <div
          className="h-full bg-gradient-to-r from-gold/60 via-gold to-gold/90 transition-all duration-150 ease-linear relative"
          style={{ width: `${progress}%` }}
        >
          <div className="absolute right-0 top-1/2 -translate-y-1/2 h-3.5 w-3.5 rounded-full bg-gold opacity-0 group-hover:opacity-100 transition-opacity shadow-lg shadow-gold/40 border-2 border-background" />
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-4 px-4 sm:px-6 py-3 sm:py-3.5 max-w-5xl mx-auto">
        {/* Track info */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className={`flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl border transition-all duration-300 ${
            playing
              ? "bg-gold/15 border-gold/25 shadow-md shadow-gold/10"
              : "bg-muted/20 border-border/30"
          }`}>
            {playing ? (
              <div className="flex items-center gap-[2px]">
                <div className="w-[2.5px] h-2.5 bg-gold rounded-full animate-pulse" />
                <div className="w-[2.5px] h-3.5 bg-gold rounded-full animate-pulse" style={{ animationDelay: '0.15s' }} />
                <div className="w-[2.5px] h-2 bg-gold rounded-full animate-pulse" style={{ animationDelay: '0.3s' }} />
              </div>
            ) : (
              <Music className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground/50" />
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-foreground truncate leading-tight">
              {currentTrack.title}
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              <p className="text-[10px] text-muted-foreground/50 truncate">
                {currentTrack.category}
              </p>
              <span className="text-[10px] text-muted-foreground/30">·</span>
              <p className="text-[10px] text-muted-foreground/40 tabular-nums">
                {formatTime(progress, currentTrack.duration)} / {currentTrack.duration}
              </p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-0.5 sm:gap-1.5 shrink-0">
          <button
            onClick={prevTrack}
            className="hidden sm:flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground/40 hover:text-foreground hover:bg-muted/20 transition-all duration-300 active:scale-90"
          >
            <SkipBack className="h-4 w-4" />
          </button>

          <button
            onClick={() => toggle(currentTrack)}
            className={`flex h-12 w-12 sm:h-11 sm:w-11 items-center justify-center rounded-full transition-all duration-300 active:scale-90 ${
              playing
                ? "bg-gold text-gold-foreground shadow-lg shadow-gold/30"
                : "bg-gold/15 text-gold hover:bg-gold/25 border border-gold/20"
            }`}
          >
            {playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
          </button>

          <button
            onClick={nextTrack}
            className="hidden sm:flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground/40 hover:text-foreground hover:bg-muted/20 transition-all duration-300 active:scale-90"
          >
            <SkipForward className="h-4 w-4" />
          </button>

          <div className="w-px h-5 bg-border/20 mx-1 hidden sm:block" />

          <button
            onClick={handleDownload}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground/40 hover:text-gold hover:bg-gold/10 transition-all duration-300 active:scale-95"
          >
            <Download className="h-4 w-4" />
          </button>

          <button
            onClick={stop}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground/30 hover:text-foreground hover:bg-muted/20 transition-all duration-300 active:scale-95"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
