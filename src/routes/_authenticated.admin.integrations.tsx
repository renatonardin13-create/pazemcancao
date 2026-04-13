import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getIntegrationsDashboard } from "@/lib/admin-integrations.functions";
import { getWebhookLogs } from "@/lib/webhook-settings.functions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Webhook, CheckCircle2, ShoppingCart, TrendingUp, ArrowLeft, ScrollText, Copy, Settings, Lightbulb, ExternalLink } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/integrations")({
  component: IntegrationsPage,
});

const platformColors: Record<string, { bg: string; text: string; dot: string }> = {
  hotmart: { bg: "bg-orange-500/15 text-orange-400 border-orange-500/30", text: "text-orange-400", dot: "bg-orange-500" },
  kiwify: { bg: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30", text: "text-emerald-400", dot: "bg-emerald-500" },
  cakto: { bg: "bg-blue-500/15 text-blue-400 border-blue-500/30", text: "text-blue-400", dot: "bg-blue-500" },
};

function IntegrationsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["integrations-dashboard"],
    queryFn: () => getIntegrationsDashboard(),
  });

  const stats = data?.stats;
  const integrations = data?.integrations || [];

  const webhookBaseUrl = "https://pazemcancao.lovable.app/api/webhook/kiwify";

  const handleCopyUrl = (courseId: string) => {
    const url = `${webhookBaseUrl}?course=${courseId}`;
    navigator.clipboard.writeText(url);
    toast.success("URL do webhook copiada!");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/admin" className="text-muted-foreground/50 hover:text-muted-foreground transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <Webhook className="h-5 w-5 text-gold/60" />
              <h1 className="text-2xl font-bold text-foreground">Integrações</h1>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              Configure webhooks para liberar acesso automático após compras
            </p>
          </div>
        </div>
        <Link to="/admin/integrations/logs" className="hidden">
          <Button variant="outline" className="border-border/30">
            <ScrollText className="h-4 w-4 mr-2" />
            Ver Logs Completos
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Webhooks"
          value={String(stats?.totalWebhooks || 0)}
          icon={<TrendingUp className="h-5 w-5" />}
          color="text-gold/60"
        />
        <StatCard
          label="Webhooks Ativos"
          value={String(stats?.activeWebhooks || 0)}
          icon={<CheckCircle2 className="h-5 w-5" />}
          color="text-emerald-400"
          valueColor="text-emerald-400"
        />
        <StatCard
          label="Total Vendas"
          value={String(stats?.totalSales || 0)}
          icon={<ShoppingCart className="h-5 w-5" />}
          color="text-gold/60"
        />
        <StatCard
          label="Taxa Sucesso"
          value={`${stats?.successRate || 0}%`}
          icon={<TrendingUp className="h-5 w-5" />}
          color="text-gold/60"
        />
      </div>

      {/* Webhooks por Curso */}
      <Card className="bg-card border-border/30">
        <CardContent className="p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-foreground">Webhooks por Curso</h3>
            <p className="text-sm text-muted-foreground">Webhooks configurados e vinculados a cursos específicos</p>
          </div>

          <div className="rounded-lg border border-border/20 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-border/20">
                  <TableHead>Curso</TableHead>
                  <TableHead>Plataforma</TableHead>
                  <TableHead>Product ID</TableHead>
                  <TableHead className="text-center">Vendas</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Carregando...
                    </TableCell>
                  </TableRow>
                ) : integrations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Nenhuma integração configurada
                    </TableCell>
                  </TableRow>
                ) : (
                  integrations.map((integ) => {
                    const pc = platformColors[integ.platform] || platformColors.kiwify;
                    return (
                      <TableRow key={integ.id} className="border-border/10">
                        <TableCell className="font-medium">{integ.courseTitle}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`text-[10px] ${pc.bg}`}>
                            {integ.platform.charAt(0).toUpperCase() + integ.platform.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {integ.externalProductId || "—"}
                        </TableCell>
                        <TableCell className="text-center">{integ.sales}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`text-[10px] ${
                              integ.webhookActive && integ.isEnabled
                                ? "border-emerald-500/30 text-emerald-400"
                                : "border-red-500/30 text-red-400"
                            }`}
                          >
                            {integ.webhookActive && integ.isEnabled ? "Ativo" : "Inativo"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => handleCopyUrl(integ.courseId)}
                              title="Copiar URL do webhook"
                            >
                              <Copy className="h-3.5 w-3.5" />
                            </Button>
                            <Link to="/admin/courses/$courseId" params={{ courseId: integ.courseId }}>
                              <Button variant="ghost" size="icon" className="h-7 w-7" title="Configurações do curso">
                                <Settings className="h-3.5 w-3.5" />
                              </Button>
                            </Link>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Hint */}
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-muted/10 border border-border/15 px-4 py-3">
            <Lightbulb className="h-4 w-4 text-amber-400 shrink-0" />
            <p className="text-xs text-muted-foreground">
              Configure webhooks na aba <span className="font-semibold text-foreground/70">Configurações</span> de cada curso
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Platform Guides */}
      <Card className="bg-card border-border/30">
        <CardContent className="p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-foreground">Como Integrar com as Plataformas</h3>
            <p className="text-sm text-muted-foreground">Guias passo a passo para configurar webhooks em cada plataforma</p>
          </div>

          <Accordion type="single" collapsible className="space-y-2">
            <AccordionItem value="hotmart" className="border border-border/15 rounded-lg px-4">
              <AccordionTrigger className="hover:no-underline py-4">
                <div className="flex items-center gap-3">
                  <span className="h-2.5 w-2.5 rounded-full bg-orange-500" />
                  <span className="font-semibold text-foreground">Hotmart</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-4">
                <ol className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex gap-2"><span className="text-gold font-bold">1.</span> Acesse o painel da Hotmart → Ferramentas → Webhooks</li>
                  <li className="flex gap-2"><span className="text-gold font-bold">2.</span> Clique em "Adicionar Webhook"</li>
                  <li className="flex gap-2"><span className="text-gold font-bold">3.</span> Cole a URL do webhook do curso (copie na tabela acima)</li>
                  <li className="flex gap-2"><span className="text-gold font-bold">4.</span> Selecione o evento "PURCHASE_APPROVED"</li>
                  <li className="flex gap-2"><span className="text-gold font-bold">5.</span> Salve e teste a integração</li>
                </ol>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="kiwify" className="border border-border/15 rounded-lg px-4">
              <AccordionTrigger className="hover:no-underline py-4">
                <div className="flex items-center gap-3">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  <span className="font-semibold text-foreground">Kiwify</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-4">
                <ol className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex gap-2"><span className="text-gold font-bold">1.</span> Acesse a Kiwify → Configurações → Webhooks</li>
                  <li className="flex gap-2"><span className="text-gold font-bold">2.</span> Clique em "Adicionar novo webhook"</li>
                  <li className="flex gap-2"><span className="text-gold font-bold">3.</span> Cole a URL do webhook do curso</li>
                  <li className="flex gap-2"><span className="text-gold font-bold">4.</span> Selecione "Compra aprovada" como evento</li>
                  <li className="flex gap-2"><span className="text-gold font-bold">5.</span> Configure o token de autenticação (opcional)</li>
                </ol>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="cakto" className="border border-border/15 rounded-lg px-4">
              <AccordionTrigger className="hover:no-underline py-4">
                <div className="flex items-center gap-3">
                  <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                  <span className="font-semibold text-foreground">Cakto</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-4">
                <ol className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex gap-2"><span className="text-gold font-bold">1.</span> Acesse o painel Cakto → Integrações → Webhooks</li>
                  <li className="flex gap-2"><span className="text-gold font-bold">2.</span> Adicione uma nova URL de webhook</li>
                  <li className="flex gap-2"><span className="text-gold font-bold">3.</span> Cole a URL do webhook do curso</li>
                  <li className="flex gap-2"><span className="text-gold font-bold">4.</span> Selecione os eventos de compra aprovada</li>
                  <li className="flex gap-2"><span className="text-gold font-bold">5.</span> Salve e faça um teste</li>
                </ol>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ label, value, icon, color, valueColor }: {
  label: string;
  value: string;
  icon: React.ReactNode;
  color: string;
  valueColor?: string;
}) {
  return (
    <Card className="bg-card border-border/30">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-muted-foreground mb-1">{label}</p>
            <p className={`text-2xl font-bold ${valueColor || "text-gold"}`}>{value}</p>
          </div>
          <div className={`h-9 w-9 rounded-lg bg-muted/15 flex items-center justify-center ${color}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
