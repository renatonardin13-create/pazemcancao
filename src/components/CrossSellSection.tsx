import { useQuery } from "@tanstack/react-query";
import { getCrossSellItems, type CrossSellItem } from "@/lib/cross-sell.functions";
import { logFunnelClick } from "@/lib/funnel-analytics.functions";
import { Link } from "@tanstack/react-router";
import { Lock, Play, Sparkles, ExternalLink, ShoppingCart } from "lucide-react";
import { motion } from "framer-motion";
import { PosterCard } from "@/components/PosterCard";
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

  const typeLabel = item.type === "course" ? "Curso" : item.type === "track" ? "Música" : "Conteúdo";

  const fallback = (
    <div className="flex h-14 w-14 items-center justify-center rounded-2xl backdrop-blur-sm bg-white/[0.04] border border-white/[0.06]">
      <Sparkles className="h-6 w-6 text-white/25" />
    </div>
  );

  const badgeTopRight = (
    <span className="text-[9px] sm:text-[10px] font-medium tracking-[0.15em] uppercase rounded-full bg-black/25 backdrop-blur-md border border-white/[0.06] px-2.5 py-1 text-white/35">
      {typeLabel}
    </span>
  );

  const overlay = isLocked ? (
    <div className="h-full bg-black/40 backdrop-blur-[2px] flex flex-col items-center justify-center gap-2">
      <div className="flex h-12 w-12 rounded-2xl items-center justify-center bg-gradient-to-br from-gold/20 to-amber-600/10 border border-gold/25">
        <Lock className="h-5 w-5 text-gold/70" />
      </div>
      {hasSalesPage && (
        <span className="text-[9px] font-bold text-gold/50 uppercase tracking-[0.2em] flex items-center gap-1">
          Desbloquear <ExternalLink className="h-2.5 w-2.5" />
        </span>
      )}
    </div>
  ) : undefined;

  const centerAction = !isLocked ? (
    <div className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gold/95 shadow-[0_4px_24px_rgba(0,0,0,0.4)] scale-[0.5] opacity-0 md:group-hover/card:opacity-100 md:group-hover/card:scale-100 md:transition-all md:duration-500">
      <Play className="h-4 w-4 text-gold-foreground fill-gold-foreground" />
    </div>
  ) : undefined;

  const meta = isLocked ? (
    <span className="text-[9px] sm:text-[10px] font-semibold tracking-[0.15em] uppercase text-gold/55">
      <ShoppingCart className="inline h-2.5 w-2.5 mr-0.5" />
      {hasSalesPage ? "Quero esse conteúdo" : "Premium"}
    </span>
  ) : (
    <span className="text-[9px] sm:text-[10px] font-semibold tracking-[0.15em] uppercase text-gold/55">
      <Sparkles className="inline h-2.5 w-2.5 mr-0.5" />
      Acessar
    </span>
  );

  const cardContent = (
    <div className="group/card relative w-[150px] sm:w-[185px] md:w-[210px] shrink-0 snap-start cursor-pointer">
      <PosterCard
        cover={item.cover_url || null}
        coverAlt={item.title}
        fallback={fallback}
        gradientClass={isLocked ? "from-stone-900/40 via-zinc-950/30 to-neutral-950/50" : "from-sky-900/40 via-blue-950/30 to-slate-950/50"}
        badgeTopRight={badgeTopRight}
        overlay={overlay}
        centerAction={centerAction}
        title={item.title}
        subtitle={item.category || undefined}
        meta={meta}
        locked={isLocked}
      />
    </div>
  );

  const trackClick = () => {
    logFunnelClick({
      data: {
        itemId: item.id,
        itemType: item.type,
        context: context ? `cross-sell-${context}` : 'cross-sell',
        shelfTitle: 'Relacionados',
        isLocked,
      },
    }).catch(() => {});
  };

  if (isLocked && hasSalesPage) {
    return (
      <a href={item.sales_page_url!} target="_blank" rel="noopener noreferrer" onClick={trackClick}>
        {cardContent}
      </a>
    );
  }

  if (isLocked) {
    return <div onClick={trackClick}>{cardContent}</div>;
  }

  return <Link to={linkTo as any} onClick={trackClick}>{cardContent}</Link>;
}
