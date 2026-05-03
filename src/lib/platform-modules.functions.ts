import { createServerFn } from '@tanstack/react-start';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';

export type PlatformModule = {
  id: string;
  name: string;
  slug: string;
  enabled: boolean;
  sort_order: number;
  visible_in_vitrine: boolean;
  visible_in_menu: boolean;
};

export const getPlatformModules = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from('platform_modules' as any)
      .select('id, name, slug, enabled, sort_order, visible_in_vitrine, visible_in_menu')
      .order('sort_order', { ascending: true });

    if (error) {
      // If table doesn't exist, return empty list instead of throwing
      return { modules: [] };
    }
    return { modules: (data || []) as PlatformModule[] };
  });

export const updatePlatformModule = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string; updates: Partial<Pick<PlatformModule, 'enabled' | 'visible_in_vitrine' | 'visible_in_menu' | 'sort_order'>> }) => input)
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from('platform_modules' as any)
      .update(data.updates as any)
      .eq('id', data.id);

    if (error) throw new Error(error.message);
    return { success: true };
  });
