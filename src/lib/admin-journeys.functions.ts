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

export const listAdminJourneys = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await verifyAdmin(context.supabase, context.userId);

    const { data: journeys, error } = await supabaseAdmin
      .from('journeys')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) throw new Error(error.message);
    return { journeys: journeys || [] };
  });

export const createJourney = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: {
    name: string;
    slug: string;
    icon?: string;
    description?: string;
  }) => input)
  .handler(async ({ data, context }) => {
    await verifyAdmin(context.supabase, context.userId);

    const { data: maxOrder } = await supabaseAdmin
      .from('journeys')
      .select('sort_order')
      .order('sort_order', { ascending: false })
      .limit(1)
      .single();

    const { data: journey, error } = await supabaseAdmin
      .from('journeys')
      .insert({
        name: data.name,
        slug: data.slug,
        icon: data.icon || '✨',
        description: data.description || null,
        sort_order: (maxOrder?.sort_order ?? 0) + 1,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return { journey };
  });

export const updateJourney = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: {
    id: string;
    name?: string;
    slug?: string;
    icon?: string;
    description?: string;
  }) => input)
  .handler(async ({ data, context }) => {
    await verifyAdmin(context.supabase, context.userId);

    const { id, ...updates } = data;
    const { error } = await supabaseAdmin
      .from('journeys')
      .update(updates)
      .eq('id', id);

    if (error) throw new Error(error.message);
    return { success: true };
  });

export const deleteJourney = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data, context }) => {
    await verifyAdmin(context.supabase, context.userId);

    const { error } = await supabaseAdmin
      .from('journeys')
      .delete()
      .eq('id', data.id);

    if (error) throw new Error(error.message);
    return { success: true };
  });

export const reorderJourneys = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { orderedIds: string[] }) => input)
  .handler(async ({ data, context }) => {
    await verifyAdmin(context.supabase, context.userId);

    const updates = data.orderedIds.map((id, index) =>
      supabaseAdmin
        .from('journeys')
        .update({ sort_order: index })
        .eq('id', id)
    );

    await Promise.all(updates);
    return { success: true };
  });
