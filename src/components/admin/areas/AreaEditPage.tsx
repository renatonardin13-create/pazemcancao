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
  Upload, Languages, LogIn, Package, CheckCircle2, Circle, X
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
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-8">
        <Link to="/admin/settings" search={{ tab: "areas" }} className="h-10 w-10 flex items-center justify-center rounded-xl border border-border/40 hover:bg-white/5 transition-all"><ArrowLeft className="h-5 w-5" /></Link>
        <div>
          <h1 className="text-3xl font-black tracking-tight">{area.name}</h1>
          <p className="text-muted-foreground">Configure e personalize esta área de membros</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-card/40 border border-border/20 p-1 rounded-2xl h-auto flex-wrap">
          <TabsTrigger value="general">Geral</TabsTrigger>
          <TabsTrigger value="branding">Branding</TabsTrigger>
          <TabsTrigger value="colors">Cores</TabsTrigger>
          <TabsTrigger value="language">Idioma</TabsTrigger>
          <TabsTrigger value="login">Login</TabsTrigger>
          <TabsTrigger value="products">Produtos</TabsTrigger>
        </TabsList>

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
  const [data, setData] = useState({ name: area.name, slug: area.slug, description: area.description, domain: area.domain });
  return (
    <Card className="bg-card/40 border-border/20">
      <CardContent className="p-6 space-y-4">
        <Label>Nome da Área</Label>
        <Input value={data.name} onChange={(e) => setData({ ...data, name: e.target.value })} />
        <Label>Slug</Label>
        <Input value={data.slug} onChange={(e) => setData({ ...data, slug: e.target.value })} />
        <Label>Descrição</Label>
        <Textarea value={data.description} onChange={(e) => setData({ ...data, description: e.target.value })} />
        <Label>Domínio</Label>
        <Input value={data.domain} onChange={(e) => setData({ ...data, domain: e.target.value })} />
        <Button onClick={() => onSave(data)} disabled={saving}><Save className="h-4 w-4 mr-2"/>Salvar</Button>
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
      const res = await uploadPlatformAsset({ bucket: "covers", path: `areas/${area.id}-logo.png`, base64, contentType: file.type });
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
