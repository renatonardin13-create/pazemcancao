import { createServerFn } from '@tanstack/react-start';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { supabaseAdmin } from '@/integrations/supabase/client.server';

export const getLessonDetail = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { courseId: string; lessonId: string }) => input)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: userData } = await supabase.auth.getUser();
    const email = userData?.user?.email?.toLowerCase();

    const { data: adminRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .maybeSingle();

    const isAdmin = !!adminRole || email === 'renatonardin13@gmail.com';

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
      .select('id, title, description, sort_order, duration, module_id, video_url, content_url, content_type, is_free_preview')
      .eq('course_id', data.courseId)
      .order('sort_order', { ascending: true });

    const lessons = allLessons || [];

    // Current lesson
    const currentLesson = lessons.find((l: any) => l.id === data.lessonId);
    if (!currentLesson) throw new Error('Aula não encontrada');

    const canAccessCourse = isAdmin || !!enrollment;
    const canAccessLesson = canAccessCourse || !!currentLesson.is_free_preview;

    // Full lesson data
    const lessonFull = canAccessLesson
      ? (
          await supabase
            .from('lessons')
            .select('*')
            .eq('id', data.lessonId)
            .single()
        ).data
      : currentLesson;

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
    const { data: lessonMaterials } = canAccessLesson
      ? await supabase
          .from('lesson_materials')
          .select('id, title, material_type, url, sort_order')
          .eq('lesson_id', data.lessonId)
          .order('sort_order', { ascending: true })
      : { data: [] };

    const { data: integration } = await supabaseAdmin
      .from('course_integrations')
      .select('is_enabled, checkout_url, external_product_name')
      .eq('course_id', data.courseId)
      .maybeSingle();

    const checkoutUrl = integration?.is_enabled ? integration.checkout_url || null : null;

    const accessibleLessons = canAccessCourse
      ? lessons
      : lessons.filter((lesson: any) => lesson.is_free_preview);

    // Find prev/next
    const currentIndex = accessibleLessons.findIndex((l: any) => l.id === data.lessonId);
    const prevLesson = currentIndex > 0 ? accessibleLessons[currentIndex - 1] : null;
    const nextLesson = currentIndex < accessibleLessons.length - 1 ? accessibleLessons[currentIndex + 1] : null;

    // Group lessons by module
    const moduleMap: Record<string, any[]> = {};
    const unmoduled: any[] = [];
    for (const l of accessibleLessons) {
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
      totalLessons: accessibleLessons.length,
      materials: lessonMaterials || [],
      accessRestricted: !canAccessLesson,
      canAccessCourse,
      canAccessLesson,
      checkoutUrl,
      integration: checkoutUrl
        ? {
            checkout_url: checkoutUrl,
            external_product_name: integration?.external_product_name || null,
          }
        : null,
    };
  });
