import { useState } from "react";
import { Play, Pause, Download } from "lucide-react";
import { motion } from "framer-motion";
import type { Track } from "@/lib/sample-tracks";
import { Button } from "@/components/ui/button";

interface TrackCardProps {
  track: Track;
  index: number;
}

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
        <h3 className="text-sm font-semibold text-foreground truncate">
          {track.title}
        </h3>
        <p className="text-xs text-muted-foreground">
          {track.category} · {track.duration}
        </p>
      </div>

      {/* Download */}
      <Button
        variant="ghost"
        size="sm"
        className="shrink-0 gap-1.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:text-gold"
      >
        <Download className="h-4 w-4" />
        <span className="hidden sm:inline text-xs">Baixar</span>
      </Button>
    </motion.div>
  );
}
