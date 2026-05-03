import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Download, Play, Pause, Music, Heart, ChevronLeft, ChevronRight } from "lucide-react";
import { sampleTracks } from "@/lib/sample-tracks";
import { useMusicPlayer } from "@/hooks/use-music-player";
import { motion } from "framer-motion";
import { StudentLayout } from "@/components/StudentLayout";
import { Progress } from "@/components/ui/progress";
import { UpsellSection } from "@/components/UpsellSection";
import { CrossSellSection } from "@/components/CrossSellSection";
import { useEffect } from "react";

export const Route = createFileRoute("/_authenticated/musicas/$trackId")({
  component: TrackDetailPage,
  notFoundComponent: () => (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <Music className="mx-auto h-10 w-10 text-muted-foreground/30" />
        <p className="text-muted-foreground/50 text-sm">Conteúdo não encontrado.</p>
        <Link to="/musicas" className="inline-block text-gold/70 hover:text-gold text-sm transition-colors">
          ← Voltar à biblioteca
        </Link>
      </div>
    </div>
  ),
});

const fadeIn = {
  hidden: { opacity: 0, y: 16 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1], delay },
  }),
};

const emotionalMessages: Record<string, string> = {
  Cura: "Que esta canção seja um bálsamo para as feridas que só Deus conhece.",
  Madrugada: "Nas horas em que o silêncio pesa, esta melodia é um lembrete de que você não está sozinho.",
  Oração: "Deixe esta canção ser a oração que seu coração quer fazer.",
  Força: "Você já passou por tanto e ainda está de pé. Esta canção celebra a sua força.",
  Paz: "Respire fundo. Solte o peso. Experimente a paz que excede todo entendimento.",
  Presença: "Feche os olhos. Ele está aqui. Esta canção é o som da presença dEle.",
  Refúgio: "Este é o seu lugar seguro. Debaixo das asas do Altíssimo, nada pode alcançá-lo.",
};

function TrackDetailPage() {
  const { trackId } = Route.useParams();
  const id = parseInt(trackId, 10);
  const track = sampleTracks.find((t) => t.id === id);
  const { isPlaying, currentTrack, progress, playTrack, toggle } = useMusicPlayer();

  useEffect(() => {
    if (track && currentTrack?.id !== track.id) {
       // We don't auto-play to avoid unwanted noise on navigation, 
       // but we set it as the current track in the hook logic if we wanted.
    }
  }, [track, currentTrack]);

  if (!track) {
    return (
      <StudentLayout>
        <div className="flex min-h-screen items-center justify-center bg-background">
          <div className="text-center space-y-4">
            <Music className="mx-auto h-10 w-10 text-muted-foreground/30" />
            <p className="text-muted-foreground/50 text-sm">Conteúdo não encontrado.</p>
            <Link to="/musicas" className="inline-block text-gold/70 hover:text-gold text-sm transition-colors">
              ← Voltar à biblioteca
            </Link>
          </div>
        </div>
      </StudentLayout>
    );
  }

  const isCurrentPlaying = isPlaying && currentTrack?.id === track.id;
  const emotionalMessage = emotionalMessages[track.category] || emotionalMessages["Paz"];

  const currentIndex = sampleTracks.findIndex((t) => t.id === id);
  const prevTrack = currentIndex > 0 ? sampleTracks[currentIndex - 1] : null;
  const nextTrack = currentIndex < sampleTracks.length - 1 ? sampleTracks[currentIndex + 1] : null;

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = track.downloadUrl;
    link.download = `${String(track.id).padStart(2, "0")} - ${track.title}.mp3`;
    link.click();
  };

  return (
    <StudentLayout>
      <div className="min-h-screen bg-background pb-32 relative">
        {/* Subtle ambient glow */}
        <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_50%_40%_at_50%_20%,var(--color-gold)/0.02,transparent_70%)]" />

        {/* Top navigation */}
        <div className="sticky top-0 z-30 border-b border-border/10 bg-background/95 backdrop-blur-xl">
          <div className="mx-auto max-w-2xl flex items-center justify-between px-6 h-12">
            <Link
              to="/musicas"
              className="flex items-center gap-2 text-xs font-medium text-muted-foreground/50 hover:text-foreground/70 transition-colors"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Biblioteca
            </Link>
            <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground/30 font-medium">
              {currentIndex + 1} / {sampleTracks.length}
            </span>
          </div>
        </div>

        <div className="mx-auto max-w-lg px-6 pt-12 sm:pt-16">
          <motion.div
            initial="hidden"
            animate="visible"
            className="flex flex-col items-center text-center"
          >
            {/* Album art / icon */}
            <motion.div variants={fadeIn} custom={0} className="mb-8">
              <div className={`relative mx-auto flex h-36 w-36 sm:h-44 sm:w-44 items-center justify-center rounded-2xl border transition-all duration-1000 ${
                isPlaying
                  ? "border-gold/20 bg-gold/[0.05] shadow-[0_0_60px_-20px] shadow-gold/12"
                  : "border-border/15 bg-card/10"
              }`}>
                {isCurrentPlaying && (
                  <div className="absolute inset-0 rounded-2xl border border-gold/8 animate-breathe" />
                )}
                <Music className={`h-10 w-10 sm:h-12 sm:w-12 transition-colors duration-700 ${
                  isCurrentPlaying ? "text-gold/60" : "text-muted-foreground/30"
                }`} />
                <span className={`absolute bottom-2.5 right-3 text-[10px] font-bold tracking-[0.2em] transition-colors duration-500 ${
                  isCurrentPlaying ? "text-gold/40" : "text-muted-foreground/10"
                }`}>
                  {String(track.id).padStart(2, "0")}
                </span>
              </div>
            </motion.div>

            {/* Category */}
            <motion.div variants={fadeIn} custom={0.1}>
              <span className="inline-block rounded-full bg-gold/[0.05] border border-gold/8 px-3.5 py-1 text-[10px] font-semibold uppercase tracking-[0.35em] text-gold/40 mb-5">
                {track.category}
              </span>
            </motion.div>

            {/* Title */}
            <motion.h1
              variants={fadeIn}
              custom={0.2}
              className="font-display text-2xl sm:text-3xl font-bold text-foreground/90 leading-tight tracking-tight"
            >
              {track.title}
            </motion.h1>

            {/* Duration */}
            <motion.p variants={fadeIn} custom={0.25} className="mt-3 text-xs tracking-[0.25em] text-muted-foreground/40 font-medium">
              {track.duration}
            </motion.p>

            {/* Divider */}
            <motion.div variants={fadeIn} custom={0.3}>
              <div className="mx-auto mt-6 h-px w-16 bg-gradient-to-r from-transparent via-gold/12 to-transparent" />
            </motion.div>

            {/* Description */}
            <motion.p
              variants={fadeIn}
              custom={0.35}
              className="mt-6 max-w-sm text-[14px] leading-[2] text-muted-foreground/50 font-light"
            >
              {track.description}
            </motion.p>

            {/* Play controls */}
            <motion.div variants={fadeIn} custom={0.45} className="mt-10 w-full max-w-xs space-y-3">
              <button
                onClick={() => playTrack({ id: track.id, title: track.title, audioUrl: track.audioUrl })}
                className={`group w-full flex items-center justify-center gap-3 rounded-full py-4 text-[11px] font-bold tracking-[0.2em] uppercase transition-all duration-500 active:scale-[0.97] ${
                  isCurrentPlaying
                    ? "bg-gold/20 text-gold border border-gold/25 shadow-[0_0_40px_-15px] shadow-gold/15"
                    : "bg-gold/10 text-gold/65 border border-gold/15 hover:bg-gold/20 hover:text-gold hover:shadow-[0_0_40px_-15px] hover:shadow-gold/10"
                }`}
              >
                {isCurrentPlaying ? (
                  <>
                    <Pause className="h-4 w-4" />
                    Pausar
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 ml-0.5" />
                    Ouvir Agora
                  </>
                )}
              </button>

              {/* Progress bar */}
              {(isCurrentPlaying || (currentTrack?.id === track.id)) && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <Progress value={progress} className="h-1 bg-muted/10" />
                </motion.div>
              )}

              {/* Download */}
              <button
                onClick={handleDownload}
                className="w-full flex items-center justify-center gap-2 rounded-full py-3.5 text-[11px] font-semibold tracking-[0.15em] uppercase text-muted-foreground/50 border border-border/15 hover:text-gold/60 hover:border-gold/12 hover:bg-gold/[0.02] transition-all duration-500"
              >
                <Download className="h-3.5 w-3.5" />
                Baixar Louvor
              </button>
            </motion.div>

            {/* Emotional message */}
            <motion.div variants={fadeIn} custom={0.6} className="mt-14">
              <div className="mx-auto w-px h-8 bg-gradient-to-b from-transparent via-gold/10 to-transparent mb-6" />
              <Heart className="h-3.5 w-3.5 text-gold/50 mx-auto mb-4" />
              <p className="max-w-xs mx-auto text-[13px] leading-[2.2] text-muted-foreground/45 font-light italic">
                "{emotionalMessage}"
              </p>
            </motion.div>

            {/* Prev / Next navigation */}
            <motion.div variants={fadeIn} custom={0.7} className="mt-16 w-full max-w-sm">
              <div className="h-px w-full bg-gradient-to-r from-transparent via-border/10 to-transparent mb-6" />
              <div className="flex items-stretch justify-between gap-4">
                {prevTrack ? (
                  <Link
                    to="/musicas/$trackId"
                    params={{ trackId: String(prevTrack.id) }}
                    className="group flex-1 flex flex-col items-start gap-1 rounded-xl border border-border/10 bg-card/5 px-4 py-3 hover:border-gold/10 hover:bg-card/10 transition-all"
                  >
                    <span className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground/40 group-hover:text-gold/50 transition-colors flex items-center gap-1">
                      <ChevronLeft className="h-2.5 w-2.5" />
                      Anterior
                    </span>
                    <span className="text-[11px] font-medium text-muted-foreground/60 group-hover:text-foreground/60 transition-colors truncate w-full">
                      {prevTrack.title}
                    </span>
                  </Link>
                ) : (
                  <div className="flex-1" />
                )}
                {nextTrack ? (
                  <Link
                    to="/musicas/$trackId"
                    params={{ trackId: String(nextTrack.id) }}
                    className="group flex-1 flex flex-col items-end gap-1 rounded-xl border border-border/10 bg-card/5 px-4 py-3 hover:border-gold/10 hover:bg-card/10 transition-all"
                  >
                    <span className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground/40 group-hover:text-gold/50 transition-colors flex items-center gap-1">
                      Próximo
                      <ChevronRight className="h-2.5 w-2.5" />
                    </span>
                    <span className="text-[11px] font-medium text-muted-foreground/60 group-hover:text-foreground/60 transition-colors truncate w-full text-right">
                      {nextTrack.title}
                    </span>
                  </Link>
                ) : (
                  <div className="flex-1" />
                )}
              </div>
            </motion.div>

            {/* Upsell & Cross-sell */}
            <UpsellSection sourceType="content" sourceId={trackId} className="mt-10 w-full max-w-lg" />
            <CrossSellSection currentType="content" currentId={trackId} title="Você também pode gostar" className="mt-6 w-full max-w-lg" />
          </motion.div>
        </div>
      </div>
    </StudentLayout>
  );
}
