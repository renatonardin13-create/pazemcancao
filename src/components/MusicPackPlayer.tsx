import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Play, Pause, Search, Music, ChevronRight, SkipBack, SkipForward, Volume2, Clock } from "lucide-react";
import { listMusicas } from "@/lib/musicas.functions";
import { usePlayer } from "@/hooks/use-player";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import type { Track } from "@/lib/sample-tracks";

interface MusicPackPlayerProps {
  courseId: string;
  courseTitle: string;
}

export function MusicPackPlayer({ courseId, courseTitle }: MusicPackPlayerProps) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("Todas");
  
  const { data, isLoading } = useQuery({
    queryKey: ["product-musicas", courseId],
    queryFn: () => listMusicas({ data: { produto_id: courseId } }),
  });

  const { currentTrack, playing, progress, currentTime, duration, toggle, next, previous, setQueue, seek } = usePlayer();

  const musicas = data?.musicas || [];
  
  const tracks: Track[] = useMemo(() => musicas.map(m => ({
    id: m.id,
    title: m.titulo,
    audioUrl: m.audio_url,
    category: m.categoria || "Geral",
    description: m.artista || "",
    coverUrl: m.capa_url || undefined,
    downloadUrl: m.audio_url,
    duration: "0:00" // We'll get this from metadata
  })), [musicas]);

  const categories = useMemo(() => {
    const cats = new Set(tracks.map(t => t.category));
    return ["Todas", ...Array.from(cats)].filter(Boolean);
  }, [tracks]);

  const filteredTracks = useMemo(() => {
    return tracks.filter(t => {
      const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase()) || 
                           t.category.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = activeCategory === "Todas" || t.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [tracks, search, activeCategory]);

  const handlePlayAll = () => {
    if (filteredTracks.length > 0) {
      setQueue(filteredTracks, 0);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    document.body.classList.add('hide-global-player');
    return () => document.body.classList.remove('hide-global-player');
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="h-12 w-12 border-4 border-gold/20 border-t-gold rounded-full animate-spin" />
        <p className="text-muted-foreground/60 font-medium">Sintonizando louvores...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)] bg-[#0b0b0b] text-white">
      {/* Top Section */}
      <div className="px-6 py-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-[0.3em] text-orange-500/60 mb-1">
              {activeCategory === "Todas" ? "Pack de Louvores" : activeCategory}
            </h2>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight">{courseTitle}</h1>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
              <Input 
                placeholder="Buscar música..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="bg-white/5 border-white/10 pl-10 focus:border-orange-500/30 h-11 rounded-xl"
              />
            </div>
            <Button 
              onClick={handlePlayAll}
              className="bg-orange-500 text-black hover:bg-orange-600 font-bold px-6 h-11 rounded-xl shadow-lg shadow-orange-500/10 transition-all duration-300"
            >
              <Play className="h-4 w-4 mr-2 fill-current" />
              Tocar Tudo
            </Button>
          </div>
        </div>

        {/* Categories Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap border ${
                activeCategory === cat 
                ? "bg-orange-500 text-black border-orange-500 shadow-lg shadow-orange-500/20" 
                : "bg-white/5 text-white/60 border-white/5 hover:bg-white/10 hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid */}
      <div className="flex-1 px-6 pb-32">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {filteredTracks.map((track) => {
            const isCurrent = currentTrack?.id === track.id;
            return (
              <motion.div
                key={track.id}
                whileHover={{ scale: 1.03, y: -5 }}
                className="group relative cursor-pointer"
                onClick={() => toggle(track, filteredTracks)}
              >
                <div className={`aspect-square rounded-2xl overflow-hidden border transition-all duration-300 ${
                  isCurrent ? "border-orange-500 ring-2 ring-orange-500/20 shadow-2xl shadow-orange-500/10" : "border-white/5 group-hover:border-white/20"
                }`}>
                  {track.coverUrl ? (
                    <img src={track.coverUrl} alt={track.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-white/10 to-transparent flex items-center justify-center">
                      <Music className="h-12 w-12 text-white/10" />
                    </div>
                  )}
                  
                  {/* Overlay */}
                  <div className={`absolute inset-0 bg-black/60 flex items-center justify-center transition-opacity duration-300 ${
                    isCurrent || playing ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                  }`}>
                    <div className={`w-14 h-14 rounded-full bg-gold flex items-center justify-center text-black shadow-xl transition-transform duration-300 ${
                      isCurrent ? "scale-100" : "scale-75 group-hover:scale-100"
                    }`}>
                      {isCurrent && playing ? <Pause className="h-6 w-6 fill-current" /> : <Play className="h-6 w-6 fill-current ml-1" />}
                    </div>
                  </div>

                  {/* Title on thumbnail as requested */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black/40 to-transparent">
                    <h3 className={`text-sm font-black tracking-tight line-clamp-2 leading-tight ${isCurrent ? "text-gold" : "text-white"}`}>
                      {track.title}
                    </h3>
                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider mt-1">{track.description}</p>
                  </div>
                </div>
                
                {/* Visualizer if current */}
                {isCurrent && playing && (
                  <div className="absolute top-3 right-3 flex items-end gap-1 h-4">
                    <motion.div animate={{ height: [4, 16, 8, 12, 4] }} transition={{ repeat: Infinity, duration: 0.6 }} className="w-1 bg-gold rounded-full" />
                    <motion.div animate={{ height: [8, 4, 14, 6, 12] }} transition={{ repeat: Infinity, duration: 0.7 }} className="w-1 bg-gold rounded-full" />
                    <motion.div animate={{ height: [12, 8, 4, 16, 8] }} transition={{ repeat: Infinity, duration: 0.5 }} className="w-1 bg-gold rounded-full" />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Global Player */}
      <AnimatePresence>
        {currentTrack && (
          <motion.div 
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="fixed bottom-0 left-0 right-0 bg-[#0B1220]/90 backdrop-blur-2xl border-t border-white/5 px-6 py-4 z-50"
          >
            <div className="max-w-[1400px] mx-auto flex items-center justify-between gap-8">
              {/* Info */}
              <div className="flex items-center gap-4 min-w-[240px] flex-1 lg:flex-none">
                <div className="h-14 w-14 rounded-xl overflow-hidden flex-shrink-0 border border-white/10 shadow-xl">
                  {currentTrack.coverUrl ? (
                    <img src={currentTrack.coverUrl} alt={currentTrack.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-white/5 flex items-center justify-center">
                      <Music className="h-6 w-6 text-white/20" />
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <h4 className="font-black text-sm truncate text-white">{currentTrack.title}</h4>
                  <p className="text-xs text-white/40 font-bold uppercase tracking-wider truncate">{currentTrack.description || currentTrack.category}</p>
                </div>
              </div>

              {/* Controls */}
              <div className="flex flex-col items-center gap-2 flex-1 max-w-xl">
                <div className="flex items-center gap-6">
                  <button onClick={previous} className="text-white/40 hover:text-white transition-colors">
                    <SkipBack className="h-5 w-5 fill-current" />
                  </button>
                  <button 
                    onClick={() => toggle(currentTrack)} 
                    className="h-10 w-10 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-transform"
                  >
                    {playing ? <Pause className="h-5 w-5 fill-current" /> : <Play className="h-5 w-5 fill-current ml-0.5" />}
                  </button>
                  <button onClick={next} className="text-white/40 hover:text-white transition-colors">
                    <SkipForward className="h-5 w-5 fill-current" />
                  </button>
                </div>
                
                <div className="w-full flex items-center gap-3">
                  <span className="text-[10px] font-bold text-white/30 w-10 text-right">{formatTime(currentTime)}</span>
                  <div className="flex-1 group relative">
                    <Progress 
                      value={progress} 
                      className="h-1 bg-white/10" 
                      onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const percent = ((e.clientX - rect.left) / rect.width) * 100;
                        seek(percent);
                      }}
                    />
                    <div 
                      className="absolute top-1/2 -translate-y-1/2 h-3 w-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                      style={{ left: `${progress}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-white/30 w-10">{formatTime(duration)}</span>
                </div>
              </div>

              {/* Extras */}
              <div className="hidden lg:flex items-center justify-end gap-6 min-w-[240px]">
                <div className="flex items-center gap-3 group">
                  <Volume2 className="h-4 w-4 text-white/40 group-hover:text-white transition-colors" />
                  <div className="w-24 h-1 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-white/40 w-2/3" />
                  </div>
                </div>
                <button className="text-white/40 hover:text-gold transition-colors">
                  <Clock className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
