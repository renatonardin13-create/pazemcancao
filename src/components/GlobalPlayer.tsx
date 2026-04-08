import { useEffect } from "react";
import { Play, Pause, X, Download, Music, SkipBack, SkipForward } from "lucide-react";
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

  const formatTime = (pct: number, duration: string) => {
    const parts = duration.split(":").map(Number);
    const totalSecs = (parts[0] || 0) * 60 + (parts[1] || 0);
    const currentSecs = Math.floor((pct / 100) * totalSecs);
    const m = Math.floor(currentSecs / 60);
    const s = currentSecs % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-2xl shadow-[0_-8px_40px_-10px_rgba(0,0,0,0.5)]">
      {/* Progress bar */}
      <div
        className="h-[2px] w-full bg-muted/10 cursor-pointer group relative"
        onClick={handleProgressClick}
      >
        <div
          className="h-full bg-gradient-to-r from-gold/50 via-gold/80 to-gold/60 transition-all duration-150 ease-linear relative"
          style={{ width: `${progress}%` }}
        >
          <div className="absolute right-0 top-1/2 -translate-y-1/2 h-3 w-3 rounded-full bg-gold/80 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg shadow-gold/30 border-2 border-background" />
        </div>
      </div>

      {/* Whisper gold line */}
      <div className="h-px bg-gradient-to-r from-transparent via-gold/8 to-transparent" />

      <div className="flex items-center gap-3 sm:gap-4 px-4 sm:px-6 py-3 max-w-5xl mx-auto">
        {/* Track info */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className={`flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl border transition-all duration-500 ${
            playing
              ? "bg-gold/10 border-gold/15"
              : "bg-muted/10 border-border/20"
          }`}>
            {playing ? (
              <div className="flex items-center gap-[2px]">
                <div className="w-[2px] h-2 bg-gold/70 rounded-full animate-pulse" />
                <div className="w-[2px] h-3 bg-gold/70 rounded-full animate-pulse" style={{ animationDelay: '0.15s' }} />
                <div className="w-[2px] h-1.5 bg-gold/70 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }} />
              </div>
            ) : (
              <Music className="h-4 w-4 text-muted-foreground/30" />
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-foreground/85 truncate leading-tight">
              {currentTrack.title}
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              <p className="text-[10px] text-muted-foreground/35 truncate">
                {currentTrack.category}
              </p>
              <span className="text-[10px] text-muted-foreground/20">·</span>
              <p className="text-[10px] text-muted-foreground/30 tabular-nums">
                {formatTime(progress, currentTrack.duration)} / {currentTrack.duration}
              </p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
          <button
            onClick={prevTrack}
            className="hidden sm:flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground/30 hover:text-foreground/60 hover:bg-muted/10 transition-all duration-500 active:scale-90"
          >
            <SkipBack className="h-4 w-4" />
          </button>

          <button
            onClick={() => toggle(currentTrack)}
            className={`flex h-11 w-11 items-center justify-center rounded-full transition-all duration-500 active:scale-90 ${
              playing
                ? "bg-gold/90 text-gold-foreground shadow-lg shadow-gold/20"
                : "bg-gold/10 text-gold/70 hover:bg-gold/20 border border-gold/15"
            }`}
          >
            {playing ? <Pause className="h-4.5 w-4.5" /> : <Play className="h-4.5 w-4.5 ml-0.5" />}
          </button>

          <button
            onClick={nextTrack}
            className="hidden sm:flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground/30 hover:text-foreground/60 hover:bg-muted/10 transition-all duration-500 active:scale-90"
          >
            <SkipForward className="h-4 w-4" />
          </button>

          <div className="w-px h-4 bg-border/15 mx-1 hidden sm:block" />

          <button
            onClick={handleDownload}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground/25 hover:text-gold/60 hover:bg-gold/8 transition-all duration-500 active:scale-95"
          >
            <Download className="h-4 w-4" />
          </button>

          <button
            onClick={stop}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground/20 hover:text-foreground/50 hover:bg-muted/10 transition-all duration-500 active:scale-95"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
