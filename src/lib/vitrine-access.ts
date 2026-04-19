/**
 * Função central de acesso da Vitrine.
 * Centraliza a regra: comprado = liberado, caso contrário = bloqueado.
 *
 * Aceita equivalentes de campos vindos do backend:
 *  - access_state ("enrolled" | "in_progress" | "completed" | "coming_soon" | "locked")
 *  - purchased / unlocked / has_access / access / user_has_access / is_enrolled
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
