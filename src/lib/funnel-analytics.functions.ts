import { createServerFn } from '@tanstack/react-start';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { supabaseAdmin } from '@/integrations/supabase/client.server';

export const logFunnelClick = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: {
    itemId: string;
    itemType: string;
    context?: string;
    shelfTitle?: string;
    isLocked: boolean;
  }) => input)
  .handler(async ({ data, context }) => {
    const { data: userData } = await context.supabase.auth.getUser();
    const email = userData?.user?.email;
    if (!email) return { success: false };

    await supabaseAdmin.from('funnel_click_logs').insert({
      email,
      item_id: data.itemId,
      item_type: data.itemType,
      funnel_context: data.context || null,
      shelf_title: data.shelfTitle || null,
      is_locked: data.isLocked,
    });

    return { success: true };
  });

export const getFunnelAnalytics = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { days?: number }) => input)
  .handler(async ({ data, context }) => {
    // Verify admin
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
    const since = new Date(Date.now() - days * 86400000).toISOString();

    const { data: clicks } = await supabaseAdmin
      .from('funnel_click_logs')
      .select('*')
      .gte('clicked_at', since)
      .order('clicked_at', { ascending: false })
      .limit(500);

    const allClicks = clicks || [];
    const totalClicks = allClicks.length;
    const lockedClicks = allClicks.filter(c => c.is_locked).length;
    const unlockedClicks = totalClicks - lockedClicks;

    // Group by item
    const byItem: Record<string, { id: string; type: string; title: string; clicks: number; locked: number }> = {};
    for (const c of allClicks) {
      const key = `${c.item_type}-${c.item_id}`;
      if (!byItem[key]) byItem[key] = { id: c.item_id, type: c.item_type, title: '', clicks: 0, locked: 0 };
      byItem[key].clicks++;
      if (c.is_locked) byItem[key].locked++;
    }

    // Group by context
    const byContext: Record<string, { total: number; locked: number }> = {};
    for (const c of allClicks) {
      const ctx = c.funnel_context || 'unknown';
      if (!byContext[ctx]) byContext[ctx] = { total: 0, locked: 0 };
      byContext[ctx].total++;
      if (c.is_locked) byContext[ctx].locked++;
    }

    return {
      totalClicks,
      lockedClicks,
      unlockedClicks,
      conversionRate: totalClicks > 0 ? Math.round((lockedClicks / totalClicks) * 100) : 0,
      topItems: Object.values(byItem).sort((a, b) => b.clicks - a.clicks).slice(0, 10),
      byContext,
    };
  });
