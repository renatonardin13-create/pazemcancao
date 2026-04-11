import { createServerFn } from '@tanstack/react-start';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { supabaseAdmin } from '@/integrations/supabase/client.server';

export const listContentItems = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    // Get user email for access check
    const { data: userData } = await context.supabase.auth.getUser();
    const email = userData?.user?.email?.toLowerCase();

    // Check if user is admin
    const { data: adminRole } = await context.supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', context.userId)
      .eq('role', 'admin')
      .maybeSingle();

    const isAdmin = !!adminRole || email === 'renatonardin13@gmail.com';

    // Check if user is approved buyer
    let isBuyer = false;
    if (!isAdmin && email) {
      const { data: buyer } = await supabaseAdmin
        .from('approved_buyers')
        .select('id')
        .eq('email', email)
        .eq('access_enabled', true)
        .maybeSingle();
      isBuyer = !!buyer;
    }

    // Fetch all active content using admin client (bypasses RLS)
    const { data, error } = await supabaseAdmin
      .from('content_items')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) throw new Error(error.message);

    // Filter: admins/buyers see everything, others see only free content
    const hasFullAccess = isAdmin || isBuyer;
    const items = (data || []).filter((item: any) =>
      hasFullAccess || item.is_free
    );

    return { items };
  });
