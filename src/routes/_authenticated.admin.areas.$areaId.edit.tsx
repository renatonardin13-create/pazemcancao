import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { 
  Globe, 
  ArrowLeft, 
  Loader2, 
  Check, 
  AlertCircle, 
  Sparkles, 
  Layout, 
  BookOpen, 
  GraduationCap, 
  Copy, 
  ExternalLink, 
  Save,
  Star,
  Trash2,
  Palette,
  Image as ImageIcon,
  Chrome
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { ImageUploadField } from "@/components/ImageUploadField";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { updateAreaMembro, getAreaMembro, deleteAreaMembro } from "@/lib/areas-membros.functions";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/_authenticated/admin/areas/$areaId/edit")({
  component: EditAreaPage,
});

function EditAreaPage() {
  const { areaId } = useParams({ from: "/_authenticated/admin/areas/$areaId/edit" });
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [nome, setNome] = useState("");
  const [rotuloCurto, setRotuloCurto] = useState("");
  const [descricao, setDescricao] = useState("");
  const [tipo, setTipo] = useState("misto");
  const [subdominio, setSubdominio] = useState("");
  const [status, setStatus] = useState("active");
  const [produtoId, setProdutoId] = useState("");
  const [ativa, setAtiva] = useState(true);
  const [principal, setPrincipal] = useState(false);
  const [language, setLanguage] = useState("pt-BR");
  const [primaryColor, setPrimaryColor] = useState("#D4AF37");
  const [secondaryColor, setSecondaryColor] = useState("#000000");
  const [logoUrl, setLogoUrl] = useState("");
  const [faviconUrl, setFaviconUrl] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");
  const [backgroundColor, setBackgroundColor] = useState("#0B1220");
  const [surfaceColor, setSurfaceColor] = useState("#111827");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const { data: areaData, isLoading: isLoadingArea } = useQuery({
    queryKey: ["area-membro", areaId],
    queryFn: () => getAreaMembro({ data: { id: areaId } }),
  });

  const { data: products } = useQuery({
    queryKey: ["admin-courses-simple"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("id, title")
        .order("title");
      if (error) throw error;
      return data;
    }
  });

  const area = areaData?.area;

  useEffect(() => {
    if (area) {
      setNome(area.nome || "");
      setRotuloCurto(area.rotulo_curto || "");
      setDescricao(area.descricao || "");
      setTipo(area.tipo || "misto");
      setSubdominio(area.subdominio || "");
      setStatus(area.status || "active");
      setProdutoId(area.produto_id || "");
      setAtiva(area.ativa ?? true);
      setPrincipal(area.principal ?? false);
      setLanguage(area.language || "pt-BR");
      setPrimaryColor(area.primary_color || "#D4AF37");
      setSecondaryColor(area.secondary_color || "#000000");
      setLogoUrl(area.logo_url || "");
      setFaviconUrl(area.favicon_url || "");
      setBannerUrl(area.banner_url || "");
      setBackgroundColor(area.background_color || "#0B1220");
      setSurfaceColor(area.surface_color || "#111827");
    }
  }, [area]);

  const mutation = useMutation({
    mutationFn: (vars: any) => updateAreaMembro({ data: vars }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["areas-membros"] });
      queryClient.invalidateQueries({ queryKey: ["area-membro", areaId] });
      toast.success("Área atualizada com sucesso!");
    },
    onError: (err: any) => {
      toast.error(err.message || "Erro ao atualizar área");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteAreaMembro({ data: { id: areaId } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["areas-membros"] });
      toast.success("Área excluída com sucesso");
      navigate({ to: "/admin/areas-membros" });
    },
    onError: (err: any) => {
      toast.error(err.message || "Erro ao excluir área");
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome || !produtoId) {
      if (!produtoId) toast.error("Selecione um produto vinculado");
      return;
    }
    mutation.mutate({ 
      id: areaId,
      nome, 
      rotulo_curto: rotuloCurto,
      tipo,
      status, 
      produto_id: produtoId, 
      principal,
      ativa,
      language,
      primary_color: primaryColor,
      secondary_color: secondaryColor,
      logo_url: logoUrl,
      favicon_url: faviconUrl,
      banner_url: bannerUrl,
      background_color: backgroundColor,
      surface_color: surfaceColor,
    });
  };

  if (isLoadingArea) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-gold" />
      </div>
    );
  }

  if (!area) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold">Área não encontrada</h2>
        <Button onClick={() => navigate({ to: "/admin/areas-membros" })} className="mt-4">
          Voltar para a lista
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate({ to: "/admin/areas-membros" })}
            className="rounded-full hover:bg-gold/10 hover:text-gold"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-black text-foreground tracking-tight">Editar Área</h1>
            <p className="text-muted-foreground">Personalize as configurações de {area.nome}</p>
          </div>
        </div>

        <Button
          variant="ghost"
          onClick={() => setShowDeleteDialog(true)}
          className="text-destructive hover:text-destructive hover:bg-destructive/10 font-bold rounded-xl"
        >
          <Trash2 className="h-5 w-5 mr-2" />
          Excluir área
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-card border-border/30 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-1 h-full bg-gold" />
            <CardContent className="p-0">
              <Tabs defaultValue="geral" className="w-full">
                <TabsList className="w-full justify-start rounded-none border-b bg-transparent h-14 p-0">
                  <TabsTrigger 
                    value="geral" 
                    className="data-[state=active]:bg-gold/10 data-[state=active]:text-gold rounded-none h-full px-8 font-bold border-r border-border/20"
                  >
                    <Layout className="h-4 w-4 mr-2" />
                    Geral
                  </TabsTrigger>
                  <TabsTrigger 
                    value="branding" 
                    className="data-[state=active]:bg-gold/10 data-[state=active]:text-gold rounded-none h-full px-8 font-bold"
                  >
                    <Palette className="h-4 w-4 mr-2" />
                    Branding
                  </TabsTrigger>
                </TabsList>

                <form onSubmit={handleSubmit}>
                  <TabsContent value="geral" className="p-8 space-y-8 mt-0">
                    <div className="space-y-6">
                      <div className="grid gap-2">
                        <Label htmlFor="nome" className="text-sm font-bold">Nome da área</Label>
                        <Input
                          id="nome"
                          value={nome}
                          onChange={(e) => setNome(e.target.value)}
                          required
                          className="h-12 bg-background/50 focus-visible:ring-gold"
                        />
                      </div>

                      <div className="grid gap-2 opacity-60">
                        <Label htmlFor="subdominio" className="text-sm font-bold">Identificador (Subdomínio)</Label>
                        <Input
                          id="subdominio"
                          value={subdominio}
                          disabled
                          className="h-12 bg-background/30"
                        />
                        <p className="text-[10px] text-muted-foreground font-mono">
                          O identificador não pode ser alterado após a criação.
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="produtoId" className="text-sm font-bold">Produto Vinculado</Label>
                          <Select value={produtoId} onValueChange={setProdutoId}>
                            <SelectTrigger className="h-12 bg-background/50">
                              <SelectValue placeholder="Selecione o produto" />
                            </SelectTrigger>
                            <SelectContent>
                              {products?.map((product) => (
                                <SelectItem key={product.id} value={product.id}>
                                  {product.title}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="grid gap-2">
                          <Label htmlFor="status" className="text-sm font-bold">Status</Label>
                          <Select value={status} onValueChange={setStatus}>
                            <SelectTrigger className="h-12 bg-background/50">
                              <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="active">Ativo</SelectItem>
                              <SelectItem value="draft">Rascunho</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="language" className="text-sm font-bold">Idioma Padrão</Label>
                        <Select value={language} onValueChange={setLanguage}>
                          <SelectTrigger className="h-12 bg-background/50">
                            <SelectValue placeholder="Idioma" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                            <SelectItem value="en">English</SelectItem>
                            <SelectItem value="es">Español</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-center justify-between p-4 rounded-xl bg-background/50 border border-border/20">
                        <div className="space-y-0.5">
                          <Label className="text-sm font-bold flex items-center gap-2">
                            <Star className={`h-4 w-4 ${principal ? 'fill-gold text-gold' : 'text-muted-foreground'}`} />
                            Área Principal
                          </Label>
                          <p className="text-[11px] text-muted-foreground">
                            Esta será a área padrão para novos alunos.
                          </p>
                        </div>
                        <Switch
                          checked={principal}
                          onCheckedChange={setPrincipal}
                        />
                      </div>

                      <div className="flex items-center justify-between p-4 rounded-xl bg-background/50 border border-border/20">
                        <div className="space-y-0.5">
                          <Label className="text-sm font-bold">Área Ativa</Label>
                          <p className="text-[11px] text-muted-foreground">
                            Define se a área está acessível para os alunos.
                          </p>
                        </div>
                        <Switch
                          checked={ativa}
                          onCheckedChange={setAtiva}
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="branding" className="p-8 space-y-8 mt-0">
                    <div className="space-y-8">
                      {/* Logo and Favicon */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                          <ImageUploadField
                            label="Logo da Área"
                            hint="Recomendado: PNG ou SVG com fundo transparente."
                            value={logoUrl}
                            onChange={setLogoUrl}
                            uploadLabel="Fazer upload da Logo"
                          />
                        </div>

                        <div className="space-y-3">
                          <ImageUploadField
                            label="Favicon"
                            hint="Ícone da aba (32x32px ou 64x64px)."
                            value={faviconUrl}
                            onChange={setFaviconUrl}
                            uploadLabel="Fazer upload do Favicon"
                          />
                        </div>
                      </div>

                      {/* Banner */}
                      <div className="space-y-3">
                        <ImageUploadField
                          label="Banner do Catálogo"
                          hint="Este banner aparecerá no topo da vitrine de cursos desta área."
                          value={bannerUrl}
                          onChange={setBannerUrl}
                          uploadLabel="Fazer upload do Banner"
                        />
                      </div>

                      {/* Colors */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-border/10">
                        <div className="space-y-3">
                          <Label className="text-sm font-bold flex items-center gap-2">
                            <div className="h-4 w-4 rounded-full border border-white/20" style={{ backgroundColor: primaryColor }} />
                            Cor Primária
                          </Label>
                          <div className="flex gap-2">
                            <Input
                              type="color"
                              value={primaryColor}
                              onChange={(e) => setPrimaryColor(e.target.value)}
                              className="w-14 h-12 p-1 bg-background border-border/20 cursor-pointer"
                            />
                            <Input
                              type="text"
                              value={primaryColor}
                              onChange={(e) => setPrimaryColor(e.target.value)}
                              className="flex-1 h-12 bg-background/50 font-mono"
                              placeholder="#000000"
                            />
                          </div>
                        </div>

                        <div className="space-y-3">
                          <Label className="text-sm font-bold flex items-center gap-2">
                            <div className="h-4 w-4 rounded-full border border-white/20" style={{ backgroundColor: secondaryColor }} />
                            Cor Secundária
                          </Label>
                          <div className="flex gap-2">
                            <Input
                              type="color"
                              value={secondaryColor}
                              onChange={(e) => setSecondaryColor(e.target.value)}
                              className="w-14 h-12 p-1 bg-background border-border/20 cursor-pointer"
                            />
                            <Input
                              type="text"
                              value={secondaryColor}
                              onChange={(e) => setSecondaryColor(e.target.value)}
                              className="flex-1 h-12 bg-background/50 font-mono"
                              placeholder="#000000"
                            />
                          </div>
                        </div>

                        <div className="space-y-3">
                          <Label className="text-sm font-bold flex items-center gap-2">
                            <div className="h-4 w-4 rounded-full border border-white/20" style={{ backgroundColor: backgroundColor }} />
                            Cor de Fundo
                          </Label>
                          <div className="flex gap-2">
                            <Input
                              type="color"
                              value={backgroundColor}
                              onChange={(e) => setBackgroundColor(e.target.value)}
                              className="w-14 h-12 p-1 bg-background border-border/20 cursor-pointer"
                            />
                            <Input
                              type="text"
                              value={backgroundColor}
                              onChange={(e) => setBackgroundColor(e.target.value)}
                              className="flex-1 h-12 bg-background/50 font-mono"
                              placeholder="#000000"
                            />
                          </div>
                        </div>

                        <div className="space-y-3">
                          <Label className="text-sm font-bold flex items-center gap-2">
                            <div className="h-4 w-4 rounded-full border border-white/20" style={{ backgroundColor: surfaceColor }} />
                            Cor de Superfície (Cards)
                          </Label>
                          <div className="flex gap-2">
                            <Input
                              type="color"
                              value={surfaceColor}
                              onChange={(e) => setSurfaceColor(e.target.value)}
                              className="w-14 h-12 p-1 bg-background border-border/20 cursor-pointer"
                            />
                            <Input
                              type="text"
                              value={surfaceColor}
                              onChange={(e) => setSurfaceColor(e.target.value)}
                              className="flex-1 h-12 bg-background/50 font-mono"
                              placeholder="#000000"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <div className="p-8 pt-0 flex gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate({ to: "/admin/areas-membros" })}
                      className="flex-1 h-14 rounded-xl font-bold"
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      disabled={mutation.isPending || !nome || !produtoId}
                      className="flex-1 h-14 bg-gold text-black font-black text-lg rounded-xl hover:shadow-xl hover:shadow-gold/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                      {mutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Salvando...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-5 w-5" />
                          Salvar alterações
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-card/40 border-border/20 backdrop-blur-sm sticky top-24">
            <CardContent className="p-6 space-y-6">
              <h3 className="font-bold flex items-center gap-2">
                <Globe className="h-4 w-4 text-gold" /> Preview do Acesso
              </h3>
              
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-background/80 border border-gold/20 group">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mb-2">Link público</p>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-bold truncate font-mono text-gold">{subdominio}.suaplataforma.com.br</span>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" asChild>
                      <a href={`https://${subdominio}.suaplataforma.com.br`} target="_blank" rel="noreferrer">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button variant="outline" className="w-full h-12 rounded-xl border-border/40 font-bold justify-start gap-3">
                    <Layout className="h-4 w-4 text-muted-foreground" />
                    Customizar Design
                  </Button>
                  <Button variant="outline" className="w-full h-12 rounded-xl border-border/40 font-bold justify-start gap-3">
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                    Gerenciar Conteúdos
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-card border-border/30 rounded-[2rem] p-8 max-w-md">
          <AlertDialogHeader>
            <div className="h-16 w-16 bg-destructive/10 text-destructive rounded-2xl flex items-center justify-center mb-6 mx-auto">
              <Trash2 className="h-8 w-8" />
            </div>
            <AlertDialogTitle className="text-2xl font-black text-center">Excluir Área?</AlertDialogTitle>
            <AlertDialogDescription className="text-center text-lg text-muted-foreground">
              Esta ação removerá permanentemente a área <strong>{nome}</strong> e todos os seus vínculos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-3 mt-8">
            <AlertDialogCancel className="h-14 flex-1 rounded-xl border-border/40 font-bold">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => deleteMutation.mutate()}
              className="h-14 flex-1 rounded-xl bg-destructive hover:bg-destructive/90 text-white font-bold"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
