import { createServerFn } from '@tanstack/react-start';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';

export const getUserFavoritesCount = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;

    const { count } = await supabase
      .from('user_favorites')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId);

    return { count: count || 0 };
  });

export const getLibraryStats = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;

    const userEmail = (await supabase.auth.getUser()).data.user?.email;

    // Conteúdos Liberados: content_items the user has unlocked
    const { count: unlockedCount } = await supabase
      .from('user_content_unlocks')
      .select('id', { count: 'exact', head: true })
      .eq('email', userEmail ?? '')
      .eq('unlocked', true);

    // Conteúdos em Breve: content_items scheduled but not yet unlocked for user
    const { count: upcomingCount } = await supabase
      .from('user_content_unlocks')
      .select('id', { count: 'exact', head: true })
      .eq('email', userEmail ?? '')
      .eq('unlocked', false);

    // Favoritos
    const { count: favCount } = await supabase
      .from('user_favorites')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId);

    // Bônus Exclusivos: free active content items
    const { count: bonusCount } = await supabase
      .from('content_items')
      .select('id', { count: 'exact', head: true })
      .eq('is_active', true)
      .eq('is_free', true);

    return {
      unlocked: unlockedCount || 0,
      upcoming: upcomingCount || 0,
      favorites: favCount || 0,
      bonus: bonusCount || 0,
    };
  });

export const getLibrarySections = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const userEmail = (await supabase.auth.getUser()).data.user?.email ?? '';

    // ── Unlocked content (user has access) ──
    const { data: unlockRows } = await supabase
      .from('user_content_unlocks')
      .select('content_id')
      .eq('email', userEmail)
      .eq('unlocked', true);

    const unlockedIds = (unlockRows || []).map((r: any) => r.content_id);

    let unlockedItems: any[] = [];
    if (unlockedIds.length > 0) {
      const { data } = await supabase
        .from('content_items')
        .select('id, title, cover_url, card_cover_url, content_type, badge_text, description, sales_page_url, is_free')
        .in('id', unlockedIds)
        .eq('is_active', true)
        .order('sort_order', { ascending: true });
      unlockedItems = data || [];
    }

    // ── Upcoming content (scheduled, not yet unlocked) ──
    const { data: upcomingRows } = await supabase
      .from('user_content_unlocks')
      .select('content_id, unlock_at')
      .eq('email', userEmail)
      .eq('unlocked', false)
      .order('unlock_at', { ascending: true });

    const upcomingIds = (upcomingRows || []).map((r: any) => r.content_id);
    const unlockDateMap = new Map<string, string>();
    for (const r of upcomingRows || []) {
      unlockDateMap.set(r.content_id, r.unlock_at);
    }

    let upcomingItems: any[] = [];
    if (upcomingIds.length > 0) {
      const { data } = await supabase
        .from('content_items')
        .select('id, title, cover_url, card_cover_url, content_type, badge_text, description')
        .in('id', upcomingIds)
        .eq('is_active', true)
        .order('sort_order', { ascending: true });
      upcomingItems = (data || []).map((item: any) => ({
        ...item,
        unlock_at: unlockDateMap.get(item.id) || null,
      }));
    }

    // ── Locked content (available for purchase — active paid items user hasn't unlocked) ──
    const allUserIds = new Set([...unlockedIds, ...upcomingIds]);
    const { data: allPaidItems } = await supabase
      .from('content_items')
      .select('id, title, cover_url, card_cover_url, content_type, badge_text, description, sales_page_url')
      .eq('is_active', true)
      .eq('is_free', false)
      .order('sort_order', { ascending: true });

    const lockedItems = (allPaidItems || []).filter((item: any) => !allUserIds.has(item.id));

    // ── Favorites ──
    const { data: favRows } = await supabase
      .from('user_favorites')
      .select('content_id')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    const favIds = (favRows || []).map((r: any) => r.content_id);

    let favoriteItems: any[] = [];
    if (favIds.length > 0) {
      const { data } = await supabase
        .from('content_items')
        .select('id, title, cover_url, card_cover_url, content_type, badge_text, description, sales_page_url, is_free')
        .in('id', favIds)
        .eq('is_active', true);
      favoriteItems = data || [];
      // Preserve favorite order
      const favMap = new Map(favoriteItems.map((i: any) => [i.id, i]));
      favoriteItems = favIds.map((id: string) => favMap.get(id)).filter(Boolean);
    }

    // ── Bonus (free content) ──
    const { data: bonusItems } = await supabase
      .from('content_items')
      .select('id, title, cover_url, card_cover_url, content_type, badge_text, description')
      .eq('is_active', true)
      .eq('is_free', true)
      .order('sort_order', { ascending: true });

    return {
      unlocked: unlockedItems,
      locked: lockedItems,
      upcoming: upcomingItems,
      favorites: favoriteItems,
      bonus: bonusItems || [],
    };
  });
