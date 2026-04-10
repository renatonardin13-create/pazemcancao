import { createServerFn } from '@tanstack/react-start';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';

export const getCourseIntegration = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { courseId: string }) => input)
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: integration, error } = await supabase
      .from('course_integrations')
      .select('*')
      .eq('course_id', data.courseId)
      .maybeSingle();

    if (error) throw new Error(error.message);
    return { integration };
  });

export const upsertCourseIntegration = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: {
    courseId: string;
    is_enabled: boolean;
    platform: string;
    external_product_id?: string;
    external_product_name?: string;
    checkout_url?: string;
    notes?: string;
    webhook_active: boolean;
  }) => input)
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { error } = await supabase
      .from('course_integrations')
      .upsert(
        {
          course_id: data.courseId,
          is_enabled: data.is_enabled,
          platform: data.platform,
          external_product_id: data.external_product_id || null,
          external_product_name: data.external_product_name || null,
          checkout_url: data.checkout_url || null,
          notes: data.notes || null,
          webhook_active: data.webhook_active,
        },
        { onConflict: 'course_id' }
      );

    if (error) throw new Error(error.message);
    return { success: true };
  });
