import { createServerFn } from '@tanstack/react-start';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';

export const listPublishedCourses = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;

    const { data: courses, error } = await supabase
      .from('courses')
      .select('*, categories(name, slug, icon)')
      .eq('status', 'published')
      .order('sort_order', { ascending: true });

    if (error) throw new Error(error.message);

    return { courses: courses || [] };
  });

export const listCategories = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;

    const { data: categories, error } = await supabase
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) throw new Error(error.message);

    return { categories: categories || [] };
  });
