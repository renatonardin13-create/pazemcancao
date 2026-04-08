import { createFileRoute } from "@tanstack/react-router";
import { Download, ListMusic } from "lucide-react";
import { useState } from "react";
import { sampleTracks } from "@/lib/sample-tracks";
import { TrackCard } from "@/components/TrackCard";
import { Button } from "@/components/ui/button";
import { AppHeader } from "@/components/AppHeader";
import { PageContainer } from "@/components/PageContainer";
import { ValueMessageCard } from "@/components/ValueMessageCard";
import { FooterLinks } from "@/components/FooterLinks";

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

function DownloadsPage() {
  const [filter, setFilter] = useState("Todos");

  const filtered =
    filter === "Todos"
      ? sampleTracks
      : sampleTracks.filter((t) => t.category === filter);

  return (
    <div className="min-h-screen bg-background pb-28 relative">
      {/* Deep night atmosphere */}
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_50%_35%_at_50%_8%,var(--color-gold)/0.04,transparent_70%)]" />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_35%_45%_at_85%_85%,var(--color-gold)/0.015,transparent_55%)]" />
      <div className="pointer-events-none fixed top-[5%] left-1/2 -translate-x-1/2 h-[600px] w-[600px] rounded-full bg-gold/[0.012] blur-[180px] animate-breathe" />

      <AppHeader />

      {/* Entrance — like opening a sacred collection */}
      <section className="relative overflow-hidden">
        <PageContainer className="py-20 sm:py-28 text-center relative z-10">
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
            {/* Spiritual vertical mark */}
            <div className="mx-auto mb-10 w-px h-16 bg-gradient-to-b from-transparent via-gold/18 to-transparent" />

            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.4em] text-gold/35">
              Sua Biblioteca Espiritual
            </p>

            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-foreground/95 leading-[1.06] tracking-tight">
              Seus Louvores
            </h1>

            <div className="mx-auto mt-6 h-px w-20 bg-gradient-to-r from-transparent via-gold/15 to-transparent" />

            <p className="mx-auto mt-7 max-w-sm text-[15px] leading-[2] text-muted-foreground/50 font-light">
              30 canções criadas com oração.<br />
              Ouça com o coração aberto.
            </p>

            {/* Subtle stats — whispered, not shouted */}
            <div className="mt-10 flex items-center justify-center gap-10 text-[10px] text-muted-foreground/30 tracking-wider uppercase">
              <span>30 faixas</span>
              <span className="w-px h-3 bg-gold/10" />
              <span>Download ilimitado</span>
              <span className="w-px h-3 bg-gold/10" />
              <span>Acesso exclusivo</span>
            </div>
          </div>
        </PageContainer>

        <div className="h-px bg-gradient-to-r from-transparent via-gold/6 to-transparent" />
      </section>

      {/* Devotional message */}
      <PageContainer className="pt-6 sm:pt-8 animate-in fade-in duration-1000 delay-300">
        <ValueMessageCard />
      </PageContainer>

      {/* Collection */}
      <PageContainer className="py-10 sm:py-12">
        {/* Section — quiet, confident */}
        <div className="flex items-center gap-3 mb-8 animate-in fade-in duration-700 delay-400">
          <div className="w-px h-6 bg-gradient-to-b from-gold/15 to-transparent" />
          <h2 className="font-display text-lg font-semibold text-foreground/80 tracking-tight">
            Coleção Completa
          </h2>
          <span className="ml-auto text-[10px] text-muted-foreground/25">
            {filtered.length} {filtered.length === 1 ? "louvor" : "louvores"}
          </span>
        </div>

        {/* Category filter — delicate, contemplative */}
        <div className="mb-8 -mx-4 sm:mx-0 px-4 sm:px-0 overflow-x-auto scrollbar-none">
          <div className="flex gap-1.5 pb-1 min-w-max sm:min-w-0 sm:flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`rounded-full px-4 py-2 text-xs font-medium transition-all duration-500 whitespace-nowrap active:scale-95 ${
                  filter === cat
                    ? "bg-gold/85 text-gold-foreground shadow-lg shadow-gold/10"
                    : "text-muted-foreground/40 hover:text-muted-foreground/60 hover:bg-card/40"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Track list — each track is a doorway, not just a row */}
        <div className="space-y-1.5">
          {filtered.map((track, i) => (
            <TrackCard key={track.id} track={track} index={i} />
          ))}
        </div>

        {/* Download all — sacred, final */}
        <div className="mt-24 text-center animate-in fade-in duration-1000 delay-500">
          <div className="mx-auto max-w-xs">
            <div className="mx-auto w-px h-10 bg-gradient-to-b from-transparent via-gold/12 to-transparent mb-8" />
            <h3 className="font-display text-lg font-semibold text-foreground/85">
              Baixe Toda a Coleção
            </h3>
            <p className="mt-2 text-xs text-muted-foreground/35 leading-relaxed">
              Todos os 30 louvores em alta qualidade
            </p>
            <Button className="mt-6 gap-2.5 rounded-full bg-gold/85 text-gold-foreground px-10 py-3.5 h-auto text-sm font-bold hover:bg-gold shadow-xl shadow-gold/8 transition-all duration-500 active:scale-95">
              <Download className="h-4 w-4" />
              Baixar Todos
            </Button>
          </div>
        </div>
      </PageContainer>

      <FooterLinks variant="full" />
    </div>
  );
}
