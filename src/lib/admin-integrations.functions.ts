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

    const [{ data: integrations }, { data: logs }, { data: enrollments }] = await Promise.all([
      supabaseAdmin
        .from('course_integrations')
        .select('*, courses(title)')
        .order('created_at', { ascending: false }),
      supabaseAdmin
        .from('webhook_logs')
        .select('response_status')
        .eq('provider', 'kiwify')
        .limit(1000),
      supabaseAdmin
        .from('enrollments')
        .select('course_id, status, access_origin')
        .eq('access_origin', 'webhook'),
    ]);

    const allIntegrations = integrations || [];
    const allLogs = logs || [];
    const allEnrollments = enrollments || [];

    const salesPerCourse = allEnrollments.reduce<Record<string, number>>((acc, enrollment) => {
      if (enrollment.status !== 'active') return acc;
      acc[enrollment.course_id] = (acc[enrollment.course_id] || 0) + 1;
      return acc;
    }, {});

    return {
      stats: {
        totalWebhooks: allIntegrations.length,
        activeWebhooks: allIntegrations.filter((item) => item.webhook_active && item.is_enabled).length,
        totalSales: allEnrollments.filter((item) => item.status === 'active').length,
        successRate: allLogs.length > 0
          ? Math.round((allLogs.filter((item) => item.response_status === 200).length / allLogs.length) * 100)
          : 0,
      },
      integrations: allIntegrations.map((item) => ({
        id: item.id,
        courseId: item.course_id,
        courseTitle: (item as any).courses?.title || 'Sem título',
        platform: item.platform,
        externalProductId: item.external_product_id,
        isEnabled: item.is_enabled,
        webhookActive: item.webhook_active,
        checkoutUrl: item.checkout_url,
        sales: salesPerCourse[item.course_id] || 0,
      })),
    };
  });
