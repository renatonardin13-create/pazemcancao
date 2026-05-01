import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { listAdminOffers } from "@/lib/admin-integrations.functions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, ShoppingCart, ArrowLeft, ExternalLink, Copy, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { TableSkeleton } from "@/components/LoadingSkeletons";

export const Route = createFileRoute("/_authenticated/admin/offers")({
  component: OffersPage,
});

const platformColors: Record<string, { bg: string; text: string }> = {
  hotmart: { bg: "bg-orange-500/15 text-orange-400", text: "text-orange-400" },
  kiwify: { bg: "bg-emerald-500/15 text-emerald-400", text: "text-emerald-400" },
  perfectpay: { bg: "bg-red-500/15 text-red-400", text: "text-red-400" },
  cakto: { bg: "bg-blue-500/15 text-blue-400", text: "text-blue-400" },
};

function OffersPage() {
  const { data: offers, isLoading } = useQuery({
    queryKey: ["admin-offers"],
    queryFn: () => listAdminOffers(),
  });

  const handleCopyWebhook = (courseId: string) => {
    const url = `https://pazemcancao.lovable.app/api/webhook/kiwify?course=${courseId}`;
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
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-border/30 bg-background/30 text-muted-foreground/50 hover:text-gold hover:border-gold/20 hover:bg-gold/5 transition-all duration-200"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <h1 className="font-display text-xl font-black text-foreground tracking-tight">
                Minhas Ofertas
              </h1>
              <p className="text-xs text-muted-foreground/50 mt-0.5">
                Gerencie como seus produtos são vendidos e integrados
              </p>
            </div>
          </div>
          <Link to="/admin/offers/new">
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Nova Oferta
            </Button>
          </Link>
        </div>
      </div>

      <Card className="bg-card border-border/30">
        <CardContent className="p-6">
          {isLoading ? (
            <div className="rounded-lg border border-border/20 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/20">
                    <TableHead>Produto</TableHead>
                    <TableHead>Gateway</TableHead>
                    <TableHead>ID no Gateway</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableSkeleton rows={3} cols={6} />
                </TableBody>
              </Table>
            </div>
          ) : !offers || offers.length === 0 ? (
            <div className="text-center py-20 space-y-4">
              <div className="mx-auto w-16 h-16 rounded-full bg-muted/20 flex items-center justify-center text-muted-foreground/40">
                <ShoppingCart className="h-8 w-8" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">Nenhum produto disponível</h3>
                <p className="text-sm text-muted-foreground">Você precisa criar um produto antes de configurar uma oferta</p>
              </div>
              <Link to="/admin/courses/new">
                <Button variant="outline" className="border-gold/30 text-gold hover:bg-gold/10">
                  Criar Produto
                </Button>
              </Link>
            </div>
          ) : (
            <div className="rounded-lg border border-border/20 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/20">
                    <TableHead>Produto</TableHead>
                    <TableHead>Gateway</TableHead>
                    <TableHead>ID no Gateway</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {offers.map((offer) => {
                    const pc = platformColors[offer.platform] || { bg: "bg-muted/20", text: "text-muted-foreground" };
                    return (
                      <TableRow key={offer.id} className="border-border/25">
                        <TableCell className="font-medium">{(offer as any).courses?.title}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`text-xs ${pc.bg}`}>
                            {offer.platform.charAt(0).toUpperCase() + offer.platform.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {offer.external_product_id}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-[10px] uppercase">
                            {offer.payment_type === 'subscription' ? 'Assinatura' : 'Venda Única'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                            <CheckCircle2 className="h-3 w-3" />
                            Ativo
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8" 
                            onClick={() => handleCopyWebhook(offer.course_id)}
                            title="Copiar Webhook"
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Educational block in listing too */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <EduCard 
          step="1"
          title="Cliente Paga"
          description="O cliente realiza o pagamento no checkout do gateway (ex: PerfectPay)."
        />
        <EduCard 
          step="2"
          title="Gateway Notifica"
          description="O gateway envia uma notificação automática (webhook) para o nosso sistema."
        />
        <EduCard 
          step="3"
          title="Acesso Liberado"
          description="O sistema cria a conta do aluno e libera o acesso ao produto instantaneamente."
        />
      </div>
    </div>
  );
}

function EduCard({ step, title, description }: { step: string; title: string; description: string }) {
  return (
    <div className="bg-card/40 border border-border/20 rounded-xl p-4 flex gap-3">
      <div className="h-6 w-6 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center text-[10px] font-black text-gold shrink-0">
        {step}
      </div>
      <div>
        <h4 className="text-sm font-bold text-foreground mb-0.5">{title}</h4>
        <p className="text-[11px] text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
