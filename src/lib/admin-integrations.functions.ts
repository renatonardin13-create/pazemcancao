import { createServerFn } from '@tanstack/react-start';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { supabaseAdmin } from '@/integrations/supabase/client.server';

async function verifyAdmin(supabase: any, userId: string) {
  const { data: role } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .eq('role', 'admin')
    .maybeSingle();
  const { data: userData } = await supabase.auth.getUser();
  const isAdminEmail = userData?.user?.email?.toLowerCase() === 'renatonardin13@gmail.com';
  if (!role && !isAdminEmail) throw new Error('Não autorizado');
}

export const getIntegrationsDashboard = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await verifyAdmin(context.supabase, context.userId);

    // Get all course integrations with course titles
    const { data: integrations } = await supabaseAdmin
      .from('course_integrations')
      .select('*, courses(title)')
      .order('created_at', { ascending: false });

    // Get webhook logs stats
    const { data: logs } = await supabaseAdmin
      .from('webhook_logs')
      .select('response_status')
      .limit(1000);

    // Get processed webhooks for sales count
    const { data: processedWebhooks } = await supabaseAdmin
      .from('processed_webhooks')
      .select('status, course_id:details')
      .eq('status', 'processed');

    const allIntegrations = integrations || [];
    const totalWebhooks = allIntegrations.length;
    const activeWebhooks = allIntegrations.filter(i => i.webhook_active && i.is_enabled).length;

    const allLogs = logs || [];
    const totalSales = (processedWebhooks || []).length;
    const successLogs = allLogs.filter(l => l.response_status === 200).length;
    const successRate = allLogs.length > 0 ? Math.round((successLogs / allLogs.length) * 100) : 0;

    // Count sales per course integration (from processed_webhooks)
    const salesPerCourse: Record<string, number> = {};
    // For now, count from webhook_logs by matching order patterns
    const { data: salesLogs } = await supabaseAdmin
      .from('webhook_logs')
      .select('payload')
      .eq('response_status', 200);

    return {
      stats: {
        totalWebhooks,
        activeWebhooks,
        totalSales,
        successRate,
      },
      integrations: allIntegrations.map(i => ({
        id: i.id,
        courseId: i.course_id,
        courseTitle: (i as any).courses?.title || 'Sem título',
        platform: i.platform,
        externalProductId: i.external_product_id,
        isEnabled: i.is_enabled,
        webhookActive: i.webhook_active,
        checkoutUrl: i.checkout_url,
        sales: 0, // placeholder
      })),
    };
  });
