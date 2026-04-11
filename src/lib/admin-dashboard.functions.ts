import { createServerFn } from '@tanstack/react-start';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { supabaseAdmin } from '@/integrations/supabase/client.server';

export const getDashboardStats = createServerFn({ method: 'POST' })
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

    if (!adminRole) {
      const { data: userData } = await supabase.auth.getUser();
      const isAdminEmail = userData?.user?.email?.toLowerCase() === 'renatonardin13@gmail.com';
      if (!isAdminEmail) throw new Error('Acesso não autorizado');
    }

    // Fetch all counts in parallel using head:true (no row data transferred)
    const [
      { count: totalCategories },
      { count: totalTracks },
      { count: activeTracks },
      { count: totalStudents },
      { count: activeSessions },
    ] = await Promise.all([
      supabaseAdmin.from('categories').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('tracks').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('tracks').select('*', { count: 'exact', head: true }).eq('is_active', true),
      supabaseAdmin.from('approved_buyers').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('active_sessions').select('*', { count: 'exact', head: true }).eq('is_valid', true),
    ]);

    return {
      totalCategories: totalCategories || 0,
      totalTracks: totalTracks || 0,
      activeTracks: activeTracks || 0,
      totalStudents: totalStudents || 0,
      activeSessions: activeSessions || 0,
    };
  });
