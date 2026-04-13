import { createServerFn } from '@tanstack/react-start';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';

export const getMyCoursesData = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;

    // Get only active enrollments for the authenticated user
    const { data: enrollments } = await supabase
      .from('enrollments')
      .select('course_id, progress_percentage, status, enrolled_at, access_origin, granted_at')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('granted_at', { ascending: false })
      .order('enrolled_at', { ascending: false });

    if (!enrollments || enrollments.length === 0) {
      return { courses: [], stats: { total: 0, inProgress: 0, completed: 0 } };
    }

    // Keep a single active access record per course
    const enrollmentByCourse = new Map<string, (typeof enrollments)[number]>();
    for (const enrollment of enrollments) {
      if (!enrollmentByCourse.has(enrollment.course_id)) {
        enrollmentByCourse.set(enrollment.course_id, enrollment);
      }
    }

    const uniqueEnrollments = Array.from(enrollmentByCourse.values());
    const courseIds = uniqueEnrollments.map((e) => e.course_id);

    // Get only courses that the user really has active access to
    const { data: courses } = await supabase
      .from('courses')
      .select('id, title, cover_image_url, short_description, total_lessons, total_duration, status')
      .in('id', courseIds);

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

    const enrichedCourses = (courses || []).map((course) => {
      const enrollment = enrollments.find((e) => e.course_id === course.id);
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
      };
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
