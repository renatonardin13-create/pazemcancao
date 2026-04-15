import { useState, useEffect, useRef, useCallback, useMemo } from "react";
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
  SkipBack,
  SkipForward,
  Lock,
  Maximize,
  Minimize,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { useEbookAudio } from "@/hooks/use-ebook-audio";
import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

const formatTime = (s: number) => {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
};

interface EbookReaderProps {
  pdfUrl: string;
  title: string;
  audioUrl?: string;
  isCompleted?: boolean;
  isCompletePending?: boolean;
  onComplete?: () => void;
  onBack?: () => void;
  /** Number of free pages before paywall (0 = all free) */
  freePageLimit?: number;
  /** Whether user has full access (purchased) */
  isUnlocked?: boolean;
  /** URL to redirect when user clicks "Unlock" */
  salesPageUrl?: string;
}

/**
 * Immersive ebook reader — book-spread layout.
 * Desktop: two pages side-by-side (left + right).
 * Mobile: single page with swipe.
 * Page-flip 3D animation on navigation.
 */
export function EbookReader({ pdfUrl, title, audioUrl, isCompleted, isCompletePending, onComplete, onBack, freePageLimit = 0, isUnlocked = true, salesPageUrl }: EbookReaderProps) {
  const isMobile = useIsMobile();
  const [numPages, setNumPages] = useState(0);
  // `spread` tracks the current spread index (0-based).
  // Spread 0 = cover (page 1 alone). Spread 1 = pages 2-3. Spread 2 = pages 4-5, etc.
  const [spread, setSpread] = useState(0);
  const [resumedFrom, setResumedFrom] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [direction, setDirection] = useState<"left" | "right">("right");
  const [scale, setScale] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [pageTexts, setPageTexts] = useState<Record<number, string>>({});
  const [isFullscreen, setIsFullscreen] = useState(false);
  const readerContainerRef = useRef<HTMLDivElement>(null);

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

  // Page image cache: pageNum → dataURL (use ref to avoid dependency loops)
  const [pageImages, setPageImages] = useState<Record<number, string>>({});
  const pageImagesRef = useRef<Record<number, string>>({});
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

  // Paywall logic
  const hasPaywall = freePageLimit > 0 && !isUnlocked;
  
  // Compute max allowed spread based on free page limit
  const maxAllowedSpread = useMemo(() => {
    if (!hasPaywall || numPages === 0) return totalSpreads - 1;
    if (!dualPage) return Math.min(freePageLimit - 1, totalSpreads - 1);
    return Math.min(Math.ceil(freePageLimit / 2) - 1, totalSpreads - 1);
  }, [hasPaywall, freePageLimit, numPages, dualPage, totalSpreads]);

  const isAtPaywall = hasPaywall && spread >= maxAllowedSpread;

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
        // Restore saved reading position
        const progressKey = `ebook-progress-${pdfUrl}`;
        try {
          const saved = localStorage.getItem(progressKey);
          if (saved) {
            const savedSpread = parseInt(saved, 10);
            const maxSpread = isMobile ? pdf.numPages - 1 : Math.ceil(pdf.numPages / 2) - 1;
            if (savedSpread > 0 && savedSpread <= maxSpread) {
              setSpread(savedSpread);
              setResumedFrom(savedSpread);
              // Auto-dismiss resume indicator
              setTimeout(() => setResumedFrom(null), 3000);
            } else {
              setSpread(0);
            }
          } else {
            setSpread(0);
          }
        } catch {
          setSpread(0);
        }
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

  // Auto-save reading progress
  useEffect(() => {
    if (numPages === 0) return;
    try {
      localStorage.setItem(`ebook-progress-${pdfUrl}`, String(spread));
    } catch {}
  }, [spread, pdfUrl, numPages]);


  const renderingPagesRef = useRef<Set<number>>(new Set());

  const renderPage = useCallback(
    async (pageNum: number) => {
      const pdf = pdfDocRef.current;
      if (!pdf || pageNum < 1 || pageNum > pdf.numPages) return;
      // Use ref to check cache — avoids stale closure & dependency loop
      if (pageImagesRef.current[pageNum]) return;
      if (renderingPagesRef.current.has(pageNum)) return;

      renderingPagesRef.current.add(pageNum);
      setRenderingPages((prev) => new Set(prev).add(pageNum));
      try {
        const page = await pdf.getPage(pageNum);
        const renderScale = isMobile ? 1.5 : 2;
        const viewport = page.getViewport({ scale: renderScale * effectiveScale });

        if (!offscreenCanvas.current) {
          offscreenCanvas.current = document.createElement("canvas");
        }
        const canvas = offscreenCanvas.current;
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        await page.render({ canvasContext: ctx, viewport }).promise;
        const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
        pageImagesRef.current[pageNum] = dataUrl;
        setPageImages((prev) => ({ ...prev, [pageNum]: dataUrl }));
      } catch (err) {
        console.error("Failed to render page:", pageNum, err);
      } finally {
        renderingPagesRef.current.delete(pageNum);
        setRenderingPages((prev) => {
          const next = new Set(prev);
          next.delete(pageNum);
          return next;
        });
      }
    },
    [effectiveScale, isMobile]
  );

  // Evict far pages from cache to save memory (keep ±2 spreads)
  const evictFarPages = useCallback((currentSpread: number) => {
    const keepPages = new Set<number>();
    for (let s = Math.max(0, currentSpread - 1); s <= Math.min(totalSpreads - 1, currentSpread + 2); s++) {
      for (const p of getSpreadPages(s)) keepPages.add(p);
    }
    const cached = pageImagesRef.current;
    let changed = false;
    for (const key of Object.keys(cached)) {
      const pageNum = parseInt(key, 10);
      if (!keepPages.has(pageNum)) {
        delete cached[pageNum];
        changed = true;
      }
    }
    if (changed) {
      setPageImages({ ...cached });
    }
  }, [totalSpreads, getSpreadPages]);

  // Render current spread pages + prefetch next spread, evict far ones
  useEffect(() => {
    if (loading || numPages === 0) return;
    const pages = getSpreadPages(spread);
    const nextPages = spread < totalSpreads - 1 ? getSpreadPages(spread + 1) : [];
    const prevPages = spread > 0 ? getSpreadPages(spread - 1) : [];
    // Render current first, then adjacent
    pages.forEach((p) => renderPage(p));
    // Use rAF for adjacent pages to not block current render
    requestAnimationFrame(() => {
      [...nextPages, ...prevPages].forEach((p) => renderPage(p));
    });
    // Evict pages far from current spread
    evictFarPages(spread);
  }, [spread, loading, numPages, getSpreadPages, totalSpreads, renderPage, evictFarPages]);

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

  // Track whether narration should auto-continue to next page
  const autoNarrationRef = useRef(false);
  const [ttsOverlayVisible, setTtsOverlayVisible] = useState(false);
  const playPageTurnSoundRef = useRef<() => void>(() => {});
  const spreadRef = useRef(spread);
  spreadRef.current = spread;
  const totalSpreadsRef = useRef(totalSpreads);
  totalSpreadsRef.current = totalSpreads;
  const maxAllowedSpreadRef = useRef(maxAllowedSpread);
  maxAllowedSpreadRef.current = maxAllowedSpread;
  const hasPaywallRef = useRef(hasPaywall);
  hasPaywallRef.current = hasPaywall;

  // Stable callback that reads from refs — never goes stale
  const handlePageNarrationEnd = useCallback(() => {
    const s = spreadRef.current;
    const total = totalSpreadsRef.current;
    const maxAllowed = maxAllowedSpreadRef.current;
    const pw = hasPaywallRef.current;

    if (autoNarrationRef.current && s < total - 1 && !(pw && s + 1 > maxAllowed)) {
      setDirection("right");
      playPageTurnSoundRef.current();
      setSpread(s + 1);
    } else {
      // Last page or paywall — finish narration cleanly
      autoNarrationRef.current = false;
      setTtsOverlayVisible(false);
    }
  }, []);

  // Audio player hook
  const ebookAudio = useEbookAudio({
    audioUrl,
    pageText: currentPageText || undefined,
    onPageNarrationEnd: handlePageNarrationEnd,
  });

  // When spread changes: if auto-narration is active, start reading new page; otherwise stop
  const prevSpreadForAudio = useRef(spread);
  useEffect(() => {
    if (prevSpreadForAudio.current === spread) return;
    prevSpreadForAudio.current = spread;

    // Always stop current TTS first
    ebookAudio.stop();

    if (autoNarrationRef.current && currentPageText) {
      // Delay to let text extraction settle, then start narration
      const t = setTimeout(() => {
        ebookAudio.toggle();
      }, 500);
      return () => clearTimeout(t);
    } else {
      setTtsOverlayVisible(false);
    }
  }, [spread, currentPageText]);

  // Show TTS overlay when playing in TTS mode
  useEffect(() => {
    if (ebookAudio.isPlaying && ebookAudio.mode === "tts") {
      setTtsOverlayVisible(true);
      autoNarrationRef.current = true;
    } else if (!ebookAudio.isPlaying && ebookAudio.charIndex === -1) {
      setTtsOverlayVisible(false);
      // Don't reset autoNarrationRef here — it's managed by handlePageNarrationEnd
    }
  }, [ebookAudio.isPlaying, ebookAudio.mode, ebookAudio.charIndex]);

  // Split text into sentences for highlighting
  const splitIntoSentences = useCallback((text: string): { text: string; start: number; end: number }[] => {
    if (!text) return [];
    const sentences: { text: string; start: number; end: number }[] = [];
    // Split by sentence-ending punctuation, keeping them attached
    const regex = /[^.!?]+[.!?]*\s*/g;
    let match;
    while ((match = regex.exec(text)) !== null) {
      const trimmed = match[0].trim();
      if (trimmed) {
        sentences.push({
          text: trimmed,
          start: match.index,
          end: match.index + match[0].length,
        });
      }
    }
    return sentences;
  }, []);

  const currentSentences = useMemo(() => splitIntoSentences(currentPageText), [currentPageText, splitIntoSentences]);

  // Re-render on scale/font change — clear cache including ref
  useEffect(() => {
    if (loading || numPages === 0) return;
    pageImagesRef.current = {};
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
  playPageTurnSoundRef.current = playPageTurnSound;

  const goToSpread = useCallback(
    (s: number, dir: "left" | "right") => {
      if (s < 0 || s >= totalSpreads) return;
      // Block navigation past paywall
      if (hasPaywall && s > maxAllowedSpread) return;
      setDirection(dir);
      playPageTurnSound();
      setSpread(s);
    },
    [totalSpreads, playPageTurnSound, hasPaywall, maxAllowedSpread]
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
      else if (e.key === "F11") { e.preventDefault(); toggleFullscreen(); }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nextSpread, prevSpread]);

  // Fullscreen
  const toggleFullscreen = useCallback(() => {
    const el = readerContainerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  }, []);

  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

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

  // Page-flip animation — lightweight (no filter/brightness for GPU perf)
  const flipVariants = {
    enter: (dir: "left" | "right") => ({
      x: dir === "right" ? 60 : -60,
      opacity: 0,
      scale: 0.98,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (dir: "left" | "right") => ({
      x: dir === "right" ? -60 : 60,
      opacity: 0,
      scale: 0.98,
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

    // Determine if this page's text contains the currently highlighted char
    const pageTextStr = pageTexts[pageNum] || "";
    // Calculate offset of this page's text within the combined currentPageText
    let pageTextOffset = 0;
    for (const p of currentPages) {
      if (p === pageNum) break;
      const t = pageTexts[p] || "";
      if (t) pageTextOffset += t.length + 2; // ". " separator
    }

    const showTextOverlay = ttsOverlayVisible && ebookAudio.mode === "tts" && pageTextStr.length > 0;

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
            className={`w-full h-full object-contain drop-shadow-sm transition-all duration-300 ${showTextOverlay ? "opacity-15" : ""}`}
            style={{ maxWidth: "100%", borderRadius: "2px", filter: pageFilter }}
          />
        ) : isRendering ? (
          <Loader2 className="h-6 w-6 text-amber-700/30 animate-spin" />
        ) : (
          <div className="flex items-center justify-center h-full w-full">
            <Loader2 className="h-6 w-6 text-amber-700/20 animate-spin" />
          </div>
        )}

        {/* TTS Text Overlay with sentence highlighting */}
        {showTextOverlay && (
          <div
            className="absolute inset-0 overflow-y-auto p-4 sm:p-8 flex flex-col justify-start"
            style={{ zIndex: 5 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-1 text-sm sm:text-base leading-relaxed font-serif">
              {splitIntoSentences(pageTextStr).map((sentence, idx) => {
                // Map sentence start/end to combined text charIndex
                const globalStart = pageTextOffset + sentence.start;
                const globalEnd = pageTextOffset + sentence.end;
                const ci = ebookAudio.charIndex;
                const isActive = ci >= globalStart && ci < globalEnd;
                const isPast = ci >= globalEnd;

                return (
                  <span
                    key={idx}
                    className={`inline transition-all duration-300 ${
                      isActive
                        ? "text-gold font-semibold"
                        : isPast
                          ? (readingTheme === "dark" ? "text-stone-400/70" : "text-stone-600/70")
                          : (readingTheme === "dark" ? "text-stone-300/50" : "text-stone-500/50")
                    }`}
                    style={isActive ? {
                      textShadow: "0 0 20px rgba(255,165,0,0.3)",
                    } : undefined}
                  >
                    {sentence.text}{" "}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        <span className="absolute bottom-3 inset-x-0 text-center text-[10px] font-serif select-none pointer-events-none tracking-wide" style={{ color: pageNumColor, zIndex: 6 }}>
          {pageNum}
        </span>
      </div>
    );
  };

  return (
    <div ref={readerContainerRef} className="flex flex-col w-full min-h-screen" style={{ backgroundColor: "#1a1814" }}>
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
            onClick={() => setReadingTheme(readingTheme === "dark" ? "light" : "dark")}
            className={`h-7 w-7 p-0 transition-colors ${readingTheme === "dark" ? "text-gold" : "text-stone-500/40 hover:text-gold"}`}
            title={readingTheme === "dark" ? "Modo claro" : "Modo escuro"}
          >
            {readingTheme === "dark" ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
          </Button>
          <div className="h-4 w-px bg-stone-700/20 mx-1" />
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleFullscreen}
            className="h-7 w-7 p-0 text-stone-500/40 hover:text-gold transition-colors"
            title={isFullscreen ? "Sair da tela cheia (F11)" : "Tela cheia (F11)"}
          >
            {isFullscreen ? <Minimize className="h-3.5 w-3.5" /> : <Maximize className="h-3.5 w-3.5" />}
          </Button>
          <div className="h-4 w-px bg-stone-700/20 mx-1" />
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
              className={`h-7 w-7 p-0 transition-colors ${showSettings ? "text-gold" : "text-stone-500/40 hover:text-gold"}`}
              title="Personalizar leitura"
            >
              <Settings className="h-3.5 w-3.5" />
            </Button>
            {/* Settings dropdown */}
            {showSettings && (
              <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-stone-700/30 bg-[#1e1b16]/95 backdrop-blur-xl shadow-2xl z-50 p-3 space-y-3"
                onClick={(e) => e.stopPropagation()}>
                {/* Font size */}
                <div>
                  <label className="text-[9px] uppercase tracking-widest text-stone-500/50 mb-1.5 block">Tamanho</label>
                  <div className="flex gap-1">
                    {(["small", "medium", "large"] as FontSize[]).map((s) => (
                      <button
                        key={s}
                        onClick={() => setFontSize(s)}
                        className={`flex-1 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
                          fontSize === s
                            ? "bg-gold/20 text-gold border border-gold/30"
                            : "bg-stone-800/40 text-stone-400/60 border border-stone-700/20 hover:border-stone-600/30"
                        }`}
                      >
                        {s === "small" ? "Aa" : s === "medium" ? "Aa" : "Aa"}
                      </button>
                    ))}
                  </div>
                  <div className="flex justify-between px-1 mt-0.5">
                    <span className="text-[8px] text-stone-600/40">Pequena</span>
                    <span className="text-[8px] text-stone-600/40">Média</span>
                    <span className="text-[8px] text-stone-600/40">Grande</span>
                  </div>
                </div>
                {/* Theme */}
                <div>
                  <label className="text-[9px] uppercase tracking-widest text-stone-500/50 mb-1.5 block">Tema</label>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setReadingTheme("light")}
                      className={`flex-1 py-1.5 rounded-lg text-[11px] font-medium transition-all flex items-center justify-center gap-1 ${
                        readingTheme === "light"
                          ? "bg-gold/20 text-gold border border-gold/30"
                          : "bg-stone-800/40 text-stone-400/60 border border-stone-700/20 hover:border-stone-600/30"
                      }`}
                    >
                      <Sun className="h-3 w-3" /> Claro
                    </button>
                    <button
                      onClick={() => setReadingTheme("dark")}
                      className={`flex-1 py-1.5 rounded-lg text-[11px] font-medium transition-all flex items-center justify-center gap-1 ${
                        readingTheme === "dark"
                          ? "bg-gold/20 text-gold border border-gold/30"
                          : "bg-stone-800/40 text-stone-400/60 border border-stone-700/20 hover:border-stone-600/30"
                      }`}
                    >
                      <Moon className="h-3 w-3" /> Escuro
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
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
          if (showSettings) { setShowSettings(false); return; }
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
        {/* Resume indicator */}
        <AnimatePresence>
          {resumedFrom !== null && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-3 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 rounded-xl border border-gold/20 bg-stone-900/80 backdrop-blur-xl px-4 py-2 shadow-lg"
            >
              <BookOpen className="h-3.5 w-3.5 text-gold/70" />
              <span className="text-[11px] text-stone-300/80 font-medium">Continuando de onde você parou</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Book spread */}
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={spread}
            custom={direction}
            variants={flipVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              duration: 0.35,
              ease: [0.25, 0.46, 0.45, 0.94],
              opacity: { duration: 0.25 },
            }}
            className={`relative flex ${dualPage ? "max-w-[88vw] lg:max-w-[78vw] xl:max-w-[68vw]" : "max-w-[92vw] sm:max-w-[65vw] md:max-w-[50vw]"} w-full`}
          >
            {/* Ambient warm glow */}
            <div className="absolute -inset-6 rounded-3xl bg-amber-900/[0.06] blur-3xl pointer-events-none" />

            {/* Fold shadow — simulates page curl shadow */}
            <div
              className="absolute inset-0 pointer-events-none z-10 rounded-md transition-opacity duration-500"
              style={{
                background: direction === "right"
                  ? "linear-gradient(to right, transparent 40%, rgba(0,0,0,0.06) 48%, rgba(0,0,0,0.12) 50%, rgba(0,0,0,0.06) 52%, transparent 60%)"
                  : "linear-gradient(to left, transparent 40%, rgba(0,0,0,0.06) 48%, rgba(0,0,0,0.12) 50%, rgba(0,0,0,0.06) 52%, transparent 60%)",
              }}
            />

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

            {/* ═══ PAYWALL OVERLAY ═══ */}
            {isAtPaywall && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
                className="absolute inset-0 z-20 flex items-center justify-center rounded-md overflow-hidden"
              >
                {/* Gradient fade — cinematic */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#1a1814]/60 to-[#1a1814]" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1a1814] via-transparent to-transparent opacity-40" />
                
                <div className="relative z-10 flex flex-col items-center gap-6 px-8 text-center max-w-lg">
                  {/* Glow ring */}
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.6, ease: "easeOut" }}
                    className="relative"
                  >
                    <div className="absolute -inset-4 rounded-full bg-gold/5 blur-2xl" />
                    <div className="h-20 w-20 rounded-full bg-gradient-to-br from-gold/20 to-gold/5 border border-gold/25 flex items-center justify-center shadow-2xl shadow-gold/10">
                      <BookOpen className="h-8 w-8 text-gold/80" />
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ y: 16, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.6 }}
                    className="space-y-3"
                  >
                    <h3 className="text-xl sm:text-2xl font-serif font-bold text-stone-100 leading-tight">
                      Esse conteúdo pode transformar sua vida espiritual
                    </h3>
                    <p className="text-sm sm:text-base text-stone-400/80 leading-relaxed max-w-sm mx-auto">
                      Você experimentou as primeiras {freePageLimit} páginas. O melhor ainda está por vir — continue essa jornada de fé e cura.
                    </p>
                  </motion.div>

                  <motion.div
                    initial={{ y: 12, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.7, duration: 0.5 }}
                    className="flex flex-col items-center gap-3 w-full"
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (salesPageUrl) {
                          window.open(salesPageUrl, "_blank", "noopener");
                        }
                      }}
                      className="group relative flex items-center justify-center gap-3 w-full max-w-xs px-8 py-4 rounded-2xl bg-gradient-to-r from-gold to-amber-500 text-[#1a1814] font-bold text-sm uppercase tracking-[0.15em] shadow-xl shadow-gold/30 hover:shadow-2xl hover:shadow-gold/40 hover:scale-[1.03] active:scale-[0.98] transition-all duration-300"
                    >
                      <div className="absolute inset-0 rounded-2xl bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <BookOpen className="h-4.5 w-4.5 relative z-10" />
                      <span className="relative z-10">Quero continuar lendo</span>
                    </button>
                    
                    <span className="text-[10px] text-stone-500/40 tracking-wider uppercase">
                      Acesso completo e imediato
                    </span>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ═══ AUDIOBOOK PLAYER ═══ */}
      {ebookAudio.available && controlsVisible && (
        <div className="flex items-center gap-3 px-3 sm:px-6 py-2.5 border-t border-stone-800/30 bg-[#1a1814]/95 backdrop-blur-xl z-30">
          <Headphones className="h-3.5 w-3.5 text-gold/50 shrink-0" />

          {ebookAudio.isFileMode && (
            <button onClick={() => ebookAudio.skipBack(15)} className="h-7 w-7 flex items-center justify-center rounded-full text-stone-400/60 hover:text-gold transition-colors" title="-15s">
              <SkipBack className="h-3.5 w-3.5" />
            </button>
          )}

          <button
            onClick={ebookAudio.toggle}
            className={`h-9 w-9 flex items-center justify-center rounded-full border transition-all ${
              ebookAudio.isPlaying
                ? "bg-gold/15 border-gold/30 text-gold"
                : "bg-stone-800/40 border-stone-700/20 text-stone-400/70 hover:text-gold hover:border-gold/25"
            }`}
          >
            {ebookAudio.isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
          </button>

          {ebookAudio.isFileMode && (
            <button onClick={() => ebookAudio.skipForward(15)} className="h-7 w-7 flex items-center justify-center rounded-full text-stone-400/60 hover:text-gold transition-colors" title="+15s">
              <SkipForward className="h-3.5 w-3.5" />
            </button>
          )}

          {ebookAudio.isPlaying && (
            <button onClick={ebookAudio.stop} className="h-7 w-7 flex items-center justify-center rounded-full text-stone-500/40 hover:text-red-400 transition-colors">
              <Square className="h-3 w-3" />
            </button>
          )}

          {ebookAudio.isFileMode && ebookAudio.duration > 0 && (
            <div className="flex-1 flex items-center gap-2 min-w-0">
              <span className="text-[10px] tabular-nums text-stone-500/50 shrink-0 min-w-[2.5rem] text-right">
                {formatTime(ebookAudio.progress)}
              </span>
              <div
                className="flex-1 h-1.5 rounded-full bg-stone-700/25 overflow-hidden cursor-pointer relative group"
                onClick={(e) => {
                  e.stopPropagation();
                  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                  const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                  ebookAudio.seek(pct * ebookAudio.duration);
                }}
              >
                <div
                  className="h-full rounded-full bg-gold/60 transition-all duration-150 group-hover:bg-gold/80"
                  style={{ width: `${(ebookAudio.progress / ebookAudio.duration) * 100}%` }}
                />
              </div>
              <span className="text-[10px] tabular-nums text-stone-500/35 shrink-0 min-w-[2.5rem]">
                {formatTime(ebookAudio.duration)}
              </span>
            </div>
          )}

          {!ebookAudio.isFileMode && (
            <span className="text-[9px] uppercase tracking-widest text-stone-500/40">Leitura em voz</span>
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
              <span className="text-stone-500/50">{hasPaywall ? freePageLimit : numPages}</span>
              {hasPaywall && <Lock className="inline h-2.5 w-2.5 text-gold/40 ml-0.5" />}
              <span className="ml-1.5 text-gold/50 font-medium">{totalSpreads > 0 ? Math.round(((spread + 1) / (hasPaywall ? maxAllowedSpread + 1 : totalSpreads)) * 100) : 0}%</span>
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

        <Button variant="premiumOutline" size="sm" onClick={nextSpread} disabled={spread >= totalSpreads - 1 || isAtPaywall} className="gap-1.5">
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
