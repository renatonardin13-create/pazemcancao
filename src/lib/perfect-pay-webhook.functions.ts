import { supabaseAdmin } from '@/integrations/supabase/client.server';
import { CORS_HEADERS } from '@/lib/cors';
import { createClient } from '@supabase/supabase-js';

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
  });
}

async function logWebhookEvent(params: {
  eventType: string;
  email?: string;
  orderId?: string;
  payload?: unknown;
  responseStatus: number;
  responseMessage: string;
  externalProductId?: string;
  isSuccess?: boolean;
}) {
  try {
    await supabaseAdmin.from('webhook_logs').insert({
      provider: 'perfect_pay',
      event_type: params.eventType,
      email: params.email || null,
      order_id: params.orderId || null,
      payload: params.payload as any,
      response_status: params.responseStatus,
      response_message: params.responseMessage,
      external_product_id: params.externalProductId || null,
      processed_at: new Date().toISOString(),
      is_success: params.isSuccess ?? null,
    });
  } catch (e) {
    console.error('Failed to log Perfect Pay webhook event:', e);
  }
}

async function provisionUser(email: string) {
  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;

  const admin = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: userList } = await admin.auth.admin.listUsers();
  const existingUser = userList?.users?.find(u => u.email?.toLowerCase() === email.toLowerCase());

  if (existingUser) return existingUser.id;

  const { data: newUser, error } = await admin.auth.admin.createUser({
    email,
    password: crypto.randomUUID(),
    email_confirm: true,
  });

  if (error) {
    console.error('Error creating user for Perfect Pay:', error);
    return null;
  }

  return newUser.user.id;
}

export async function handlePerfectPayWebhook(request: Request): Promise<Response> {
  try {
    const rawBody = await request.json();
    console.log('[PERFECT-PAY] Payload:', JSON.stringify(rawBody));

    const status = (rawBody.sale_status || '').toLowerCase();
    const email = (rawBody.customer_email || '').toLowerCase();
    const name = rawBody.customer_full_name || 'Cliente';
    const orderId = rawBody.sale_id || '';
    const productId = rawBody.product_id || '';

    if (!email) {
      return jsonResponse({ error: 'Missing email' }, 400);
    }

    // Aprovado
    if (status === 'approved' || status === 'paid') {
      const userId = await provisionUser(email);
      
      // Upsert approved buyer
      await supabaseAdmin.from('approved_buyers').upsert({
        email,
        nome: name,
        order_id: orderId,
        status: 'approved',
        access_enabled: true
      }, { onConflict: 'email' });

      // If we have a mapped course for this product ID
      const { data: integration } = await supabaseAdmin
        .from('course_integrations')
        .select('course_id')
        .eq('external_product_id', productId)
        .maybeSingle();

      if (integration && userId) {
        await supabaseAdmin.from('enrollments').upsert({
          user_id: userId,
          course_id: integration.course_id,
          email,
          status: 'active'
        }, { onConflict: 'user_id,course_id' });
      }

      await logWebhookEvent({
        eventType: status,
        email,
        orderId,
        payload: rawBody,
        responseStatus: 200,
        responseMessage: 'Success',
        externalProductId: productId,
        isSuccess: true
      });

      return jsonResponse({ success: true });
    }

    // Reembolsado / Cancelado
    if (status === 'refunded' || status === 'cancelled') {
      await supabaseAdmin.from('approved_buyers')
        .update({ access_enabled: false, status: 'revoked' })
        .eq('email', email);

      await logWebhookEvent({
        eventType: status,
        email,
        orderId,
        payload: rawBody,
        responseStatus: 200,
        responseMessage: 'Access revoked',
        externalProductId: productId,
        isSuccess: true
      });
    }

    return jsonResponse({ success: true, message: 'Status ignored' });

  } catch (err: any) {
    console.error('[PERFECT-PAY] Error:', err);
    return jsonResponse({ error: 'Processing error', details: err.message }, 500);
  }
}
