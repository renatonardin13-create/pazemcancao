import { createFileRoute } from "@tanstack/react-router";
import { Download, Music } from "lucide-react";
import { useState } from "react";
import { sampleTracks } from "@/lib/sample-tracks";
import { TrackCard } from "@/components/TrackCard";
import { Button } from "@/components/ui/button";
import { AppHeader } from "@/components/AppHeader";
import { PageContainer } from "@/components/PageContainer";
import { ValueMessageCard } from "@/components/ValueMessageCard";
import { FooterLinks } from "@/components/FooterLinks";
import { motion } from "framer-motion";

export const Route = createFileRoute("/_authenticated/downloads")({
  component: DownloadsPage,
});

const categories = [
  "Todos",
  "Paz",
  "Cura",
  "Força",
  "Oração",
  "Madrugada",
  "Presença",
  "Refúgio",
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1], delay },
  }),
};

function DownloadsPage() {
  const [filter, setFilter] = useState("Todos");

  const filtered =
    filter === "Todos"
      ? sampleTracks
      : sampleTracks.filter((t) => t.category === filter);

  return (
    <div className="min-h-screen bg-background pb-32 relative">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_50%_30%_at_50%_5%,var(--color-gold)/0.03,transparent_70%)]" />
      <div className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 h-[700px] w-[700px] rounded-full bg-gold/[0.008] blur-[200px] animate-breathe" />

      <AppHeader />

      <section className="relative">
        <PageContainer className="pt-24 pb-16 sm:pt-32 sm:pb-20 text-center relative z-10">
          <motion.div
            initial="hidden"
            animate="visible"
            className="flex flex-col items-center"
          >
            <motion.div variants={fadeUp} custom={0}>
              <div className="mx-auto mb-10 flex h-14 w-14 items-center justify-center rounded-full border border-gold/10 bg-gold/[0.04]">
                <Music className="h-5 w-5 text-gold/50" />
              </div>
            </motion.div>

            <motion.p variants={fadeUp} custom={0.1} className="mb-4 text-[10px] font-semibold uppercase tracking-[0.6em] text-gold/45">
              Sua Biblioteca Espiritual
            </motion.p>

            <motion.h1 variants={fadeUp} custom={0.2} className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-foreground leading-[1.04] tracking-tight">
              Seus Louvores <span className="text-gold">Exclusivos</span>
            </motion.h1>

            <motion.div variants={fadeUp} custom={0.3}>
              <div className="mx-auto mt-8 h-px w-28 bg-gradient-to-r from-transparent via-gold/15 to-transparent" />
            </motion.div>

            <motion.p variants={fadeUp} custom={0.4} className="mx-auto mt-8 max-w-md text-[15px] leading-[2.2] text-muted-foreground/55 font-light">
              Acesse, ouça e baixe sua coleção privada de 30 louvores inéditos.
              <br />
              <span className="text-muted-foreground/40">Ouça sem pressa. Este é o seu espaço.</span>
            </motion.p>

            <motion.p variants={fadeUp} custom={0.55} className="mx-auto mt-6 max-w-lg text-[14px] leading-[2.3] text-muted-foreground/45 font-light italic">
              Essas canções foram preparadas para ser paz nos seus dias difíceis, força na sua caminhada e presença de Deus nos seus momentos mais silenciosos.
            </motion.p>
          </motion.div>
        </PageContainer>
      </section>

      <PageContainer>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <ValueMessageCard />
        </motion.div>
      </PageContainer>

      <PageContainer className="pt-12 sm:pt-16 pb-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.6 }}
        >
          <div className="flex items-center gap-3 mb-10">
            <div className="w-px h-5 bg-gold/15" />
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.4em] text-muted-foreground/40">
              Coleção Completa
            </h2>
            <span className="ml-auto text-[10px] text-muted-foreground/30 font-medium">
              {filtered.length} canções
            </span>
          </div>

          <div className="mb-10 -mx-4 sm:mx-0 px-4 sm:px-0 overflow-x-auto scrollbar-none">
            <div className="flex gap-1 pb-1 min-w-max sm:min-w-0 sm:flex-wrap">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={`rounded-full px-4 py-2 text-[11px] font-medium transition-all duration-500 whitespace-nowrap ${
                    filter === cat
                      ? "bg-gold/80 text-gold-foreground shadow-[0_0_20px_-4px] shadow-gold/15"
                      : "text-muted-foreground/35 hover:text-muted-foreground/55 hover:bg-muted/10"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {filtered.map((track, i) => (
            <motion.div
              key={track.id}
              initial={{ opacity: 0, y: 16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.7 + i * 0.04, ease: [0.22, 1, 0.36, 1] }}
            >
              <TrackCard track={track} index={i} />
            </motion.div>
          ))}
        </div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          className="mt-28 text-center"
        >
          <motion.div variants={fadeUp} custom={0}>
            <div className="mx-auto w-px h-14 bg-gradient-to-b from-transparent via-gold/10 to-transparent mb-10" />
          </motion.div>
          <motion.p variants={fadeUp} custom={0.1} className="text-[10px] font-semibold uppercase tracking-[0.4em] text-gold/35 mb-4">
            Leve com você
          </motion.p>
          <motion.h3 variants={fadeUp} custom={0.2} className="font-display text-xl font-bold text-foreground/85">
            Baixe Toda a Coleção
          </motion.h3>
          <motion.p variants={fadeUp} custom={0.3} className="mt-3 text-[13px] text-muted-foreground/40 leading-relaxed">
            30 faixas em alta qualidade para a sua jornada de fé
          </motion.p>
          <motion.div variants={fadeUp} custom={0.4}>
            <Button className="mt-8 gap-2.5 rounded-full bg-gold/15 text-gold/65 border border-gold/12 px-10 py-4 h-auto text-[12px] font-bold tracking-[0.2em] uppercase hover:bg-gold/25 hover:text-gold/85 hover:shadow-[0_0_40px_-8px] hover:shadow-gold/15 shadow-none transition-all duration-700 active:scale-95">
              <Download className="h-3.5 w-3.5" />
              Baixar Todos
            </Button>
          </motion.div>
        </motion.div>
      </PageContainer>

      <FooterLinks variant="full" />
    </div>
  );
}
