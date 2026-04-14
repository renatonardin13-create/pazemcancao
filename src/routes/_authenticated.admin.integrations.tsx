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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Webhook, CheckCircle2, ShoppingCart, TrendingUp, ArrowLeft, ScrollText, Copy, Settings, Lightbulb } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export const Route = createFileRoute("/_authenticated/admin/integrations")({
  component: IntegrationsPage,
});

const platformColors: Record<string, { bg: string; text: string; dot: string }> = {
  hotmart: { bg: "bg-orange-500/15 text-orange-400 border-orange-500/30", text: "text-orange-400", dot: "bg-orange-500" },
  kiwify: { bg: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30", text: "text-emerald-400", dot: "bg-emerald-500" },
  cakto: { bg: "bg-blue-500/15 text-blue-400 border-blue-500/30", text: "text-blue-400", dot: "bg-blue-500" },
};

function IntegrationsPage() {
  const [logsOpen, setLogsOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["integrations-dashboard"],
    queryFn: () => getIntegrationsDashboard(),
  });

  const { data: logsData, isLoading: logsLoading } = useQuery({
    queryKey: ["webhook-logs"],
    queryFn: () => getWebhookLogs(),
    enabled: logsOpen,
  });

  const stats = data?.stats;
  const integrations = data?.integrations || [];
  const logs = logsData?.logs || [];

  const webhookBaseUrl = "https://pazemcancao.lovable.app/api/webhook/kiwify";

  const handleCopyUrl = (courseId: string) => {
    const url = `${webhookBaseUrl}?course=${courseId}`;
    navigator.clipboard.writeText(url);
    toast.success("URL do webhook copiada!");
  };

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      {/* Header */}
      <div className="relative rounded-2xl border border-gold/10 bg-gradient-to-r from-card via-card/80 to-card px-6 py-4 overflow-hidden shadow-xl shadow-black/10">
        <div className="pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full bg-gold/[0.05] blur-[60px]" />
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            <Link
              to="/admin"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-border/15 bg-background/30 text-muted-foreground/50 hover:text-gold hover:border-gold/20 hover:bg-gold/5 transition-all duration-200"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <h1 className="font-display text-xl font-black text-foreground tracking-tight">
                Integrações
              </h1>
              <p className="text-[11px] text-muted-foreground/50 mt-0.5">
                Configure webhooks para liberar acesso automático após compras
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => setLogsOpen(true)} className="gap-2">
            <ScrollText className="h-4 w-4" />
            Ver Logs
          </Button>
        </div>
      </div>

      {/* Logs Dialog */}
      <Dialog open={logsOpen} onOpenChange={setLogsOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ScrollText className="h-5 w-5" />
              Logs de Webhook
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[60vh]">
            {logsLoading ? (
              <p className="text-center py-8 text-muted-foreground">Carregando logs...</p>
            ) : logs.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">Nenhum log encontrado</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Evento</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Mensagem</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {format(new Date(log.created_at), "dd/MM HH:mm")}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {log.event_type || "—"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs max-w-[160px] truncate">{log.email || "—"}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`text-xs ${
                            log.response_status === 200
                              ? "border-emerald-500/30 text-emerald-400"
                              : "border-red-500/30 text-red-400"
                          }`}
                        >
                          {log.response_status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">
                        {log.response_message || "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

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
                          <Badge variant="outline" className={`text-xs ${pc.bg}`}>
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
                            className={`text-xs ${
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
              Configure webhooks na aba <span className="font-semibold text-foreground/90">Configurações</span> de cada curso
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
                <ol className="space-y-2.5 text-sm text-muted-foreground">
                  <li>1. Acesse o <span className="font-bold text-foreground">Painel Hotmart</span> → Produtos → Seu Produto</li>
                  <li>2. Vá em <span className="font-bold text-foreground">Configurações</span> → <span className="font-bold text-foreground">Integrações</span> → <span className="font-bold text-foreground">Webhooks</span></li>
                  <li>3. Clique em <span className="font-bold text-foreground">Adicionar webhook</span></li>
                  <li>4. Cole a URL do webhook gerada no MemberHero</li>
                  <li>5. Selecione os eventos: <code className="text-xs bg-muted/20 px-1.5 py-0.5 rounded font-mono">purchase.approved</code></li>
                  <li>6. Salve e teste o webhook</li>
                </ol>
                <div className="mt-4 rounded-lg bg-muted/10 border border-border/15 px-4 py-2.5">
                  <p className="text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground/90">Dica:</span> O email do comprador virá no campo <code className="text-xs bg-muted/20 px-1.5 py-0.5 rounded font-mono">buyer.email</code>
                  </p>
                </div>
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
                <ol className="space-y-2.5 text-sm text-muted-foreground">
                  <li>1. Acesse o <span className="font-bold text-foreground">Dashboard Kiwify</span> → Produtos</li>
                  <li>2. Selecione seu produto → <span className="font-bold text-foreground">Webhooks</span></li>
                  <li>3. Clique em <span className="font-bold text-foreground">Novo Webhook</span></li>
                  <li>4. Cole a URL do webhook do MemberHero</li>
                  <li>5. Ative os eventos: <code className="text-xs bg-muted/20 px-1.5 py-0.5 rounded font-mono">order.paid</code></li>
                  <li>6. Salve a configuração</li>
                </ol>
                <div className="mt-4 rounded-lg bg-muted/10 border border-border/15 px-4 py-2.5">
                  <p className="text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground/90">Dica:</span> O email virá em <code className="text-xs bg-muted/20 px-1.5 py-0.5 rounded font-mono">Customer.email</code>
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="cakto" className="border border-border/15 rounded-lg px-4">
              <AccordionTrigger className="hover:no-underline py-4">
                <div className="flex items-center gap-3">
                  <span className="h-2.5 w-2.5 rounded-full bg-purple-500" />
                  <span className="font-semibold text-foreground">Cakto</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-4">
                <ol className="space-y-2.5 text-sm text-muted-foreground">
                  <li>1. Acesse o <span className="font-bold text-foreground">Painel Cakto</span> → Produtos</li>
                  <li>2. Selecione seu produto → <span className="font-bold text-foreground">Integrações</span></li>
                  <li>3. Clique em <span className="font-bold text-foreground">Adicionar Webhook</span></li>
                  <li>4. Cole a URL do webhook gerada no MemberHero</li>
                  <li>5. Selecione os eventos de compra aprovada</li>
                  <li>6. Salve e teste a integração</li>
                </ol>
                <div className="mt-4 rounded-lg bg-muted/10 border border-border/15 px-4 py-2.5">
                  <p className="text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground/90">Dica:</span> O email do comprador virá no campo de dados do cliente
                  </p>
                </div>
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
