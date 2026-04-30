import { useState, useRef } from "react";
import { useParams, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getArea, updateArea, getAreaContents, addAreaContent, removeAreaContent, updateAreaContent, getCategoriesByArea } from "@/lib/areas.functions";
import { listAdminCourses } from "@/lib/admin-courses.functions";
import { uploadPlatformAsset } from "@/lib/platform-settings.functions";
import { listAdminTracks } from "@/lib/admin-tracks.functions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { 
  Loader2, ArrowLeft, Save, Globe, Palette, Type, Layout, 
  Upload, Languages, LogIn, Package, CheckCircle2, Circle, X, Eye, Link2, Plus,
  LayoutPanelTop, Search, Edit3, Trash2, Music, Video, BookOpen, MoreVertical
} from "lucide-react";
import { AdminCardsConfigTab } from "@/components/AdminCardsConfigTab";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function AreaEditPage() {
  const { areaId } = useParams({ from: "/_authenticated/admin/areas/$areaId" });
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("general");

  const { data: area, isLoading: isLoadingArea } = useQuery({
    queryKey: ["area", areaId],
    queryFn: () => getArea(areaId),
  });

  const { data: coursesData } = useQuery({
    queryKey: ["admin-courses"],
    queryFn: () => listAdminCourses(),
  });

  const { data: tracksData } = useQuery({
    queryKey: ["admin-tracks"],
    queryFn: () => listAdminTracks({ data: { pageSize: 1000 } }),
  });

  const { data: areaContents } = useQuery({
    queryKey: ["area-contents", areaId],
    queryFn: () => getAreaContents(areaId),
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => updateArea(areaId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["area", areaId] });
      toast.success("Área atualizada com sucesso!");
    },
    onError: (error: any) => toast.error(`Erro ao atualizar: ${error.message}`),
  });

  if (isLoadingArea) return <div className="flex items-center justify-center py-20"><Loader2 className="h-10 w-10 animate-spin text-gold" /></div>;
  if (!area) return <div>Área não encontrada</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="relative rounded-[2.5rem] border border-gold/10 bg-gradient-to-br from-card/80 via-card/50 to-card/30 p-8 overflow-hidden shadow-2xl backdrop-blur-xl group">
        <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-gold/5 blur-[100px] group-hover:bg-gold/10 transition-all duration-1000" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <Link 
              to="/admin/settings" 
              search={{ tab: "areas" }}
              className="h-12 w-12 flex items-center justify-center rounded-2xl border border-border/30 bg-background/30 text-muted-foreground/50 hover:text-gold hover:border-gold/20 hover:bg-gold/5 transition-all duration-300"
            >
              <ArrowLeft className="h-6 w-6" />
            </Link>
            <div className="space-y-1">
              <h1 className="text-4xl font-black tracking-tight text-foreground uppercase italic flex items-center gap-3">
                <Layout className="h-8 w-8 text-gold" />
                {area.name}
              </h1>
              <p className="text-sm font-medium text-muted-foreground/60 tracking-wide uppercase">
                ID do Ecossistema: <span className="text-gold/80 font-mono">#{areaId.split("-")[0]}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              onClick={() => window.open(`/${area.slug}`, "_blank")}
              className="h-12 rounded-2xl border-border/30 hover:bg-white/5 gap-2 px-6 font-bold"
            >
              <Eye className="h-5 w-5" /> Preview Aluno
            </Button>
            <Button 
              className="h-12 rounded-2xl bg-gold hover:bg-gold/90 text-black gap-2 px-8 font-black shadow-lg shadow-gold/10"
              onClick={() => setActiveTab("general")}
            >
              Configurações
            </Button>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
        <div className="sticky top-4 z-40">
          <TabsList className="bg-card/60 backdrop-blur-md border border-border/20 p-1.5 rounded-[1.5rem] h-auto flex flex-wrap shadow-2xl">
            {[
              { id: "general", label: "Geral", icon: Globe },
              { id: "branding", label: "Branding", icon: Layout },
              { id: "colors", label: "Cores", icon: Palette },
              { id: "language", label: "Idioma", icon: Languages },
              { id: "login", label: "Login", icon: LogIn },
              { id: "products", label: "Módulos", icon: Package },
              { id: "cards", label: "Cards", icon: LayoutPanelTop },
            ].map((tab) => (
              <TabsTrigger 
                key={tab.id}
                value={tab.id}
                className="data-[state=active]:bg-gold/10 data-[state=active]:text-gold data-[state=active]:shadow-none rounded-xl px-6 py-3 gap-2.5 text-xs font-black uppercase tracking-widest transition-all"
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <TabsContent value="general">
          <GeneralTab area={area} onSave={(data: any) => updateMutation.mutate(data)} saving={updateMutation.isPending} />
        </TabsContent>
        <TabsContent value="branding">
          <BrandingTab area={area} onSave={(data: any) => updateMutation.mutate(data)} saving={updateMutation.isPending} />
        </TabsContent>
        <TabsContent value="colors">
          <ColorsTab area={area} onSave={(data: any) => updateMutation.mutate(data)} saving={updateMutation.isPending} />
        </TabsContent>
        <TabsContent value="language">
          <LanguageTab area={area} onSave={(data: any) => updateMutation.mutate(data)} saving={updateMutation.isPending} />
        </TabsContent>
        <TabsContent value="login">
          <LoginTab area={area} onSave={(data: any) => updateMutation.mutate(data)} saving={updateMutation.isPending} />
        </TabsContent>
        <TabsContent value="products">
          <ModulesTab 
            areaId={areaId} 
            areaContents={areaContents || []} 
            courses={coursesData?.courses || []}
            tracks={tracksData?.tracks || []}
          />
        </TabsContent>
        <TabsContent value="cards">
          <CardsTab area={area} onSave={(data: any) => updateMutation.mutate(data)} saving={updateMutation.isPending} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function GeneralTab({ area, onSave, saving }: any) {
  const [data, setData] = useState({ 
    name: area.name, 
    slug: area.slug, 
    description: area.description || "", 
    domain: area.domain || "" 
  });

  return (
    <Card className="bg-card/40 backdrop-blur-sm border-border/20 rounded-[2rem] overflow-hidden shadow-2xl">
      <CardContent className="p-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground/60">Nome da Área</Label>
            <div className="relative group">
              <Type className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/30 group-focus-within:text-gold transition-colors" />
              <Input 
                className="pl-12 h-14 bg-black/20 border-border/30 rounded-2xl focus:border-gold/50 transition-all text-lg font-bold" 
                value={data.name} 
                onChange={(e) => setData({ ...data, name: e.target.value })} 
              />
            </div>
          </div>
          
          <div className="space-y-3">
            <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground/60">Identificador (Slug)</Label>
            <div className="relative group">
              <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/30 group-focus-within:text-gold transition-colors" />
              <Input 
                className="pl-12 h-14 bg-black/20 border-border/30 rounded-2xl focus:border-gold/50 transition-all font-mono" 
                value={data.slug} 
                onChange={(e) => setData({ ...data, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })} 
              />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground/60">Descrição do Ecossistema</Label>
          <Textarea 
            className="bg-black/20 border-border/30 rounded-2xl focus:border-gold/50 transition-all min-h-[120px] p-6 text-base leading-relaxed" 
            value={data.description} 
            onChange={(e) => setData({ ...data, description: e.target.value })} 
            placeholder="Descreva o propósito desta área de membros..."
          />
        </div>

        <div className="space-y-3">
          <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground/60">Domínio Próprio</Label>
          <div className="relative group">
            <Globe className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/30 group-focus-within:text-gold transition-colors" />
            <Input 
              className="pl-12 h-14 bg-black/20 border-border/30 rounded-2xl focus:border-gold/50 transition-all" 
              value={data.domain} 
              placeholder="ex: alunos.seu-dominio.com"
              onChange={(e) => setData({ ...data, domain: e.target.value })} 
            />
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-border/10">
          <Button 
            size="lg"
            onClick={() => onSave(data)} 
            disabled={saving}
            className="h-14 px-10 rounded-2xl bg-gold hover:bg-gold/90 text-black font-black gap-2 transition-all active:scale-95 shadow-xl shadow-gold/5"
          >
            {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
            Salvar Alterações
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function BrandingTab({ area, onSave, saving }: any) {
  const [logoUrl, setLogoUrl] = useState(area.logo_url || "");
  const [faviconUrl, setFaviconUrl] = useState(area.favicon_url || "");
  const [bannerUrl, setBannerUrl] = useState(area.banner_url || "");
  const [uploading, setUploading] = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File, type: string) => {
    setUploading(type);
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const base64 = (e.target?.result as string).split(",")[1];
        const res = await uploadPlatformAsset({ data: { bucket: "covers", path: `areas/${area.id}-${type}.${file.name.split('.').pop()}`, base64, contentType: file.type } });
        if (type === 'logo') setLogoUrl(res.url);
        if (type === 'favicon') setFaviconUrl(res.url);
        if (type === 'banner') setBannerUrl(res.url);
        onSave({ [`${type}_url`]: res.url });
        toast.success("Upload concluído!");
      } catch (error) {
        toast.error("Erro no upload");
      } finally {
        setUploading(null);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <Card className="bg-card/40 backdrop-blur-sm border-border/20 rounded-[2rem] overflow-hidden shadow-2xl">
        <CardContent className="p-8 space-y-6">
          <div className="space-y-1">
            <h3 className="text-xl font-black uppercase italic tracking-tighter">Logotipo Principal</h3>
            <p className="text-xs font-medium text-muted-foreground/60 uppercase tracking-widest">Aparecerá no cabeçalho e sidebar</p>
          </div>
          
          <div 
            onClick={() => logoInputRef.current?.click()}
            className="group relative border-2 border-dashed border-border/20 rounded-3xl p-12 flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-gold/30 hover:bg-gold/5 transition-all duration-500 min-h-[220px]"
          >
            {uploading === 'logo' ? (
              <Loader2 className="h-10 w-10 animate-spin text-gold" />
            ) : logoUrl ? (
              <>
                <img src={logoUrl} className="max-h-24 object-contain group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-3xl transition-opacity">
                  <span className="text-white text-xs font-black uppercase tracking-widest">Alterar Logo</span>
                </div>
              </>
            ) : (
              <>
                <div className="h-16 w-16 rounded-2xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                  <Upload className="h-8 w-8 text-muted-foreground/40" />
                </div>
                <p className="text-xs font-black uppercase tracking-widest text-muted-foreground/40">Clique para enviar</p>
              </>
            )}
            <input type="file" ref={logoInputRef} className="hidden" onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0], 'logo')} />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card/40 backdrop-blur-sm border-border/20 rounded-[2rem] overflow-hidden shadow-2xl">
        <CardContent className="p-8 space-y-6">
          <div className="space-y-1">
            <h3 className="text-xl font-black uppercase italic tracking-tighter">Favicon & Banner</h3>
            <p className="text-xs font-medium text-muted-foreground/60 uppercase tracking-widest">Ícone do navegador e banners secundários</p>
          </div>
          
          <div className="space-y-6">
            <div className="flex items-center gap-6 p-6 bg-black/20 rounded-2xl border border-white/5">
              <div 
                onClick={() => faviconInputRef.current?.click()}
                className="h-16 w-16 rounded-xl bg-background border border-border/30 flex items-center justify-center cursor-pointer hover:border-gold/50 transition-all overflow-hidden"
              >
                {uploading === 'favicon' ? <Loader2 className="h-6 w-6 animate-spin" /> : faviconUrl ? <img src={faviconUrl} className="h-10 w-10 object-contain" /> : <Upload className="h-6 w-6 text-muted-foreground/30" />}
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-black uppercase tracking-widest">Favicon</p>
                <p className="text-[10px] text-muted-foreground/50 uppercase font-medium">PNG ou ICO (32x32px recomendado)</p>
              </div>
              <input type="file" ref={faviconInputRef} className="hidden" onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0], 'favicon')} />
            </div>

            <div className="flex items-center gap-6 p-6 bg-black/20 rounded-2xl border border-white/5">
              <div 
                onClick={() => bannerInputRef.current?.click()}
                className="h-16 w-24 rounded-xl bg-background border border-border/30 flex items-center justify-center cursor-pointer hover:border-gold/50 transition-all overflow-hidden"
              >
                {uploading === 'banner' ? <Loader2 className="h-6 w-6 animate-spin" /> : bannerUrl ? <img src={bannerUrl} className="h-full w-full object-cover" /> : <Upload className="h-6 w-6 text-muted-foreground/30" />}
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-black uppercase tracking-widest">Banner da Área</p>
                <p className="text-[10px] text-muted-foreground/50 uppercase font-medium">JPG ou PNG (1920x400px recomendado)</p>
              </div>
              <input type="file" ref={bannerInputRef} className="hidden" onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0], 'banner')} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ColorsTab({ area, onSave, saving }: any) {
  const [colors, setColors] = useState({ 
    primary: area.primary_color || "#D4A853", 
    secondary: area.secondary_color || "#000000", 
    background: area.background_color || "#000000",
    surface: area.surface_color || "#0A0A0A"
  });

  return (
    <Card className="bg-card/40 backdrop-blur-sm border-border/20 rounded-[2rem] overflow-hidden shadow-2xl">
      <CardContent className="p-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { id: 'primary', label: 'Cor Primária', key: 'primary' },
            { id: 'secondary', label: 'Cor Secundária', key: 'secondary' },
            { id: 'background', label: 'Cor de Fundo', key: 'background' },
            { id: 'surface', label: 'Superfícies', key: 'surface' },
          ].map((item) => (
            <div key={item.id} className="space-y-4 p-6 bg-black/20 rounded-3xl border border-white/5">
              <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground/60">{item.label}</Label>
              <div className="flex flex-col gap-4">
                <div className="h-16 rounded-2xl border border-white/10 shadow-inner" style={{ backgroundColor: (colors as any)[item.key] }} />
                <div className="flex gap-2">
                  <Input 
                    type="color" 
                    className="h-10 w-12 p-1 bg-transparent border-border/20 rounded-lg cursor-pointer"
                    value={(colors as any)[item.key]} 
                    onChange={(e) => setColors({...colors, [item.key]: e.target.value})} 
                  />
                  <Input 
                    className="h-10 flex-1 font-mono text-xs uppercase" 
                    value={(colors as any)[item.key]} 
                    onChange={(e) => setColors({...colors, [item.key]: e.target.value})} 
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-4 border-t border-border/10">
          <Button 
            size="lg"
            onClick={() => onSave({ 
              primary_color: colors.primary, 
              secondary_color: colors.secondary, 
              background_color: colors.background,
              surface_color: colors.surface
            })} 
            disabled={saving}
            className="h-14 px-10 rounded-2xl bg-gold hover:bg-gold/90 text-black font-black gap-2"
          >
            {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Palette className="h-5 w-5" />}
            Aplicar Identidade
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function LanguageTab({ area, onSave, saving }: any) {
  const [lang, setLang] = useState(area.language || "pt-BR");
  
  const languages = [
    { code: "pt-BR", name: "Português (Brasil)", flag: "🇧🇷" },
    { code: "en-US", name: "English (US)", flag: "🇺🇸" },
    { code: "es-ES", name: "Español", flag: "🇪🇸" },
  ];

  return (
    <Card className="bg-card/40 backdrop-blur-sm border-border/20 rounded-[2rem] overflow-hidden shadow-2xl">
      <CardContent className="p-8 space-y-6">
        <div className="space-y-1">
          <h3 className="text-xl font-black uppercase italic tracking-tighter">Idioma da Interface</h3>
          <p className="text-xs font-medium text-muted-foreground/60 uppercase tracking-widest">Selecione o idioma padrão para os alunos desta área</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {languages.map((l) => (
            <div 
              key={l.code}
              onClick={() => setLang(l.code)}
              className={`p-6 rounded-3xl border-2 cursor-pointer transition-all duration-300 flex flex-col items-center gap-4 ${
                lang === l.code ? 'border-gold bg-gold/5 shadow-lg shadow-gold/5' : 'border-border/20 bg-black/20 hover:border-border/40'
              }`}
            >
              <span className="text-4xl">{l.flag}</span>
              <span className={`text-sm font-black uppercase tracking-widest ${lang === l.code ? 'text-gold' : 'text-foreground'}`}>
                {l.name}
              </span>
              {lang === l.code && <CheckCircle2 className="h-5 w-5 text-gold" />}
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-4 border-t border-border/10">
          <Button 
            size="lg"
            onClick={() => onSave({ language: lang })} 
            disabled={saving}
            className="h-14 px-10 rounded-2xl bg-gold hover:bg-gold/90 text-black font-black gap-2"
          >
            {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
            Salvar Preferência
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function LoginTab({ area, onSave, saving }: any) {
  const [data, setData] = useState({ 
    title: area.login_title || `Bem-vindo à ${area.name}`, 
    subtitle: area.login_subtitle || "Faça login para acessar o conteúdo exclusivo.",
    background: area.login_background_url || "" 
  });
  const [uploading, setUploading] = useState<string | null>(null);
  const bgInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    setUploading('bg');
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const base64 = (e.target?.result as string).split(",")[1];
        const res = await uploadPlatformAsset({ data: { bucket: "covers", path: `areas/${area.id}-login-bg.${file.name.split('.').pop()}`, base64, contentType: file.type } });
        setData({ ...data, background: res.url });
        onSave({ login_background_url: res.url });
        toast.success("Background enviado!");
      } catch (error) {
        toast.error("Erro no upload");
      } finally {
        setUploading(null);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <Card className="bg-card/40 backdrop-blur-sm border-border/20 rounded-[2rem] overflow-hidden shadow-2xl">
      <CardContent className="p-8 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="space-y-3">
              <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground/60">Título da Tela de Login</Label>
              <Input 
                className="h-14 bg-black/20 border-border/30 rounded-2xl focus:border-gold/50 transition-all font-bold" 
                value={data.title} 
                onChange={(e) => setData({...data, title: e.target.value})} 
              />
            </div>
            <div className="space-y-3">
              <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground/60">Subtítulo / Mensagem</Label>
              <Textarea 
                className="bg-black/20 border-border/30 rounded-2xl focus:border-gold/50 transition-all min-h-[100px]" 
                value={data.subtitle} 
                onChange={(e) => setData({...data, subtitle: e.target.value})} 
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground/60">Fundo da Página de Login</Label>
            <div 
              onClick={() => bgInputRef.current?.click()}
              className="relative group border-2 border-dashed border-border/20 rounded-3xl h-[236px] flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-gold/30 hover:bg-gold/5 transition-all overflow-hidden"
            >
              {uploading ? (
                <Loader2 className="h-10 w-10 animate-spin text-gold" />
              ) : data.background ? (
                <>
                  <img src={data.background} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <span className="text-white text-xs font-black uppercase tracking-widest">Alterar Fundo</span>
                  </div>
                </>
              ) : (
                <>
                  <Upload className="h-8 w-8 text-muted-foreground/30" />
                  <p className="text-xs font-black uppercase tracking-widest text-muted-foreground/30">Clique para enviar fundo</p>
                </>
              )}
              <input type="file" ref={bgInputRef} className="hidden" onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])} />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-border/10">
          <Button 
            size="lg"
            onClick={() => onSave({ login_title: data.title, login_subtitle: data.subtitle })} 
            disabled={saving}
            className="h-14 px-10 rounded-2xl bg-gold hover:bg-gold/90 text-black font-black gap-2"
          >
            {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
            Salvar Configurações de Login
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function ModulePreview({ content, courses, tracks }: { content: any, courses: any[], tracks: any[] }) {
  const url = content.url;
  if (!url) return null;

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(url);
  let previewData = null;
  
  if (isUuid) {
    if (content.type === 'course' || content.type === 'ebook') {
      previewData = courses.find(c => c.id === url);
    } else if (content.type === 'music') {
      previewData = tracks.find(t => t.id === url);
    }
  }

  if (!previewData) return null;

  const thumbnail = (content.type === 'course' || content.type === 'ebook') 
    ? previewData.cover_image_url 
    : previewData.cover_url;

  return (
    <div className="flex items-center gap-2 mt-1.5 px-2 py-1 rounded-lg bg-black/20 w-fit border border-white/5 shadow-inner">
      {thumbnail ? (
        <img src={thumbnail} className="h-6 w-10 object-cover rounded shadow-sm border border-white/10" alt="" />
      ) : (
        <div className="h-6 w-10 bg-background/50 rounded flex items-center justify-center border border-white/5">
          <Eye className="h-3 w-3 text-muted-foreground/30" />
        </div>
      )}
      <div className="flex flex-col">
        <span className="text-[9px] font-black uppercase tracking-widest text-gold/60 leading-none mb-0.5">Vínculo</span>
        <span className="text-[10px] font-bold text-muted-foreground truncate max-w-[150px] leading-none">
          {previewData.title}
        </span>
      </div>
    </div>
  );
}

function ModulesTab({ areaId, areaContents, courses, tracks }: any) {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: "",
    type: "course",
    url: "",
    category_id: "",
  });

  const { data: categories } = useQuery({
    queryKey: ["area-categories", areaId],
    queryFn: () => getCategoriesByArea(areaId),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => addAreaContent(areaId, data.title, data.type, data.url, data.category_id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["area-contents", areaId] });
      toast.success("Módulo adicionado!");
      handleCloseDialog();
    },
    onError: (error: any) => toast.error(`Erro ao adicionar: ${error.message}`),
  });

  const updateModuleMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => updateAreaContent(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["area-contents", areaId] });
      toast.success("Módulo atualizado!");
      handleCloseDialog();
    },
    onError: (error: any) => toast.error(`Erro ao atualizar: ${error.message}`),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => removeAreaContent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["area-contents", areaId] });
      toast.success("Módulo removido!");
    }
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string, status: string }) => 
      updateAreaContent(id, { status: status === 'active' ? 'inactive' : 'active' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["area-contents", areaId] });
      toast.success("Status atualizado!");
    }
  });

  const filteredContents = areaContents.filter((c: any) => 
    c.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenCreate = () => {
    setEditingModule(null);
    setFormData({ title: "", type: "course", url: "", category_id: "" });
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (module: any) => {
    setEditingModule(module);
    setFormData({ 
      title: module.title, 
      type: module.type, 
      url: module.url || "",
      category_id: module.category_id || "",
    });
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingModule(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingModule) {
      updateModuleMutation.mutate({ id: editingModule.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'music':
      case 'música':
        return <Music className="h-5 w-5 text-gold" />;
      case 'course':
      case 'curso':
      case 'vídeo':
        return <Video className="h-5 w-5 text-blue-400" />;
      case 'ebook':
        return <BookOpen className="h-5 w-5 text-green-400" />;
      default:
        return <Package className="h-5 w-5 text-muted-foreground" />;
    }
  };

  return (
    <Card className="bg-card/40 backdrop-blur-sm border-border/20 rounded-[2rem] overflow-hidden shadow-2xl">
      <CardContent className="p-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h3 className="text-2xl font-black uppercase italic tracking-tighter text-foreground">Gestão de Módulos</h3>
            <p className="text-xs font-medium text-muted-foreground/60 uppercase tracking-widest">Controle os recursos disponíveis nesta área</p>
          </div>
          <Button 
            className="bg-gold hover:bg-gold/90 text-black font-black px-6 rounded-xl h-12 gap-2 shadow-lg shadow-gold/10"
            onClick={handleOpenCreate}
          >
            <Plus className="h-5 w-5" /> Adicionar Módulo
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/40" />
          <Input 
            placeholder="Pesquisar por nome..." 
            className="pl-12 h-14 bg-black/40 border-border/30 rounded-2xl focus:border-gold/50 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-separate border-spacing-y-3">
            <thead>
              <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 px-6">
                <th className="pb-4 pl-6">Módulo</th>
                <th className="pb-4">Categoria</th>
                <th className="pb-4">Data</th>
                <th className="pb-4">Tipo</th>
                <th className="pb-4 text-center">Status</th>
                <th className="pb-4 text-right pr-6">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredContents.map((content: any) => (
                <tr key={content.id} className="group bg-black/20 hover:bg-black/40 transition-all">
                  <td className="py-4 pl-6 rounded-l-2xl border-y border-l border-border/10">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-xl bg-background/50 border border-border/20 flex items-center justify-center group-hover:border-gold/30 transition-colors">
                        {getTypeIcon(content.type)}
                      </div>
                      <span className="font-bold text-foreground tracking-tight">{content.title}</span>
                    </div>
                  </td>
                  <td className="py-4 border-y border-border/10">
                    <span className="text-xs font-medium text-muted-foreground">
                      {content.categories?.name || "Sem categoria"}
                    </span>
                  </td>
                  <td className="py-4 border-y border-border/10">
                    <span className="text-[10px] font-mono text-muted-foreground/60">
                      {new Date(content.created_at).toLocaleDateString('pt-BR')}
                    </span>
                  </td>
                  <td className="py-4 border-y border-border/10 uppercase text-[10px] font-black tracking-widest text-muted-foreground/60">
                    {content.type}
                  </td>
                  <td className="py-4 border-y border-border/10 text-center">
                    <button 
                      onClick={() => toggleStatusMutation.mutate({ id: content.id, status: content.status || 'active' })}
                      className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                        (content.status || 'active') === 'active' 
                        ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20' 
                        : 'bg-muted/10 text-muted-foreground hover:bg-muted/20'
                      }`}
                    >
                      {(content.status || 'active') === 'active' ? 'Ativo' : 'Inativo'}
                    </button>
                  </td>
                  <td className="py-4 pr-6 rounded-r-2xl border-y border-r border-border/10 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-9 w-9 rounded-lg hover:bg-gold/10 hover:text-gold"
                        onClick={() => handleOpenEdit(content)}
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-9 w-9 rounded-lg hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => {
                          if (confirm("Deseja realmente remover este módulo?")) {
                            deleteMutation.mutate(content.id);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredContents.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-20 text-center text-muted-foreground/40 font-bold uppercase tracking-widest text-xs italic">
                    Nenhum módulo encontrado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[500px] bg-card border-border/40 shadow-2xl rounded-[2rem]">
            <form onSubmit={handleSubmit}>
              <DialogHeader className="pt-4 pb-2">
                <DialogTitle className="text-2xl font-black">
                  {editingModule ? "Editar Módulo" : "Novo Módulo"}
                </DialogTitle>
                <DialogDescription>
                  Configure os detalhes do módulo para esta área.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 py-6 px-6">
                <div className="space-y-2.5">
                  <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/70">
                    Título do Módulo
                  </Label>
                  <Input
                    placeholder="Ex: Curso de Marketing, Playlist VIP"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="h-12 bg-black/20 border-border/30 focus:border-gold/50 rounded-xl transition-all"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2.5">
                    <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/70">
                      Tipo de Conteúdo
                    </Label>
                    <Select 
                      value={formData.type} 
                      onValueChange={(value) => setFormData({ ...formData, type: value })}
                    >
                      <SelectTrigger className="h-12 bg-black/20 border-border/30 focus:border-gold/50 rounded-xl">
                        <SelectValue placeholder="Tipo" />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-border/40">
                        <SelectItem value="course">Curso / Vídeo</SelectItem>
                        <SelectItem value="music">Música / Playlist</SelectItem>
                        <SelectItem value="ebook">Ebook / PDF</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2.5">
                    <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/70">
                      Categoria
                    </Label>
                    <Select 
                      value={formData.category_id} 
                      onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                    >
                      <SelectTrigger className="h-12 bg-black/20 border-border/30 focus:border-gold/50 rounded-xl">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-border/40">
                        {categories?.map((cat: any) => (
                          <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/70">
                    Link / ID (Opcional)
                  </Label>
                  <Input
                    placeholder="ID do curso ou URL externa"
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    className="h-12 bg-black/20 border-border/30 focus:border-gold/50 rounded-xl transition-all"
                  />
                </div>
              </div>

              <DialogFooter className="sm:justify-end gap-3 pb-6 px-6">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleCloseDialog}
                  className="hover:bg-white/5 rounded-xl h-11 px-6 font-medium"
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={createMutation.isPending || updateModuleMutation.isPending}
                  className="bg-gold hover:bg-gold/90 text-black font-black px-8 h-11 rounded-xl shadow-lg shadow-gold/10"
                >
                  {editingModule ? "Salvar Alterações" : "Adicionar Módulo"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
function CardsTab({ area, onSave, saving }: any) {
  const settings = area.settings as Record<string, any> || {};
  
  const handleSave = (config: any) => {
    onSave({
      settings: {
        ...settings,
        cards_config: config
      }
    });
  };

  return (
    <Card className="bg-card/40 backdrop-blur-sm border-border/20 rounded-[2rem] overflow-hidden shadow-2xl">
      <CardContent className="p-8">
        <AdminCardsConfigTab 
          initial={settings.cards_config || {}} 
          onSave={handleSave}
          isLoading={saving}
        />
      </CardContent>
    </Card>
  );
}