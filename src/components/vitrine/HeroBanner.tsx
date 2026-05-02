import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Play, ArrowRight, X } from "lucide-react";
import { useArea } from "@/hooks/use-area";
import type { VitrineCourse } from "./types";
import {
  fallbackHeroContent,
  getActiveHeroBanners,
  resolveCtaHref,
  ratioToCss,
  modeToObjectFit,
  type HeroBannerModel,
} from "@/lib/vitrine-hero";
import { logHeroBannerEvent } from "@/lib/hero-banner-metrics.functions";

// Dispara evento (impressão/click) sem bloquear UI nem quebrar em caso de erro
function track(bannerId: string, eventType: "impression" | "click", ctaKind?: string) {
  if (!bannerId) return;
  try {
    logHeroBannerEvent({ data: { bannerId, eventType, ctaKind: ctaKind || null } }).catch(
      () => {},
    );
  } catch {
    /* noop */
  }
}

interface Props {
  banners?: any[] | null;
  fallbackCourse?: VitrineCourse | null;
}

export function HeroBanner({ banners, fallbackCourse }: Props) {
  const { area } = useArea();
  const list: HeroBannerModel[] = (() => {
    const fromTable = getActiveHeroBanners(banners as any[] | undefined).filter(
      (b) => b && typeof b.image_url === "string" && b.image_url.trim().length > 0,
    );
    
    // Add area banner if it exists and it's not already in the list
    if (area?.banner_url) {
      const areaBanner: HeroBannerModel = {
        id: `area-${area.id}`,
        image_url: area.banner_url,
        image_tablet_url: null,
        image_mobile_url: null,
        image_width: null,
        image_height: null,
        title: area.nome || "",
        subtitle: "Banner da Área",
        description: null,
        primary_cta_label: null,
        primary_cta_type: "url",
        primary_cta_target: null,
        primary_cta_url: null,
        secondary_cta_label: null,
        secondary_cta_type: "url",
        secondary_cta_target: null,
        secondary_cta_url: null,
        banner_clickable: false,
        banner_click_type: null,
        banner_click_target: null,
        display_mode: "cover",
        container_ratio: "auto",
        autoplay: true,
        autoplay_interval_ms: 7000,
        source: "custom",
      };
      // Check if already exists (avoid duplicates if same URL)
      if (!fromTable.some(b => b.image_url === area.banner_url)) {
        fromTable.unshift(areaBanner);
      }
    }

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

  // Registra impressão sempre que o slide ativo mudar (1x por slide visível)
  useEffect(() => {
    if (active?.id) track(active.id, "impression");
  }, [active?.id]);

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
    bannerId: string,
    type: HeroBannerModel["primary_cta_type"],
    target: string | null,
    url: string | null,
    kind: "primary" | "secondary",
  ) => {
    track(bannerId, "click", `cta_${kind}`);
    if (type === "video" && target) {
      setVideoUrl(target);
      return;
    }
    const href = resolveCtaHref(type, target, url);
    navigateTo(href);
  };

  const handleBannerClick = (b: HeroBannerModel) => {
    if (!b.banner_clickable) return;
    track(b.id, "click", "banner");
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
                    handleCta(b.id, b.primary_cta_type, b.primary_cta_target, b.primary_cta_url, "primary")
                  }
                  onSecondary={() =>
                    handleCta(b.id, b.secondary_cta_type, b.secondary_cta_target, b.secondary_cta_url, "secondary")
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

function useDevice(): "mobile" | "tablet" | "desktop" {
  const [device, setDevice] = useState<"mobile" | "tablet" | "desktop">(() => {
    if (typeof window === "undefined") return "desktop";
    const w = window.innerWidth;
    return w < 640 ? "mobile" : w < 1024 ? "tablet" : "desktop";
  });
  useEffect(() => {
    const onResize = () => {
      const w = window.innerWidth;
      setDevice(w < 640 ? "mobile" : w < 1024 ? "tablet" : "desktop");
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return device;
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
  const device = useDevice();
  const desktop = banner.image_url || "";
  const tablet = banner.image_tablet_url || desktop;
  const mobile = banner.image_mobile_url || tablet;

  // Fallback de imagem por dispositivo (mobile -> tablet -> desktop)
  const imageSrc =
    device === "mobile"
      ? mobile || tablet || desktop
      : device === "tablet"
        ? tablet || desktop
        : desktop;

  // CTAs: só renderiza quando há label + href resolvível
  const primaryHref = resolveCtaHref(
    banner.primary_cta_type,
    banner.primary_cta_target,
    banner.primary_cta_url,
  );
  const secondaryHref = resolveCtaHref(
    banner.secondary_cta_type,
    banner.secondary_cta_target,
    banner.secondary_cta_url,
  );
  const hasPrimary = !!(banner.primary_cta_label?.trim() && primaryHref);
  // Botão secundário (vídeo/trailer) removido conforme regra da vitrine.
  const hasSecondary = false;
  void secondaryHref;

  const aspect = ratioToCss(banner.container_ratio);
  const fit = modeToObjectFit(banner.display_mode) ?? "contain";
  const hasContainer = !!aspect;
  const hasTextOverlay = !!(
    banner.subtitle?.trim() ||
    banner.title?.trim() ||
    banner.description?.trim()
  );

  return (
    <div
      className={`relative w-full overflow-hidden bg-zinc-950 ${
        banner.banner_clickable ? "cursor-pointer" : ""
      }`}
      onClick={onClickArea}
      style={hasContainer ? { aspectRatio: aspect } : undefined}
    >
      {/* Camada 1 — Fundo (blur da própria imagem para preencher áreas vazias) */}
      {imageSrc && fit === "contain" && (
        <div
          aria-hidden
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url(${imageSrc})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "blur(40px) brightness(0.45)",
            transform: "scale(1.15)",
          }}
        />
      )}

      {/* Camada 2 — Imagem do banner */}
      {imageSrc && (
        <img
          src={imageSrc}
          alt={banner.title || "Banner"}
          loading="eager"
          decoding="async"
          draggable={false}
          className={
            hasContainer
              ? "absolute inset-0 z-10 block h-full w-full select-none"
              : "relative z-10 block h-auto w-full select-none"
          }
          style={{
            objectFit: fit,
            objectPosition: "center",
          }}
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = "none";
          }}
        />
      )}

      {/* Camada 3 — Conteúdo textual + CTAs */}
      {(hasTextOverlay || hasPrimary || hasSecondary) && (
        <div className="pointer-events-none absolute inset-0 z-30 flex items-end sm:items-center">
          <div className="w-full bg-gradient-to-t from-black/85 via-black/40 to-transparent px-6 pb-6 pt-16 sm:bg-gradient-to-r sm:from-black/80 sm:via-black/40 sm:to-transparent sm:px-10 sm:py-8 lg:px-14">
            <div className="max-w-xl space-y-3">
              {banner.subtitle && (
                <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-gold/90">
                  {banner.subtitle}
                </p>
              )}
              {banner.title && (
                <h2 className="font-display text-2xl font-bold leading-tight tracking-tight text-white sm:text-3xl lg:text-4xl">
                  {banner.title}
                </h2>
              )}
              {banner.description && (
                <p className="hidden max-w-md text-sm leading-relaxed text-white/80 sm:block sm:text-base">
                  {banner.description}
                </p>
              )}
              {(hasPrimary || hasSecondary) && (
                <div
                  className="pointer-events-auto mt-4 flex flex-wrap gap-3"
                  style={{ zIndex: 40 }}
                >
                  {hasPrimary && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onPrimary();
                      }}
                      className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-300 via-gold to-amber-500 px-6 py-3 text-sm font-bold text-black shadow-[0_8px_30px_-8px_rgba(212,175,55,0.6)] transition hover:scale-[1.02]"
                    >
                      {banner.primary_cta_type === "video" && <Play className="h-4 w-4" />}
                      {banner.primary_cta_label}
                      {banner.primary_cta_type !== "video" && <ArrowRight className="h-4 w-4" />}
                    </button>
                  )}
                  {hasSecondary && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSecondary();
                      }}
                      className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur-md transition hover:bg-white/20"
                    >
                      {banner.secondary_cta_type === "video" && <Play className="h-4 w-4" />}
                      {banner.secondary_cta_label}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
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
