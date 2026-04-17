import { useQuery } from "@tanstack/react-query";
import { getFunnelSuggestions, type FunnelSuggestion } from "@/lib/funnel.functions";
import { logFunnelClick } from "@/lib/funnel-analytics.functions";
import { Link } from "@tanstack/react-router";
import { Lock, Sparkles, ChevronLeft, ChevronRight, Play, ShoppingCart } from "lucide-react";
import { useRef, useState, useCallback, useEffect, memo } from "react";
import { PosterCard } from "@/components/PosterCard";

interface InvisibleFunnelShelvesProps {
  context?: string;
  /** Insert after this shelf index (0-based). -1 = all at end */
  insertAfterIndex?: number;
}

const SHELF_LABELS = [
  { title: "Recomendado para você", subtitle: "Baseado no que você já acessou" },
  { title: "Você também pode gostar", subtitle: "Descubra novos conteúdos" },
  { title: "Continue sua experiência", subtitle: "Mais para explorar" },
];

/**
 * Invisible funnel: renders 1-3 shelf-like carousels that blend with real shelves.
 * Mixes free, paid, and locked content naturally.
 */
export function InvisibleFunnelShelves({ context, insertAfterIndex }: InvisibleFunnelShelvesProps) {
  const { data, isLoading } = useQuery({
    queryKey: ["funnel-suggestions", context, 12],
    queryFn: () => getFunnelSuggestions({ data: { context, limit: 12 } }),
    staleTime: 5 * 60_000,
    refetchOnWindowFocus: false,
  });

  if (isLoading || !data?.suggestions?.length) {
    return <div className="hidden" aria-hidden="true" />;
  }

  const all = data.suggestions;

  // Split suggestions into up to 3 natural-looking shelves
  const shelves: { title: string; subtitle: string; items: FunnelSuggestion[] }[] = [];

  // Shelf 1: locked items → "Recomendado para você"
  const locked = all.filter((s) => s.is_locked);
  if (locked.length > 0) {
    shelves.push({ ...SHELF_LABELS[0], items: locked.slice(0, 6) });
  }

  // Shelf 2: unlocked items → "Você também pode gostar"
  const unlocked = all.filter((s) => !s.is_locked);
  if (unlocked.length > 0) {
    shelves.push({ ...SHELF_LABELS[1], items: unlocked.slice(0, 6) });
  }

  // Shelf 3: mix of remaining → "Continue sua experiência"
  const remaining = all.filter(
    (s) => !locked.slice(0, 6).includes(s) && !unlocked.slice(0, 6).includes(s)
  );
  if (remaining.length >= 2) {
    shelves.push({ ...SHELF_LABELS[2], items: remaining.slice(0, 6) });
  }

  if (shelves.length === 0) {
    return <div className="hidden" aria-hidden="true" />;
  }

  return (
    <>
      {shelves.map((shelf, idx) => (
        <FunnelShelf key={idx} title={shelf.title} subtitle={shelf.subtitle} items={shelf.items} shelfIdx={idx} context={context} />
      ))}
    </>
  );
}

function FunnelShelf({
  title,
  subtitle,
  items,
  shelfIdx,
  context,
}: {
  title: string;
  subtitle: string;
  items: FunnelSuggestion[];
  shelfIdx: number;
  context?: string;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }, []);

  useEffect(() => {
    const timer = setTimeout(checkScroll, 150);
    const el = scrollRef.current;
    const ro = el && typeof ResizeObserver !== "undefined" ? new ResizeObserver(checkScroll) : null;
    if (el && ro) ro.observe(el);
    return () => { clearTimeout(timer); ro?.disconnect(); };
  }, [checkScroll]);

  const scroll = useCallback((dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === "left" ? -el.clientWidth * 0.8 : el.clientWidth * 0.8, behavior: "smooth" });
  }, []);

  return (
    <section
      className="animate-in fade-in slide-in-from-bottom-4 duration-500"
      style={{ animationDelay: `${shelfIdx * 80}ms`, animationFillMode: "both" }}
    >
      {/* Shelf title — same style as vitrine shelves */}
      <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-8 lg:px-12 mb-3 sm:mb-4">
        <div className="flex items-center gap-2.5">
          <Sparkles className="h-4 w-4 text-gold flex-shrink-0" />
          <h2 className="font-display text-lg sm:text-xl font-bold text-foreground/90 tracking-tight">
            {title}
          </h2>
          <div className="flex-1 h-px bg-gradient-to-r from-gold/10 to-transparent" />
          <span className="text-[10px] sm:text-xs text-muted-foreground/40 uppercase tracking-wider font-medium">
            {items.length} título{items.length !== 1 ? "s" : ""}
          </span>
        </div>
        <p className="text-[11px] text-muted-foreground/40 mt-0.5 ml-[30px]">{subtitle}</p>
      </div>

      {/* Carousel — identical structure to NetflixCarousel */}
      <div className="relative group/shelf">
        {canScrollLeft && (
          <button
            onClick={() => scroll("left")}
            aria-label="Anterior"
            className="absolute left-0 top-0 bottom-0 z-20 w-10 sm:w-14 lg:w-16 flex items-center justify-center bg-gradient-to-r from-background/95 via-background/70 to-transparent text-foreground/60 active:text-gold sm:text-foreground/50 sm:hover:text-gold transition-colors lg:opacity-0 lg:group-hover/shelf:opacity-100"
          >
            <ChevronLeft className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8" />
          </button>
        )}
        {canScrollRight && (
          <button
            onClick={() => scroll("right")}
            aria-label="Próximo"
            className="absolute right-0 top-0 bottom-0 z-20 w-10 sm:w-14 lg:w-16 flex items-center justify-center bg-gradient-to-l from-background/95 via-background/70 to-transparent text-foreground/60 active:text-gold sm:text-foreground/50 sm:hover:text-gold transition-colors lg:opacity-0 lg:group-hover/shelf:opacity-100"
          >
            <ChevronRight className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8" />
          </button>
        )}

        <div
          ref={scrollRef}
          onScroll={checkScroll}
          className="flex gap-2.5 sm:gap-3.5 lg:gap-4 overflow-x-auto pb-4 px-3 sm:px-6 lg:px-12 scrollbar-hide snap-x snap-mandatory touch-pan-x"
          style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" } as any}
        >
          <div className="shrink-0 w-0 lg:w-[calc((100vw-1400px)/2)]" />
          {items.map((item, idx) => (
            <div key={`${item.type}-${item.id}`} className="w-[150px] sm:w-[190px] md:w-[220px] lg:w-[240px] shrink-0 snap-start">
              <FunnelPosterCard item={item} index={idx} context={context} shelfTitle={title} />
            </div>
          ))}
          <div className="shrink-0 w-0 lg:w-[calc((100vw-1400px)/2)]" />
        </div>
      </div>
    </section>
  );
}

/** Poster card unificado — usa PosterCard (Card Master) para garantir
 *  consistência visual com TrackCard / ContentCard / CourseShelfCard. */
const FunnelPosterCard = memo(function FunnelPosterCard({ item, index, context, shelfTitle }: { item: FunnelSuggestion; index: number; context?: string; shelfTitle?: string }) {
  const isLocked = item.is_locked;
  const salesUrl = item.sales_page_url;

  const linkTo =
    item.type === "course"
      ? `/cursos/${item.id}`
      : item.type === "track"
        ? `/musicas/${item.id}`
        : `/conteudo/${item.id}`;

  const typeLabel = item.type === "course" ? "Curso" : item.type === "track" ? "Música" : "Conteúdo";

  const fallback = (
    <div className="flex h-16 w-16 items-center justify-center rounded-2xl backdrop-blur-sm bg-white/[0.04] border border-white/[0.06]">
      <Sparkles className="h-7 w-7 text-white/25" />
    </div>
  );

  const badgeTopLeft = item.badge ? (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gold/90 text-[9px] sm:text-[10px] font-bold text-gold-foreground uppercase tracking-wide shadow-lg shadow-black/30 backdrop-blur-sm border border-gold/20">
      {item.badge}
    </span>
  ) : isLocked ? (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-r from-gold/95 to-amber-500/90 text-[9px] sm:text-[10px] font-bold text-gold-foreground uppercase tracking-wide shadow-lg shadow-black/30 backdrop-blur-sm border border-gold/20">
      <Lock className="h-2.5 w-2.5" />
      Premium
    </span>
  ) : undefined;

  const badgeTopRight = (
    <span className="text-[9px] sm:text-[10px] font-medium tracking-[0.15em] uppercase rounded-full bg-black/25 backdrop-blur-md border border-white/[0.06] px-2.5 py-1 text-white/35">
      {typeLabel}
    </span>
  );

  const overlay = isLocked ? (
    <div className="h-full bg-black/40 backdrop-blur-[2px] flex flex-col items-center justify-center gap-2">
      <div className="flex h-14 w-14 rounded-2xl items-center justify-center backdrop-blur-sm bg-black/30 border border-white/10">
        <Lock className="h-6 w-6 text-white/50" />
      </div>
      <span className="text-[10px] font-bold text-gold/70 bg-black/40 backdrop-blur-sm rounded-full px-3 py-0.5 border border-gold/15">
        {item.cta_text || "Desbloquear"}
      </span>
    </div>
  ) : undefined;

  const centerAction = !isLocked ? (
    <div className="flex items-center gap-2 px-5 py-2.5 sm:px-6 sm:py-3 rounded-full bg-gold/95 shadow-[0_4px_24px_rgba(0,0,0,0.4)] scale-[0.5] opacity-0 md:group-hover/card:opacity-100 md:group-hover/card:scale-100 md:transition-all md:duration-500">
      <Play className="h-4 w-4 sm:h-5 sm:w-5 text-gold-foreground fill-gold-foreground" />
    </div>
  ) : undefined;

  const meta = isLocked ? (
    <span className="text-[9px] sm:text-[10px] font-semibold tracking-[0.15em] uppercase text-gold/55">
      <ShoppingCart className="inline h-2.5 w-2.5 mr-0.5" />
      {salesUrl ? "Ver detalhes" : "Bloqueado"}
    </span>
  ) : (
    <span className="text-[9px] sm:text-[10px] font-semibold tracking-[0.15em] uppercase text-gold/55">
      <Sparkles className="inline h-2.5 w-2.5 mr-0.5" />
      Acessar
    </span>
  );

  const card = (
    <PosterCard
      cover={item.cover_url || null}
      coverAlt={item.title}
      fallback={fallback}
      gradientClass={isLocked ? "from-stone-900/40 via-zinc-950/30 to-neutral-950/50" : "from-sky-900/40 via-blue-950/30 to-slate-950/50"}
      badgeTopLeft={badgeTopLeft}
      badgeTopRight={badgeTopRight}
      overlay={overlay}
      centerAction={centerAction}
      title={item.title}
      meta={meta}
      locked={isLocked}
      index={index}
    />
  );

  const trackClick = () => {
    logFunnelClick({
      data: {
        itemId: item.id,
        itemType: item.type,
        context,
        shelfTitle,
        isLocked,
      },
    }).catch(() => {});
  };

  if (isLocked && salesUrl) {
    return (
      <a href={salesUrl} target="_blank" rel="noopener noreferrer" className="group/card relative block cursor-pointer" onClick={trackClick}>
        {card}
      </a>
    );
  }

  if (isLocked) {
    return <div className="group/card relative block" onClick={trackClick}>{card}</div>;
  }

  return (
    <Link to={linkTo as any} className="group/card relative block cursor-pointer" onClick={trackClick}>
      {card}
    </Link>
  );
});
