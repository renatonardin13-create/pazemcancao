import { createServerFn } from '@tanstack/react-start';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { supabaseAdmin } from '@/integrations/supabase/client.server';

export const getPlatformSettings = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from('platform_settings')
      .select('key, value');

    if (error) throw new Error(error.message);

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
    const { error } = await context.supabase
      .from('platform_settings')
      .update({ value: data.value as any, updated_at: new Date().toISOString() })
      .eq('key', data.key);

    if (error) throw new Error(error.message);
    return { success: true };
  });

export const uploadPlatformAsset = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { bucket: string; path: string; base64: string; contentType: string }) => input)
  .handler(async ({ data }) => {
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
