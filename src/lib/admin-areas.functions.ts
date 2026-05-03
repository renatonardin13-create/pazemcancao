import { createServerFn } from '@tanstack/react-start';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { supabaseAdmin } from '@/integrations/supabase/client.server';
import { z } from 'zod';

const slugSchema = z.string()
  .min(3, "Mínimo de 3 caracteres")
  .max(63, "Máximo de 63 caracteres")
  .regex(/^[a-z0-9-]+$/, "Apenas letras minúsculas, números e hifens")
  .refine(s => !s.startsWith('-'), "O subdomínio não pode começar com hífen")
  .refine(s => !s.endsWith('-'), "O subdomínio não pode terminar com hífen")
  .refine(s => !s.includes('--'), "O subdomínio não pode conter hifens consecutivos");

export const checkSlugAvailability = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ slug: slugSchema }))
  .handler(async ({ data }) => {
    const { data: existing } = await supabaseAdmin
      .from('areas_membros')
      .select('id')
      .eq('subdominio', data.slug)
      .maybeSingle();

    return { available: !existing };
  });

export const createArea = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ 
    name: z.string().min(1, "Nome é obrigatório"), 
    slug: slugSchema, 
    language: z.string(), 
    status: z.string(),
    product_id: z.string().uuid().optional(),
    is_primary: z.boolean().optional(),
    primary_color: z.string().optional(),
    secondary_color: z.string().optional(),
    background_color: z.string().optional(),
    surface_color: z.string().optional(),
  }))
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

    const { data: newArea, error } = await supabaseAdmin
      .from('areas_membros')
      .insert({
        nome: data.name,
        subdominio: data.slug,
        language: data.language,
        status: data.status,
        produto_id: data.product_id,
        principal: data.is_primary || false,
        primary_color: data.primary_color,
        secondary_color: data.secondary_color,
        background_color: data.background_color,
        surface_color: data.surface_color,
        ativa: true
      })
      .select('id')
      .single();

    if (error) throw new Error(error.message);
    return { success: true, areaId: newArea.id };
  });

export const getAreas = createServerFn({ method: 'GET' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
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

    const { data: areas, error } = await supabaseAdmin
      .from('areas_membros')
      .select('*, courses:produto_id(title)')
      .order('criado_em', { ascending: false });

    if (error) throw new Error(error.message);
    return { areas: areas || [] };
  });

export const updateArea = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ 
    id: z.string().uuid(),
    name: z.string().min(1).optional(), 
    slug: slugSchema.optional(), 
    language: z.string().optional(), 
    status: z.string().optional(),
    product_id: z.string().uuid().nullable().optional(),
    is_primary: z.boolean().optional(),
  }))
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
      .update({
        nome: data.name,
        subdominio: data.slug,
        language: data.language,
        status: data.status,
        produto_id: data.product_id,
        principal: data.is_primary,
      })
      .eq('id', data.id);

    if (error) throw new Error(error.message);
    return { success: true };
  });

export const deleteArea = createServerFn({ method: 'POST' })
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

export const duplicateArea = createServerFn({ method: 'POST' })
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
        language: area.language,
        status: 'draft',
        produto_id: area.produto_id,
        principal: false,
        ativa: true,
        primary_color: area.primary_color,
        secondary_color: area.secondary_color,
        background_color: area.background_color,
        surface_color: area.surface_color,
        logo_url: area.logo_url,
        favicon_url: area.favicon_url,
        banner_url: area.banner_url
      })
      .select('id')
      .single();

    if (insertError) throw new Error(insertError.message);
    return { success: true, areaId: newArea.id };
  });
