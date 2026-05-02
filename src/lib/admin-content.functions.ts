import { createServerFn } from '@tanstack/react-start';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { supabaseAdmin } from '@/integrations/supabase/client.server';

async function verifyAdmin(supabase: any, userId: string) {
  const { data: role } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .eq('role', 'admin')
    .maybeSingle();

  const { data: userData } = await supabase.auth.getUser();
  const isAdminEmail = userData?.user?.email?.toLowerCase() === 'renatonardin13@gmail.com';
  if (!role && !isAdminEmail) throw new Error('Não autorizado');
}

export const listAdminContentItems = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { areaId?: string } | void) => input)
  .handler(async ({ data, context }) => {
    await verifyAdmin(context.supabase, context.userId);

    let query = supabaseAdmin
      .from('content_items')
      .select('*')
      .order('sort_order', { ascending: true });

    if (data?.areaId) {
      query = query.eq('area_id', data.areaId);
    } else {
      return { items: [] };
    }

    const { data: items, error } = await query;

    if (error) throw new Error(error.message);
    return { items: items || [] };
  });

export const createContentItem = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: {
    title: string;
    description?: string;
    content_type: string;
    area_id?: string;
    cover_url?: string;
    file_url?: string;
    video_url?: string;
    sales_page_url?: string;
    is_free?: boolean;
    release_days?: number | null;
    access_mode?: string;
    display_category?: string;
    badge_text?: string;
    show_as_card?: boolean;
    card_cover_url?: string;
    sort_order?: number;
    journey_group?: string;
    journey_order?: number;
    unlock_rule_type?: string;
    unlock_rule_content_id?: string | null;
    is_featured?: boolean;
    featured_priority?: number;
    release_mode?: string;
    initial_free_count?: number;
    locked_final_count?: number;
    locked_label?: string | null;
    launch_mode?: string;
  }) => input)
  .handler(async ({ data, context }) => {
    await verifyAdmin(context.supabase, context.userId);

    if (!data.area_id) {
      throw new Error('O campo área de membros é obrigatório.');
    }

    const { data: maxOrder } = await supabaseAdmin
      .from('content_items')
      .select('sort_order')
      .order('sort_order', { ascending: false })
      .limit(1)
      .single();

    const accessMode = data.access_mode || (data.is_free ? 'gratuito' : (data.release_days && data.release_days > 0 ? 'liberar_em_dias' : 'pago'));

    const { data: item, error } = await supabaseAdmin
      .from('content_items')
      .insert({
        title: data.title,
        description: data.description || null,
        content_type: data.content_type,
        area_id: data.area_id || null,
        cover_url: data.cover_url || null,
        file_url: data.file_url || null,
        video_url: data.video_url || null,
        sales_page_url: data.sales_page_url || null,
        is_free: data.is_free || false,
        release_days: data.release_days ?? null,
        access_mode: accessMode,
        display_category: data.display_category || null,
        badge_text: data.badge_text || null,
        show_as_card: data.show_as_card ?? true,
        card_cover_url: data.card_cover_url || null,
        is_active: true,
        sort_order: data.sort_order ?? ((maxOrder?.sort_order ?? 0) + 1),
        journey_group: data.journey_group || null,
        journey_order: data.journey_order ?? 0,
        unlock_rule_type: data.unlock_rule_type || 'none',
        unlock_rule_content_id: data.unlock_rule_content_id || null,
        is_featured: data.is_featured ?? false,
        featured_priority: data.featured_priority ?? 0,
        release_mode: data.release_mode || 'liberar_tudo',
        initial_free_count: data.initial_free_count ?? 0,
        locked_final_count: data.locked_final_count ?? 0,
        locked_label: data.locked_label || null,
        launch_mode: data.launch_mode || 'none',
      } as any)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return { item };
  });

export const updateContentItem = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: {
    id: string;
    title?: string;
    description?: string;
    content_type?: string;
    area_id?: string;
    cover_url?: string;
    file_url?: string;
    video_url?: string;
    sales_page_url?: string;
    is_free?: boolean;
    is_active?: boolean;
    release_days?: number | null;
    access_mode?: string;
    display_category?: string;
    badge_text?: string;
    show_as_card?: boolean;
    card_cover_url?: string;
    sort_order?: number;
    journey_group?: string;
    journey_order?: number;
    unlock_rule_type?: string;
    unlock_rule_content_id?: string | null;
    is_featured?: boolean;
    featured_priority?: number;
    release_mode?: string;
    initial_free_count?: number;
    locked_final_count?: number;
    locked_label?: string | null;
    launch_mode?: string;
  }) => input)
  .handler(async ({ data, context }) => {
    await verifyAdmin(context.supabase, context.userId);

    if ('area_id' in data && !data.area_id) {
      throw new Error('O campo área de membros é obrigatório.');
    }

    const { id, ...updates } = data;
    const { error } = await supabaseAdmin
      .from('content_items')
      .update(updates as any)
      .eq('id', id);

    if (error) throw new Error(error.message);
    return { success: true };
  });

export const deleteContentItem = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data, context }) => {
    await verifyAdmin(context.supabase, context.userId);

    const { error } = await supabaseAdmin
      .from('content_items')
      .delete()
      .eq('id', data.id);

    if (error) throw new Error(error.message);
    return { success: true };
  });