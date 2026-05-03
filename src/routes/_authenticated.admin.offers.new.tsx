import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listAdminProducts, createOfferWithProducts } from "@/lib/admin-integrations.functions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save, Loader2, Copy, ShoppingCart, HelpCircle, CheckCircle2, ChevronRight, Box, Zap } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";

export const Route = createFileRoute("/_authenticated/admin/offers/new")({
  component: NewOfferPage,
});

function NewOfferPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    nome: "",
    gateway: "perfect_pay",
    modalidade: "unico",
    codigo_externo: "",
    token: "",
    status: "rascunho"
  });
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ["admin-products"],
    queryFn: () => listAdminProducts(),
  });

  const mutation = useMutation({
    mutationFn: (values: any) => createOfferWithProducts(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-offers"] });
      toast.success("Oferta criada com sucesso!");
      navigate({ to: "/admin/offers" });
    },
    onError: (err: any) => {
      toast.error("Erro ao criar oferta: " + err.message);
    }
  });

  const handleNext = () => {
    if (!formData.nome) return toast.error("Informe o nome da entrega");
    if (!formData.codigo_externo) return toast.error("Informe o código externo");
    setStep(2);
  };

  const handleSave = () => {
    if (selectedProducts.length === 0) return toast.error("Selecione pelo menos um produto");
    mutation.mutate({
      ...formData,
      productIds: selectedProducts
    });
  };

  const webhookUrl = `${window.location.origin}/api/webhooks/payment`;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/admin/offers" className="flex h-10 w-10 items-center justify-center rounded-xl border border-border/30 bg-background/50 text-muted-foreground hover:text-gold transition-all">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-xl font-black text-foreground tracking-tight">Nova Oferta</h1>
            <p className="text-xs text-muted-foreground">Passo {step} de 2</p>
          </div>
        </div>
        <div className="flex gap-2">
          {step === 2 && (
            <Button variant="outline" onClick={() => setStep(1)}>
              Voltar
            </Button>
          )}
          {step === 1 ? (
            <Button onClick={handleNext} className="gap-2">
              Próximo passo
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleSave} loading={mutation.isPending} className="bg-gold hover:bg-gold/90 text-black font-bold">
              <Save className="h-4 w-4 mr-2" />
              Finalizar
            </Button>
          )}
        </div>
      </div>

      {step === 1 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-card border-border/30 overflow-hidden">
              <div className="bg-muted/30 px-6 py-4 border-b border-border/20">
                <h3 className="text-xs font-black uppercase tracking-widest text-foreground/70">1. Configurações Básicas</h3>
              </div>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Gateway</Label>
                    <Select value={formData.gateway} onValueChange={(v) => setFormData(p => ({ ...p, gateway: v }))}>
                      <SelectTrigger className="bg-background/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="perfect_pay">Perfect Pay</SelectItem>
                        <SelectItem value="kiwify">Kiwify</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Modalidade</Label>
                    <Select value={formData.modalidade} onValueChange={(v) => setFormData(p => ({ ...p, modalidade: v }))}>
                      <SelectTrigger className="bg-background/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unico">Venda Única</SelectItem>
                        <SelectItem value="assinatura">Assinatura</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Nome da entrega</Label>
                  <Input 
                    placeholder="Ex: Acesso VIP - Combo 2024" 
                    value={formData.nome}
                    onChange={e => setFormData(p => ({ ...p, nome: e.target.value }))}
                    className="bg-background/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Código externo (múltiplos separados por vírgula)</Label>
                  <Input 
                    placeholder="Ex: PP123456, PP789012" 
                    value={formData.codigo_externo}
                    onChange={e => setFormData(p => ({ ...p, codigo_externo: e.target.value }))}
                    className="bg-background/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Token / API Key (Opcional para segurança)</Label>
                  <Input 
                    type="password"
                    placeholder="Token de segurança da plataforma" 
                    value={formData.token}
                    onChange={e => setFormData(p => ({ ...p, token: e.target.value }))}
                    className="bg-background/50"
                  />
                </div>

                <div className="space-y-2 pt-4 border-t border-border/20">
                  <Label>URL de Webhook (Copie para o gateway)</Label>
                  <div className="flex gap-2">
                    <Input readOnly value={webhookUrl} className="bg-muted/20 font-mono text-xs cursor-not-allowed" />
                    <Button variant="outline" size="icon" onClick={() => {
                      navigator.clipboard.writeText(webhookUrl);
                      toast.success("Copiado!");
                    }}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4 text-center p-6 bg-gold/5 border border-gold/10 rounded-2xl h-fit">
            <Zap className="h-8 w-8 text-gold mx-auto mb-2" />
            <h4 className="font-bold text-foreground">Como funciona?</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              O gateway enviará uma notificação para a URL acima sempre que uma venda for realizada.
              Nós identificamos o código do produto e liberamos os acessos automaticamente.
            </p>
          </div>
        </div>
      ) : (
        <Card className="bg-card border-border/30 overflow-hidden">
          <div className="bg-muted/30 px-6 py-4 border-b border-border/20 flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-widest text-foreground/70">2. Vincular Produtos</h3>
            <p className="text-[10px] text-muted-foreground">{selectedProducts.length} selecionado(s)</p>
          </div>
          <CardContent className="p-6">
            {productsLoading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-gold" />
              </div>
            ) : products?.length === 0 ? (
              <div className="text-center py-20 space-y-4">
                <Box className="h-10 w-10 text-muted-foreground/30 mx-auto" />
                <p className="text-sm text-muted-foreground">Nenhum produto cadastrado no catálogo.</p>
                <Link to="/admin/products/new">
                  <Button variant="outline" size="sm">Cadastrar Produto</Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {products?.map(product => (
                  <div 
                    key={product.id}
                    className={cn(
                      "flex items-center gap-4 p-4 rounded-xl border transition-all cursor-pointer group",
                      selectedProducts.includes(product.id) 
                        ? "bg-gold/5 border-gold/30 ring-1 ring-gold/20" 
                        : "bg-background/40 border-border/20 hover:border-border/50"
                    )}
                    onClick={() => {
                      setSelectedProducts(prev => 
                        prev.includes(product.id) 
                          ? prev.filter(id => id !== product.id) 
                          : [...prev, product.id]
                      )
                    }}
                  >
                    <Checkbox checked={selectedProducts.includes(product.id)} className="border-gold/30 data-[state=checked]:bg-gold data-[state=checked]:text-black" />
                    <div className="flex-1">
                      <h4 className="text-sm font-bold text-foreground">{product.nome}</h4>
                      <Badge variant="secondary" className="text-[9px] uppercase mt-1">
                        {product.tipo.replace('_', ' ')}
                      </Badge>
                    </div>
                    {product.status === 'ativo' ? (
                      <CheckCircle2 className={cn("h-4 w-4", selectedProducts.includes(product.id) ? "text-gold" : "text-muted-foreground/20")} />
                    ) : (
                      <Badge variant="outline" className="text-[9px]">Inativo</Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
