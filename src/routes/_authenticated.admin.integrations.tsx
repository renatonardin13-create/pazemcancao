import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getWebhookSettings, updateWebhookSettings, getWebhookLogs, sendTestWebhook } from "@/lib/webhook-settings.functions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Webhook, Copy, Check, Shield, Loader2, ScrollText, CheckCircle2, XCircle, Clock, FlaskConical, Eye, EyeOff, Send, CircleDot, ArrowRight, ExternalLink, ClipboardCopy, AlertTriangle, ChevronDown, ChevronUp, Code } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";

export const Route = createFileRoute("/_authenticated/admin/integrations")({
  component: IntegrationsPage,
});

const AVAILABLE_EVENTS = [
  { id: "purchase_completed", label: "Compra aprovada" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (delay: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1], delay },
  }),
};

function IntegrationsPage() {
  const queryClient = useQueryClient();
  const [copied, setCopied] = useState(false);
  const [showToken, setShowToken] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["webhook-settings"],
    queryFn: () => getWebhookSettings(),
  });

  const { data: logsData } = useQuery({
    queryKey: ["webhook-logs"],
    queryFn: () => getWebhookLogs(),
    refetchInterval: 30000,
  });

  const settings = data?.settings;
  const logs = logsData?.logs || [];
  const lastLog = logs[0] || null;
  const hasRecentSuccess = lastLog?.response_status === 200;
  const lastEventTime = lastLog ? new Date(lastLog.created_at) : null;

  const [isActive, setIsActive] = useState(false);
  const [monitoredEvents, setMonitoredEvents] = useState<string[]>([]);
  const [authToken, setAuthToken] = useState("");
  const [allowedIps, setAllowedIps] = useState("");
  const webhookUrl = "https://pazemcancao.lovable.app/api/webhook/kiwify";

  useEffect(() => {
    if (settings) {
      setIsActive(settings.is_active);
      setMonitoredEvents(settings.monitored_events || []);
      setAuthToken(settings.auth_token || "");
      setAllowedIps((settings.allowed_ips || []).join(", "));
    }
  }, [settings]);

  const mutation = useMutation({
    mutationFn: () =>
      updateWebhookSettings({
        data: {
          is_active: isActive,
          monitored_events: monitoredEvents,
          auth_token: authToken || undefined,
          webhook_url: webhookUrl,
          allowed_ips: allowedIps
            ? allowedIps.split(",").map((ip: string) => ip.trim()).filter(Boolean)
            : [],
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
    <motion.div initial="hidden" animate="visible" className="w-full max-w-2xl space-y-6 overflow-hidden">
      <motion.div variants={fadeUp} custom={0}>
        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground/90">
          Integrações
        </h1>
        <p className="mt-1 text-sm text-muted-foreground/60">
          Configure a integração com a Kiwify para processar compras automaticamente.
        </p>
      </motion.div>

      {/* ── Status Banner ── */}
      <motion.div variants={fadeUp} custom={0.05}>
        <div className={`flex items-center gap-3 rounded-xl border p-4 ${
          logs.length === 0
            ? "border-border/15 bg-muted/5"
            : hasRecentSuccess
              ? "border-emerald-500/20 bg-emerald-500/[0.04]"
              : "border-red-500/20 bg-red-500/[0.04]"
        }`}>
          <div className={`flex h-9 w-9 items-center justify-center rounded-full ${
            logs.length === 0
              ? "bg-muted/20"
              : hasRecentSuccess
                ? "bg-emerald-500/10"
                : "bg-red-500/10"
          }`}>
            {logs.length === 0 ? (
              <CircleDot className="h-4 w-4 text-muted-foreground/40" />
            ) : hasRecentSuccess ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            ) : (
              <XCircle className="h-4 w-4 text-red-500" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-medium ${
              logs.length === 0
                ? "text-muted-foreground/60"
                : hasRecentSuccess
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-red-600 dark:text-red-400"
            }`}>
              {logs.length === 0
                ? "Nenhum evento recebido"
                : hasRecentSuccess
                  ? "Webhook funcionando"
                  : `Último evento falhou (HTTP ${lastLog?.response_status})`}
            </p>
            {lastEventTime && (
              <p className="text-[11px] text-muted-foreground/40 mt-0.5">
                Último evento: {lastEventTime.toLocaleString('pt-BR', {
                  day: '2-digit', month: '2-digit', year: 'numeric',
                  hour: '2-digit', minute: '2-digit',
                })}
                {lastLog?.email && ` · ${lastLog.email}`}
              </p>
            )}
          </div>
          {lastLog && (
            <Badge
              variant="outline"
              className={`text-[10px] font-mono shrink-0 ${
                hasRecentSuccess
                  ? "border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                  : "border-red-500/30 text-red-600 dark:text-red-400"
              }`}
            >
              HTTP {lastLog.response_status}
            </Badge>
          )}
        </div>
      </motion.div>

      {/* ── Setup Steps ── */}
      <motion.div variants={fadeUp} custom={0.1}>
        <Card className="border-border/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-foreground/80">
              Como configurar em 4 passos
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-5">
            <div className="space-y-0">
              {[
                { step: 1, title: "Copie a URL do webhook", desc: "Clique no botão abaixo para copiar" },
                { step: 2, title: "Acesse sua plataforma", desc: "Vá em Kiwify → Configurações → Webhooks" },
                { step: 3, title: "Cole a URL", desc: "Adicione um novo webhook e cole a URL copiada" },
                { step: 4, title: "Ative o evento de compra", desc: "Selecione 'Compra aprovada' como evento" },
              ].map((item, i) => (
                <div key={item.step} className="flex items-start gap-3 py-3 relative">
                  {/* Vertical line connector */}
                  {i < 3 && (
                    <div className="absolute left-[13px] top-[40px] w-[2px] h-[calc(100%-28px)] bg-border/15" />
                  )}
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gold/10 border border-gold/20 text-gold/70 text-[11px] font-bold shrink-0 relative z-10">
                    {item.step}
                  </div>
                  <div className="pt-0.5">
                    <p className="text-[13px] font-medium text-foreground/80">{item.title}</p>
                    <p className="text-[11px] text-muted-foreground/40 mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Copy URL button */}
            <button
              onClick={handleCopy}
              className={`mt-4 w-full flex items-center gap-3 rounded-xl border p-3.5 transition-all duration-300 ${
                copied
                  ? "border-emerald-500/30 bg-emerald-500/[0.06]"
                  : "border-border/15 bg-muted/5 hover:bg-muted/15 hover:border-gold/20"
              }`}
            >
              <div className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
                copied ? "bg-emerald-500/15" : "bg-gold/[0.08]"
              }`}>
                {copied ? (
                  <Check className="h-4 w-4 text-emerald-500" />
                ) : (
                  <ClipboardCopy className="h-4 w-4 text-gold/60" />
                )}
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className="font-mono text-[11px] text-foreground/70 truncate">{webhookUrl}</p>
              </div>
              <span className={`text-[10px] font-medium shrink-0 ${
                copied ? "text-emerald-500" : "text-gold/50"
              }`}>
                {copied ? "Copiado!" : "Copiar"}
              </span>
            </button>
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Main Config ── */}
      <motion.div variants={fadeUp} custom={0.15}>
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
                  Token de Autenticação
                </Label>
              </div>
              <p className="text-[11px] text-muted-foreground/40">
                O webhook verificará este token em cada requisição recebida
              </p>
              <div className="flex gap-2">
                <Input
                  type={showToken ? "text" : "password"}
                  value={authToken}
                  onChange={(e) => setAuthToken(e.target.value)}
                  placeholder="Cole aqui o token secret da Kiwify"
                  className="font-mono text-xs"
                />
                <Button
                  variant="outline"
                  size="icon"
                  type="button"
                  onClick={() => setShowToken((v) => !v)}
                  className="shrink-0"
                >
                  {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {/* IP Whitelist */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Shield className="h-3.5 w-3.5 text-muted-foreground/40" />
                <Label className="text-xs font-medium text-muted-foreground/70">
                  Whitelist de IPs (opcional)
                </Label>
              </div>
              <p className="text-[11px] text-muted-foreground/40">
                IPs permitidos separados por vírgula. Deixe vazio para aceitar de qualquer IP.
              </p>
              <Input
                value={allowedIps}
                onChange={(e) => setAllowedIps(e.target.value)}
                placeholder="Ex: 104.18.0.0, 172.67.0.0"
                className="font-mono text-xs"
              />
            </div>

            {/* Test Webhook */}
            <TestWebhookSection />

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
      </motion.div>

      {/* Webhook Logs */}
      <motion.div variants={fadeUp} custom={0.2}>
        <WebhookLogsSection />
      </motion.div>
    </motion.div>
  );
}

function TestWebhookSection() {
  const queryClient = useQueryClient();
  const [testEmail, setTestEmail] = useState("teste@exemplo.com");
  const [testName, setTestName] = useState("Comprador Teste");
  const [testToken, setTestToken] = useState("");

  type TestWebhookResponse = {
    status: number;
    resultText: string;
  };

  const parseTestResponse = (resultText: string) => {
    if (!resultText) return null;
    try {
      return JSON.parse(resultText) as Record<string, unknown>;
    } catch {
      return { raw: resultText };
    }
  };

  const testMutation = useMutation({
    mutationFn: () => sendTestWebhook({ data: { email: testEmail, name: testName, token: testToken } }) as Promise<TestWebhookResponse>,
    onSuccess: (res: TestWebhookResponse) => {
      if (res.status === 200) {
        toast.success("Teste enviado com sucesso! Verifique os logs abaixo.");
      } else {
        const parsed = parseTestResponse(res.resultText);
        const message = typeof parsed?.error === "string"
          ? parsed.error
          : JSON.stringify(parsed);
        toast.error(`Teste falhou com status ${res.status}: ${message}`);
      }
      queryClient.invalidateQueries({ queryKey: ["webhook-logs"] });
    },
    onError: (err: any) => {
      toast.error("Erro ao enviar teste: " + err.message);
    },
  });

  return (
    <div className="space-y-3 rounded-lg border border-dashed border-border/20 p-4">
      <div className="flex items-center gap-2">
        <FlaskConical className="h-3.5 w-3.5 text-muted-foreground/40" />
        <Label className="text-xs font-medium text-muted-foreground/70">
          Enviar Webhook de Teste
        </Label>
      </div>
      <p className="text-[11px] text-muted-foreground/40">
        Simula uma compra aprovada para verificar se o webhook está funcionando.
      </p>
      <div className="grid grid-cols-2 gap-2">
        <Input
          value={testName}
          onChange={(e) => setTestName(e.target.value)}
          placeholder="Nome"
          className="text-xs"
        />
        <Input
          value={testEmail}
          onChange={(e) => setTestEmail(e.target.value)}
          placeholder="Email"
          className="text-xs"
        />
      </div>
      <Input
        value={testToken}
        onChange={(e) => setTestToken(e.target.value)}
        placeholder="Token (deixe vazio para ignorar validação)"
        className="font-mono text-xs"
      />
      <Button
        variant="outline"
        onClick={() => testMutation.mutate()}
        disabled={testMutation.isPending || !testEmail}
        className="w-full gap-2"
      >
        {testMutation.isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Send className="h-4 w-4" />
        )}
        Enviar Teste
      </Button>
    </div>
  );
}

function WebhookLogsSection() {
  const { data, isLoading } = useQuery({
    queryKey: ["webhook-logs"],
    queryFn: () => getWebhookLogs(),
    refetchInterval: 30000,
  });

  const logs = data?.logs || [];

  return (
    <Card className="border-border/20">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted/30 border border-border/15">
            <ScrollText className="h-5 w-5 text-muted-foreground/50" />
          </div>
          <div>
            <CardTitle className="text-base">Relatório de Transações</CardTitle>
            <CardDescription className="text-xs">
              Últimos 50 eventos recebidos do webhook
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground/40" />
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-10">
            <CircleDot className="h-8 w-8 text-muted-foreground/15 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground/40">
              Nenhum evento registrado ainda.
            </p>
            <p className="text-[11px] text-muted-foreground/25 mt-1">
              Envie um webhook de teste para verificar a configuração
            </p>
          </div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {logs.map((log: any, i: number) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.02 }}
                className={`flex items-center gap-3 rounded-lg border p-3 text-sm transition-colors ${
                  i === 0
                    ? log.response_status === 200
                      ? "border-emerald-500/15 bg-emerald-500/[0.02]"
                      : "border-red-500/15 bg-red-500/[0.02]"
                    : "border-border/10"
                }`}
              >
                {log.response_status === 200 ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500 shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge
                      variant="outline"
                      className={`text-[10px] font-mono ${
                        log.response_status === 200
                          ? 'border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                          : 'border-red-500/30 text-red-600 dark:text-red-400'
                      }`}
                    >
                      HTTP {log.response_status}
                    </Badge>
                    <Badge variant="outline" className="text-[10px] font-mono">
                      {log.event_type || '—'}
                    </Badge>
                    {log.payload?._test && (
                      <Badge variant="outline" className="text-[10px] font-mono border-primary/30 text-primary gap-1">
                        <FlaskConical className="h-3 w-3" />
                        Teste
                      </Badge>
                    )}
                    {log.email && (
                      <span className="text-xs text-muted-foreground/60 truncate">
                        {log.email}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground/40 mt-1">
                    {log.response_message}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground/30 shrink-0">
                  <Clock className="h-3 w-3" />
                  {new Date(log.created_at).toLocaleString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
