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
import * as pdfjsLib from "pdfjs-dist";

// Configure worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

interface EbookReaderProps {
  pdfUrl: string;
  title: string;
  onBack?: () => void;
}

export function EbookReader({ pdfUrl, title, onBack }: EbookReaderProps) {
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [pageLoading, setPageLoading] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [direction, setDirection] = useState<"left" | "right">("right");
  const [scale, setScale] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pdfDocRef = useRef<pdfjsLib.PDFDocumentProxy | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef(0);

  // Load PDF document
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
        setCurrentPage(1);
        setLoading(false);
      } catch (err) {
        if (cancelled) return;
        console.error("Failed to load PDF:", err);
        setError("Não foi possível carregar o ebook.");
        setLoading(false);
      }
    }

    loadPdf();
    return () => {
      cancelled = true;
    };
  }, [pdfUrl]);

  // Render current page
  const renderPage = useCallback(async (pageNum: number) => {
    const pdf = pdfDocRef.current;
    const canvas = canvasRef.current;
    if (!pdf || !canvas) return;

    setPageLoading(true);
    try {
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale: 1.5 * scale });

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      await page.render({ canvasContext: ctx, viewport }).promise;
    } catch (err) {
      console.error("Failed to render page:", err);
    } finally {
      setPageLoading(false);
    }
  }, [scale]);

  useEffect(() => {
    if (!loading && numPages > 0) {
      renderPage(currentPage);
    }
  }, [currentPage, loading, numPages, renderPage]);

  // Play page turn sound
  const playPageTurnSound = useCallback(() => {
    if (!soundEnabled) return;
    try {
      if (!audioRef.current) {
        audioRef.current = new Audio("/page-turn.wav");
        audioRef.current.volume = 0.25;
      }
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    } catch {
      // Ignore audio errors
    }
  }, [soundEnabled]);

  const goToPage = useCallback(
    (page: number, dir: "left" | "right") => {
      if (page < 1 || page > numPages || pageLoading) return;
      setDirection(dir);
      playPageTurnSound();
      setCurrentPage(page);
    },
    [numPages, pageLoading, playPageTurnSound]
  );

  const nextPage = useCallback(() => goToPage(currentPage + 1, "right"), [currentPage, goToPage]);
  const prevPage = useCallback(() => goToPage(currentPage - 1, "left"), [currentPage, goToPage]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        nextPage();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        prevPage();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nextPage, prevPage]);

  // Touch / swipe support
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 50) {
      if (dx < 0) nextPage();
      else prevPage();
    }
  };

  // Page flip animation variants
  const pageVariants = {
    enter: (dir: "left" | "right") => ({
      rotateY: dir === "right" ? 90 : -90,
      opacity: 0,
      scale: 0.95,
    }),
    center: {
      rotateY: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (dir: "left" | "right") => ({
      rotateY: dir === "right" ? -90 : 90,
      opacity: 0,
      scale: 0.95,
    }),
  };

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-background">
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

  if (error) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-background">
        <div className="text-center space-y-5">
          <div className="mx-auto h-16 w-16 rounded-2xl bg-card/10 border border-border/10 flex items-center justify-center">
            <BookOpen className="h-7 w-7 text-muted-foreground/25" />
          </div>
          <p className="text-foreground/60 text-sm font-semibold">{error}</p>
          {onBack && (
            <Button variant="premiumOutline" size="sm" onClick={onBack}>
              <ArrowLeft className="h-3.5 w-3.5" />
              Voltar
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full">
      {/* ═══ TOP CONTROLS ═══ */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-border/8 bg-background/90 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          {onBack && (
            <Button variant="premiumOutline" size="sm" onClick={onBack} className="shrink-0">
              <ArrowLeft className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Voltar</span>
            </Button>
          )}
          <div className="hidden sm:block h-5 w-px bg-border/10" />
          <h2 className="text-xs sm:text-sm font-bold text-foreground/70 truncate max-w-[200px] sm:max-w-none">
            {title}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {/* Zoom controls */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setScale((s) => Math.max(0.5, s - 0.25))}
            disabled={scale <= 0.5}
            className="h-8 w-8 p-0 text-muted-foreground/50 hover:text-gold"
          >
            <ZoomOut className="h-3.5 w-3.5" />
          </Button>
          <span className="text-[10px] tabular-nums text-muted-foreground/40 min-w-[2.5rem] text-center">
            {Math.round(scale * 100)}%
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setScale((s) => Math.min(3, s + 0.25))}
            disabled={scale >= 3}
            className="h-8 w-8 p-0 text-muted-foreground/50 hover:text-gold"
          >
            <ZoomIn className="h-3.5 w-3.5" />
          </Button>

          <div className="h-5 w-px bg-border/10" />

          {/* Sound toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`h-8 w-8 p-0 transition-colors ${
              soundEnabled ? "text-gold" : "text-muted-foreground/40"
            }`}
            title={soundEnabled ? "Desativar som" : "Ativar som"}
          >
            {soundEnabled ? (
              <Volume2 className="h-4 w-4" />
            ) : (
              <VolumeOff className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* ═══ BOOK AREA ═══ */}
      <div
        ref={containerRef}
        className="relative flex-1 flex items-center justify-center min-h-[60vh] sm:min-h-[70vh] bg-gradient-to-b from-background via-card/3 to-background overflow-auto"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        style={{ perspective: "1200px" }}
      >
        {/* Left arrow */}
        {currentPage > 1 && (
          <button
            onClick={prevPage}
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-background/90 border border-border/20 shadow-lg backdrop-blur-sm text-foreground/50 hover:text-gold hover:border-gold/30 transition-all active:scale-95"
            aria-label="Página anterior"
          >
            <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        )}

        {/* Right arrow */}
        {currentPage < numPages && (
          <button
            onClick={nextPage}
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-background/90 border border-border/20 shadow-lg backdrop-blur-sm text-foreground/50 hover:text-gold hover:border-gold/30 transition-all active:scale-95"
            aria-label="Próxima página"
          >
            <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        )}

        {/* Page canvas with flip animation */}
        <div className="relative py-6 px-12 sm:px-16 max-w-full overflow-auto">
          {pageLoading && (
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <Loader2 className="h-6 w-6 text-gold/50 animate-spin" />
            </div>
          )}

          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentPage}
              custom={direction}
              variants={pageVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                duration: 0.4,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
              style={{ transformStyle: "preserve-3d" }}
              className="relative"
            >
              {/* Book shadow / depth */}
              <div className="absolute -inset-1 rounded-xl bg-gradient-to-br from-gold/5 via-transparent to-gold/3 blur-sm pointer-events-none" />
              <div className="relative rounded-lg overflow-hidden border border-border/15 shadow-2xl shadow-black/30 bg-white">
                <canvas
                  ref={canvasRef}
                  className="block max-w-full h-auto"
                  style={{ maxHeight: "75vh" }}
                />
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* ═══ BOTTOM CONTROLS ═══ */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-t border-border/8 bg-background/90 backdrop-blur-xl">
        <Button
          variant="premiumOutline"
          size="sm"
          onClick={prevPage}
          disabled={currentPage <= 1}
          className="gap-1.5"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Anterior</span>
        </Button>

        {/* Page indicator */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl border border-border/10 bg-card/6 px-4 py-2">
            <BookOpen className="h-3.5 w-3.5 text-gold/50" />
            <span className="text-xs tabular-nums text-foreground/60">
              <span className="font-bold text-foreground/80">{currentPage}</span>
              <span className="mx-1 text-muted-foreground/30">/</span>
              <span className="text-muted-foreground/50">{numPages}</span>
            </span>
          </div>

          {/* Progress bar */}
          <div className="hidden sm:block w-32 h-1.5 rounded-full bg-border/10 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gold/50"
              initial={{ width: 0 }}
              animate={{ width: `${(currentPage / numPages) * 100}%` }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            />
          </div>
        </div>

        <Button
          variant="premiumOutline"
          size="sm"
          onClick={nextPage}
          disabled={currentPage >= numPages}
          className="gap-1.5"
        >
          <span className="hidden sm:inline">Próxima</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}