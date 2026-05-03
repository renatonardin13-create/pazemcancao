import { createServerFn } from '@tanstack/react-start';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { supabaseAdmin } from '@/integrations/supabase/client.server';

export const listLessonMaterials = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { lessonId: string }) => input)
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: materials, error } = await supabase
      .from('lesson_materials')
      .select('*')
      .eq('lesson_id', data.lessonId)
      .order('sort_order', { ascending: true });

    if (error) throw new Error(error.message);
    return { materials: materials || [] };
  });

export const createLessonMaterial = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { lessonId: string; title: string; material_type: string; url: string }) => input)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: role } = await supabase
      .from('user_roles').select('role').eq('user_id', userId).eq('role', 'admin').maybeSingle();
    if (!role) throw new Error('Não autorizado');

    const { data: existing } = await supabaseAdmin
      .from('lesson_materials')
      .select('sort_order')
      .eq('lesson_id', data.lessonId)
      .order('sort_order', { ascending: false })
      .limit(1);

    const nextOrder = existing && existing.length > 0 ? (existing[0] as any).sort_order + 1 : 0;

    const { data: material, error } = await supabaseAdmin
      .from('lesson_materials')
      .insert({
        lesson_id: data.lessonId,
        title: data.title,
        material_type: data.material_type,
        url: data.url,
        sort_order: nextOrder,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return { material };
  });

export const deleteLessonMaterial = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: role } = await supabase
      .from('user_roles').select('role').eq('user_id', userId).eq('role', 'admin').maybeSingle();
    if (!role) throw new Error('Não autorizado');

    const { error } = await supabaseAdmin.from('lesson_materials').delete().eq('id', data.id);
    if (error) throw new Error(error.message);
    return { success: true };
  });
