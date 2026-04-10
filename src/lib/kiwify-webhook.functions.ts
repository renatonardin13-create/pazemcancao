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
}) {
  try {
    await supabaseAdmin.from('webhook_logs').insert({
      provider: 'kiwify',
      event_type: params.eventType,
      email: params.email || null,
      order_id: params.orderId || null,
      payload: params.payload as any,
      response_status: params.responseStatus,
      response_message: params.responseMessage,
    });
  } catch (e) {
    console.error('Failed to log webhook event:', e);
  }
}

async function provisionUserAccess(email: string) {
  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const publicKey = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !serviceKey) return;

  const admin = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: userList } = await admin.auth.admin.listUsers();
  const existingUser = userList?.users?.find(
    (u) => u.email?.toLowerCase() === email
  );

  if (!existingUser) {
    const tempPassword = crypto.randomUUID() + crypto.randomUUID();
    const { error: createError } = await admin.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
    });
    if (createError) {
      console.error('Error creating user:', createError);
      return;
    }
  }

  if (publicKey) {
    const publicClient = createClient(url, publicKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    await publicClient.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://pazemcancao.lovable.app/login',
    });
  }
}

function verifyToken(request: Request, body: any, savedToken: string): boolean {
  // If no token is configured, skip verification (allow all requests)
  if (!savedToken) return true;

  // 1. Check headers (x-kiwify-token, Authorization Bearer)
  const headerToken =
    request.headers.get('x-kiwify-token') ||
    request.headers.get('authorization')?.replace('Bearer ', '') ||
    '';

  if (headerToken && headerToken === savedToken) return true;

  // 2. Check query param
  const url = new URL(request.url);
  const queryToken = url.searchParams.get('token') || '';
  if (queryToken && queryToken === savedToken) return true;

  // 3. Check signature field in body (Kiwify sends signature in the payload)
  const bodySignature = body?.signature || '';
  if (bodySignature && bodySignature === savedToken) return true;

  // 4. Check the raw body token field
  const bodyToken = body?.token || '';
  if (bodyToken && bodyToken === savedToken) return true;

  return false;
}

export async function handleKiwifyWebhook(request: Request): Promise<Response> {
  let rawBody: any = null;

  try {
    rawBody = await request.json();

    // 1. Fetch saved config
    const { data: config } = await supabaseAdmin
      .from('webhook_settings')
      .select('auth_token, is_active')
      .eq('provider', 'kiwify')
      .maybeSingle();

    if (config && !config.is_active) {
      await logWebhookEvent({
        eventType: 'disabled',
        payload: rawBody,
        responseStatus: 200,
        responseMessage: 'Webhook is disabled',
      });
      return jsonResponse({ status: 'success', message: 'Webhook is disabled' });
    }

    const savedToken = config?.auth_token || '';

    // 2. Verify token
    const isValid = verifyToken(request, rawBody, savedToken);

    if (!isValid) {
      console.error('❌ Token mismatch or missing');
      await logWebhookEvent({
        eventType: 'auth_failed',
        payload: rawBody,
        responseStatus: 401,
        responseMessage: 'Invalid signature',
      });
      return jsonResponse({ error: 'Invalid signature' }, 401);
    }

    // 3. Parse payload (Kiwify sends nested or flat)
    const payload = rawBody.data || rawBody;
    const status = (
      payload.order_status || payload.status || rawBody.order_status || ''
    ).toLowerCase();
    const customerEmail = (
      payload.customer?.email ||
      payload.Customer?.email ||
      rawBody.Customer?.email ||
      rawBody.customer?.email ||
      ''
    ).toLowerCase().trim();
    const customerName =
      payload.customer?.name ||
      payload.Customer?.full_name ||
      rawBody.Customer?.full_name ||
      rawBody.customer?.name ||
      'Comprador';
    const orderId =
      payload.order_id || rawBody.order_id || '';

    if (!customerEmail) {
      await logWebhookEvent({
        eventType: status || 'unknown',
        payload: rawBody,
        responseStatus: 400,
        responseMessage: 'Missing customer email',
      });
      return jsonResponse({ error: 'Missing customer email' }, 400);
    }

    console.log(`📩 Kiwify webhook: status=${status} email=${customerEmail}`);

    if (status === 'paid' || status === 'approved' || status === 'completed') {
      const { error: dbError } = await supabaseAdmin
        .from('approved_buyers')
        .upsert(
          {
            nome: customerName,
            email: customerEmail,
            order_id: orderId,
            product_name: 'Paz em Canção',
            status: 'approved',
            access_enabled: true,
          },
          { onConflict: 'email' }
        );

      if (dbError) {
        console.error('❌ DB upsert error:', dbError);
        await logWebhookEvent({
          eventType: status,
          email: customerEmail,
          orderId,
          payload: rawBody,
          responseStatus: 500,
          responseMessage: 'Failed to register buyer',
        });
        return jsonResponse({ error: 'Failed to register buyer' }, 500);
      }

      await provisionUserAccess(customerEmail);

      console.log(`✅ Buyer approved and provisioned: ${customerEmail}`);
      await logWebhookEvent({
        eventType: status,
        email: customerEmail,
        orderId,
        payload: rawBody,
        responseStatus: 200,
        responseMessage: 'Buyer approved',
      });
      return jsonResponse({ success: true });
    }

    const cancelledStatuses = ['refunded', 'chargedback', 'chargeback', 'cancelled'];
    if (cancelledStatuses.includes(status)) {
      await supabaseAdmin
        .from('approved_buyers')
        .update({ access_enabled: false, status })
        .eq('email', customerEmail);

      await logWebhookEvent({
        eventType: status,
        email: customerEmail,
        orderId,
        payload: rawBody,
        responseStatus: 200,
        responseMessage: `Access revoked: ${status}`,
      });
      return jsonResponse({ success: true });
    }

    await logWebhookEvent({
      eventType: status || 'unknown',
      email: customerEmail,
      orderId,
      payload: rawBody,
      responseStatus: 200,
      responseMessage: 'No action required',
    });
    return jsonResponse({ success: true, message: 'No action required' });
  } catch (err: any) {
    console.error('❌ Webhook error:', err);
    await logWebhookEvent({
      eventType: 'error',
      payload: rawBody,
      responseStatus: 400,
      responseMessage: err.message || 'Webhook processing failed',
    });
    return jsonResponse({ error: err.message || 'Webhook processing failed' }, 400);
  }
}
