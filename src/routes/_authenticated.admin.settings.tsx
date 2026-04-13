import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPlatformSettings, updatePlatformSetting, uploadPlatformAsset } from "@/lib/platform-settings.functions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Settings, Upload, Palette, Globe, Link2, Bell, Wrench, RefreshCw, Save } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("branding");

  const { data, isLoading } = useQuery({
    queryKey: ["platform-settings"],
    queryFn: () => getPlatformSettings(),
  });

  const settings = data?.settings || {};

  const mutation = useMutation({
    mutationFn: (vars: { key: string; value: Record<string, any> }) =>
      updatePlatformSetting({ data: vars }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["platform-settings"] });
      toast.success("Configurações salvas!");
    },
    onError: (err: any) => toast.error(err.message),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        Carregando configurações...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link to="/admin" className="text-muted-foreground/50 hover:text-muted-foreground transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-gold/60" />
            <h1 className="text-2xl font-bold text-foreground">Configurações da Plataforma</h1>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            Personalize a aparência e comportamento da sua área de membros
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-muted/10 border border-border/20">
          <TabsTrigger value="branding" className="gap-1.5 text-xs">
            <Upload className="h-3.5 w-3.5" /> Identidade Visual
          </TabsTrigger>
          <TabsTrigger value="colors" className="gap-1.5 text-xs">
            <Palette className="h-3.5 w-3.5" /> Cores
          </TabsTrigger>
          <TabsTrigger value="general" className="gap-1.5 text-xs">
            <Globe className="h-3.5 w-3.5" /> Geral
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-1.5 text-xs">
            <Link2 className="h-3.5 w-3.5" /> Integrações
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-1.5 text-xs">
            <Bell className="h-3.5 w-3.5" /> Notificações
          </TabsTrigger>
          <TabsTrigger value="advanced" className="gap-1.5 text-xs">
            <Wrench className="h-3.5 w-3.5" /> Avançado
          </TabsTrigger>
        </TabsList>

        <TabsContent value="branding">
          <BrandingTab settings={settings.branding || {}} onSave={(v) => mutation.mutate({ key: "branding", value: v })} saving={mutation.isPending} />
        </TabsContent>
        <TabsContent value="colors">
          <ColorsTab settings={settings.colors || {}} onSave={(v) => mutation.mutate({ key: "colors", value: v })} saving={mutation.isPending} />
        </TabsContent>
        <TabsContent value="general">
          <GeneralTab settings={settings.general || {}} onSave={(v) => mutation.mutate({ key: "general", value: v })} saving={mutation.isPending} />
        </TabsContent>
        <TabsContent value="analytics">
          <AnalyticsTab settings={settings.analytics || {}} onSave={(v) => mutation.mutate({ key: "analytics", value: v })} saving={mutation.isPending} />
        </TabsContent>
        <TabsContent value="notifications">
          <NotificationsTab settings={settings.notifications || {}} onSave={(v) => mutation.mutate({ key: "notifications", value: v })} saving={mutation.isPending} />
        </TabsContent>
        <TabsContent value="advanced">
          <AdvancedTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

/* ─── Branding ─── */
function BrandingTab({ settings, onSave, saving }: { settings: any; onSave: (v: any) => void; saving: boolean }) {
  const [name, setName] = useState(settings.platform_name || "");
  const [logoUrl, setLogoUrl] = useState(settings.logo_url || "");
  const [faviconUrl, setFaviconUrl] = useState(settings.favicon_url || "");
  const logoRef = useRef<HTMLInputElement>(null);
  const faviconRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File, type: "logo" | "favicon") => {
    if (file.size > 2 * 1024 * 1024) { toast.error("Arquivo muito grande (máx 2MB)"); return; }
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = (reader.result as string).split(",")[1];
      try {
        const res = await uploadPlatformAsset({
          data: { bucket: "covers", path: `platform/${type}-${Date.now()}.${file.name.split(".").pop()}`, base64, contentType: file.type },
        });
        if (type === "logo") setLogoUrl(res.url);
        else setFaviconUrl(res.url);
        toast.success(`${type === "logo" ? "Logo" : "Favicon"} enviado!`);
      } catch (err: any) { toast.error(err.message); }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="bg-card border-border/30">
        <CardContent className="p-6 space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Logo da Plataforma</h3>
            <p className="text-sm text-muted-foreground">Faça upload do logo que aparecerá no sidebar e área do aluno</p>
          </div>
          <div
            className="border-2 border-dashed border-border/30 rounded-lg p-8 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-border/50 transition-colors min-h-[180px]"
            onClick={() => logoRef.current?.click()}
          >
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="max-h-20 object-contain" />
            ) : (
              <>
                <Upload className="h-8 w-8 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">Clique para fazer upload</p>
                <p className="text-xs text-muted-foreground/60">PNG, JPG ou SVG (max 2MB)</p>
              </>
            )}
          </div>
          <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0], "logo")} />
        </CardContent>
      </Card>

      <Card className="bg-card border-border/30">
        <CardContent className="p-6 space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Informações da Plataforma</h3>
            <p className="text-sm text-muted-foreground">Configure o nome e favicon da sua plataforma</p>
          </div>
          <div className="space-y-3">
            <div>
              <Label className="text-sm font-semibold">Nome da Plataforma</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} className="mt-1.5" />
            </div>
            <div>
              <Label className="text-sm font-semibold">Favicon</Label>
              <div
                className="mt-1.5 flex items-center gap-3 p-3 border border-border/20 rounded-lg cursor-pointer hover:border-border/40 transition-colors"
                onClick={() => faviconRef.current?.click()}
              >
                {faviconUrl ? (
                  <img src={faviconUrl} alt="Favicon" className="h-8 w-8 object-contain" />
                ) : (
                  <div className="h-8 w-8 rounded border border-dashed border-border/30 flex items-center justify-center">
                    <Upload className="h-4 w-4 text-muted-foreground/40" />
                  </div>
                )}
                <div>
                  <p className="text-xs text-muted-foreground">Ícone que aparece na aba do navegador</p>
                  <p className="text-xs text-muted-foreground/60">Recomendado: 32×32px ou 64×64px</p>
                </div>
              </div>
              <input ref={faviconRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0], "favicon")} />
            </div>
          </div>
          <Button onClick={() => onSave({ platform_name: name, logo_url: logoUrl || null, favicon_url: faviconUrl || null })} disabled={saving} className="w-full gap-2">
            <Save className="h-4 w-4" /> Salvar Identidade Visual
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

/* ─── Colors ─── */
function ColorsTab({ settings, onSave, saving }: { settings: any; onSave: (v: any) => void; saving: boolean }) {
  const defaults = { primary: "#D4A853", background: "#000000", surface: "#0A0A0A", text: "#FFFFFF" };
  const [colors, setColors] = useState({ ...defaults, ...settings });

  const updateColor = (key: string, val: string) => setColors((prev: any) => ({ ...prev, [key]: val }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="bg-card border-border/30">
        <CardContent className="p-6 space-y-5">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Cores Personalizadas</h3>
            <p className="text-sm text-muted-foreground">Personalize as cores da sua plataforma</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { key: "primary", label: "Cor Primária (Dourado)" },
              { key: "background", label: "Cor de Fundo" },
              { key: "surface", label: "Cor das Superfícies" },
              { key: "text", label: "Cor do Texto" },
            ].map((item) => (
              <div key={item.key}>
                <Label className="text-sm font-semibold">{item.label}</Label>
                <div className="mt-1.5 flex items-center gap-2">
                  <input
                    type="color"
                    value={colors[item.key]}
                    onChange={(e) => updateColor(item.key, e.target.value)}
                    className="h-9 w-9 rounded border border-border/30 cursor-pointer bg-transparent"
                  />
                  <Input value={colors[item.key]} onChange={(e) => updateColor(item.key, e.target.value)} className="font-mono text-sm" />
                </div>
              </div>
            ))}
          </div>
          <Button variant="outline" size="sm" className="gap-2" onClick={() => setColors(defaults)}>
            <RefreshCw className="h-3.5 w-3.5" /> Restaurar Cores Padrão
          </Button>
          <Button onClick={() => onSave(colors)} disabled={saving} className="w-full gap-2">
            <Save className="h-4 w-4" /> Salvar Cores
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-card border-border/30">
        <CardContent className="p-6 space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Preview</h3>
            <p className="text-sm text-muted-foreground">Visualize como ficará sua plataforma</p>
          </div>
          <div className="rounded-lg border border-border/20 p-6 space-y-4" style={{ backgroundColor: colors.background }}>
            <p className="font-bold" style={{ color: colors.text }}>
              {settings.platform_name || "Paz em Canção"}
            </p>
            <p className="text-sm" style={{ color: colors.text, opacity: 0.7 }}>
              Exemplo de texto na sua plataforma
            </p>
            <div className="flex gap-3">
              <button className="px-4 py-2 rounded-lg text-sm font-medium border" style={{ backgroundColor: colors.primary, color: colors.background, borderColor: colors.primary }}>
                Botão Primário
              </button>
              <button className="px-4 py-2 rounded-lg text-sm font-medium border" style={{ color: colors.text, borderColor: colors.text + "40", backgroundColor: "transparent" }}>
                Botão Secundário
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* ─── General ─── */
function GeneralTab({ settings, onSave, saving }: { settings: any; onSave: (v: any) => void; saving: boolean }) {
  const [welcome, setWelcome] = useState(settings.welcome_message || "");
  const [footer, setFooter] = useState(settings.footer_text || "");
  const [email, setEmail] = useState(settings.support_email || "");

  return (
    <Card className="bg-card border-border/30">
      <CardContent className="p-6 space-y-5">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Configurações Gerais</h3>
          <p className="text-sm text-muted-foreground">Configure mensagens e informações da plataforma</p>
        </div>
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-semibold">Mensagem de Boas-vindas</Label>
            <Textarea value={welcome} onChange={(e) => setWelcome(e.target.value)} className="mt-1.5 min-h-[80px]" />
          </div>
          <div>
            <Label className="text-sm font-semibold">Texto do Rodapé</Label>
            <Input value={footer} onChange={(e) => setFooter(e.target.value)} className="mt-1.5" />
          </div>
          <div>
            <Label className="text-sm font-semibold">E-mail de Suporte</Label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1.5" type="email" />
          </div>
        </div>
        <Button onClick={() => onSave({ welcome_message: welcome, footer_text: footer, support_email: email })} disabled={saving} className="w-full gap-2">
          <Save className="h-4 w-4" /> Salvar Configurações
        </Button>
      </CardContent>
    </Card>
  );
}

/* ─── Analytics / Integrations ─── */
function AnalyticsTab({ settings, onSave, saving }: { settings: any; onSave: (v: any) => void; saving: boolean }) {
  const [ga, setGa] = useState(settings.google_analytics_id || "");
  const [fb, setFb] = useState(settings.facebook_pixel_id || "");

  return (
    <Card className="bg-card border-border/30">
      <CardContent className="p-6 space-y-5">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Integrações de Analytics</h3>
          <p className="text-sm text-muted-foreground">Conecte ferramentas de análise para acompanhar o desempenho</p>
        </div>
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-semibold">Google Analytics ID</Label>
            <Input value={ga} onChange={(e) => setGa(e.target.value)} placeholder="G-XXXXXXXXXX" className="mt-1.5" />
            <p className="text-xs text-muted-foreground/60 mt-1">Encontre seu ID no painel do Google Analytics</p>
          </div>
          <div>
            <Label className="text-sm font-semibold">Facebook Pixel ID</Label>
            <Input value={fb} onChange={(e) => setFb(e.target.value)} placeholder="XXXXXXXXXXXXXXX" className="mt-1.5" />
            <p className="text-xs text-muted-foreground/60 mt-1">Encontre seu Pixel ID no Gerenciador de Eventos do Facebook</p>
          </div>
        </div>
        <Button onClick={() => onSave({ google_analytics_id: ga, facebook_pixel_id: fb })} disabled={saving} className="w-full gap-2">
          <Save className="h-4 w-4" /> Salvar Integrações
        </Button>
      </CardContent>
    </Card>
  );
}

/* ─── Notifications ─── */
function NotificationsTab({ settings, onSave, saving }: { settings: any; onSave: (v: any) => void; saving: boolean }) {
  const [emailAlerts, setEmailAlerts] = useState(settings.email_alerts ?? false);
  const [alertEmail, setAlertEmail] = useState(settings.alert_email || "");
  const [onError, setOnError] = useState(settings.alert_on_error ?? true);
  const [onConsec, setOnConsec] = useState(settings.alert_on_consecutive ?? true);
  const [limit, setLimit] = useState(settings.consecutive_limit ?? 3);
  const platforms = settings.monitored_platforms || ["hotmart", "kiwify"];
  const [monitored, setMonitored] = useState<string[]>(platforms);

  const togglePlatform = (p: string) => {
    setMonitored((prev) => prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]);
  };

  const allPlatforms = ["Hotmart", "Kiwify", "Monetizze", "Eduzz", "Bripe"];

  return (
    <Card className="bg-card border-border/30">
      <CardContent className="p-6 space-y-5">
        <div>
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Bell className="h-5 w-5" /> Configuração de Alertas de Webhook
          </h3>
          <p className="text-sm text-muted-foreground">Configure notificações automáticas por email quando houver falhas nos webhooks</p>
        </div>

        <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-4">
          <p className="text-sm font-semibold text-amber-400">Configuração de API necessária</p>
          <p className="text-xs text-muted-foreground mt-1">
            Para ativar as notificações por email, você precisa configurar a chave <code className="bg-muted/20 px-1.5 py-0.5 rounded font-mono text-xs">RESEND_API_KEY</code> nas configurações do backend.
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold">Alertas por Email</p>
            <p className="text-xs text-muted-foreground">Ativar notificações automáticas por email</p>
          </div>
          <Switch checked={emailAlerts} onCheckedChange={setEmailAlerts} />
        </div>

        <div>
          <Label className="text-sm font-semibold">Email para Alertas</Label>
          <Input value={alertEmail} onChange={(e) => setAlertEmail(e.target.value)} className="mt-1.5" type="email" />
          <p className="text-xs text-muted-foreground/60 mt-1">Email que receberá as notificações de falhas nos webhooks</p>
        </div>

        <div>
          <Label className="text-sm font-semibold mb-2 block">Condições de Alerta</Label>
          <div className="space-y-3">
            <label className="flex items-start gap-3 cursor-pointer">
              <Checkbox checked={onError} onCheckedChange={(v) => setOnError(!!v)} className="mt-0.5" />
              <div>
                <p className="text-sm font-medium">⚠ Alertar em cada erro de webhook</p>
                <p className="text-xs text-muted-foreground">Você receberá um email imediatamente após cada falha detectada</p>
              </div>
            </label>
            <label className="flex items-start gap-3 cursor-pointer">
              <Checkbox checked={onConsec} onCheckedChange={(v) => setOnConsec(!!v)} className="mt-0.5" />
              <div>
                <p className="text-sm font-medium">🔴 Alertar após falhas consecutivas</p>
                <p className="text-xs text-muted-foreground">Receberá email apenas após várias falhas seguidas</p>
                {onConsec && (
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-muted-foreground">Limite de falhas:</span>
                    <Input type="number" value={limit} onChange={(e) => setLimit(Number(e.target.value))} className="w-16 h-7 text-xs" min={1} max={50} />
                  </div>
                )}
              </div>
            </label>
          </div>
        </div>

        <div>
          <Label className="text-sm font-semibold mb-2 block">Plataformas Monitoradas</Label>
          <p className="text-xs text-muted-foreground mb-3">Selecione quais plataformas você deseja monitorar</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {allPlatforms.map((p) => {
              const key = p.toLowerCase();
              return (
                <label key={key} className="flex items-center gap-2 p-3 rounded-lg border border-border/20 cursor-pointer hover:border-border/40 transition-colors">
                  <Checkbox checked={monitored.includes(key)} onCheckedChange={() => togglePlatform(key)} />
                  <span className="text-sm">{p}</span>
                </label>
              );
            })}
          </div>
        </div>

        <Button
          onClick={() => onSave({ email_alerts: emailAlerts, alert_email: alertEmail, alert_on_error: onError, alert_on_consecutive: onConsec, consecutive_limit: limit, monitored_platforms: monitored })}
          disabled={saving}
          className="w-full gap-2"
        >
          <Save className="h-4 w-4" /> Salvar Notificações
        </Button>
      </CardContent>
    </Card>
  );
}

/* ─── Advanced ─── */
function AdvancedTab() {
  return (
    <Card className="bg-card border-border/30">
      <CardContent className="p-6 space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Configurações Avançadas</h3>
          <p className="text-sm text-muted-foreground">Opções avançadas para administradores</p>
        </div>
        <div className="rounded-lg bg-muted/10 border border-border/15 p-4">
          <p className="text-sm text-muted-foreground">
            Configurações avançadas como cache, CDN e manutenção estarão disponíveis em breve.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
