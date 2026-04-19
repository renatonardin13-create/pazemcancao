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

    const { data: userData } = await supabase.auth.getUser();
    const isAdminEmail = userData?.user?.email?.toLowerCase() === 'renatonardin13@gmail.com';

    if (!adminRole && !isAdminEmail) {
      throw new Error('Acesso não autorizado');
    }

    // Fetch admin user IDs and emails to EXCLUDE from the student list
    const { data: adminRoles } = await supabaseAdmin
      .from('user_roles')
      .select('user_id')
      .eq('role', 'admin');
    const adminUserIds = new Set((adminRoles || []).map((r: any) => r.user_id));

    const { data: adminAuthUsers } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
    const adminEmails = new Set<string>();
    for (const u of adminAuthUsers?.users || []) {
      if (u.email && adminUserIds.has(u.id)) adminEmails.add(u.email.toLowerCase());
    }
    // Hardcoded admin safety net
    adminEmails.add('renatonardin13@gmail.com');

    // Fetch approved buyers (exclude admins)
    const { data: buyersRaw, error } = await supabaseAdmin
      .from('approved_buyers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);

    const buyers = (buyersRaw || []).filter(
      (b: any) => !adminEmails.has((b.email || '').toLowerCase())
    );

    // Fetch active sessions
    const { data: sessions } = await supabaseAdmin
      .from('active_sessions')
      .select('email, is_valid, last_active_at')
      .eq('is_valid', true);

    // Fetch ALL enrollments (any status — we surface per-course status to the UI)
    const { data: enrollments } = await supabaseAdmin
      .from('enrollments')
      .select('email, user_id, course_id, status, progress_percentage, expires_at, access_origin');

    // Fetch lesson progress for all users
    const { data: lessonProgress } = await supabaseAdmin
      .from('lesson_progress')
      .select('user_id, course_id, completed');

    // Fetch total lessons per course
    const { data: allLessons } = await supabaseAdmin
      .from('lessons')
      .select('id, course_id');

    // Fetch course titles
    const { data: coursesData } = await supabaseAdmin
      .from('courses')
      .select('id, title');
    const courseTitles = new Map<string, string>();
    for (const c of coursesData || []) courseTitles.set(c.id, c.title);

    // Build lessons-per-course map
    const lessonsPerCourse = new Map<string, number>();
    for (const l of allLessons || []) {
      lessonsPerCourse.set(l.course_id, (lessonsPerCourse.get(l.course_id) || 0) + 1);
    }

    // Map email → user_id (reuse adminAuthUsers list — already paged 1000)
    const emailToUserId = new Map<string, string>();
    for (const u of adminAuthUsers?.users || []) {
      if (u.email) emailToUserId.set(u.email.toLowerCase(), u.id);
    }

    // Group enrollments keeping FULL records (not just count)
    type EnrollmentRow = {
      email: string | null;
      user_id: string | null;
      course_id: string;
      status: string;
      expires_at: string | null;
      access_origin: string;
      updated_at?: string | null;
      notes?: string | null;
    };
    const enrollmentsByEmail = new Map<string, EnrollmentRow[]>();
    const enrollmentsByUserId = new Map<string, EnrollmentRow[]>();
    for (const e of (enrollments || []) as EnrollmentRow[]) {
      const email = e.email?.toLowerCase();
      if (email) {
        const arr = enrollmentsByEmail.get(email) || [];
        arr.push(e);
        enrollmentsByEmail.set(email, arr);
      }
      if (e.user_id) {
        const arr = enrollmentsByUserId.get(e.user_id) || [];
        arr.push(e);
        enrollmentsByUserId.set(e.user_id, arr);
      }
    }

    // Build completed lessons per user_id per course
    const completedByUser = new Map<string, Map<string, number>>();
    for (const p of lessonProgress || []) {
      if (!p.completed) continue;
      if (!completedByUser.has(p.user_id)) completedByUser.set(p.user_id, new Map());
      const courseMap = completedByUser.get(p.user_id)!;
      courseMap.set(p.course_id, (courseMap.get(p.course_id) || 0) + 1);
    }

    // Helper: derive effective per-course status
    const now = Date.now();
    const deriveStatus = (e: EnrollmentRow, buyerStatus?: string, accessEnabled?: boolean): string => {
      const normalizedBuyerStatus = (buyerStatus || '').toLowerCase();
      if (e.status === 'active' && e.expires_at && new Date(e.expires_at).getTime() < now) return 'expired';
      if (
        e.status === 'active' &&
        accessEnabled === false &&
        !['refunded', 'chargedback', 'chargeback', 'reembolso', 'expired', 'cancelled'].includes(normalizedBuyerStatus)
      ) {
        return 'blocked';
      }
      return e.status;
    };

    // Enrich each buyer
    const enrichedBuyers = buyers.map((buyer: any) => {
      const email = buyer.email?.toLowerCase();
      const authUserId = email ? emailToUserId.get(email) : null;

      // Merge enrollment rows from email + user_id (dedupe by course_id, prefer newest state)
      const merged = new Map<string, EnrollmentRow>();
      for (const e of [...(enrollmentsByEmail.get(email || '') || []), ...(authUserId ? enrollmentsByUserId.get(authUserId) || [] : [])]) {
        const existing = merged.get(e.course_id);
        const existingTs = existing?.updated_at ? new Date(existing.updated_at).getTime() : 0;
        const nextTs = e.updated_at ? new Date(e.updated_at).getTime() : 0;
        if (!existing || nextTs > existingTs || (nextTs === existingTs && existing.status !== 'active' && e.status === 'active')) {
          merged.set(e.course_id, e);
        }
      }

      const courses = Array.from(merged.values()).map((e) => ({
        course_id: e.course_id,
        course_title: courseTitles.get(e.course_id) || 'Curso removido',
        status: deriveStatus(e, buyer.status, buyer.access_enabled),
        access_origin: e.access_origin,
        expires_at: e.expires_at,
        last_event: e.notes || null,
      }));

      const activeCourses = courses.filter((c) => c.status === 'active');
      const courseCount = activeCourses.length;
      const buyerStatus = (buyer.status || '').toLowerCase();

      // Coherent overall status based on real course statuses
      let overallStatus: string;
      if (activeCourses.length > 0) overallStatus = 'active';
      else if (courses.some((c) => c.status === 'blocked') || buyerStatus === 'blocked') overallStatus = 'blocked';
      else if (courses.some((c) => ['refunded', 'chargedback'].includes(c.status)) || ['refunded', 'chargedback', 'chargeback', 'reembolso'].includes(buyerStatus)) overallStatus = 'refunded';
      else if (courses.some((c) => c.status === 'expired') || buyerStatus === 'expired') overallStatus = 'expired';
      else overallStatus = 'no_access';

      // Progress only over active courses
      let totalLessons = 0;
      let completedLessons = 0;
      if (authUserId) {
        const userCompleted = completedByUser.get(authUserId);
        for (const c of activeCourses) {
          totalLessons += lessonsPerCourse.get(c.course_id) || 0;
          if (userCompleted) completedLessons += userCompleted.get(c.course_id) || 0;
        }
      }
      const progressPct = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

      return {
        ...buyer,
        course_count: courseCount,
        progress_pct: progressPct,
        overall_status: overallStatus,
        courses,
      };
    });

    return {
      buyers: enrichedBuyers,
      recentLogs: [],
      activeSessions: sessions || [],
    };
  });
