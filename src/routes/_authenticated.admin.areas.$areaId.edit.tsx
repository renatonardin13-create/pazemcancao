import { createFileRoute, useNavigate, useParams, Link } from "@tanstack/react-router";
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
  Chrome,
  Shield,
  User,
  Settings,
  LayoutGrid,
  Smartphone,
  Languages,
  Lock,
  Package,
  ChevronRight,
  Mail
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { ImageUploadField } from "@/components/ImageUploadField";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { updateAreaMembro, getAreaMembro, deleteAreaMembro } from "@/lib/areas-membros.functions";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
  const [appName, setAppName] = useState("");
  const [logoAlt, setLogoAlt] = useState("");
  const [supportEmail, setSupportEmail] = useState("");
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
  const [themeMode, setThemeMode] = useState("dark");
  const [accentColor, setAccentColor] = useState("#D4AF37");
  const [buttonColor, setButtonColor] = useState("#D4AF37");
  const [buttonTextColor, setButtonTextColor] = useState("#000000");
  const [sidebarColor, setSidebarColor] = useState("#111827");
  const [textPrimary, setTextPrimary] = useState("#FFFFFF");
  const [textSecondary, setTextSecondary] = useState("#94A3B8");
  const [elevatedSurface, setElevatedSurface] = useState("#1E293B");
  const [idiomasAtivos, setIdiomasAtivos] = useState<string[]>(["pt-BR"]);
  const [formatoData, setFormatoData] = useState("DD/MM/AAAA");
  const [boasVindas, setBoasVindas] = useState("");
  const [botaoContinuar, setBotaoContinuar] = useState("");
  const [produtoBloqueado, setProdutoBloqueado] = useState("");
  const [conclusao, setConclusao] = useState("");
  const [parabens, setParabens] = useState("");
  const [botaoEntrar, setBotaoEntrar] = useState("");
  const [suporteTexto, setSuporteTexto] = useState("");
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
      setAppName(area.app_name || "");
      setLogoAlt(area.logo_alt || "");
      setSupportEmail(area.support_email || "");
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
      setThemeMode(area.theme_mode || "dark");
      setAccentColor(area.accent_color || "#D4AF37");
      setButtonColor(area.button_color || "#D4AF37");
      setButtonTextColor(area.button_text_color || "#000000");
      setSidebarColor(area.sidebar_color || "#111827");
      setTextPrimary(area.text_primary || "#FFFFFF");
      setTextSecondary(area.text_secondary || "#94A3B8");
      setElevatedSurface(area.elevated_surface || "#1E293B");
      setIdiomasAtivos(area.idiomas_ativos || ["pt-BR"]);
      setFormatoData(area.formato_data || "DD/MM/AAAA");
      setBoasVindas(area.boas_vindas || "");
      setBotaoContinuar(area.botao_continuar || "");
      setProdutoBloqueado(area.produto_bloqueado || "");
      setConclusao(area.conclusao || "");
      setParabens(area.parabens || "");
      setBotaoEntrar(area.botao_entrar || "");
      setSuporteTexto(area.suporte_texto || "");
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
      descricao,
      app_name: appName,
      logo_alt: logoAlt,
      support_email: supportEmail,
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
      theme_mode: themeMode,
      accent_color: accentColor,
      button_color: buttonColor,
      button_text_color: buttonTextColor,
      sidebar_color: sidebarColor,
      text_primary: textPrimary,
      text_secondary: textSecondary,
      elevated_surface: elevatedSurface,
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
    <div className="min-h-screen bg-[#0B1220] text-white -m-3 sm:-m-6 md:-m-8 p-6 md:p-10 space-y-10 font-sans">
      {/* Top Header */}
      <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Button
              variant="ghost"
              onClick={() => navigate({ to: "/admin/areas-membros" })}
              className="group h-12 px-4 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white transition-all font-bold"
            >
              <ArrowLeft className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" />
              Voltar
            </Button>
            <div className="h-10 w-px bg-white/10" />
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-[#D4AF37]/10 flex items-center justify-center border border-[#D4AF37]/20 shadow-[0_0_20px_rgba(212,175,55,0.1)]">
                <Settings className="h-6 w-6 text-[#D4AF37]" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-black tracking-tight text-white">{nome || "Nova Área"}</h1>
                  {ativa ? (
                    <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[10px] font-black uppercase tracking-widest rounded-full px-3 py-1">
                      Ativa
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-slate-500/5 text-slate-500 border-slate-500/20 text-[10px] font-black uppercase tracking-widest rounded-full px-3 py-1">
                      Inativa
                    </Badge>
                  )}
                </div>
                <p className="text-slate-500 text-sm font-medium">Configurações gerais da sua área de membros</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              className="h-12 rounded-xl bg-[#151921] border-white/5 hover:bg-white/10 text-white font-bold transition-all flex items-center gap-2"
            >
              <Shield className="h-4 w-4 text-[#D4AF37]/60" />
              Ver como admin
            </Button>
            <Button 
              variant="outline" 
              className="h-12 rounded-xl bg-transparent border-[#D4AF37]/30 hover:bg-[#D4AF37]/5 text-[#D4AF37] font-bold transition-all flex items-center gap-2"
            >
              <User className="h-4 w-4" />
              Ver como aluno
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 gap-8">
        <Tabs defaultValue="geral" className="space-y-8">
          <TabsList className="bg-[#111827] border border-white/5 p-1 rounded-2xl h-16 w-fit inline-flex shadow-2xl">
            <TabsTrigger 
              value="geral" 
              className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-black rounded-xl h-full px-8 font-black text-sm transition-all flex items-center gap-2"
            >
              <LayoutGrid className="h-4 w-4" />
              Geral
            </TabsTrigger>
            <TabsTrigger 
              value="branding" 
              className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-black rounded-xl h-full px-8 font-black text-sm transition-all flex items-center gap-2"
            >
              <ImageIcon className="h-4 w-4" />
              Branding
            </TabsTrigger>
            <TabsTrigger 
              value="cores" 
              className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-black rounded-xl h-full px-8 font-black text-sm transition-all flex items-center gap-2"
            >
              <Palette className="h-4 w-4" />
              Cores
            </TabsTrigger>
            <TabsTrigger 
              value="idioma" 
              className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-black rounded-xl h-full px-8 font-black text-sm transition-all flex items-center gap-2"
            >
              <Languages className="h-4 w-4" />
              Idioma
            </TabsTrigger>
            <TabsTrigger 
              value="login" 
              className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-black rounded-xl h-full px-8 font-black text-sm transition-all flex items-center gap-2"
            >
              <Lock className="h-4 w-4" />
              Login
            </TabsTrigger>
            <TabsTrigger 
              value="produtos" 
              className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-black rounded-xl h-full px-8 font-black text-sm transition-all flex items-center gap-2"
            >
              <Package className="h-4 w-4" />
              Produtos
            </TabsTrigger>
          </TabsList>

          <form onSubmit={handleSubmit} className="space-y-8">
            <TabsContent value="geral" className="mt-0 outline-none">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Form Fields */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Basic Info Section */}
                  <div className="bg-[#111827] border border-white/5 rounded-[24px] p-8 space-y-8 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-[#D4AF37]/20" />
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center border border-[#D4AF37]/10">
                        <Settings className="h-5 w-5 text-[#D4AF37]" />
                      </div>
                      <h3 className="text-xl font-black text-white">Informações básicas</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="nome" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Nome da área</Label>
                        <Input
                          id="nome"
                          value={nome}
                          onChange={(e) => setNome(e.target.value)}
                          required
                          placeholder="Ex: Reino das Cores Kids"
                          className="h-14 bg-[#0B1220] border-white/5 focus-visible:ring-[#D4AF37] rounded-xl font-bold text-base transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="rotuloCurto" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Rótulo curto</Label>
                        <Input
                          id="rotuloCurto"
                          value={rotuloCurto}
                          onChange={(e) => setRotuloCurto(e.target.value)}
                          placeholder="Ex: Kids"
                          className="h-14 bg-[#0B1220] border-white/5 focus-visible:ring-[#D4AF37] rounded-xl font-bold text-base transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="descricao" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Descrição</Label>
                      <Textarea
                        id="descricao"
                        value={descricao}
                        onChange={(e) => setDescricao(e.target.value)}
                        placeholder="Uma breve descrição sobre esta área de membros..."
                        className="min-h-[120px] bg-[#0B1220] border-white/5 focus-visible:ring-[#D4AF37] rounded-xl font-medium text-base transition-all resize-none"
                      />
                    </div>
                  </div>

                  {/* Config Section */}
                  <div className="bg-[#111827] border border-white/5 rounded-[24px] p-8 space-y-8 shadow-2xl">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center border border-[#D4AF37]/10">
                        <Layout className="h-5 w-5 text-[#D4AF37]" />
                      </div>
                      <h3 className="text-xl font-black text-white">Configurações</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="tipo" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Tipo da área</Label>
                        <Select value={tipo} onValueChange={setTipo}>
                          <SelectTrigger className="h-14 bg-[#0B1220] border-white/5 focus:ring-[#D4AF37] rounded-xl font-bold text-base">
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                          <SelectContent className="bg-[#111827] border-white/5 text-white">
                            <SelectItem value="desenhos">Desenhos</SelectItem>
                            <SelectItem value="cursos">Cursos</SelectItem>
                            <SelectItem value="misto">Misto</SelectItem>
                            <SelectItem value="louvores">Louvores</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="status" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Status</Label>
                        <Select value={status} onValueChange={setStatus}>
                          <SelectTrigger className="h-14 bg-[#0B1220] border-white/5 focus:ring-[#D4AF37] rounded-xl font-bold text-base">
                            <SelectValue placeholder="Status" />
                          </SelectTrigger>
                          <SelectContent className="bg-[#111827] border-white/5 text-white">
                            <SelectItem value="active">Ativa</SelectItem>
                            <SelectItem value="draft">Inativa</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="p-6 rounded-2xl bg-[#0B1220] border border-white/5 flex items-center justify-between group hover:border-[#D4AF37]/20 transition-all">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Star className={`h-4 w-4 ${principal ? 'fill-[#D4AF37] text-[#D4AF37]' : 'text-slate-500'}`} />
                          <Label className="text-base font-black text-white">Área Principal</Label>
                        </div>
                        <p className="text-sm text-slate-500 font-medium">
                          A área principal é usada como padrão para novos alunos.
                        </p>
                      </div>
                      <Switch
                        checked={principal}
                        onCheckedChange={setPrincipal}
                        className="data-[state=checked]:bg-[#D4AF37]"
                      />
                    </div>
                  </div>
                </div>

                {/* Right Column: Address & URL */}
                <div className="space-y-6">
                  <div className="bg-[#111827] border border-white/5 rounded-[24px] p-8 space-y-8 shadow-2xl sticky top-10">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center border border-[#D4AF37]/10">
                        <Globe className="h-5 w-5 text-[#D4AF37]" />
                      </div>
                      <h3 className="text-xl font-black text-white">Endereço da área</h3>
                    </div>

                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="subdominio" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Subdomínio</Label>
                        <div className="relative group">
                          <Input
                            id="subdominio"
                            value={subdominio}
                            disabled
                            className="h-14 bg-[#0B1220] border-white/5 opacity-50 rounded-xl font-mono text-base pr-10"
                          />
                          <Lock className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600" />
                        </div>
                        <p className="text-[10px] text-slate-600 font-bold uppercase tracking-wider pl-1">
                          Somente leitura após a criação
                        </p>
                      </div>

                      <div className="p-5 rounded-2xl bg-[#0B1220] border border-white/5 space-y-3">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#D4AF37]/60">Preview da URL</span>
                        <div className="flex items-center justify-between gap-3 p-3 bg-black/20 rounded-xl border border-white/5 group/url">
                          <span className="text-xs font-bold text-slate-400 truncate font-mono">
                            https://{subdominio || "sua-area"}.seudominio.com
                          </span>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-[#D4AF37] hover:text-black transition-all">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="pt-4 space-y-4">
                        <Button
                          type="submit"
                          disabled={mutation.isPending || !nome || !produtoId}
                          className="w-full h-14 bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-black font-black text-lg rounded-2xl shadow-[0_15px_30px_rgba(212,175,55,0.2)] hover:scale-[1.03] active:scale-[0.97] transition-all group"
                        >
                          {mutation.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                              Salvando...
                            </>
                          ) : (
                            <>
                              <Save className="mr-2 h-6 w-6 group-hover:scale-110 transition-transform" />
                              Salvar alterações
                            </>
                          )}
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => setShowDeleteDialog(true)}
                          className="w-full h-12 rounded-xl text-destructive hover:bg-destructive/10 font-bold"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Excluir área permanentemente
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="branding" className="mt-0 outline-none">
              <div className="grid grid-cols-1 lg:grid-cols-10 gap-8">
                {/* Form Column (70%) */}
                <div className="lg:col-span-7 space-y-6">
                  <div className="bg-[#111827] border border-white/5 rounded-[24px] p-8 space-y-8 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-[#D4AF37]/20" />
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center border border-[#D4AF37]/10">
                        <ImageIcon className="h-5 w-5 text-[#D4AF37]" />
                      </div>
                      <h3 className="text-xl font-black text-white">Configurações de Branding</h3>
                    </div>

                    <div className="space-y-10">
                      {/* Logo Section */}
                      <div className="space-y-6">
                        <div className="flex flex-col gap-3">
                          <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">1. Logo principal</Label>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                            <ImageUploadField
                              label=""
                              hint="PNG transparente quadrado. Mín. 256x256 (ideal 512x512)"
                              value={logoUrl}
                              onChange={setLogoUrl}
                              uploadLabel="Enviar imagem"
                            />
                            <div className="space-y-2">
                              <Label htmlFor="logoUrl" className="text-[10px] font-bold text-slate-500">Ou colar URL da logo</Label>
                              <Input
                                id="logoUrl"
                                value={logoUrl}
                                onChange={(e) => setLogoUrl(e.target.value)}
                                placeholder="https://exemplo.com/logo.png"
                                className="h-12 bg-[#0B1220] border-white/5 focus-visible:ring-[#D4AF37] rounded-xl font-medium text-sm transition-all"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-white/5">
                        <div className="space-y-3">
                          <Label htmlFor="appName" className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">2. Nome do app</Label>
                          <Input
                            id="appName"
                            value={appName}
                            onChange={(e) => setAppName(e.target.value)}
                            placeholder="Ex: Reino das Cores"
                            className="h-14 bg-[#0B1220] border-white/5 focus-visible:ring-[#D4AF37] rounded-xl font-bold text-base transition-all hover:bg-white/[0.02]"
                          />
                        </div>
                        <div className="space-y-3">
                          <Label htmlFor="logoAlt" className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">3. Texto alternativo da logo</Label>
                          <Input
                            id="logoAlt"
                            value={logoAlt}
                            onChange={(e) => setLogoAlt(e.target.value)}
                            placeholder="Ex: Logotipo Reino das Cores"
                            className="h-14 bg-[#0B1220] border-white/5 focus-visible:ring-[#D4AF37] rounded-xl font-bold text-base transition-all hover:bg-white/[0.02]"
                          />
                        </div>
                      </div>

                      <div className="space-y-3 pt-8 border-t border-white/5">
                        <Label htmlFor="supportEmail" className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">4. E-mail de suporte</Label>
                        <div className="relative group">
                          <Input
                            id="supportEmail"
                            type="email"
                            value={supportEmail}
                            onChange={(e) => setSupportEmail(e.target.value)}
                            placeholder="suporte@exemplo.com"
                            className="h-14 bg-[#0B1220] border-white/5 focus-visible:ring-[#D4AF37] rounded-xl font-bold text-base pl-12 transition-all group-hover:bg-white/[0.02]"
                          />
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-hover:text-[#D4AF37] transition-colors" />
                        </div>
                      </div>

                      <div className="space-y-6 pt-8 border-t border-white/5">
                        <div className="flex flex-col gap-3">
                          <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">5. Favicon</Label>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                            <ImageUploadField
                              label=""
                              hint="Ícone exibido na aba do navegador"
                              value={faviconUrl}
                              onChange={setFaviconUrl}
                              uploadLabel="Enviar Favicon"
                            />
                            <div className="space-y-2">
                              <Label htmlFor="faviconUrl" className="text-[10px] font-bold text-slate-500">Ou colar URL do favicon</Label>
                              <Input
                                id="faviconUrl"
                                value={faviconUrl}
                                onChange={(e) => setFaviconUrl(e.target.value)}
                                placeholder="https://exemplo.com/favicon.ico"
                                className="h-12 bg-[#0B1220] border-white/5 focus-visible:ring-[#D4AF37] rounded-xl font-medium text-sm transition-all"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Preview Column (30%) */}
                <div className="lg:col-span-3 space-y-6">
                  <div className="bg-[#111827] border border-white/5 rounded-[24px] p-8 space-y-8 shadow-2xl sticky top-10 overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-[#D4AF37]/20" />
                    <div className="space-y-1">
                      <h3 className="text-xl font-black text-white">Pré-visualização</h3>
                      <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Como vai aparecer</p>
                    </div>

                    <div className="space-y-10">
                      <div className="space-y-4">
                        <motion.div 
                          layout
                          className="p-12 rounded-[24px] bg-[#0B1220] border border-white/5 flex flex-col items-center justify-center gap-6 shadow-inner relative overflow-hidden group"
                        >
                          <div className="absolute inset-0 bg-gradient-to-b from-[#D4AF37]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                          <div className="relative z-10">
                            {logoUrl ? (
                              <img src={logoUrl} alt="Preview Logo" className="h-28 w-28 object-contain rounded-2xl shadow-2xl" />
                            ) : (
                              <div className="h-28 w-28 rounded-2xl bg-white/5 flex items-center justify-center text-slate-700 border border-dashed border-white/10">
                                <ImageIcon className="h-12 w-12" />
                              </div>
                            )}
                          </div>
                          <h4 className="text-2xl font-black text-white relative z-10 text-center">{appName || "Nome do App"}</h4>
                        </motion.div>
                      </div>

                      <div className="space-y-4">
                        <div className="p-4 rounded-xl bg-[#0B1220]/50 border border-white/5 flex items-center gap-3 shadow-lg">
                          {logoUrl ? (
                            <img src={logoUrl} alt="Header Logo" className="h-8 w-8 object-contain rounded-full border border-[#D4AF37]/20 bg-black/20 p-1" />
                          ) : (
                            <div className="h-8 w-8 rounded-full bg-white/10" />
                          )}
                          <span className="text-sm font-black text-white/90 tracking-tight">{appName || "App Name"}</span>
                          <div className="flex-1" />
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-8 rounded-full bg-white/5" />
                            <div className="h-8 w-8 rounded-full bg-white/10" />
                          </div>
                        </div>
                      </div>

                      <div className="pt-6 border-t border-white/5">
                        <Button
                          onClick={handleSubmit}
                          disabled={mutation.isPending || !nome || !produtoId}
                          className="w-full h-14 bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-black font-black text-lg rounded-2xl shadow-[0_15px_30px_rgba(212,175,55,0.2)] hover:scale-[1.03] active:scale-[0.97] transition-all"
                        >
                          {mutation.isPending ? (
                            <Loader2 className="h-6 w-6 animate-spin" />
                          ) : (
                            "Salvar Branding"
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="cores" className="mt-0 outline-none">
              <div className="grid grid-cols-1 lg:grid-cols-10 gap-8">
                {/* Left Column (60%) */}
                <div className="lg:col-span-6 space-y-6">
                  <div className="bg-[#111827] border border-white/5 rounded-[24px] p-8 space-y-8 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-[#D4AF37]/20" />
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center border border-[#D4AF37]/10">
                        <Palette className="h-5 w-5 text-[#D4AF37]" />
                      </div>
                      <h3 className="text-xl font-black text-white">Configurações de Cores</h3>
                    </div>

                    <div className="space-y-8">
                      {/* Theme Selection */}
                      <div className="space-y-3">
                        <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">1. Tema padrão</Label>
                        <Select value={themeMode} onValueChange={setThemeMode}>
                          <SelectTrigger className="h-14 bg-[#0B1220] border-white/5 focus:ring-[#D4AF37] rounded-xl font-bold text-base">
                            <SelectValue placeholder="Selecione o tema" />
                          </SelectTrigger>
                          <SelectContent className="bg-[#111827] border-white/5 text-white">
                            <SelectItem value="auto">Automático (sistema)</SelectItem>
                            <SelectItem value="light">Claro</SelectItem>
                            <SelectItem value="dark">Escuro</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Primary Color */}
                        <div className="space-y-3">
                          <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">2. Cor primária</Label>
                          <div className="flex gap-2">
                            <div className="relative group/picker">
                              <Input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="w-14 h-14 p-1 bg-[#0B1220] border-white/10 cursor-pointer rounded-xl" />
                            </div>
                            <Input value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="flex-1 h-14 bg-[#0B1220] border-white/5 font-mono text-center font-bold" />
                          </div>
                        </div>

                        {/* Accent Color */}
                        <div className="space-y-3">
                          <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">3. Cor de destaque</Label>
                          <div className="flex gap-2">
                            <Input type="color" value={accentColor} onChange={(e) => setAccentColor(e.target.value)} className="w-14 h-14 p-1 bg-[#0B1220] border-white/10 cursor-pointer rounded-xl" />
                            <Input value={accentColor} onChange={(e) => setAccentColor(e.target.value)} className="flex-1 h-14 bg-[#0B1220] border-white/5 font-mono text-center font-bold" />
                          </div>
                        </div>

                        {/* Button Color */}
                        <div className="space-y-3">
                          <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">4. Cor dos botões</Label>
                          <div className="flex gap-2">
                            <Input type="color" value={buttonColor} onChange={(e) => setButtonColor(e.target.value)} className="w-14 h-14 p-1 bg-[#0B1220] border-white/10 cursor-pointer rounded-xl" />
                            <Input value={buttonColor} onChange={(e) => setButtonColor(e.target.value)} className="flex-1 h-14 bg-[#0B1220] border-white/5 font-mono text-center font-bold" />
                          </div>
                        </div>

                        {/* Button Text Color */}
                        <div className="space-y-3">
                          <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">5. Texto do botão</Label>
                          <div className="flex gap-2">
                            <Input type="color" value={buttonTextColor} onChange={(e) => setButtonTextColor(e.target.value)} className="w-14 h-14 p-1 bg-[#0B1220] border-white/10 cursor-pointer rounded-xl" />
                            <Input value={buttonTextColor} onChange={(e) => setButtonTextColor(e.target.value)} className="flex-1 h-14 bg-[#0B1220] border-white/5 font-mono text-center font-bold" />
                          </div>
                        </div>

                        {/* Background Color */}
                        <div className="space-y-3">
                          <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">6. Fundo geral</Label>
                          <div className="flex gap-2">
                            <Input type="color" value={backgroundColor} onChange={(e) => setBackgroundColor(e.target.value)} className="w-14 h-14 p-1 bg-[#0B1220] border-white/10 cursor-pointer rounded-xl" />
                            <Input value={backgroundColor} onChange={(e) => setBackgroundColor(e.target.value)} className="flex-1 h-14 bg-[#0B1220] border-white/5 font-mono text-center font-bold" />
                          </div>
                        </div>

                        {/* Surface Color */}
                        <div className="space-y-3">
                          <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">7. Cards / superfícies</Label>
                          <div className="flex gap-2">
                            <Input type="color" value={surfaceColor} onChange={(e) => setSurfaceColor(e.target.value)} className="w-14 h-14 p-1 bg-[#0B1220] border-white/10 cursor-pointer rounded-xl" />
                            <Input value={surfaceColor} onChange={(e) => setSurfaceColor(e.target.value)} className="flex-1 h-14 bg-[#0B1220] border-white/5 font-mono text-center font-bold" />
                          </div>
                        </div>

                        {/* Sidebar Color */}
                        <div className="space-y-3">
                          <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">8. Sidebar</Label>
                          <div className="flex gap-2">
                            <Input type="color" value={sidebarColor} onChange={(e) => setSidebarColor(e.target.value)} className="w-14 h-14 p-1 bg-[#0B1220] border-white/10 cursor-pointer rounded-xl" />
                            <Input value={sidebarColor} onChange={(e) => setSidebarColor(e.target.value)} className="flex-1 h-14 bg-[#0B1220] border-white/5 font-mono text-center font-bold" />
                          </div>
                        </div>

                        {/* Text Primary */}
                        <div className="space-y-3">
                          <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">9. Texto principal</Label>
                          <div className="flex gap-2">
                            <Input type="color" value={textPrimary} onChange={(e) => setTextPrimary(e.target.value)} className="w-14 h-14 p-1 bg-[#0B1220] border-white/10 cursor-pointer rounded-xl" />
                            <Input value={textPrimary} onChange={(e) => setTextPrimary(e.target.value)} className="flex-1 h-14 bg-[#0B1220] border-white/5 font-mono text-center font-bold" />
                          </div>
                        </div>

                        {/* Text Secondary */}
                        <div className="space-y-3">
                          <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">10. Texto secundário</Label>
                          <div className="flex gap-2">
                            <Input type="color" value={textSecondary} onChange={(e) => setTextSecondary(e.target.value)} className="w-14 h-14 p-1 bg-[#0B1220] border-white/10 cursor-pointer rounded-xl" />
                            <Input value={textSecondary} onChange={(e) => setTextSecondary(e.target.value)} className="flex-1 h-14 bg-[#0B1220] border-white/5 font-mono text-center font-bold" />
                          </div>
                        </div>

                        {/* Elevated Surface */}
                        <div className="space-y-3">
                          <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">11. Superfície elevada</Label>
                          <div className="flex gap-2">
                            <Input type="color" value={elevatedSurface} onChange={(e) => setElevatedSurface(e.target.value)} className="w-14 h-14 p-1 bg-[#0B1220] border-white/10 cursor-pointer rounded-xl" />
                            <Input value={elevatedSurface} onChange={(e) => setElevatedSurface(e.target.value)} className="flex-1 h-14 bg-[#0B1220] border-white/5 font-mono text-center font-bold" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column (40%) - Preview */}
                <div className="lg:col-span-4 space-y-6">
                  <div className="bg-[#111827] border border-white/5 rounded-[24px] p-8 space-y-8 shadow-2xl sticky top-10 overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-[#D4AF37]/20" />
                    <div className="space-y-1">
                      <h3 className="text-xl font-black text-white">Pré-visualização</h3>
                      <p className="text-slate-500 text-xs font-bold uppercase tracking-widest italic">Simulação da interface real</p>
                    </div>

                    {/* App Interface Simulation */}
                    <div 
                      className="rounded-2xl border border-white/10 overflow-hidden h-[500px] flex shadow-inner"
                      style={{ backgroundColor: backgroundColor }}
                    >
                      {/* Sidebar Simulation */}
                      <div 
                        className="w-24 md:w-32 border-r border-white/5 p-4 flex flex-col gap-6"
                        style={{ backgroundColor: sidebarColor }}
                      >
                        <div className="h-8 w-8 rounded-lg" style={{ backgroundColor: primaryColor }} />
                        <div className="space-y-3">
                          <div className="h-2 w-full rounded-full" style={{ backgroundColor: textSecondary, opacity: 0.2 }} />
                          <div className="h-2 w-[80%] rounded-full" style={{ backgroundColor: textSecondary, opacity: 0.2 }} />
                          <div className="h-2 w-[60%] rounded-full" style={{ backgroundColor: accentColor, opacity: 0.4 }} />
                        </div>
                      </div>

                      {/* Main Simulation */}
                      <div className="flex-1 p-6 space-y-6 overflow-hidden">
                        <div className="flex items-center justify-between">
                          <h4 className="text-lg font-black" style={{ color: textPrimary }}>Início</h4>
                          <div className="flex gap-2">
                            <div className="h-6 w-16 rounded-md" style={{ backgroundColor: accentColor, opacity: 0.2 }} />
                            <div className="h-6 w-6 rounded-full" style={{ backgroundColor: textSecondary, opacity: 0.1 }} />
                          </div>
                        </div>

                        {/* Cards Grid */}
                        <div className="grid grid-cols-2 gap-4">
                          {[1, 2, 3, 4].map(i => (
                            <div 
                              key={i} 
                              className="p-4 rounded-xl border border-white/5 space-y-3 transition-all duration-500 group/prevcard hover:scale-[1.02]"
                              style={{ 
                                backgroundColor: surfaceColor,
                                borderColor: i === 1 ? elevatedSurface : 'transparent' 
                              }}
                            >
                              <div className="h-10 w-full rounded-lg bg-white/5 overflow-hidden relative">
                                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
                              </div>
                              <p className="text-[9px] font-black uppercase tracking-widest" style={{ color: textSecondary }}>Módulo {i}</p>
                            </div>
                          ))}
                        </div>

                        {/* Button & Badge Preview */}
                        <div className="flex flex-col gap-3 pt-4">
                          <div className="flex items-center gap-3">
                            <div 
                              className="px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all shadow-lg"
                              style={{ backgroundColor: buttonColor, color: buttonTextColor }}
                            >
                              Botão Primário
                            </div>
                            <div 
                              className="px-2 py-1 rounded-md text-[8px] font-black uppercase border"
                              style={{ color: accentColor, borderColor: `${accentColor}33`, backgroundColor: `${accentColor}11` }}
                            >
                              Badge
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4">
                      <Button
                        onClick={handleSubmit}
                        disabled={mutation.isPending || !nome || !produtoId}
                        className="w-full h-14 bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-black font-black text-lg rounded-2xl shadow-[0_15px_30px_rgba(212,175,55,0.2)] hover:scale-[1.03] active:scale-[0.97] transition-all"
                      >
                        {mutation.isPending ? (
                          <Loader2 className="h-6 w-6 animate-spin" />
                        ) : (
                          <div className="flex items-center gap-2">
                            <Save className="h-5 w-5" />
                            Salvar Cores
                          </div>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="idioma" className="mt-0 outline-none">
              <div className="bg-[#111827] border border-white/5 rounded-[24px] p-8 space-y-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-[#D4AF37]/20" />
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center border border-[#D4AF37]/10">
                    <Languages className="h-5 w-5 text-[#D4AF37]" />
                  </div>
                  <h3 className="text-xl font-black text-white">Localização</h3>
                </div>

                <div className="max-w-md space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="language" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Idioma da interface</Label>
                    <Select value={language} onValueChange={setLanguage}>
                      <SelectTrigger className="h-14 bg-[#0B1220] border-white/5 focus:ring-[#D4AF37] rounded-xl font-bold text-base">
                        <SelectValue placeholder="Selecione o idioma" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#111827] border-white/5 text-white">
                        <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                        <SelectItem value="en">English (US)</SelectItem>
                        <SelectItem value="es">Español</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <p className="text-sm text-slate-500">Isso alterará os textos automáticos do sistema para os alunos desta área.</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="login" className="mt-0 outline-none">
              <div className="bg-[#111827] border border-white/5 rounded-[24px] p-8 space-y-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-[#D4AF37]/20" />
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center border border-[#D4AF37]/10">
                    <Lock className="h-5 w-5 text-[#D4AF37]" />
                  </div>
                  <h3 className="text-xl font-black text-white">Segurança e Acesso</h3>
                </div>

                <div className="space-y-6">
                  <div className="p-6 rounded-2xl bg-[#0B1220] border border-white/5 flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-base font-black text-white">Exigir Login para visualizar catálogo</Label>
                      <p className="text-sm text-slate-500 font-medium">Se desativado, a vitrine será pública.</p>
                    </div>
                    <Switch defaultChecked className="data-[state=checked]:bg-[#D4AF37]" />
                  </div>
                  <div className="p-6 rounded-2xl bg-[#0B1220] border border-white/5 flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-base font-black text-white">Permitir Auto-cadastro</Label>
                      <p className="text-sm text-slate-500 font-medium">Novos usuários podem criar conta sozinhos.</p>
                    </div>
                    <Switch className="data-[state=checked]:bg-[#D4AF37]" />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="produtos" className="mt-0 outline-none">
              <div className="bg-[#111827] border border-white/5 rounded-[24px] p-8 space-y-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-[#D4AF37]/20" />
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center border border-[#D4AF37]/10">
                    <Package className="h-5 w-5 text-[#D4AF37]" />
                  </div>
                  <h3 className="text-xl font-black text-white">Produto vinculado</h3>
                </div>

                <div className="max-w-xl space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="produtoId" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Vincular produto do catálogo</Label>
                    <Select value={produtoId} onValueChange={setProdutoId}>
                      <SelectTrigger className="h-14 bg-[#0B1220] border-white/5 focus:ring-[#D4AF37] rounded-xl font-bold text-base">
                        <SelectValue placeholder="Selecione o produto" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#111827] border-white/5 text-white">
                        {products?.map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <p className="text-sm text-slate-500 font-medium">Este produto define quais conteúdos estarão disponíveis nesta área de membros por padrão.</p>
                </div>
              </div>
            </TabsContent>
          </form>
        </Tabs>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-[#0A0D14] border-white/5 rounded-[2.5rem] p-10 max-w-md shadow-2xl">
          <AlertDialogHeader>
            <div className="h-20 w-20 bg-destructive/10 text-destructive rounded-3xl flex items-center justify-center mb-8 mx-auto">
              <Trash2 className="h-10 w-10" />
            </div>
            <AlertDialogTitle className="text-3xl font-black text-center text-white">Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription className="text-center text-lg text-slate-400 font-medium">
              Esta ação não pode ser desfeita. A área e todos os seus vínculos serão excluídos permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-4 mt-10">
            <AlertDialogCancel className="h-14 flex-1 rounded-2xl border-white/10 bg-transparent text-white font-bold hover:bg-white/5 transition-all">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => deleteMutation.mutate()}
              className="h-14 flex-1 rounded-2xl bg-destructive hover:bg-destructive/90 text-white font-bold shadow-xl shadow-destructive/20 transition-all"
            >
              Excluir agora
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
