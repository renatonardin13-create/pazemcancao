import { createServerFn } from '@tanstack/react-start';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { supabaseAdmin } from '@/integrations/supabase/client.server';

export const listActiveTracks = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .handler(async () => {
    const { data: tracks, error } = await supabaseAdmin
      .from('tracks')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) throw new Error(error.message);
    return { tracks: tracks || [] };
  });

export const getTrackById = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data }) => {
    const { data: track, error } = await supabaseAdmin
      .from('tracks')
      .select('*')
      .eq('id', data.id)
      .eq('is_active', true)
      .maybeSingle();

    if (error) throw new Error(error.message);
    return { track };
  });
