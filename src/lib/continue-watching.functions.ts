import { createServerFn } from '@tanstack/react-start';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';

export const getContinueWatching = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;

    // Get user's lesson progress ordered by most recent activity
    const { data: progressData } = await supabase
      .from('lesson_progress')
      .select('course_id, lesson_id, completed, updated_at')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (!progressData || progressData.length === 0) {
      return { courses: [] };
    }

    // Group by course: find last accessed lesson and compute progress
    const courseMap = new Map<string, {
      lastLessonId: string;
      lastAccessedAt: string;
      completedCount: number;
      totalTracked: number;
    }>();

    for (const p of progressData) {
      const existing = courseMap.get(p.course_id);
      if (!existing) {
        courseMap.set(p.course_id, {
          lastLessonId: p.lesson_id,
          lastAccessedAt: p.updated_at,
          completedCount: p.completed ? 1 : 0,
          totalTracked: 1,
        });
      } else {
        if (p.completed) existing.completedCount++;
        existing.totalTracked++;
      }
    }

    const courseIds = Array.from(courseMap.keys());

    // Only keep courses with active enrollments
    const { data: enrollments } = await supabase
      .from('enrollments')
      .select('course_id, status, expires_at')
      .eq('user_id', userId)
      .in('course_id', courseIds)
      .eq('status', 'active');

    const activeEnrolledIds = new Set(
      (enrollments || [])
        .filter((e: any) => !e.expires_at || new Date(e.expires_at) >= new Date())
        .map((e: any) => e.course_id)
    );

    // Get course details
    const { data: courses } = await supabase
      .from('courses')
      .select('id, title, cover_image_url, banner_image_url, short_description, total_lessons, status')
      .in('id', courseIds)
      .eq('status', 'published');

    // Get total lessons per course for accurate progress
    const { data: allLessons } = await supabase
      .from('lessons')
      .select('id, course_id, sort_order, title, status')
      .in('course_id', courseIds)
      .eq('status', 'published')
      .order('sort_order', { ascending: true });

    const lessonsByCourse = new Map<string, any[]>();
    for (const l of allLessons || []) {
      const arr = lessonsByCourse.get(l.course_id) || [];
      arr.push(l);
      lessonsByCourse.set(l.course_id, arr);
    }

    // Build enriched list
    const result = (courses || [])
      .filter((c: any) => activeEnrolledIds.has(c.id))
      .map((course: any) => {
        const info = courseMap.get(course.id)!;
        const courseLessons = lessonsByCourse.get(course.id) || [];
        const totalLessons = courseLessons.length;
        const completedLessons = info.completedCount;
        const progressPct = totalLessons > 0
          ? Math.round((completedLessons / totalLessons) * 100)
          : 0;

        // Don't show completed courses (100%)
        if (progressPct >= 100) return null;
        // Don't show if 0% (no real progress)
        if (progressPct === 0 && completedLessons === 0) {
          // Check if user actually watched something (has progress records but none completed)
          const hasAnyProgress = progressData.some(
            (p) => p.course_id === course.id
          );
          if (!hasAnyProgress) return null;
        }

        // Find the next lesson to watch: first non-completed lesson
        const completedLessonIds = new Set(
          progressData
            .filter((p) => p.course_id === course.id && p.completed)
            .map((p) => p.lesson_id)
        );

        let resumeLessonId = info.lastLessonId;
        // If last lesson is completed, find next uncompleted
        if (completedLessonIds.has(resumeLessonId)) {
          const nextLesson = courseLessons.find(
            (l: any) => !completedLessonIds.has(l.id)
          );
          if (nextLesson) {
            resumeLessonId = nextLesson.id;
          }
        }

        return {
          ...course,
          progress_pct: progressPct,
          total_lessons: totalLessons,
          completed_lessons: completedLessons,
          last_accessed_at: info.lastAccessedAt,
          resume_lesson_id: resumeLessonId,
          access_state: 'in_progress',
        };
      })
      .filter(Boolean)
      .sort((a: any, b: any) =>
        new Date(b.last_accessed_at).getTime() - new Date(a.last_accessed_at).getTime()
      )
      .slice(0, 10);

    return { courses: result };
  });
