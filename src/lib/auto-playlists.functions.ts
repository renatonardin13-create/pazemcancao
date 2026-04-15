import { createServerFn } from '@tanstack/react-start';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { supabaseAdmin } from '@/integrations/supabase/client.server';

/** Novidades — last 15 tracks added */
export const getNewTracks = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .handler(async () => {
    const { data, error } = await supabaseAdmin
      .from('tracks')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(15);

    if (error) throw new Error(error.message);
    return { tracks: data || [] };
  });

/** Mais Acessadas — top played tracks (last 30 days) */
export const getMostPlayedTracks = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .handler(async () => {
    const since = new Date(Date.now() - 30 * 86400_000).toISOString();

    const { data: playRows, error: plErr } = await supabaseAdmin
      .from('play_logs')
      .select('track_id')
      .gte('played_at', since);

    if (plErr) throw new Error(plErr.message);
    if (!playRows || playRows.length === 0) return { tracks: [] };

    // Count plays per track
    const countMap: Record<string, number> = {};
    playRows.forEach((r: any) => {
      countMap[r.track_id] = (countMap[r.track_id] || 0) + 1;
    });

    const sorted = Object.entries(countMap)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 15)
      .map(([id]) => id);

    if (sorted.length === 0) return { tracks: [] };

    const { data: tracks, error: tErr } = await supabaseAdmin
      .from('tracks')
      .select('*')
      .in('id', sorted)
      .eq('is_active', true);

    if (tErr) throw new Error(tErr.message);

    // Preserve play-count order
    const orderMap = new Map(sorted.map((id, i) => [id, i]));
    const result = (tracks || []).sort(
      (a: any, b: any) => (orderMap.get(a.id) ?? 99) - (orderMap.get(b.id) ?? 99)
    );

    return { tracks: result };
  });

/** Continue Ouvindo — tracks the user played but didn't finish (last 14 days) */
export const getContinueListening = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: userData } = await context.supabase.auth.getUser();
    const email = userData?.user?.email;
    if (!email) return { tracks: [] };

    const since = new Date(Date.now() - 14 * 86400_000).toISOString();

    // Get user's recent plays
    const { data: plays, error: pErr } = await supabaseAdmin
      .from('play_logs')
      .select('track_id, duration_seconds, played_at')
      .eq('email', email)
      .gte('played_at', since)
      .order('played_at', { ascending: false });

    if (pErr) throw new Error(pErr.message);
    if (!plays || plays.length === 0) return { tracks: [] };

    // Keep only the most recent play per track, filter short plays (< 90% of track)
    const seen = new Set<string>();
    const recentPlays: Array<{ track_id: string; duration_seconds: number }> = [];
    for (const p of plays) {
      if (!seen.has(p.track_id)) {
        seen.add(p.track_id);
        recentPlays.push(p);
      }
    }

    // Get those tracks with their duration
    const trackIds = recentPlays.map((p) => p.track_id);
    if (trackIds.length === 0) return { tracks: [] };

    const { data: tracks, error: tErr } = await supabaseAdmin
      .from('tracks')
      .select('*')
      .in('id', trackIds)
      .eq('is_active', true);

    if (tErr) throw new Error(tErr.message);

    // Filter to tracks where user listened < 80% (approximate by duration string)
    const parseDuration = (dur: string): number => {
      const parts = dur.split(':').map(Number);
      if (parts.length === 2) return parts[0] * 60 + parts[1];
      if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
      return 0;
    };

    const playMap = new Map(recentPlays.map((p) => [p.track_id, p.duration_seconds]));
    const incomplete = (tracks || []).filter((t: any) => {
      const totalSecs = parseDuration(t.duration);
      const listened = playMap.get(t.id) || 0;
      return totalSecs > 0 && listened < totalSecs * 0.8;
    });

    return { tracks: incomplete.slice(0, 10) };
  });

/** Recomendado para você — tracks from categories the user listens to most */
export const getRecommendedTracks = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: userData } = await context.supabase.auth.getUser();
    const email = userData?.user?.email;
    if (!email) return { tracks: [] };

    const since = new Date(Date.now() - 30 * 86400_000).toISOString();

    // Get user's played track IDs
    const { data: plays } = await supabaseAdmin
      .from('play_logs')
      .select('track_id')
      .eq('email', email)
      .gte('played_at', since);

    if (!plays || plays.length === 0) {
      // Fallback: return newest tracks
      const { data: fallback } = await supabaseAdmin
        .from('tracks')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(10);
      return { tracks: fallback || [] };
    }

    const playedIds = new Set(plays.map((p: any) => p.track_id));

    // Get categories of played tracks
    const { data: playedTracks } = await supabaseAdmin
      .from('tracks')
      .select('id, category')
      .in('id', [...playedIds]);

    const catCount: Record<string, number> = {};
    (playedTracks || []).forEach((t: any) => {
      catCount[t.category] = (catCount[t.category] || 0) + 1;
    });

    const topCats = Object.entries(catCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([cat]) => cat);

    if (topCats.length === 0) return { tracks: [] };

    // Get tracks from those categories that user hasn't played
    const { data: recommended } = await supabaseAdmin
      .from('tracks')
      .select('*')
      .eq('is_active', true)
      .in('category', topCats)
      .order('sort_order', { ascending: true })
      .limit(30);

    // Filter out already-played, return up to 12
    const result = (recommended || [])
      .filter((t: any) => !playedIds.has(t.id))
      .slice(0, 12);

    // If not enough, pad with popular from same categories
    if (result.length < 6) {
      const extras = (recommended || [])
        .filter((t: any) => playedIds.has(t.id) && !result.some((r: any) => r.id === t.id))
        .slice(0, 6 - result.length);
      result.push(...extras);
    }

    return { tracks: result };
  });
