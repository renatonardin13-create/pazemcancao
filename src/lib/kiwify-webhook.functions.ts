import { supabaseAdmin } from '@/integrations/supabase/client.server';
import { CORS_HEADERS } from '@/lib/cors';

const APPROVED_STATUSES = ['paid', 'approved', 'completed'];
const CANCELLED_STATUSES = ['refunded', 'chargedback', 'chargeback', 'cancelled'];

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
  });
}

async function verifySignature(request: Request, body: string): Promise<boolean> {
  const signature = request.headers.get('x-kiwify-signature')
    || request.headers.get('x-webhook-signature');

  const secret = process.env.KIWIFY_WEBHOOK_SECRET;

  if (!secret) {
    console.warn('⚠️ KIWIFY_WEBHOOK_SECRET not configured – skipping signature verification');
    return true;
  }

  if (!signature) {
    console.error('❌ Missing webhook signature header');
    return false;
  }

  try {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(body));
    const expectedSignature = Array.from(new Uint8Array(sig))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    // Timing-safe comparison
    if (signature.length !== expectedSignature.length) return false;
    const a = new TextEncoder().encode(signature);
    const b2 = new TextEncoder().encode(expectedSignature);
    let diff = 0;
    for (let i = 0; i < a.length; i++) {
      diff |= a[i] ^ b2[i];
    }
    return diff === 0;
  } catch (err) {
    console.error('Signature verification error:', err);
    return false;
  }
}

export async function handleKiwifyWebhook(request: Request): Promise<Response> {
  try {
    const rawBody = await request.text();

    const isValid = await verifySignature(request, rawBody);
    if (!isValid) {
      return jsonResponse({ status: 'error', message: 'Invalid signature' }, 401);
    }

    const body = JSON.parse(rawBody);

    const event = body.event || '';
    const orderStatus = (
      body.status ||
      body.order_status ||
      body.payment_status ||
      body.subscription_status ||
      ''
    ).toLowerCase();

    const buyerName =
      body.user_data?.name ||
      body.Customer?.full_name ||
      body.customer?.name ||
      body.buyer_name ||
      'Comprador';

    const buyerEmail = (
      body.user_data?.email ||
      body.Customer?.email ||
      body.customer?.email ||
      body.buyer_email ||
      ''
    ).toLowerCase().trim();

    const orderId =
      body.order_id ||
      body.Transaction?.order_id ||
      body.transaction_id ||
      '';

    const productName =
      body.user_data?.plan ||
      body.Product?.name ||
      body.product?.name ||
      body.product_name ||
      'Paz em Canção';

    if (!buyerEmail) {
      return jsonResponse({ status: 'error', message: 'Missing buyer email' }, 400);
    }

    console.log(`📩 Kiwify webhook: event=${event} status=${orderStatus} email=${buyerEmail} order=${orderId}`);

    if (
      APPROVED_STATUSES.includes(orderStatus) ||
      event === 'purchase_completed' ||
      event === 'subscription_started'
    ) {
      const { error: dbError } = await supabaseAdmin
        .from('approved_buyers')
        .upsert(
          {
            nome: buyerName,
            email: buyerEmail,
            order_id: orderId,
            product_name: productName,
            status: 'approved',
            access_enabled: true,
          },
          { onConflict: 'email' }
        );

      if (dbError) {
        console.error('❌ DB upsert error:', dbError);
        return jsonResponse({ status: 'error', message: 'Failed to register buyer' }, 500);
      }

      console.log(`✅ Buyer approved: ${buyerEmail}`);
      return jsonResponse({ status: 'success', message: 'Webhook processed successfully.' });
    }

    if (CANCELLED_STATUSES.includes(orderStatus)) {
      const { error: dbError } = await supabaseAdmin
        .from('approved_buyers')
        .update({ access_enabled: false, status: orderStatus })
        .eq('email', buyerEmail);

      if (dbError) {
        console.error('❌ DB update error:', dbError);
        return jsonResponse({ status: 'error', message: 'Failed to update buyer status' }, 500);
      }

      console.log(`🚫 Buyer access revoked: ${buyerEmail} (${orderStatus})`);
      return jsonResponse({ status: 'success', message: 'Webhook processed successfully.' });
    }

    console.log(`ℹ️ Unhandled: event=${event} status=${orderStatus} email=${buyerEmail}`);
    return jsonResponse({ status: 'success', message: 'Event received but no action required.' });

  } catch (err: any) {
    console.error('❌ Webhook error:', err);
    return jsonResponse({ status: 'error', message: err.message || 'Webhook processing failed' }, 400);
  }
}
