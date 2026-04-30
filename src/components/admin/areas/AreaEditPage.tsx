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
  Upload, Languages, LogIn, Package, CheckCircle2, Circle, X, Eye, Link2
} from "lucide-react";

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
  const [uploading, setUploading] = useState(false);
  const handleUpload = async (file: File) => {
    setUploading(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = (e.target?.result as string).split(",")[1];
      const res = await uploadPlatformAsset({ data: { bucket: "covers", path: `areas/${area.id}-logo.png`, base64, contentType: file.type } });
      setLogoUrl(res.url);
      onSave({ logo_url: res.url });
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  return (
    <Card className="bg-card/40 border-border/20">
      <CardContent className="p-6 space-y-4">
        <Label>Logo da Área</Label>
        <div className="border border-dashed border-border/30 rounded-lg p-6 flex flex-col items-center gap-4">
          {logoUrl && <img src={logoUrl} className="h-20 object-contain" />}
          <input type="file" onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])} />
          {uploading && <Loader2 className="animate-spin" />}
        </div>
      </CardContent>
    </Card>
  );
}

function ColorsTab({ area, onSave, saving }: any) {
  const [colors, setColors] = useState({ primary: area.primary_color, secondary: area.secondary_color, background: area.background_color });
  return (
    <Card className="bg-card/40 border-border/20">
      <CardContent className="p-6 space-y-4">
        <Label>Cor Primária</Label>
        <Input type="color" value={colors.primary} onChange={(e) => setColors({...colors, primary: e.target.value})} />
        <Button onClick={() => onSave({ primary_color: colors.primary, secondary_color: colors.secondary, background_color: colors.background })} disabled={saving}>Salvar</Button>
      </CardContent>
    </Card>
  );
}

function LanguageTab({ area, onSave, saving }: any) {
  const [lang, setLang] = useState(area.language || "pt-BR");
  return (
    <Card className="bg-card/40 border-border/20">
      <CardContent className="p-6 space-y-4">
        <Label>Idioma</Label>
        <Input value={lang} onChange={(e) => setLang(e.target.value)} />
        <Button onClick={() => onSave({ language: lang })} disabled={saving}>Salvar</Button>
      </CardContent>
    </Card>
  );
}

function LoginTab({ area, onSave, saving }: any) {
  const [data, setData] = useState({ title: area.login_title || "", subtitle: area.login_subtitle || "" });
  return (
    <Card className="bg-card/40 border-border/20">
      <CardContent className="p-6 space-y-4">
        <Label>Título Login</Label>
        <Input value={data.title} onChange={(e) => setData({...data, title: e.target.value})} />
        <Button onClick={() => onSave({ login_title: data.title, login_subtitle: data.subtitle })} disabled={saving}>Salvar</Button>
      </CardContent>
    </Card>
  );
}

function ProductsTab({ areaId, courses, areaContents }: any) {
  const queryClient = useQueryClient();
  const addMutation = useMutation({
    mutationFn: (courseId: string) => addAreaContent(areaId, "Course", "course", courseId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["area-contents", areaId] })
  });
  const removeMutation = useMutation({
    mutationFn: (id: string) => removeAreaContent(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["area-contents", areaId] })
  });

  return (
    <Card className="bg-card/40 border-border/20">
      <CardContent className="p-6 space-y-4">
        {courses.map((course: any) => {
          const isLinked = areaContents.some((c: any) => c.url === course.id);
          return (
            <div key={course.id} className="flex items-center justify-between p-4 bg-black/20 rounded-xl">
              <span>{course.title}</span>
              {isLinked ? (
                <Button variant="destructive" onClick={() => removeMutation.mutate(areaContents.find((c: any) => c.url === course.id).id)}>Remover</Button>
              ) : (
                <Button onClick={() => addMutation.mutate(course.id)}>Adicionar</Button>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
