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

    // Fetch approved buyers
    const { data: buyers, error } = await supabaseAdmin
      .from('approved_buyers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);

    // Fetch active sessions
    const { data: sessions } = await supabaseAdmin
      .from('active_sessions')
      .select('email, is_valid, last_active_at')
      .eq('is_valid', true);

    // Fetch ALL active enrollments (with email for matching)
    const { data: enrollments } = await supabaseAdmin
      .from('enrollments')
      .select('email, user_id, course_id, status, progress_percentage')
      .eq('status', 'active');

    // Fetch lesson progress for all users
    const { data: lessonProgress } = await supabaseAdmin
      .from('lesson_progress')
      .select('user_id, course_id, completed');

    // Fetch total lessons per course
    const { data: allLessons } = await supabaseAdmin
      .from('lessons')
      .select('id, course_id');

    // Build lessons-per-course map
    const lessonsPerCourse = new Map<string, number>();
    for (const l of allLessons || []) {
      lessonsPerCourse.set(l.course_id, (lessonsPerCourse.get(l.course_id) || 0) + 1);
    }

    // Fetch auth users to map email → user_id
    const { data: authUsersData } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
    const emailToUserId = new Map<string, string>();
    for (const u of authUsersData?.users || []) {
      if (u.email) emailToUserId.set(u.email.toLowerCase(), u.id);
    }

    // Build enrollment count and progress per email
    const enrollmentsByEmail = new Map<string, { courseCount: number; courseIds: string[] }>();
    for (const e of enrollments || []) {
      const email = e.email?.toLowerCase();
      if (!email) continue;
      const entry = enrollmentsByEmail.get(email) || { courseCount: 0, courseIds: [] };
      entry.courseCount++;
      entry.courseIds.push(e.course_id);
      enrollmentsByEmail.set(email, entry);
    }

    // Also map by user_id for enrollments without email
    const enrollmentsByUserId = new Map<string, { courseCount: number; courseIds: string[] }>();
    for (const e of enrollments || []) {
      if (!e.user_id) continue;
      const entry = enrollmentsByUserId.get(e.user_id) || { courseCount: 0, courseIds: [] };
      entry.courseCount++;
      entry.courseIds.push(e.course_id);
      enrollmentsByUserId.set(e.user_id, entry);
    }

    // Build completed lessons per user_id per course
    const completedByUser = new Map<string, Map<string, number>>();
    for (const p of lessonProgress || []) {
      if (!p.completed) continue;
      if (!completedByUser.has(p.user_id)) completedByUser.set(p.user_id, new Map());
      const courseMap = completedByUser.get(p.user_id)!;
      courseMap.set(p.course_id, (courseMap.get(p.course_id) || 0) + 1);
    }

    // Enrich each buyer
    const enrichedBuyers = (buyers || []).map((buyer: any) => {
      const email = buyer.email?.toLowerCase();
      const authUserId = email ? emailToUserId.get(email) : null;

      // Merge enrollment data from email + user_id
      const byEmail = enrollmentsByEmail.get(email || '') || { courseCount: 0, courseIds: [] };
      const byUid = authUserId ? (enrollmentsByUserId.get(authUserId) || { courseCount: 0, courseIds: [] }) : { courseCount: 0, courseIds: [] };

      // Unique course ids
      const allCourseIds = Array.from(new Set([...byEmail.courseIds, ...byUid.courseIds]));
      const courseCount = allCourseIds.length;

      // Calculate overall progress
      let totalLessons = 0;
      let completedLessons = 0;
      if (authUserId) {
        const userCompleted = completedByUser.get(authUserId);
        for (const courseId of allCourseIds) {
          const courseLessons = lessonsPerCourse.get(courseId) || 0;
          totalLessons += courseLessons;
          if (userCompleted) {
            completedLessons += userCompleted.get(courseId) || 0;
          }
        }
      }
      const progressPct = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

      return {
        ...buyer,
        course_count: courseCount,
        progress_pct: progressPct,
      };
    });

    return {
      buyers: enrichedBuyers,
      recentLogs: [],
      activeSessions: sessions || [],
    };
  });
