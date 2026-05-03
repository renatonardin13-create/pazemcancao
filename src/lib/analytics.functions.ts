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
  .inputValidator((input: { trackId: string; durationSeconds: number; areaId?: string }) => input)
  .handler(async ({ data, context }) => {
    const { data: userData } = await context.supabase.auth.getUser();
    const email = userData?.user?.email;
    if (!email) throw new Error('Usuário sem email');

    await supabaseAdmin.from('play_logs').insert({
      email,
      track_id: data.trackId,
      duration_seconds: data.durationSeconds,
      area_id: data.areaId,
    });
    return { success: true };
  });

export const logDownload = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { trackId: string; areaId?: string }) => input)
  .handler(async ({ data, context }) => {
    const { data: userData } = await context.supabase.auth.getUser();
    const email = userData?.user?.email;
    if (!email) throw new Error('Usuário sem email');

    await supabaseAdmin.from('download_logs').insert({
      email,
      track_id: data.trackId,
      area_id: data.areaId,
    });
    return { success: true };
  });

export const getDashboardAnalytics = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { days?: number; areaId?: string }) => input)
  .handler(async ({ data, context }) => {
    await verifyAdmin(context.supabase, context.userId);

    const days = data?.days || 30;
    const areaId = data?.areaId || null;

    // Use the database function for efficient aggregation
    const { data: result, error } = await supabaseAdmin.rpc('get_analytics_summary', {
      p_days: days,
      p_area_id: areaId,
    });

    if (error) {
      console.error('Analytics query error:', error);
      throw new Error('Erro ao carregar analytics');
    }

    return result || {
      topPlayed: [],
      topDownloaded: [],
      recentDownloads: [],
      userActivity: [],
      dailyPlayData: [],
      totalPlays: 0,
      totalDownloads: 0,
    };
  });
