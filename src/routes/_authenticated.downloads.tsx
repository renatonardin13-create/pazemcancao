import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Music, LogOut, Download, Headphones, Heart } from "lucide-react";
import { useState } from "react";
import { sampleTracks } from "@/lib/sample-tracks";
import { TrackCard } from "@/components/TrackCard";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/_authenticated/downloads")({
  component: DownloadsPage,
});

const categories = ["Todos", "Paz", "Cura", "Força", "Oração", "Madrugada", "Presença", "Refúgio"];

function DownloadsPage() {
  const [filter, setFilter] = useState("Todos");
  const { logout } = useAuth();

  const filtered =
    filter === "Todos"
      ? sampleTracks
      : sampleTracks.filter((t) => t.category === filter);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gold/10 border border-gold/30">
              <Music className="h-4 w-4 text-gold" />
            </div>
            <div>
              <span className="font-display text-lg font-bold text-foreground">
                Paz em Canção
              </span>
              <p className="text-xs text-muted-foreground hidden sm:block">
                30 Louvores Inéditos que Tocam a Alma
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 text-muted-foreground uppercase text-xs font-semibold tracking-wide"
            onClick={() => logout()}
          >
            <LogOut className="h-4 w-4" />
            Sair
          </Button>
        </div>
      </header>

      {/* Hero section */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,var(--color-gold)/0.06,transparent_60%)]" />
        <div className="mx-auto max-w-5xl px-6 py-16 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p className="mb-2 text-xs font-medium uppercase tracking-[0.2em] text-gold">
              Sua Biblioteca Privada
            </p>
            <h1 className="font-display text-4xl font-bold text-foreground sm:text-5xl">
              Seus Louvores Exclusivos
            </h1>
            <p className="mx-auto mt-4 max-w-lg text-base text-muted-foreground">
              Acesse, ouça e baixe abaixo seus 30 louvores inéditos protegidos.
            </p>

            <div className="mt-8 flex items-center justify-center gap-6">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Headphones className="h-4 w-4 text-gold" />
                30 faixas
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Download className="h-4 w-4 text-gold" />
                Download ilimitado
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Value message */}
      <section className="mx-auto max-w-5xl px-6 pt-10">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="rounded-xl border border-gold/20 bg-gold/5 px-6 py-5 flex items-start gap-4"
        >
          <Heart className="h-5 w-5 text-gold shrink-0 mt-0.5" />
          <p className="text-sm leading-relaxed text-foreground/80">
            Essas canções foram preparadas para ser paz nos seus dias difíceis, força na sua
            caminhada e presença de Deus nos seus momentos mais silenciosos.
          </p>
        </motion.div>
      </section>

      {/* Filters + Tracks */}
      <main className="mx-auto max-w-5xl px-6 py-10">
        {/* Category filter */}
        <div className="mb-8 flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`rounded-full px-5 py-2 text-sm font-medium transition-colors ${
                filter === cat
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted text-muted-foreground hover:bg-accent"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Track list */}
        <div className="space-y-3">
          {filtered.map((track, i) => (
            <TrackCard key={track.id} track={track} index={i} />
          ))}
        </div>

        {/* Download all */}
        <div className="mt-12 text-center">
          <Button className="gap-2 rounded-full bg-gold text-gold-foreground px-8 py-3 font-semibold hover:brightness-110 shadow-lg">
            <Download className="h-4 w-4" />
            Baixar Todos os Louvores
          </Button>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Paz em Canção · Todos os direitos reservados
      </footer>
    </div>
  );
}
