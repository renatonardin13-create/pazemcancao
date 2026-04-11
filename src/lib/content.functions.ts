import { createServerFn } from '@tanstack/react-start';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { supabaseAdmin } from '@/integrations/supabase/client.server';

export const listContentItems = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
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

    const { data, error } = await supabaseAdmin
      .from('content_items')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

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

    // Fetch user behavior logs for unlock rules
    let playedContentIds = new Set<string>();
    let downloadedContentIds = new Set<string>();
    let viewedContentIds = new Set<string>();
    let completedContentIds = new Set<string>();
    if (email) {
      const { data: plays } = await supabaseAdmin
        .from('play_logs')
        .select('track_id')
        .eq('email', email);
      if (plays) {
        for (const p of plays) playedContentIds.add(p.track_id);
      }
      const { data: downloads } = await supabaseAdmin
        .from('download_logs')
        .select('track_id')
        .eq('email', email);
      if (downloads) {
        for (const d of downloads) downloadedContentIds.add(d.track_id);
      }
      // Also check content progress for unlock rules on content_items
      const { data: progressRows } = await supabaseAdmin
        .from('user_content_progress')
        .select('content_id, viewed_at, completed_at, downloaded_at')
        .eq('user_email', email);
      if (progressRows) {
        for (const p of progressRows as any[]) {
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

      // First, determine base unlock status from access mode
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
        // pago
        effectiveAccessMode = 'pago';
        baseUnlocked = isBuyer;
      }

      // Then, apply unlock rule (complementary layer)
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

      // Resolve prerequisite content info for the card
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

    // Fetch active categories for dynamic rendering
    const { data: categoriesData } = await supabaseAdmin
      .from('categories')
      .select('id, name, slug, icon, sort_order, is_featured')
      .order('sort_order', { ascending: true });

    const categories = (categoriesData || []).map((c: any) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      icon: c.icon,
      sortOrder: c.sort_order,
      isFeatured: c.is_featured,
    }));

    // Fetch journeys for dynamic rendering
    const { data: journeysData } = await supabaseAdmin
      .from('journeys')
      .select('id, name, slug, icon, sort_order')
      .order('sort_order', { ascending: true });

    const journeys = (journeysData || []).map((j: any) => ({
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
      categories,
      journeys,
    };
  });
