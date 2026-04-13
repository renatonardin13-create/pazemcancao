import { createServerFn } from '@tanstack/react-start';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { supabaseAdmin } from '@/integrations/supabase/client.server';

// ─── Modules ───

export const listModules = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { courseId: string }) => input)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: role } = await supabase
      .from('user_roles').select('role').eq('user_id', userId).eq('role', 'admin').maybeSingle();
    if (!role) throw new Error('Não autorizado');

    const { data: modules, error } = await supabaseAdmin
      .from('modules')
      .select('*, lessons(id, title, sort_order, duration, is_free_preview, video_url, content_url, content_type, description, module_id)')
      .eq('course_id', data.courseId)
      .order('sort_order', { ascending: true });

    if (error) throw new Error(error.message);

    // Sort lessons inside each module
    const sorted = (modules || []).map((m: any) => ({
      ...m,
      lessons: (m.lessons || []).sort((a: any, b: any) => a.sort_order - b.sort_order),
    }));

    return { modules: sorted };
  });

export const createModule = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { courseId: string; title: string; description?: string; status?: string; thumbnail_url?: string }) => input)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: role } = await supabase
      .from('user_roles').select('role').eq('user_id', userId).eq('role', 'admin').maybeSingle();
    if (!role) throw new Error('Não autorizado');

    // Get max sort_order
    const { data: existing } = await supabaseAdmin
      .from('modules')
      .select('sort_order')
      .eq('course_id', data.courseId)
      .order('sort_order', { ascending: false })
      .limit(1);

    const nextOrder = existing && existing.length > 0 ? existing[0].sort_order + 1 : 0;

    const { data: mod, error } = await supabaseAdmin
      .from('modules')
      .insert({
        course_id: data.courseId,
        title: data.title,
        description: data.description || null,
        sort_order: nextOrder,
        status: data.status || 'published',
        thumbnail_url: data.thumbnail_url || null,
      } as any)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return { module: mod };
  });

export const updateModule = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string; title?: string; description?: string; status?: string; sort_order?: number }) => input)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: role } = await supabase
      .from('user_roles').select('role').eq('user_id', userId).eq('role', 'admin').maybeSingle();
    if (!role) throw new Error('Não autorizado');

    const { id, ...updates } = data;
    const { data: mod, error } = await supabaseAdmin
      .from('modules')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return { module: mod };
  });

export const deleteModule = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: role } = await supabase
      .from('user_roles').select('role').eq('user_id', userId).eq('role', 'admin').maybeSingle();
    if (!role) throw new Error('Não autorizado');

    const { error } = await supabaseAdmin.from('modules').delete().eq('id', data.id);
    if (error) throw new Error(error.message);
    return { success: true };
  });

export const reorderModules = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { items: { id: string; sort_order: number }[] }) => input)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: role } = await supabase
      .from('user_roles').select('role').eq('user_id', userId).eq('role', 'admin').maybeSingle();
    if (!role) throw new Error('Não autorizado');

    for (const item of data.items) {
      await supabaseAdmin.from('modules').update({ sort_order: item.sort_order }).eq('id', item.id);
    }
    return { success: true };
  });

// ─── Lessons (module-aware) ───

export const createLesson = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: {
    courseId: string;
    moduleId: string;
    title: string;
    description?: string;
    video_url?: string;
    content_url?: string;
    content_type?: string;
    is_free_preview?: boolean;
    duration?: string;
  }) => input)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: role } = await supabase
      .from('user_roles').select('role').eq('user_id', userId).eq('role', 'admin').maybeSingle();
    if (!role) throw new Error('Não autorizado');

    const { data: existing } = await supabaseAdmin
      .from('lessons')
      .select('sort_order')
      .eq('module_id', data.moduleId)
      .order('sort_order', { ascending: false })
      .limit(1);

    const nextOrder = existing && existing.length > 0 ? existing[0].sort_order + 1 : 0;

    const { data: lesson, error } = await supabaseAdmin
      .from('lessons')
      .insert({
        course_id: data.courseId,
        module_id: data.moduleId,
        title: data.title,
        description: data.description || null,
        video_url: data.video_url || null,
        content_url: data.content_url || null,
        content_type: data.content_type || 'video',
        is_free_preview: data.is_free_preview ?? false,
        duration: data.duration || '0:00',
        sort_order: nextOrder,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return { lesson };
  });

export const updateLesson = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: {
    id: string;
    title?: string;
    description?: string;
    video_url?: string;
    content_url?: string;
    content_type?: string;
    is_free_preview?: boolean;
    duration?: string;
    sort_order?: number;
    module_id?: string;
  }) => input)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: role } = await supabase
      .from('user_roles').select('role').eq('user_id', userId).eq('role', 'admin').maybeSingle();
    if (!role) throw new Error('Não autorizado');

    const { id, ...updates } = data;
    const { data: lesson, error } = await supabaseAdmin
      .from('lessons')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return { lesson };
  });

export const deleteLesson = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: role } = await supabase
      .from('user_roles').select('role').eq('user_id', userId).eq('role', 'admin').maybeSingle();
    if (!role) throw new Error('Não autorizado');

    const { error } = await supabaseAdmin.from('lessons').delete().eq('id', data.id);
    if (error) throw new Error(error.message);
    return { success: true };
  });

export const reorderLessons = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { items: { id: string; sort_order: number }[] }) => input)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: role } = await supabase
      .from('user_roles').select('role').eq('user_id', userId).eq('role', 'admin').maybeSingle();
    if (!role) throw new Error('Não autorizado');

    for (const item of data.items) {
      await supabaseAdmin.from('lessons').update({ sort_order: item.sort_order }).eq('id', item.id);
    }
    return { success: true };
  });
