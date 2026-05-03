import { createServerFn } from '@tanstack/react-start';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';

/**
 * Returns the most recently published courses (up to 10).
 * Only published courses are included, ordered by created_at descending.
 */
export const getNewCourses = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;

    const { data: courses } = await supabase
      .from('courses')
      .select('id, title, cover_image_url, short_description, total_lessons, total_duration, status, created_at')
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(10);

    return { courses: courses || [] };
  });
