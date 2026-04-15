import { useQuery } from "@tanstack/react-query";
import { getFunnelSuggestions, type FunnelSuggestion, type FunnelLevel } from "@/lib/funnel.functions";
import { Link } from "@tanstack/react-router";
import { Lock, Sparkles, ExternalLink, Crown, Gift, Zap, ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { useRef, useState, useCallback, useEffect } from "react";

interface FunnelBannerProps {
  context?: string;
  limit?: number;
  className?: string;
  variant?: "full" | "compact";
}

const LEVEL_CONFIG: Record<FunnelLevel, {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  accent: string;
}> = {
  free: {
    title: "Desbloqueie o acesso completo",
    subtitle: "Conteúdos premium esperando por você",
    icon: <Gift className="h-4 w-4" />,
    accent: "from-gold/15 to-amber-500/5 border-gold/15",
  },
  basic: {
    title: "Você também pode gostar",
    subtitle: "Expanda sua experiência",
    icon: <Sparkles className="h-4 w-4" />,
    accent: "from-gold/10 to-amber-500/5 border-gold/12",
  },
  premium: {
    title: "Acesso total disponível",
    subtitle: "Complete sua coleção",
    icon: <Crown className="h-4 w-4" />,
    accent: "from-amber-500/10 to-gold/5 border-amber-500/15",
  },
  vip: {
    title: "Recomendado para você",
    subtitle: "Seleção exclusiva",
    icon: <Zap className="h-4 w-4" />,
    accent: "from-gold/8 to-transparent border-gold/10",
  },
};

export function FunnelBanner({
  context,
  limit = 6,
  className = "",
  variant = "full",
}: FunnelBannerProps) {
  const { data, isLoading } = useQuery({
    queryKey: ["funnel-suggestions", context, limit],
    queryFn: () => getFunnelSuggestions({ data: { context, limit } }),
    staleTime: 5 * 60_000,
    refetchOnWindowFocus: false,
  });

  const suggestions = data?.suggestions || [];
  const funnelLevel = data?.funnelLevel || "free";
  const config = LEVEL_CONFIG[funnelLevel];

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
    const timer = setTimeout(checkScroll, 200);
    const el = scrollRef.current;
    if (el) el.addEventListener("scroll", checkScroll, { passive: true });
    return () => { clearTimeout(timer); el?.removeEventListener("scroll", checkScroll); };
  }, [checkScroll, suggestions]);

  const scroll = (dir: "left" | "right") => {
    scrollRef.current?.scrollBy({
      left: dir === "left" ? -240 : 240,
      behavior: "smooth",
    });
  };

  if (isLoading || suggestions.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
      className={`rounded-2xl border bg-gradient-to-br ${config.accent} p-5 sm:p-6 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gold/10 border border-gold/15 text-gold/70">
            {config.icon}
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground/85 tracking-tight">
              {config.title}
            </h3>
            <p className="text-[11px] text-muted-foreground/50 mt-0.5">
              {config.subtitle} · {suggestions.length} itens
            </p>
          </div>
        </div>

        {/* Scroll arrows */}
        <div className="flex gap-1.5">
          {canScrollLeft && (
            <button
              onClick={() => scroll("left")}
              className="h-7 w-7 rounded-lg border border-border/20 bg-card/50 flex items-center justify-center text-muted-foreground/50 hover:text-foreground hover:border-border/40 transition-colors"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
          )}
          {canScrollRight && (
            <button
              onClick={() => scroll("right")}
              className="h-7 w-7 rounded-lg border border-border/20 bg-card/50 flex items-center justify-center text-muted-foreground/50 hover:text-foreground hover:border-border/40 transition-colors"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Cards carousel */}
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory"
        style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" } as any}
      >
        {suggestions.map((item, idx) => (
          <FunnelCard key={`${item.type}-${item.id}`} item={item} idx={idx} variant={variant} />
        ))}
      </div>
    </motion.div>
  );
}

function FunnelCard({
  item,
  idx,
  variant,
}: {
  item: FunnelSuggestion;
  idx: number;
  variant: "full" | "compact";
}) {
  const isLocked = item.is_locked;
  const hasSalesPage = !!item.sales_page_url;

  const linkTo =
    item.type === "course"
      ? `/cursos/${item.id}`
      : item.type === "track"
        ? `/musicas/${item.id}`
        : `/conteudo/${item.id}`;

  const cardWidth = variant === "compact" ? "w-[150px]" : "w-[170px] sm:w-[185px]";
  const cardHeight = variant === "compact" ? "h-[200px]" : "h-[240px] sm:h-[260px]";

  const cardContent = (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: idx * 0.05 }}
      whileHover={{ scale: 1.04, y: -3 }}
      whileTap={{ scale: 0.97 }}
      className={`group relative ${cardWidth} shrink-0 snap-start cursor-pointer`}
    >
      <div className={`relative ${cardHeight} rounded-xl overflow-hidden border border-border/15 bg-card/30 transition-all duration-300 group-hover:border-gold/25 group-hover:shadow-lg group-hover:shadow-gold/10`}>
        {/* Cover */}
        {item.cover_url ? (
          <img
            src={item.cover_url}
            alt={item.title}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-gold/10 to-gold/[0.02] flex items-center justify-center">
            <Sparkles className="h-8 w-8 text-muted-foreground/15" />
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

        {/* Lock overlay */}
        {isLocked && (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-black/40 backdrop-blur-sm border border-white/10">
                <Lock className="h-4.5 w-4.5 text-white/60" />
              </div>
              <span className="text-[10px] font-bold text-gold/80 bg-black/40 backdrop-blur-sm rounded-full px-2.5 py-0.5 border border-gold/15">
                {item.cta_text}
              </span>
            </div>
          </div>
        )}

        {/* Badge */}
        {item.badge && (
          <div className="absolute top-2 left-2 z-10">
            <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-gold/20 backdrop-blur-sm border border-gold/15 text-gold">
              {item.badge}
            </span>
          </div>
        )}

        {/* Type badge */}
        <div className="absolute top-2 right-2 z-10">
          <span className="text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-black/50 text-white/60 backdrop-blur-sm">
            {item.type === "course" ? "Curso" : item.type === "track" ? "Música" : "Conteúdo"}
          </span>
        </div>

        {/* Title at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <p className="text-[11px] font-bold text-white leading-tight line-clamp-2 drop-shadow-lg">
            {item.title}
          </p>
          {!isLocked && (
            <span className="inline-flex items-center gap-1 text-[9px] font-semibold text-gold/80 mt-1">
              <Sparkles className="h-2.5 w-2.5" />
              {item.cta_text || "Ver conteúdo"}
            </span>
          )}
          {isLocked && hasSalesPage && (
            <span className="inline-flex items-center gap-1 text-[9px] font-semibold text-gold/70 mt-1">
              <ExternalLink className="h-2.5 w-2.5" />
              Página de vendas
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );

  if (isLocked && hasSalesPage) {
    return (
      <a href={item.sales_page_url!} target="_blank" rel="noopener noreferrer">
        {cardContent}
      </a>
    );
  }

  if (isLocked) {
    return cardContent;
  }

  return <Link to={linkTo as any}>{cardContent}</Link>;
}
