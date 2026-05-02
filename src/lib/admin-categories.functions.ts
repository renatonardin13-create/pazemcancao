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

export const listAdminCategories = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { areaId?: string } | void) => input)
  .handler(async ({ data, context }) => {
    await verifyAdmin(context.supabase, context.userId);

    let query = supabaseAdmin
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true });

    if (data?.areaId) {
      query = query.eq('area_id', data.areaId);
    }

    const { data: categories, error } = await query;

    if (error) throw new Error(error.message);
    return { categories: categories || [] };
  });

export const createCategory = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: {
    name: string;
    slug: string;
    description?: string;
    icon?: string;
    color?: string;
  }) => input)
  .handler(async ({ data, context }) => {
    await verifyAdmin(context.supabase, context.userId);

    const { data: maxOrder } = await supabaseAdmin
      .from('categories')
      .select('sort_order')
      .order('sort_order', { ascending: false })
      .limit(1)
      .single();

    const { data: category, error } = await supabaseAdmin
      .from('categories')
      .insert({
        name: data.name,
        slug: data.slug,
        description: data.description || null,
        icon: data.icon || null,
        color: data.color || null,
        sort_order: (maxOrder?.sort_order ?? 0) + 1,
      } as any)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return { category };
  });

export const updateCategory = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: {
    id: string;
    name?: string;
    slug?: string;
    description?: string;
    icon?: string;
    color?: string;
    is_featured?: boolean;
  }) => input)
  .handler(async ({ data, context }) => {
    await verifyAdmin(context.supabase, context.userId);

    const { id, ...updates } = data;
    const { error } = await supabaseAdmin
      .from('categories')
      .update(updates as any)
      .eq('id', id);

    if (error) throw new Error(error.message);
    return { success: true };
  });

export const deleteCategory = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data, context }) => {
    await verifyAdmin(context.supabase, context.userId);

    const { error } = await supabaseAdmin
      .from('categories')
      .delete()
      .eq('id', data.id);

    if (error) throw new Error(error.message);
    return { success: true };
  });

export const reorderCategories = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { orderedIds: string[] }) => input)
  .handler(async ({ data, context }) => {
    await verifyAdmin(context.supabase, context.userId);

    const updates = data.orderedIds.map((id, index) =>
      supabaseAdmin
        .from('categories')
        .update({ sort_order: index })
        .eq('id', id)
    );

    await Promise.all(updates);
    return { success: true };
  });
