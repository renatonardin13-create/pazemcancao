import { toastError } from "@/lib/toast-utils";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPlatformSettings, updatePlatformSetting, uploadPlatformAsset } from "@/lib/platform-settings.functions";
import { getPlatformModules, updatePlatformModule, type PlatformModule } from "@/lib/platform-modules.functions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Settings, Upload, Palette, Globe, Link2, Bell, Wrench, RefreshCw, Save, Download, UploadCloud, AlertTriangle, Loader2, LayoutGrid } from "lucide-react";
import { MODULE_KEYS, type ModuleKey, type PlatformModules } from "@/hooks/use-project-mode";
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
    onError: (err: any) => toastError(err),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        Carregando configurações...
      </div>
    );
  }

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
                Configurações da Plataforma
              </h1>
              <p className="text-xs text-muted-foreground/50 mt-0.5">
                Personalize a aparência e comportamento da sua área de membros
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-card/60 border border-border/25 p-1 rounded-xl flex-wrap h-auto">
          <TabsTrigger value="branding" className="data-[state=active]:bg-gold/15 data-[state=active]:text-gold data-[state=active]:shadow-none rounded-lg text-xs font-semibold px-4 gap-1.5">
            <Upload className="h-3.5 w-3.5" /> Identidade Visual
          </TabsTrigger>
          <TabsTrigger value="colors" className="data-[state=active]:bg-gold/15 data-[state=active]:text-gold data-[state=active]:shadow-none rounded-lg text-xs font-semibold px-4 gap-1.5">
            <Palette className="h-3.5 w-3.5" /> Cores
          </TabsTrigger>
          <TabsTrigger value="general" className="data-[state=active]:bg-gold/15 data-[state=active]:text-gold data-[state=active]:shadow-none rounded-lg text-xs font-semibold px-4 gap-1.5">
            <Globe className="h-3.5 w-3.5" /> Geral
          </TabsTrigger>
          <TabsTrigger value="analytics" className="data-[state=active]:bg-gold/15 data-[state=active]:text-gold data-[state=active]:shadow-none rounded-lg text-xs font-semibold px-4 gap-1.5">
            <Link2 className="h-3.5 w-3.5" /> Integrações
          </TabsTrigger>
          <TabsTrigger value="notifications" className="data-[state=active]:bg-gold/15 data-[state=active]:text-gold data-[state=active]:shadow-none rounded-lg text-xs font-semibold px-4 gap-1.5">
            <Bell className="h-3.5 w-3.5" /> Notificações
          </TabsTrigger>
          <TabsTrigger value="advanced" className="data-[state=active]:bg-gold/15 data-[state=active]:text-gold data-[state=active]:shadow-none rounded-lg text-xs font-semibold px-4 gap-1.5">
            <Wrench className="h-3.5 w-3.5" /> Avançado
          </TabsTrigger>
          <TabsTrigger value="modules" className="data-[state=active]:bg-gold/15 data-[state=active]:text-gold data-[state=active]:shadow-none rounded-lg text-xs font-semibold px-4 gap-1.5">
            <LayoutGrid className="h-3.5 w-3.5" /> Módulos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="branding" className="mt-4">
          <BrandingTab settings={settings.branding || {}} onSave={(v) => mutation.mutate({ key: "branding", value: v })} saving={mutation.isPending} />
        </TabsContent>
        <TabsContent value="colors" className="mt-4">
          <ColorsTab settings={settings.colors || {}} onSave={(v) => mutation.mutate({ key: "colors", value: v })} saving={mutation.isPending} />
        </TabsContent>
        <TabsContent value="general" className="mt-4">
          <GeneralTab settings={settings.general || {}} onSave={(v) => mutation.mutate({ key: "general", value: v })} saving={mutation.isPending} />
        </TabsContent>
        <TabsContent value="analytics" className="mt-4">
          <AnalyticsTab settings={settings.analytics || {}} onSave={(v) => mutation.mutate({ key: "analytics", value: v })} saving={mutation.isPending} />
        </TabsContent>
        <TabsContent value="notifications" className="mt-4">
          <NotificationsTab settings={settings.notifications || {}} onSave={(v) => mutation.mutate({ key: "notifications", value: v })} saving={mutation.isPending} />
        </TabsContent>
        <TabsContent value="advanced" className="mt-4">
          <AdvancedTab settings={settings.advanced || {}} onSave={(v) => mutation.mutate({ key: "advanced", value: v })} saving={mutation.isPending} />
        </TabsContent>
        <TabsContent value="modules" className="mt-4">
          <ModulesTab settings={settings.modules || {}} onSave={(v) => mutation.mutate({ key: "modules", value: v })} saving={mutation.isPending} />
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
  const [uploading, setUploading] = useState<"logo" | "favicon" | null>(null);
  const logoRef = useRef<HTMLInputElement>(null);
  const faviconRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File, type: "logo" | "favicon") => {
    if (file.size > 2 * 1024 * 1024) { toast.error("Arquivo muito grande (máx 2MB)"); return; }
    setUploading(type);
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = (reader.result as string).split(",")[1];
      try {
        const res = await uploadPlatformAsset({
          data: { bucket: "covers", path: `platform/${type}-${Date.now()}.${file.name.split(".").pop()}`, base64, contentType: file.type },
        });
        if (type === "logo") setLogoUrl(res.url);
        else setFaviconUrl(res.url);
        toast.success(`${type === "logo" ? "Logo" : "Favicon"} enviado com sucesso!`);
      } catch (err: any) { toastError(err); }
      finally { setUploading(null); }
    };
    reader.onerror = () => {
      toast.error("Erro ao ler arquivo");
      setUploading(null);
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
            className="border-2 border-dashed border-border/30 rounded-lg p-8 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-border/50 transition-colors min-h-[180px] relative"
            onClick={() => !uploading && logoRef.current?.click()}
          >
            {uploading === "logo" && (
              <div className="absolute inset-0 bg-background/60 flex items-center justify-center rounded-lg z-10">
                <Loader2 className="h-6 w-6 animate-spin text-foreground/60" />
              </div>
            )}
            {logoUrl ? (
              <>
                <img src={logoUrl} alt="Logo" className="max-h-20 object-contain" />
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setLogoUrl(""); }}
                  className="mt-2 text-xs text-destructive/60 hover:text-destructive flex items-center gap-1"
                >
                  <AlertTriangle className="h-3 w-3" /> Remover logo
                </button>
              </>
            ) : (
              <>
                <Upload className="h-8 w-8 text-muted-foreground/70" />
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
                className="mt-1.5 flex items-center gap-3 p-3 border border-border/20 rounded-lg cursor-pointer hover:border-border/40 transition-colors relative"
                onClick={() => !uploading && faviconRef.current?.click()}
              >
                {uploading === "favicon" && (
                  <div className="absolute inset-0 bg-background/60 flex items-center justify-center rounded-lg z-10">
                    <Loader2 className="h-4 w-4 animate-spin text-foreground/60" />
                  </div>
                )}
                {faviconUrl ? (
                  <div className="flex items-center gap-3">
                    <img src={faviconUrl} alt="Favicon" className="h-8 w-8 object-contain" />
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setFaviconUrl(""); }}
                      className="text-xs text-destructive/60 hover:text-destructive"
                    >
                      Remover
                    </button>
                  </div>
                ) : (
                  <div className="h-8 w-8 rounded border border-dashed border-border/30 flex items-center justify-center">
                    <Upload className="h-4 w-4 text-muted-foreground/70" />
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
          <Button onClick={() => onSave({ platform_name: name, logo_url: logoUrl || null, favicon_url: faviconUrl || null })} disabled={saving || !!uploading} className="w-full gap-2">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Salvar Identidade Visual
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
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Salvar Cores
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
const PROJECT_MODES = [
  { value: "hibrido", label: "Híbrido", desc: "Música + Cursos + Ebooks + Outros" },
  { value: "somente_musica", label: "Somente Música", desc: "Louvores, categorias e player" },
  { value: "somente_cursos", label: "Somente Cursos", desc: "Cursos, módulos, aulas e ebooks" },
] as const;

function GeneralTab({ settings, onSave, saving }: { settings: any; onSave: (v: any) => void; saving: boolean }) {
  const [welcome, setWelcome] = useState(settings.welcome_message || "");
  const [footer, setFooter] = useState(settings.footer_text || "");
  const [email, setEmail] = useState(settings.support_email || "");
  const [projectMode, setProjectMode] = useState(settings.project_mode || "hibrido");

  return (
    <div className="space-y-6">
      {/* Project Mode */}
      <Card className="bg-card border-gold/20">
        <CardContent className="p-6 space-y-5">
          <div>
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Settings className="h-5 w-5 text-gold" /> Modo do Projeto
            </h3>
            <p className="text-sm text-muted-foreground">Define quais módulos ficam visíveis para os alunos</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {PROJECT_MODES.map((m) => (
              <button
                key={m.value}
                type="button"
                onClick={() => setProjectMode(m.value)}
                className={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                  projectMode === m.value
                    ? "border-gold bg-gold/10 ring-1 ring-gold/20"
                    : "border-border/20 hover:border-border/40 bg-card/50"
                }`}
              >
                <p className={`text-sm font-bold ${projectMode === m.value ? "text-gold" : "text-foreground"}`}>{m.label}</p>
                <p className="text-xs text-muted-foreground mt-1">{m.desc}</p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* General settings */}
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
          <Button onClick={() => {
            if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
              toast.error("E-mail de suporte inválido");
              return;
            }
            onSave({ welcome_message: welcome, footer_text: footer, support_email: email, project_mode: projectMode });
        }} disabled={saving} className="w-full gap-2">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Salvar Configurações
        </Button>
        </CardContent>
      </Card>
    </div>
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
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Salvar Integrações
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
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Salvar Notificações
        </Button>
      </CardContent>
    </Card>
  );
}

/* ─── Advanced ─── */
function AdvancedTab({ settings, onSave, saving }: { settings: any; onSave: (v: any) => void; saving: boolean }) {
  const [maintenance, setMaintenance] = useState(settings.maintenance_mode ?? false);
  const [allowSignups, setAllowSignups] = useState(settings.allow_signups ?? true);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `platform-settings-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Configurações exportadas!");
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const imported = JSON.parse(reader.result as string);
        onSave({ ...settings, ...imported });
        toast.success("Configurações importadas!");
      } catch {
        toast.error("Arquivo inválido");
      }
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    if (!confirm("Tem certeza que deseja restaurar TODAS as configurações para os valores padrão? Esta ação é irreversível.")) return;
    onSave({ maintenance_mode: false, allow_signups: true });
    toast.success("Configurações restauradas para o padrão!");
  };

  return (
    <div className="space-y-6">
      {/* Controles */}
      <Card className="bg-card border-border/30">
        <CardContent className="p-6 space-y-5">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Controles da Plataforma</h3>
            <p className="text-sm text-muted-foreground">Configurações avançadas de funcionamento</p>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">Modo Manutenção</p>
                <p className="text-xs text-muted-foreground">Quando ativo, apenas administradores podem acessar a plataforma</p>
              </div>
              <Switch checked={maintenance} onCheckedChange={setMaintenance} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">Permitir Novos Cadastros</p>
                <p className="text-xs text-muted-foreground">Permite que novos usuários se registrem na plataforma</p>
              </div>
              <Switch checked={allowSignups} onCheckedChange={setAllowSignups} />
            </div>
          </div>
          <Button onClick={() => onSave({ ...settings, maintenance_mode: maintenance, allow_signups: allowSignups })} disabled={saving} className="w-full gap-2">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Salvar Controles
          </Button>
        </CardContent>
      </Card>

      {/* Backup */}
      <Card className="bg-card border-border/30">
        <CardContent className="p-6 space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Backup e Restauração</h3>
            <p className="text-sm text-muted-foreground">Exporte ou importe suas configurações</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="gap-2" onClick={handleExport}>
              <Download className="h-4 w-4" /> Exportar Configurações
            </Button>
            <Button variant="outline" className="gap-2" onClick={() => fileRef.current?.click()}>
              <UploadCloud className="h-4 w-4" /> Importar Configurações
            </Button>
            <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="bg-card border-red-500/30">
        <CardContent className="p-6 space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-red-400">Zona de Perigo</h3>
            <p className="text-sm text-muted-foreground">Ações irreversíveis</p>
          </div>
          <Button variant="destructive" className="gap-2" onClick={handleReset}>
            <RefreshCw className="h-4 w-4" /> Restaurar Todas as Configurações
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

/* ─── Modules ─── */
const MODULE_LABELS: Record<ModuleKey, { label: string; desc: string; icon: string }> = {
  vitrine: { label: "Vitrine", desc: "Página principal com prateleiras de cursos", icon: "🏪" },
  louvores: { label: "Louvores", desc: "Catálogo de músicas e player de áudio", icon: "🎵" },
  cursos: { label: "Cursos", desc: "Cursos com módulos, aulas e progresso", icon: "🎓" },
  ebooks: { label: "Ebooks", desc: "Leitor de ebooks e materiais em PDF", icon: "📖" },
  trilhas: { label: "Trilhas", desc: "Jornadas emocionais e categorias musicais", icon: "🛤️" },
  perfil: { label: "Perfil", desc: "Página de perfil do aluno", icon: "👤" },
  comunidade: { label: "Comunidade", desc: "Espaço de interação entre alunos", icon: "💬" },
  bonus: { label: "Bônus", desc: "Conteúdos bônus e extras", icon: "🎁" },
  lancamentos: { label: "Lançamentos", desc: "Novos conteúdos e pré-lançamentos", icon: "🚀" },
};

function ModulesTab({ settings, onSave, saving }: { settings: any; onSave: (v: any) => void; saving: boolean }) {
  const [modules, setModules] = useState<Partial<PlatformModules>>(() => {
    const initial: Partial<PlatformModules> = {};
    for (const key of MODULE_KEYS) {
      if (key in settings) initial[key] = !!settings[key];
    }
    return initial;
  });

  const toggle = (key: ModuleKey) => {
    setModules((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Count enabled
  const enabledCount = MODULE_KEYS.filter((k) => modules[k] !== false).length;

  return (
    <Card className="bg-card border-border/30">
      <CardContent className="p-6 space-y-5">
        <div>
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <LayoutGrid className="h-5 w-5 text-gold" /> Módulos da Plataforma
          </h3>
          <p className="text-sm text-muted-foreground">
            Habilite ou desabilite seções do app. Módulos desabilitados ficam ocultos no menu e na vitrine.
          </p>
          <p className="text-xs text-muted-foreground/50 mt-1">
            {enabledCount} de {MODULE_KEYS.length} módulos habilitados
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {MODULE_KEYS.map((key) => {
            const info = MODULE_LABELS[key];
            const enabled = modules[key] !== false;
            return (
              <button
                key={key}
                type="button"
                onClick={() => toggle(key)}
                className={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                  enabled
                    ? "border-gold/30 bg-gold/[0.06]"
                    : "border-border/15 bg-card/30 opacity-60"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-lg">{info.icon}</span>
                  <Switch checked={enabled} onCheckedChange={() => toggle(key)} />
                </div>
                <p className={`text-sm font-bold ${enabled ? "text-foreground" : "text-muted-foreground"}`}>
                  {info.label}
                </p>
                <p className="text-xs text-muted-foreground/70 mt-0.5">{info.desc}</p>
              </button>
            );
          })}
        </div>

        <Button onClick={() => onSave(modules)} disabled={saving} className="w-full gap-2">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Salvar Módulos
        </Button>
      </CardContent>
    </Card>
  );
}
