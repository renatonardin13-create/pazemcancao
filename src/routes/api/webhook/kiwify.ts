import { createFileRoute } from '@tanstack/react-router';
import { supabaseAdmin } from '@/integrations/supabase/client.server';
import { CORS_HEADERS } from '@/lib/cors';

// Kiwify event types we handle
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
  
  // If no secret configured, skip verification (log warning)
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
    
    return signature === expectedSignature;
  } catch (err) {
    console.error('Signature verification error:', err);
    return false;
  }
}

export const Route = createFileRoute('/api/webhook/kiwify')({
  server: {
    handlers: {
      OPTIONS: async () => {
        return new Response(null, { status: 204, headers: CORS_HEADERS });
      },

      POST: async ({ request }) => {
        try {
          const rawBody = await request.text();
          
          // Verify signature if secret is configured
          const isValid = await verifySignature(request, rawBody);
          if (!isValid) {
            return jsonResponse({ error: 'Invalid signature' }, 401);
          }

          const body = JSON.parse(rawBody);

          // Extract status from various Kiwify payload formats
          const orderStatus = (
            body.order_status || 
            body.payment_status || 
            body.subscription_status ||
            ''
          ).toLowerCase();

          // Extract buyer info from Kiwify payload (multiple format support)
          const buyerName =
            body.Customer?.full_name ||
            body.customer?.name ||
            body.buyer_name ||
            'Comprador';

          const buyerEmail = (
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
            body.Product?.name ||
            body.product?.name ||
            body.product_name ||
            'Paz em Canção';

          if (!buyerEmail) {
            return jsonResponse({ error: 'Missing buyer email' }, 400);
          }

          console.log(`📩 Kiwify webhook: status=${orderStatus}, email=${buyerEmail}, order=${orderId}`);

          // Handle approved/paid purchases
          if (APPROVED_STATUSES.includes(orderStatus)) {
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
              return jsonResponse({ error: 'Failed to register buyer' }, 500);
            }

            console.log(`✅ Buyer approved: ${buyerEmail}`);
            return jsonResponse({ received: true, action: 'buyer_approved', email: buyerEmail });
          }

          // Handle cancellations/refunds/chargebacks
          if (CANCELLED_STATUSES.includes(orderStatus)) {
            const { error: dbError } = await supabaseAdmin
              .from('approved_buyers')
              .update({ access_enabled: false, status: orderStatus })
              .eq('email', buyerEmail);

            if (dbError) {
              console.error('❌ DB update error:', dbError);
              return jsonResponse({ error: 'Failed to update buyer status' }, 500);
            }

            console.log(`🚫 Buyer access revoked: ${buyerEmail} (${orderStatus})`);
            return jsonResponse({ received: true, action: 'access_revoked', email: buyerEmail });
          }

          // Unknown or unhandled status – acknowledge receipt
          console.log(`ℹ️ Unhandled status: ${orderStatus} for ${buyerEmail}`);
          return jsonResponse({ received: true, action: 'ignored', reason: `unhandled status: ${orderStatus}` });

        } catch (err: any) {
          console.error('❌ Webhook error:', err);
          return jsonResponse({ error: err.message || 'Webhook processing failed' }, 400);
        }
      },
    },
  },
});
