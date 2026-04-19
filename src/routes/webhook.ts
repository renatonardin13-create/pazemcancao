import { createFileRoute } from '@tanstack/react-router';
import { CORS_HEADERS } from '@/lib/cors';
import { handleKiwifyWebhook } from '@/lib/kiwify-webhook.functions';

// PRD URL: https://pazemcancao.lovable.app/webhook
export const Route = createFileRoute('/webhook')({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS_HEADERS }),
      GET: async () =>
        new Response(
          JSON.stringify({ ok: true, message: 'Kiwify webhook endpoint alive. Use POST.' }),
          { status: 200, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } }
        ),
      POST: async ({ request }) => {
        const res = await handleKiwifyWebhook(request);
        console.log('[KIWIFY-WEBHOOK] Final status:', res.status);
        return res;
      },
    },
  },
});
