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

/**
 * Calculate and store unlock dates for content items with access_mode = 'liberar_em_dias'.
 * Uses the purchase approval date as the base for calculating unlock_at.
 */
async function calculateContentUnlocks(email: string, orderId: string) {
  try {
    // Fetch all active content items that have timed release
    const { data: timedContent, error } = await supabaseAdmin
      .from('content_items')
      .select('id, release_days')
      .eq('is_active', true)
      .eq('access_mode', 'liberar_em_dias')
      .not('release_days', 'is', null);

    if (error) {
      console.error('Error fetching timed content:', error);
      return;
    }

    if (!timedContent || timedContent.length === 0) {
      console.log('No timed-release content to process');
      return;
    }

    const now = new Date();

    for (const item of timedContent) {
      const unlockAt = new Date(now);
      unlockAt.setDate(unlockAt.getDate() + (item.release_days || 0));

      // Upsert - if already exists for this email+content, skip (idempotent)
      const { error: upsertError } = await supabaseAdmin
        .from('user_content_unlocks')
        .upsert(
          {
            email,
            content_id: item.id,
            order_id: orderId,
            unlock_at: unlockAt.toISOString(),
            unlocked: item.release_days === 0,
          },
          { onConflict: 'email,content_id', ignoreDuplicates: true }
        );

      if (upsertError) {
        console.error(`Error upserting unlock for content ${item.id}:`, upsertError);
      }
    }

    console.log(`📅 Calculated ${timedContent.length} content unlock dates for ${email}`);
  } catch (e) {
    console.error('Error calculating content unlocks:', e);
  }
}

/**
 * Check if this order_id has already been processed successfully to avoid duplicates.
 */
async function isOrderAlreadyProcessed(orderId: string): Promise<boolean> {
  if (!orderId) return false;

  const { data } = await supabaseAdmin
    .from('webhook_logs')
    .select('id')
    .eq('order_id', orderId)
    .eq('provider', 'kiwify')
    .in('event_type', ['paid', 'approved', 'completed'])
    .eq('response_status', 200)
    .limit(1);

  return !!(data && data.length > 0);
}

export async function handleKiwifyWebhook(request: Request): Promise<Response> {
  let rawBody: any = null;

  try {
    rawBody = await request.json();

    const requestUrl = new URL(request.url);
    const explicitToken = (
      request.headers.get('x-kiwify-token') ||
      request.headers.get('x-webhook-token') ||
      requestUrl.searchParams.get('token') ||
      requestUrl.searchParams.get('kiwify_token') ||
      ''
    ).trim();
    const authorizationHeader = request.headers.get('authorization') || '';
    const bearerToken = authorizationHeader.startsWith('Bearer ')
      ? authorizationHeader.replace(/^Bearer\s+/i, '').trim()
      : '';

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

    const savedToken = (config?.auth_token || '').trim();
    const hasExplicitToken = explicitToken.length > 0;
    const hasMatchingBearerToken = !!savedToken && bearerToken === savedToken;

    if (savedToken && hasExplicitToken && explicitToken !== savedToken) {
      await logWebhookEvent({
        eventType: 'auth_failed',
        payload: rawBody,
        responseStatus: 401,
        responseMessage: 'Invalid signature',
      });
      return jsonResponse({ error: 'Invalid signature' }, 401);
    }

    if (savedToken && !hasExplicitToken && bearerToken && !hasMatchingBearerToken) {
      console.warn('Ignoring non-matching Authorization bearer token for webhook validation');
    }

    // Parse payload (Kiwify sends nested or flat)
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

    console.log(`📩 Kiwify webhook: status=${status} email=${customerEmail} order=${orderId}`);

    if (status === 'paid' || status === 'approved' || status === 'completed') {
      // Idempotency check: skip if this order was already processed
      if (orderId && await isOrderAlreadyProcessed(orderId)) {
        console.log(`⚠️ Order ${orderId} already processed, skipping`);
        await logWebhookEvent({
          eventType: status,
          email: customerEmail,
          orderId,
          payload: rawBody,
          responseStatus: 200,
          responseMessage: 'Already processed (idempotent)',
        });
        return jsonResponse({ success: true, message: 'Already processed' });
      }

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

      // Provision user account (create or send reset email)
      await provisionUserAccess(customerEmail);

      // Calculate unlock dates for timed-release content
      await calculateContentUnlocks(customerEmail, orderId);

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
