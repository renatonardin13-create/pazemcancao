import { useEffect, useMemo, useState } from "react";
import { Lock, Music2, Sparkles } from "lucide-react";

/**
 * Bloco "Liberação em 7 dias" — coleção MISTA (não é categoria).
 * Recebe a lista completa de faixas e seleciona até 10 com a próxima data de
 * liberação (bonus_release_date no futuro) misturando várias categorias.
 * Cada card mostra capa, título e badge discreta com a categoria de origem.
 */

const TOTAL_TRACKS = 10;

interface RawTrack {
  id?: string;
  title?: string;
  cover_url?: string | null;
  category?: string | null;
  // possíveis campos de liberação no banco — aceitamos vários nomes
  bonus_release_date?: string | null;
  release_at?: string | null;
  unlock_at?: string | null;
  drip_release_date?: string | null;
  locked_until?: string | null;
  available_after_days?: number | null;
  // possíveis campos de categoria
  category_name?: string | null;
  theme?: string | null;
  collection_origin?: string | null;
  is_bonus?: boolean;
  [k: string]: any;
}

interface UpcomingItem {
  id: string;
  title: string;
  cover: string | null;
  category: string;
  releaseAt: number; // timestamp ms
}

function cleanCategoryLabel(value: unknown): string {
  if (typeof value !== "string") return "";
  // remove emojis/símbolos e parênteses extras: "⭐ Destaques (Top 10)" → "Destaques"
  return value
    .replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, "")
    .replace(/\s*\([^)]*\)\s*/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function resolveReleaseTimestamp(t: RawTrack): number | null {
  const candidates = [
    t.bonus_release_date,
    t.release_at,
    t.unlock_at,
    t.drip_release_date,
    t.locked_until,
  ];
  for (const c of candidates) {
    if (!c) continue;
    const ts = new Date(c as string).getTime();
    if (Number.isFinite(ts)) return ts;
  }
  if (typeof t.available_after_days === "number" && t.available_after_days > 0) {
    return Date.now() + t.available_after_days * 86400_000;
  }
  return null;
}

function resolveCategory(t: RawTrack): string {
  return (
    cleanCategoryLabel(t.category_name) ||
    cleanCategoryLabel(t.category) ||
    cleanCategoryLabel(t.theme) ||
    cleanCategoryLabel(t.collection_origin) ||
    "Especial"
  );
}

function pickMixedUpcoming(tracks: RawTrack[]): UpcomingItem[] {
  const now = Date.now();
  const enriched: UpcomingItem[] = [];

  for (const t of tracks) {
    const releaseAt = resolveReleaseTimestamp(t);
    if (!releaseAt || releaseAt <= now) continue;
    if (!t.id || !t.title) continue;
    enriched.push({
      id: String(t.id),
      title: String(t.title),
      cover: (t.cover_url as string) || null,
      category: resolveCategory(t),
      releaseAt,
    });
  }

  // Ordena pela liberação mais próxima
  enriched.sort((a, b) => a.releaseAt - b.releaseAt);

  // Mistura por categoria — round-robin para não repetir a mesma categoria seguida
  const byCat = new Map<string, UpcomingItem[]>();
  for (const item of enriched) {
    const arr = byCat.get(item.category) || [];
    arr.push(item);
    byCat.set(item.category, arr);
  }
  const queues = Array.from(byCat.values());
  const mixed: UpcomingItem[] = [];
  while (mixed.length < TOTAL_TRACKS && queues.some((q) => q.length > 0)) {
    for (const q of queues) {
      if (mixed.length >= TOTAL_TRACKS) break;
      const next = q.shift();
      if (next) mixed.push(next);
    }
  }
  return mixed;
}

function formatRemaining(ms: number) {
  if (ms <= 0) return { d: 0, h: 0, m: 0, s: 0 };
  const total = Math.floor(ms / 1000);
  return {
    d: Math.floor(total / 86400),
    h: Math.floor((total % 86400) / 3600),
    m: Math.floor((total % 3600) / 60),
    s: total % 60,
  };
}

const pad = (n: number) => String(n).padStart(2, "0");

export function UpcomingReleaseBlock({ tracks = [] as RawTrack[], excludeIds = [] }: { tracks?: RawTrack[]; excludeIds?: string[] }) {
  const items = useMemo(() => {
    const exclude = new Set(excludeIds.map(String));
    return pickMixedUpcoming(tracks).filter((it) => !exclude.has(it.id));
  }, [tracks, excludeIds]);
  const [now, setNow] = useState<number>(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  // Contador regressivo aponta para a próxima liberação real
  const targetTs = items[0]?.releaseAt ?? Date.now() + 7 * 86400_000;
  const remaining = formatRemaining(targetTs - now);

  if (!items.length) return null;

  return (
    <section aria-labelledby="upcoming-release-title">
      <div className="relative overflow-hidden rounded-3xl border border-gold/25 bg-gradient-to-br from-gold/[0.07] via-background to-background p-5 shadow-[0_10px_40px_-20px_hsl(var(--primary)/0.5)] sm:p-6 lg:p-8">
        <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-gold/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-16 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />

        <div className="relative grid gap-6 lg:grid-cols-[minmax(0,280px)_1fr] lg:items-center lg:gap-10">
          {/* Esquerda — info */}
          <div className="flex flex-col gap-4">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-gold/90">
              <Sparkles className="h-3 w-3" />
              Coleção especial
            </div>
            <div className="space-y-2">
              <h2 id="upcoming-release-title" className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Liberação em 7 dias
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground/80">
                {items.length} louvores selecionados de várias categorias para sua próxima liberação.
              </p>
            </div>

            <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
              {[
                { label: "Dias", value: remaining.d },
                { label: "Hrs", value: remaining.h },
                { label: "Min", value: remaining.m },
                { label: "Seg", value: remaining.s },
              ].map((item) => (
                <div key={item.label} className="rounded-xl border border-gold/20 bg-background/60 px-1.5 py-2 text-center backdrop-blur">
                  <div className="font-display text-lg font-bold tabular-nums text-gold sm:text-xl">{pad(item.value)}</div>
                  <div className="mt-0.5 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground/70">{item.label}</div>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 text-[11px] text-muted-foreground/70">
              <Lock className="h-3 w-3 text-gold/70" />
              <span>Disponível automaticamente após a contagem</span>
            </div>
          </div>

          {/* Direita — cards reais misturados */}
          <div className="-mx-1 flex snap-x snap-mandatory gap-3 overflow-x-auto px-1 pb-2 [scrollbar-width:thin] sm:gap-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="group relative flex h-[200px] w-[132px] shrink-0 snap-start flex-col overflow-hidden rounded-2xl border border-gold/20 bg-card/40 shadow-[0_6px_20px_-10px_rgba(0,0,0,0.6)] transition-all duration-300 hover:-translate-y-1 hover:border-gold/40 sm:h-[210px] sm:w-[140px]"
              >
                {/* Capa */}
                <div className="relative h-[120px] w-full overflow-hidden bg-gradient-to-br from-card/80 to-background">
                  {item.cover ? (
                    <img
                      src={item.cover}
                      alt={item.title}
                      loading="lazy"
                      className="h-full w-full object-cover opacity-70 blur-[1px] transition group-hover:opacity-85"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <Music2 className="h-8 w-8 text-gold/60" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/30 to-transparent" />
                  {/* Lock central */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full border border-gold/30 bg-background/70 backdrop-blur">
                      <Lock className="h-4 w-4 text-gold/90" />
                    </div>
                  </div>
                  {/* Badge categoria de origem */}
                  <div className="absolute left-1.5 top-1.5 max-w-[calc(100%-12px)] truncate rounded-full border border-gold/30 bg-background/80 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-gold/90 backdrop-blur">
                    {item.category}
                  </div>
                </div>
                {/* Título */}
                <div className="flex flex-1 flex-col justify-center px-2.5 py-2">
                  <div className="line-clamp-2 text-[11px] font-semibold leading-tight text-foreground/90">
                    {item.title}
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
