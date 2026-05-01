import { createServerFn } from '@tanstack/react-start';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { supabaseAdmin } from '@/integrations/supabase/client.server';

export const checkSlugAvailability = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { slug: string }) => input)
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
  .inputValidator((input: { 
    name: string; 
    slug: string; 
    language: string; 
    status: string;
  }) => input)
  .handler(async ({ data, context }) => {
    const { userId } = context;

    // Security check: Only admins can create areas
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
        language: data.language,
        status: data.status,
      })
      .select('id')
      .single();

    if (error) throw new Error(error.message);
    return { success: true, areaId: newArea.id };
  });
