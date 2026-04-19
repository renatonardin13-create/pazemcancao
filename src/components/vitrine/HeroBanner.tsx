import { useEffect, useState } from "react";
import type { VitrineCourse } from "./types";
import {
  fallbackHeroContent,
  getActiveHeroBanners,
  type HeroBannerModel,
} from "@/lib/vitrine-hero";

interface Props {
  /** Banners cadastrados em `vitrine_hero_banners`. */
  banners?: any[] | null;
  /** Curso usado como fallback quando não há banner cadastrado. */
  fallbackCourse?: VitrineCourse | null;
  /** Tempo de rotação entre múltiplos banners ativos (ms). */
  rotationMs?: number;
}

export function HeroBanner({ banners, fallbackCourse, rotationMs = 7000 }: Props) {
  const list: HeroBannerModel[] = (() => {
    const fromTable = getActiveHeroBanners(banners as any[] | undefined);
    if (fromTable.length > 0) return fromTable;
    const fb = fallbackHeroContent(fallbackCourse);
    return fb ? [fb] : [];
  })();

  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (list.length <= 1) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % list.length), rotationMs);
    return () => clearInterval(id);
  }, [list.length, rotationMs]);

  if (list.length === 0) return null;
  const activeIndex = Math.min(index, list.length - 1);

  const handleClick = (url: string | null) => {
    if (!url) return;
    if (/^https?:\/\//i.test(url)) {
      window.open(url, "_blank", "noopener,noreferrer");
    } else {
      window.location.href = url;
    }
  };

  return (
    <section className="relative w-full bg-background">
      <div className="mx-auto w-full max-w-[1400px] px-4 pt-6 sm:px-8 lg:px-12">
        <div className="relative aspect-[3/1] w-full overflow-hidden rounded-2xl bg-zinc-950 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.6)] ring-1 ring-white/5">
          {list.map((item, i) => {
            const clickUrl = item.primary_cta_url || item.secondary_cta_url || null;
            const isActive = i === activeIndex;
            return (
              <button
                key={i}
                type="button"
                aria-hidden={!isActive}
                tabIndex={isActive ? 0 : -1}
                onClick={() => handleClick(clickUrl)}
                disabled={!clickUrl}
                className={`absolute inset-0 block h-full w-full transition-opacity duration-700 ease-out ${
                  isActive ? "z-10 opacity-100" : "pointer-events-none opacity-0"
                } ${clickUrl ? "cursor-pointer" : "cursor-default"}`}
              >
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={item.title || "Banner"}
                    className="h-full w-full object-cover"
                    draggable={false}
                  />
                ) : (
                  <div className="h-full w-full bg-gradient-to-br from-zinc-900 via-black to-zinc-950" />
                )}
              </button>
            );
          })}

          {/* Indicadores */}
          {list.length > 1 && (
            <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 gap-1.5">
              {list.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIndex(i)}
                  className={`h-1.5 rounded-full transition-all ${
                    i === activeIndex ? "w-8 bg-gold" : "w-3 bg-white/40 hover:bg-white/70"
                  }`}
                  aria-label={`Banner ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
