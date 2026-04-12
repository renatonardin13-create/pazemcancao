import { createServerFn } from '@tanstack/react-start';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';

export const getLessonDetail = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { courseId: string; lessonId: string }) => input)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    // Course
    const { data: course, error: courseErr } = await supabase
      .from('courses')
      .select('id, title, cover_image_url, status')
      .eq('id', data.courseId)
      .single();

    if (courseErr || !course) throw new Error('Curso não encontrado');

    // Enrollment check
    const { data: enrollment } = await supabase
      .from('enrollments')
      .select('id, status')
      .eq('course_id', data.courseId)
      .eq('user_id', userId)
      .eq('status', 'active')
      .maybeSingle();

    // All lessons ordered
    const { data: allLessons } = await supabase
      .from('lessons')
      .select('id, title, sort_order, duration, module_id, video_url, content_url, content_type, is_free_preview')
      .eq('course_id', data.courseId)
      .order('sort_order', { ascending: true });

    const lessons = allLessons || [];

    // Current lesson
    const currentLesson = lessons.find((l: any) => l.id === data.lessonId);
    if (!currentLesson) throw new Error('Aula não encontrada');

    // Full lesson data
    const { data: lessonFull } = await supabase
      .from('lessons')
      .select('*')
      .eq('id', data.lessonId)
      .single();

    // Modules for this course
    const { data: modules } = await supabase
      .from('modules')
      .select('id, title, sort_order, status')
      .eq('course_id', data.courseId)
      .order('sort_order', { ascending: true });

    // All progress for this course
    const { data: progress } = await supabase
      .from('lesson_progress')
      .select('lesson_id, completed, watched_seconds')
      .eq('course_id', data.courseId)
      .eq('user_id', userId);

    // Supplementary materials for this lesson
    const { data: lessonMaterials } = await supabase
      .from('lesson_materials')
      .select('id, title, material_type, url, sort_order')
      .eq('lesson_id', data.lessonId)
      .order('sort_order', { ascending: true });

    // Find prev/next
    const currentIndex = lessons.findIndex((l: any) => l.id === data.lessonId);
    const prevLesson = currentIndex > 0 ? lessons[currentIndex - 1] : null;
    const nextLesson = currentIndex < lessons.length - 1 ? lessons[currentIndex + 1] : null;

    // Group lessons by module
    const moduleMap: Record<string, any[]> = {};
    const unmoduled: any[] = [];
    for (const l of lessons) {
      if (l.module_id) {
        if (!moduleMap[l.module_id]) moduleMap[l.module_id] = [];
        moduleMap[l.module_id].push(l);
      } else {
        unmoduled.push(l);
      }
    }

    const completedCount = (progress || []).filter((p: any) => p.completed).length;

    return {
      course,
      lesson: lessonFull,
      lessons,
      modules: modules || [],
      moduleMap,
      unmoduled,
      progress: progress || [],
      enrollment,
      prevLesson,
      nextLesson,
      currentIndex,
      completedCount,
      totalLessons: lessons.length,
      materials: lessonMaterials || [],
    };
  });
