import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Download, Play, Pause, Music, Heart } from "lucide-react";
import { sampleTracks } from "@/lib/sample-tracks";
import { usePlayer } from "@/hooks/use-player";
import { motion } from "framer-motion";

export const Route = createFileRoute("/_authenticated/conteudo/$trackId")({
  component: TrackDetailPage,
  notFoundComponent: () => (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <p className="text-muted-foreground/50">Conteúdo não encontrado.</p>
        <Link to="/downloads" className="mt-4 inline-block text-gold/70 hover:text-gold/80 text-sm">
          Voltar à biblioteca
        </Link>
      </div>
    </div>
  ),
});

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 1, ease: [0.22, 1, 0.36, 1], delay },
  }),
};

const emotionalMessages: Record<string, string> = {
  Cura: "Que esta canção seja um bálsamo para as feridas que só Deus conhece. Permita-se ser curado.",
  Madrugada: "Nas horas em que o silêncio pesa, esta melodia é um lembrete de que você não está sozinho na escuridão.",
  Oração: "Deixe esta canção ser a oração que seu coração quer fazer, mas as palavras não conseguem expressar.",
  Força: "Você já passou por tanto e ainda está de pé. Esta canção celebra a sua força — aquela que vem do alto.",
  Paz: "Respire fundo. Solte o peso. Esta canção é um convite para experimentar a paz que excede todo entendimento.",
  Presença: "Feche os olhos. Ele está aqui. Esta canção é apenas o som da presença dEle envolvendo você.",
  Refúgio: "Este é o seu lugar seguro. Aqui, debaixo das asas do Altíssimo, nada pode alcançá-lo.",
};

function TrackDetailPage() {
  const { trackId } = Route.useParams();
  const id = parseInt(trackId, 10);
  const track = sampleTracks.find((t) => t.id === id);
  const { currentTrack, playing, progress, toggle } = usePlayer();

  if (!track) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-muted-foreground/50">Conteúdo não encontrado.</p>
          <Link to="/downloads" className="mt-4 inline-block text-gold/70 hover:text-gold/80 text-sm">
            Voltar à biblioteca
          </Link>
        </div>
      </div>
    );
  }

  const isThis = currentTrack?.id === track.id;
  const isPlaying = isThis && playing;
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
    <div className="min-h-screen bg-background pb-32 relative">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_30%,var(--color-gold)/0.03,transparent_70%)]" />

      <motion.div
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="fixed top-6 left-6 z-30"
      >
        <Link
          to="/downloads"
          className="group flex items-center gap-2.5 text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground/60 hover:text-gold/70 transition-colors duration-500"
        >
          <ArrowLeft className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-x-1" />
          Biblioteca
        </Link>
      </motion.div>

      <div className="mx-auto max-w-2xl px-6 pt-24 sm:pt-32">
        <motion.div
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center text-center"
        >
          <motion.div variants={fadeUp} custom={0} className="mb-10">
            <div className={`relative mx-auto flex h-40 w-40 sm:h-52 sm:w-52 items-center justify-center rounded-3xl border transition-all duration-1000 ${
              isPlaying
                ? "border-gold/20 bg-gold/[0.06] shadow-[0_0_80px_-16px] shadow-gold/15"
                : "border-border/25 bg-card/15"
            }`}>
              {isPlaying && (
                <div className="absolute inset-0 rounded-3xl border border-gold/10 animate-breathe" />
              )}
              <Music className={`h-12 w-12 sm:h-16 sm:w-16 transition-colors duration-700 ${
                isPlaying ? "text-gold/70" : "text-muted-foreground/50"
              }`} />
              <span className={`absolute bottom-3 right-4 text-xs font-bold tracking-[0.2em] transition-colors duration-500 ${
                isPlaying ? "text-gold/55" : "text-muted-foreground/10"
              }`}>
                {String(track.id).padStart(2, "0")}
              </span>
            </div>
          </motion.div>

          <motion.div variants={fadeUp} custom={0.15}>
            <span className="inline-block rounded-full bg-gold/[0.06] border border-gold/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.4em] text-gold/45 mb-6">
              {track.category}
            </span>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            custom={0.25}
            className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground leading-[1.1] tracking-tight"
          >
            {track.title}
          </motion.h1>

          <motion.p variants={fadeUp} custom={0.35} className="mt-4 text-xs tracking-[0.3em] text-muted-foreground/60 font-medium">
            {track.duration}
          </motion.p>

          <motion.div variants={fadeUp} custom={0.4}>
            <div className="mx-auto mt-8 h-px w-20 bg-gradient-to-r from-transparent via-gold/15 to-transparent" />
          </motion.div>

          <motion.p
            variants={fadeUp}
            custom={0.5}
            className="mt-8 max-w-md text-[15px] leading-[2.3] text-muted-foreground/55 font-light"
          >
            {track.description}
          </motion.p>

          <motion.div variants={fadeUp} custom={0.65} className="mt-12 w-full max-w-sm">
            <button
              onClick={() => toggle(track)}
              className={`group w-full flex items-center justify-center gap-3 rounded-full py-5 text-[12px] font-bold tracking-[0.25em] uppercase transition-all duration-700 active:scale-[0.97] ${
                isPlaying
                  ? "bg-gold/25 text-gold border border-gold/30 shadow-[0_0_50px_-12px] shadow-gold/20"
                  : "bg-gold/15 text-gold/70 border border-gold/20 hover:bg-gold/25 hover:text-gold hover:shadow-[0_0_50px_-12px] hover:shadow-gold/15"
              }`}
            >
              {isPlaying ? (
                <>
                  <Pause className="h-4 w-4" />
                  <span>Pausar</span>
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 ml-0.5" />
                  <span>Ouvir Agora</span>
                </>
              )}
            </button>

            {isPlaying && (
              <motion.div
                initial={{ opacity: 0, scaleX: 0.8 }}
                animate={{ opacity: 1, scaleX: 1 }}
                className="mt-5 h-[2px] rounded-full bg-muted/8 overflow-hidden"
              >
                <div
                  className="h-full rounded-full bg-gradient-to-r from-gold/30 via-gold/55 to-gold/35 transition-all duration-200 ease-linear"
                  style={{ width: `${progress}%` }}
                />
              </motion.div>
            )}

            <button
              onClick={handleDownload}
              className="mt-5 w-full flex items-center justify-center gap-2.5 rounded-full py-4 text-xs font-semibold tracking-[0.2em] uppercase text-muted-foreground/60 border border-border/20 hover:text-gold/70 hover:border-gold/15 hover:bg-gold/[0.03] transition-all duration-500"
            >
              <Download className="h-3.5 w-3.5" />
              Baixar Louvor
            </button>
          </motion.div>

          <motion.div variants={fadeUp} custom={0.85} className="mt-16">
            <div className="mx-auto w-px h-12 bg-gradient-to-b from-transparent via-gold/12 to-transparent mb-8" />
            <Heart className="h-4 w-4 text-gold/70 mx-auto mb-5" />
            <p className="max-w-sm mx-auto text-[14px] leading-[2.4] text-muted-foreground/70 font-light italic">
              "{emotionalMessage}"
            </p>
          </motion.div>

          <motion.div variants={fadeUp} custom={1} className="mt-20 w-full max-w-md">
            <div className="mx-auto h-px w-full bg-gradient-to-r from-transparent via-border/8 to-transparent mb-8" />
            <div className="flex items-center justify-between">
              {prevTrack ? (
                <Link
                  to="/conteudo/$trackId"
                  params={{ trackId: String(prevTrack.id) }}
                  className="group flex flex-col items-start gap-1 max-w-[45%]"
                >
                  <span className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground/50 group-hover:text-gold/55 transition-colors">
                    ← Anterior
                  </span>
                  <span className="text-[12px] font-medium text-muted-foreground/70 group-hover:text-foreground/60 transition-colors truncate w-full">
                    {prevTrack.title}
                  </span>
                </Link>
              ) : (
                <div />
              )}
              {nextTrack ? (
                <Link
                  to="/conteudo/$trackId"
                  params={{ trackId: String(nextTrack.id) }}
                  className="group flex flex-col items-end gap-1 max-w-[45%]"
                >
                  <span className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground/50 group-hover:text-gold/55 transition-colors">
                    Próximo →
                  </span>
                  <span className="text-[12px] font-medium text-muted-foreground/70 group-hover:text-foreground/60 transition-colors truncate w-full text-right">
                    {nextTrack.title}
                  </span>
                </Link>
              ) : (
                <div />
              )}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
