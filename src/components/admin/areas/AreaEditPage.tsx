import { useState, useRef } from "react";
import { useParams, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getArea, updateArea, getAreaContents, addAreaContent, removeAreaContent } from "@/lib/areas.functions";
import { listAdminCourses } from "@/lib/admin-courses.functions";
import { uploadPlatformAsset } from "@/lib/platform-settings.functions";
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
  LayoutPanelTop
} from "lucide-react";
import { AdminCardsConfigTab } from "@/components/AdminCardsConfigTab";

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
              { id: "products", label: "Produtos", icon: Package },
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
          <ProductsTab areaId={areaId} courses={coursesData?.courses || []} areaContents={areaContents || []} />
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

function ProductsTab({ areaId, courses, areaContents }: any) {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");

  const addMutation = useMutation({
    mutationFn: (courseId: string) => addAreaContent(areaId, "Course", "course", courseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["area-contents", areaId] });
      toast.success("Produto vinculado!");
    }
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => removeAreaContent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["area-contents", areaId] });
      toast.success("Produto removido!");
    }
  });

  const filteredCourses = courses.filter((c: any) => 
    c.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card className="bg-card/40 backdrop-blur-sm border-border/20 rounded-[2rem] overflow-hidden shadow-2xl">
      <CardContent className="p-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h3 className="text-xl font-black uppercase italic tracking-tighter text-gold">Produtos Vinculados</h3>
            <p className="text-xs font-medium text-muted-foreground/60 uppercase tracking-widest">Gerencie quais cursos estão disponíveis nesta área</p>
          </div>
          <div className="relative w-full md:w-80">
            <Globe className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" />
            <Input 
              placeholder="Buscar curso..." 
              className="pl-11 h-12 bg-black/20 border-border/30 rounded-xl focus:border-gold/50"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredCourses.map((course: any) => {
            const content = areaContents.find((c: any) => c.url === course.id);
            const isLinked = !!content;
            
            return (
              <div 
                key={course.id} 
                className={`flex items-center justify-between p-5 rounded-[1.5rem] border-2 transition-all duration-300 ${
                  isLinked ? 'border-gold/20 bg-gold/5 shadow-lg shadow-gold/5' : 'border-border/10 bg-black/20 hover:border-border/30'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`h-12 w-12 rounded-xl border border-white/10 overflow-hidden bg-background flex items-center justify-center`}>
                    {course.cover_image_url ? (
                      <img src={course.cover_image_url} className="h-full w-full object-cover" />
                    ) : (
                      <Package className="h-6 w-6 text-muted-foreground/30" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm line-clamp-1">{course.title}</h4>
                    <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/40 italic">
                      {course.status === 'published' ? 'Publicado' : 'Rascunho'}
                    </p>
                  </div>
                </div>

                <Button 
                  size="sm"
                  variant={isLinked ? "outline" : "default"}
                  onClick={() => isLinked ? removeMutation.mutate(content.id) : addMutation.mutate(course.id)}
                  disabled={addMutation.isPending || removeMutation.isPending}
                  className={`h-10 rounded-xl px-4 font-black text-[10px] uppercase tracking-tighter transition-all ${
                    isLinked ? 'border-destructive/20 text-destructive hover:bg-destructive/10' : 'bg-gold hover:bg-gold/90 text-black'
                  }`}
                >
                  {isLinked ? <X className="h-3.5 w-3.5 mr-1.5" /> : <Plus className="h-3.5 w-3.5 mr-1.5" />}
                  {isLinked ? 'Remover' : 'Vincular'}
                </Button>
              </div>
            );
          })}
        </div>
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