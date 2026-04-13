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

export const getSalesData = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { page?: number; search?: string; statusFilter?: string }) => input)
  .handler(async ({ data, context }) => {
    await verifyAdmin(context.supabase, context.userId);

    const page = data?.page || 1;
    const pageSize = 10;
    const offset = (page - 1) * pageSize;

    // Stats
    const [
      { data: allTxns },
      { count: totalCount },
    ] = await Promise.all([
      supabaseAdmin.from('transactions').select('amount, status, created_at, platform'),
      supabaseAdmin.from('transactions').select('*', { count: 'exact', head: true }),
    ]);

    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();
    const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
    const lastMonthYear = thisMonth === 0 ? thisYear - 1 : thisYear;

    const txns = allTxns || [];
    const paidTxns = txns.filter(t => t.status === 'paid');

    const thisMonthTxns = paidTxns.filter(t => {
      const d = new Date(t.created_at);
      return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
    });
    const lastMonthTxns = paidTxns.filter(t => {
      const d = new Date(t.created_at);
      return d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear;
    });

    const totalRevenue = paidTxns.reduce((s, t) => s + Number(t.amount), 0);
    const thisMonthRevenue = thisMonthTxns.reduce((s, t) => s + Number(t.amount), 0);
    const lastMonthRevenue = lastMonthTxns.reduce((s, t) => s + Number(t.amount), 0);
    const salesThisMonth = thisMonthTxns.length;
    const salesLastMonth = lastMonthTxns.length;
    const avgTicket = salesThisMonth > 0 ? thisMonthRevenue / salesThisMonth : 0;
    const avgTicketLast = salesLastMonth > 0 ? lastMonthRevenue / salesLastMonth : 0;

    const revenueChange = lastMonthRevenue > 0 ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue * 100) : 0;
    const salesChange = salesLastMonth > 0 ? ((salesThisMonth - salesLastMonth) / salesLastMonth * 100) : 0;
    const ticketChange = avgTicketLast > 0 ? ((avgTicket - avgTicketLast) / avgTicketLast * 100) : 0;

    // Platform distribution
    const platformMap: Record<string, number> = {};
    paidTxns.forEach(t => {
      platformMap[t.platform || 'outros'] = (platformMap[t.platform || 'outros'] || 0) + Number(t.amount);
    });
    const platformData = Object.entries(platformMap).map(([name, value]) => ({ name, value }));

    // Monthly revenue (last 12 months)
    const monthlyRevenue: { month: string; revenue: number }[] = [];
    const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(thisYear, thisMonth - i, 1);
      const m = d.getMonth();
      const y = d.getFullYear();
      const rev = paidTxns.filter(t => {
        const td = new Date(t.created_at);
        return td.getMonth() === m && td.getFullYear() === y;
      }).reduce((s, t) => s + Number(t.amount), 0);
      monthlyRevenue.push({ month: monthNames[m], revenue: rev });
    }

    // Transactions list with filter
    let query = supabaseAdmin.from('transactions').select('*', { count: 'exact' });
    if (data?.search) {
      query = query.or(`buyer_name.ilike.%${data.search}%,course_title.ilike.%${data.search}%,transaction_code.ilike.%${data.search}%`);
    }
    if (data?.statusFilter && data.statusFilter !== 'all') {
      query = query.eq('status', data.statusFilter);
    }
    const { data: transactions, count: filteredCount } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + pageSize - 1);

    // Conversion rate (paid / total)
    const conversionRate = txns.length > 0 ? (paidTxns.length / txns.length * 100) : 0;

    return {
      stats: {
        totalRevenue,
        salesThisMonth,
        avgTicket,
        conversionRate,
        revenueChange: +revenueChange.toFixed(1),
        salesChange: +salesChange.toFixed(1),
        ticketChange: +ticketChange.toFixed(1),
      },
      monthlyRevenue,
      platformData,
      transactions: transactions || [],
      totalTransactions: filteredCount || 0,
      page,
      pageSize,
    };
  });
