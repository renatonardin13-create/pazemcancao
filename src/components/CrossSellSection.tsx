import { useQuery } from "@tanstack/react-query";
import { getCrossSellItems, type CrossSellItem } from "@/lib/cross-sell.functions";
import { logFunnelClick } from "@/lib/funnel-analytics.functions";
import { Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { CoursePosterCard } from "@/components/vitrine/CoursePosterCard";
import type { VitrineCourse } from "@/components/vitrine/types";
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

/**
 * Card unificado: usa o CoursePosterCard da Vitrine para todos os tipos
 * (course/content/track), garantindo o mesmo visual premium e o modal
 * "Ir para página de vendas" para itens bloqueados.
 */
function CrossSellCard({ item, context }: { item: CrossSellItem; context?: string }) {
  const trackClick = useCallback(() => {
    logFunnelClick({
      data: {
        itemId: item.id,
        itemType: item.type,
        context: context ? `cross-sell-${context}` : "cross-sell",
        shelfTitle: "Relacionados",
        isLocked: item.is_locked,
      },
    }).catch(() => {});
  }, [item.id, item.type, item.is_locked, context]);

  const courseLike = {
    id: item.id,
    title: item.title,
    cover_image_url: item.cover_url,
    banner_image_url: item.cover_url,
    sales_page_url: item.sales_page_url || null,
    checkout_url: item.sales_page_url || null,
    access_state: item.is_locked ? "locked" : "unlocked",
    progress_pct: 0,
    total_lessons: 0,
    short_description: item.category || "",
    category_name: item.category || "",
  } as unknown as VitrineCourse;

  return (
    <div onClickCapture={trackClick} className="shrink-0 snap-start">
      <CoursePosterCard course={courseLike} />
    </div>
  );
}
