import { createServerFn } from '@tanstack/react-start';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';

/**
 * Resolves which lesson to open for a given course:
 * 1. If user has progress → last watched lesson
 * 2. If no progress → first published lesson (by module sort_order, then lesson sort_order)
 */
export const resolveCourseLesson = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { courseId: string }) => input)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    // Get all published lessons ordered by module sort_order then lesson sort_order
    const { data: lessons } = await supabase
      .from('lessons')
      .select('id, title, sort_order, module_id, is_free_preview')
      .eq('course_id', data.courseId)
      .eq('status', 'published')
      .order('sort_order', { ascending: true });

    if (!lessons || lessons.length === 0) {
      return { lessonId: null };
    }

    // Get modules to sort lessons by module order first
    const { data: modules } = await supabase
      .from('modules')
      .select('id, sort_order')
      .eq('course_id', data.courseId)
      .eq('status', 'published')
      .order('sort_order', { ascending: true });

    const moduleOrderMap = new Map<string, number>();
    for (const m of modules || []) {
      moduleOrderMap.set(m.id, m.sort_order);
    }

    // Sort lessons: by module sort_order first, then lesson sort_order
    const sortedLessons = [...lessons].sort((a, b) => {
      const aModuleOrder = a.module_id ? (moduleOrderMap.get(a.module_id) ?? 999) : -1;
      const bModuleOrder = b.module_id ? (moduleOrderMap.get(b.module_id) ?? 999) : -1;
      if (aModuleOrder !== bModuleOrder) return aModuleOrder - bModuleOrder;
      return a.sort_order - b.sort_order;
    });

    // Check user progress - find last watched lesson
    const { data: progress } = await supabase
      .from('lesson_progress')
      .select('lesson_id, watched_seconds, completed, updated_at')
      .eq('course_id', data.courseId)
      .eq('user_id', userId);

    if (progress && progress.length > 0) {
      // Find the first incomplete lesson, or the last one with progress
      const progressMap = new Map(progress.map(p => [p.lesson_id, p]));
      
      // Find first non-completed lesson that has progress (continue where left off)
      const lastWatched = progress
        .filter(p => !p.completed)
        .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())[0];

      if (lastWatched) {
        return { lessonId: lastWatched.lesson_id };
      }

      // All watched lessons are completed - find first uncompleted lesson
      const firstUncompleted = sortedLessons.find(l => !progressMap.has(l.id) || !progressMap.get(l.id)?.completed);
      if (firstUncompleted) {
        return { lessonId: firstUncompleted.id };
      }

      // All lessons completed - return first lesson
      return { lessonId: sortedLessons[0].id };
    }

    // No progress at all - return first lesson
    return { lessonId: sortedLessons[0].id };
  });
