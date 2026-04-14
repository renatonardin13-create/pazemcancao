import { createServerFn } from '@tanstack/react-start';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';

export const getMyCoursesData = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;

    // Get all enrollments for the authenticated user (not just active — we filter below)
    const { data: enrollments } = await supabase
      .from('enrollments')
      .select('course_id, progress_percentage, status, enrolled_at, access_origin, granted_at, expires_at, updated_at')
      .eq('user_id', userId)
      .order('granted_at', { ascending: false })
      .order('enrolled_at', { ascending: false });

    if (!enrollments || enrollments.length === 0) {
      return { courses: [], stats: { total: 0, inProgress: 0, completed: 0 } };
    }

    // Filter: only active enrollments that haven't expired
    const activeEnrollments = enrollments.filter((e: any) => {
      if (e.status !== 'active') return false;
      if (e.expires_at && new Date(e.expires_at) < new Date()) return false;
      return true;
    });

    if (activeEnrollments.length === 0) {
      return { courses: [], stats: { total: 0, inProgress: 0, completed: 0 } };
    }

    // Keep a single active access record per course
    const enrollmentByCourse = new Map<string, (typeof activeEnrollments)[number]>();
    for (const enrollment of activeEnrollments) {
      if (!enrollmentByCourse.has(enrollment.course_id)) {
        enrollmentByCourse.set(enrollment.course_id, enrollment);
      }
    }

    const uniqueEnrollments = Array.from(enrollmentByCourse.values());
    const courseIds = uniqueEnrollments.map((e) => e.course_id);

    // Get only published courses that the user has active access to
    const { data: courses } = await supabase
      .from('courses')
      .select('id, title, cover_image_url, banner_image_url, short_description, total_lessons, total_duration, status')
      .in('id', courseIds)
      .eq('status', 'published');

    // Get modules count per course
    const { data: modules } = await supabase
      .from('modules')
      .select('id, course_id')
      .in('course_id', courseIds);

    const moduleCountMap = new Map<string, number>();
    for (const m of modules || []) {
      moduleCountMap.set(m.course_id, (moduleCountMap.get(m.course_id) || 0) + 1);
    }

    // Get lessons count per course
    const { data: lessons } = await supabase
      .from('lessons')
      .select('id, course_id')
      .in('course_id', courseIds);

    const lessonCountMap = new Map<string, number>();
    for (const l of lessons || []) {
      lessonCountMap.set(l.course_id, (lessonCountMap.get(l.course_id) || 0) + 1);
    }

    // Get progress per course
    const { data: progress } = await supabase
      .from('lesson_progress')
      .select('course_id, lesson_id, completed')
      .eq('user_id', userId)
      .in('course_id', courseIds);

    const completedLessonsMap = new Map<string, number>();
    for (const p of progress || []) {
      if (p.completed) {
        completedLessonsMap.set(p.course_id, (completedLessonsMap.get(p.course_id) || 0) + 1);
      }
    }

    // Use enrollment updated_at as last access timestamp (updated on every course page open)
    const lastAccessMap = new Map<string, string>();
    for (const enrollment of uniqueEnrollments) {
      if (enrollment.course_id) {
        const updatedAt = (enrollment as any).updated_at;
        if (updatedAt) {
          lastAccessMap.set(enrollment.course_id, updatedAt);
        }
      }
    }

    const enrichedCourses = (courses || []).map((course) => {
      const enrollment = enrollmentByCourse.get(course.id);
      const totalLessons = lessonCountMap.get(course.id) || course.total_lessons || 0;
      const completedLessons = completedLessonsMap.get(course.id) || 0;
      const progressPct = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
      const moduleCount = moduleCountMap.get(course.id) || 0;

      return {
        ...course,
        module_count: moduleCount,
        lesson_count: totalLessons,
        completed_lessons: completedLessons,
        progress_pct: progressPct,
        enrolled_at: enrollment?.enrolled_at,
        granted_at: enrollment?.granted_at,
        access_origin: enrollment?.access_origin,
        last_accessed_at: lastAccessMap.get(course.id) || null,
      };
    })
    .sort((a, b) => {
      const aDate = new Date(a.granted_at || a.enrolled_at || 0).getTime();
      const bDate = new Date(b.granted_at || b.enrolled_at || 0).getTime();
      return bDate - aDate;
    });

    const inProgress = enrichedCourses.filter((c) => c.progress_pct > 0 && c.progress_pct < 100).length;
    const completed = enrichedCourses.filter((c) => c.progress_pct >= 100).length;

    return {
      courses: enrichedCourses,
      stats: {
        total: enrichedCourses.length,
        inProgress,
        completed,
      },
    };
  });

export const getRecommendedCourses = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;

    // 1. Get user's enrolled course IDs
    const { data: enrollments } = await supabase
      .from('enrollments')
      .select('course_id')
      .eq('user_id', userId)
      .eq('status', 'active');

    const enrolledIds = new Set((enrollments || []).map((e: any) => e.course_id));

    // 2. Get categories of enrolled courses
    const { data: enrolledCourses } = enrolledIds.size > 0
      ? await supabase
          .from('courses')
          .select('category_id')
          .in('id', Array.from(enrolledIds))
      : { data: [] };

    const userCategoryIds = new Set(
      (enrolledCourses || []).map((c: any) => c.category_id).filter(Boolean)
    );

    // 3. Get all published courses NOT enrolled by the user
    const { data: allCourses } = await supabase
      .from('courses')
      .select('id, title, cover_image_url, short_description, total_lessons, total_duration, category_id, status')
      .eq('status', 'published')
      .order('sort_order', { ascending: true });

    const available = (allCourses || []).filter((c: any) => !enrolledIds.has(c.id));

    // 4. Get popularity data (enrollment count per course)
    const { data: allEnrollments } = await supabase
      .from('enrollments')
      .select('course_id')
      .eq('status', 'active');

    const popularityMap = new Map<string, number>();
    for (const e of allEnrollments || []) {
      popularityMap.set(e.course_id, (popularityMap.get(e.course_id) || 0) + 1);
    }

    // 5. Score and rank
    const scored = available.map((course: any) => {
      let score = 0;
      // Same category as user's courses → +10
      if (course.category_id && userCategoryIds.has(course.category_id)) {
        score += 10;
      }
      // Popularity bonus
      score += (popularityMap.get(course.id) || 0);
      return { ...course, _score: score, enrollment_count: popularityMap.get(course.id) || 0 };
    });

    scored.sort((a: any, b: any) => b._score - a._score);

    // Return top 10
    const recommendations = scored.slice(0, 10).map(({ _score, ...rest }: any) => rest);

    return { recommendations };
  });

export const getMostAccessedCourses = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;

    // Use the access_count column directly
    const { data: courses } = await supabase
      .from('courses')
      .select('id, title, cover_image_url, short_description, total_lessons, total_duration, status, access_count')
      .eq('status', 'published')
      .gt('access_count', 0)
      .order('access_count', { ascending: false })
      .limit(10);

    const ranked = (courses || []).map((c: any) => ({
      ...c,
      access_count: c.access_count || 0,
    }));

    return { ranked };
  });
