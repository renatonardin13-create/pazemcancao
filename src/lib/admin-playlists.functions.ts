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

export const listAdminPlaylists = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await verifyAdmin(context.supabase, context.userId);

    const { data: playlists, error } = await supabaseAdmin
      .from('playlists')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) throw new Error(error.message);

    // Get track counts
    const ids = (playlists || []).map((p: any) => p.id);
    const { data: ptRows } = ids.length > 0
      ? await supabaseAdmin.from('playlist_tracks').select('playlist_id').in('playlist_id', ids)
      : { data: [] };

    const countMap: Record<string, number> = {};
    (ptRows || []).forEach((r: any) => {
      countMap[r.playlist_id] = (countMap[r.playlist_id] || 0) + 1;
    });

    return {
      playlists: (playlists || []).map((p: any) => ({
        ...p,
        track_count: countMap[p.id] || 0,
      })),
    };
  });

export const createPlaylist = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: {
    name: string;
    description?: string;
    cover_url?: string;
  }) => input)
  .handler(async ({ data, context }) => {
    await verifyAdmin(context.supabase, context.userId);

    const { data: maxOrder } = await supabaseAdmin
      .from('playlists')
      .select('sort_order')
      .order('sort_order', { ascending: false })
      .limit(1)
      .maybeSingle();

    const { data: playlist, error } = await supabaseAdmin
      .from('playlists')
      .insert({
        name: data.name,
        description: data.description || null,
        cover_url: data.cover_url || null,
        sort_order: (maxOrder?.sort_order ?? 0) + 1,
        is_active: true,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return { playlist };
  });

export const updatePlaylist = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: {
    id: string;
    name?: string;
    description?: string;
    cover_url?: string;
    is_active?: boolean;
    sort_order?: number;
  }) => input)
  .handler(async ({ data, context }) => {
    await verifyAdmin(context.supabase, context.userId);

    const { id, ...updates } = data;
    if ('cover_url' in updates && updates.cover_url === '') {
      (updates as any).cover_url = null;
    }
    if ('description' in updates && updates.description === '') {
      (updates as any).description = null;
    }

    const { error } = await supabaseAdmin
      .from('playlists')
      .update(updates)
      .eq('id', id);

    if (error) throw new Error(error.message);
    return { success: true };
  });

export const deletePlaylist = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data, context }) => {
    await verifyAdmin(context.supabase, context.userId);

    const { error } = await supabaseAdmin
      .from('playlists')
      .delete()
      .eq('id', data.id);

    if (error) throw new Error(error.message);
    return { success: true };
  });

/** Get tracks for a specific playlist */
export const listPlaylistTracks = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { playlistId: string }) => input)
  .handler(async ({ data, context }) => {
    await verifyAdmin(context.supabase, context.userId);

    const { data: ptRows, error: ptErr } = await supabaseAdmin
      .from('playlist_tracks')
      .select('id, track_id, sort_order')
      .eq('playlist_id', data.playlistId)
      .order('sort_order', { ascending: true });

    if (ptErr) throw new Error(ptErr.message);
    if (!ptRows || ptRows.length === 0) return { tracks: [] };

    const trackIds = ptRows.map((r: any) => r.track_id);
    const { data: tracks, error: tErr } = await supabaseAdmin
      .from('tracks')
      .select('id, title, category, duration, cover_url, is_active')
      .in('id', trackIds);

    if (tErr) throw new Error(tErr.message);

    const orderMap = new Map(ptRows.map((r: any) => [r.track_id, { sort_order: r.sort_order, pt_id: r.id }]));
    const sorted = (tracks || [])
      .map((t: any) => ({ ...t, pt_id: orderMap.get(t.id)?.pt_id, sort_order: orderMap.get(t.id)?.sort_order ?? 0 }))
      .sort((a: any, b: any) => a.sort_order - b.sort_order);

    return { tracks: sorted };
  });

/** Add track to playlist */
export const addTrackToPlaylist = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { playlistId: string; trackId: string }) => input)
  .handler(async ({ data, context }) => {
    await verifyAdmin(context.supabase, context.userId);

    const { data: maxOrder } = await supabaseAdmin
      .from('playlist_tracks')
      .select('sort_order')
      .eq('playlist_id', data.playlistId)
      .order('sort_order', { ascending: false })
      .limit(1)
      .maybeSingle();

    const { error } = await supabaseAdmin
      .from('playlist_tracks')
      .insert({
        playlist_id: data.playlistId,
        track_id: data.trackId,
        sort_order: (maxOrder?.sort_order ?? 0) + 1,
      });

    if (error) {
      if (error.code === '23505') throw new Error('Música já está na playlist');
      throw new Error(error.message);
    }
    return { success: true };
  });

/** Remove track from playlist */
export const removeTrackFromPlaylist = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { ptId: string }) => input)
  .handler(async ({ data, context }) => {
    await verifyAdmin(context.supabase, context.userId);

    const { error } = await supabaseAdmin
      .from('playlist_tracks')
      .delete()
      .eq('id', data.ptId);

    if (error) throw new Error(error.message);
    return { success: true };
  });

/** Reorder tracks in playlist */
export const reorderPlaylistTracks = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { playlistId: string; trackIds: string[] }) => input)
  .handler(async ({ data, context }) => {
    await verifyAdmin(context.supabase, context.userId);

    for (let i = 0; i < data.trackIds.length; i++) {
      await supabaseAdmin
        .from('playlist_tracks')
        .update({ sort_order: i })
        .eq('playlist_id', data.playlistId)
        .eq('track_id', data.trackIds[i]);
    }

    return { success: true };
  });

/** List all tracks for the "add track" picker */
export const listAllTracksForPicker = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await verifyAdmin(context.supabase, context.userId);

    const { data: tracks, error } = await supabaseAdmin
      .from('tracks')
      .select('id, title, category, duration, cover_url, is_active')
      .order('sort_order', { ascending: true });

    if (error) throw new Error(error.message);
    return { tracks: tracks || [] };
  });
