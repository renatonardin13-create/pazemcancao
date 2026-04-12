import { createServerFn } from '@tanstack/react-start';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { supabaseAdmin } from '@/integrations/supabase/client.server';

export const listPublishedCourses = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;

    const { data: courses, error } = await supabase
      .from('courses')
      .select('*, categories(name, slug, icon)')
      .eq('status', 'published')
      .order('sort_order', { ascending: true });

    if (error) throw new Error(error.message);

    return { courses: courses || [] };
  });

export const listCategories = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;

    const { data: categories, error } = await supabase
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) throw new Error(error.message);

    return { categories: categories || [] };
  });

export const getCourseDetail = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { courseId: string }) => input)
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

    const { data: course, error } = await supabase
      .from('courses')
      .select('*, categories(name, slug, icon)')
      .eq('id', data.courseId)
      .single();

    if (error) throw new Error(error.message);

    const { data: lessons } = await supabase
      .from('lessons')
      .select('*')
      .eq('course_id', data.courseId)
      .order('sort_order', { ascending: true });

    const { data: modules } = await supabase
      .from('modules')
      .select('id, title, description, sort_order, status')
      .eq('course_id', data.courseId)
      .order('sort_order', { ascending: true });

    const { data: progress } = await supabase
      .from('lesson_progress')
      .select('*')
      .eq('course_id', data.courseId)
      .eq('user_id', userId);

    const { data: enrollment } = await supabase
      .from('enrollments')
      .select('*')
      .eq('course_id', data.courseId)
      .eq('user_id', userId)
      .eq('status', 'active')
      .maybeSingle();

    const { data: integration } = await supabaseAdmin
      .from('course_integrations')
      .select('is_enabled, checkout_url, external_product_name')
      .eq('course_id', data.courseId)
      .maybeSingle();

    const hasFreePreview = (lessons || []).some((lesson: any) => lesson.is_free_preview);
    const checkoutUrl = integration?.is_enabled ? integration.checkout_url || null : null;

    return {
      course,
      lessons: lessons || [],
      modules: modules || [],
      progress: progress || [],
      enrollment,
      integration: checkoutUrl
        ? {
            checkout_url: checkoutUrl,
            external_product_name: integration?.external_product_name || null,
          }
        : null,
      access: {
        isAdmin,
        canAccessCourse: isAdmin || !!enrollment,
        hasFreePreview,
        previewLessonsCount: (lessons || []).filter((lesson: any) => lesson.is_free_preview).length,
        hasCheckout: !!checkoutUrl,
      },
    };
  });

export const updateLessonProgress = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: {
    courseId: string;
    lessonId: string;
    watchedSeconds: number;
    completed: boolean;
  }) => input)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: existing } = await supabase
      .from('lesson_progress')
      .select('id')
      .eq('lesson_id', data.lessonId)
      .eq('user_id', userId)
      .maybeSingle();

    if (existing) {
      await supabase
        .from('lesson_progress')
        .update({
          watched_seconds: data.watchedSeconds,
          completed: data.completed,
          completed_at: data.completed ? new Date().toISOString() : null,
        })
        .eq('id', existing.id);
    } else {
      await supabase.from('lesson_progress').insert({
        course_id: data.courseId,
        lesson_id: data.lessonId,
        user_id: userId,
        watched_seconds: data.watchedSeconds,
        completed: data.completed,
        completed_at: data.completed ? new Date().toISOString() : null,
      });
    }

    return { success: true };
  });

export const enrollInCourse = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { courseId: string }) => input)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: existing } = await supabase
      .from('enrollments')
      .select('id')
      .eq('course_id', data.courseId)
      .eq('user_id', userId)
      .maybeSingle();

    if (existing) return { enrollment: existing };

    const { data: enrollment, error } = await supabase
      .from('enrollments')
      .insert({
        course_id: data.courseId,
        user_id: userId,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return { enrollment };
  });
