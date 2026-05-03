import { createServerFn } from '@tanstack/react-start';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { supabaseAdmin } from '@/integrations/supabase/client.server';

export const listAdminTracks = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .handler(async () => {
    const { data: tracks, error } = await supabaseAdmin
      .from('tracks')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) throw new Error(error.message);
    return { tracks: tracks || [] };
  });

export const createTrack = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: any) => input)
  .handler(async ({ data }) => {
    const { data: track, error } = await supabaseAdmin
      .from('tracks')
      .insert(data)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return { track };
  });

export const updateTrack = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string } & any) => input)
  .handler(async ({ data }) => {
    const { id, ...updates } = data;
    const { data: track, error } = await supabaseAdmin
      .from('tracks')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return { track };
  });

export const deleteTrack = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data }) => {
    const { error } = await supabaseAdmin
      .from('tracks')
      .delete()
      .eq('id', data.id);

    if (error) throw new Error(error.message);
    return { success: true };
  });
