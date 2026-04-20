/**
 * Modelo unificado do banner Hero da Vitrine.
 * Aceita banners cadastrados em `vitrine_hero_banners` e fallback de
 * curso em destaque (mantém compatibilidade com o hero atual).
 */
export type CtaType = "url" | "product" | "video";

export type HeroBannerModel = {
  id: string;
  image_url: string | null;
  image_tablet_url: string | null;
  image_mobile_url: string | null;
  title: string;
  subtitle: string | null;
  description: string | null;
  primary_cta_label: string | null;
  primary_cta_type: CtaType;
  primary_cta_target: string | null;
  primary_cta_url: string | null;
  secondary_cta_label: string | null;
  secondary_cta_type: CtaType;
  secondary_cta_target: string | null;
  secondary_cta_url: string | null;
  banner_clickable: boolean;
  banner_click_type: CtaType | null;
  banner_click_target: string | null;
  autoplay: boolean;
  autoplay_interval_ms: number;
  source: "custom" | "course-fallback";
};

type RawBanner = Record<string, any>;

function asCta(v: any): CtaType {
  return v === "product" || v === "video" ? v : "url";
}

/** Resolve um CTA (type+target) para uma URL navegável. */
export function resolveCtaHref(
  type: CtaType | null | undefined,
  target: string | null | undefined,
  fallbackUrl?: string | null,
): string | null {
  const t = (target || "").trim();
  if (type === "product" && t) return `/produto/${t}`;
  if (type === "video" && t) return null; // tratado como modal
  if (type === "url" && t) return t;
  return (fallbackUrl || "").trim() || null;
}

/** Converte uma linha de `vitrine_hero_banners` para o modelo unificado. */
export function mapBannerToHeroModel(raw: RawBanner): HeroBannerModel | null {
  const image = raw.image_url || raw.banner_image || raw.hero_image || null;
  if (!image) return null;
  return {
    id: raw.id || crypto.randomUUID(),
    image_url: image,
    image_tablet_url: raw.image_tablet_url || null,
    image_mobile_url: raw.image_mobile_url || null,
    title: (raw.title || "").trim() || "Conheça nosso catálogo",
    subtitle: raw.subtitle?.trim() || null,
    description: raw.description?.trim() || null,
    primary_cta_label: raw.primary_cta_label?.trim() || null,
    primary_cta_type: asCta(raw.primary_cta_type),
    primary_cta_target: raw.primary_cta_target?.trim() || null,
    primary_cta_url: raw.primary_cta_url?.trim() || null,
    secondary_cta_label: raw.secondary_cta_label?.trim() || null,
    secondary_cta_type: asCta(raw.secondary_cta_type),
    secondary_cta_target: raw.secondary_cta_target?.trim() || null,
    secondary_cta_url: raw.secondary_cta_url?.trim() || null,
    banner_clickable: !!raw.banner_clickable,
    banner_click_type: raw.banner_click_type ? asCta(raw.banner_click_type) : null,
    banner_click_target: raw.banner_click_target?.trim() || null,
    autoplay: raw.autoplay !== false,
    autoplay_interval_ms: Number(raw.autoplay_interval_ms) || 7000,
    source: "custom",
  };
}

/** Filtra e ordena banners ativos com fallback seguro. */
export function getActiveHeroBanners(rows: RawBanner[] | null | undefined): HeroBannerModel[] {
  if (!Array.isArray(rows)) return [];
  return rows
    .filter((r) => r && r.is_active !== false)
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
    .map(mapBannerToHeroModel)
    .filter((b): b is HeroBannerModel => Boolean(b));
}

/** Constrói um hero a partir de um curso em destaque (fallback). */
export function fallbackHeroContent(course: any | null | undefined): HeroBannerModel | null {
  if (!course?.id) return null;
  const image = course.banner_image_url || course.cover_image_url;
  if (!image) return null;
  return {
    id: `course:${course.id}`,
    image_url: image,
    image_tablet_url: null,
    image_mobile_url: null,
    title: course.display_title || course.title || "Curso em destaque",
    subtitle: course.display_subtitle || course.short_description || null,
    description: null,
    primary_cta_label: null,
    primary_cta_type: "url",
    primary_cta_target: null,
    primary_cta_url: course.banner_link_url || course.sales_page_url || null,
    secondary_cta_label: null,
    secondary_cta_type: "url",
    secondary_cta_target: null,
    secondary_cta_url: null,
    banner_clickable: true,
    banner_click_type: "url",
    banner_click_target: course.banner_link_url || course.sales_page_url || null,
    autoplay: true,
    autoplay_interval_ms: 7000,
    source: "course-fallback",
  };
}
