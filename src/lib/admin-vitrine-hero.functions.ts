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

const DISPLAY_MODES = ["fill", "contain", "cover", "auto"] as const;
const RATIOS = ["auto", "21/9", "16/9", "3/1", "2/1"] as const;
type DisplayMode = (typeof DISPLAY_MODES)[number];
type Ratio = (typeof RATIOS)[number];

const isMode = (v: any): v is DisplayMode => DISPLAY_MODES.includes(v);
const isRatio = (v: any): v is Ratio => RATIOS.includes(v);

/**
 * Resumo da vitrine: cursos publicados, prateleiras ativas,
 * status do banner principal global e snapshot do banner ativo.
 */
export const getVitrineAdminOverview = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);

    const [coursesRes, shelvesRes, settingsRes, bannersRes] = await Promise.all([
      supabaseAdmin.from("courses").select("id, status"),
      supabaseAdmin.from("shelves").select("id, is_active"),
      supabaseAdmin
        .from("platform_settings")
        .select("value")
        .eq("key", "hero_global")
        .maybeSingle(),
      (supabaseAdmin as any)
        .from("vitrine_hero_banners")
        .select("*")
        .order("sort_order", { ascending: true }),
    ]);

    if (coursesRes.error) throw new Error(coursesRes.error.message);
    if (shelvesRes.error) throw new Error(shelvesRes.error.message);
    if (bannersRes.error) throw new Error(bannersRes.error.message);

    const coursesPublished = (coursesRes.data || []).filter((c: any) => c.status === "published").length;
    const shelvesActive = (shelvesRes.data || []).filter((s: any) => s.is_active).length;
    const heroGlobal = (settingsRes.data?.value as any) || {
      enabled: true,
      default_display_mode: "auto",
      default_container_ratio: "auto",
    };
    const banners = bannersRes.data || [];
    const primaryBanner =
      banners.find((b: any) => b.is_active) || banners[0] || null;

    return {
      coursesPublished,
      shelvesActive,
      heroGlobal,
      banners,
      primaryBanner,
    };
  });

/**
 * Atualiza as configurações globais do banner principal (hero).
 * Salvas em platform_settings.hero_global.
 */
export const updateHeroGlobal = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: {
      enabled?: boolean;
      default_display_mode?: string;
      default_container_ratio?: string;
    }) => input,
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);

    const { data: current } = await supabaseAdmin
      .from("platform_settings")
      .select("value")
      .eq("key", "hero_global")
      .maybeSingle();
    const prev = (current?.value as any) || {};

    const next = {
      enabled: data.enabled ?? prev.enabled ?? true,
      default_display_mode: isMode(data.default_display_mode)
        ? data.default_display_mode
        : prev.default_display_mode || "auto",
      default_container_ratio: isRatio(data.default_container_ratio)
        ? data.default_container_ratio
        : prev.default_container_ratio || "auto",
    };

    const { error } = await supabaseAdmin
      .from("platform_settings")
      .upsert(
        { key: "hero_global", value: next as any, updated_at: new Date().toISOString() },
        { onConflict: "key" },
      );
    if (error) throw new Error(error.message);
    return { success: true, value: next };
  });

/**
 * Atualiza apenas as configurações visuais de um banner (modo, proporção e dimensões).
 * Usado pelo autosave do painel /vitrine.
 */
export const updateHeroBannerVisual = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: {
      id: string;
      display_mode?: string;
      container_ratio?: string;
      image_url?: string;
      image_width?: number | null;
      image_height?: number | null;
    }) => input,
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    if (!data.id) throw new Error("ID obrigatório.");

    const payload: Record<string, any> = {};
    if (data.display_mode !== undefined)
      payload.display_mode = isMode(data.display_mode) ? data.display_mode : "auto";
    if (data.container_ratio !== undefined)
      payload.container_ratio = isRatio(data.container_ratio) ? data.container_ratio : "auto";
    if (data.image_url !== undefined) payload.image_url = data.image_url;
    if (data.image_width !== undefined) payload.image_width = data.image_width ?? null;
    if (data.image_height !== undefined) payload.image_height = data.image_height ?? null;

    if (Object.keys(payload).length === 0) return { success: true };

    const { error } = await (supabaseAdmin as any)
      .from("vitrine_hero_banners")
      .update(payload)
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { success: true };
  });
