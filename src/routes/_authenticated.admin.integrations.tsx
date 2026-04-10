import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getWebhookSettings, updateWebhookSettings } from "@/lib/webhook-settings.functions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Webhook, Copy, Check, Shield, Loader2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/integrations")({
  component: IntegrationsPage,
});

const AVAILABLE_EVENTS = [
  { id: "purchase_completed", label: "Compra realizada" },
  { id: "subscription_started", label: "Assinatura iniciada" },
  { id: "status_changed", label: "Alteração no status da transação" },
  { id: "refund", label: "Reembolso" },
  { id: "chargeback", label: "Chargeback" },
];

function IntegrationsPage() {
  const queryClient = useQueryClient();
  const [copied, setCopied] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["webhook-settings"],
    queryFn: () => getWebhookSettings(),
  });

  const settings = data?.settings;

  const [isActive, setIsActive] = useState(false);
  const [monitoredEvents, setMonitoredEvents] = useState<string[]>([]);
  const [authToken, setAuthToken] = useState("");

  useEffect(() => {
    if (settings) {
      setIsActive(settings.is_active);
      setMonitoredEvents(settings.monitored_events || []);
      setAuthToken(settings.auth_token || "");
    }
  }, [settings]);

  const mutation = useMutation({
    mutationFn: () =>
      updateWebhookSettings({
        data: {
          is_active: isActive,
          monitored_events: monitoredEvents,
          auth_token: authToken || undefined,
        },
      }),
    onSuccess: () => {
      toast.success("Configurações salvas com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["webhook-settings"] });
    },
    onError: (err: any) => {
      toast.error("Erro ao salvar: " + err.message);
    },
  });

  const webhookUrl = settings?.webhook_url || "https://pazemcancao.lovable.app/webhook";

  const handleCopy = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    toast.success("URL copiada!");
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleEvent = (eventId: string) => {
    setMonitoredEvents((prev) =>
      prev.includes(eventId)
        ? prev.filter((e) => e !== eventId)
        : [...prev, eventId]
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground/40" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground/90">
          Integrações
        </h1>
        <p className="mt-1 text-sm text-muted-foreground/60">
          Configure a integração com a Kiwify para processar compras automaticamente.
        </p>
      </div>

      <Card className="border-border/20">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold/[0.08] border border-gold/15">
              <Webhook className="h-5 w-5 text-gold/60" />
            </div>
            <div>
              <CardTitle className="text-base">Kiwify Webhook</CardTitle>
              <CardDescription className="text-xs">
                Receba eventos de compra e assinatura automaticamente
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Webhook URL */}
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground/70">
              URL do Webhook
            </Label>
            <p className="text-[11px] text-muted-foreground/40">
              Copie esta URL e cole no painel da Kiwify em Configurações → Webhooks
            </p>
            <div className="flex gap-2">
              <Input
                value={webhookUrl}
                readOnly
                className="font-mono text-xs bg-muted/30"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopy}
                className="shrink-0"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Toggle */}
          <div className="flex items-center justify-between rounded-lg border border-border/15 p-4">
            <div>
              <Label className="text-sm font-medium">Ativar Webhook</Label>
              <p className="text-[11px] text-muted-foreground/50 mt-0.5">
                Habilitar processamento automático de eventos
              </p>
            </div>
            <Switch checked={isActive} onCheckedChange={setIsActive} />
          </div>

          {/* Events */}
          <div className="space-y-3">
            <Label className="text-xs font-medium text-muted-foreground/70">
              Eventos a Serem Monitorados
            </Label>
            <div className="space-y-2">
              {AVAILABLE_EVENTS.map((event) => (
                <label
                  key={event.id}
                  className="flex items-center gap-3 rounded-lg border border-border/10 p-3 cursor-pointer hover:bg-muted/20 transition-colors"
                >
                  <Checkbox
                    checked={monitoredEvents.includes(event.id)}
                    onCheckedChange={() => toggleEvent(event.id)}
                  />
                  <span className="text-sm">{event.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Auth Token */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Shield className="h-3.5 w-3.5 text-muted-foreground/40" />
              <Label className="text-xs font-medium text-muted-foreground/70">
                Token de Autenticação (opcional)
              </Label>
            </div>
            <p className="text-[11px] text-muted-foreground/40">
              Se configurado, o webhook verificará a assinatura HMAC-SHA256 das requisições
            </p>
            <Input
              type="password"
              value={authToken}
              onChange={(e) => setAuthToken(e.target.value)}
              placeholder="Cole aqui o token secret da Kiwify"
              className="font-mono text-xs"
            />
          </div>

          {/* Save */}
          <Button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
            className="w-full"
          >
            {mutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : null}
            Salvar Configurações
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
