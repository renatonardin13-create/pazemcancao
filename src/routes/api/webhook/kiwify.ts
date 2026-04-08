import { createFileRoute } from '@tanstack/react-router';
import { createClient } from '@supabase/supabase-js';
import { CORS_HEADERS } from '@/lib/cors';

export const Route = createFileRoute('/api/webhook/kiwify')({
  server: {
    handlers: {
      OPTIONS: async () => {
        return new Response(null, { status: 204, headers: CORS_HEADERS });
      },

      POST: async ({ request }) => {
        try {
          const body = await request.json();

          // Kiwify sends order_status for approved purchases
          const status = body.order_status || body.payment_status;
          if (status !== 'paid' && status !== 'approved') {
            return new Response(
              JSON.stringify({ received: true, action: 'ignored', reason: 'not approved' }),
              { status: 200, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } }
            );
          }

          const supabaseUrl = process.env.SUPABASE_URL;
          const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

          if (!supabaseUrl || !serviceRoleKey) {
            console.error('Missing Supabase server env vars');
            return new Response(
              JSON.stringify({ error: 'Server configuration error' }),
              { status: 500, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } }
            );
          }

          const adminClient = createClient(supabaseUrl, serviceRoleKey, {
            auth: { persistSession: false, autoRefreshToken: false },
          });

          // Extract buyer info from Kiwify payload
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
            return new Response(
              JSON.stringify({ error: 'Missing buyer email' }),
              { status: 400, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } }
            );
          }

          // Upsert into approved_buyers
          const { error: dbError } = await adminClient
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
            console.error('DB upsert error:', dbError);
            return new Response(
              JSON.stringify({ error: 'Failed to register buyer' }),
              { status: 500, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } }
            );
          }

          console.log(`✅ Buyer approved: ${buyerEmail}`);

          return new Response(
            JSON.stringify({ received: true, action: 'buyer_approved', email: buyerEmail }),
            { status: 200, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } }
          );
        } catch (err: any) {
          console.error('Webhook error:', err);
          return new Response(
            JSON.stringify({ error: err.message || 'Webhook processing failed' }),
            { status: 400, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } }
          );
        }
      },
    },
  },
});
