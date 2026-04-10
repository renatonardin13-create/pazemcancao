import { createServerFn } from '@tanstack/react-start';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { handleKiwifyWebhook } from '@/lib/kiwify-webhook.functions';

export const getWebhookSettings = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const { data, error } = await supabase
      .from('webhook_settings')
      .select('*')
      .eq('provider', 'kiwify')
      .maybeSingle();

    if (error) throw new Error(error.message);
    return { settings: data };
  });

export const updateWebhookSettings = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: {
    is_active: boolean;
    monitored_events: string[];
    auth_token?: string;
    webhook_url?: string;
    allowed_ips?: string[];
  }) => input)
  .handler(async ({ data, context }) => {
    const { supabase } = context;

    const { error } = await supabase
      .from('webhook_settings')
      .upsert(
        {
          provider: 'kiwify',
          webhook_url: data.webhook_url || 'https://pazemcancao.lovable.app/api/webhook/kiwify',
          is_active: data.is_active,
          monitored_events: data.monitored_events,
          auth_token: data.auth_token || null,
          allowed_ips: data.allowed_ips || [],
        },
        { onConflict: 'provider' }
      );

    if (error) throw new Error(error.message);
    return { success: true };
  });

export const getWebhookLogs = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const { data, error } = await supabase
      .from('webhook_logs')
      .select('*')
      .eq('provider', 'kiwify')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw new Error(error.message);
    return { logs: data || [] };
  });

export const sendTestWebhook = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { email: string; name: string; token?: string }) => input)
  .handler(async ({ data, context }) => {
    const { supabase } = context;

    const token = data.token || '';

    const testPayload = {
      order_status: 'paid',
      order_id: `TEST-${Date.now()}`,
      customer: {
        email: data.email.toLowerCase().trim(),
        name: data.name || 'Teste Manual',
      },
      product: { name: 'Paz em Canção' },
      _test: true,
    };

    const request = new Request('https://pazemcancao.lovable.app/api/webhook/kiwify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'x-kiwify-token': token } : {}),
      },
      body: JSON.stringify(testPayload),
    });

    const res = await handleKiwifyWebhook(request);
    const resultText = await res.text();

    return { status: res.status, resultText };
  });
