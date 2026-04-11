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
    }

    const now = new Date();

    const items = (data || []).map((item: any) => {
      if (isAdmin) return { ...item, unlocked: true };

      const accessMode = item.access_mode || (item.is_free ? 'gratuito' : 'pago');

      if (accessMode === 'gratuito') {
        return { ...item, unlocked: true, effectiveAccessMode: 'gratuito' };
      }

      if (accessMode === 'liberar_em_dias') {
        if (!isBuyer) return { ...item, unlocked: false, effectiveAccessMode: 'liberar_em_dias' };

        // Use pre-calculated unlock date from user_content_unlocks table
        const unlock = unlockMap.get(item.id);
        if (unlock) {
          const unlockDate = new Date(unlock.unlock_at);
          const isUnlocked = now >= unlockDate;
          return { ...item, unlocked: isUnlocked, unlockDate: unlock.unlock_at, effectiveAccessMode: 'liberar_em_dias' };
        }

        // Fallback: calculate from buyer created_at (legacy, before unlock table existed)
        if (item.release_days && buyerCreatedAt) {
          const unlockDate = new Date(buyerCreatedAt);
          unlockDate.setDate(unlockDate.getDate() + item.release_days);
          const isUnlocked = now >= unlockDate;
          return { ...item, unlocked: isUnlocked, unlockDate: unlockDate.toISOString(), effectiveAccessMode: 'liberar_em_dias' };
        }
        return { ...item, unlocked: true, effectiveAccessMode: 'liberar_em_dias' };
      }

      // accessMode === 'pago' (default)
      if (!isBuyer) return { ...item, unlocked: false, effectiveAccessMode: 'pago' };
      return { ...item, unlocked: true, effectiveAccessMode: 'pago' };
    });

    return { items, hasFullAccess };
  });
