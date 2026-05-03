/**
 * Lógica central de acesso e link de apresentação da Vitrine.
 *
 * isContentUnlocked(item): comprado/liberado = true; caso contrário false.
 * isContentComingSoon(item): conteúdo agendado para lançamento futuro.
 * getContentPresentationUrl(item): resolve a URL de apresentação/vendas com prioridade.
 */
type AccessLike = {
  access_state?: string | null;
  purchased?: boolean | null;
  unlocked?: boolean | null;
  has_access?: boolean | null;
  access?: boolean | null;
  user_has_access?: boolean | null;
  is_enrolled?: boolean | null;
};

type LinkLike = {
  sales_page_url?: string | null;
  presentation_url?: string | null;
  landing_page_url?: string | null;
  product_url?: string | null;
  offer_url?: string | null;
  checkout_url?: string | null;
  banner_link_url?: string | null;
};

const RELEASED_STATES = new Set(["enrolled", "in_progress", "completed"]);

export function isContentUnlocked(item: AccessLike | null | undefined): boolean {
  if (!item) return false;
  if (item.access_state && RELEASED_STATES.has(item.access_state)) return true;
  return Boolean(
    item.purchased ||
      item.unlocked ||
      item.has_access ||
      item.access ||
      item.user_has_access ||
      item.is_enrolled,
  );
}

export function isContentComingSoon(item: AccessLike | null | undefined): boolean {
  return item?.access_state === "coming_soon";
}

/**
 * Retorna a URL de apresentação/vendas do conteúdo.
 * Prioridade: sales_page_url > presentation_url > landing_page_url >
 *             product_url > offer_url > checkout_url > banner_link_url.
 * Retorna null quando nada existir (CTA deve ser desabilitado).
 */
export function getContentPresentationUrl(item: LinkLike | null | undefined): string | null {
  if (!item) return null;
  const candidates = [
    item.sales_page_url,
    (item as any).presentation_url,
    (item as any).landing_page_url,
    (item as any).product_url,
    (item as any).offer_url,
    item.checkout_url,
    item.banner_link_url,
  ];
  for (const url of candidates) {
    if (typeof url === "string" && url.trim().length > 0) return url.trim();
  }
  return null;
}
