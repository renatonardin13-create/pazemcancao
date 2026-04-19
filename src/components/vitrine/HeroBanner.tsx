import { useEffect, useState } from "react";
import { Play, Info } from "lucide-react";
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
  const item = list[Math.min(index, list.length - 1)];

  const handleNav = (url: string | null) => {
    if (!url) return;
    if (/^https?:\/\//i.test(url)) {
      window.open(url, "_blank", "noopener,noreferrer");
    } else {
      window.location.href = url;
    }
  };

  return (
    <section className="relative h-[60vh] min-h-[420px] w-full overflow-hidden">
      <div className="absolute inset-0">
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.title}
            className="h-full w-full object-cover transition-opacity duration-700"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-zinc-900 via-black to-zinc-950" />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-background to-transparent" />
      </div>

      <div className="relative z-10 flex h-full items-end px-4 pb-12 sm:px-8 sm:pb-16 lg:px-12">
        <div className="max-w-2xl space-y-4">
          <h1 className="text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">
            {item.title}
          </h1>
          {item.subtitle && (
            <p className="text-base text-white/80 sm:text-lg">{item.subtitle}</p>
          )}
          {item.description && (
            <p className="line-clamp-2 max-w-xl text-sm text-white/70">{item.description}</p>
          )}

          <div className="flex flex-wrap items-center gap-3 pt-2">
            {item.primary_cta_url && (
              <button
                onClick={() => handleNav(item.primary_cta_url)}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition-transform hover:scale-105"
              >
                <Play className="h-5 w-5 fill-current" />
                {item.primary_cta_label || "Saiba mais"}
              </button>
            )}
            {item.secondary_cta_url && (
              <button
                onClick={() => handleNav(item.secondary_cta_url)}
                className="inline-flex items-center gap-2 rounded-lg bg-white/15 px-6 py-3 font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/25"
              >
                <Info className="h-5 w-5" />
                {item.secondary_cta_label || "Detalhes"}
              </button>
            )}
          </div>

          {list.length > 1 && (
            <div className="flex gap-1.5 pt-3">
              {list.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIndex(i)}
                  className={`h-1.5 rounded-full transition-all ${
                    i === index ? "w-8 bg-primary" : "w-4 bg-white/30"
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
