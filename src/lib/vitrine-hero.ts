/**
 * Modelo unificado do banner Hero da Vitrine.
 * Aceita banners cadastrados em `vitrine_hero_banners` e fallback de
 * curso em destaque (mantém compatibilidade com o hero atual).
 */
export type HeroBannerModel = {
  id: string;
  image_url: string | null;
  title: string;
  subtitle: string | null;
  description: string | null;
  primary_cta_label: string | null;
  primary_cta_url: string | null;
  secondary_cta_label: string | null;
  secondary_cta_url: string | null;
  source: "custom" | "course-fallback";
};

type RawBanner = {
  id?: string;
  image_url?: string | null;
  banner_image?: string | null;
  hero_image?: string | null;
  title?: string | null;
  subtitle?: string | null;
  description?: string | null;
  primary_cta_label?: string | null;
  primary_cta_url?: string | null;
  secondary_cta_label?: string | null;
  secondary_cta_url?: string | null;
  is_active?: boolean | null;
  sort_order?: number | null;
};

/** Converte uma linha de `vitrine_hero_banners` para o modelo unificado. */
export function mapBannerToHeroModel(raw: RawBanner): HeroBannerModel | null {
  const image = raw.image_url || raw.banner_image || raw.hero_image || null;
  if (!image) return null;
  return {
    id: raw.id || crypto.randomUUID(),
    image_url: image,
    title: (raw.title || "").trim() || "Conheça nosso catálogo",
    subtitle: raw.subtitle?.trim() || null,
    description: raw.description?.trim() || null,
    primary_cta_label: raw.primary_cta_label?.trim() || null,
    primary_cta_url: raw.primary_cta_url?.trim() || null,
    secondary_cta_label: raw.secondary_cta_label?.trim() || null,
    secondary_cta_url: raw.secondary_cta_url?.trim() || null,
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
    title: course.display_title || course.title || "Curso em destaque",
    subtitle: course.display_subtitle || course.short_description || null,
    description: null,
    primary_cta_label: null,
    primary_cta_url: course.banner_link_url || course.sales_page_url || null,
    secondary_cta_label: null,
    secondary_cta_url: null,
    source: "course-fallback",
  };
}
