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
import { Webhook, CheckCircle2, ShoppingCart, TrendingUp, ArrowLeft, ScrollText, Copy, Settings, Lightbulb, Box, Zap } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { motion } from "framer-motion";

export const Route = createFileRoute("/_authenticated/admin/integrations")({
  component: IntegrationsPage,
});

const platformColors: Record<string, { bg: string; text: string; dot: string }> = {
  hotmart: { bg: "bg-orange-500/15 text-orange-400 border-orange-500/30", text: "text-orange-400", dot: "bg-orange-500" },
  kiwify: { bg: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30", text: "text-emerald-400", dot: "bg-emerald-500" },
  perfect_pay: { bg: "bg-red-500/15 text-red-400 border-red-500/30", text: "text-red-400", dot: "bg-red-500" },
  perfectpay: { bg: "bg-red-500/15 text-red-400 border-red-500/30", text: "text-red-400", dot: "bg-red-500" },
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

  const handleCopyUrl = (offerId: string) => {
    const url = `${window.location.origin}/api/webhooks/payment?id=${offerId}`;
    navigator.clipboard.writeText(url);
    toast.success("URL do webhook copiada!");
  };

  return (
    <div className="max-w-6xl mx-auto space-y-4 pb-20">
      {/* Header */}
      <div className="relative rounded-2xl border border-gold/10 bg-gradient-to-r from-card via-card/80 to-card px-6 py-4 overflow-hidden shadow-xl shadow-black/10">
        <div className="pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full bg-gold/[0.05] blur-[60px]" />
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            <Link
              to="/admin"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-border/30 bg-background/30 text-muted-foreground/50 hover:text-gold hover:border-gold/20 hover:bg-gold/5 transition-all duration-200"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <h1 className="font-display text-xl font-black text-foreground tracking-tight">
                Integrações
              </h1>
              <p className="text-xs text-muted-foreground/50 mt-0.5">
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
        <DialogContent className="max-w-3xl max-h-[80vh] bg-card border-border/50">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ScrollText className="h-5 w-5 text-gold" />
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
                  <TableRow className="border-border/30">
                    <TableHead>Data</TableHead>
                    <TableHead>Evento</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Mensagem</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id} className="border-border/20">
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {log.created_at ? format(new Date(log.created_at), "dd/MM HH:mm") : "—"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[10px] uppercase">
                          {log.event_type || "—"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs max-w-[160px] truncate">{log.email || "—"}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`text-[10px] ${
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

      {/* Webhooks table */}
      <Card className="bg-card border-border/30">
        <CardContent className="p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-foreground">Ofertas Ativas</h3>
            <p className="text-sm text-muted-foreground">Listagem simplificada de integrações</p>
          </div>

          <div className="rounded-lg border border-border/20 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-border/20">
                  <TableHead>Nome</TableHead>
                  <TableHead>Plataforma</TableHead>
                  <TableHead>Código</TableHead>
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
                      Nenhuma oferta configurada
                    </TableCell>
                  </TableRow>
                ) : (
                  integrations.map((integ) => {
                    const pc = platformColors[integ.platform] || platformColors.kiwify;
                    return (
                      <TableRow key={integ.id} className="border-border/25">
                        <TableCell className="font-medium">{integ.nome}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`text-xs ${pc.bg}`}>
                            {integ.platform.charAt(0).toUpperCase() + integ.platform.slice(1).replace('_', ' ')}
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
                              integ.isEnabled
                                ? "border-emerald-500/30 text-emerald-400"
                                : "border-red-500/30 text-red-400"
                            }`}
                          >
                            {integ.isEnabled ? "Ativo" : "Inativo"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => handleCopyUrl(integ.id)}
                              title="Copiar URL do webhook"
                            >
                              <Copy className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ label, value, icon, color, valueColor }: any) {
  return (
    <Card className="bg-card/50 border-border/20">
      <CardContent className="p-4 flex items-center gap-4">
        <div className={`h-10 w-10 rounded-xl bg-background/50 border border-border/30 flex items-center justify-center ${color}`}>
          {icon}
        </div>
        <div>
          <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/50">{label}</p>
          <h4 className={`text-xl font-black tracking-tight ${valueColor || "text-foreground"}`}>{value}</h4>
        </div>
      </CardContent>
    </Card>
  );
}
