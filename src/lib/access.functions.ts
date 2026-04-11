import { createServerFn } from '@tanstack/react-start';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';

export const checkBuyerAccess = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;

    // Check if user is admin first — admins bypass buyer check entirely
    const { data: adminRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .maybeSingle();

    if (adminRole) {
      return { hasAccess: true, buyer: { nome: 'Administrador', product_name: null } };
    }

    // Get user email from auth
    const { data: userData } = await supabase.auth.getUser();
    const email = userData?.user?.email;

    if (!email) {
      return { hasAccess: false, buyer: null };
    }

    const { data: buyer } = await supabase
      .from('approved_buyers')
      .select('*')
      .eq('email', email.toLowerCase())
      .eq('access_enabled', true)
      .maybeSingle();

    if (!buyer) {
      return { hasAccess: false, buyer: null, isTrial: false, trialExpired: false, canDownload: true };
    }

    // Check if trial has expired
    const isTrial = buyer.is_trial === true;
    const trialExpired = isTrial && buyer.trial_expires_at && new Date(buyer.trial_expires_at) < new Date();

    if (trialExpired) {
      // Auto-block expired trial
      const { createClient } = await import('@supabase/supabase-js');
      const adminUrl = process.env.SUPABASE_URL;
      const adminKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      if (adminUrl && adminKey) {
        const adminClient = createClient(adminUrl, adminKey, { auth: { persistSession: false, autoRefreshToken: false } });
        await adminClient.from('approved_buyers').update({ access_enabled: false }).eq('id', buyer.id);
      }
      return { hasAccess: false, buyer: null, isTrial: true, trialExpired: true, canDownload: false };
    }

    return {
      hasAccess: true,
      buyer: { nome: buyer.nome, product_name: buyer.product_name },
      isTrial,
      trialExpired: false,
      canDownload: buyer.can_download !== false,
      trialExpiresAt: buyer.trial_expires_at,
    };
  });
