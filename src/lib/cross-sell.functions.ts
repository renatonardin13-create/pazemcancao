import { createServerFn } from '@tanstack/react-start';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';

export type CrossSellItem = {
  id: string;
  type: 'course' | 'content' | 'track';
  title: string;
  cover_url: string | null;
  sales_page_url: string | null;
  is_locked: boolean;
  category?: string;
};

/**
 * Fetch related products for cross-sell based on category and type.
 * Excludes the current product. Returns up to 8 items.
 */
export const getCrossSellItems = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: {
    currentType: 'course' | 'content' | 'track';
    currentId: string;
    category?: string;
    limit?: number;
  }) => input)
  .handler(async ({ data, context }) => {
    const supabase = context.supabase;
    const limit = Math.min(data.limit || 8, 12);
    const items: CrossSellItem[] = [];
    const seenIds = new Set<string>([data.currentId]);

    // Helper to check if user has access to a course
    const userEmail = context.claims?.email as string | undefined;

    // 1. Same-category items first (highest relevance)
    if (data.category && data.currentType === 'course') {
      // Find courses in same category
      const { data: cats } = await supabase
        .from('categories')
        .select('id')
        .or(`slug.eq.${data.category},name.ilike.%${data.category}%`)
        .limit(1);

      if (cats && cats.length > 0) {
        const { data: courses } = await supabase
          .from('courses')
          .select('id, title, cover_image_url, status, category_id')
          .eq('category_id', cats[0].id)
          .eq('status', 'published')
          .neq('id', data.currentId)
          .order('access_count', { ascending: false })
          .limit(limit);

        for (const c of courses || []) {
          if (!seenIds.has(c.id)) {
            seenIds.add(c.id);
            items.push({
              id: c.id,
              type: 'course',
              title: c.title,
              cover_url: c.cover_image_url,
              sales_page_url: null,
              is_locked: false, // will be resolved below
              category: data.category,
            });
          }
        }
      }
    }

    if (data.currentType === 'track' && data.category) {
      const { data: tracks } = await supabase
        .from('tracks')
        .select('id, title, cover_url, category')
        .eq('is_active', true)
        .eq('category', data.category)
        .neq('id', data.currentId)
        .order('sort_order', { ascending: true })
        .limit(limit);

      for (const t of tracks || []) {
        if (!seenIds.has(t.id)) {
          seenIds.add(t.id);
          items.push({
            id: t.id,
            type: 'track',
            title: t.title,
            cover_url: t.cover_url,
            sales_page_url: null,
            is_locked: false,
            category: t.category,
          });
        }
      }
    }

    // 2. Fill remaining slots with popular courses
    if (items.length < limit) {
      const remaining = limit - items.length;
      const excludeIds = Array.from(seenIds);
      
      const { data: popularCourses } = await supabase
        .from('courses')
        .select('id, title, cover_image_url, status')
        .eq('status', 'published')
        .not('id', 'in', `(${excludeIds.join(',')})`)
        .order('access_count', { ascending: false })
        .limit(remaining);

      for (const c of popularCourses || []) {
        if (!seenIds.has(c.id)) {
          seenIds.add(c.id);
          items.push({
            id: c.id,
            type: 'course',
            title: c.title,
            cover_url: c.cover_image_url,
            sales_page_url: null,
            is_locked: false,
          });
        }
      }
    }

    // 3. Fill with content items
    if (items.length < limit) {
      const remaining = limit - items.length;
      const { data: contents } = await supabase
        .from('content_items')
        .select('id, title, cover_url, card_cover_url, sales_page_url, is_free, content_type')
        .eq('is_active', true)
        .neq('id', data.currentId)
        .order('featured_priority', { ascending: false })
        .limit(remaining);

      for (const c of contents || []) {
        if (!seenIds.has(c.id)) {
          seenIds.add(c.id);
          items.push({
            id: c.id,
            type: 'content',
            title: c.title,
            cover_url: c.card_cover_url || c.cover_url,
            sales_page_url: c.sales_page_url,
            is_locked: !c.is_free,
          });
        }
      }
    }

    // Resolve course access for the user
    if (userEmail) {
      const courseIds = items.filter((i) => i.type === 'course').map((i) => i.id);
      if (courseIds.length > 0) {
        const { data: enrollments } = await supabase
          .from('enrollments')
          .select('course_id')
          .eq('user_id', context.userId)
          .eq('status', 'active')
          .in('course_id', courseIds);

        const enrolledSet = new Set((enrollments || []).map((e: any) => e.course_id));

        // Get checkout URLs for locked courses
        const lockedCourseIds = courseIds.filter((id) => !enrolledSet.has(id));
        let checkoutMap: Record<string, string> = {};
        if (lockedCourseIds.length > 0) {
          const { data: integrations } = await supabase
            .from('course_integrations')
            .select('course_id, checkout_url')
            .in('course_id', lockedCourseIds)
            .eq('is_enabled', true);

          for (const ci of integrations || []) {
            if (ci.checkout_url) checkoutMap[ci.course_id] = ci.checkout_url;
          }
        }

        for (const item of items) {
          if (item.type === 'course') {
            item.is_locked = !enrolledSet.has(item.id);
            item.sales_page_url = checkoutMap[item.id] || null;
          }
        }
      }
    }

    return { items: items.slice(0, limit) };
  });
