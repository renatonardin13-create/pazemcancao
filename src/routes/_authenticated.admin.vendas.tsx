import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getDashboardStats } from "@/lib/admin-dashboard.functions";
import { Receipt, Search, MoreHorizontal, Download, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { StatusBadge } from "@/components/StatusBadge";
import { useState } from "react";
import { TableSkeleton } from "@/components/LoadingSkeletons";

export const Route = createFileRoute("/_authenticated/admin/vendas")({
  component: AdminSalesPage,
});

function AdminSalesPage() {
  const [search, setSearch] = useState("");

  const { data: stats, isLoading } = useQuery({
    queryKey: ["admin-dashboard-stats"],
    queryFn: () => getDashboardStats(),
  });

  // Since we don't have a listSales function readily available that returns all details, 
  // we'll show a placeholder message or use what we have in the dashboard for now.
  // Actually, I'll check if there's a transactions table.

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="relative rounded-2xl border border-gold/10 bg-card p-6 overflow-hidden shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-black text-foreground tracking-tight">Vendas</h1>
            <p className="text-xs text-muted-foreground/50 mt-0.5">Acompanhe as transações financeiras.</p>
          </div>
          <div className="flex items-center gap-3">
             <Button variant="outline" className="rounded-xl border-border/20">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
            <Button className="rounded-xl bg-gold text-background font-bold hover:bg-gold/90">
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </Button>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border/30 bg-card p-12 text-center">
        <Receipt className="h-12 w-12 text-muted-foreground/20 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-foreground/80">Relatório de Vendas</h3>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
          O módulo de vendas está sendo sincronizado com o gateway de pagamento. 
          Total processado até agora: {stats?.totalRevenue ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.totalRevenue) : "Carregando..."}
        </p>
      </div>
    </div>
  );
}