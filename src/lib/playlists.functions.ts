import { createServerFn } from '@tanstack/react-start';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { supabaseAdmin } from '@/integrations/supabase/client.server';

export const listPlaylists = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { areaId?: string }) => input)
  .handler(async ({ data: inputData }) => {
    let query = supabaseAdmin
      .from('playlists')
      .select('*')
      .eq('is_active', true);

    if (inputData?.areaId) {
      query = query.eq('area_id', inputData.areaId);
    }

    const { data: playlists, error } = await query
      .order('sort_order', { ascending: true });

    if (error) throw new Error(error.message);
    return { playlists: playlists || [] };
  });

export const getPlaylistWithTracks = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { playlistId: string }) => input)
  .handler(async ({ data }) => {
    const { data: playlist, error: plErr } = await supabaseAdmin
      .from('playlists')
      .select('*')
      .eq('id', data.playlistId)
      .eq('is_active', true)
      .maybeSingle();

    if (plErr) throw new Error(plErr.message);
    if (!playlist) return { playlist: null, tracks: [] };

    const { data: ptRows, error: ptErr } = await supabaseAdmin
      .from('playlist_tracks')
      .select('track_id, sort_order')
      .eq('playlist_id', data.playlistId)
      .order('sort_order', { ascending: true });

    if (ptErr) throw new Error(ptErr.message);
    if (!ptRows || ptRows.length === 0) return { playlist, tracks: [] };

    const trackIds = ptRows.map((r: any) => r.track_id);
    const { data: tracks, error: tErr } = await supabaseAdmin
      .from('tracks')
      .select('*')
      .in('id', trackIds)
      .eq('is_active', true);

    if (tErr) throw new Error(tErr.message);

    // Sort tracks by playlist order
    const orderMap = new Map(ptRows.map((r: any) => [r.track_id, r.sort_order]));
    const sorted = (tracks || []).sort((a: any, b: any) =>
      (orderMap.get(a.id) ?? 0) - (orderMap.get(b.id) ?? 0)
    );

    return { playlist, tracks: sorted };
  });

/** List all playlists with track counts (for display) */
export const listPlaylistsWithCounts = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { areaId?: string }) => input)
  .handler(async ({ data: inputData }) => {
    let query = supabaseAdmin
      .from('playlists')
      .select('*')
      .eq('is_active', true);

    if (inputData?.areaId) {
      query = query.eq('area_id', inputData.areaId);
    }

    const { data: playlists, error } = await query
      .order('sort_order', { ascending: true });

    if (error) throw new Error(error.message);
    if (!playlists || playlists.length === 0) return { playlists: [] };

    // Get track counts for each playlist
    const playlistIds = playlists.map((p: any) => p.id);
    const { data: ptRows } = await supabaseAdmin
      .from('playlist_tracks')
      .select('playlist_id, track_id')
      .in('playlist_id', playlistIds);

    const countMap: Record<string, number> = {};
    (ptRows || []).forEach((r: any) => {
      countMap[r.playlist_id] = (countMap[r.playlist_id] || 0) + 1;
    });

    const enriched = playlists.map((p: any) => ({
      ...p,
      track_count: countMap[p.id] || 0,
    }));

    return { playlists: enriched };
  });
