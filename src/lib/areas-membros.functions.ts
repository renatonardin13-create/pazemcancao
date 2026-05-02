import { createServerFn } from '@tanstack/react-start';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { supabaseAdmin } from '@/integrations/supabase/client.server';

export const getAreasMembros = createServerFn({ method: 'GET' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId } = context;

    // Security check: Only admins can list all areas
    const { data: adminRole } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .maybeSingle();

    if (!adminRole) {
      const { data: userData } = await supabaseAdmin.auth.admin.getUserById(userId);
      const isAdminEmail = userData?.user?.email?.toLowerCase() === 'renatonardin13@gmail.com';
      if (!isAdminEmail) throw new Error('Não autorizado');
    }

    const { data: areas, error } = await supabaseAdmin
      .from('areas_membros')
      .select('*, courses:produto_id(title)')
      .order('criado_em', { ascending: false });

    if (error) throw new Error(error.message);
    return { areas };
  });

export const createAreaMembro = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { 
    nome: string; 
    subdominio: string; 
    produto_id: string;
    ativa: boolean;
    principal: boolean;
    status?: string;
    language?: string;
  }) => input)
  .handler(async ({ data, context }) => {
    const { userId } = context;

    const { data: adminRole } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .maybeSingle();

    if (!adminRole) {
      const { data: userData } = await supabaseAdmin.auth.admin.getUserById(userId);
      const isAdminEmail = userData?.user?.email?.toLowerCase() === 'renatonardin13@gmail.com';
      if (!isAdminEmail) throw new Error('Não autorizado');
    }

    // If setting as principal, unset others
    if (data.principal) {
      await supabaseAdmin
        .from('areas_membros')
        .update({ principal: false })
        .eq('principal', true);
    }

    const { data: newArea, error } = await supabaseAdmin
      .from('areas_membros')
      .insert({
        nome: data.nome,
        subdominio: data.subdominio,
        produto_id: data.produto_id,
        ativa: data.ativa,
        principal: data.principal,
        status: data.status || 'active',
        language: data.language || 'pt-BR',
      })
      .select('id')
      .single();

    if (error) throw new Error(error.message);
    return { success: true, areaId: newArea.id };
  });

export const updateAreaMembro = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { 
    id: string;
    nome?: string; 
    subdominio?: string; 
    produto_id?: string;
    ativa?: boolean;
    principal?: boolean;
    status?: string;
    language?: string;
  }) => input)
  .handler(async ({ data, context }) => {
    const { userId } = context;

    const { data: adminRole } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .maybeSingle();

    if (!adminRole) {
      const { data: userData } = await supabaseAdmin.auth.admin.getUserById(userId);
      const isAdminEmail = userData?.user?.email?.toLowerCase() === 'renatonardin13@gmail.com';
      if (!isAdminEmail) throw new Error('Não autorizado');
    }

    // If setting as principal, unset others
    if (data.principal) {
      await supabaseAdmin
        .from('areas_membros')
        .update({ principal: false })
        .neq('id', data.id)
        .eq('principal', true);
    }

    const { error } = await supabaseAdmin
      .from('areas_membros')
      .update({
        nome: data.nome,
        subdominio: data.subdominio,
        produto_id: data.produto_id,
        ativa: data.ativa,
        principal: data.principal,
        status: data.status,
        language: data.language,
      })
      .eq('id', data.id);

    if (error) throw new Error(error.message);
    return { success: true };
  });

export const deleteAreaMembro = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data, context }) => {
    const { userId } = context;

    const { data: adminRole } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .maybeSingle();

    if (!adminRole) {
      const { data: userData } = await supabaseAdmin.auth.admin.getUserById(userId);
      const isAdminEmail = userData?.user?.email?.toLowerCase() === 'renatonardin13@gmail.com';
      if (!isAdminEmail) throw new Error('Não autorizado');
    }

    const { error } = await supabaseAdmin
      .from('areas_membros')
      .delete()
      .eq('id', data.id);

    if (error) throw new Error(error.message);
    return { success: true };
  });

export const duplicateAreaMembro = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data, context }) => {
    const { userId } = context;

    const { data: adminRole } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .maybeSingle();

    if (!adminRole) {
      const { data: userData } = await supabaseAdmin.auth.admin.getUserById(userId);
      const isAdminEmail = userData?.user?.email?.toLowerCase() === 'renatonardin13@gmail.com';
      if (!isAdminEmail) throw new Error('Não autorizado');
    }

    const { data: area, error: fetchError } = await supabaseAdmin
      .from('areas_membros')
      .select('*')
      .eq('id', data.id)
      .single();

    if (fetchError) throw new Error(fetchError.message);

    const { data: newArea, error: insertError } = await supabaseAdmin
      .from('areas_membros')
      .insert({
        nome: `${area.nome} (Cópia)`,
        subdominio: `${area.subdominio}-copia-${Math.floor(Math.random() * 1000)}`,
        produto_id: area.produto_id,
        ativa: area.ativa,
        principal: false,
      })
      .select('id')
      .single();

    if (insertError) throw new Error(insertError.message);
    return { success: true, areaId: newArea.id };
  });
