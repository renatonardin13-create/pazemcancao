import { useEffect } from "react";
import { Play, Pause, X, Download, Music, SkipBack, SkipForward } from "lucide-react";
import { usePlayer } from "@/hooks/use-player";
import { sampleTracks } from "@/lib/sample-tracks";

export function GlobalPlayer() {
  const { currentTrack, playing, progress, pause, play, toggle, setProgress, stop } = usePlayer();

  useEffect(() => {
    if (!playing) return;
    const interval = setInterval(() => {
      setProgress((prev: number) => {
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

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-gold/15 bg-card/95 backdrop-blur-xl shadow-[0_-8px_40px_-10px_rgba(0,0,0,0.5)]">
      {/* Progress bar — clickable */}
      <div
        className="h-1 w-full bg-muted/30 cursor-pointer group"
        onClick={handleProgressClick}
      >
        <div
          className="h-full bg-gradient-to-r from-gold/70 to-gold transition-all duration-150 ease-linear relative"
          style={{ width: `${progress}%` }}
        >
          <div className="absolute right-0 top-1/2 -translate-y-1/2 h-3 w-3 rounded-full bg-gold opacity-0 group-hover:opacity-100 transition-opacity shadow-lg shadow-gold/30" />
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-4 px-4 sm:px-6 py-3 sm:py-3.5 max-w-5xl mx-auto">
        {/* Track info */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl bg-gold/10 border border-gold/20">
            <Music className="h-4 w-4 sm:h-5 sm:w-5 text-gold" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">
              {currentTrack.title}
            </p>
            <p className="text-[11px] text-muted-foreground/60 truncate">
              {currentTrack.category} · {currentTrack.duration}
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          <button
            onClick={prevTrack}
            className="hidden sm:flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-all active:scale-90"
          >
            <SkipBack className="h-4 w-4" />
          </button>

          <button
            onClick={() => toggle(currentTrack)}
            className={`flex h-11 w-11 sm:h-10 sm:w-10 items-center justify-center rounded-xl transition-all duration-300 active:scale-90 ${
              playing
                ? "bg-gold text-gold-foreground shadow-lg shadow-gold/25"
                : "bg-gold/15 text-gold hover:bg-gold/25"
            }`}
          >
            {playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
          </button>

          <button
            onClick={nextTrack}
            className="hidden sm:flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-all active:scale-90"
          >
            <SkipForward className="h-4 w-4" />
          </button>

          <button
            onClick={handleDownload}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:text-gold hover:bg-gold/10 transition-all active:scale-95"
          >
            <Download className="h-4 w-4" />
          </button>

          <button
            onClick={stop}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground/50 hover:text-foreground hover:bg-muted/40 transition-all active:scale-95"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
