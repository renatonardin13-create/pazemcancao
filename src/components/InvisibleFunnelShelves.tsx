import { useQuery } from "@tanstack/react-query";
import { getFunnelSuggestions, type FunnelSuggestion } from "@/lib/funnel.functions";
import { logFunnelClick } from "@/lib/funnel-analytics.functions";
import { Sparkles, ChevronLeft, ChevronRight, Play, BookOpen, Music } from "lucide-react";
import { useRef, useState, useCallback, useEffect, memo } from "react";
import { CourseShelfCard } from "@/components/CourseShelfCard";
import { ContentCard } from "@/components/ContentCard";

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

/**
 * Adapta uma sugestão do funil para o card-base correto:
 * - course   → CourseShelfCard (já cuida de lock, sales, navegação)
 * - content  → ContentCard     (mesmo da página /bonus, /ebooks, /conteudo)
 * - track    → ContentCard     (renderizado como "material" para padronização visual)
 *
 * Garante que TODO card no app passe por um dos dois componentes oficiais,
 * mantendo proporção 9:13, badges, overlay de lock e meta uniformes.
 */
const FunnelPosterCard = memo(function FunnelPosterCard({
  item,
  index,
  context,
  shelfTitle,
}: {
  item: FunnelSuggestion;
  index: number;
  context?: string;
  shelfTitle?: string;
}) {
  const trackClick = useCallback(() => {
    logFunnelClick({
      data: {
        itemId: item.id,
        itemType: item.type,
        context,
        shelfTitle,
        isLocked: item.is_locked,
      },
    }).catch(() => {});
  }, [item.id, item.type, item.is_locked, context, shelfTitle]);

  if (item.type === "course") {
    const courseLike = {
      id: item.id,
      title: item.title,
      cover_image_url: item.cover_url,
      sales_page_url: item.sales_page_url,
      access_state: item.is_locked ? "locked" : "enrolled",
      progress_pct: 0,
      total_lessons: 0,
      short_description: "",
      category_name: "",
    };
    return (
      <div onClickCapture={trackClick}>
        <CourseShelfCard
          course={courseLike}
          index={index}
          badge={
            item.badge ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gold/90 text-[9px] sm:text-[10px] font-bold text-gold-foreground uppercase tracking-wide shadow-lg shadow-black/30 backdrop-blur-sm border border-gold/20">
                {item.badge}
              </span>
            ) : undefined
          }
        />
      </div>
    );
  }

  // content / track → ContentCard (Card Master para conteúdos)
  const TypeIcon = item.type === "track" ? Music : item.type === "content" ? BookOpen : Play;
  const contentLike = {
    id: item.id,
    title: item.title,
    cover_url: item.cover_url,
    card_cover_url: item.cover_url,
    description: "",
    sales_page_url: item.sales_page_url,
    is_free: !item.is_locked,
    unlocked: !item.is_locked,
    effectiveAccessMode: item.is_locked ? "pago" : "gratuito",
    content_type: item.type === "track" ? "audio" : "video",
    badge_text: item.badge,
    locked_label: item.cta_text || "Conteúdo Premium",
    created_at: new Date().toISOString(),
    launch_mode: "none",
    is_active: true,
  };

  return (
    <div onClickCapture={trackClick}>
      <ContentCard
        item={contentLike}
        index={index}
        hasAccess={!item.is_locked}
        gradient={
          item.is_locked
            ? "from-stone-900/40 via-zinc-950/30 to-neutral-950/50"
            : "from-sky-900/40 via-blue-950/30 to-slate-950/50"
        }
        TypeIcon={TypeIcon}
      />
    </div>
  );
});
