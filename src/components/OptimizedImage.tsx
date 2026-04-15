import { useState, useCallback, useRef, useEffect, memo } from "react";

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  /** Context determines max rendered size for srcSet hints */
  context?: "card" | "banner" | "hero" | "thumbnail" | "ebook";
  /** Priority loading (above the fold) */
  priority?: boolean;
  /** Additional style */
  style?: React.CSSProperties;
  onClick?: (e: React.MouseEvent) => void;
}

/**
 * Width hints per context for `sizes` attribute.
 * Helps browser pick the right resolution before layout.
 */
const SIZES_MAP: Record<string, string> = {
  card: "(max-width: 640px) 170px, (max-width: 1024px) 210px, 240px",
  banner: "(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 1400px",
  hero: "100vw",
  thumbnail: "80px",
  ebook: "(max-width: 640px) 100vw, 50vw",
};

/**
 * Optimized image component with:
 * - Native lazy loading via `loading="lazy"` (or eager for priority)
 * - `decoding="async"` to avoid blocking the main thread
 * - Responsive `sizes` hints per context
 * - Fade-in on load for perceived performance
 * - IntersectionObserver fallback for browsers without native lazy
 */
export const OptimizedImage = memo(function OptimizedImage({
  src,
  alt,
  className = "",
  context = "card",
  priority = false,
  style,
  onClick,
}: OptimizedImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [inView, setInView] = useState(priority);
  const imgRef = useRef<HTMLImageElement>(null);

  // IntersectionObserver for deferred rendering (skip if priority)
  useEffect(() => {
    if (priority) { setInView(true); return; }
    const el = imgRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px 0px" } // start loading 200px before visible
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [priority]);

  const handleLoad = useCallback(() => setLoaded(true), []);

  const sizes = SIZES_MAP[context] || SIZES_MAP.card;

  return (
    <img
      ref={imgRef}
      src={inView ? src : undefined}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      sizes={sizes}
      onLoad={handleLoad}
      onClick={onClick}
      className={`${className} transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"}`}
      style={style}
    />
  );
});
