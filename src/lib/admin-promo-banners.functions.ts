import { createServerFn } from '@tanstack/react-start';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { supabaseAdmin } from '@/integrations/supabase/client.server';

async function verifyAdmin(supabase: any, userId: string) {
  const { data: adminRole } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .eq('role', 'admin')
    .maybeSingle();

  const { data: userData } = await supabase.auth.getUser();
  const isAdminEmail = userData?.user?.email?.toLowerCase() === 'renatonardin13@gmail.com';

  if (!adminRole && !isAdminEmail) {
    throw new Error('Acesso negado: apenas administradores');
  }
}

export const listPromoBanners = createServerFn({ method: 'GET' })
  .handler(async () => {
    const { supabase, userId } = await requireSupabaseAuth();
    await verifyAdmin(supabase, userId);

    const { data, error } = await supabaseAdmin
      .from('promo_banners')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) throw new Error(error.message);
    return { banners: data ?? [] };
  });

export const createPromoBanner = createServerFn({ method: 'POST' })
  .inputValidator((input: { data: { title: string; image_url: string; link_url?: string; position_after_shelf?: number; sort_order?: number; is_active?: boolean } }) => input)
  .handler(async ({ data: { data } }) => {
    const { supabase, userId } = await requireSupabaseAuth();
    await verifyAdmin(supabase, userId);

    const { error } = await supabaseAdmin
      .from('promo_banners')
      .insert({
        title: data.title,
        image_url: data.image_url,
        link_url: data.link_url || null,
        position_after_shelf: data.position_after_shelf ?? 1,
        sort_order: data.sort_order ?? 0,
        is_active: data.is_active ?? true,
      });

    if (error) throw new Error(error.message);
    return { success: true };
  });

export const updatePromoBanner = createServerFn({ method: 'POST' })
  .inputValidator((input: { data: { id: string; title?: string; image_url?: string; link_url?: string; position_after_shelf?: number; sort_order?: number; is_active?: boolean } }) => input)
  .handler(async ({ data: { data } }) => {
    const { supabase, userId } = await requireSupabaseAuth();
    await verifyAdmin(supabase, userId);

    const { id, ...updates } = data;
    const { error } = await supabaseAdmin
      .from('promo_banners')
      .update(updates)
      .eq('id', id);

    if (error) throw new Error(error.message);
    return { success: true };
  });

export const deletePromoBanner = createServerFn({ method: 'POST' })
  .inputValidator((input: { data: { id: string } }) => input)
  .handler(async ({ data: { data } }) => {
    const { supabase, userId } = await requireSupabaseAuth();
    await verifyAdmin(supabase, userId);

    const { error } = await supabaseAdmin
      .from('promo_banners')
      .delete()
      .eq('id', data.id);

    if (error) throw new Error(error.message);
    return { success: true };
  });
