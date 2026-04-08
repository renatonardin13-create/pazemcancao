import { useState } from "react";
import { Play, Pause, Download, Music } from "lucide-react";
import { motion } from "framer-motion";
import type { Track } from "@/lib/sample-tracks";
import { Button } from "@/components/ui/button";

interface TrackCardProps {
  track: Track;
  index: number;
}

const categoryColors: Record<string, string> = {
  Paz: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  Cura: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  Força: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  Oração: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  Madrugada: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
  Presença: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
  Refúgio: "bg-teal-500/10 text-teal-600 dark:text-teal-400",
};

export function TrackCard({ track, index }: TrackCardProps) {
  const [playing, setPlaying] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.4 }}
      className="group flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-colors hover:bg-accent/50"
    >
      {/* Track number */}
      <span className="hidden sm:flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold text-muted-foreground">
        {String(track.id).padStart(2, "0")}
      </span>

      {/* Play button */}
      <button
        onClick={() => setPlaying(!playing)}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold/15 text-gold transition-colors hover:bg-gold/25"
      >
        {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
      </button>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <Music className="h-3.5 w-3.5 text-gold shrink-0" />
          <h3 className="text-sm font-semibold text-foreground truncate">
            {track.title}
          </h3>
        </div>
        <div className="mt-1 flex items-center gap-2">
          <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${categoryColors[track.category] || "bg-muted text-muted-foreground"}`}>
            {track.category}
          </span>
          <span className="text-xs text-muted-foreground">{track.duration}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 shrink-0">
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 text-muted-foreground hover:text-gold"
        >
          <Play className="h-3.5 w-3.5" />
          <span className="hidden sm:inline text-xs">Ouvir</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 text-muted-foreground hover:text-gold"
        >
          <Download className="h-3.5 w-3.5" />
          <span className="hidden sm:inline text-xs">Baixar</span>
        </Button>
      </div>
    </motion.div>
  );
}
