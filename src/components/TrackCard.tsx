import { Play, Pause, Download, Clock } from "lucide-react";
import type { Track } from "@/lib/sample-tracks";
import { usePlayer } from "@/hooks/use-player";

interface TrackCardProps {
  track: Track;
  index: number;
}

export function TrackCard({ track, index }: TrackCardProps) {
  const { currentTrack, playing, progress, toggle } = usePlayer();
  const isThis = currentTrack?.id === track.id;
  const isPlaying = isThis && playing;

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    const link = document.createElement("a");
    link.href = track.downloadUrl;
    link.download = `${String(track.id).padStart(2, "0")} - ${track.title}.mp3`;
    link.click();
  };

  return (
    <div
      className={`group relative transition-all duration-700 ease-out cursor-pointer ${
        isPlaying ? "py-2" : ""
      }`}
      onClick={() => toggle(track)}
      style={{
        animationDelay: `${index * 50}ms`,
        animationFillMode: "backwards",
      }}
    >
      <div className={`relative rounded-2xl transition-all duration-700 overflow-hidden ${
        isPlaying
          ? "bg-card/40"
          : "hover:bg-card/15"
      }`}>
        {/* Breathing glow when playing */}
        {isPlaying && (
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 h-24 w-48 rounded-full bg-gold/[0.025] blur-[60px] animate-breathe" />
          </div>
        )}

        {/* Progress fill — like warm light spreading */}
        {isPlaying && (
          <div className="absolute inset-0 pointer-events-none">
            <div
              className="h-full bg-gold/[0.008] transition-all duration-200 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        <div className="relative px-5 py-6 sm:px-7 sm:py-7">
          {/* Track number — small, quiet */}
          <p className={`text-[10px] font-medium tracking-[0.3em] uppercase mb-4 transition-colors duration-500 ${
            isPlaying ? "text-gold/40" : "text-muted-foreground/20"
          }`}>
            Louvor {String(track.id).padStart(2, "0")}
            <span className="mx-2 text-border/15">·</span>
            {track.category}
            <span className="mx-2 text-border/15">·</span>
            {track.duration}
          </p>

          {/* Title — the name of the experience */}
          <h3 className={`font-display text-lg sm:text-xl font-bold tracking-tight leading-tight transition-colors duration-500 ${
            isPlaying ? "text-gold/80" : "text-foreground/75 group-hover:text-foreground/90"
          }`}>
            {track.title}
          </h3>

          {/* Description — the soul */}
          <p className={`mt-3 text-[13px] sm:text-[14px] leading-[2] transition-all duration-700 ${
            isPlaying
              ? "text-muted-foreground/45 max-h-40"
              : "text-muted-foreground/25 group-hover:text-muted-foreground/40 max-h-20 overflow-hidden"
          }`}>
            {track.description}
          </p>

          {/* Actions — natural, integrated */}
          <div className={`mt-5 flex items-center gap-3 transition-all duration-500 ${
            isPlaying ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          }`}>
            <span className={`inline-flex items-center gap-2 text-[11px] font-medium tracking-wider uppercase transition-colors duration-500 ${
              isPlaying ? "text-gold/50" : "text-muted-foreground/30"
            }`}>
              {isPlaying ? (
                <>
                  <Pause className="h-3 w-3" />
                  Pausar
                </>
              ) : (
                <>
                  <Play className="h-3 w-3 ml-0.5" />
                  Ouvir
                </>
              )}
            </span>

            <span className="w-px h-3 bg-border/10" />

            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-2 text-[11px] font-medium tracking-wider uppercase text-muted-foreground/20 hover:text-gold/40 transition-colors duration-500"
            >
              <Download className="h-3 w-3" />
              Baixar
            </button>
          </div>

          {/* Progress bar when playing */}
          {isPlaying && (
            <div className="mt-5 h-[1.5px] rounded-full bg-muted/6 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-gold/25 via-gold/50 to-gold/30 transition-all duration-200 ease-linear"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Separator — breath between experiences */}
      {!isPlaying && (
        <div className="mx-8 sm:mx-12 h-px bg-gradient-to-r from-transparent via-border/8 to-transparent" />
      )}
    </div>
  );
}
