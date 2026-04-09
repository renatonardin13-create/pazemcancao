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

    const { data: userData } = await supabase.auth.getUser();
    const isAdminEmail = userData?.user?.email?.toLowerCase() === 'renatonardin13@gmail.com';

    if (!adminRole && !isAdminEmail) {
      throw new Error('Acesso não autorizado');
    }

    // Fetch counts
    const [
      { count: totalCourses },
      { count: publishedCourses },
      { count: totalEnrollments },
      { count: activeEnrollments },
      { count: totalCategories },
      { data: buyers },
      { data: sessions },
      { data: courses },
      { data: recentEnrollments },
    ] = await Promise.all([
      supabaseAdmin.from('courses').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('courses').select('*', { count: 'exact', head: true }).eq('status', 'published'),
      supabaseAdmin.from('enrollments').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('enrollments').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      supabaseAdmin.from('categories').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('approved_buyers').select('id').limit(1000),
      supabaseAdmin.from('active_sessions').select('email').eq('is_valid', true),
      supabaseAdmin.from('courses').select('id, title, course_type, status, cover_image_url, price, created_at').order('created_at', { ascending: false }).limit(5),
      supabaseAdmin.from('enrollments').select('id, course_id, user_id, enrolled_at, status').order('enrolled_at', { ascending: false }).limit(10),
    ]);

    return {
      totalCourses: totalCourses || 0,
      publishedCourses: publishedCourses || 0,
      totalEnrollments: totalEnrollments || 0,
      activeEnrollments: activeEnrollments || 0,
      totalCategories: totalCategories || 0,
      totalStudents: buyers?.length || 0,
      activeSessions: sessions?.length || 0,
      recentCourses: courses || [],
      recentEnrollments: recentEnrollments || [],
    };
  });
