import { useEffect, useState } from "react";
import { Play, ArrowRight } from "lucide-react";
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
    <section className="relative w-full overflow-hidden bg-gradient-to-br from-black via-zinc-950 to-black">
      <div className="mx-auto grid w-full max-w-[1400px] grid-cols-1 items-center gap-6 px-4 py-10 sm:px-8 sm:py-14 lg:grid-cols-2 lg:gap-8 lg:px-12 lg:py-20">
        {/* Texto à esquerda */}
        <div className="relative z-10 order-2 max-w-xl space-y-5 lg:order-1">
          {item.subtitle && (
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold/80 sm:text-sm">
              {item.subtitle}
            </p>
          )}

          <h1 className="font-display text-4xl font-black leading-[1.05] text-white sm:text-5xl lg:text-6xl xl:text-7xl">
            {(() => {
              const title = item.title || "";
              const parts = title.split(" ");
              if (parts.length >= 2) {
                const first = parts[0];
                const rest = parts.slice(1).join(" ");
                return (
                  <>
                    <span className="block text-white">{first}</span>
                    <span className="block bg-gradient-to-r from-amber-300 via-gold to-amber-500 bg-clip-text text-transparent">
                      {rest}
                    </span>
                  </>
                );
              }
              return <span className="text-white">{title}</span>;
            })()}
          </h1>

          {item.description && (
            <p className="max-w-lg text-base text-white/70 sm:text-lg">
              {item.description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-3 pt-2">
            {item.primary_cta_url && (
              <button
                onClick={() => handleNav(item.primary_cta_url)}
                className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-400 to-gold px-7 py-3.5 text-sm font-bold text-black shadow-[0_8px_30px_-8px_rgba(212,175,55,0.6)] transition-all hover:scale-105 hover:shadow-[0_12px_40px_-8px_rgba(212,175,55,0.8)] sm:text-base"
              >
                {item.primary_cta_label || "Quero conhecer"}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
            )}
            {item.secondary_cta_url && (
              <button
                onClick={() => handleNav(item.secondary_cta_url)}
                className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:border-gold/70 hover:bg-white/10 sm:text-base"
              >
                <Play className="h-4 w-4 fill-current" />
                {item.secondary_cta_label || "Assistir vídeo"}
              </button>
            )}
          </div>

          {list.length > 1 && (
            <div className="flex gap-1.5 pt-4">
              {list.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIndex(i)}
                  className={`h-1.5 rounded-full transition-all ${
                    i === index ? "w-8 bg-gold" : "w-4 bg-white/25 hover:bg-white/40"
                  }`}
                  aria-label={`Banner ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Imagem à direita */}
        <div className="relative order-1 lg:order-2">
          <div className="absolute -inset-10 -z-10 rounded-full bg-gradient-radial from-gold/20 via-amber-600/5 to-transparent blur-3xl" />
          {item.image_url ? (
            <img
              src={item.image_url}
              alt={item.title}
              className="mx-auto h-auto w-full max-w-[640px] object-contain drop-shadow-[0_25px_60px_rgba(212,175,55,0.25)]"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          ) : (
            <div className="aspect-[16/10] w-full rounded-2xl bg-gradient-to-br from-zinc-800 to-zinc-950" />
          )}
        </div>
      </div>

      {/* brilhos decorativos */}
      <div className="pointer-events-none absolute inset-0 -z-0 overflow-hidden">
        <div className="absolute -right-32 top-1/2 h-96 w-96 -translate-y-1/2 rounded-full bg-gold/10 blur-[120px]" />
        <div className="absolute -left-20 bottom-0 h-72 w-72 rounded-full bg-amber-700/10 blur-[100px]" />
      </div>
    </section>
  );
}
