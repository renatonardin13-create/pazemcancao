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

const CTA_TYPES = ["url", "product", "video"] as const;
type CtaType = (typeof CTA_TYPES)[number];
const isCtaType = (v: any): v is CtaType => CTA_TYPES.includes(v);

function sanitizeBannerInput(raw: any) {
  return {
    title: raw.title?.trim() || null,
    subtitle: raw.subtitle?.trim() || null,
    description: raw.description?.trim() || null,
    image_url: String(raw.image_url || "").trim(),
    image_tablet_url: raw.image_tablet_url?.trim() || null,
    image_mobile_url: raw.image_mobile_url?.trim() || null,
    primary_cta_label: raw.primary_cta_label?.trim() || null,
    primary_cta_type: isCtaType(raw.primary_cta_type) ? raw.primary_cta_type : "url",
    primary_cta_target: raw.primary_cta_target?.trim() || null,
    primary_cta_url: raw.primary_cta_url?.trim() || null,
    secondary_cta_label: raw.secondary_cta_label?.trim() || null,
    secondary_cta_type: isCtaType(raw.secondary_cta_type) ? raw.secondary_cta_type : "url",
    secondary_cta_target: raw.secondary_cta_target?.trim() || null,
    secondary_cta_url: raw.secondary_cta_url?.trim() || null,
    banner_clickable: !!raw.banner_clickable,
    banner_click_type: isCtaType(raw.banner_click_type) ? raw.banner_click_type : null,
    banner_click_target: raw.banner_click_target?.trim() || null,
    autoplay: raw.autoplay !== false,
    autoplay_interval_ms: Math.max(2000, Math.min(60000, Number(raw.autoplay_interval_ms) || 7000)),
    is_active: raw.is_active !== false,
    sort_order: Number(raw.sort_order) || 0,
    schedule_start_at: raw.schedule_start_at ? new Date(raw.schedule_start_at).toISOString() : null,
    schedule_end_at: raw.schedule_end_at ? new Date(raw.schedule_end_at).toISOString() : null,
  };
}

export const listHeroBanners = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { areaId?: string } | void) => input)
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    let query = (supabaseAdmin as any)
      .from("vitrine_hero_banners")
      .select("*")
      .order("sort_order", { ascending: true });

    if (data?.areaId) {
      query = query.eq("area_id", data.areaId);
    } else {
      return { banners: [] };
    }

    const { data: banners, error } = await query;
    if (error) throw new Error(error.message);
    return { banners: banners || [] };
  });

export const createHeroBanner = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: any) => input)
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const payload = sanitizeBannerInput(data);
    if (!payload.image_url) throw new Error("Imagem do banner é obrigatória.");
    const { data: created, error } = await (supabaseAdmin as any)
      .from("vitrine_hero_banners")
      .insert(payload)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return { banner: created };
  });

export const updateHeroBanner = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string } & Record<string, any>) => input)
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { id, ...rest } = data;
    if (!id) throw new Error("ID obrigatório.");
    const payload = sanitizeBannerInput(rest);
    const { error } = await (supabaseAdmin as any)
      .from("vitrine_hero_banners")
      .update(payload)
      .eq("id", id);
    if (error) throw new Error(error.message);
    return { success: true };
  });

export const deleteHeroBanner = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await (supabaseAdmin as any)
      .from("vitrine_hero_banners")
      .delete()
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { success: true };
  });

export const duplicateHeroBanner = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { data: original, error: fetchErr } = await (supabaseAdmin as any)
      .from("vitrine_hero_banners")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();
    if (fetchErr) throw new Error(fetchErr.message);
    if (!original) throw new Error("Banner não encontrado.");
    const { id, created_at, updated_at, ...rest } = original;
    const copy = {
      ...rest,
      title: `${rest.title || "Banner"} (cópia)`,
      sort_order: (rest.sort_order || 0) + 1,
      is_active: false,
    };
    const { data: created, error } = await (supabaseAdmin as any)
      .from("vitrine_hero_banners")
      .insert(copy)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return { banner: created };
  });

export const reorderHeroBanners = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { orderedIds: string[] }) => input)
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    await Promise.all(
      data.orderedIds.map((id, idx) =>
        (supabaseAdmin as any)
          .from("vitrine_hero_banners")
          .update({ sort_order: idx })
          .eq("id", id)
      )
    );
    return { success: true };
  });

export const toggleHeroBannerActive = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string; is_active: boolean }) => input)
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await (supabaseAdmin as any)
      .from("vitrine_hero_banners")
      .update({ is_active: data.is_active })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { success: true };
  });

export const listCoursesForBannerSelector = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { data, error } = await supabaseAdmin
      .from("courses")
      .select("id, title, status")
      .order("title", { ascending: true });
    if (error) throw new Error(error.message);
    return { courses: data || [] };
  });
