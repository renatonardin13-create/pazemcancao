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

    // For each item, compute whether it's unlocked based on release_days
    const items = (data || []).map((item: any) => {
      if (item.is_free) return { ...item, unlocked: true };
      if (isAdmin) return { ...item, unlocked: true };
      if (!isBuyer) return { ...item, unlocked: false };

      // Buyer has access — check release_days
      if (item.release_days && buyerCreatedAt) {
        const unlockDate = new Date(buyerCreatedAt);
        unlockDate.setDate(unlockDate.getDate() + item.release_days);
        const unlocked = new Date() >= unlockDate;
        return { ...item, unlocked, unlockDate: unlockDate.toISOString() };
      }

      return { ...item, unlocked: true };
    });

    return { items, hasFullAccess };
  });
