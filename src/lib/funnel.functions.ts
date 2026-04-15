import { createServerFn } from '@tanstack/react-start';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { supabaseAdmin } from '@/integrations/supabase/client.server';

export type FunnelLevel = 'free' | 'basic' | 'premium' | 'vip';

export type FunnelSuggestion = {
  id: string;
  type: 'course' | 'content' | 'track';
  title: string;
  cover_url: string | null;
  sales_page_url: string | null;
  is_locked: boolean;
  badge?: string;
  cta_text: string;
  funnel_level: FunnelLevel;
  popularity: number;
};

/**
 * Smart funnel: determines user's access level and suggests the next best products.
 * Level 1: Free content → suggest paid products
 * Level 2: Basic buyer → suggest upgrades
 * Level 3: Premium → suggest advanced/exclusive
 * Level 4: VIP → suggest recurrence/community
 */
export const getFunnelSuggestions = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { context?: string; limit?: number }) => input)
  .handler(async ({ data, context }) => {
    const supabase = context.supabase;
    const userId = context.userId;
    const userEmail = context.claims?.email as string | undefined;
    const limit = Math.min(data.limit || 8, 12);

    // 1. Determine user's funnel level
    let funnelLevel: FunnelLevel = 'free';
    let ownedCourseIds: string[] = [];
    let isBuyer = false;

    if (userEmail) {
      // Check if user is an approved buyer
      const { data: buyer } = await supabaseAdmin
        .from('approved_buyers')
        .select('access_enabled, can_download, is_trial')
        .eq('email', userEmail)
        .eq('access_enabled', true)
        .maybeSingle();

      if (buyer) {
        isBuyer = true;
        funnelLevel = buyer.is_trial ? 'free' : 'basic';
      }

      // Check enrollments
      const { data: enrollments } = await supabase
        .from('enrollments')
        .select('course_id')
        .eq('user_id', userId)
        .eq('status', 'active');

      ownedCourseIds = (enrollments || []).map((e: any) => e.course_id);

      if (ownedCourseIds.length >= 3) funnelLevel = 'premium';
      if (ownedCourseIds.length >= 6 && isBuyer) funnelLevel = 'vip';
    }

    const suggestions: FunnelSuggestion[] = [];
    const seenIds = new Set<string>();

    // 2. Based on funnel level, pick the right products to suggest

    // Always suggest courses user does NOT own, ordered by popularity
    const { data: courses } = await supabaseAdmin
      .from('courses')
      .select('id, title, cover_image_url, status, access_count, price, promotional_price')
      .eq('status', 'published')
      .order('access_count', { ascending: false })
      .limit(20);

    // Get checkout URLs
    const courseIds = (courses || []).map((c: any) => c.id);
    const { data: integrations } = await supabaseAdmin
      .from('course_integrations')
      .select('course_id, checkout_url')
      .in('course_id', courseIds.length > 0 ? courseIds : ['__none__'])
      .eq('is_enabled', true);

    const checkoutMap: Record<string, string> = {};
    for (const ci of integrations || []) {
      if (ci.checkout_url) checkoutMap[ci.course_id] = ci.checkout_url;
    }

    for (const c of courses || []) {
      if (seenIds.has(c.id)) continue;
      const isOwned = ownedCourseIds.includes(c.id);
      if (isOwned) continue; // Don't suggest what user already has

      seenIds.add(c.id);

      let badge = '';
      let cta_text = 'Desbloquear';

      if (c.access_count > 10) badge = '🔥 Mais vendido';
      if (c.promotional_price && c.promotional_price < c.price) badge = '💰 Oferta';

      if (funnelLevel === 'free') {
        cta_text = 'Desbloqueie agora';
      } else if (funnelLevel === 'basic') {
        cta_text = 'Faça upgrade';
      } else if (funnelLevel === 'premium') {
        cta_text = 'Acesso total';
      }

      suggestions.push({
        id: c.id,
        type: 'course',
        title: c.title,
        cover_url: c.cover_image_url,
        sales_page_url: checkoutMap[c.id] || null,
        is_locked: true,
        badge,
        cta_text,
        funnel_level: funnelLevel,
        popularity: c.access_count || 0,
      });
    }

    // Add content items (ebooks, videos, etc) the user may not have
    const { data: contents } = await supabaseAdmin
      .from('content_items')
      .select('id, title, cover_url, card_cover_url, sales_page_url, is_free, badge_text, access_mode')
      .eq('is_active', true)
      .order('featured_priority', { ascending: false })
      .limit(10);

    for (const c of contents || []) {
      if (seenIds.has(c.id)) continue;
      seenIds.add(c.id);

      const isFreePaid = c.access_mode === 'pago' || !c.is_free;

      // For free users: show paid content as locked
      // For buyers: show content they don't have
      if (funnelLevel === 'free' && !isFreePaid) continue; // Skip free items for free users (they can already see them)

      suggestions.push({
        id: c.id,
        type: 'content',
        title: c.title,
        cover_url: c.card_cover_url || c.cover_url,
        sales_page_url: c.sales_page_url,
        is_locked: isFreePaid && funnelLevel === 'free',
        badge: c.badge_text || '',
        cta_text: isFreePaid ? 'Desbloquear' : 'Ver conteúdo',
        funnel_level: funnelLevel,
        popularity: 0,
      });
    }

    // Sort: locked products first (higher conversion potential), then by popularity
    suggestions.sort((a, b) => {
      if (a.is_locked !== b.is_locked) return a.is_locked ? -1 : 1;
      return b.popularity - a.popularity;
    });

    return {
      funnelLevel,
      suggestions: suggestions.slice(0, limit),
      totalAvailable: suggestions.length,
      ownedCount: ownedCourseIds.length,
    };
  });
