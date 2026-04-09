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

    return {
      hasAccess: !!buyer,
      buyer: buyer ? { nome: buyer.nome, product_name: buyer.product_name } : null,
    };
  });
