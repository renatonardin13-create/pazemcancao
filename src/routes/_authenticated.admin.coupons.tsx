import { createFileRoute } from "@tanstack/react-router";
import { EmptyState } from "@/components/EmptyState";
import { Tag } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/coupons")({
  component: AdminCouponsPage,
});

function AdminCouponsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-black text-foreground tracking-tight">
            Cupons
          </h1>
          <p className="text-xs text-muted-foreground/50 mt-0.5">
            Gerencie seus cupons de desconto
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-border/30 bg-card p-12 flex flex-col items-center justify-center text-center">
        <div className="h-16 w-16 rounded-full bg-gold/5 border border-gold/10 flex items-center justify-center mb-6">
          <Tag className="h-8 w-8 text-gold/40" />
        </div>
        <h2 className="text-xl font-bold text-foreground/80 mb-2">Módulo em desenvolvimento</h2>
        <p className="text-muted-foreground/60 max-w-sm">
          Esta funcionalidade está sendo preparada para você. Em breve você poderá criar e gerenciar seus cupons aqui.
        </p>
      </div>
    </div>
  );
}
