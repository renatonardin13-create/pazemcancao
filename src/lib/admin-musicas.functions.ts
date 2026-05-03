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

export const listAdminMusicas = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: {
    produto_id: string;
    page?: number;
    pageSize?: number;
    search?: string;
    category?: string;
  }) => input)
  .handler(async ({ data, context }) => {
    await verifyAdmin(context.supabase, context.userId);

    const page = data.page || 1;
    const pageSize = data.pageSize || 50;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabaseAdmin
      .from('musicas')
      .select('*', { count: 'exact' })
      .eq('produto_id', data.produto_id);

    if (data.search) {
      query = query.ilike('titulo', `%${data.search}%`);
    }
    if (data.category && data.category !== 'all') {
      query = query.eq('categoria', data.category);
    }

    const { data: musicas, error, count } = await query
      .order('ordem', { ascending: true })
      .range(from, to);

    if (error) throw new Error(error.message);
    return { musicas: musicas || [], total: count || 0, page, pageSize };
  });

export const createMusica = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: {
    produto_id: string;
    titulo: string;
    artista?: string;
    capa_url?: string;
    audio_url: string;
    categoria?: string;
    destaque?: boolean;
    ordem?: number;
  }) => input)
  .handler(async ({ data, context }) => {
    await verifyAdmin(context.supabase, context.userId);

    const { data: musica, error } = await supabaseAdmin
      .from('musicas')
      .insert({
        produto_id: data.produto_id,
        titulo: data.titulo,
        artista: data.artista || null,
        capa_url: data.capa_url || null,
        audio_url: data.audio_url,
        categoria: data.categoria || null,
        destaque: data.destaque || false,
        ordem: data.ordem ?? 0,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return { musica };
  });

export const updateMusica = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: {
    id: string;
    titulo?: string;
    artista?: string;
    capa_url?: string;
    audio_url?: string;
    categoria?: string;
    destaque?: boolean;
    ordem?: number;
  }) => input)
  .handler(async ({ data, context }) => {
    await verifyAdmin(context.supabase, context.userId);

    const { id, ...updates } = data;
    const { error } = await supabaseAdmin
      .from('musicas')
      .update(updates)
      .eq('id', id);

    if (error) throw new Error(error.message);
    return { success: true };
  });

export const deleteMusica = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data, context }) => {
    await verifyAdmin(context.supabase, context.userId);

    const { error } = await supabaseAdmin
      .from('musicas')
      .delete()
      .eq('id', data.id);

    if (error) throw new Error(error.message);
    return { success: true };
  });
