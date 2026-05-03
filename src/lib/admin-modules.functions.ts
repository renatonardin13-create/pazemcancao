import { createServerFn } from '@tanstack/react-start';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { supabaseAdmin } from '@/integrations/supabase/client.server';

export const listAdminModules = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { courseId: string }) => input)
  .handler(async ({ data, context }) => {
    const { data: modules, error } = await supabaseAdmin
      .from('modules')
      .select('*, lessons(*)')
      .eq('course_id', data.courseId)
      .order('sort_order', { ascending: true });

    if (error) throw new Error(error.message);
    return { modules: modules || [] };
  });

export const createModule = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { courseId: string, title: string, description?: string, sort_order?: number, status?: string }) => input)
  .handler(async ({ data }) => {
    const { data: module, error } = await supabaseAdmin
      .from('modules')
      .insert({
        course_id: data.courseId,
        title: data.title,
        description: data.description || null,
        sort_order: data.sort_order ?? 0,
        status: data.status || 'draft'
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return { module };
  });

export const updateModule = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string, title?: string, description?: string | null, sort_order?: number, status?: string }) => input)
  .handler(async ({ data }) => {
    const { id, ...updates } = data;
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
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data }) => {
    const { error } = await supabaseAdmin
      .from('modules')
      .delete()
      .eq('id', data.id);

    if (error) throw new Error(error.message);
    return { success: true };
  });
