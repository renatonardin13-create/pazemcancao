import { createFileRoute } from '@tanstack/react-router';
import { CORS_HEADERS } from '@/lib/cors';
import { handleKiwifyWebhook } from '@/lib/kiwify-webhook.server';

// PRD URL: https://pazemcancao.lovable.app/webhook
export const Route = createFileRoute('/webhook')({
  server: {
    handlers: {
      OPTIONS: async () => {
        return new Response(null, { status: 204, headers: CORS_HEADERS });
      },
      POST: async ({ request }) => handleKiwifyWebhook(request),
    },
  },
});
