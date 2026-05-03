import { createServerFn } from '@tanstack/react-start';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { supabaseAdmin } from '@/integrations/supabase/client.server';

export const logPlay = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { trackId: string, durationSeconds: number }) => input)
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
    const { data: role } = await context.supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', context.userId)
      .eq('role', 'admin')
      .maybeSingle();
    const { data: userData } = await context.supabase.auth.getUser();
    const isAdminEmail = userData?.user?.email?.toLowerCase() === 'renatonardin13@gmail.com';
    if (!role && !isAdminEmail) throw new Error('Não autorizado');

    const days = data?.days || 30;

    const { data: result, error } = await supabaseAdmin.rpc('get_analytics_summary', {
      p_days: days,
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
