import { Play, Pause, X, Download, SkipBack, SkipForward, Music, Volume2, ListMusic } from "lucide-react";
import { memo, useState, useEffect } from "react";
import { usePlayer } from "@/hooks/use-player";
import { useQuery } from "@tanstack/react-query";
import { checkBuyerAccess } from "@/lib/access.functions";
import { motion, AnimatePresence } from "framer-motion";

export const GlobalPlayer = memo(function GlobalPlayer() {
  const {
    currentTrack, nextTrack, playing, progress, currentTime, duration,
    queue, queueIndex,
    pause, play, toggle, seek, stop, next, previous,
  } = usePlayer();

  const [isExpanded, setIsExpanded] = useState(false);

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
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-4xl"
      >
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-black/40 backdrop-blur-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          {/* Main Player Content */}
          <div className="relative z-10 p-3 sm:p-4">
            <div className="flex items-center gap-4">
              {/* Cover Art */}
              <div className="relative group shrink-0">
                <div className="h-12 w-12 sm:h-14 sm:w-14 overflow-hidden rounded-2xl border border-white/10 shadow-2xl">
                  {currentTrack.coverUrl ? (
                    <img 
                      src={currentTrack.coverUrl} 
                      alt={currentTrack.title} 
                      className={`h-full w-full object-cover transition-transform duration-700 ${playing ? 'scale-110' : 'scale-100'}`}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gold/20 to-black">
                      <Music className="h-6 w-6 text-gold/40" />
                    </div>
                  )}
                </div>
                {playing && (
                  <div className="absolute -bottom-1 -right-1 flex gap-0.5 h-4 items-end bg-black/60 backdrop-blur-md rounded-full px-1.5 py-1 border border-white/10">
                    {[1, 2, 3].map((i) => (
                      <motion.div
                        key={i}
                        animate={{ height: ["20%", "100%", "20%"] }}
                        transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.1 }}
                        className="w-0.5 bg-gold"
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="text-sm sm:text-base font-bold text-white truncate group-hover:text-gold transition-colors">
                  {currentTrack.title}
                </h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] sm:text-xs font-medium text-white/40 uppercase tracking-wider truncate">
                    {currentTrack.category}
                  </span>
                  {hasQueue && (
                    <span className="text-[10px] sm:text-xs text-gold/60 tabular-nums">
                      {queueIndex + 1} de {queue.length}
                    </span>
                  )}
                </div>
              </div>

              {/* Desktop Controls */}
              <div className="hidden md:flex items-center gap-4">
                <div className="flex flex-col items-center gap-1 min-w-[300px]">
                  <div className="flex items-center gap-6">
                    <button onClick={previous} disabled={!hasQueue} className="text-white/40 hover:text-white transition-colors disabled:opacity-20">
                      <SkipBack className="h-5 w-5 fill-current" />
                    </button>
                    <button 
                      onClick={() => toggle(currentTrack)}
                      className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-black hover:scale-105 active:scale-95 transition-all shadow-xl shadow-white/10"
                    >
                      {playing ? <Pause className="h-6 w-6 fill-current" /> : <Play className="h-6 w-6 fill-current ml-1" />}
                    </button>
                    <button onClick={next} disabled={!hasQueue} className="text-white/40 hover:text-white transition-colors disabled:opacity-20">
                      <SkipForward className="h-5 w-5 fill-current" />
                    </button>
                  </div>
                  
                  {/* Progress Bar Container */}
                  <div className="w-full flex items-center gap-3">
                    <span className="text-[10px] tabular-nums text-white/40 min-w-[35px] text-right">
                      {formatSecs(currentTime)}
                    </span>
                    <div 
                      className="flex-1 h-1.5 bg-white/10 rounded-full cursor-pointer relative group/progress"
                      onClick={handleProgressClick}
                    >
                      <motion.div 
                        className="absolute inset-y-0 left-0 bg-gold rounded-full"
                        style={{ width: `${progress}%` }}
                      />
                      <div className="absolute top-1/2 -translate-y-1/2 h-3 w-3 rounded-full bg-white opacity-0 group-hover/progress:opacity-100 transition-opacity shadow-lg" style={{ left: `calc(${progress}% - 6px)` }} />
                    </div>
                    <span className="text-[10px] tabular-nums text-white/40 min-w-[35px]">
                      {duration > 0 ? formatSecs(duration) : currentTrack.duration}
                    </span>
                  </div>
                </div>
              </div>

              {/* Mobile Controls / Right Actions */}
              <div className="flex items-center gap-2 sm:gap-4">
                <div className="flex md:hidden items-center gap-3">
                   <button 
                    onClick={() => toggle(currentTrack)}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-black active:scale-95 transition-all"
                  >
                    {playing ? <Pause className="h-5 w-5 fill-current" /> : <Play className="h-5 w-5 fill-current ml-0.5" />}
                  </button>
                </div>

                <div className="flex items-center gap-1 sm:gap-2">
                  {canDownload && (
                    <button onClick={handleDownload} className="p-2 text-white/40 hover:text-white transition-colors hidden sm:block">
                      <Download className="h-4 w-4" />
                    </button>
                  )}
                  <button onClick={() => setIsExpanded(!isExpanded)} className={`p-2 transition-colors ${isExpanded ? 'text-gold' : 'text-white/40 hover:text-white'}`}>
                    <ListMusic className="h-4 w-4" />
                  </button>
                  <button onClick={stop} className="p-2 text-white/40 hover:text-white transition-colors">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Mobile Progress Bar (Compact) */}
            <div 
              className="md:hidden mt-3 h-1 bg-white/5 rounded-full overflow-hidden cursor-pointer"
              onClick={handleProgressClick}
            >
              <motion.div 
                className="h-full bg-gold"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Queue Expansion */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="border-t border-white/5 bg-white/[0.02]"
              >
                <div className="p-4 max-h-[300px] overflow-y-auto custom-scrollbar">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-white/60">Fila de Reprodução</h4>
                    {nextTrack && (
                      <span className="text-[10px] text-gold/60">Próxima: {nextTrack.title}</span>
                    )}
                  </div>
                  <div className="space-y-1">
                    {queue.map((track, idx) => (
                      <button
                        key={`${track.id}-${idx}`}
                        onClick={() => toggle(track, queue)}
                        className={`w-full flex items-center gap-3 p-2 rounded-xl transition-all ${
                          currentTrack.id === track.id 
                            ? "bg-gold/10 text-gold shadow-lg shadow-gold/5" 
                            : "text-white/40 hover:bg-white/5 hover:text-white"
                        }`}
                      >
                        <span className="text-[10px] font-medium w-4">{idx + 1}</span>
                        <div className="h-8 w-8 rounded-lg overflow-hidden shrink-0 border border-white/5">
                          <img src={track.coverUrl} alt="" className="h-full w-full object-cover" />
                        </div>
                        <div className="flex-1 text-left min-w-0">
                          <p className="text-xs font-semibold truncate">{track.title}</p>
                          <p className="text-[10px] opacity-60 truncate">{track.category}</p>
                        </div>
                        <span className="text-[10px] opacity-40">{track.duration}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </AnimatePresence>
  );
});
