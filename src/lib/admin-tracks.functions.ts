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

export const listAdminTracks = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await verifyAdmin(context.supabase, context.userId);

    const { data: tracks, error } = await supabaseAdmin
      .from('tracks')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) throw new Error(error.message);
    return { tracks: tracks || [] };
  });

export const createTrack = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: {
    title: string;
    category: string;
    duration: string;
    storage_path: string;
    cover_url?: string;
    download_url?: string;
    description?: string;
  }) => input)
  .handler(async ({ data, context }) => {
    await verifyAdmin(context.supabase, context.userId);

    const { data: maxOrder } = await supabaseAdmin
      .from('tracks')
      .select('sort_order')
      .order('sort_order', { ascending: false })
      .limit(1)
      .single();

    const { data: track, error } = await supabaseAdmin
      .from('tracks')
      .insert({
        title: data.title,
        category: data.category,
        duration: data.duration,
        storage_path: data.storage_path,
        cover_url: data.cover_url || null,
        download_url: data.download_url || null,
        description: data.description || null,
        sort_order: (maxOrder?.sort_order ?? 0) + 1,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return { track };
  });

export const updateTrack = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: {
    id: string;
    title?: string;
    category?: string;
    duration?: string;
    storage_path?: string;
    cover_url?: string;
    download_url?: string;
    description?: string;
    is_active?: boolean;
  }) => input)
  .handler(async ({ data, context }) => {
    await verifyAdmin(context.supabase, context.userId);

    const { id, ...updates } = data;
    const { error } = await supabaseAdmin
      .from('tracks')
      .update(updates)
      .eq('id', id);

    if (error) throw new Error(error.message);
    return { success: true };
  });

export const deleteTrack = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data, context }) => {
    await verifyAdmin(context.supabase, context.userId);

    const { error } = await supabaseAdmin
      .from('tracks')
      .delete()
      .eq('id', data.id);

    if (error) throw new Error(error.message);
    return { success: true };
  });
