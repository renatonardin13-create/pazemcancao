import { createServerFn } from '@tanstack/react-start';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { supabaseAdmin } from '@/integrations/supabase/client.server';

export const listModules = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { data: { courseId: string } }) => input)
  .handler(async ({ data }) => {
    const { data: modules, error } = await supabaseAdmin
      .from('modules')
      .select('*, lessons(*)')
      .eq('course_id', data.data.courseId)
      .order('sort_order', { ascending: true });

    if (error) throw new Error(error.message);
    
    // Sort lessons within modules
    const sortedModules = (modules || []).map(m => ({
      ...m,
      lessons: (m.lessons || []).sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0))
    }));

    return { modules: sortedModules };
  });

export const createModule = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { data: { courseId: string, title: string, description?: string, status?: string, thumbnail_url?: string } }) => input)
  .handler(async ({ data }) => {
    const { data: module, error } = await supabaseAdmin
      .from('modules')
      .insert({
        course_id: data.data.courseId,
        title: data.data.title,
        description: data.data.description || null,
        status: data.data.status || 'draft',
        thumbnail_url: data.data.thumbnail_url || null
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return { module };
  });

export const updateModule = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { data: { id: string, title?: string, description?: string | null, status?: string, thumbnail_url?: string } }) => input)
  .handler(async ({ data }) => {
    const { id, ...updates } = data.data;
    const { data: module, error } = await supabaseAdmin
      .from('modules')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return { module };
  });

export const deleteModule = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { data: { id: string } }) => input)
  .handler(async ({ data }) => {
    const { error } = await supabaseAdmin
      .from('modules')
      .delete()
      .eq('id', data.data.id);

    if (error) throw new Error(error.message);
    return { success: true };
  });

export const reorderModules = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { data: { items: { id: string, sort_order: number }[] } }) => input)
  .handler(async ({ data }) => {
    for (const item of data.data.items) {
      await supabaseAdmin.from('modules').update({ sort_order: item.sort_order }).eq('id', item.id);
    }
    return { success: true };
  });

export const createLesson = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { data: { courseId: string, moduleId: string, title: string, description?: string, video_url?: string, content_url?: string, content_type?: string, is_free_preview?: boolean, duration?: string, thumbnail_url?: string, status?: string } }) => input)
  .handler(async ({ data }) => {
    const { data: lesson, error } = await supabaseAdmin
      .from('lessons')
      .insert({
        course_id: data.data.courseId,
        module_id: data.data.moduleId,
        title: data.data.title,
        description: data.data.description || null,
        video_url: data.data.video_url || null,
        content_url: data.data.content_url || null,
        content_type: data.data.content_type || 'video',
        is_free_preview: data.data.is_free_preview || false,
        duration: data.data.duration || '0:00',
        thumbnail_url: data.data.thumbnail_url || null,
        status: data.data.status || 'draft'
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return { lesson };
  });

export const updateLesson = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { data: { id: string, title?: string, description?: string | null, video_url?: string | null, content_url?: string | null, content_type?: string, is_free_preview?: boolean, duration?: string, thumbnail_url?: string | null, status?: string } }) => input)
  .handler(async ({ data }) => {
    const { id, ...updates } = data.data;
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
  .inputValidator((input: { data: { id: string } }) => input)
  .handler(async ({ data }) => {
    const { error } = await supabaseAdmin
      .from('lessons')
      .delete()
      .eq('id', data.data.id);

    if (error) throw new Error(error.message);
    return { success: true };
  });

export const reorderLessons = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { data: { items: { id: string, sort_order: number }[] } }) => input)
  .handler(async ({ data }) => {
    for (const item of data.data.items) {
      await supabaseAdmin.from('lessons').update({ sort_order: item.sort_order }).eq('id', item.id);
    }
    return { success: true };
  });
