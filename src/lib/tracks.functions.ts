import { createServerFn } from '@tanstack/react-start';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { supabaseAdmin } from '@/integrations/supabase/client.server';

export const listActiveTracks = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { areaId?: string }) => input)
  .handler(async ({ data: inputData, context }) => {
    let query = context.supabase
      .from('tracks')
      .select('*')
      .eq('is_active', true);

    if (inputData?.areaId) {
      query = query.eq('area_id', inputData.areaId);
    }

    const { data: tracks, error } = await query.order('sort_order', { ascending: true });

    if (error) throw new Error(error.message);
    return { tracks: tracks || [] };
});

/** Returns ALL tracks regardless of is_active — used for the full catalog view */
export const listAllTracks = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { areaId?: string }) => input)
  .handler(async ({ data: inputData, context }) => {
    let query = context.supabase
      .from('tracks')
      .select('*');

    if (inputData?.areaId) {
      query = query.eq('area_id', inputData.areaId);
    }

    const { data: tracks, error } = await query.order('sort_order', { ascending: true });

    if (error) throw new Error(error.message);
    return { tracks: tracks || [] };
});

export const listCategories = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { areaId?: string }) => input)
  .handler(async ({ data: inputData, context }) => {
    let query = context.supabase
      .from('categories')
      .select('id, name, slug, icon, sort_order');

    if (inputData?.areaId) {
      query = query.eq('area_id', inputData.areaId);
    }

    const { data: categories, error } = await query.order('sort_order', { ascending: true });

    if (error) throw new Error(error.message);
    return { categories: categories || [] };
  });

export const getTrackById = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data, context }) => {
    // Não filtrar por is_active — a biblioteca (/musicas) usa listAllTracks
    // e exibe faixas mesmo inativas (com badge "Em breve"). A página de
    // detalhe deve permanecer consistente com a lista.
    const { data: track, error } = await context.supabase
      .from('tracks')
      .select('*')
      .eq('id', data.id)
      .maybeSingle();

    if (error) throw new Error(error.message);
    return { track };
  });
