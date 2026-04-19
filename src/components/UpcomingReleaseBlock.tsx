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
      <div className="overflow-hidden rounded-[22px] border border-gold/45 bg-black/95 shadow-[0_16px_48px_-24px_rgba(0,0,0,0.9)]">
        <div className="grid lg:grid-cols-[228px_1fr]">
          <div className="border-b border-gold/20 p-5 lg:border-b-0 lg:border-r">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-gold/35 bg-gold/10 text-gold">
                <Lock className="h-4 w-4" />
              </div>
              <h2 id="upcoming-release-title" className="text-[15px] font-extrabold uppercase tracking-[0.04em] text-gold">
                Liberação em 7 dias
              </h2>
            </div>

            <p className="mt-4 max-w-[180px] text-[15px] leading-8 text-foreground/88">
              10 novos louvores selecionados para sua próxima liberação.
            </p>

            <div className="mt-5 h-px w-full bg-border/60" />

            <div className="mt-6">
              <div className="text-[15px] text-foreground/80">Seu acesso será liberado em:</div>
              <div className="mt-4 grid grid-cols-4 gap-2">
                {[
                  { label: "DIAS", value: remaining.d },
                  { label: "HORAS", value: remaining.h },
                  { label: "MINUTOS", value: remaining.m },
                  { label: "SEGUNDOS", value: remaining.s },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-xl border border-gold/35 bg-background/30 px-2 py-3 text-center shadow-inner"
                  >
                    <div className="font-display text-[24px] font-bold leading-none tabular-nums text-gold">
                      {pad(item.value)}
                    </div>
                    <div className="mt-3 text-[9px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/85">
                      {item.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-5">
            <div className="mb-4 flex items-center justify-end">
              <p className="text-right text-[15px] text-foreground/80">
                10 louvores exclusivos serão liberados para você
              </p>
            </div>

            <div className="flex gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              {items.map((item) => (
                <article
                  key={item.id}
                  className="group relative flex h-[188px] w-[96px] shrink-0 flex-col overflow-hidden rounded-[14px] border border-gold/20 bg-card/70 shadow-[0_10px_24px_-16px_rgba(0,0,0,0.9)]"
                >
                  {item.cover ? (
                    <img
                      src={item.cover}
                      alt={item.title}
                      loading="lazy"
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-card to-background">
                      <Music2 className="h-8 w-8 text-gold/50" />
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-black/10" />

                  <div className="absolute left-1.5 top-1.5 z-10 inline-flex max-w-[calc(100%-12px)] items-center gap-1 truncate rounded-md border border-white/10 bg-background/85 px-1.5 py-1 text-[8px] font-semibold leading-none text-foreground backdrop-blur-md">
                    <CategoryIcon category={item.category} className="h-2.5 w-2.5 shrink-0 text-gold" />
                    <span className="truncate">{item.category}</span>
                  </div>

                  <div className="relative mt-auto flex flex-col px-2.5 pb-2.5 pt-16">
                    <h3 className="line-clamp-3 text-[11px] font-extrabold uppercase leading-[1.12] tracking-tight text-foreground">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-[9px] leading-[1.2] text-foreground/75">
                      Min. Paz
                      <br />
                      em Canção
                    </p>
                    <div className="mt-2 flex justify-end">
                      <button
                        type="button"
                        disabled
                        aria-label="Bloqueado"
                        className="flex h-6 w-6 items-center justify-center rounded-full border border-gold/60 bg-background/85 text-gold backdrop-blur-sm"
                      >
                        <Play className="h-2.5 w-2.5 fill-current" />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
