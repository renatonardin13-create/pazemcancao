import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Play, ArrowRight, X } from "lucide-react";
import type { VitrineCourse } from "./types";
import {
  fallbackHeroContent,
  getActiveHeroBanners,
  resolveCtaHref,
  type HeroBannerModel,
} from "@/lib/vitrine-hero";

interface Props {
  banners?: any[] | null;
  fallbackCourse?: VitrineCourse | null;
}

export function HeroBanner({ banners, fallbackCourse }: Props) {
  const list: HeroBannerModel[] = (() => {
    const fromTable = getActiveHeroBanners(banners as any[] | undefined).filter(
      (b) => b && typeof b.image_url === "string" && b.image_url.trim().length > 0,
    );
    if (fromTable.length > 0) return fromTable;
    const fb = fallbackHeroContent(fallbackCourse);
    return fb && fb.image_url && fb.image_url.trim().length > 0 ? [fb] : [];
  })();

  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const touchStart = useRef<number | null>(null);

  const active = list[Math.min(index, Math.max(0, list.length - 1))];
  const interval = active?.autoplay_interval_ms || 7000;
  const autoplayOn = !!active?.autoplay && list.length > 1 && !paused && !videoUrl;

  useEffect(() => {
    if (!autoplayOn) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % list.length), interval);
    return () => clearInterval(id);
  }, [autoplayOn, interval, list.length]);

  if (list.length === 0) return null;

  const go = (dir: 1 | -1) =>
    setIndex((i) => (i + dir + list.length) % list.length);

  const navigateTo = (href: string | null) => {
    if (!href) return;
    if (/^https?:\/\//i.test(href)) {
      window.open(href, "_blank", "noopener,noreferrer");
    } else {
      window.location.href = href;
    }
  };

  const handleCta = (
    type: HeroBannerModel["primary_cta_type"],
    target: string | null,
    url: string | null,
  ) => {
    if (type === "video" && target) {
      setVideoUrl(target);
      return;
    }
    const href = resolveCtaHref(type, target, url);
    navigateTo(href);
  };

  const handleBannerClick = (b: HeroBannerModel) => {
    if (!b.banner_clickable) return;
    if (b.banner_click_type === "video" && b.banner_click_target) {
      setVideoUrl(b.banner_click_target);
      return;
    }
    const href = resolveCtaHref(b.banner_click_type, b.banner_click_target);
    navigateTo(href);
  };

  return (
    <section
      className="relative w-full bg-background"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="mx-auto w-full max-w-[1400px] px-4 pt-6 sm:px-8 lg:px-12">
        <div
          className="relative w-full overflow-hidden rounded-2xl bg-zinc-950 ring-1 ring-white/5 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.6)]"
          onTouchStart={(e) => (touchStart.current = e.touches[0].clientX)}
          onTouchEnd={(e) => {
            if (touchStart.current == null) return;
            const dx = e.changedTouches[0].clientX - touchStart.current;
            if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
            touchStart.current = null;
          }}
        >
          {list.map((b, i) => {
            const isActive = i === index;
            return (
              <div
                key={b.id}
                aria-hidden={!isActive}
                className={`${
                  i === 0 ? "relative" : "absolute inset-0"
                } transition-opacity duration-700 ease-out ${
                  isActive ? "z-10 opacity-100" : "pointer-events-none opacity-0"
                }`}
              >
                <BannerSlide
                  banner={b}
                  onClickArea={() => handleBannerClick(b)}
                  onPrimary={() =>
                    handleCta(b.primary_cta_type, b.primary_cta_target, b.primary_cta_url)
                  }
                  onSecondary={() =>
                    handleCta(b.secondary_cta_type, b.secondary_cta_target, b.secondary_cta_url)
                  }
                />
              </div>
            );
          })}

          {/* Setas */}
          {list.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => go(-1)}
                aria-label="Slide anterior"
                className="absolute left-3 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white/80 backdrop-blur-md transition hover:bg-black/60 hover:text-white sm:left-4"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => go(1)}
                aria-label="Próximo slide"
                className="absolute right-3 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white/80 backdrop-blur-md transition hover:bg-black/60 hover:text-white sm:right-4"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}

          {/* Indicadores */}
          {list.length > 1 && (
            <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 gap-1.5">
              {list.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIndex(i)}
                  className={`h-1.5 rounded-full transition-all ${
                    i === index ? "w-8 bg-gold" : "w-3 bg-white/40 hover:bg-white/70"
                  }`}
                  aria-label={`Banner ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {videoUrl && (
        <VideoModal url={videoUrl} onClose={() => setVideoUrl(null)} />
      )}
    </section>
  );
}

function BannerSlide({
  banner,
  onClickArea,
  onPrimary,
  onSecondary,
}: {
  banner: HeroBannerModel;
  onClickArea: () => void;
  onPrimary: () => void;
  onSecondary: () => void;
}) {
  const desktop = banner.image_url || "";
  const tablet = banner.image_tablet_url || desktop;
  const mobile = banner.image_mobile_url || tablet;

  return (
    <div
      className={`relative grid min-h-[260px] grid-cols-1 gap-0 overflow-hidden sm:min-h-[340px] lg:min-h-[420px] lg:grid-cols-2 ${
        banner.banner_clickable ? "cursor-pointer" : ""
      }`}
      onClick={onClickArea}
    >
      {/* Texto */}
      <div className="relative z-10 order-2 flex flex-col justify-center gap-4 px-6 py-8 sm:px-10 sm:py-10 lg:order-1 lg:px-14">
        <div className="pointer-events-none absolute -left-20 top-1/2 -z-10 h-[300px] w-[300px] -translate-y-1/2 rounded-full bg-gold/10 blur-[120px]" />
        {banner.subtitle && (
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-gold/80">
            {banner.subtitle}
          </p>
        )}
        <h2 className="font-display text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
          {banner.title}
        </h2>
        {banner.description && (
          <p className="max-w-md text-sm leading-relaxed text-white/70 sm:text-base">
            {banner.description}
          </p>
        )}
        {(banner.primary_cta_label || banner.secondary_cta_label) && (
          <div className="mt-2 flex flex-wrap gap-3">
            {banner.primary_cta_label && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onPrimary();
                }}
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-300 via-gold to-amber-500 px-6 py-3 text-sm font-bold text-black shadow-[0_8px_30px_-8px_rgba(212,175,55,0.6)] transition hover:scale-[1.02]"
              >
                {banner.primary_cta_label}
                <ArrowRight className="h-4 w-4" />
              </button>
            )}
            {banner.secondary_cta_label && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSecondary();
                }}
                className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-white/5 px-6 py-3 text-sm font-semibold text-white backdrop-blur-md transition hover:bg-white/10"
              >
                {banner.secondary_cta_type === "video" && <Play className="h-4 w-4" />}
                {banner.secondary_cta_label}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Arte */}
      <div className="relative order-1 lg:order-2">
        <picture>
          <source media="(max-width: 640px)" srcSet={mobile} />
          <source media="(max-width: 1024px)" srcSet={tablet} />
          <img
            src={desktop}
            alt={banner.title || "Banner"}
            loading="eager"
            decoding="async"
            className="h-full min-h-[260px] w-full object-cover sm:min-h-[340px] lg:min-h-[420px] lg:max-h-[460px]"
            draggable={false}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
          />
        </picture>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/40 to-transparent lg:from-zinc-950/80 lg:via-zinc-950/20" />
      </div>
    </div>
  );
}

function VideoModal({ url, onClose }: { url: string; onClose: () => void }) {
  const isYoutube = /youtube\.com|youtu\.be/.test(url);
  const embed = isYoutube
    ? url.replace("watch?v=", "embed/").replace("youtu.be/", "youtube.com/embed/")
    : url;
  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
        aria-label="Fechar"
      >
        <X className="h-5 w-5" />
      </button>
      <div
        className="relative w-full max-w-4xl overflow-hidden rounded-xl bg-black aspect-video mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {isYoutube ? (
          <iframe
            src={embed}
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <video src={embed} controls autoPlay className="h-full w-full" />
        )}
      </div>
    </div>
  );
}
