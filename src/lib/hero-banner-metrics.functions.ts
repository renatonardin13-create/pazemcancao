import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const ADMIN_EMAIL = "renatonardin13@gmail.com";

async function assertAdmin(context: any) {
  const email = String(context?.claims?.email || "").toLowerCase();
  if (email === ADMIN_EMAIL) return;
  const { data } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", context.userId)
    .eq("role", "admin")
    .maybeSingle();
  if (!data) throw new Error("Acesso restrito ao administrador.");
}

const VALID_TYPES = new Set(["impression", "click"]);

/**
 * Registra um evento de impressão ou clique de banner.
 * Aceita usuário autenticado; e-mail é opcional (usado se disponível no JWT).
 */
export const logHeroBannerEvent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: { bannerId: string; eventType: "impression" | "click"; ctaKind?: string | null }) =>
      input,
  )
  .handler(async ({ data, context }) => {
    if (!data?.bannerId || !VALID_TYPES.has(data.eventType)) {
      throw new Error("Parâmetros inválidos");
    }
    const email = String(context?.claims?.email || "") || null;
    await (supabaseAdmin as any).from("hero_banner_events").insert({
      banner_id: data.bannerId,
      event_type: data.eventType,
      cta_kind: data.ctaKind || null,
      email,
    });
    return { success: true };
  });

/**
 * Retorna métricas (impressões, cliques, CTR%) por banner numa janela de tempo.
 */
export const getHeroBannerMetrics = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { days?: number }) => input || {})
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const days = Math.max(1, Math.min(365, Number(data?.days) || 30));
    const { data: result, error } = await (supabaseAdmin as any).rpc(
      "get_hero_banner_metrics",
      { p_days: days },
    );
    if (error) throw new Error(error.message);
    return { metrics: (result as any[]) || [] };
  });
