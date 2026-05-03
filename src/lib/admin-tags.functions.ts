import { createServerFn } from '@tanstack/react-start';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { supabaseAdmin } from '@/integrations/supabase/client.server';

async function verifyAdmin(supabase: any, userId: string) {
  const { data: role } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .eq('role', 'admin')
    .maybeSingle();

  const { data: userData } = await supabase.auth.getUser();
  const isAdminEmail = userData?.user?.email?.toLowerCase() === 'renatonardin13@gmail.com';

  if (!role && !isAdminEmail) throw new Error('Não autorizado');
}

export const listAdminTags = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await verifyAdmin(context.supabase, context.userId);

    const { data: tags, error } = await supabaseAdmin
      .from('tags' as any)
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) throw new Error(error.message);
    return { tags: tags || [] };
  });

export const createTag = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: {
    name: string;
    slug: string;
    description?: string;
    color?: string;
  }) => input)
  .handler(async ({ data, context }) => {
    await verifyAdmin(context.supabase, context.userId);

    const { data: maxOrder } = await supabaseAdmin
      .from('tags' as any)
      .select('sort_order')
      .order('sort_order', { ascending: false })
      .limit(1)
      .single();

    const { data: tag, error } = await supabaseAdmin
      .from('tags' as any)
      .insert({
        name: data.name,
        slug: data.slug,
        description: data.description || null,
        color: data.color || null,
        sort_order: ((maxOrder as any)?.sort_order ?? 0) + 1,
      } as any)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return { tag };
  });

export const updateTag = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: {
    id: string;
    name?: string;
    slug?: string;
    description?: string;
    color?: string;
  }) => input)
  .handler(async ({ data, context }) => {
    await verifyAdmin(context.supabase, context.userId);

    const { id, ...updates } = data;
    const { error } = await supabaseAdmin
      .from('tags' as any)
      .update(updates as any)
      .eq('id', id);

    if (error) throw new Error(error.message);
    return { success: true };
  });

export const deleteTag = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data, context }) => {
    await verifyAdmin(context.supabase, context.userId);

    const { error } = await supabaseAdmin
      .from('tags' as any)
      .delete()
      .eq('id', data.id);

    if (error) throw new Error(error.message);
    return { success: true };
  });
