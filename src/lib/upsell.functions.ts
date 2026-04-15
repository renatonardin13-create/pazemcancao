import { createServerFn } from '@tanstack/react-start';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { supabaseAdmin } from '@/integrations/supabase/client.server';

export type UpsellItem = {
  id: string;
  source_type: string;
  source_id: string;
  target_type: string;
  target_id: string;
  title: string | null;
  description: string | null;
  sort_order: number;
  is_active: boolean;
  // Joined target info
  target_title?: string;
  target_cover?: string;
  target_sales_url?: string;
};

/** Fetch upsells for a specific source product */
export const getUpsellsForProduct = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { sourceType: string; sourceId: string }) => input)
  .handler(async ({ data, context }) => {
    const { data: upsells, error } = await context.supabase
      .from('product_upsells')
      .select('*')
      .eq('source_type', data.sourceType)
      .eq('source_id', data.sourceId)
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .limit(6);

    if (error) throw new Error(error.message);

    // Enrich with target product info
    const enriched: UpsellItem[] = [];
    for (const u of upsells || []) {
      let target_title = u.title || '';
      let target_cover = '';
      let target_sales_url = '';

      if (u.target_type === 'course') {
        const { data: course } = await context.supabase
          .from('courses')
          .select('title, cover_image_url, status')
          .eq('id', u.target_id)
          .single();
        if (course) {
          target_title = target_title || course.title;
          target_cover = course.cover_image_url || '';
        }
      } else if (u.target_type === 'content') {
        const { data: content } = await context.supabase
          .from('content_items')
          .select('title, cover_url, card_cover_url, sales_page_url')
          .eq('id', u.target_id)
          .single();
        if (content) {
          target_title = target_title || content.title;
          target_cover = content.card_cover_url || content.cover_url || '';
          target_sales_url = content.sales_page_url || '';
        }
      } else if (u.target_type === 'track') {
        const { data: track } = await context.supabase
          .from('tracks')
          .select('title, cover_url')
          .eq('id', u.target_id)
          .single();
        if (track) {
          target_title = target_title || track.title;
          target_cover = track.cover_url || '';
        }
      }

      enriched.push({
        ...u,
        target_title,
        target_cover,
        target_sales_url,
      });
    }

    return { upsells: enriched };
  });

/** Admin: list all upsells */
export const listAllUpsells = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .handler(async () => {
    const { data, error } = await supabaseAdmin
      .from('product_upsells')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200);

    if (error) throw new Error(error.message);
    return { upsells: data || [] };
  });

/** Admin: create upsell */
export const createUpsell = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: {
    source_type: string;
    source_id: string;
    target_type: string;
    target_id: string;
    title?: string;
    description?: string;
  }) => input)
  .handler(async ({ data }) => {
    const { error } = await supabaseAdmin
      .from('product_upsells')
      .insert({
        source_type: data.source_type,
        source_id: data.source_id,
        target_type: data.target_type,
        target_id: data.target_id,
        title: data.title || null,
        description: data.description || null,
      });

    if (error) throw new Error(error.message);
    return { success: true };
  });

/** Admin: delete upsell */
export const deleteUpsell = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data }) => {
    const { error } = await supabaseAdmin
      .from('product_upsells')
      .delete()
      .eq('id', data.id);

    if (error) throw new Error(error.message);
    return { success: true };
  });

/** Admin: toggle upsell active state */
export const toggleUpsell = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string; is_active: boolean }) => input)
  .handler(async ({ data }) => {
    const { error } = await supabaseAdmin
      .from('product_upsells')
      .update({ is_active: data.is_active })
      .eq('id', data.id);

    if (error) throw new Error(error.message);
    return { success: true };
  });
