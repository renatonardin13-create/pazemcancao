import { createServerFn } from '@tanstack/react-start';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { supabaseAdmin } from '@/integrations/supabase/client.server';

export const getDashboardStats = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { areaId?: string }) => input)
  .handler(async ({ data: inputData, context }) => {
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

    const [
      { count: totalAreas },
      { count: totalCategories },
      { count: totalTracks },
      { count: activeTracks },
      { count: totalStudents },
      { count: activeSessions },
      { count: totalCourses },
      { count: activeCourses },
      { count: pendingEnrollments },
      { data: revenueData },
      { data: webhookSettings },
      { count: totalIntegrations },
    ] = await Promise.all([
      supabaseAdmin.from('areas').select('*', { count: 'exact', head: true }),
      (() => {
        let q = supabaseAdmin.from('categories').select('*', { count: 'exact', head: true });
        if (inputData?.areaId) q = q.eq('area_id', inputData.areaId);
        return q;
      })(),
      (() => {
        let q = supabaseAdmin.from('tracks').select('*', { count: 'exact', head: true });
        if (inputData?.areaId) q = q.eq('area_id', inputData.areaId);
        return q;
      })(),
      (() => {
        let q = supabaseAdmin.from('tracks').select('*', { count: 'exact', head: true }).eq('is_active', true);
        if (inputData?.areaId) q = q.eq('area_id', inputData.areaId);
        return q;
      })(),
      (() => {
        let q = supabaseAdmin.from('approved_buyers').select('*', { count: 'exact', head: true });
        if (inputData?.areaId) q = q.eq('area_id', inputData.areaId);
        return q;
      })(),
      (() => {
        let q = supabaseAdmin.from('active_sessions').select('*', { count: 'exact', head: true }).eq('is_valid', true);
        if (inputData?.areaId) q = q.eq('area_id', inputData.areaId);
        return q;
      })(),
      (() => {
        let q = supabaseAdmin.from('courses').select('*', { count: 'exact', head: true });
        if (inputData?.areaId) q = q.eq('area_id', inputData.areaId);
        return q;
      })(),
      (() => {
        let q = supabaseAdmin.from('courses').select('*', { count: 'exact', head: true }).eq('status', 'published');
        if (inputData?.areaId) q = q.eq('area_id', inputData.areaId);
        return q;
      })(),
      (() => {
        let q = supabaseAdmin.from('enrollments').select('*', { count: 'exact', head: true }).eq('status', 'pending');
        if (inputData?.areaId) q = q.eq('area_id', inputData.areaId);
        return q;
      })(),
      (() => {
        let q = supabaseAdmin.from('transactions').select('amount').eq('status', 'paid');
        if (inputData?.areaId) q = q.eq('area_id', inputData.areaId);
        return q;
      })(),
      supabaseAdmin.from('webhook_settings').select('*').limit(1),
      supabaseAdmin.from('course_integrations').select('*', { count: 'exact', head: true }),
    ]);

    // Fetch top courses by enrollment count
    let topCoursesQuery = supabaseAdmin
      .from('courses')
      .select('id, title, cover_image_url, price')
      .eq('status', 'published');
    
    if (inputData?.areaId) {
      topCoursesQuery = topCoursesQuery.eq('area_id', inputData.areaId);
    }

    const { data: topCoursesRaw } = await topCoursesQuery
      .order('sort_order', { ascending: true })
      .limit(5);

    let topCourses: { id: string; title: string; coverUrl: string | null; price: number; students: number }[] = [];

    if (topCoursesRaw?.length) {
      const courseIds = topCoursesRaw.map(c => c.id);
      const { data: enrollCounts } = await supabaseAdmin
        .from('enrollments')
        .select('course_id')
        .in('course_id', courseIds)
        .eq('status', 'active');

      const countMap: Record<string, number> = {};
      enrollCounts?.forEach(e => { countMap[e.course_id] = (countMap[e.course_id] || 0) + 1; });

      topCourses = topCoursesRaw.map(c => ({
        id: c.id,
        title: c.title,
        coverUrl: c.cover_image_url,
        price: c.price,
        students: countMap[c.id] || 0,
      })).sort((a, b) => b.students - a.students);
    }

    const totalRevenue = (revenueData || []).reduce((sum, t) => sum + Number(t.amount || 0), 0);

    return {
      totalAreas: totalAreas || 0,
      totalCategories: totalCategories || 0,
      totalTracks: totalTracks || 0,
      activeTracks: activeTracks || 0,
      totalStudents: totalStudents || 0,
      activeSessions: activeSessions || 0,
      totalCourses: totalCourses || 0,
      activeCourses: activeCourses || 0,
      pendingEnrollments: pendingEnrollments || 0,
      totalRevenue,
      topCourses,
      webhookActivated: !!webhookSettings?.[0]?.is_active,
      webhookToken: webhookSettings?.[0]?.auth_token || '',
      gatewayConfigured: (totalIntegrations || 0) > 0,
    };
  });
