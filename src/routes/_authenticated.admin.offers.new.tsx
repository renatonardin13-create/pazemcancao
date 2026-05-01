import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { EmptyState } from "@/components/EmptyState";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listAdminCourses } from "@/lib/admin-courses.functions";
import { createOffer } from "@/lib/admin-integrations.functions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save, Loader2, Copy, ShoppingCart, HelpCircle, AlertCircle, Sparkles, Box, Zap, CheckCircle2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import { motion } from "framer-motion";

export const Route = createFileRoute("/_authenticated/admin/offers/new")({
  component: NewOfferPage,
});

function NewOfferPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    course_id: "",
    platform: "perfectpay",
    external_product_id: "",
    integration_token: "",
    payment_type: "one_time"
  });

  const { data: coursesData, isLoading: coursesLoading } = useQuery({
    queryKey: ["admin-courses"],
    queryFn: () => listAdminCourses(),
  });

  const courses = coursesData?.courses || [];

  const mutation = useMutation({
    mutationFn: (values: any) => createOffer({ data: values }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-offers"] });
      toast.success("Oferta criada com sucesso!");
      navigate({ to: "/admin/offers" });
    },
    onError: (err: any) => {
      toast.error("Erro ao criar oferta: " + err.message);
    }
  });

  const handleSave = () => {
    if (!formData.course_id) return toast.error("Selecione um produto");
    if (!formData.external_product_id) return toast.error("Informe o ID do produto no gateway");
    mutation.mutate(formData);
  };

  const webhookUrl = formData.course_id 
    ? `https://nazfszmcpuvwbkxhmugm.supabase.co/functions/v1/payment-webhook?provider=${formData.platform}&course=${formData.course_id}`
    : "Selecione um produto primeiro";

  if (!coursesLoading && courses.length === 0) {
    return (
      <div className="max-w-xl mx-auto py-20 px-6 text-center">
        <EmptyState
          icon={Box}
          title="Nenhum produto disponível"
          description="Você precisa criar um produto antes de configurar uma oferta"
          actionLabel="Criar produto"
          actionTo="/admin/courses/new"
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/admin/offers" className="flex h-9 w-9 items-center justify-center rounded-xl border border-border/30 bg-background/30 text-muted-foreground/50 hover:text-gold hover:border-gold/20 hover:bg-gold/5 transition-all">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="font-display text-xl font-black text-foreground tracking-tight">Nova Oferta</h1>
            <p className="text-xs text-muted-foreground/50">Configure a venda do seu produto</p>
          </div>
        </div>
        <Button size="sm" onClick={handleSave} loading={mutation.isPending}>
          <Save className="h-4 w-4 mr-2" />
          Salvar Oferta
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Block 1: Produto Vinculado */}
          <Card className="bg-card border-border/30 overflow-hidden">
            <div className="bg-muted/30 px-6 py-3 border-b border-border/20 flex items-center gap-2">
              <Box className="h-4 w-4 text-gold" />
              <h3 className="text-xs font-black uppercase tracking-widest text-foreground/70">1. Produto Vinculado</h3>
            </div>
            <CardContent className="p-6">
              <div className="space-y-2">
                <Label>Produto</Label>
                <Select value={formData.course_id} onValueChange={(v) => setFormData(p => ({ ...p, course_id: v }))}>
                  <SelectTrigger className="h-12 bg-background/50">
                    <SelectValue placeholder="Selecione o produto que será entregue" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-[10px] text-muted-foreground">O acesso a este produto será liberado automaticamente após o pagamento.</p>
              </div>
            </CardContent>
          </Card>

          {/* Block 2: Pagamento */}
          <Card className="bg-card border-border/30 overflow-hidden">
            <div className="bg-muted/30 px-6 py-3 border-b border-border/20 flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 text-gold" />
              <h3 className="text-xs font-black uppercase tracking-widest text-foreground/70">2. Pagamento</h3>
            </div>
            <CardContent className="p-6 grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Gateway</Label>
                <Select value={formData.platform} onValueChange={(v) => setFormData(p => ({ ...p, platform: v }))}>
                  <SelectTrigger className="h-12 bg-background/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="perfectpay">Perfect Pay</SelectItem>
                    <SelectItem value="kiwify">Kiwify</SelectItem>
                    <SelectItem value="hotmart">Hotmart</SelectItem>
                    <SelectItem value="cakto">Cakto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Tipo de Pagamento</Label>
                <Select value={formData.payment_type} onValueChange={(v) => setFormData(p => ({ ...p, payment_type: v }))}>
                  <SelectTrigger className="h-12 bg-background/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="one_time">Venda Única</SelectItem>
                    <SelectItem value="subscription">Assinatura</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Block 3: Identificação */}
          <Card className="bg-card border-border/30 overflow-hidden">
            <div className="bg-muted/30 px-6 py-3 border-b border-border/20 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-gold" />
              <h3 className="text-xs font-black uppercase tracking-widest text-foreground/70">3. Identificação no Gateway</h3>
            </div>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <Label>ID do Produto no Gateway</Label>
                <Input 
                  placeholder="Ex: PP123456" 
                  className="h-12 bg-background/50" 
                  value={formData.external_product_id}
                  onChange={e => setFormData(p => ({ ...p, external_product_id: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Token de Autenticação (Opcional)</Label>
                <Input 
                  type="password" 
                  placeholder="Token secreto da plataforma" 
                  className="h-12 bg-background/50" 
                  value={formData.integration_token}
                  onChange={e => setFormData(p => ({ ...p, integration_token: e.target.value }))}
                />
              </div>
              <div className="flex gap-2 p-3 bg-muted/20 rounded-lg border border-border/30">
                <HelpCircle className="h-4 w-4 text-gold shrink-0" />
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  Esses dados são usados para identificar pagamentos vindos do gateway e garantir que o acesso seja liberado apenas para compras legítimas.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Block 4: Automação */}
          <Card className="bg-card border-border/30 overflow-hidden">
            <div className="bg-muted/30 px-6 py-3 border-b border-border/20 flex items-center gap-2">
              <Zap className="h-4 w-4 text-gold" />
              <h3 className="text-xs font-black uppercase tracking-widest text-foreground/70">4. Automação</h3>
            </div>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <Label>URL do Webhook</Label>
                <div className="flex gap-2">
                  <Input readOnly value={webhookUrl} className="h-12 bg-muted/20 font-mono text-xs cursor-not-allowed" />
                  <Button variant="outline" className="h-12 px-4" onClick={() => {
                    if (!formData.course_id) return toast.error("Selecione um produto primeiro");
                    navigator.clipboard.writeText(webhookUrl);
                    toast.success("Webhook copiado!");
                  }}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl flex gap-3">
                <div className="h-8 w-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-emerald-400">Webhook Ativo</h4>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">Ao salvar, este webhook estará pronto para receber notificações e liberar acessos automaticamente.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar: Education */}
        <div className="space-y-6">
          <Card className="bg-card border-border/30 bg-gradient-to-b from-card to-muted/20 sticky top-6">
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 rounded-lg bg-gold/10 flex items-center justify-center text-gold">
                  <HelpCircle className="h-5 w-5" />
                </div>
                <h3 className="font-black text-sm uppercase tracking-wider">Como funciona</h3>
              </div>
              
              <div className="space-y-6 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-[1px] before:bg-border/30">
                <StepItem 
                  num="1" 
                  title="Cliente realiza pagamento" 
                  text="O cliente finaliza a compra no gateway escolhido." 
                />
                <StepItem 
                  num="2" 
                  title="Gateway envia notificação" 
                  text="Assim que o pagamento é aprovado, o gateway avisa nosso sistema via Webhook." 
                />
                <StepItem 
                  num="3" 
                  title="Acesso liberado" 
                  text="O sistema identifica o produto e libera o acesso ao aluno automaticamente por e-mail." 
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function StepItem({ num, title, text }: { num: string; title: string; text: string }) {
  return (
    <div className="flex gap-4 relative z-10">
      <div className="h-6 w-6 rounded-full bg-background border border-border/30 flex items-center justify-center text-[10px] font-black text-gold shrink-0">
        {num}
      </div>
      <div>
        <h4 className="text-xs font-bold text-foreground leading-none mb-1">{title}</h4>
        <p className="text-[10px] text-muted-foreground leading-relaxed">{text}</p>
      </div>
    </div>
  );
}
