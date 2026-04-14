import { createServerFn } from '@tanstack/react-start';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';

export const getUserFavoritesCount = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;

    const { count } = await supabase
      .from('user_favorites')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId);

    return { count: count || 0 };
  });
