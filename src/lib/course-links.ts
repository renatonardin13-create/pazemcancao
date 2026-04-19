import type { VitrineCourse } from "@/components/vitrine/types";

/** URL global de fallback (usada quando o curso não tem link próprio). */
export const FALLBACK_SALES_URL = "https://pazemcancao.lovable.app";

function isValidUrl(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const v = value.trim();
  if (!v) return false;
  try {
    const u = new URL(v);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Resolve a URL de venda de um curso usando ordem de prioridade tolerante.
 * Aceita campos com nomes alternativos para evitar quebrar quando o backend variar.
 */
export function getCourseSalesPageUrl(
  course: Partial<VitrineCourse> & Record<string, unknown> = {},
  fallback: string | null = FALLBACK_SALES_URL,
): string | null {
  const candidates = [
    course.sales_page_url,
    (course as Record<string, unknown>).checkout_url,
    (course as Record<string, unknown>).offer_url,
    (course as Record<string, unknown>).product_url,
    (course as Record<string, unknown>).landing_page_url,
    course.banner_link_url,
  ];
  for (const c of candidates) {
    if (isValidUrl(c)) return c;
  }
  return isValidUrl(fallback) ? fallback : null;
}
