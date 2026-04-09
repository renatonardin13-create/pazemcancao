import { createServerFn } from '@tanstack/react-start';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { supabaseAdmin } from '@/integrations/supabase/client.server';

export const listApprovedBuyers = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;

    // Verify caller is admin
    const { data: adminRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .maybeSingle();

    // Also check email fallback
    const { data: userData } = await supabase.auth.getUser();
    const isAdminEmail = userData?.user?.email?.toLowerCase() === 'renatonardin13@gmail.com';

    if (!adminRole && !isAdminEmail) {
      throw new Error('Acesso não autorizado');
    }

    // Fetch approved buyers with admin client
    const { data: buyers, error } = await supabaseAdmin
      .from('approved_buyers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);

    // Fetch access logs summary
    const { data: logs } = await supabaseAdmin
      .from('user_access_logs')
      .select('email, is_blocked, login_at')
      .order('login_at', { ascending: false });

    // Fetch active sessions
    const { data: sessions } = await supabaseAdmin
      .from('active_sessions')
      .select('email, is_valid, last_active_at')
      .eq('is_valid', true);

    return {
      buyers: buyers || [],
      recentLogs: logs || [],
      activeSessions: sessions || [],
    };
  });
