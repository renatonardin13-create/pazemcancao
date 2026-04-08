import { createFileRoute } from "@tanstack/react-router";
import {
  Download,
  Headphones,
  Sparkles,
  ListMusic,
} from "lucide-react";
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
    <div className="min-h-screen bg-background pb-20">
      <AppHeader />

      {/* Hero section */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,var(--color-gold)/0.08,transparent_50%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,var(--color-primary)/0.04,transparent_50%)]" />

        <PageContainer className="py-12 sm:py-16 text-center relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gold/10 border border-gold/20 shadow-lg shadow-gold/5">
            <Sparkles className="h-6 w-6 text-gold" />
          </div>

          <p className="mb-3 text-[10px] sm:text-xs font-semibold uppercase tracking-[0.25em] text-gold/80">
            Sua Biblioteca Privada
          </p>
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground leading-tight">
            Seus Louvores Exclusivos
          </h1>
          <p className="mx-auto mt-4 max-w-md text-sm sm:text-base text-muted-foreground leading-relaxed">
            Acesse, ouça e baixe abaixo seus 30 louvores inéditos protegidos.
          </p>

          <div className="mt-8 flex items-center justify-center gap-5 sm:gap-8">
            <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground/80">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold/10">
                <Headphones className="h-3.5 w-3.5 text-gold" />
              </div>
              30 faixas
            </div>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground/80">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold/10">
                <Download className="h-3.5 w-3.5 text-gold" />
              </div>
              Download ilimitado
            </div>
          </div>
        </PageContainer>

        <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      </section>

      {/* Value message */}
      <PageContainer className="pt-8 sm:pt-10">
        <ValueMessageCard />
      </PageContainer>

      {/* Filters + Tracks */}
      <PageContainer className="py-8 sm:py-10">
        {/* Section header */}
        <div className="flex items-center gap-2 mb-5">
          <ListMusic className="h-5 w-5 text-gold" />
          <h2 className="font-display text-lg font-semibold text-foreground">
            Todas as Faixas
          </h2>
          <span className="ml-auto text-xs text-muted-foreground/60">
            {filtered.length} {filtered.length === 1 ? "faixa" : "faixas"}
          </span>
        </div>

        {/* Category filter */}
        <div className="mb-6 -mx-4 sm:mx-0 px-4 sm:px-0 overflow-x-auto scrollbar-none">
          <div className="flex gap-2 pb-1 min-w-max sm:min-w-0 sm:flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`rounded-xl px-4 sm:px-5 py-2.5 text-xs sm:text-sm font-medium transition-all duration-200 whitespace-nowrap active:scale-95 ${
                  filter === cat
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/15"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Track list */}
        <div className="space-y-2.5 sm:space-y-3">
          {filtered.map((track, i) => (
            <TrackCard key={track.id} track={track} index={i} />
          ))}
        </div>

        {/* Download all */}
        <div className="mt-14 text-center animate-in fade-in duration-500 delay-500">
          <Button className="gap-2.5 rounded-2xl bg-gold text-gold-foreground px-10 py-4 h-auto text-sm sm:text-base font-bold hover:brightness-110 shadow-xl shadow-gold/15 transition-all active:scale-95">
            <Download className="h-5 w-5" />
            Baixar Todos os Louvores
          </Button>
          <p className="mt-3 text-[10px] sm:text-xs text-muted-foreground/50">
            Todos os 30 louvores em alta qualidade
          </p>
        </div>
      </PageContainer>

      <FooterLinks variant="full" />
    </div>
  );
}
