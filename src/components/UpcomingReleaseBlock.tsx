import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Lock, Music2, Play, Heart, Moon, Flame, Shield, Sparkles, Star, Sword } from "lucide-react";

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

function pickFallbackItems(tracks: RawTrack[], excludeIds: string[], existingIds: string[]): UpcomingItem[] {
  const excluded = new Set([...excludeIds.map(String), ...existingIds.map(String)]);
  const fallbackTs = Date.now() + 7 * 86400_000;

  return tracks
    .filter((track) => track.id && track.title && !excluded.has(String(track.id)))
    .sort((a, b) => (a?.sort_order ?? 0) - (b?.sort_order ?? 0))
    .slice(0, TOTAL_TRACKS)
    .map((track) => ({
      id: String(track.id),
      title: String(track.title),
      cover: (track.cover_url as string) || null,
      category: resolveCategory(track),
      releaseAt: resolveReleaseTimestamp(track) ?? fallbackTs,
    }));
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
    const mixedUpcoming = pickMixedUpcoming(tracks).filter((it) => !excludeIds.map(String).includes(it.id));
    if (mixedUpcoming.length >= TOTAL_TRACKS) return mixedUpcoming.slice(0, TOTAL_TRACKS);

    const fallback = pickFallbackItems(
      tracks,
      excludeIds,
      mixedUpcoming.map((item) => item.id),
    );

    return [...mixedUpcoming, ...fallback].slice(0, TOTAL_TRACKS);
  }, [tracks, excludeIds]);

  const [now, setNow] = useState<number>(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const targetTs = items.find((item) => item.releaseAt > now)?.releaseAt ?? Date.now() + 7 * 86400_000;
  const remaining = formatRemaining(targetTs - now);

  if (!items.length) return null;

  return (
    <section aria-labelledby="upcoming-release-title">
      <div className="overflow-hidden rounded-[22px] border border-gold/45 bg-black/95 shadow-[0_16px_48px_-24px_rgba(0,0,0,0.9)]">
        <div className="grid lg:grid-cols-[280px_1fr]">
          <div className="border-b border-gold/20 p-6 lg:border-b-0 lg:border-r">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-gold/35 bg-gold/10 text-gold">
                <Lock className="h-4 w-4" />
              </div>
              <h2 id="upcoming-release-title" className="text-[15px] font-extrabold uppercase tracking-[0.04em] text-gold">
                Liberação em 7 dias
              </h2>
            </div>

            <p className="mt-5 text-[14px] leading-6 text-foreground/85">
              10 novos louvores selecionados para sua próxima liberação.
            </p>

            <div className="mt-6 h-px w-full bg-border/60" />

            <div className="mt-6">
              <div className="text-[13px] text-foreground/75">Seu acesso será liberado em:</div>
              <div className="mt-3 grid grid-cols-4 gap-2">
                {[
                  { label: "DIAS", value: remaining.d },
                  { label: "HORAS", value: remaining.h },
                  { label: "MIN", value: remaining.m },
                  { label: "SEG", value: remaining.s },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-xl border border-gold/35 bg-background/30 px-1 py-3 text-center shadow-inner"
                  >
                    <div className="font-display text-[22px] font-bold leading-none tabular-nums text-gold">
                      {pad(item.value)}
                    </div>
                    <div className="mt-2 text-[9px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/85">
                      {item.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="min-w-0 p-5 sm:p-6">
            <div className="mb-3 flex items-center justify-end">
              <p className="truncate text-right text-[12px] text-foreground/75">
                {items.length} louvores exclusivos serão liberados para você
              </p>
            </div>

            <CarouselRow items={items} />
          </div>
        </div>
      </div>
    </section>
  );
}

function CarouselRow({ items }: { items: UpcomingItem[] }) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const updateButtons = () => {
    const el = scrollerRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  useEffect(() => {
    updateButtons();
    const el = scrollerRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateButtons, { passive: true });
    window.addEventListener("resize", updateButtons);
    return () => {
      el.removeEventListener("scroll", updateButtons);
      window.removeEventListener("resize", updateButtons);
    };
  }, [items.length]);

  const scrollByCards = (dir: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const amount = Math.max(el.clientWidth * 0.8, 200);
    el.scrollBy({ left: dir * amount, behavior: "smooth" });
  };

  return (
    <div className="relative">
      <div
        ref={scrollerRef}
        className="flex gap-4 overflow-x-auto pb-2 pr-2 scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((item) => (
          <article
            key={item.id}
            className="group flex w-[160px] shrink-0 flex-col gap-2"
          >
            <div className="relative aspect-[9/13] w-full overflow-hidden rounded-[16px] border border-gold/20 bg-card/70 shadow-[0_10px_24px_-16px_rgba(0,0,0,0.9)]">
              {item.cover ? (
                <img
                  src={item.cover}
                  alt={item.title}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-card to-background">
                  <Music2 className="h-10 w-10 text-gold/50" />
                </div>
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-transparent" />

              <div className="absolute left-2 top-2 z-10 inline-flex max-w-[calc(100%-16px)] items-center gap-1 truncate rounded-md border border-white/10 bg-background/85 px-2 py-1 text-[9px] font-semibold leading-none text-foreground backdrop-blur-md">
                <CategoryIcon category={item.category} className="h-3 w-3 shrink-0 text-gold" />
                <span className="truncate">{item.category}</span>
              </div>

              <button
                type="button"
                disabled
                aria-label="Bloqueado"
                className="absolute bottom-2 right-2 flex h-8 w-8 items-center justify-center rounded-full border border-gold/60 bg-background/85 text-gold backdrop-blur-sm"
              >
                <Lock className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="px-0.5">
              <h3 className="line-clamp-2 text-[12px] font-extrabold uppercase leading-[1.2] tracking-tight text-foreground">
                {item.title}
              </h3>
              <p className="mt-1 text-[10px] leading-[1.2] text-foreground/60">
                Min. Paz em Canção
              </p>
            </div>
          </article>
        ))}
      </div>

      {canPrev ? (
        <button
          type="button"
          aria-label="Anterior"
          onClick={() => scrollByCards(-1)}
          className="absolute left-1 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-gold/50 bg-background/90 text-gold shadow-lg backdrop-blur-md transition hover:bg-background"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      ) : null}

      {canNext ? (
        <button
          type="button"
          aria-label="Próximos"
          onClick={() => scrollByCards(1)}
          className="absolute right-1 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-gold/50 bg-background/90 text-gold shadow-lg backdrop-blur-md transition hover:bg-background"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      ) : null}
    </div>
  );
}
