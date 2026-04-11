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

    // First check with access_enabled
    let { data: buyer } = await supabase
      .from('approved_buyers')
      .select('*')
      .eq('email', email.toLowerCase())
      .eq('access_enabled', true)
      .maybeSingle();

    if (!buyer) {
      // Check if there's an expired trial (access_enabled may still be true but expired)
      const { data: trialBuyer } = await supabase
        .from('approved_buyers')
        .select('*')
        .eq('email', email.toLowerCase())
        .maybeSingle();

      if (trialBuyer?.is_trial && trialBuyer?.trial_expires_at) {
        const expired = new Date(trialBuyer.trial_expires_at) < new Date();
        if (expired) {
          // Let them through but locked
          return { hasAccess: true, buyer: { nome: trialBuyer.nome, product_name: trialBuyer.product_name }, isTrial: true, trialExpired: true, canDownload: false, trialExpiresAt: trialBuyer.trial_expires_at };
        }
      }

      return { hasAccess: false, buyer: null, isTrial: false, trialExpired: false, canDownload: true };
    }

    // Check if trial has expired
    const isTrial = buyer.is_trial === true;
    const trialExpired = isTrial && buyer.trial_expires_at && new Date(buyer.trial_expires_at) < new Date();

    if (trialExpired) {
      return { hasAccess: true, buyer: { nome: buyer.nome, product_name: buyer.product_name }, isTrial: true, trialExpired: true, canDownload: false, trialExpiresAt: buyer.trial_expires_at };
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
