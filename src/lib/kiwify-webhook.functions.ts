import { supabaseAdmin } from '@/integrations/supabase/client.server';
import { CORS_HEADERS } from '@/lib/cors';
import { createClient } from '@supabase/supabase-js';

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
  });
}

// ─── Legacy log (kept for backward compat with admin dashboard) ───
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

// ─── Idempotency: atomic insert into processed_webhooks ───

/**
 * Try to claim this event for processing. Returns the record id if claimed,
 * or null if the event was already processed (unique constraint violation).
 */
async function claimEvent(uniqueEventId: string, payload: any, email: string, eventType: string): Promise<string | null> {
  if (!uniqueEventId) return crypto.randomUUID(); // no id = can't dedup, always process

  const { data, error } = await (supabaseAdmin as any)
    .from('processed_webhooks')
    .insert({
      unique_event_id: uniqueEventId,
      provider: 'kiwify',
      email: email || null,
      event_type: eventType,
      status: 'processing',
      payload,
    })
    .select('id')
    .single();

  if (error) {
    if (error.code === '23505') return null;
    console.error('Error claiming webhook event:', error);
    return crypto.randomUUID();
  }

  return data.id;
}

async function markEventCompleted(uniqueEventId: string, details: any = {}) {
  if (!uniqueEventId) return;
  await (supabaseAdmin as any)
    .from('processed_webhooks')
    .update({ status: 'completed', processed_at: new Date().toISOString(), details })
    .eq('unique_event_id', uniqueEventId)
    .eq('provider', 'kiwify');
}

async function markEventFailed(uniqueEventId: string, errorMessage: string) {
  if (!uniqueEventId) return;
  await (supabaseAdmin as any)
    .from('processed_webhooks')
    .update({ status: 'failed', error_message: errorMessage, processed_at: new Date().toISOString() })
    .eq('unique_event_id', uniqueEventId)
    .eq('provider', 'kiwify');
}

// ─── User provisioning ───

async function provisionUserAccess(email: string): Promise<{ userCreated: boolean; userFound: boolean; userId: string | null }> {
  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const publicKey = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !serviceKey) return { userCreated: false, userFound: false, userId: null };

  const admin = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: userList } = await admin.auth.admin.listUsers();
  const existingUser = userList?.users?.find(
    (u) => u.email?.toLowerCase() === email
  );

  let userCreated = false;
  let userId: string | null = existingUser?.id || null;

  if (!existingUser) {
    const tempPassword = crypto.randomUUID() + crypto.randomUUID();
    const { data: newUser, error: createError } = await admin.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
    });
    if (createError) {
      console.error('Error creating user:', createError);
      return { userCreated: false, userFound: false, userId: null };
    }
    userCreated = true;
    userId = newUser?.user?.id || null;
  }

  if (publicKey) {
    const publicClient = createClient(url, publicKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    await publicClient.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://pazemcancao.lovable.app/login',
    });
  }

  return { userCreated, userFound: !!existingUser, userId };
}

// ─── Content unlock calculation ───

async function calculateContentUnlocks(email: string, orderId: string): Promise<number> {
  try {
    const { data: timedContent, error } = await supabaseAdmin
      .from('content_items')
      .select('id, release_days')
      .eq('is_active', true)
      .eq('access_mode', 'liberar_em_dias')
      .not('release_days', 'is', null);

    if (error || !timedContent?.length) return 0;

    const now = new Date();

    for (const item of timedContent) {
      const unlockAt = new Date(now);
      unlockAt.setDate(unlockAt.getDate() + (item.release_days || 0));

      await supabaseAdmin
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
    }

    return timedContent.length;
  } catch (e) {
    console.error('Error calculating content unlocks:', e);
    return 0;
  }
}

// ─── Parse helpers ───

function extractEventId(payload: any, rawBody: any): string {
  return (
    payload.transaction_id ||
    rawBody.transaction_id ||
    payload.order_id ||
    rawBody.order_id ||
    ''
  );
}

function extractFields(rawBody: any) {
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
  const orderId = payload.order_id || rawBody.order_id || '';
  const uniqueEventId = extractEventId(payload, rawBody);

  // Extract external product ID (Kiwify, Hotmart, Cakto formats)
  const externalProductId = (
    payload.product?.id ||
    payload.Product?.id ||
    rawBody.product?.id ||
    rawBody.Product?.id ||
    payload.product_id ||
    rawBody.product_id ||
    ''
  ).toString().trim();

  // Extract product name for logging
  const externalProductName = (
    payload.product?.name ||
    payload.Product?.name ||
    rawBody.product?.name ||
    rawBody.Product?.name ||
    payload.product_name ||
    rawBody.product_name ||
    ''
  ).toString().trim();

  // Detect platform from payload structure or explicit field
  const platform = (
    payload.platform ||
    rawBody.platform ||
    rawBody.provider ||
    payload.provider ||
    ''
  ).toString().toLowerCase().trim();

  return { payload, status, customerEmail, customerName, orderId, uniqueEventId, externalProductId, externalProductName, platform };
}

// ─── Resolve course from external product ID via course_integrations ───
async function resolveCourseByProductId(
  externalProductId: string,
  platform: string
): Promise<{ courseId: string | null; productName: string | null }> {
  if (!externalProductId) return { courseId: null, productName: null };

  // First try matching by product ID + platform (most precise)
  if (platform) {
    const { data } = await supabaseAdmin
      .from('course_integrations')
      .select('course_id, external_product_name')
      .eq('external_product_id', externalProductId)
      .eq('platform', platform)
      .eq('is_enabled', true)
      .eq('webhook_active', true)
      .maybeSingle();

    if (data) return { courseId: data.course_id, productName: data.external_product_name };
  }

  // Fallback: match by product ID only (platform might not be in payload)
  const { data } = await supabaseAdmin
    .from('course_integrations')
    .select('course_id, external_product_name')
    .eq('external_product_id', externalProductId)
    .eq('is_enabled', true)
    .eq('webhook_active', true)
    .maybeSingle();

  if (data) return { courseId: data.course_id, productName: data.external_product_name };

  console.warn(`[webhook] Integration not found for product_id="${externalProductId}", platform="${platform}"`);
  return { courseId: null, productName: null };
}

// ─── Main handler ───

export async function handleKiwifyWebhook(request: Request): Promise<Response> {
  let rawBody: any = null;

  try {
    rawBody = await request.json();
  } catch {
    await logWebhookEvent({
      eventType: 'error',
      responseStatus: 400,
      responseMessage: 'Invalid JSON body',
    });
    return jsonResponse({ error: 'Invalid JSON body' }, 400);
  }

  const requestUrl = new URL(request.url);
  const courseIdFromQuery = requestUrl.searchParams.get('course')?.trim() || null;
  const { status, customerEmail, customerName, orderId, uniqueEventId, externalProductId, externalProductName, platform: payloadPlatform } = extractFields(rawBody);

  // Resolve course: prefer query param, fallback to product ID lookup via course_integrations
  const productLookup = !courseIdFromQuery ? await resolveCourseByProductId(externalProductId, payloadPlatform) : { courseId: null, productName: null };
  const resolvedCourseId = courseIdFromQuery || productLookup.courseId;
  const resolvedProductName = externalProductName || productLookup.productName || 'Paz em Canção';

  if (!customerEmail) {
    await logWebhookEvent({
      eventType: status || 'unknown',
      payload: rawBody,
      responseStatus: 400,
      responseMessage: 'Missing customer email',
    });
    return jsonResponse({ error: 'Missing customer email' }, 400);
  }

  const approvedStatuses = ['paid', 'approved', 'completed'];
  const cancelledStatuses = ['refunded', 'chargedback', 'chargeback', 'cancelled'];

  if (!status) {
    await logWebhookEvent({
      eventType: 'unknown',
      email: customerEmail,
      orderId,
      payload: rawBody,
      responseStatus: 400,
      responseMessage: 'Missing order status',
    });
    return jsonResponse({ error: 'Missing order status' }, 400);
  }

  try {
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
      await logWebhookEvent({ eventType: 'disabled', payload: rawBody, responseStatus: 200, responseMessage: 'Webhook is disabled' });
      return jsonResponse({ status: 'success', message: 'Webhook is disabled' });
    }

    const savedToken = (config?.auth_token || '').trim();
    if (savedToken && explicitToken && explicitToken !== savedToken) {
      await logWebhookEvent({ eventType: 'auth_failed', payload: rawBody, responseStatus: 401, responseMessage: 'Invalid signature' });
      return jsonResponse({ error: 'Invalid signature' }, 401);
    }
    if (savedToken && !explicitToken && bearerToken && bearerToken !== savedToken) {
      console.warn('Ignoring non-matching Authorization bearer token for webhook validation');
    }
  } catch (authErr: any) {
    console.error('Auth validation error:', authErr);
  }

  if (approvedStatuses.includes(status)) {
    const eventKey = uniqueEventId || orderId;
    const claimedId = await claimEvent(eventKey, rawBody, customerEmail, status);
    if (claimedId === null) {
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

    try {
      const { error: buyerError } = await supabaseAdmin
        .from('approved_buyers')
        .upsert(
          {
            nome: customerName,
            email: customerEmail,
            order_id: orderId,
            product_name: resolvedProductName,
            status: 'approved',
            access_enabled: true,
          },
          { onConflict: 'email' }
        );

      if (buyerError) {
        await markEventFailed(eventKey, `DB upsert error: ${buyerError.message}`);
        await logWebhookEvent({ eventType: status, email: customerEmail, orderId, payload: rawBody, responseStatus: 500, responseMessage: 'Failed to register buyer' });
        return jsonResponse({ error: 'Failed to register buyer' }, 500);
      }

      const userResult = await provisionUserAccess(customerEmail);
      const unlocksCreated = await calculateContentUnlocks(customerEmail, orderId);

      let linkedCourseId: string | null = null;
      if (resolvedCourseId && userResult.userId) {
        const authUserId = userResult.userId;

        // Check if enrollment already exists
        const { data: existingEnrollment } = await supabaseAdmin
          .from('enrollments')
          .select('id')
          .eq('user_id', authUserId)
          .eq('course_id', resolvedCourseId)
          .maybeSingle();

        if (existingEnrollment) {
          await supabaseAdmin
            .from('enrollments')
            .update({ status: 'active', access_origin: 'webhook', granted_at: new Date().toISOString() })
            .eq('id', existingEnrollment.id);
        } else {
          const { error: enrollmentError } = await supabaseAdmin
            .from('enrollments')
            .insert({
              user_id: authUserId,
              course_id: resolvedCourseId,
              email: customerEmail,
              access_origin: 'webhook',
              status: 'active',
              granted_at: new Date().toISOString(),
            });
          if (enrollmentError) {
            console.error('[webhook] Enrollment insert error:', enrollmentError.message);
          }
        }
        linkedCourseId = resolvedCourseId;
      } else if (externalProductId) {
        // Product ID was in payload but no matching integration found
        console.warn(`[webhook] PRODUCT_NOT_FOUND: product_id="${externalProductId}", platform="${payloadPlatform}", email="${customerEmail}"`);
        await logWebhookEvent({
          eventType: 'product_not_found',
          email: customerEmail,
          orderId,
          payload: rawBody,
          responseStatus: 200,
          responseMessage: `Product not found: ${externalProductId}`,
        });
      }

      await markEventCompleted(eventKey, {
        user_created: userResult.userCreated,
        user_found: userResult.userFound,
        purchase_linked: orderId,
        content_unlocks_created: unlocksCreated,
        course_id: linkedCourseId,
        external_product_id: externalProductId || null,
        platform: payloadPlatform || null,
      });

      await logWebhookEvent({ eventType: status, email: customerEmail, orderId, payload: rawBody, responseStatus: 200, responseMessage: linkedCourseId ? 'Buyer approved and enrolled' : 'Buyer approved' });
      return jsonResponse({ success: true, course_id: linkedCourseId });
    } catch (processErr: any) {
      await markEventFailed(eventKey, processErr.message || 'Unknown processing error');
      await logWebhookEvent({ eventType: status, email: customerEmail, orderId, payload: rawBody, responseStatus: 500, responseMessage: processErr.message || 'Processing failed' });
      return jsonResponse({ error: 'Processing failed' }, 500);
    }
  }

  if (cancelledStatuses.includes(status)) {
    await supabaseAdmin
      .from('approved_buyers')
      .update({ access_enabled: false, status })
      .eq('email', customerEmail);

    if (resolvedCourseId) {
      // Update all active enrollments for this email + course (by email since user may not be resolved)
      await supabaseAdmin
        .from('enrollments')
        .update({ status })
        .eq('course_id', resolvedCourseId)
        .eq('email', customerEmail)
        .eq('status', 'active');
    }

    await logWebhookEvent({ eventType: status, email: customerEmail, orderId, payload: rawBody, responseStatus: 200, responseMessage: `Access revoked: ${status}` });
    return jsonResponse({ success: true });
  }

  await logWebhookEvent({ eventType: status, email: customerEmail, orderId, payload: rawBody, responseStatus: 200, responseMessage: 'No action required' });
  return jsonResponse({ success: true, message: 'No action required' });
}
