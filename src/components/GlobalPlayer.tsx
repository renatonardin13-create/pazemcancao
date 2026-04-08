import { useEffect } from "react";
import { Play, Pause, X, Download, SkipBack, SkipForward } from "lucide-react";
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
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/85 backdrop-blur-2xl">
      {/* Progress — gentle, clickable */}
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
        {/* Track info — quiet, present */}
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold text-foreground/75 truncate leading-tight">
            {currentTrack.title}
          </p>
          <p className="mt-1 text-[10px] text-muted-foreground/25 tracking-wider">
            {currentTrack.category}
            <span className="mx-1.5">·</span>
            <span className="tabular-nums">{formatTime(progress, currentTrack.duration)}</span>
            <span className="mx-1 text-border/15">/</span>
            <span className="tabular-nums">{currentTrack.duration}</span>
          </p>
        </div>

        {/* Controls — moment of pause */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={prevTrack}
            className="hidden sm:flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground/20 hover:text-muted-foreground/45 transition-all duration-500"
          >
            <SkipBack className="h-3.5 w-3.5" />
          </button>

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
            onClick={nextTrack}
            className="hidden sm:flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground/20 hover:text-muted-foreground/45 transition-all duration-500"
          >
            <SkipForward className="h-3.5 w-3.5" />
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
