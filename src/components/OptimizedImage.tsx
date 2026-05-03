import { useState, useCallback, memo } from "react";

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
  onError?: () => void;
}

const SIZES_MAP: Record<string, string> = {
  card: "(max-width: 640px) 170px, (max-width: 1024px) 210px, 240px",
  banner: "(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 1400px",
  hero: "100vw",
  thumbnail: "80px",
  ebook: "(max-width: 640px) 100vw, 50vw",
};

/**
 * Optimized image with native lazy loading + async decoding.
 * Confia no `loading="lazy"` nativo (sem IntersectionObserver em JS),
 * o que reduz CPU/memória em listas longas de cards.
 */
export const OptimizedImage = memo(function OptimizedImage({
  src,
  alt,
  className = "",
  context = "card",
  priority = false,
  style,
  onClick,
  onError,
}: OptimizedImageProps) {
  const [loaded, setLoaded] = useState(false);
  const handleLoad = useCallback(() => setLoaded(true), []);
  const handleError = useCallback(() => {
    setLoaded(true);
    onError?.();
  }, [onError]);
  const sizes = SIZES_MAP[context] || SIZES_MAP.card;

  return (
    <img
      src={src}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      // @ts-ignore — fetchpriority é suportado pelo browser
      fetchpriority={priority ? "high" : "auto"}
      sizes={sizes}
      onLoad={handleLoad}
      onError={handleError}
      onClick={onClick}
      className={`${className} transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-100"}`}
      style={style}
    />
  );
});

