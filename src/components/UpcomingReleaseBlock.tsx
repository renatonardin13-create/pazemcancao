import { useEffect, useMemo, useState } from "react";
import { Lock, Music2, Play, Heart, Moon, Flame, Shield, Sparkles, Star, Sword } from "lucide-react";

/**
 * Bloco "Liberação em 7 dias" — coleção MISTA (não é categoria).
 * Layout horizontal pleno: à esquerda info + contador, à direita carrossel
 * de cards reais com capa nítida, badge dourado da categoria de origem
 * (com ícone), título em caixa alta e rodapé com autor + play.
 */

const TOTAL_TRACKS = 10;

interface RawTrack {
  id?: string;
  title?: string;
  cover_url?: string | null;
  category?: string | null;
  bonus_release_date?: string | null;
  release_at?: string | null;
  unlock_at?: string | null;
  drip_release_date?: string | null;
  locked_until?: string | null;
  available_after_days?: number | null;
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
  releaseAt: number;
}

function cleanCategoryLabel(value: unknown): string {
  if (typeof value !== "string") return "";
  return value
    .replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, "")
    .replace(/\s*\([^)]*\)\s*/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function resolveReleaseTimestamp(t: RawTrack): number | null {
  const candidates = [t.bonus_release_date, t.release_at, t.unlock_at, t.drip_release_date, t.locked_until];
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
  enriched.sort((a, b) => a.releaseAt - b.releaseAt);
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

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  ansiedade: Moon,
  "cura da alma": Heart,
  refugio: Shield,
  "refúgio": Shield,
  "nao desista": Flame,
  "não desista": Flame,
  "soldado ferido": Sword,
  adoracao: Sparkles,
  "adoração": Sparkles,
  classicos: Star,
  "clássicos": Star,
  destaques: Star,
};

function CategoryIcon({ category, className }: { category: string; className?: string }) {
  const key = category.toLowerCase().trim();
  const Icon = CATEGORY_ICONS[key] || Music2;
  return <Icon className={className} />;
}

export function UpcomingReleaseBlock({
  tracks = [] as RawTrack[],
  excludeIds = [],
}: {
  tracks?: RawTrack[];
  excludeIds?: string[];
}) {
  const items = useMemo(() => {
    const exclude = new Set(excludeIds.map(String));
    return pickMixedUpcoming(tracks).filter((it) => !exclude.has(it.id));
  }, [tracks, excludeIds]);

  const [now, setNow] = useState<number>(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const targetTs = items[0]?.releaseAt ?? Date.now() + 7 * 86400_000;
  const remaining = formatRemaining(targetTs - now);

  if (!items.length) return null;

  return (
    <section aria-labelledby="upcoming-release-title">
      <div className="relative overflow-hidden rounded-3xl border border-gold/30 bg-gradient-to-br from-gold/[0.04] via-background to-background p-5 shadow-[0_10px_40px_-20px_hsl(var(--primary)/0.5)] sm:p-6 lg:p-7">
        <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-gold/15 blur-3xl" />

        {/* Header da faixa */}
        <div className="relative mb-5 flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-gold" />
            <h2 id="upcoming-release-title" className="text-sm font-bold uppercase tracking-[0.22em] text-gold">
              Liberação em 7 dias
            </h2>
          </div>
          <p className="hidden text-xs text-muted-foreground/80 sm:block">
            {items.length} louvores exclusivos serão liberados para você
          </p>
        </div>

        <div className="relative grid gap-6 lg:grid-cols-[260px_1fr] lg:items-start lg:gap-8">
          {/* Esquerda — info + contador */}
          <div className="flex flex-col gap-4">
            <p className="text-sm leading-relaxed text-foreground/90">
              {items.length} novos louvores selecionados para sua próxima liberação.
            </p>

            <div className="space-y-2">
              <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/70">
                Seu acesso será liberado em:
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { label: "Dias", value: remaining.d },
                  { label: "Horas", value: remaining.h },
                  { label: "Minutos", value: remaining.m },
                  { label: "Segundos", value: remaining.s },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-xl border border-gold/25 bg-background/60 px-1.5 py-2 text-center backdrop-blur"
                  >
                    <div className="font-display text-xl font-bold tabular-nums text-gold">{pad(item.value)}</div>
                    <div className="mt-0.5 text-[8px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                      {item.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Direita — cards */}
          <div className="-mx-1 flex snap-x snap-mandatory gap-3 overflow-x-auto px-1 pb-2 [scrollbar-width:thin]">
            {items.map((item) => (
              <article
                key={item.id}
                className="group relative flex h-[230px] w-[148px] shrink-0 snap-start flex-col overflow-hidden rounded-2xl border border-gold/25 bg-card/60 shadow-[0_6px_20px_-10px_rgba(0,0,0,0.7)] transition-all duration-300 hover:-translate-y-1 hover:border-gold/50"
              >
                {/* Capa nítida ocupando o card todo */}
                {item.cover ? (
                  <img
                    src={item.cover}
                    alt={item.title}
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover transition group-hover:scale-[1.03]"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-card to-background">
                    <Music2 className="h-10 w-10 text-gold/50" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/50 to-background/10" />

                {/* Badge categoria com ícone */}
                <div className="absolute left-2 top-2 z-10 inline-flex max-w-[calc(100%-16px)] items-center gap-1 truncate rounded-full border border-gold/40 bg-background/85 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-gold backdrop-blur">
                  <CategoryIcon category={item.category} className="h-2.5 w-2.5 shrink-0" />
                  <span className="truncate">{item.category}</span>
                </div>

                {/* Conteúdo inferior */}
                <div className="relative mt-auto flex flex-col gap-1 p-2.5">
                  <h3 className="line-clamp-2 text-[11px] font-bold uppercase leading-tight tracking-wide text-foreground">
                    {item.title}
                  </h3>
                  <div className="flex items-end justify-between gap-1.5">
                    <p className="text-[9px] leading-tight text-muted-foreground/80">
                      Min. Paz<br />em Canção
                    </p>
                    <button
                      type="button"
                      disabled
                      aria-label="Bloqueado"
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-gold/50 bg-gold/15 text-gold backdrop-blur transition group-hover:bg-gold/25"
                    >
                      <Play className="h-3 w-3 fill-current" />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
