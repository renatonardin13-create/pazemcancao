import { createFileRoute } from "@tanstack/react-router";
import { Receipt } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/transactions")({
  component: AdminTransactionsPage,
});

function AdminTransactionsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-black text-foreground tracking-tight">
            Transações
          </h1>
          <p className="text-xs text-muted-foreground/50 mt-0.5">
            Acompanhe o histórico de vendas e transações
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-border/30 bg-card p-12 flex flex-col items-center justify-center text-center">
        <div className="h-16 w-16 rounded-full bg-gold/5 border border-gold/10 flex items-center justify-center mb-6">
          <Receipt className="h-8 w-8 text-gold/40" />
        </div>
        <h2 className="text-xl font-bold text-foreground/80 mb-2">Módulo em desenvolvimento</h2>
        <p className="text-muted-foreground/60 max-w-sm">
          Estamos integrando os dados de transações para que você possa acompanhar tudo em um só lugar.
        </p>
      </div>
    </div>
  );
}
