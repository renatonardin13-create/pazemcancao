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
  .handler(async ({ context }) => {
    await verifyAdmin(context.supabase, context.userId);

    const { data, error } = await supabaseAdmin
      .from('content_items')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) throw new Error(error.message);
    return { items: data || [] };
  });

interface ContentPayload {
  title: string;
  description?: string;
  content_type: string;
  cover_url?: string;
  file_url?: string;
  video_url?: string;
  sales_page_url?: string;
  is_free?: boolean;
  release_days?: number | null;
  display_category?: string | null;
  access_mode?: string;
  show_as_card?: boolean;
  badge_text?: string | null;
  card_cover_url?: string | null;
}

export const createContentItem = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: ContentPayload) => input)
  .handler(async ({ data, context }) => {
    await verifyAdmin(context.supabase, context.userId);

    const { data: maxOrder } = await supabaseAdmin
      .from('content_items')
      .select('sort_order')
      .order('sort_order', { ascending: false })
      .limit(1)
      .single();

    // Sync is_free and release_days from access_mode
    const accessMode = data.access_mode || 'pago';
    const isFree = accessMode === 'gratuito';
    const releaseDays = accessMode === 'liberar_em_dias' ? (data.release_days ?? null) : null;

    const { data: item, error } = await supabaseAdmin
      .from('content_items')
      .insert({
        title: data.title,
        description: data.description || null,
        content_type: data.content_type,
        cover_url: data.cover_url || null,
        file_url: data.file_url || null,
        video_url: data.video_url || null,
        sales_page_url: data.sales_page_url || null,
        is_free: isFree,
        release_days: releaseDays,
        access_mode: accessMode,
        display_category: data.display_category || null,
        show_as_card: data.show_as_card !== false,
        badge_text: data.badge_text || null,
        card_cover_url: data.card_cover_url || null,
        is_active: true,
        sort_order: (maxOrder?.sort_order ?? 0) + 1,
      } as any)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return { item };
  });

interface ContentUpdatePayload {
  id: string;
  title?: string;
  description?: string;
  content_type?: string;
  cover_url?: string;
  file_url?: string;
  video_url?: string;
  sales_page_url?: string;
  is_free?: boolean;
  is_active?: boolean;
  release_days?: number | null;
  display_category?: string | null;
  access_mode?: string;
  show_as_card?: boolean;
  badge_text?: string | null;
  card_cover_url?: string | null;
  sort_order?: number;
}

export const updateContentItem = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: ContentUpdatePayload) => input)
  .handler(async ({ data, context }) => {
    await verifyAdmin(context.supabase, context.userId);

    const { id, ...updates } = data;

    // Sync is_free and release_days if access_mode is provided
    if (updates.access_mode) {
      updates.is_free = updates.access_mode === 'gratuito';
      if (updates.access_mode !== 'liberar_em_dias') {
        updates.release_days = null;
      }
    }

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
