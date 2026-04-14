import { toast } from "sonner";

/**
 * Map of known technical error substrings to user-friendly messages.
 * Order matters — first match wins.
 */
const ERROR_MAP: [RegExp, string][] = [
  [/duplicate key|unique constraint|already exists/i, "Este registro já existe. Verifique os dados e tente novamente."],
  [/foreign key|violates.*constraint/i, "Este item está vinculado a outros dados e não pode ser alterado assim."],
  [/row-level security|permission denied|not authorized|403/i, "Você não tem permissão para esta ação."],
  [/network|fetch|failed to fetch|ERR_NETWORK/i, "Erro de conexão. Verifique sua internet e tente novamente."],
  [/timeout|timed out|504|408/i, "A operação demorou demais. Tente novamente."],
  [/too large|payload|413/i, "O arquivo é grande demais. Reduza o tamanho e tente novamente."],
  [/not found|404/i, "Item não encontrado. Ele pode ter sido removido."],
  [/500|internal server/i, "Erro interno do servidor. Tente novamente em instantes."],
  [/storage|bucket/i, "Erro ao acessar o armazenamento de arquivos."],
  [/invalid|validation|required/i, "Dados inválidos. Verifique os campos e tente novamente."],
];

const FALLBACK_MESSAGE = "Ocorreu um erro inesperado. Tente novamente.";

/**
 * Extracts a user-friendly message from an error object.
 */
export function friendlyErrorMessage(err: unknown): string {
  const raw =
    (err as any)?.message ||
    (err as any)?.error_description ||
    (err as any)?.statusText ||
    (typeof err === "string" ? err : "");

  if (!raw) return FALLBACK_MESSAGE;

  for (const [pattern, friendly] of ERROR_MAP) {
    if (pattern.test(raw)) return friendly;
  }

  // If the message is short and looks user-friendly already (no stack trace, no code), pass it through
  if (raw.length < 120 && !/\bat\b.*\.ts|\.js|Error:|^\{/.test(raw)) {
    return raw;
  }

  return FALLBACK_MESSAGE;
}

/**
 * Show a standardized error toast. Use instead of `toast.error(err.message)`.
 */
export function toastError(err: unknown, context?: string) {
  const msg = friendlyErrorMessage(err);
  toast.error(context ? `${context}: ${msg}` : msg);
}

/**
 * Show a standardized success toast.
 */
export function toastSuccess(message: string) {
  toast.success(message);
}
