import { createServerFn } from '@tanstack/react-start';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { supabaseAdmin } from '@/integrations/supabase/client.server';

async function verifyAdmin(supabase: any, userId: string) {
  const { data: role } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .eq('role', 'admin')
    .maybeSingle();

  const { data: userData } = await supabase.auth.getUser();
  const isAdminEmail = userData?.user?.email?.toLowerCase() === 'renatonardin13@gmail.com';

  if (!role && !isAdminEmail) throw new Error('Não autorizado');
}

export const getIntegrationsDashboard = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await verifyAdmin(context.supabase, context.userId);

    const [{ data: integrations }, { data: logs }, { data: enrollments }] = await Promise.all([
      supabaseAdmin
        .from('ofertas')
        .select('*, ofertas_produtos(produto_id)')
        .order('created_at', { ascending: false }),
      supabaseAdmin
        .from('webhook_logs')
        .select('response_status')
        .limit(1000),
      supabaseAdmin
        .from('acessos_usuario')
        .select('produto_id, status')
        .eq('status', 'ativo'),
    ]);

    const allOffers = integrations || [];
    const allLogs = logs || [];
    const allAccess = enrollments || [];

    return {
      stats: {
        totalWebhooks: allOffers.length,
        activeWebhooks: allOffers.filter((item) => item.status === 'ativa').length,
        totalSales: allAccess.length,
        successRate: allLogs.length > 0
          ? Math.round((allLogs.filter((item) => item.response_status === 200).length / allLogs.length) * 100)
          : 0,
      },
      integrations: allOffers.map((item) => ({
        id: item.id,
        nome: item.nome,
        platform: item.gateway,
        externalProductId: item.codigo_externo,
        isEnabled: item.status === 'ativa',
        status: item.status,
        sales: allAccess.filter(a => item.ofertas_produtos?.some((op: any) => op.produto_id === a.produto_id)).length,
      })),
    };
  });

export const listAdminOffers = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }: { context: any }) => {
    await verifyAdmin(context.supabase, context.userId);
    const { data, error } = await supabaseAdmin
      .from('ofertas')
      .select('*, ofertas_produtos(produto_id, produtos(nome, tipo))')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  });

export const listAdminProducts = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }: { context: any }) => {
    await verifyAdmin(context.supabase, context.userId);
    const { data, error } = await supabaseAdmin
      .from('produtos')
      .select('*')
      .order('nome', { ascending: true });

    if (error) throw error;
    return data;
  });

export const createOfferWithProducts = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: any) => d)
  .handler(async ({ data, context }: { data: any, context: any }) => {
    await verifyAdmin(context.supabase, context.userId);
    const { 
      nome,
      gateway,
      modalidade,
      codigo_externo,
      token,
      status,
      productIds 
    } = data;

    // 1. Create Offer
    const { data: offer, error: offerError } = await supabaseAdmin
      .from('ofertas')
      .insert({
        nome,
        gateway,
        modalidade,
        codigo_externo,
        token,
        status: status || 'rascunho'
      })
      .select()
      .single();

    if (offerError) throw offerError;

    // 2. Link Products
    if (productIds && productIds.length > 0) {
      const links = productIds.map((pId: string) => ({
        oferta_id: offer.id,
        produto_id: pId
      }));

      const { error: linkError } = await supabaseAdmin
        .from('ofertas_produtos')
        .insert(links);

      if (linkError) throw linkError;
    }

    return offer;
  });

export const deleteOffer = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: string) => d)
  .handler(async ({ data: offerId, context }: { data: string, context: any }) => {
    await verifyAdmin(context.supabase, context.userId);
    const { error } = await supabaseAdmin
      .from('ofertas')
      .delete()
      .eq('id', offerId);

    if (error) throw error;
    return { success: true };
  });

export const toggleOfferStatus = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string, status: string }) => d)
  .handler(async ({ data, context }: { data: { id: string, status: string }, context: any }) => {
    await verifyAdmin(context.supabase, context.userId);
    const { error } = await supabaseAdmin
      .from('ofertas')
      .update({ status: data.status })
      .eq('id', data.id);

    if (error) throw error;
    return { success: true };
  });

