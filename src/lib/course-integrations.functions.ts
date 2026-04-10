import { createServerFn } from '@tanstack/react-start';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { supabaseAdmin } from '@/integrations/supabase/client.server';

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

export const testCourseWebhook = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { courseId: string }) => input)
  .handler(async ({ data, context }) => {
    const { supabase } = context;

    // Verify admin role
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: role } = await supabase.rpc('has_role', { _user_id: user.id, _role: 'admin' });
    if (!role) throw new Error('Admin access required');

    // Insert test log entry
    const { error } = await supabase.from('webhook_logs').insert({
      provider: 'test',
      event_type: 'test_webhook',
      order_id: `TEST-${Date.now()}`,
      email: 'teste@exemplo.com',
      payload: { _test: true, course_id: data.courseId, timestamp: new Date().toISOString() },
      response_status: 200,
      response_message: 'Teste de webhook realizado com sucesso',
    });

    if (error) throw new Error(error.message);
    return { success: true };
  });