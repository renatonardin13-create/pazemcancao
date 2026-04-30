import { createServerFn } from '@tanstack/react-start';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { supabaseAdmin } from '@/integrations/supabase/client.server';

export const getPlatformSettings = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .handler(async () => {
    const hasServerConfig = Boolean(
      process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY,
    );

    if (!hasServerConfig) {
      return { settings: {} };
    }

    const { data, error } = await supabaseAdmin
      .from('platform_settings')
      .select('key, value');

    if (error) {
      return { settings: {} };
    }

    const settings: Record<string, any> = {};
    for (const row of data || []) {
      settings[row.key] = row.value;
    }
    return { settings };
  });

export const updatePlatformSetting = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { key: string; value: Record<string, any> }) => input)
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const admin = supabaseAdmin;

    // Security Check: Only admins can update platform settings
    const { data: adminRole } = await admin
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .maybeSingle();

    const { data: userData } = await admin.auth.admin.getUserById(userId);
    const isAdminEmail = userData?.user?.email?.toLowerCase() === 'renatonardin13@gmail.com';

    if (!adminRole && !isAdminEmail) {
      throw new Error('Não autorizado: Apenas administradores podem alterar configurações da plataforma.');
    }

    const hasServerConfig = Boolean(
      process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY,
    );

    const { error } = await supabaseAdmin
      .from('platform_settings')
      .upsert(
        { key: data.key, value: data.value as any, updated_at: new Date().toISOString() },
        { onConflict: 'key' }
      );

    if (error) throw new Error(error.message);
    return { success: true };
  });

export const uploadPlatformAsset = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { bucket: string; path: string; base64: string; contentType: string }) => input)
  .handler(async ({ data }) => {
    const hasServerConfig = Boolean(
      process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY,
    );

    if (!hasServerConfig) {
      throw new Error('Configuração do servidor indisponível.');
    }

    const buffer = Uint8Array.from(atob(data.base64), (c) => c.charCodeAt(0));

    const { error } = await supabaseAdmin.storage
      .from(data.bucket)
      .upload(data.path, buffer, { contentType: data.contentType, upsert: true });

    if (error) throw new Error(error.message);

    const { data: urlData } = supabaseAdmin.storage
      .from(data.bucket)
      .getPublicUrl(data.path);

    return { url: urlData.publicUrl };
  });
