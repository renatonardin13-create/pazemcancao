import { createServerFn } from '@tanstack/react-start';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { supabaseAdmin } from '@/integrations/supabase/client.server';

export const listUserNotifications = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: userData } = await context.supabase.auth.getUser();
    const email = userData?.user?.email;
    if (!email) throw new Error('Email não encontrado');

    const { data, error } = await context.supabase
      .from('notifications')
      .select('*')
      .eq('email', email)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) throw new Error(error.message);
    return { notifications: data || [] };
  });

export const markNotificationRead = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', data.id);

    if (error) throw new Error(error.message);
    return { success: true };
  });

export const markAllNotificationsRead = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: userData } = await context.supabase.auth.getUser();
    const email = userData?.user?.email;
    if (!email) throw new Error('Email não encontrado');

    const { error } = await context.supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('email', email)
      .eq('is_read', false);

    if (error) throw new Error(error.message);
    return { success: true };
  });

export const sendBonusNotification = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { trackTitle: string; releaseDate?: string }) => input)
  .handler(async ({ data, context }) => {
    // Verify admin
    const { data: role } = await context.supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', context.userId)
      .eq('role', 'admin')
      .maybeSingle();

    const { data: userData } = await context.supabase.auth.getUser();
    const isAdminEmail = userData?.user?.email?.toLowerCase() === 'renatonardin13@gmail.com';
    if (!role && !isAdminEmail) throw new Error('Não autorizado');

    // Get all approved buyers with access
    const { data: buyers, error: buyersError } = await supabaseAdmin
      .from('approved_buyers')
      .select('email')
      .eq('access_enabled', true);

    if (buyersError) throw new Error(buyersError.message);
    if (!buyers?.length) return { sent: 0 };

    const releaseDateStr = data.releaseDate
      ? new Date(data.releaseDate + 'T00:00:00').toLocaleDateString('pt-BR')
      : 'agora';

    const notifications = buyers.map((buyer) => ({
      email: buyer.email,
      title: '🎁 Novo Bônus Disponível!',
      message: `A música bônus "${data.trackTitle}" foi liberada! ${data.releaseDate ? `Data de liberação: ${releaseDateStr}` : 'Acesse agora na seção de músicas.'}`,
      type: 'bonus',
    }));

    const { error } = await supabaseAdmin
      .from('notifications')
      .insert(notifications);

    if (error) throw new Error(error.message);
    return { sent: notifications.length };
  });
