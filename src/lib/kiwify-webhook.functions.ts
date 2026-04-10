import { supabaseAdmin } from '@/integrations/supabase/client.server';
import { CORS_HEADERS } from '@/lib/cors';
import { createClient } from '@supabase/supabase-js';

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
  });
}

async function provisionUserAccess(email: string) {
  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const publicKey = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !serviceKey) return;

  const admin = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // Check if user already exists
  const { data: userList } = await admin.auth.admin.listUsers();
  const existingUser = userList?.users?.find(
    (u) => u.email?.toLowerCase() === email
  );

  if (!existingUser) {
    // Create user with random password — they'll set it via reset link
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

  // Send password reset email via public client
  if (publicKey) {
    const publicClient = createClient(url, publicKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    await publicClient.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://pazemcancao.lovable.app/login',
    });
  }
}

export async function handleKiwifyWebhook(request: Request): Promise<Response> {
  try {
    // 1. Read token from header
    const reqUrl = new URL(request.url);
    const headerToken =
      request.headers.get('x-kiwify-token') ||
      request.headers.get('authorization')?.replace('Bearer ', '') ||
      reqUrl.searchParams.get('token') ||
      '';

    // 2. Fetch saved token from webhook_settings
    const { data: config } = await supabaseAdmin
      .from('webhook_settings')
      .select('auth_token, is_active')
      .eq('provider', 'kiwify')
      .maybeSingle();

    if (config && !config.is_active) {
      return jsonResponse({ status: 'success', message: 'Webhook is disabled' });
    }

    const savedToken = config?.auth_token || '';

    // 3. Compare tokens — reject if mismatch
    if (!savedToken || headerToken !== savedToken) {
      console.error('❌ Token mismatch or missing');
      return jsonResponse({ error: 'Invalid signature' }, 401);
    }

    // 4. Parse payload (Kiwify format: { data: { customer, status } })
    const body = await request.json();
    const payload = body.data || body;
    const status = (payload.status || '').toLowerCase();
    const customerEmail = (
      payload.customer?.email || payload.Customer?.email || ''
    ).toLowerCase().trim();
    const customerName =
      payload.customer?.name || payload.Customer?.full_name || 'Comprador';
    const orderId = payload.order_id || body.order_id || '';

    if (!customerEmail) {
      return jsonResponse({ error: 'Missing customer email' }, 400);
    }

    console.log(`📩 Kiwify webhook: status=${status} email=${customerEmail}`);

    if (status === 'paid' || status === 'approved') {
      // 4. Save to approved_buyers
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
        return jsonResponse({ error: 'Failed to register buyer' }, 500);
      }

      // 5. Create user in auth and send password reset email
      await provisionUserAccess(customerEmail);

      console.log(`✅ Buyer approved and provisioned: ${customerEmail}`);
      // 6. Return success
      return jsonResponse({ success: true });
    }

    // Handle cancellations
    const cancelledStatuses = ['refunded', 'chargedback', 'chargeback', 'cancelled'];
    if (cancelledStatuses.includes(status)) {
      await supabaseAdmin
        .from('approved_buyers')
        .update({ access_enabled: false, status })
        .eq('email', customerEmail);

      return jsonResponse({ success: true });
    }

    return jsonResponse({ success: true, message: 'No action required' });
  } catch (err: any) {
    console.error('❌ Webhook error:', err);
    return jsonResponse({ error: err.message || 'Webhook processing failed' }, 400);
  }
}
