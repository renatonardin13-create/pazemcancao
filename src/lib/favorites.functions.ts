import { createServerFn } from '@tanstack/react-start';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';

export const listFavorites = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from('user_favorites')
      .select('content_id')
      .eq('user_id', context.userId);

    if (error) throw new Error(error.message);
    return { favoriteIds: (data || []).map((f: any) => f.content_id) };
  });

export const toggleFavorite = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { contentId: string; isFavorite: boolean }) => input)
  .handler(async ({ data, context }) => {
    if (data.isFavorite) {
      // Remove
      const { error } = await context.supabase
        .from('user_favorites')
        .delete()
        .eq('user_id', context.userId)
        .eq('content_id', data.contentId);
      if (error) throw new Error(error.message);
      return { favorited: false };
    } else {
      // Add
      const { error } = await context.supabase
        .from('user_favorites')
        .insert({ user_id: context.userId, content_id: data.contentId });
      if (error) {
        if (error.code === '23505') return { favorited: true }; // already exists
        throw new Error(error.message);
      }
      return { favorited: true };
    }
  });
