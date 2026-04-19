import { useEffect, useState } from "react";
import { Lock, Music2, Sparkles } from "lucide-react";

/**
 * Bloco especial "Liberação em 7 dias" — coleção temporária visualmente
 * destacada. NÃO é categoria nem entra nos filtros normais. Renderiza 10
 * cards bloqueados em grid horizontal com contador regressivo.
 *
 * O alvo de liberação é fixado em 7 dias a partir da primeira renderização
 * do navegador (persistido em localStorage para estabilidade entre sessões).
 */

const STORAGE_KEY = "louvores:upcoming-release-target";
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
const TOTAL_TRACKS = 10;

function getReleaseTarget(): number {
  if (typeof window === "undefined") return Date.now() + SEVEN_DAYS_MS;
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const ts = Number(saved);
      if (Number.isFinite(ts) && ts > Date.now()) return ts;
    }
  } catch {
    // ignore
  }
  const target = Date.now() + SEVEN_DAYS_MS;
  try {
    window.localStorage.setItem(STORAGE_KEY, String(target));
  } catch {
    // ignore
  }
  return target;
}

function formatRemaining(ms: number) {
  if (ms <= 0) return { d: 0, h: 0, m: 0, s: 0 };
  const totalSeconds = Math.floor(ms / 1000);
  const d = Math.floor(totalSeconds / 86400);
  const h = Math.floor((totalSeconds % 86400) / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return { d, h, m, s };
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export function UpcomingReleaseBlock() {
  const [target, setTarget] = useState<number | null>(null);
  const [now, setNow] = useState<number>(() => Date.now());

  useEffect(() => {
    setTarget(getReleaseTarget());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const remaining = target ? formatRemaining(target - now) : { d: 7, h: 0, m: 0, s: 0 };

  return (
    <section aria-labelledby="upcoming-release-title">
      <div className="relative overflow-hidden rounded-3xl border border-gold/25 bg-gradient-to-br from-gold/[0.07] via-background to-background p-5 shadow-[0_10px_40px_-20px_hsl(var(--primary)/0.5)] sm:p-7">
        {/* Glow decorativo */}
        <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-gold/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-16 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />

        <div className="relative grid gap-6 lg:grid-cols-[minmax(0,260px)_1fr] lg:gap-8">
          {/* Coluna esquerda — informação */}
          <div className="flex flex-col gap-4">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-gold/90">
              <Sparkles className="h-3 w-3" />
              Coleção especial
            </div>

            <div className="space-y-2">
              <h2
                id="upcoming-release-title"
                className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl"
              >
                Liberação em 7 dias
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground/80">
                10 novos louvores selecionados para sua próxima liberação.
              </p>
            </div>

            {/* Contador regressivo */}
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: "Dias", value: remaining.d },
                { label: "Hrs", value: remaining.h },
                { label: "Min", value: remaining.m },
                { label: "Seg", value: remaining.s },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-xl border border-gold/20 bg-background/60 px-2 py-2 text-center backdrop-blur"
                >
                  <div className="font-display text-lg font-bold tabular-nums text-gold sm:text-xl">
                    {pad(item.value)}
                  </div>
                  <div className="mt-0.5 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                    {item.label}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 text-[11px] text-muted-foreground/70">
              <Lock className="h-3 w-3 text-gold/70" />
              <span>Disponível automaticamente após a contagem</span>
            </div>
          </div>

          {/* Coluna direita — cards bloqueados */}
          <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-2 [scrollbar-width:thin]">
            {Array.from({ length: TOTAL_TRACKS }).map((_, idx) => (
              <div
                key={idx}
                className="group relative flex h-[170px] w-[120px] shrink-0 flex-col items-center justify-end overflow-hidden rounded-2xl border border-gold/15 bg-gradient-to-br from-card/70 via-background to-background shadow-[0_6px_20px_-10px_rgba(0,0,0,0.6)] transition-all duration-300 hover:-translate-y-1 hover:border-gold/35"
              >
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,hsl(var(--primary)/0.18),transparent_60%)]" />
                <div className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full border border-gold/30 bg-background/70 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-gold/90 backdrop-blur">
                  <Lock className="h-2.5 w-2.5" />
                  7d
                </div>
                <div className="relative flex h-full w-full flex-col items-center justify-center gap-2 px-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-gold/20 bg-gold/5">
                    <Music2 className="h-5 w-5 text-gold/70" />
                  </div>
                  <div className="text-center">
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                      Louvor
                    </div>
                    <div className="font-display text-sm font-bold text-foreground/90">
                      #{pad(idx + 1)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
