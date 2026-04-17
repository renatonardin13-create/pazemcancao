import { useRef, useState, useCallback, useEffect, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useDragScroll } from "@/hooks/use-drag-scroll";

/**
 * Prateleira horizontal padrão para cards 9:13 (Louvores, Conteúdos, Cursos).
 * - Setas aparecem APENAS quando há overflow (mais itens do que cabem).
 * - Setas no hover (desktop) e sempre que escrolláveis no toque (mobile).
 * - Scroll por arrasto (mouse) e snap suave para o próximo card.
 *
 * Usa exatamente o mesmo tamanho de item das prateleiras de cursos
 * para manter padronização visual em todo o app.
 */
export function PosterShelfRow({ children }: { children: ReactNode }) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useDragScroll();
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }, []);

  useEffect(() => {
    updateScrollState();
    const el = scrollRef.current;
    if (!el) return;
    const ro = new ResizeObserver(updateScrollState);
    ro.observe(el);
    return () => ro.disconnect();
  }, [updateScrollState, children]);

  const scroll = useCallback((direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.7;
    el.scrollBy({ left: direction === "left" ? -amount : amount, behavior: "smooth" });
  }, []);

  return (
    <div className="group/shelf relative -mx-4 sm:-mx-6 lg:-mx-10">
      {/* Fade edges */}
      <div
        className={`absolute left-0 top-0 bottom-3 w-8 sm:w-12 z-10 pointer-events-none bg-gradient-to-r from-background to-transparent transition-opacity duration-500 ${
          canScrollLeft ? "opacity-100" : "opacity-0"
        }`}
      />
      <div
        className={`absolute right-0 top-0 bottom-3 w-8 sm:w-12 z-10 pointer-events-none bg-gradient-to-l from-background to-transparent transition-opacity duration-500 ${
          canScrollRight ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Left arrow */}
      <button
        type="button"
        aria-label="Anterior"
        onClick={() => scroll("left")}
        className={`absolute left-2 top-1/2 -translate-y-1/2 z-20 h-11 w-11 rounded-full bg-background/90 border border-border/20 backdrop-blur-md flex items-center justify-center transition-all duration-300 hover:bg-card/50 hover:scale-105 shadow-xl ${
          canScrollLeft
            ? "opacity-0 group-hover/shelf:opacity-100"
            : "opacity-0 pointer-events-none"
        }`}
      >
        <ChevronLeft className="h-5 w-5 text-foreground/70" />
      </button>

      {/* Right arrow */}
      <button
        type="button"
        aria-label="Próximo"
        onClick={() => scroll("right")}
        className={`absolute right-2 top-1/2 -translate-y-1/2 z-20 h-11 w-11 rounded-full bg-background/90 border border-border/20 backdrop-blur-md flex items-center justify-center transition-all duration-300 hover:bg-card/50 hover:scale-105 shadow-xl ${
          canScrollRight
            ? "opacity-0 group-hover/shelf:opacity-100"
            : "opacity-0 pointer-events-none"
        }`}
      >
        <ChevronRight className="h-5 w-5 text-foreground/70" />
      </button>

      <div
        ref={(el) => {
          scrollRef.current = el;
          (dragRef as any).current = el;
        }}
        onScroll={updateScrollState}
        onMouseEnter={updateScrollState}
        className="flex gap-3.5 sm:gap-4 lg:gap-5 overflow-x-auto pb-3 scrollbar-hide px-4 sm:px-6 lg:px-8 snap-x snap-mandatory scroll-smooth cursor-grab select-none will-change-scroll"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {children}
      </div>
    </div>
  );
}

/**
 * Item-padrão para PosterShelfRow. Mesma largura responsiva usada
 * nas prateleiras de cursos para manter consistência total.
 */
export function PosterShelfItem({ children }: { children: ReactNode }) {
  return (
    <div className="flex-shrink-0 snap-start w-[170px] sm:w-[200px] md:w-[210px] lg:w-[220px] xl:w-[240px]">
      {children}
    </div>
  );
}
