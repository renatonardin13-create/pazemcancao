import { LayoutDashboard, Users, GraduationCap, Music, CreditCard } from "lucide-react";
import { AdminSidebar } from "@/components/AdminSidebar";
import { AppHeader } from "@/components/AppHeader";

export function AdminDashboard() {
  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <div className="flex-1">
        <AppHeader />
        <main className="p-8">
          <div className="max-w-6xl mx-auto space-y-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
              <p className="text-muted-foreground mt-1">Bem-vindo ao seu painel de controle</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard icon={Users} label="Total de Usuários" value="--" />
              <StatCard icon={GraduationCap} label="Produtos Ativos" value="--" />
              <StatCard icon={Music} label="Louvores" value="--" />
              <StatCard icon={CreditCard} label="Vendas (Mês)" value="--" />
            </div>
            
            <div className="bg-card rounded-2xl border border-border/10 p-12 text-center">
              <LayoutDashboard className="h-12 w-12 text-muted-foreground/20 mx-auto mb-4" />
              <h3 className="text-lg font-medium">Resumo de Atividade</h3>
              <p className="text-sm text-muted-foreground">Em breve você verá estatísticas detalhadas aqui.</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: any, label: string, value: string }) {
  return (
    <div className="bg-card rounded-2xl border border-border/10 p-6 flex items-center gap-4">
      <div className="h-12 w-12 rounded-xl bg-gold/10 flex items-center justify-center">
        <Icon className="h-6 w-6 text-gold" />
      </div>
      <div>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  );
}
