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

export const logPlay = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { trackId: string; durationSeconds: number }) => input)
  .handler(async ({ data, context }) => {
    const { data: userData } = await context.supabase.auth.getUser();
    const email = userData?.user?.email;
    if (!email) throw new Error('Usuário sem email');

    await supabaseAdmin.from('play_logs').insert({
      email,
      track_id: data.trackId,
      duration_seconds: data.durationSeconds,
    });
    return { success: true };
  });

export const logDownload = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { trackId: string }) => input)
  .handler(async ({ data, context }) => {
    const { data: userData } = await context.supabase.auth.getUser();
    const email = userData?.user?.email;
    if (!email) throw new Error('Usuário sem email');

    await supabaseAdmin.from('download_logs').insert({
      email,
      track_id: data.trackId,
    });
    return { success: true };
  });

export const getDashboardAnalytics = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { days?: number }) => input)
  .handler(async ({ data, context }) => {
    await verifyAdmin(context.supabase, context.userId);

    const days = data?.days || 30;
    const sinceDate = new Date();
    sinceDate.setDate(sinceDate.getDate() - days);
    const sinceISO = sinceDate.toISOString();

    // Most played tracks (within period)
    const { data: playLogs } = await supabaseAdmin
      .from('play_logs')
      .select('track_id, email, played_at')
      .gte('played_at', sinceISO)
      .limit(5000);

    const { data: downloadLogs } = await supabaseAdmin
      .from('download_logs')
      .select('track_id, email, downloaded_at')
      .gte('downloaded_at', sinceISO)
      .order('downloaded_at', { ascending: false })
      .limit(5000);

    const { data: tracks } = await supabaseAdmin
      .from('tracks')
      .select('id, title, cover_url');

    const trackMap = new Map<string, { title: string; cover_url: string | null }>();
    (tracks || []).forEach((t: any) => trackMap.set(t.id, { title: t.title, cover_url: t.cover_url }));

    // Count plays per track
    const playCounts = new Map<string, number>();
    (playLogs || []).forEach((l: any) => {
      playCounts.set(l.track_id, (playCounts.get(l.track_id) || 0) + 1);
    });

    const topPlayed = Array.from(playCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([trackId, count]) => ({
        trackId,
        title: trackMap.get(trackId)?.title || 'Desconhecida',
        coverUrl: trackMap.get(trackId)?.cover_url,
        plays: count,
      }));

    // Count downloads per track
    const downloadCounts = new Map<string, number>();
    (downloadLogs || []).forEach((l: any) => {
      downloadCounts.set(l.track_id, (downloadCounts.get(l.track_id) || 0) + 1);
    });

    const topDownloaded = Array.from(downloadCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([trackId, count]) => ({
        trackId,
        title: trackMap.get(trackId)?.title || 'Desconhecida',
        coverUrl: trackMap.get(trackId)?.cover_url,
        downloads: count,
      }));

    // Recent downloads
    const recentDownloads = (downloadLogs || []).slice(0, 20).map((l: any) => ({
      email: l.email,
      trackTitle: trackMap.get(l.track_id)?.title || 'Desconhecida',
      downloadedAt: l.downloaded_at,
    }));

    // User activity
    const userPlays = new Map<string, number>();
    (playLogs || []).forEach((l: any) => {
      userPlays.set(l.email, (userPlays.get(l.email) || 0) + 1);
    });

    const userDownloads = new Map<string, number>();
    (downloadLogs || []).forEach((l: any) => {
      userDownloads.set(l.email, (userDownloads.get(l.email) || 0) + 1);
    });

    const allEmails = new Set([...userPlays.keys(), ...userDownloads.keys()]);
    const userActivity = Array.from(allEmails)
      .map(email => ({
        email,
        plays: userPlays.get(email) || 0,
        downloads: userDownloads.get(email) || 0,
      }))
      .sort((a, b) => (b.plays + b.downloads) - (a.plays + a.downloads))
      .slice(0, 20);

    // Daily play counts (within period)
    const dailyPlays = new Map<string, number>();
    (playLogs || []).forEach((l: any) => {
      const day = l.played_at.split('T')[0];
      dailyPlays.set(day, (dailyPlays.get(day) || 0) + 1);
    });

    const dailyPlayData = Array.from(dailyPlays.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, count]) => ({ date, plays: count }));

    return {
      topPlayed,
      topDownloaded,
      recentDownloads,
      userActivity,
      dailyPlayData,
      totalPlays: playLogs?.length || 0,
      totalDownloads: downloadLogs?.length || 0,
    };
  });
