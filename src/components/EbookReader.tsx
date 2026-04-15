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
  Play,
  Pause,
  Square,
  Headphones,
  CheckCircle2,
  Settings,
  Sun,
  Moon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { useEbookAudio } from "@/hooks/use-ebook-audio";
import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

interface EbookReaderProps {
  pdfUrl: string;
  title: string;
  audioUrl?: string;
  isCompleted?: boolean;
  isCompletePending?: boolean;
  onComplete?: () => void;
  onBack?: () => void;
}

/**
 * Immersive ebook reader — book-spread layout.
 * Desktop: two pages side-by-side (left + right).
 * Mobile: single page with swipe.
 * Page-flip 3D animation on navigation.
 */
export function EbookReader({ pdfUrl, title, audioUrl, isCompleted, isCompletePending, onComplete, onBack }: EbookReaderProps) {
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
  const [controlsVisible, setControlsVisible] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [pageTexts, setPageTexts] = useState<Record<number, string>>({});

  // Reading preferences (persisted in localStorage)
  type ReadingTheme = "light" | "dark";
  type FontSize = "small" | "medium" | "large";

  const loadPrefs = () => {
    try {
      const saved = localStorage.getItem("ebook-reader-prefs");
      if (saved) return JSON.parse(saved);
    } catch {}
    return { theme: "light", fontSize: "medium" };
  };
  const savedPrefs = loadPrefs();
  const [readingTheme, setReadingTheme] = useState<ReadingTheme>(savedPrefs.theme || "light");
  const [fontSize, setFontSize] = useState<FontSize>(savedPrefs.fontSize || "medium");

  // Save prefs whenever they change
  useEffect(() => {
    localStorage.setItem("ebook-reader-prefs", JSON.stringify({ theme: readingTheme, fontSize }));
  }, [readingTheme, fontSize]);

  // Map fontSize to scale multiplier
  const fontScaleMap: Record<FontSize, number> = { small: 0.85, medium: 1, large: 1.25 };
  const effectiveScale = scale * fontScaleMap[fontSize];

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
      // Desktop: always two pages per spread
      const left = s * 2 + 1;
      const right = s * 2 + 2;
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
        const viewport = page.getViewport({ scale: 2 * effectiveScale });

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
    [effectiveScale, pageImages]
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

  // Extract text from current pages for TTS
  useEffect(() => {
    if (loading || numPages === 0) return;
    const pdf = pdfDocRef.current;
    if (!pdf) return;
    currentPages.forEach(async (pageNum) => {
      if (pageTexts[pageNum]) return;
      try {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        const text = textContent.items
          .map((item: any) => item.str)
          .join(" ")
          .trim();
        if (text) {
          setPageTexts((prev) => ({ ...prev, [pageNum]: text }));
        }
      } catch { /* ignore */ }
    });
  }, [spread, loading, numPages, currentPages]);

  // Combine current page texts for audio
  const currentPageText = currentPages
    .map((p) => pageTexts[p] || "")
    .filter(Boolean)
    .join(". ");

  // Audio player hook
  const ebookAudio = useEbookAudio({
    audioUrl,
    pageText: currentPageText || undefined,
  });

  // Stop TTS when page changes
  useEffect(() => {
    ebookAudio.stop();
  }, [spread]);

  // Re-render on scale change
  useEffect(() => {
    if (loading || numPages === 0) return;
    setPageImages({});
  }, [scale, fontSize]);

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

  // 3D flip variants
  const flipVariants = {
    enter: (dir: "left" | "right") => ({
      rotateY: dir === "right" ? 60 : -60,
      opacity: 0,
      scale: 0.92,
    }),
    center: { rotateY: 0, opacity: 1, scale: 1 },
    exit: (dir: "left" | "right") => ({
      rotateY: dir === "right" ? -60 : 60,
      opacity: 0,
      scale: 0.92,
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

  // Theme colors
  const pageBg = readingTheme === "dark" ? "#2a2520" : "#f8f5f0";
  const emptyPageBg = readingTheme === "dark" ? "#252018" : "#f0ebe4";
  const pageFilter = readingTheme === "dark" ? "invert(0.88) hue-rotate(180deg)" : "none";
  const pageNumColor = readingTheme === "dark" ? "rgba(200,180,150,0.4)" : "rgba(168,162,158,0.6)";

  // ---------- RENDER PAGE IMAGE ----------
  const renderPageImage = (pageNum: number, side: "left" | "right" | "single") => {
    const img = pageImages[pageNum];
    const isRendering = renderingPages.has(pageNum);
    const roundedClass =
      side === "left" ? "rounded-l-md" :
      side === "right" ? "rounded-r-md" :
      "rounded-md";

    return (
      <div
        key={pageNum}
        className={`relative flex-1 ${roundedClass} overflow-hidden flex items-center justify-center transition-colors duration-300`}
        style={{
          minHeight: isMobile ? "60vh" : "75vh",
          backgroundColor: pageBg,
          padding: isMobile ? "12px" : "24px 32px",
        }}
      >
        {img ? (
          <img
            src={img}
            alt={`Página ${pageNum}`}
            className="w-full h-full object-contain drop-shadow-sm transition-all duration-300"
            style={{ maxWidth: "100%", borderRadius: "2px", filter: pageFilter }}
          />
        ) : isRendering ? (
          <Loader2 className="h-6 w-6 text-amber-700/30 animate-spin" />
        ) : (
          <div className="flex items-center justify-center h-full w-full">
            <Loader2 className="h-6 w-6 text-amber-700/20 animate-spin" />
          </div>
        )}
        <span className="absolute bottom-3 inset-x-0 text-center text-[10px] font-serif select-none pointer-events-none tracking-wide" style={{ color: pageNumColor }}>
          {pageNum}
        </span>
      </div>
    );
  };

  return (
    <div className="flex flex-col w-full min-h-screen" style={{ backgroundColor: "#1a1814" }}>
      {/* ═══ TOP BAR — Kindle-style minimal ═══ */}
      <div className={`flex items-center justify-between px-3 sm:px-6 py-2 border-b border-stone-800/40 bg-[#1a1814]/95 backdrop-blur-xl z-30 transition-all duration-300 ${!controlsVisible ? "opacity-0 pointer-events-none h-0 overflow-hidden py-0 border-0" : ""}`}>
        <div className="flex items-center gap-3 min-w-0">
          {onBack && (
            <Button variant="premiumOutline" size="sm" onClick={onBack} className="shrink-0">
              <ArrowLeft className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Voltar</span>
            </Button>
          )}
          <div className="hidden sm:block h-5 w-px bg-stone-700/20" />
          <h2 className="text-xs sm:text-sm font-serif font-medium text-stone-400/70 truncate">
            {title}
          </h2>
        </div>

        <div className="flex items-center gap-1.5">
          <Button variant="ghost" size="sm" onClick={() => setScale((s) => Math.max(0.5, s - 0.25))} disabled={scale <= 0.5} className="h-7 w-7 p-0 text-stone-500/50 hover:text-gold">
            <ZoomOut className="h-3.5 w-3.5" />
          </Button>
          <span className="text-[10px] tabular-nums text-stone-500/40 min-w-[2rem] text-center">
            {Math.round(scale * 100)}%
          </span>
          <Button variant="ghost" size="sm" onClick={() => setScale((s) => Math.min(3, s + 0.25))} disabled={scale >= 3} className="h-7 w-7 p-0 text-stone-500/50 hover:text-gold">
            <ZoomIn className="h-3.5 w-3.5" />
          </Button>
          <div className="h-4 w-px bg-stone-700/20 mx-1" />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`h-7 w-7 p-0 transition-colors ${soundEnabled ? "text-gold" : "text-stone-500/40"}`}
          >
            {soundEnabled ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeOff className="h-3.5 w-3.5" />}
          </Button>
          <div className="h-4 w-px bg-stone-700/20 mx-1" />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setControlsVisible(!controlsVisible)}
            className="h-7 w-7 p-0 text-stone-500/40 hover:text-gold"
            title="Modo imersivo"
          >
            <BookOpen className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* ═══ BOOK AREA — Kindle premium ═══ */}
      <div
        className="relative flex-1 flex items-center justify-center py-6 sm:py-8 px-3 sm:px-8 lg:px-14 overflow-hidden cursor-pointer select-none"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onClick={(e) => {
          const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
          const x = e.clientX - rect.left;
          const w = rect.width;
          const zone = x / w;
          if (zone < 0.25) {
            prevSpread();
          } else if (zone > 0.75) {
            nextSpread();
          } else {
            setControlsVisible((v) => !v);
          }
        }}
        style={{
          perspective: "1800px",
          background: "radial-gradient(ellipse at center, #221f1a 0%, #1a1814 60%, #141210 100%)",
        }}
      >

        {/* Book spread */}
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={spread}
            custom={direction}
            variants={flipVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            style={{ transformStyle: "preserve-3d" }}
            className={`relative flex ${dualPage ? "max-w-[88vw] lg:max-w-[78vw] xl:max-w-[68vw]" : "max-w-[92vw] sm:max-w-[65vw] md:max-w-[50vw]"} w-full`}
          >
            {/* Ambient warm glow */}
            <div className="absolute -inset-6 rounded-3xl bg-amber-900/[0.06] blur-3xl pointer-events-none" />

            {/* Book shadow — deeper, warmer */}
            <div className="absolute -inset-3 rounded-xl shadow-[0_25px_100px_-20px_rgba(0,0,0,0.8)] pointer-events-none" />

            {/* Pages container */}
            <div className={`relative flex w-full ${dualPage ? "gap-0" : ""} rounded-md overflow-hidden border border-stone-700/15 shadow-2xl`}>
              {dualPage && currentPages.length === 2 ? (
                <>
                  {renderPageImage(currentPages[0], "left")}
                  {/* Spine — book binding effect */}
                  <div className="w-[3px] bg-gradient-to-b from-stone-600/30 via-stone-800/50 to-stone-600/30 shadow-[3px_0_12px_rgba(0,0,0,0.4),-3px_0_12px_rgba(0,0,0,0.4)]" />
                  {renderPageImage(currentPages[1], "right")}
                </>
              ) : dualPage && currentPages.length === 1 ? (
                <>
                  {renderPageImage(currentPages[0], "left")}
                  <div className="w-[3px] bg-gradient-to-b from-stone-600/30 via-stone-800/50 to-stone-600/30" />
                  <div className="flex-1 rounded-r-md transition-colors duration-300" style={{ minHeight: "75vh", backgroundColor: emptyPageBg }} />
                </>
              ) : (
                currentPages.length > 0 && renderPageImage(currentPages[0], "single")
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ═══ AUDIO PLAYER BAR ═══ */}
      {ebookAudio.available && controlsVisible && (
        <div className="flex items-center gap-2 px-3 sm:px-6 py-2 border-t border-stone-800/30 bg-[#1a1814]/95 backdrop-blur-xl z-30">
          <Headphones className="h-3.5 w-3.5 text-gold/50 shrink-0" />
          <span className="text-[9px] uppercase tracking-widest text-stone-500/40 hidden sm:inline">
            {ebookAudio.isFileMode ? "Áudio" : "Leitura em voz"}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={ebookAudio.toggle}
            className={`h-7 w-7 p-0 transition-colors ${ebookAudio.isPlaying ? "text-gold" : "text-stone-500/50 hover:text-gold"}`}
          >
            {ebookAudio.isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
          </Button>
          {ebookAudio.isPlaying && (
            <Button
              variant="ghost"
              size="sm"
              onClick={ebookAudio.stop}
              className="h-7 w-7 p-0 text-stone-500/40 hover:text-red-400"
            >
              <Square className="h-3 w-3" />
            </Button>
          )}
          {ebookAudio.isFileMode && ebookAudio.duration > 0 && (
            <div className="flex-1 max-w-[200px] h-1 rounded-full bg-stone-700/20 overflow-hidden">
              <div
                className="h-full rounded-full bg-gold/50 transition-all duration-300"
                style={{ width: `${(ebookAudio.progress / ebookAudio.duration) * 100}%` }}
              />
            </div>
          )}
        </div>
      )}

      {/* ═══ BOTTOM BAR ═══ */}
      <div className={`flex items-center justify-between px-3 sm:px-6 py-2.5 border-t border-stone-800/30 bg-[#1a1814]/95 backdrop-blur-xl z-30 transition-all duration-300 ${!controlsVisible ? "opacity-0 pointer-events-none h-0 overflow-hidden py-0 border-0" : ""}`}>
        <Button variant="premiumOutline" size="sm" onClick={prevSpread} disabled={spread <= 0} className="gap-1.5">
          <ChevronLeft className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Anterior</span>
        </Button>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl border border-stone-700/15 bg-stone-900/30 px-3 py-1.5">
            <BookOpen className="h-3 w-3 text-gold/50" />
            <span className="text-[10px] sm:text-xs tabular-nums text-stone-400/60">
              <span className="font-bold text-stone-300/80">{pageLabel}</span>
              <span className="mx-1 text-stone-600/30">/</span>
              <span className="text-stone-500/50">{numPages}</span>
              <span className="ml-1.5 text-gold/50 font-medium">{totalSpreads > 0 ? Math.round(((spread + 1) / totalSpreads) * 100) : 0}%</span>
            </span>
          </div>
          <div className="hidden sm:block w-28 h-1 rounded-full bg-stone-700/20 overflow-hidden">
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

      {/* ═══ MARK COMPLETE BAR ═══ */}
      {onComplete && controlsVisible && (
        <div className="flex items-center justify-center px-3 sm:px-6 py-3 border-t border-stone-800/30 bg-[#1a1814]/95 backdrop-blur-xl z-30">
          <Button
            onClick={() => {
              if (!isCompleted) onComplete();
            }}
            disabled={isCompletePending || isCompleted}
            className={`gap-2.5 px-8 sm:px-10 py-3 text-[12px] font-bold uppercase tracking-[0.14em] transition-all rounded-xl w-full sm:w-auto ${
              isCompleted
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/15 hover:bg-emerald-500/15 shadow-none"
                : "bg-gold text-gold-foreground hover:brightness-110 shadow-lg shadow-gold/25 hover:shadow-xl hover:shadow-gold/35 scale-100 hover:scale-[1.02]"
            }`}
            variant={isCompleted ? "outline" : "default"}
          >
            <CheckCircle2 className="h-4 w-4" />
            {isCompleted
              ? "Concluída ✓"
              : isCompletePending
                ? "Salvando..."
                : "Marcar como concluído"}
          </Button>
        </div>
      )}
    </div>
  );
}
