import { createFileRoute } from "@tanstack/react-router";
import { Download } from "lucide-react";
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
    <div className="min-h-screen bg-background pb-32 relative">
      {/* Night atmosphere */}
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_50%_30%_at_50%_5%,var(--color-gold)/0.03,transparent_70%)]" />
      <div className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 h-[700px] w-[700px] rounded-full bg-gold/[0.008] blur-[200px] animate-breathe" />

      <AppHeader />

      {/* Entrance — contemplative */}
      <section className="relative">
        <PageContainer className="pt-24 pb-16 sm:pt-32 sm:pb-20 text-center relative z-10">
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-[1200ms]">
            <div className="mx-auto mb-12 w-px h-20 bg-gradient-to-b from-transparent via-gold/12 to-transparent" />

            <p className="mb-4 text-[10px] font-medium uppercase tracking-[0.5em] text-gold/35">
              Seu Lugar de Descanso
            </p>

            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-foreground/90 leading-[1.04] tracking-tight">
              Seus Louvores
            </h1>

            <div className="mx-auto mt-8 h-px w-24 bg-gradient-to-r from-transparent via-gold/10 to-transparent" />

            <p className="mx-auto mt-8 max-w-xs text-[15px] leading-[2.2] text-muted-foreground/55 font-light">
              30 canções para os dias em que a alma pesa.<br />
              Ouça sem pressa. Você merece esse momento.
            </p>
          </div>
        </PageContainer>
      </section>

      {/* Devotional message — felt, not just read */}
      <PageContainer className="animate-in fade-in duration-[1200ms] delay-500">
        <ValueMessageCard />
      </PageContainer>

      {/* Collection */}
      <PageContainer className="pt-12 sm:pt-16 pb-8">
        {/* Section header */}
        <div className="flex items-center gap-3 mb-10 animate-in fade-in duration-700 delay-700">
          <div className="w-px h-5 bg-gold/10" />
          <h2 className="text-[11px] font-medium uppercase tracking-[0.4em] text-muted-foreground/35">
            Coleção Completa
          </h2>
          <span className="ml-auto text-[10px] text-muted-foreground/25">
            {filtered.length} canções de cura
          </span>
        </div>

        {/* Category filter — quiet words */}
        <div className="mb-10 -mx-4 sm:mx-0 px-4 sm:px-0 overflow-x-auto scrollbar-none">
          <div className="flex gap-1 pb-1 min-w-max sm:min-w-0 sm:flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`rounded-full px-4 py-2 text-[11px] font-medium transition-all duration-500 whitespace-nowrap ${
                  filter === cat
                    ? "bg-gold/80 text-gold-foreground"
                    : "text-muted-foreground/35 hover:text-muted-foreground/55"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Track list — each track is its own experience */}
        <div>
          {filtered.map((track, i) => (
            <TrackCard key={track.id} track={track} index={i} />
          ))}
        </div>

        {/* Download all — gentle, final */}
        <div className="mt-28 text-center">
          <div className="mx-auto w-px h-14 bg-gradient-to-b from-transparent via-gold/8 to-transparent mb-10" />
          <p className="text-[10px] font-medium uppercase tracking-[0.4em] text-gold/30 mb-4">
            Leve todas com você
          </p>
          <h3 className="font-display text-lg font-semibold text-foreground/80">
            Baixe Toda a Coleção
          </h3>
          <p className="mt-2 text-xs text-muted-foreground/40 leading-relaxed">
            30 faixas para os momentos que só Deus vê
          </p>
          <Button className="mt-7 gap-2 rounded-full bg-gold/15 text-gold/60 border border-gold/10 px-8 py-3 h-auto text-[12px] font-semibold tracking-wider uppercase hover:bg-gold/25 hover:text-gold/80 shadow-none transition-all duration-500 active:scale-95">
            <Download className="h-3.5 w-3.5" />
            Baixar Todos
          </Button>
        </div>
      </PageContainer>

      <FooterLinks variant="full" />
    </div>
  );
}
