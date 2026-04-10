import { createFileRoute } from '@tanstack/react-router';
import { CORS_HEADERS } from '@/lib/cors';

// PRD specifies /webhook as the public URL for Kiwify
// This route proxies to the main handler at /api/webhook/kiwify
export const Route = createFileRoute('/webhook')({
  server: {
    handlers: {
      OPTIONS: async () => {
        return new Response(null, { status: 204, headers: CORS_HEADERS });
      },

      POST: async ({ request }) => {
        // Forward to the main webhook handler
        const url = new URL(request.url);
        url.pathname = '/api/webhook/kiwify';

        const forwardedResponse = await fetch(url.toString(), {
          method: 'POST',
          headers: request.headers,
          body: await request.text(),
        });

        return forwardedResponse;
      },
    },
  },
});
