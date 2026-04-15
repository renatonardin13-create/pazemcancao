import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCourseIntegration, upsertCourseIntegration, testCourseWebhook } from "@/lib/course-integrations.functions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Zap, Link as LinkIcon, Copy, Check, Loader2, FlaskConical, Eye, EyeOff, KeyRound } from "lucide-react";

const PLATFORMS = [
  { value: "hotmart", label: "Hotmart", color: "text-orange-400" },
  { value: "kiwify", label: "Kiwify", color: "text-emerald-400" },
  { value: "cakto", label: "Cakto", color: "text-blue-400" },
  { value: "outra", label: "Outra", color: "text-purple-400" },
];

interface CourseIntegrationSectionProps {
  courseId: string;
}

export function CourseIntegrationSection({ courseId }: CourseIntegrationSectionProps) {
  const queryClient = useQueryClient();
  const [copied, setCopied] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const { data, isLoading } = useQuery({
    queryKey: ["course-integration", courseId],
    queryFn: () => getCourseIntegration({ data: { courseId } }),
  });

  const integration = data?.integration;

  const [isEnabled, setIsEnabled] = useState(false);
  const [platform, setPlatform] = useState("hotmart");
  const [externalProductId, setExternalProductId] = useState("");
  const [externalProductName, setExternalProductName] = useState("");
  const [checkoutUrl, setCheckoutUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [webhookActive, setWebhookActive] = useState(false);
  const [integrationToken, setIntegrationToken] = useState("");

  useEffect(() => {
    if (integration) {
      setIsEnabled(integration.is_enabled);
      setPlatform(integration.platform);
      setExternalProductId(integration.external_product_id || "");
      setExternalProductName(integration.external_product_name || "");
      setCheckoutUrl(integration.checkout_url || "");
      setNotes(integration.notes || "");
      setWebhookActive(integration.webhook_active);
      setIntegrationToken((integration as any).integration_token || "");
    }
  }, [integration]);

  const mutation = useMutation({
    mutationFn: () => {
      if (isEnabled && !externalProductId.trim()) {
        throw new Error("O ID do produto externo é obrigatório quando a integração está habilitada");
      }
      if (checkoutUrl.trim() && !/^https?:\/\/.+/.test(checkoutUrl.trim())) {
        throw new Error("A URL da página de vendas deve ser um link válido (começando com http:// ou https://)");
      }
      return upsertCourseIntegration({
        data: {
          courseId,
          is_enabled: isEnabled,
          platform,
          external_product_id: externalProductId || undefined,
          external_product_name: externalProductName || undefined,
          checkout_url: checkoutUrl || undefined,
          notes: notes || undefined,
          webhook_active: webhookActive,
          integration_token: integrationToken || undefined,
        },
      });
    },
    onSuccess: () => {
      toast.success("Integração salva com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["course-integration", courseId] });
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const webhookUrl = `https://pazemcancao.lovable.app/api/webhook/kiwify?course=${courseId}`;

  const handleCopyWebhook = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    toast.success("URL do webhook copiada!");
    setTimeout(() => setCopied(false), 2000);
  };

  const currentPlatform = PLATFORMS.find((p) => p.value === platform);

  if (isLoading) {
    return (
      <Card className="border-border/20">
        <CardContent className="py-8 flex justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground/70" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Integration Settings */}
      <Card className="border-border/20 bg-card/40">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold/[0.08] border border-gold/15">
              <Zap className="h-5 w-5 text-gold/60" />
            </div>
            <div>
              <CardTitle className="text-base">Integrações</CardTitle>
              <p className="text-xs text-muted-foreground/50 mt-0.5">
                Vincule este curso a um produto em uma plataforma de pagamento externa
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Enable toggle */}
          <div className="flex items-center justify-between rounded-lg border border-border/30 p-4">
            <div>
              <Label className="text-sm font-medium">Habilitar integração externa</Label>
              <p className="text-xs text-muted-foreground/50 mt-0.5">
                Ative para vincular a um produto de plataforma de pagamento
              </p>
            </div>
            <Switch checked={isEnabled} onCheckedChange={setIsEnabled} />
          </div>

          {isEnabled && (
            <>
              {/* Platform select */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Plataforma de Pagamento</Label>
                <Select value={platform} onValueChange={setPlatform}>
                  <SelectTrigger className="bg-card/20 border-gold/20 focus:border-gold/40">
                    <SelectValue placeholder="Selecione a plataforma" />
                  </SelectTrigger>
                  <SelectContent>
                    {PLATFORMS.map((p) => (
                      <SelectItem key={p.value} value={p.value}>
                        <span className="flex items-center gap-2">
                          <span className={`inline-block h-2 w-2 rounded-full ${p.color} bg-current`} />
                          {p.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground/70">
                  Plataforma onde o produto está cadastrado
                </p>
              </div>

              {/* External Product ID */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">ID do Produto Externo *</Label>
                <Input
                  value={externalProductId}
                  onChange={(e) => setExternalProductId(e.target.value)}
                  placeholder="Ex: F80185198L"
                  className="bg-card/20 border-border/30 font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground/70">
                  Identificador único do produto na plataforma de pagamento
                </p>
              </div>

              {/* External Product Name */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Nome do Produto Externo (opcional)
                </Label>
                <Input
                  value={externalProductName}
                  onChange={(e) => setExternalProductName(e.target.value)}
                  placeholder="Ex: Curso Completo de Marketing"
                  className="bg-card/20 border-border/30"
                />
                <p className="text-xs text-muted-foreground/70">
                  Nome do produto como aparece na plataforma externa (para referência)
                </p>
              </div>

              {/* Sales Page URL */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <LinkIcon className="h-3.5 w-3.5 text-muted-foreground/70" />
                  <Label className="text-sm font-medium">URL da Página de Vendas</Label>
                </div>
                <Input
                  value={checkoutUrl}
                  onChange={(e) => setCheckoutUrl(e.target.value)}
                  placeholder={`https://go.${platform}.com/${externalProductId || "..."}`}
                  className="bg-card/20 border-border/30 font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground/70">
                  Página de vendas onde os alunos serão redirecionados ao clicar no produto bloqueado
                </p>
              </div>

              {/* Integration Token */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <KeyRound className="h-3.5 w-3.5 text-muted-foreground/70" />
                  <Label className="text-sm font-medium">Token de Integração</Label>
                </div>
                <div className="flex gap-2 min-w-0">
                  <Input
                    type={showToken ? "text" : "password"}
                    value={integrationToken}
                    onChange={(e) => setIntegrationToken(e.target.value)}
                    placeholder="Cole o token da plataforma aqui"
                    className="bg-card/20 border-border/30 font-mono text-sm min-w-0"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setShowToken(!showToken)}
                    className="shrink-0"
                    title={showToken ? "Ocultar token" : "Mostrar token"}
                  >
                    {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      navigator.clipboard.writeText(integrationToken);
                      setCopiedToken(true);
                      toast.success("Token copiado!");
                      setTimeout(() => setCopiedToken(false), 2000);
                    }}
                    className="shrink-0"
                    disabled={!integrationToken}
                  >
                    {copiedToken ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground/70">
                  Token de autenticação fornecido pela plataforma de pagamento para validar webhooks
                </p>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Notas de Integração (opcional)
                </Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Anotações sobre a integração, configurações especiais, etc."
                  rows={3}
                  className="bg-card/20 border-border/30"
                />
                <p className="text-xs text-muted-foreground/70">
                  Anotações internas sobre a configuração da integração
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Webhook Section */}
      {isEnabled && (
        <Card className="border-border/20">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold/[0.08] border border-gold/15">
                <Zap className="h-5 w-5 text-gold/60" />
              </div>
              <div>
                <CardTitle className="text-base">Webhook de Vendas</CardTitle>
                <p className="text-xs text-muted-foreground/50 mt-0.5">
                  Configure webhooks para liberar acesso automaticamente após a compra
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Webhook URL */}
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground/70">
                URL do Webhook (Gerada Automaticamente)
              </Label>
              <div className="flex gap-2 min-w-0">
                <Input
                  value={webhookUrl}
                  readOnly
                  className="font-mono text-xs bg-muted/30 min-w-0 truncate"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleCopyWebhook}
                  className="shrink-0"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-primary" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground/70">
                Cole esta URL nas configurações de webhook da plataforma de pagamento
              </p>
            </div>

            {/* Webhook status toggle */}
            <div className="flex items-center justify-between rounded-lg border border-border/30 p-4">
              <div>
                <Label className="text-sm font-medium">Status do Webhook</Label>
                <p className="text-xs text-muted-foreground/50 mt-0.5">
                  {webhookActive
                    ? "Webhook ativo e recebendo notificações"
                    : "Webhook desativado"}
                </p>
              </div>
              <Switch checked={webhookActive} onCheckedChange={setWebhookActive} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action buttons */}
      <div className="flex gap-3">
        <Button
          type="button"
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending}
          className="flex-1"
        >
          {mutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : null}
          {isEnabled ? "Atualizar Integração" : "Salvar Configurações"}
        </Button>

        {isEnabled && webhookActive && (
          <TestWebhookButton webhookUrl={webhookUrl} platform={platform} />
        )}
      </div>
    </div>
  );
}

function TestWebhookButton({ webhookUrl, platform }: { webhookUrl: string; platform: string }) {
  const [testing, setTesting] = useState(false);
  const queryClient = useQueryClient();

  const handleTest = async () => {
    setTesting(true);
    try {
      // Extract courseId from webhook URL
      const url = new URL(webhookUrl);
      const courseId = url.searchParams.get("course") || "";

      await testCourseWebhook({ data: { courseId } });
      toast.success("Webhook de teste enviado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["webhook-logs"] });
    } catch (err: any) {
      toast.error("Falha ao enviar teste: " + err.message);
    } finally {
      setTesting(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleTest}
      disabled={testing}
    >
      {testing ? (
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
      ) : (
        <FlaskConical className="h-4 w-4 mr-2" />
      )}
      Testar
    </Button>
  );
}
