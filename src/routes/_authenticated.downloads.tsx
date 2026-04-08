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
    <div className="min-h-screen bg-background pb-28 relative">
      {/* Deep atmospheric layers — night silence */}
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_50%_35%_at_50%_10%,var(--color-gold)/0.035,transparent_70%)]" />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_40%_50%_at_85%_80%,var(--color-gold)/0.018,transparent_55%)]" />

      {/* Breathing orb — alive, gentle */}
      <div className="pointer-events-none fixed top-[8%] left-1/2 -translate-x-1/2 h-[500px] w-[500px] rounded-full bg-gold/[0.015] blur-[150px] animate-breathe" />

      <AppHeader />

      {/* Entrance — contemplative, not loud */}
      <section className="relative overflow-hidden">
        <PageContainer className="py-16 sm:py-24 text-center relative z-10">
          <div className="animate-in fade-in slide-in-from-bottom-6 duration-1000">
            {/* Spiritual mark */}
            <div className="mx-auto mb-8 w-px h-12 bg-gradient-to-b from-transparent via-gold/20 to-transparent" />

            <p className="mb-4 text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.35em] text-gold/40">
              Sua Biblioteca Espiritual
            </p>

            <h1 className="font-display text-4xl sm:text-5xl font-bold text-foreground leading-[1.08] tracking-tight">
              Seus Louvores
            </h1>

            <div className="mx-auto mt-5 h-px w-14 bg-gradient-to-r from-transparent via-gold/20 to-transparent" />

            <p className="mx-auto mt-6 max-w-sm text-sm leading-[1.9] text-muted-foreground/55">
              Cada canção foi preparada com oração.
              Ouça com o coração aberto.
            </p>

            <div className="mt-8 flex items-center justify-center gap-8 text-[11px] text-muted-foreground/40">
              <span>30 faixas</span>
              <span className="text-border/40">·</span>
              <span>Download ilimitado</span>
            </div>
          </div>
        </PageContainer>

        <div className="h-px bg-gradient-to-r from-transparent via-gold/8 to-transparent" />
      </section>

      {/* Value message — intimate */}
      <PageContainer className="pt-8 sm:pt-10 animate-in fade-in duration-700 delay-300">
        <ValueMessageCard />
      </PageContainer>

      {/* Tracks */}
      <PageContainer className="py-8 sm:py-10">
        {/* Section header — quiet */}
        <div className="flex items-center gap-2.5 mb-6 animate-in fade-in duration-500 delay-400">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gold/8">
            <ListMusic className="h-3.5 w-3.5 text-gold/60" />
          </div>
          <h2 className="font-display text-base sm:text-lg font-bold text-foreground/90">
            Todas as Faixas
          </h2>
          <span className="ml-auto text-[10px] text-muted-foreground/35 font-medium">
            {filtered.length} {filtered.length === 1 ? "faixa" : "faixas"}
          </span>
        </div>

        {/* Category filter — subtle pills */}
        <div className="mb-7 -mx-4 sm:mx-0 px-4 sm:px-0 overflow-x-auto scrollbar-none">
          <div className="flex gap-2 pb-1 min-w-max sm:min-w-0 sm:flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`flex items-center gap-1.5 rounded-full px-4 sm:px-5 py-2.5 text-xs sm:text-sm font-medium transition-all duration-500 whitespace-nowrap active:scale-95 ${
                  filter === cat
                    ? "bg-gold/90 text-gold-foreground shadow-lg shadow-gold/15"
                    : "bg-card/30 border border-border/30 text-muted-foreground/60 hover:border-gold/15 hover:text-foreground/80 hover:bg-card/50"
                }`}
              >
                <span className="text-[10px]">{categoryEmojis[cat]}</span>
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Track list */}
        <div className="space-y-2">
          {filtered.map((track, i) => (
            <TrackCard key={track.id} track={track} index={i} />
          ))}
        </div>

        {/* Download all — quiet, elegant */}
        <div className="mt-20 text-center animate-in fade-in duration-700 delay-500">
          <div className="inline-flex flex-col items-center gap-5 rounded-3xl border border-border/25 bg-card/20 backdrop-blur-sm px-12 sm:px-16 py-10">
            <div className="w-px h-8 bg-gradient-to-b from-transparent via-gold/15 to-transparent" />
            <div>
              <h3 className="font-display text-lg font-bold text-foreground/90">
                Baixe Toda a Coleção
              </h3>
              <p className="mt-2 text-xs text-muted-foreground/40">
                Todos os 30 louvores em alta qualidade
              </p>
            </div>
            <Button className="gap-2.5 rounded-full bg-gold/90 text-gold-foreground px-10 py-3.5 h-auto text-sm font-bold hover:bg-gold shadow-xl shadow-gold/10 transition-all duration-500 active:scale-95">
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
