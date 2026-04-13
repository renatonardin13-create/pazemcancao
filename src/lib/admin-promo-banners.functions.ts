import { createServerFn } from '@tanstack/react-start';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { supabaseAdmin } from '@/integrations/supabase/client.server';
import { z } from 'zod';

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

export const listPromoBanners = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await verifyAdmin(context.supabase, context.userId);

    const { data, error } = await supabaseAdmin
      .from('promo_banners')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) throw new Error(error.message);
    return { banners: data ?? [] };
  });

const createSchema = z.object({
  title: z.string().min(1).max(255).trim(),
  image_url: z.string().url(),
  link_url: z.string().url().optional().or(z.literal('')),
  position_after_shelf: z.number().min(0).max(99).optional(),
  sort_order: z.number().min(0).max(999).optional(),
  is_active: z.boolean().optional(),
});

export const createPromoBanner = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { title: string; image_url: string; link_url?: string; position_after_shelf?: number; sort_order?: number; is_active?: boolean }) =>
    createSchema.parse(input)
  )
  .handler(async ({ data, context }) => {
    await verifyAdmin(context.supabase, context.userId);

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

const updateSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(255).trim().optional(),
  image_url: z.string().url().optional(),
  link_url: z.string().optional(),
  position_after_shelf: z.number().min(0).max(99).optional(),
  sort_order: z.number().min(0).max(999).optional(),
  is_active: z.boolean().optional(),
});

export const updatePromoBanner = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string; title?: string; image_url?: string; link_url?: string; position_after_shelf?: number; sort_order?: number; is_active?: boolean }) =>
    updateSchema.parse(input)
  )
  .handler(async ({ data, context }) => {
    await verifyAdmin(context.supabase, context.userId);

    const { id, ...updates } = data;
    const { error } = await supabaseAdmin
      .from('promo_banners')
      .update(updates)
      .eq('id', id);

    if (error) throw new Error(error.message);
    return { success: true };
  });

export const deletePromoBanner = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await verifyAdmin(context.supabase, context.userId);

    const { error } = await supabaseAdmin
      .from('promo_banners')
      .delete()
      .eq('id', data.id);

    if (error) throw new Error(error.message);
    return { success: true };
  });
