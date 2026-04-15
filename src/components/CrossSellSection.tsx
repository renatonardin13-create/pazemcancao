import { useQuery } from "@tanstack/react-query";
import { getCrossSellItems, type CrossSellItem } from "@/lib/cross-sell.functions";
import { logFunnelClick } from "@/lib/funnel-analytics.functions";
import { Link } from "@tanstack/react-router";
import { Lock, Play, Sparkles, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { OptimizedImage } from "@/components/OptimizedImage";
import { useRef, useState, useCallback, useEffect } from "react";

interface CrossSellSectionProps {
  currentType: "course" | "content" | "track";
  currentId: string;
  category?: string;
  title?: string;
  className?: string;
}

export function CrossSellSection({
  currentType,
  currentId,
  category,
  title = "Relacionados",
  className = "",
}: CrossSellSectionProps) {
  const { data, isLoading } = useQuery({
    queryKey: ["cross-sell", currentType, currentId],
    queryFn: () =>
      getCrossSellItems({
        data: { currentType, currentId, category, limit: 8 },
      }),
    staleTime: 5 * 60_000,
    refetchOnWindowFocus: false,
  });

  const items = data?.items || [];
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (el) el.addEventListener("scroll", checkScroll, { passive: true });
    return () => el?.removeEventListener("scroll", checkScroll);
  }, [checkScroll, items]);

  const scroll = (dir: "left" | "right") => {
    scrollRef.current?.scrollBy({
      left: dir === "left" ? -240 : 240,
      behavior: "smooth",
    });
  };

  if (isLoading || items.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
      className={className}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-gold/60" />
          <h3 className="text-sm font-bold text-foreground/80 tracking-tight">
            {title}
          </h3>
          <span className="text-[10px] text-muted-foreground/40 ml-1">
            {items.length} itens
          </span>
        </div>
        {/* Scroll arrows */}
        <div className="flex gap-1.5">
          {canScrollLeft && (
            <button
              onClick={() => scroll("left")}
              className="h-7 w-7 rounded-lg border border-border/20 bg-card/50 flex items-center justify-center text-muted-foreground/50 hover:text-foreground hover:border-border/40 transition-colors"
            >
              ‹
            </button>
          )}
          {canScrollRight && (
            <button
              onClick={() => scroll("right")}
              className="h-7 w-7 rounded-lg border border-border/20 bg-card/50 flex items-center justify-center text-muted-foreground/50 hover:text-foreground hover:border-border/40 transition-colors"
            >
              ›
            </button>
          )}
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory"
      >
        {items.map((item) => (
          <CrossSellCard key={`${item.type}-${item.id}`} item={item} context={currentType} />
        ))}
      </div>
    </motion.div>
  );
}

function CrossSellCard({ item, context }: { item: CrossSellItem; context?: string }) {
  const isLocked = item.is_locked;
  const hasSalesPage = !!item.sales_page_url;

  const linkTo =
    item.type === "course"
      ? `/cursos/${item.id}`
      : item.type === "track"
        ? `/musicas/${item.id}`
        : `/conteudo/${item.id}`;

  const cardContent = (
    <div className="group relative w-[155px] shrink-0 snap-start cursor-pointer">
      {/* Poster card — 9:13 aspect ratio like the rest of the system */}
      <div className="relative aspect-[9/13] rounded-xl overflow-hidden border border-border/10 bg-card/30 transition-all duration-300 group-hover:border-gold/20 group-hover:shadow-lg group-hover:shadow-gold/5">
        {/* Cover image */}
        {item.cover_url ? (
          <img
            src={item.cover_url}
            alt={item.title}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-gold/10 to-gold/[0.02] flex items-center justify-center">
            <Sparkles className="h-8 w-8 text-muted-foreground/15" />
          </div>
        )}

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Lock overlay */}
        {isLocked && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[1px]">
            <div className="flex flex-col items-center gap-1.5">
              <Lock className="h-5 w-5 text-white/60" />
              {hasSalesPage && (
                <span className="text-[9px] font-bold text-white/50 uppercase tracking-wider flex items-center gap-1">
                  Desbloquear <ExternalLink className="h-2.5 w-2.5" />
                </span>
              )}
            </div>
          </div>
        )}

        {/* Play indicator for unlocked */}
        {!isLocked && (
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gold/90 shadow-lg">
              <Play className="h-3 w-3 text-background fill-background ml-0.5" />
            </div>
          </div>
        )}

        {/* Title at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <p className="text-[11px] font-bold text-white leading-tight line-clamp-2 drop-shadow-lg">
            {item.title}
          </p>
          {item.category && (
            <span className="text-[9px] text-white/50 mt-1 block truncate">
              {item.category}
            </span>
          )}
        </div>

        {/* Type badge */}
        <div className="absolute top-2 left-2">
          <span className="text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-black/50 text-white/60 backdrop-blur-sm">
            {item.type === "course" ? "Curso" : item.type === "track" ? "Música" : "Conteúdo"}
          </span>
        </div>
      </div>
    </div>
  );

  // Locked with sales page → external link
  if (isLocked && hasSalesPage) {
    return (
      <a href={item.sales_page_url!} target="_blank" rel="noopener noreferrer">
        {cardContent}
      </a>
    );
  }

  // Locked without sales page → no navigation
  if (isLocked) {
    return cardContent;
  }

  // Unlocked → internal navigation
  return <Link to={linkTo as any}>{cardContent}</Link>;
}
