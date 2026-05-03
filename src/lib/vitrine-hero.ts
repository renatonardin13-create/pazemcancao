/**
 * Modelo unificado do banner Hero da Vitrine.
 * Aceita banners cadastrados em `vitrine_hero_banners` e fallback de
 * curso em destaque (mantém compatibilidade com o hero atual).
 */
export type CtaType = "url" | "product" | "video";
export type DisplayMode = "fill" | "contain" | "cover" | "auto";
export type ContainerRatio = "auto" | "21/9" | "16/9" | "3/1" | "2/1";

export type HeroBannerModel = {
  id: string;
  image_url: string | null;
  image_tablet_url: string | null;
  image_mobile_url: string | null;
  image_width: number | null;
  image_height: number | null;
  display_mode: DisplayMode;
  container_ratio: ContainerRatio;
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

const VALID_MODES: DisplayMode[] = ["fill", "contain", "cover", "auto"];
const VALID_RATIOS: ContainerRatio[] = ["auto", "21/9", "16/9", "3/1", "2/1"];

/** Resolve um CTA (type+target) para uma URL navegável. */
export function resolveCtaHref(
  type: CtaType | null | undefined,
  target: string | null | undefined,
  fallbackUrl?: string | null,
): string | null {
  const t = (target || "").trim();
  if (type === "product" && t) return `/cursos/${t}`;
  if (type === "video" && t) return null;
  if (type === "url" && t) return t;
  return (fallbackUrl || "").trim() || null;
}

/** Converte uma linha de `vitrine_hero_banners` para o modelo unificado. */
export function mapBannerToHeroModel(raw: RawBanner): HeroBannerModel | null {
  const image = raw.image_url || raw.banner_image || raw.hero_image || null;
  if (!image) return null;
  const dm = raw.display_mode;
  const cr = raw.container_ratio;
  return {
    id: raw.id || crypto.randomUUID(),
    image_url: image,
    image_tablet_url: raw.image_tablet_url || null,
    image_mobile_url: raw.image_mobile_url || null,
    image_width: typeof raw.image_width === "number" ? raw.image_width : null,
    image_height: typeof raw.image_height === "number" ? raw.image_height : null,
    display_mode: (VALID_MODES.includes(dm) ? dm : "auto") as DisplayMode,
    container_ratio: (VALID_RATIOS.includes(cr) ? cr : "auto") as ContainerRatio,
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
    image_width: null,
    image_height: null,
    display_mode: "auto",
    container_ratio: "auto",
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

/** Converte ratio textual em aspect-ratio CSS (string). */
export function ratioToCss(ratio: ContainerRatio): string | undefined {
  if (ratio === "auto") return undefined;
  return ratio.replace("/", " / ");
}

/** Converte display_mode em valor object-fit. */
export function modeToObjectFit(mode: DisplayMode): "cover" | "contain" | "fill" | undefined {
  if (mode === "auto") return undefined;
  return mode;
}
