import { createFileRoute } from "@tanstack/react-router";
import {
  Download,
  Headphones,
  Sparkles,
  ListMusic,
  Music,
  Heart,
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

const categoryEmojis: Record<string, string> = {
  Todos: "🎵",
  Paz: "🕊️",
  Cura: "💚",
  Força: "🔥",
  Oração: "🙏",
  Madrugada: "🌅",
  Presença: "✨",
  Refúgio: "🏔️",
};

function DownloadsPage() {
  const [filter, setFilter] = useState("Todos");

  const filtered =
    filter === "Todos"
      ? sampleTracks
      : sampleTracks.filter((t) => t.category === filter);

  return (
    <div className="min-h-screen bg-background pb-24 relative">
      {/* Global atmospheric background */}
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top,var(--color-gold)/0.04,transparent_60%)]" />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_bottom_right,var(--color-primary)/0.03,transparent_50%)]" />

      <AppHeader />

      {/* Hero section — library entrance feel */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,var(--color-gold)/0.10,transparent_50%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,var(--color-primary)/0.05,transparent_50%)]" />

        {/* Floating orbs */}
        <div className="pointer-events-none absolute top-10 right-[20%] h-48 w-48 rounded-full bg-gold/[0.03] blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-[10%] h-32 w-32 rounded-full bg-gold/[0.04] blur-3xl" />

        <PageContainer className="py-14 sm:py-20 text-center relative z-10">
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gold/10 border border-gold/20 shadow-xl shadow-gold/10">
              <Music className="h-7 w-7 text-gold" />
            </div>

            <p className="mb-4 text-[10px] sm:text-xs font-bold uppercase tracking-[0.3em] text-gold/70">
              Sua Biblioteca Privada
            </p>
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-foreground leading-[1.1] tracking-tight">
              Seus Louvores<br className="sm:hidden" /> Exclusivos
            </h1>
            <p className="mx-auto mt-5 max-w-md text-sm sm:text-base text-muted-foreground/80 leading-relaxed">
              Acesse, ouça e baixe seus 30 louvores inéditos. Cada canção foi
              preparada com oração para tocar sua alma.
            </p>

            <div className="mt-8 flex items-center justify-center gap-6 sm:gap-10">
              <div className="flex items-center gap-2.5 text-xs sm:text-sm text-muted-foreground/70">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gold/10 border border-gold/15">
                  <Headphones className="h-4 w-4 text-gold" />
                </div>
                <span className="font-medium">30 faixas</span>
              </div>
              <div className="h-4 w-px bg-border/40" />
              <div className="flex items-center gap-2.5 text-xs sm:text-sm text-muted-foreground/70">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gold/10 border border-gold/15">
                  <Download className="h-4 w-4 text-gold" />
                </div>
                <span className="font-medium">Download ilimitado</span>
              </div>
            </div>
          </div>
        </PageContainer>

        <div className="h-px bg-gradient-to-r from-transparent via-gold/10 to-transparent" />
      </section>

      {/* Value message */}
      <PageContainer className="pt-8 sm:pt-10 animate-in fade-in duration-500 delay-200">
        <ValueMessageCard />
      </PageContainer>

      {/* Filters + Tracks */}
      <PageContainer className="py-8 sm:py-10">
        {/* Section header */}
        <div className="flex items-center gap-2.5 mb-6 animate-in fade-in duration-500 delay-300">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold/10">
            <ListMusic className="h-4 w-4 text-gold" />
          </div>
          <h2 className="font-display text-lg sm:text-xl font-bold text-foreground">
            Todas as Faixas
          </h2>
          <span className="ml-auto text-[11px] text-muted-foreground/50 font-medium">
            {filtered.length} {filtered.length === 1 ? "faixa" : "faixas"}
          </span>
        </div>

        {/* Category filter — premium pill style */}
        <div className="mb-7 -mx-4 sm:mx-0 px-4 sm:px-0 overflow-x-auto scrollbar-none">
          <div className="flex gap-2 pb-1 min-w-max sm:min-w-0 sm:flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`flex items-center gap-1.5 rounded-full px-4 sm:px-5 py-2.5 text-xs sm:text-sm font-medium transition-all duration-300 whitespace-nowrap active:scale-95 ${
                  filter === cat
                    ? "bg-gold text-gold-foreground shadow-lg shadow-gold/20 scale-[1.02]"
                    : "bg-card/60 border border-border/40 text-muted-foreground hover:border-gold/20 hover:text-foreground hover:bg-card"
                }`}
              >
                <span className="text-xs">{categoryEmojis[cat]}</span>
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

        {/* Download all CTA */}
        <div className="mt-16 text-center animate-in fade-in duration-500 delay-500">
          <div className="inline-flex flex-col items-center gap-4 rounded-3xl border border-gold/15 bg-card/40 backdrop-blur-sm px-10 sm:px-14 py-8 shadow-xl shadow-black/10">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gold/10 border border-gold/20">
              <Download className="h-5 w-5 text-gold" />
            </div>
            <div>
              <h3 className="font-display text-lg font-bold text-foreground">
                Baixe Toda a Coleção
              </h3>
              <p className="mt-1.5 text-xs text-muted-foreground/60">
                Todos os 30 louvores em alta qualidade MP3
              </p>
            </div>
            <Button className="gap-2.5 rounded-full bg-gold text-gold-foreground px-10 py-3.5 h-auto text-sm font-bold hover:brightness-110 shadow-lg shadow-gold/20 transition-all duration-300 active:scale-95">
              <Download className="h-4 w-4" />
              Baixar Todos os Louvores
            </Button>
          </div>
        </div>
      </PageContainer>

      <FooterLinks variant="full" />
    </div>
  );
}
