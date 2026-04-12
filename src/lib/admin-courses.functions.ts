import { createServerFn } from '@tanstack/react-start';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { supabaseAdmin } from '@/integrations/supabase/client.server';

export const listAdminCourses = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;

    const { data: role } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .maybeSingle();

    if (!role) throw new Error('Não autorizado');

    const { data: courses, error } = await supabaseAdmin
      .from('courses')
      .select('*, categories(name, slug, icon), modules(id, lessons(id))')
      .order('sort_order', { ascending: true });

    // Compute module/lesson counts
    const enriched = (courses || []).map((c: any) => {
      const mods = c.modules || [];
      const modulesCount = mods.length;
      const lessonsCount = mods.reduce((sum: number, m: any) => sum + (m.lessons?.length || 0), 0);
      const { modules: _m, ...rest } = c;
      return { ...rest, modules_count: modulesCount, lessons_count: lessonsCount };
    });

    if (error) throw new Error(error.message);
    return { courses: enriched };
  });

export const getAdminCourse = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { courseId: string }) => input)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: role } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .maybeSingle();

    if (!role) throw new Error('Não autorizado');

    const { data: course, error } = await supabaseAdmin
      .from('courses')
      .select('*, categories(name, slug, icon), lessons(*)')
      .eq('id', data.courseId)
      .single();

    if (error) throw new Error(error.message);
    return { course };
  });

export const createCourse = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: {
    title: string;
    short_description?: string;
    full_description?: string;
    cover_image_url?: string;
    banner_image_url?: string;
    category_id?: string;
    price?: number;
    status?: string;
    course_type?: string;
    launch_date?: string;
  }) => input)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: role } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .maybeSingle();

    if (!role) throw new Error('Não autorizado');

    const { data: course, error } = await supabaseAdmin
      .from('courses')
      .insert({
        title: data.title,
        short_description: data.short_description || null,
        full_description: data.full_description || null,
        cover_image_url: data.cover_image_url || null,
        banner_image_url: data.banner_image_url || null,
        category_id: data.category_id || null,
        price: data.price ?? 0,
        status: data.status || 'draft',
        course_type: data.course_type || 'video',
        launch_date: data.launch_date || null,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return { course };
  });

export const updateCourse = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: {
    id: string;
    title?: string;
    short_description?: string;
    full_description?: string;
    cover_image_url?: string;
    banner_image_url?: string;
    category_id?: string | null;
    price?: number;
    status?: string;
    course_type?: string;
    launch_date?: string | null;
  }) => input)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: role } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .maybeSingle();

    if (!role) throw new Error('Não autorizado');

    const { id, ...updates } = data;

    const { data: course, error } = await supabaseAdmin
      .from('courses')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return { course };
  });

export const deleteCourse = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: role } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .maybeSingle();

    if (!role) throw new Error('Não autorizado');

    const { error } = await supabaseAdmin
      .from('courses')
      .delete()
      .eq('id', data.id);

    if (error) throw new Error(error.message);
    return { success: true };
  });

export const listAdminCategories = createServerFn({ method: 'POST' })
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
