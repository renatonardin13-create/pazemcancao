import { createServerFn } from '@tanstack/react-start';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { supabaseAdmin } from '@/integrations/supabase/client.server';
import { z } from 'zod';

const slugSchema = z.string()
  .min(3, "Mínimo de 3 caracteres")
  .max(63, "Máximo de 63 caracteres")
  .regex(/^[a-z0-9-]+$/, "Apenas letras minúsculas, números e hifens");

export const checkSlugAvailability = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ slug: slugSchema }))
  .handler(async ({ data }) => {
    const { data: existing } = await supabaseAdmin
      .from('areas')
      .select('id')
      .eq('slug', data.slug)
      .maybeSingle();

    return { available: !existing };
  });

export const createArea = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ 
    name: z.string().min(1, "Nome é obrigatório"), 
    slug: slugSchema, 
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
      .from('areas')
      .insert({
        name: data.name,
        slug: data.slug,
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
      .from('areas')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return { areas };
  });

export const updateArea = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ 
    id: z.string().uuid(),
    name: z.string().min(1).optional(), 
    slug: slugSchema.optional(), 
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
      .from('areas')
      .update({
        name: data.name,
        slug: data.slug,
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
      .from('areas')
      .delete()
      .eq('id', data.id);

    if (error) throw new Error(error.message);
    return { success: true };
  });
