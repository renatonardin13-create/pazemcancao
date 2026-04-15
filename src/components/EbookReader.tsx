import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Volume2,
  VolumeOff,
  BookOpen,
  Loader2,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

interface EbookReaderProps {
  pdfUrl: string;
  title: string;
  onBack?: () => void;
}

/**
 * Immersive ebook reader — book-spread layout.
 * Desktop: two pages side-by-side (left + right).
 * Mobile: single page with swipe.
 * Page-flip 3D animation on navigation.
 */
export function EbookReader({ pdfUrl, title, onBack }: EbookReaderProps) {
  const isMobile = useIsMobile();
  const [numPages, setNumPages] = useState(0);
  // `spread` tracks the current spread index (0-based).
  // Spread 0 = cover (page 1 alone). Spread 1 = pages 2-3. Spread 2 = pages 4-5, etc.
  const [spread, setSpread] = useState(0);
  const [loading, setLoading] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [direction, setDirection] = useState<"left" | "right">("right");
  const [scale, setScale] = useState(1);
  const [error, setError] = useState<string | null>(null);

  // Page image cache: pageNum → dataURL
  const [pageImages, setPageImages] = useState<Record<number, string>>({});
  const [renderingPages, setRenderingPages] = useState<Set<number>>(new Set());

  const pdfDocRef = useRef<pdfjsLib.PDFDocumentProxy | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const touchStartX = useRef(0);
  const offscreenCanvas = useRef<HTMLCanvasElement | null>(null);

  // Dual-page mode only on desktop
  const dualPage = !isMobile;

  // Compute which pages are in a given spread
  const getSpreadPages = useCallback(
    (s: number): number[] => {
      if (!dualPage) {
        // Mobile: one page per spread
        const p = s + 1;
        return p <= numPages ? [p] : [];
      }
      if (s === 0) return [1]; // Cover alone
      const left = s * 2;
      const right = s * 2 + 1;
      const pages: number[] = [];
      if (left <= numPages) pages.push(left);
      if (right <= numPages) pages.push(right);
      return pages;
    },
    [dualPage, numPages]
  );

  const totalSpreads = (() => {
    if (numPages === 0) return 0;
    if (!dualPage) return numPages;
    // Cover is spread 0 (1 page). Then pairs: 2-3, 4-5, ...
    return Math.ceil(numPages / 2);
  })();

  // Current pages to show
  const currentPages = getSpreadPages(spread);

  // Load PDF
  useEffect(() => {
    let cancelled = false;
    async function loadPdf() {
      try {
        setLoading(true);
        setError(null);
        const loadingTask = pdfjsLib.getDocument(pdfUrl);
        const pdf = await loadingTask.promise;
        if (cancelled) return;
        pdfDocRef.current = pdf;
        setNumPages(pdf.numPages);
        setSpread(0);
        setPageImages({});
        setLoading(false);
      } catch (err) {
        if (cancelled) return;
        console.error("Failed to load PDF:", err);
        setError("Não foi possível carregar o ebook.");
        setLoading(false);
      }
    }
    loadPdf();
    return () => { cancelled = true; };
  }, [pdfUrl]);

  // Render a single page to a data URL
  const renderPage = useCallback(
    async (pageNum: number) => {
      const pdf = pdfDocRef.current;
      if (!pdf || pageNum < 1 || pageNum > pdf.numPages) return;
      if (pageImages[pageNum] && scale === 1) return; // Already cached at default scale

      setRenderingPages((prev) => new Set(prev).add(pageNum));
      try {
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: 2 * scale });

        if (!offscreenCanvas.current) {
          offscreenCanvas.current = document.createElement("canvas");
        }
        const canvas = offscreenCanvas.current;
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        await page.render({ canvasContext: ctx, viewport }).promise;
        const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
        setPageImages((prev) => ({ ...prev, [pageNum]: dataUrl }));
      } catch (err) {
        console.error("Failed to render page:", pageNum, err);
      } finally {
        setRenderingPages((prev) => {
          const next = new Set(prev);
          next.delete(pageNum);
          return next;
        });
      }
    },
    [scale, pageImages]
  );

  // Render current spread pages + prefetch next spread
  useEffect(() => {
    if (loading || numPages === 0) return;
    const pages = getSpreadPages(spread);
    const nextPages = spread < totalSpreads - 1 ? getSpreadPages(spread + 1) : [];
    const prevPages = spread > 0 ? getSpreadPages(spread - 1) : [];
    const allPages = [...pages, ...nextPages, ...prevPages];
    allPages.forEach((p) => renderPage(p));
  }, [spread, loading, numPages, getSpreadPages, totalSpreads, renderPage]);

  // Re-render on scale change
  useEffect(() => {
    if (loading || numPages === 0) return;
    setPageImages({});
  }, [scale]);

  // Sound
  const playPageTurnSound = useCallback(() => {
    if (!soundEnabled) return;
    try {
      if (!audioRef.current) {
        audioRef.current = new Audio("/page-turn.wav");
        audioRef.current.volume = 0.25;
      }
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    } catch { /* ignore */ }
  }, [soundEnabled]);

  const goToSpread = useCallback(
    (s: number, dir: "left" | "right") => {
      if (s < 0 || s >= totalSpreads) return;
      setDirection(dir);
      playPageTurnSound();
      setSpread(s);
    },
    [totalSpreads, playPageTurnSound]
  );

  const nextSpread = useCallback(() => goToSpread(spread + 1, "right"), [spread, goToSpread]);
  const prevSpread = useCallback(() => goToSpread(spread - 1, "left"), [spread, goToSpread]);

  // Keyboard
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (e.key === "ArrowRight" || e.key === " ") { e.preventDefault(); nextSpread(); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); prevSpread(); }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nextSpread, prevSpread]);

  // Touch/swipe
  const handleTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 50) { dx < 0 ? nextSpread() : prevSpread(); }
  };

  // Page label for footer
  const pageLabel = (() => {
    if (currentPages.length === 0) return "—";
    if (currentPages.length === 1) return `${currentPages[0]}`;
    return `${currentPages[0]}–${currentPages[1]}`;
  })();

  // 3D flip variants — elegant page turn
  const flipVariants = {
    enter: (dir: "left" | "right") => ({
      rotateY: dir === "right" ? 45 : -45,
      opacity: 0,
      scale: 0.96,
      x: dir === "right" ? 40 : -40,
    }),
    center: { rotateY: 0, opacity: 1, scale: 1, x: 0 },
    exit: (dir: "left" | "right") => ({
      rotateY: dir === "right" ? -45 : 45,
      opacity: 0,
      scale: 0.96,
      x: dir === "right" ? -40 : 40,
    }),
  };

  // ---------- LOADING ----------
  if (loading) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="relative mx-auto h-14 w-14">
            <div className="absolute inset-0 rounded-full border-2 border-gold/10" />
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-gold/50 animate-spin" />
          </div>
          <p className="text-[10px] uppercase tracking-[0.35em] text-muted-foreground/35 font-medium">
            Preparando seu ebook...
          </p>
        </div>
      </div>
    );
  }

  // ---------- ERROR ----------
  if (error) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center bg-background">
        <div className="text-center space-y-5">
          <div className="mx-auto h-16 w-16 rounded-2xl bg-card/10 border border-border/10 flex items-center justify-center">
            <BookOpen className="h-7 w-7 text-muted-foreground/25" />
          </div>
          <p className="text-foreground/60 text-sm font-semibold">{error}</p>
          {onBack && (
            <Button variant="premiumOutline" size="sm" onClick={onBack}>
              <ArrowLeft className="h-3.5 w-3.5" /> Voltar
            </Button>
          )}
        </div>
      </div>
    );
  }

  // ---------- RENDER PAGE IMAGE ----------
  const renderPageImage = (pageNum: number, side: "left" | "right" | "single") => {
    const img = pageImages[pageNum];
    const isRendering = renderingPages.has(pageNum);
    const roundedClass =
      side === "left" ? "rounded-l-lg" :
      side === "right" ? "rounded-r-lg" :
      "rounded-lg";

    // Page curvature overlay — simulates light hitting a curved page
    const curvatureOverlay =
      side === "left"
        ? "linear-gradient(to right, rgba(0,0,0,0.03) 0%, transparent 8%, transparent 85%, rgba(0,0,0,0.06) 100%)"
        : side === "right"
        ? "linear-gradient(to left, rgba(0,0,0,0.03) 0%, transparent 8%, transparent 85%, rgba(0,0,0,0.06) 100%)"
        : "linear-gradient(to right, rgba(0,0,0,0.02) 0%, transparent 5%, transparent 95%, rgba(0,0,0,0.02) 100%)";

    return (
      <div
        key={pageNum}
        className={`relative flex-1 bg-white ${roundedClass} overflow-hidden flex items-center justify-center`}
        style={{ minHeight: isMobile ? "55vh" : "70vh" }}
      >
        {img ? (
          <img
            src={img}
            alt={`Página ${pageNum}`}
            className="w-full h-full object-contain"
          />
        ) : isRendering ? (
          <Loader2 className="h-6 w-6 text-gold/40 animate-spin" />
        ) : (
          <div className="flex items-center justify-center h-full w-full">
            <Loader2 className="h-6 w-6 text-gold/30 animate-spin" />
          </div>
        )}
        {/* Curvature light overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: curvatureOverlay }}
        />
        {/* Page number watermark */}
        <span className="absolute bottom-2 inset-x-0 text-center text-[9px] text-black/20 font-medium select-none pointer-events-none">
          {pageNum}
        </span>
      </div>
    );
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-background">
      {/* ═══ TOP BAR ═══ */}
      <div className="flex items-center justify-between px-3 sm:px-6 py-2.5 border-b border-border/8 bg-background/95 backdrop-blur-xl z-30">
        <div className="flex items-center gap-3 min-w-0">
          {onBack && (
            <Button variant="premiumOutline" size="sm" onClick={onBack} className="shrink-0">
              <ArrowLeft className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Voltar</span>
            </Button>
          )}
          <div className="hidden sm:block h-5 w-px bg-border/10" />
          <h2 className="text-xs sm:text-sm font-bold text-foreground/70 truncate">
            {title}
          </h2>
        </div>

        <div className="flex items-center gap-1.5">
          <Button variant="ghost" size="sm" onClick={() => setScale((s) => Math.max(0.5, s - 0.25))} disabled={scale <= 0.5} className="h-7 w-7 p-0 text-muted-foreground/50 hover:text-gold">
            <ZoomOut className="h-3.5 w-3.5" />
          </Button>
          <span className="text-[10px] tabular-nums text-muted-foreground/40 min-w-[2rem] text-center">
            {Math.round(scale * 100)}%
          </span>
          <Button variant="ghost" size="sm" onClick={() => setScale((s) => Math.min(3, s + 0.25))} disabled={scale >= 3} className="h-7 w-7 p-0 text-muted-foreground/50 hover:text-gold">
            <ZoomIn className="h-3.5 w-3.5" />
          </Button>
          <div className="h-4 w-px bg-border/10 mx-1" />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`h-7 w-7 p-0 transition-colors ${soundEnabled ? "text-gold" : "text-muted-foreground/40"}`}
          >
            {soundEnabled ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeOff className="h-3.5 w-3.5" />}
          </Button>
        </div>
      </div>

      {/* ═══ BOOK AREA ═══ */}
      <div
        className="relative flex-1 flex items-center justify-center py-4 sm:py-6 px-2 sm:px-6 lg:px-10 bg-gradient-to-b from-background via-card/3 to-background overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        style={{ perspective: "1800px" }}
      >
        {/* Left arrow */}
        {spread > 0 && (
          <button
            onClick={prevSpread}
            className="absolute left-1 sm:left-3 top-1/2 -translate-y-1/2 z-20 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-background/80 border border-border/15 shadow-lg backdrop-blur-md text-foreground/40 hover:text-gold hover:border-gold/25 transition-all active:scale-90"
          >
            <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        )}
        {/* Right arrow */}
        {spread < totalSpreads - 1 && (
          <button
            onClick={nextSpread}
            className="absolute right-1 sm:right-3 top-1/2 -translate-y-1/2 z-20 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-background/80 border border-border/15 shadow-lg backdrop-blur-md text-foreground/40 hover:text-gold hover:border-gold/25 transition-all active:scale-90"
          >
            <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        )}

        {/* Book spread */}
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={spread}
            custom={direction}
            variants={flipVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{ transformStyle: "preserve-3d", transformOrigin: "center center" }}
            className={`relative flex ${dualPage ? "max-w-[90vw] lg:max-w-[80vw] xl:max-w-[72vw]" : "max-w-[92vw] sm:max-w-[70vw] md:max-w-[55vw]"} w-full`}
          >
            {/* Ambient glow behind the book */}
            <div className="absolute -inset-6 rounded-3xl bg-gold/[0.025] blur-3xl pointer-events-none" />

            {/* Book shadow — layered for realism */}
            <div className="absolute -inset-2 rounded-xl pointer-events-none" style={{ boxShadow: "0 25px 60px -12px rgba(0,0,0,0.6), 0 8px 24px -8px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.03)" }} />

            {/* Pages container */}
            <div className={`relative flex w-full ${dualPage ? "gap-0" : ""} rounded-lg overflow-hidden border border-white/[0.06]`} style={{ boxShadow: "0 2px 40px -8px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(255,255,255,0.04)" }}>
              {dualPage && currentPages.length === 2 ? (
                <>
                  {/* Left page */}
                  {renderPageImage(currentPages[0], "left")}
                  {/* Spine / fold shadow — central crease */}
                  <div className="relative w-[6px] shrink-0" style={{
                    background: "linear-gradient(to right, rgba(0,0,0,0.12), rgba(0,0,0,0.35) 40%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.35) 60%, rgba(0,0,0,0.12))",
                    boxShadow: "4px 0 12px rgba(0,0,0,0.25), -4px 0 12px rgba(0,0,0,0.25), inset 0 0 4px rgba(0,0,0,0.15)"
                  }} />
                  {/* Right page */}
                  {renderPageImage(currentPages[1], "right")}
                </>
              ) : dualPage && currentPages.length === 1 && spread === 0 ? (
                <>
                  {/* Cover centered — show as single "right" page with blank left */}
                  <div className="flex-1 bg-gradient-to-br from-card/20 via-card/10 to-card/5 rounded-l-lg flex items-center justify-center" style={{ minHeight: "70vh" }}>
                    <BookOpen className="h-10 w-10 text-muted-foreground/8" />
                  </div>
                  <div className="relative w-[6px] shrink-0" style={{
                    background: "linear-gradient(to right, rgba(0,0,0,0.12), rgba(0,0,0,0.35) 40%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.35) 60%, rgba(0,0,0,0.12))",
                    boxShadow: "4px 0 12px rgba(0,0,0,0.25), -4px 0 12px rgba(0,0,0,0.25), inset 0 0 4px rgba(0,0,0,0.15)"
                  }} />
                  {renderPageImage(currentPages[0], "right")}
                </>
              ) : dualPage && currentPages.length === 1 ? (
                <>
                  {/* Last page alone on left */}
                  {renderPageImage(currentPages[0], "left")}
                  <div className="relative w-[6px] shrink-0" style={{
                    background: "linear-gradient(to right, rgba(0,0,0,0.12), rgba(0,0,0,0.35) 40%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.35) 60%, rgba(0,0,0,0.12))",
                    boxShadow: "4px 0 12px rgba(0,0,0,0.25), -4px 0 12px rgba(0,0,0,0.25)"
                  }} />
                  <div className="flex-1 bg-gradient-to-br from-card/20 via-card/10 to-card/5 rounded-r-lg flex items-center justify-center" style={{ minHeight: "70vh" }}>
                    <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground/20 font-medium">Fim</p>
                  </div>
                </>
              ) : (
                /* Mobile — single page */
                currentPages.length > 0 && renderPageImage(currentPages[0], "single")
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ═══ BOTTOM BAR ═══ */}
      <div className="flex items-center justify-between px-3 sm:px-6 py-2.5 border-t border-border/8 bg-background/95 backdrop-blur-xl z-30">
        <Button variant="premiumOutline" size="sm" onClick={prevSpread} disabled={spread <= 0} className="gap-1.5">
          <ChevronLeft className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Anterior</span>
        </Button>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl border border-border/10 bg-card/6 px-3 py-1.5">
            <BookOpen className="h-3 w-3 text-gold/50" />
            <span className="text-[10px] sm:text-xs tabular-nums text-foreground/60">
              <span className="font-bold text-foreground/80">{pageLabel}</span>
              <span className="mx-1 text-muted-foreground/30">/</span>
              <span className="text-muted-foreground/50">{numPages}</span>
            </span>
          </div>
          <div className="hidden sm:block w-28 h-1 rounded-full bg-border/10 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gold/50"
              initial={{ width: 0 }}
              animate={{ width: `${((spread + 1) / totalSpreads) * 100}%` }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            />
          </div>
        </div>

        <Button variant="premiumOutline" size="sm" onClick={nextSpread} disabled={spread >= totalSpreads - 1} className="gap-1.5">
          <span className="hidden sm:inline">Próxima</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
