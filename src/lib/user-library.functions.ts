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

export const getLibraryStats = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;

    const userEmail = (await supabase.auth.getUser()).data.user?.email;

    // Conteúdos Liberados: content_items the user has unlocked
    const { count: unlockedCount } = await supabase
      .from('user_content_unlocks')
      .select('id', { count: 'exact', head: true })
      .eq('email', userEmail ?? '')
      .eq('unlocked', true);

    // Conteúdos em Breve: content_items scheduled but not yet unlocked for user
    const { count: upcomingCount } = await supabase
      .from('user_content_unlocks')
      .select('id', { count: 'exact', head: true })
      .eq('email', userEmail ?? '')
      .eq('unlocked', false);

    // Favoritos
    const { count: favCount } = await supabase
      .from('user_favorites')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId);

    // Bônus Exclusivos: free active content items
    const { count: bonusCount } = await supabase
      .from('content_items')
      .select('id', { count: 'exact', head: true })
      .eq('is_active', true)
      .eq('is_free', true);

    return {
      unlocked: unlockedCount || 0,
      upcoming: upcomingCount || 0,
      favorites: favCount || 0,
      bonus: bonusCount || 0,
    };
  });
