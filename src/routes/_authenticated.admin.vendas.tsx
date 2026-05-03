import { createFileRoute } from "@tanstack/react-router";
import { TableSkeleton } from "@/components/LoadingSkeletons";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getSalesData } from "@/lib/admin-sales.functions";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DollarSign, ShoppingCart, TrendingUp, Target, Eye, Download, ChevronLeft, ChevronRight } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { format } from "date-fns";

export const Route = createFileRoute("/_authenticated/admin/vendas")({
  component: AdminSalesPage,
});

const PIE_COLORS = ["#d4a843", "#a67c2e", "#7a5a1f", "#c4983a", "#e6c16e"];

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  paid: { label: "Pago", variant: "default" },
  pending: { label: "Pendente", variant: "secondary" },
  cancelled: { label: "Cancelado", variant: "destructive" },
  refunded: { label: "Reembolsado", variant: "outline" },
};

function AdminSalesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-sales", page, search, statusFilter],
    queryFn: () => getSalesData({ data: { page, search, statusFilter } }),
  });

  const stats = data?.stats;
  const totalPages = data ? Math.ceil(data.totalTransactions / data.pageSize) : 1;

  const formatCurrency = (v: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Vendas</h1>
          <p className="text-sm text-muted-foreground">Acompanhe suas vendas e receitas</p>
        </div>
        <Button variant="outline" className="border-gold/30 text-gold hover:bg-gold/10">
          <Download className="h-4 w-4 mr-2" />
          Exportar CSV
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Receita Total"
          value={formatCurrency(stats?.totalRevenue || 0)}
          change={stats?.revenueChange || 0}
          icon={<DollarSign className="h-5 w-5" />}
        />
        <StatCard
          label="Vendas do Mês"
          value={String(stats?.salesThisMonth || 0)}
          change={stats?.salesChange || 0}
          icon={<ShoppingCart className="h-5 w-5" />}
        />
        <StatCard
          label="Ticket Médio"
          value={formatCurrency(stats?.avgTicket || 0)}
          change={stats?.ticketChange || 0}
          icon={<TrendingUp className="h-5 w-5" />}
        />
        <StatCard
          label="Taxa de Conversão"
          value={`${(stats?.conversionRate || 0).toFixed(1)}%`}
          change={0}
          icon={<Target className="h-5 w-5" />}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 bg-card border-border/30">
          <CardContent className="p-6">
            <h3 className="text-base font-semibold text-foreground mb-4">Receita ao Longo do Tempo</h3>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data?.monthlyRevenue || []}>
                  <defs>
                    <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--gold))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--gold))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border)/0.15)" />
                  <XAxis dataKey="month" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                  <YAxis
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                    tickFormatter={(v) => `R$ ${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border)/0.3)",
                      borderRadius: 8,
                      color: "hsl(var(--foreground))",
                    }}
                    formatter={(value: number) => [formatCurrency(value), "Receita"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="hsl(var(--gold))"
                    strokeWidth={2}
                    fill="url(#revenueGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/30">
          <CardContent className="p-6">
            <h3 className="text-base font-semibold text-foreground mb-4">Vendas por Plataforma</h3>
            <div className="h-[280px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data?.platformData || []}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    innerRadius={50}
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {(data?.platformData || []).map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border)/0.3)",
                      borderRadius: 8,
                      color: "hsl(var(--foreground))",
                    }}
                    formatter={(value: number) => [formatCurrency(value), "Receita"]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transactions */}
      <Card className="bg-card border-border/30">
        <CardContent className="p-6">
          <h3 className="text-base font-semibold text-foreground mb-4">Transações Recentes</h3>

          <div className="flex gap-3 mb-4">
            <Input
              placeholder="Buscar por aluno, curso ou ID..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="flex-1"
            />
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="paid">Pago</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="cancelled">Cancelado</SelectItem>
                <SelectItem value="refunded">Reembolsado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-lg border border-border/20 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-border/20">
                  <TableHead>ID</TableHead>
                  <TableHead>Aluno</TableHead>
                  <TableHead>Curso</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Método</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="w-[50px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableSkeleton rows={5} cols={8} />
                ) : (data?.transactions || []).length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      Nenhuma transação encontrada
                    </TableCell>
                  </TableRow>
                ) : (
                  (data?.transactions || []).map((txn: any) => {
                    const cfg = statusConfig[txn.status] || { label: txn.status, variant: "outline" as const };
                    return (
                      <TableRow key={txn.id} className="border-border/25">
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {txn.transaction_code}
                        </TableCell>
                        <TableCell className="font-semibold text-foreground">{txn.buyer_name}</TableCell>
                        <TableCell>{txn.course_title}</TableCell>
                        <TableCell className="text-gold font-medium">
                          {formatCurrency(Number(txn.amount))}
                        </TableCell>
                        <TableCell>
                          <Badge variant={cfg.variant} className="text-xs">
                            {cfg.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">{txn.payment_method || "—"}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {format(new Date(txn.created_at), "dd/MM/yyyy")}
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" className="h-7 w-7">
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {data && data.totalTransactions > 0 && (
            <div className="flex items-center justify-between mt-4">
              <span className="text-xs text-muted-foreground">
                Mostrando {(page - 1) * data.pageSize + 1} a {Math.min(page * data.pageSize, data.totalTransactions)} de {data.totalTransactions} transações
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage(p => p - 1)}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage(p => p + 1)}
                >
                  Próxima
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ label, value, change, icon }: { label: string; value: string; change: number; icon: React.ReactNode }) {
  return (
    <Card className="bg-card border-border/30">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-muted-foreground mb-1">{label}</p>
            <p className="text-2xl font-bold text-foreground">{value}</p>
            {change !== 0 && (
              <p className={`text-xs mt-1 flex items-center gap-1 ${change > 0 ? "text-emerald-400" : "text-red-400"}`}>
                <TrendingUp className={`h-3 w-3 ${change < 0 ? "rotate-180" : ""}`} />
                {change > 0 ? "+" : ""}{change}% vs mês anterior
              </p>
            )}
          </div>
          <div className="h-9 w-9 rounded-lg bg-gold/10 flex items-center justify-center text-gold/60">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
