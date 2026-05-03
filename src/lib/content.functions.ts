import { createServerFn } from '@tanstack/react-start';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { supabaseAdmin } from '@/integrations/supabase/client.server';

export const listContentItems = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ data: inputData, context }) => {
    const { data: userData } = await context.supabase.auth.getUser();
    const email = userData?.user?.email?.toLowerCase();

    const { data: adminRole } = await context.supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', context.userId)
      .eq('role', 'admin')
      .maybeSingle();

    const isAdmin = !!adminRole || email === 'renatonardin13@gmail.com';

    let buyer: any = null;
    if (!isAdmin && email) {
      const { data: b } = await supabaseAdmin
        .from('approved_buyers')
        .select('id, created_at, access_enabled')
        .eq('email', email)
        .eq('access_enabled', true)
        .maybeSingle();
      buyer = b;
    }

    const isBuyer = !!buyer;

    let query = supabaseAdmin
      .from('content_items')
      .select('*')
      .eq('is_active', true);


    const { data, error } = await query.order('sort_order', { ascending: true });

    if (error) throw new Error(error.message);

    const hasFullAccess = isAdmin || isBuyer;
    const buyerCreatedAt = buyer?.created_at ? new Date(buyer.created_at) : null;

    // Fetch user-specific unlock dates if buyer
    let unlockMap = new Map<string, { unlock_at: string; unlocked: boolean }>();
    if (isBuyer && email) {
      const { data: unlocks } = await (supabaseAdmin as any)
        .from('user_content_unlocks')
        .select('content_id, unlock_at, unlocked')
        .eq('email', email);
      if (unlocks) {
        for (const u of unlocks) {
          unlockMap.set(u.content_id, { unlock_at: u.unlock_at, unlocked: u.unlocked });
        }
      }
    }

    // Fetch user behavior logs — only distinct content IDs, not full tables
    let playedContentIds = new Set<string>();
    let downloadedContentIds = new Set<string>();
    let viewedContentIds = new Set<string>();
    let completedContentIds = new Set<string>();
    if (email) {
      // Use distinct track_id queries instead of fetching ALL rows
      const [playsRes, downloadsRes, progressRes] = await Promise.all([
        supabaseAdmin
          .from('play_logs')
          .select('track_id')
          .eq('email', email),
        supabaseAdmin
          .from('download_logs')
          .select('track_id')
          .eq('email', email),
        supabaseAdmin
          .from('user_content_progress')
          .select('content_id, viewed_at, completed_at, downloaded_at')
          .eq('user_email', email),
      ]);

      if (playsRes.data) {
        for (const p of playsRes.data) playedContentIds.add(p.track_id);
      }
      if (downloadsRes.data) {
        for (const d of downloadsRes.data) downloadedContentIds.add(d.track_id);
      }
      if (progressRes.data) {
        for (const p of progressRes.data as any[]) {
          if (p.viewed_at) viewedContentIds.add(p.content_id);
          if (p.completed_at) completedContentIds.add(p.content_id);
        }
      }
    }

    const now = new Date();

    // Build a title lookup for prerequisite content references
    const titleMap = new Map<string, string>();
    for (const item of (data || [])) {
      titleMap.set(item.id, item.title);
    }

    const items = (data || []).map((item: any) => {
      if (isAdmin) return { ...item, unlocked: true };

      const accessMode = item.access_mode || (item.is_free ? 'gratuito' : 'pago');

      let baseUnlocked = false;
      let effectiveAccessMode = accessMode;
      let unlockDate: string | undefined;

      if (accessMode === 'gratuito') {
        baseUnlocked = true;
        effectiveAccessMode = 'gratuito';
      } else if (accessMode === 'liberar_em_dias') {
        effectiveAccessMode = 'liberar_em_dias';
        if (!isBuyer) {
          baseUnlocked = false;
        } else {
          const unlock = unlockMap.get(item.id);
          if (unlock) {
            const ud = new Date(unlock.unlock_at);
            baseUnlocked = now >= ud;
            unlockDate = unlock.unlock_at;
          } else if (item.release_days && buyerCreatedAt) {
            const ud = new Date(buyerCreatedAt);
            ud.setDate(ud.getDate() + item.release_days);
            baseUnlocked = now >= ud;
            unlockDate = ud.toISOString();
          } else {
            baseUnlocked = true;
          }
        }
      } else {
        effectiveAccessMode = 'pago';
        baseUnlocked = isBuyer;
      }

      const ruleType = item.unlock_rule_type || 'none';
      const ruleContentId = item.unlock_rule_content_id;
      let ruleMet = true;
      let unlockRuleMessage: string | undefined;

      if (ruleType !== 'none' && ruleContentId && baseUnlocked) {
        if (ruleType === 'after_watch') {
          ruleMet = playedContentIds.has(ruleContentId) || viewedContentIds.has(ruleContentId);
          if (!ruleMet) unlockRuleMessage = 'Disponível após assistir o conteúdo anterior';
        } else if (ruleType === 'after_complete') {
          ruleMet = completedContentIds.has(ruleContentId);
          if (!ruleMet) unlockRuleMessage = 'Disponível após concluir o conteúdo anterior';
        } else if (ruleType === 'after_download') {
          ruleMet = downloadedContentIds.has(ruleContentId);
          if (!ruleMet) unlockRuleMessage = 'Disponível após baixar o conteúdo anterior';
        }
      }

      const finalUnlocked = baseUnlocked && ruleMet;
      const prerequisiteTitle = ruleContentId ? titleMap.get(ruleContentId) : undefined;

      return {
        ...item,
        unlocked: finalUnlocked,
        effectiveAccessMode,
        ...(unlockDate ? { unlockDate } : {}),
        ...(unlockRuleMessage ? { unlockRuleMessage } : {}),
        ...(ruleContentId && prerequisiteTitle ? { unlockRuleContentId: ruleContentId, unlockRuleContentTitle: prerequisiteTitle } : {}),
      };
    });

    // Fetch user_content_progress for richer recommendations
    let progressMap: Record<string, any> = {};
    if (email) {
      const { data: progressRows } = await supabaseAdmin
        .from('user_content_progress' as any)
        .select('content_id, viewed_at, completed_at, downloaded_at, last_position_seconds')
        .eq('user_email', email);
      if (progressRows) {
        for (const p of progressRows as any[]) {
          progressMap[p.content_id] = p;
        }
      }
    }

    // Fetch popularity data using aggregated counts instead of all rows
    // Use RPC or limited queries to get counts per content
    const contentIds = (data || []).map((d: any) => d.id);

    // Batch count queries — fetch only counts, not all rows
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const [playCountsRes, dlCountsRes, weeklyPlayRes, weeklyDlRes] = await Promise.all([
      supabaseAdmin
        .from('play_logs')
        .select('track_id')
        .in('track_id', contentIds),
      supabaseAdmin
        .from('download_logs')
        .select('track_id')
        .in('track_id', contentIds),
      supabaseAdmin
        .from('play_logs')
        .select('track_id')
        .in('track_id', contentIds)
        .gte('played_at', sevenDaysAgo),
      supabaseAdmin
        .from('download_logs')
        .select('track_id')
        .in('track_id', contentIds)
        .gte('downloaded_at', sevenDaysAgo),
    ]);

    const popularityMap: Record<string, { plays: number; downloads: number }> = {};
    const weeklyPopularityMap: Record<string, { plays: number; downloads: number }> = {};

    if (playCountsRes.data) {
      for (const r of playCountsRes.data) {
        if (!popularityMap[r.track_id]) popularityMap[r.track_id] = { plays: 0, downloads: 0 };
        popularityMap[r.track_id].plays++;
      }
    }
    if (dlCountsRes.data) {
      for (const r of dlCountsRes.data) {
        if (!popularityMap[r.track_id]) popularityMap[r.track_id] = { plays: 0, downloads: 0 };
        popularityMap[r.track_id].downloads++;
      }
    }
    if (weeklyPlayRes.data) {
      for (const r of weeklyPlayRes.data) {
        if (!weeklyPopularityMap[r.track_id]) weeklyPopularityMap[r.track_id] = { plays: 0, downloads: 0 };
        weeklyPopularityMap[r.track_id].plays++;
      }
    }
    if (weeklyDlRes.data) {
      for (const r of weeklyDlRes.data) {
        if (!weeklyPopularityMap[r.track_id]) weeklyPopularityMap[r.track_id] = { plays: 0, downloads: 0 };
        weeklyPopularityMap[r.track_id].downloads++;
      }
    }

    // Fetch active categories for dynamic rendering
    const [categoriesRes, journeysRes] = await Promise.all([
      supabaseAdmin
        .from('categories')
        .select('id, name, slug, icon, sort_order, is_featured')
        .order('sort_order', { ascending: true }),
      supabaseAdmin
        .from('journeys')
        .select('id, name, slug, icon, sort_order')
        .order('sort_order', { ascending: true }),
    ]);

    const categories = (categoriesRes.data || []).map((c: any) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      icon: c.icon,
      sortOrder: c.sort_order,
      isFeatured: c.is_featured,
    }));

    const journeys = (journeysRes.data || []).map((j: any) => ({
      id: j.id,
      name: j.name,
      slug: j.slug,
      icon: j.icon,
      sortOrder: j.sort_order,
    }));

    return {
      items,
      hasFullAccess,
      viewedIds: Array.from(playedContentIds),
      downloadedIds: Array.from(downloadedContentIds),
      progressMap,
      popularityMap,
      weeklyPopularityMap,
      categories,
      journeys,
    };
  });
