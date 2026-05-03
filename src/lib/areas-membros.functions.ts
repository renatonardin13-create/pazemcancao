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

export const getAreaMembro = createServerFn({ method: 'GET' })
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

    const { data: area, error } = await supabaseAdmin
      .from('areas_membros')
      .select('*, courses:produto_id(title)')
      .eq('id', data.id)
      .single();

    if (error) throw new Error(error.message);
    return { area };
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
    primary_color?: string;
    secondary_color?: string;
    logo_url?: string;
    favicon_url?: string;
    banner_url?: string;
    background_color?: string;
    surface_color?: string;
    tipo?: string;
    rotulo_curto?: string;
    descricao?: string;
    app_name?: string;
    logo_alt?: string;
    support_email?: string;
    theme_mode?: string;
    accent_color?: string;
    button_color?: string;
    button_text_color?: string;
    sidebar_color?: string;
    text_primary?: string;
    text_secondary?: string;
    elevated_surface?: string;
    idiomas_ativos?: string[];
    formato_data?: string;
    boas_vindas?: string;
    botao_continuar?: string;
    produto_bloqueado?: string;
    conclusao?: string;
    parabens?: string;
    botao_entrar?: string;
    suporte_texto?: string;
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
        primary_color: data.primary_color,
        secondary_color: data.secondary_color,
        logo_url: data.logo_url,
        favicon_url: data.favicon_url,
        banner_url: data.banner_url,
        background_color: data.background_color,
        surface_color: data.surface_color,
        tipo: data.tipo || 'misto',
        rotulo_curto: data.rotulo_curto,
        descricao: data.descricao,
        app_name: data.app_name,
        logo_alt: data.logo_alt,
        support_email: data.support_email,
        theme_mode: data.theme_mode || 'dark',
        accent_color: data.accent_color,
        button_color: data.button_color,
        button_text_color: data.button_text_color,
        sidebar_color: data.sidebar_color,
        text_primary: data.text_primary,
        text_secondary: data.text_secondary,
        elevated_surface: data.elevated_surface,
        idiomas_ativos: data.idiomas_ativos || ['pt-BR'],
        formato_data: data.formato_data || 'DD/MM/AAAA',
        boas_vindas: data.boas_vindas,
        botao_continuar: data.botao_continuar,
        produto_bloqueado: data.produto_bloqueado,
        conclusao: data.conclusao,
        parabens: data.parabens,
        botao_entrar: data.botao_entrar,
        suporte_texto: data.suporte_texto,
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
    primary_color?: string;
    secondary_color?: string;
    logo_url?: string;
    favicon_url?: string;
    banner_url?: string;
    background_color?: string;
    surface_color?: string;
    tipo?: string;
    rotulo_curto?: string;
    descricao?: string;
    app_name?: string;
    logo_alt?: string;
    support_email?: string;
    theme_mode?: string;
    accent_color?: string;
    button_color?: string;
    button_text_color?: string;
    sidebar_color?: string;
    text_primary?: string;
    text_secondary?: string;
    elevated_surface?: string;
    idiomas_ativos?: string[];
    formato_data?: string;
    boas_vindas?: string;
    botao_continuar?: string;
    produto_bloqueado?: string;
    conclusao?: string;
    parabens?: string;
    botao_entrar?: string;
    suporte_texto?: string;
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
        primary_color: data.primary_color,
        secondary_color: data.secondary_color,
        logo_url: data.logo_url,
        favicon_url: data.favicon_url,
        banner_url: data.banner_url,
        background_color: data.background_color,
        surface_color: data.surface_color,
        tipo: data.tipo,
        rotulo_curto: data.rotulo_curto,
        descricao: data.descricao,
        app_name: data.app_name,
        logo_alt: data.logo_alt,
        support_email: data.support_email,
        theme_mode: data.theme_mode,
        accent_color: data.accent_color,
        button_color: data.button_color,
        button_text_color: data.button_text_color,
        sidebar_color: data.sidebar_color,
        text_primary: data.text_primary,
        text_secondary: data.text_secondary,
        elevated_surface: data.elevated_surface,
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
