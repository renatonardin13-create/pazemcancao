import { createFileRoute } from "@tanstack/react-router";
import { Shield, Server, Key, Link as LinkIcon, CheckCircle2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/admin/integracoes")({
  component: AdminIntegrationsPage,
});

function AdminIntegrationsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-2xl font-black text-foreground tracking-tight">Integrações</h1>
        <p className="text-xs text-muted-foreground/50 mt-0.5">Conecte sua plataforma com serviços externos.</p>
      </div>

      <div className="grid gap-6">
        <Card className="bg-card/40 border-border/10 rounded-3xl overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Server className="h-5 w-5 text-gold" />
                Webhook
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground/60">Receba notificações de pagamentos em tempo real.</CardDescription>
            </div>
            <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 px-3 rounded-full text-[10px] font-bold uppercase tracking-widest">Ativo</Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-xl bg-black/10 border border-border/10 font-mono text-[11px] text-muted-foreground break-all">
              https://pazemcancao.lovable.app/api/webhook
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" className="rounded-xl border-border/20 text-xs font-bold">
                <Key className="h-3.5 w-3.5 mr-2" />
                Ver Token de Acesso
              </Button>
              <Button size="sm" variant="ghost" className="rounded-xl text-xs font-bold text-muted-foreground">
                <LinkIcon className="h-3.5 w-3.5 mr-2" />
                Documentação
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/40 border-border/10 rounded-3xl overflow-hidden opacity-60 grayscale cursor-not-allowed">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-400" />
                Checkout Transparente
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground/60">Integre Stripe ou Hotmart diretamente.</CardDescription>
            </div>
            <Badge variant="outline" className="px-3 rounded-full text-[10px] font-bold uppercase tracking-widest opacity-50">Disponível em breve</Badge>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-xs text-muted-foreground/50">
              <AlertTriangle className="h-3.5 w-3.5" />
              Configure seu gateway para habilitar vendas automáticas.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}