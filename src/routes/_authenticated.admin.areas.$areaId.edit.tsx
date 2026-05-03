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
  Mail,
  Calendar,
  MessageSquare,
  CheckCircle2,
  Trophy,
  LogIn,
  LifeBuoy
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
  const [tituloLogin, setTituloLogin] = useState("");
  const [subtituloLogin, setSubtituloLogin] = useState("");
  const [placeholderEmail, setPlaceholderEmail] = useState("");
  const [placeholderSenha, setPlaceholderSenha] = useState("");
  const [textoBotao, setTextoBotao] = useState("");
  const [textoAjuda, setTextoAjuda] = useState("");
  const [textoRodape, setTextoRodape] = useState("");
  const [imagemLoginUrl, setImagemLoginUrl] = useState("");
  const [layoutLogin, setLayoutLogin] = useState("right");
  const [modoFundo, setModoFundo] = useState("solid");
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
      
      // Load login configurations from the joined table
      const loginConfig = Array.isArray(area.configuracoes_login) ? area.configuracoes_login[0] : area.configuracoes_login;
      if (loginConfig) {
        setTituloLogin(loginConfig.titulo_login || "");
        setSubtituloLogin(loginConfig.subtitulo_login || "");
        setPlaceholderEmail(loginConfig.placeholder_email || "");
        setPlaceholderSenha(loginConfig.placeholder_senha || "");
        setTextoBotao(loginConfig.texto_botao || "");
        setTextoAjuda(loginConfig.texto_ajuda || "");
        setTextoRodape(loginConfig.texto_rodape || "");
        setImagemLoginUrl(loginConfig.imagem_login_url || "");
        setLayoutLogin(loginConfig.layout_login || "right");
        setModoFundo(loginConfig.modo_fundo || "solid");
      }
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
      idiomas_ativos: idiomasAtivos,
      formato_data: formatoData,
      boas_vindas: boasVindas,
      botao_continuar: botaoContinuar,
      produto_bloqueado: produtoBloqueado,
      conclusao: conclusao,
      parabens: parabens,
      botao_entrar: botaoEntrar,
      suporte_texto: suporteTexto,
      titulo_login: tituloLogin,
      subtitulo_login: subtituloLogin,
      placeholder_email: placeholderEmail,
      placeholder_senha: placeholderSenha,
      texto_botao: textoBotao,
      texto_ajuda: textoAjuda,
      texto_rodape: textoRodape,
      imagem_login_url: imagemLoginUrl,
      layout_login: layoutLogin,
      modo_fundo: modoFundo,
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
                            <SelectItem value="misto" className="focus:bg-[#D4AF37] focus:text-black font-bold">Misto (Cursos + Outros)</SelectItem>
                            <SelectItem value="cursos" className="focus:bg-[#D4AF37] focus:text-black font-bold">Apenas Cursos</SelectItem>
                            <SelectItem value="ebooks" className="focus:bg-[#D4AF37] focus:text-black font-bold">Apenas Ebooks</SelectItem>
                            <SelectItem value="pack_louvores" className="focus:bg-[#D4AF37] focus:text-black font-bold">Pack de Louvores (Spotify Style)</SelectItem>
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
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Form Column (70%) */}
                <div className="lg:col-span-8 space-y-8">
                  <div className="bg-[#111827] border border-white/5 rounded-[32px] p-8 md:p-10 space-y-10 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#D4AF37] to-transparent opacity-40" />
                    <div className="flex items-center gap-4">
                      <div className="h-14 w-14 rounded-2xl bg-[#D4AF37]/10 flex items-center justify-center border border-[#D4AF37]/10 shadow-[0_0_20px_rgba(212,175,55,0.1)]">
                        <ImageIcon className="h-7 w-7 text-[#D4AF37]" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-black text-white">Branding & Identidade</h3>
                        <p className="text-slate-500 text-sm font-medium">Configure como sua marca será vista pelos alunos</p>
                      </div>
                    </div>
                    
                    <div className="space-y-12">
                      {/* Logo Section */}
                      <div className="space-y-6">
                        <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-[#D4AF37]">1. Logo Principal</Label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start bg-white/[0.02] p-8 rounded-3xl border border-white/5">
                          <ImageUploadField
                            label=""
                            hint="PNG transparente. Mín. 256x256"
                            value={logoUrl}
                            onChange={setLogoUrl}
                            uploadLabel="Subir nova logo"
                          />
                          <div className="space-y-4">
                            <div className="space-y-2 group">
                              <Label htmlFor="logoUrl" className="text-[10px] font-bold text-slate-500 group-focus-within:text-[#D4AF37]">URL Direta da Imagem</Label>
                              <Input
                                id="logoUrl"
                                value={logoUrl}
                                onChange={(e) => setLogoUrl(e.target.value)}
                                placeholder="https://..."
                                className="h-12 bg-[#0B1220] border-white/5 focus-visible:ring-[#D4AF37] rounded-xl font-medium text-sm transition-all"
                              />
                            </div>
                            <div className="p-4 rounded-xl bg-[#0B1220]/50 border border-white/5 space-y-2">
                               <p className="text-[10px] font-bold text-slate-600 uppercase">Dica Pro</p>
                               <p className="text-[11px] text-slate-500 italic">Use logotipos com fundo transparente (PNG) para um acabamento premium sobre fundos escuros.</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* App Name & Support */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-10 border-t border-white/5">
                        <div className="space-y-3 group">
                          <Label htmlFor="appName" className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 group-focus-within:text-[#D4AF37] transition-colors">2. Nome da plataforma</Label>
                          <Input
                            id="appName"
                            value={appName}
                            onChange={(e) => setAppName(e.target.value)}
                            placeholder="Ex: Reino das Cores"
                            className="h-14 bg-[#1F2937] border-[#374151] focus-visible:ring-[#D4AF37] rounded-xl font-bold text-base transition-all hover:bg-white/[0.02]"
                          />
                        </div>
                        <div className="space-y-3 group">
                          <Label htmlFor="supportEmail" className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 group-focus-within:text-[#D4AF37] transition-colors">3. E-mail de suporte</Label>
                          <div className="relative">
                            <Input
                              id="supportEmail"
                              type="email"
                              value={supportEmail}
                              onChange={(e) => setSupportEmail(e.target.value)}
                              placeholder="suporte@exemplo.com"
                              className="h-14 bg-[#1F2937] border-[#374151] focus-visible:ring-[#D4AF37] rounded-xl font-bold text-base pl-12 transition-all hover:bg-white/[0.02]"
                            />
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                          </div>
                        </div>
                      </div>

                      {/* Favicon & Alt */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-10 border-t border-white/5">
                        <div className="space-y-6">
                           <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">4. Favicon (Ícone de aba)</Label>
                           <ImageUploadField
                             label=""
                             hint="Ícone 32x32 ou 64x64"
                             value={faviconUrl}
                             onChange={setFaviconUrl}
                             uploadLabel="Subir favicon"
                           />
                        </div>
                        <div className="space-y-3 group">
                          <Label htmlFor="logoAlt" className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 group-focus-within:text-[#D4AF37] transition-colors">5. Texto ALT da Logo</Label>
                          <Input
                            id="logoAlt"
                            value={logoAlt}
                            onChange={(e) => setLogoAlt(e.target.value)}
                            placeholder="Ex: Logo Oficial"
                            className="h-14 bg-[#1F2937] border-[#374151] focus-visible:ring-[#D4AF37] rounded-xl font-bold text-base transition-all hover:bg-white/[0.02]"
                          />
                          <p className="text-[10px] text-slate-600 italic">Melhora o SEO e a acessibilidade da sua página.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Preview Column (30%) */}
                <div className="lg:col-span-4 space-y-6">
                  <div className="bg-[#111827] border border-white/5 rounded-[32px] p-8 space-y-8 shadow-2xl sticky top-10 overflow-hidden group/preview">
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-[#D4AF37]/30 to-transparent" />
                    <div className="space-y-1 text-center">
                      <h3 className="text-xl font-black text-white">Visualização em Tempo Real</h3>
                      <p className="text-slate-600 text-[10px] font-black uppercase tracking-widest italic">Protótipo da Interface</p>
                    </div>

                    <div className="space-y-8">
                       {/* Header Preview */}
                       <div className="p-4 rounded-2xl bg-[#0B1220] border border-white/5 space-y-4 shadow-inner relative">
                          <div className="flex items-center justify-between border-b border-white/5 pb-3">
                             <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center overflow-hidden border border-white/5">
                                   {logoUrl ? <img src={logoUrl} className="h-full w-full object-contain" /> : <div className="h-2 w-2 rounded-full bg-[#D4AF37]" />}
                                </div>
                                <span className="text-[10px] font-black text-white tracking-tight truncate max-w-[80px]">{appName || "Sua Marca"}</span>
                             </div>
                             <div className="flex gap-2">
                                <div className="h-4 w-4 rounded-full bg-white/5" />
                                <div className="h-4 w-4 rounded-full bg-white/5" />
                             </div>
                          </div>
                          <div className="space-y-2">
                             <div className="h-2 w-1/3 bg-white/10 rounded-full" />
                             <div className="h-20 w-full bg-white/[0.02] rounded-xl border border-dashed border-white/10 flex items-center justify-center">
                                <span className="text-[8px] font-black text-slate-700 uppercase tracking-widest">Banner da Área</span>
                             </div>
                          </div>
                       </div>

                       {/* Browser Tab Preview */}
                       <div className="p-4 rounded-2xl bg-white/[0.01] border border-dashed border-white/10 space-y-3">
                          <Label className="text-[10px] font-black text-slate-600 uppercase tracking-widest text-center block">Na aba do navegador</Label>
                          <div className="h-10 bg-[#1F2937] rounded-xl flex items-center px-4 gap-3 shadow-2xl">
                             <div className="h-4 w-4 rounded-sm overflow-hidden bg-white/10">
                                {faviconUrl && <img src={faviconUrl} className="w-full h-full object-contain" />}
                             </div>
                             <span className="text-[10px] font-bold text-slate-300 truncate">{appName || "Sua Marca"} | Área de Membros</span>
                          </div>
                       </div>
                    </div>

                    <Button
                      onClick={handleSubmit}
                      disabled={mutation.isPending || !nome || !produtoId}
                      className="w-full h-16 bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-[#0F172A] font-black text-lg rounded-2xl shadow-[0_20px_40px_rgba(212,175,55,0.2)] hover:scale-[1.03] transition-all flex items-center justify-center gap-3"
                    >
                      {mutation.isPending ? <Loader2 className="h-7 w-7 animate-spin" /> : "Salvar Branding"}
                    </Button>
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
              <div className="space-y-10 max-w-5xl mx-auto">
                {/* 1. Configurações de idioma */}
                <div className="bg-[#111827] border border-white/5 rounded-[24px] p-8 space-y-8 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-[#D4AF37]/20" />
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center border border-[#D4AF37]/10">
                      <Languages className="h-5 w-5 text-[#D4AF37]" />
                    </div>
                    <h3 className="text-xl font-black text-white">Configurações de Localização</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-3">
                      <Label htmlFor="language" className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">Idioma principal da área</Label>
                      <Select value={language} onValueChange={setLanguage}>
                        <SelectTrigger className="h-14 bg-[#0B1220] border-white/5 focus:ring-[#D4AF37] rounded-xl font-bold text-base transition-all hover:bg-white/[0.02]">
                          <SelectValue placeholder="Selecione o idioma" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#111827] border-white/5 text-white">
                          <SelectItem value="pt-BR" className="focus:bg-[#D4AF37] focus:text-black font-bold">Português (Brasil)</SelectItem>
                          <SelectItem value="en" className="focus:bg-[#D4AF37] focus:text-black font-bold">English (US)</SelectItem>
                          <SelectItem value="es" className="focus:bg-[#D4AF37] focus:text-black font-bold">Español</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-[10px] text-slate-600 font-bold uppercase tracking-wider pl-1">Idioma padrão do sistema</p>
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="formatoData" className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">Formato de data</Label>
                      <Select value={formatoData} onValueChange={setFormatoData}>
                        <SelectTrigger className="h-14 bg-[#0B1220] border-white/5 focus:ring-[#D4AF37] rounded-xl font-bold text-base transition-all hover:bg-white/[0.02]">
                          <SelectValue placeholder="Selecione o formato" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#111827] border-white/5 text-white">
                          <SelectItem value="DD/MM/AAAA" className="focus:bg-[#D4AF37] focus:text-black font-bold">DD/MM/AAAA</SelectItem>
                          <SelectItem value="MM/DD/YYYY" className="focus:bg-[#D4AF37] focus:text-black font-bold">MM/DD/YYYY</SelectItem>
                          <SelectItem value="YYYY-MM-DD" className="focus:bg-[#D4AF37] focus:text-black font-bold">YYYY-MM-DD</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-[10px] text-slate-600 font-bold uppercase tracking-wider pl-1">Exibição de datas para o aluno</p>
                    </div>
                  </div>
                </div>

                {/* 2. Idiomas habilitados */}
                <div className="bg-[#111827] border border-white/5 rounded-[24px] p-8 space-y-8 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-[#D4AF37]/20" />
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center border border-[#D4AF37]/10">
                      <Globe className="h-5 w-5 text-[#D4AF37]" />
                    </div>
                    <h3 className="text-xl font-black text-white">Idiomas Habilitados</h3>
                  </div>

                  <div className="flex flex-wrap gap-4">
                    {[
                      { id: "pt-BR", label: "Português (Brasil)" },
                      { id: "en", label: "English" },
                      { id: "es", label: "Español" }
                    ].map((lang) => {
                      const isActive = idiomasAtivos.includes(lang.id) || lang.id === language;
                      const isMain = lang.id === language;
                      
                      return (
                        <button
                          key={lang.id}
                          type="button"
                          disabled={isMain}
                          onClick={() => {
                            if (idiomasAtivos.includes(lang.id)) {
                              setIdiomasAtivos(idiomasAtivos.filter(i => i !== lang.id));
                            } else {
                              setIdiomasAtivos([...idiomasAtivos, lang.id]);
                            }
                          }}
                          className={`
                            px-8 h-14 rounded-full font-black text-sm transition-all flex items-center gap-4 border
                            ${isActive 
                              ? 'bg-[#D4AF37]/10 border-[#D4AF37] text-[#D4AF37] shadow-[0_0_20px_rgba(212,175,55,0.15)]' 
                              : 'bg-[#0B1220] border-white/5 text-slate-600 hover:border-white/20 hover:text-slate-400'
                            }
                            ${isMain ? 'cursor-default ring-2 ring-[#D4AF37]/20' : 'hover:scale-[1.03] active:scale-[0.97]'}
                          `}
                        >
                          <div className={`h-2.5 w-2.5 rounded-full ${isActive ? 'bg-[#D4AF37] shadow-[0_0_8px_#D4AF37]' : 'bg-slate-800'}`} />
                          {lang.label} {isMain && <span className="text-[10px] bg-[#D4AF37] text-black px-2 py-0.5 rounded-full ml-1 uppercase">Padrão</span>}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-xs text-slate-500 font-medium italic">Selecione quais idiomas estarão disponíveis para troca no painel do aluno.</p>
                </div>

                {/* 3. Textos do sistema */}
                <div className="bg-[#111827] border border-white/5 rounded-[24px] p-8 space-y-10 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-[#D4AF37]/20" />
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center border border-[#D4AF37]/10">
                      <MessageSquare className="h-5 w-5 text-[#D4AF37]" />
                    </div>
                    <h3 className="text-xl font-black text-white">Personalização de Textos do Sistema</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                    <div className="space-y-3 group">
                      <Label htmlFor="boasVindas" className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 group-focus-within:text-[#D4AF37] transition-colors">1. Texto de boas-vindas</Label>
                      <div className="relative">
                        <Input
                          id="boasVindas"
                          value={boasVindas}
                          onChange={(e) => setBoasVindas(e.target.value)}
                          placeholder="Olá, seja bem-vindo de volta!"
                          className="h-14 bg-[#0B1220] border-white/5 focus-visible:ring-[#D4AF37] rounded-xl font-bold text-base transition-all pl-12"
                        />
                        <Sparkles className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-600 group-focus-within:text-[#D4AF37]/40" />
                      </div>
                    </div>

                    <div className="space-y-3 group">
                      <Label htmlFor="botaoContinuar" className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 group-focus-within:text-[#D4AF37] transition-colors">2. Texto do botão "Continuar"</Label>
                      <div className="relative">
                        <Input
                          id="botaoContinuar"
                          value={botaoContinuar}
                          onChange={(e) => setBotaoContinuar(e.target.value)}
                          placeholder="Continuar assistindo"
                          className="h-14 bg-[#0B1220] border-white/5 focus-visible:ring-[#D4AF37] rounded-xl font-bold text-base transition-all pl-12"
                        />
                        <ChevronRight className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-600 group-focus-within:text-[#D4AF37]/40" />
                      </div>
                    </div>

                    <div className="space-y-3 group">
                      <Label htmlFor="produtoBloqueado" className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 group-focus-within:text-[#D4AF37] transition-colors">3. Texto de produto bloqueado</Label>
                      <div className="relative">
                        <Input
                          id="produtoBloqueado"
                          value={produtoBloqueado}
                          onChange={(e) => setProdutoBloqueado(e.target.value)}
                          placeholder="Você ainda não possui acesso..."
                          className="h-14 bg-[#0B1220] border-white/5 focus-visible:ring-[#D4AF37] rounded-xl font-bold text-base transition-all pl-12"
                        />
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-600 group-focus-within:text-[#D4AF37]/40" />
                      </div>
                    </div>

                    <div className="space-y-3 group">
                      <Label htmlFor="conclusao" className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 group-focus-within:text-[#D4AF37] transition-colors">4. Texto de conclusão</Label>
                      <div className="relative">
                        <Input
                          id="conclusao"
                          value={conclusao}
                          onChange={(e) => setConclusao(e.target.value)}
                          placeholder="Conteúdo concluído com sucesso!"
                          className="h-14 bg-[#0B1220] border-white/5 focus-visible:ring-[#D4AF37] rounded-xl font-bold text-base transition-all pl-12"
                        />
                        <CheckCircle2 className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-600 group-focus-within:text-[#D4AF37]/40" />
                      </div>
                    </div>

                    <div className="space-y-3 group">
                      <Label htmlFor="parabens" className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 group-focus-within:text-[#D4AF37] transition-colors">5. Texto de parabéns</Label>
                      <div className="relative">
                        <Input
                          id="parabens"
                          value={parabens}
                          onChange={(e) => setParabens(e.target.value)}
                          placeholder="Parabéns por finalizar este módulo!"
                          className="h-14 bg-[#0B1220] border-white/5 focus-visible:ring-[#D4AF37] rounded-xl font-bold text-base transition-all pl-12"
                        />
                        <Trophy className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-600 group-focus-within:text-[#D4AF37]/40" />
                      </div>
                    </div>

                    <div className="space-y-3 group">
                      <Label htmlFor="botaoEntrar" className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 group-focus-within:text-[#D4AF37] transition-colors">6. Texto do botão "Entrar"</Label>
                      <div className="relative">
                        <Input
                          id="botaoEntrar"
                          value={botaoEntrar}
                          onChange={(e) => setBotaoEntrar(e.target.value)}
                          placeholder="Acessar plataforma"
                          className="h-14 bg-[#0B1220] border-white/5 focus-visible:ring-[#D4AF37] rounded-xl font-bold text-base transition-all pl-12"
                        />
                        <LogIn className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-600 group-focus-within:text-[#D4AF37]/40" />
                      </div>
                    </div>

                    <div className="space-y-3 md:col-span-2 group">
                      <Label htmlFor="suporteTexto" className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 group-focus-within:text-[#D4AF37] transition-colors">7. Texto de suporte</Label>
                      <div className="relative">
                        <Input
                          id="suporteTexto"
                          value={suporteTexto}
                          onChange={(e) => setSuporteTexto(e.target.value)}
                          placeholder="Precisa de ajuda? Fale com nosso suporte"
                          className="h-14 bg-[#0B1220] border-white/5 focus-visible:ring-[#D4AF37] rounded-xl font-bold text-base transition-all pl-12"
                        />
                        <LifeBuoy className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-600 group-focus-within:text-[#D4AF37]/40" />
                      </div>
                    </div>
                  </div>

                  <div className="pt-8 border-t border-white/5">
                    <Button
                      onClick={handleSubmit}
                      disabled={mutation.isPending || !nome || !produtoId}
                      className="w-full h-16 bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-black font-black text-lg rounded-2xl shadow-[0_20px_40px_rgba(212,175,55,0.2)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 group"
                    >
                      {mutation.isPending ? (
                        <Loader2 className="h-7 w-7 animate-spin" />
                      ) : (
                        <>
                          <Save className="h-6 w-6 group-hover:scale-110 transition-transform" />
                          Salvar Localização e Textos
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="login" className="mt-0 outline-none">
              <div className="max-w-[1100px] mx-auto space-y-8">
                <div className="bg-[#111827] border border-white/5 rounded-[24px] p-8 md:p-12 space-y-12 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-[#D4AF37]/20" />
                  
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-[#D4AF37]/10 flex items-center justify-center border border-[#D4AF37]/10 shadow-[0_0_20px_rgba(212,175,55,0.1)]">
                      <Lock className="h-6 w-6 text-[#D4AF37]" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-white">Configurações da Página de Login</h3>
                      <p className="text-slate-500 text-sm font-medium">Personalize a experiência de entrada dos seus alunos</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-16 gap-y-10">
                    {/* COLUNA ESQUERDA */}
                    <div className="space-y-10">
                      <div className="space-y-3 group">
                        <Label htmlFor="tituloLogin" className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 group-focus-within:text-[#D4AF37] transition-colors">Título da tela de login</Label>
                        <Input
                          id="tituloLogin"
                          value={tituloLogin}
                          onChange={(e) => setTituloLogin(e.target.value)}
                          placeholder="Bem-vindo ao Reino das Cores Kids"
                          className="h-14 bg-[#1F2937] border-[#374151] focus-visible:ring-[#D4AF37] rounded-xl font-bold text-base transition-all hover:bg-white/[0.02]"
                        />
                      </div>

                      <div className="space-y-3 group">
                        <Label htmlFor="placeholderEmail" className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 group-focus-within:text-[#D4AF37] transition-colors">Placeholder do email</Label>
                        <Input
                          id="placeholderEmail"
                          value={placeholderEmail}
                          onChange={(e) => setPlaceholderEmail(e.target.value)}
                          placeholder="Seu melhor email"
                          className="h-14 bg-[#1F2937] border-[#374151] focus-visible:ring-[#D4AF37] rounded-xl font-bold text-base transition-all hover:bg-white/[0.02]"
                        />
                      </div>

                      <div className="space-y-3 group">
                        <Label htmlFor="textoBotaoLogin" className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 group-focus-within:text-[#D4AF37] transition-colors">Texto do botão</Label>
                        <Input
                          id="textoBotaoLogin"
                          value={textoBotao}
                          onChange={(e) => setTextoBotao(e.target.value)}
                          placeholder="Entrar agora"
                          className="h-14 bg-[#1F2937] border-[#374151] focus-visible:ring-[#D4AF37] rounded-xl font-bold text-base transition-all hover:bg-white/[0.02]"
                        />
                      </div>

                      <div className="space-y-3 group">
                        <Label htmlFor="textoRodape" className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 group-focus-within:text-[#D4AF37] transition-colors">Texto do rodapé (opcional)</Label>
                        <Input
                          id="textoRodape"
                          value={textoRodape}
                          onChange={(e) => setTextoRodape(e.target.value)}
                          placeholder="Suporte: contato@empresa.com"
                          className="h-14 bg-[#1F2937] border-[#374151] focus-visible:ring-[#D4AF37] rounded-xl font-bold text-base transition-all hover:bg-white/[0.02]"
                        />
                      </div>

                      <div className="space-y-4 pt-4 border-t border-white/5">
                        <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Imagem de Login</Label>
                        <div className="space-y-6">
                          <ImageUploadField
                            label=""
                            hint="Aceita JPG/PNG. Sugestão: 4:3 ou 16:9"
                            value={imagemLoginUrl}
                            onChange={setImagemLoginUrl}
                            uploadLabel="Enviar imagem de destaque"
                          />
                          <div className="space-y-2 group">
                            <Label htmlFor="imagemLoginUrl" className="text-[10px] font-bold text-slate-500 group-focus-within:text-[#D4AF37]">Ou colar URL da imagem</Label>
                            <Input
                              id="imagemLoginUrl"
                              value={imagemLoginUrl}
                              onChange={(e) => setImagemLoginUrl(e.target.value)}
                              placeholder="https://exemplo.com/login-hero.jpg"
                              className="h-12 bg-[#1F2937] border-[#374151] focus-visible:ring-[#D4AF37] rounded-xl font-medium text-sm transition-all"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* COLUNA DIREITA */}
                    <div className="space-y-10">
                      <div className="space-y-3 group">
                        <Label htmlFor="subtituloLogin" className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 group-focus-within:text-[#D4AF37] transition-colors">Subtítulo</Label>
                        <Input
                          id="subtituloLogin"
                          value={subtituloLogin}
                          onChange={(e) => setSubtituloLogin(e.target.value)}
                          placeholder="Entre para acessar seu conteúdo exclusivo"
                          className="h-14 bg-[#1F2937] border-[#374151] focus-visible:ring-[#D4AF37] rounded-xl font-bold text-base transition-all hover:bg-white/[0.02]"
                        />
                      </div>

                      <div className="space-y-3 group">
                        <Label htmlFor="placeholderSenha" className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 group-focus-within:text-[#D4AF37] transition-colors">Placeholder da senha</Label>
                        <Input
                          id="placeholderSenha"
                          type="text"
                          value={placeholderSenha}
                          onChange={(e) => setPlaceholderSenha(e.target.value)}
                          placeholder="Sua senha secreta"
                          className="h-14 bg-[#1F2937] border-[#374151] focus-visible:ring-[#D4AF37] rounded-xl font-bold text-base transition-all hover:bg-white/[0.02]"
                        />
                      </div>

                      <div className="space-y-3 group">
                        <Label htmlFor="textoAjuda" className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 group-focus-within:text-[#D4AF37] transition-colors">Texto de ajuda</Label>
                        <Input
                          id="textoAjuda"
                          value={textoAjuda}
                          onChange={(e) => setTextoAjuda(e.target.value)}
                          placeholder="Esqueci minha senha"
                          className="h-14 bg-[#1F2937] border-[#374151] focus-visible:ring-[#D4AF37] rounded-xl font-bold text-base transition-all hover:bg-white/[0.02]"
                        />
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="layoutLogin" className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">Layout da página</Label>
                        <Select value={layoutLogin} onValueChange={setLayoutLogin}>
                          <SelectTrigger className="h-14 bg-[#1F2937] border-[#374151] focus:ring-[#D4AF37] rounded-xl font-bold text-base transition-all hover:bg-white/[0.02]">
                            <SelectValue placeholder="Selecione o layout" />
                          </SelectTrigger>
                          <SelectContent className="bg-[#111827] border-white/5 text-white">
                            <SelectItem value="right" className="focus:bg-[#D4AF37] focus:text-black font-bold">Imagem à direita</SelectItem>
                            <SelectItem value="left" className="focus:bg-[#D4AF37] focus:text-black font-bold">Imagem à esquerda</SelectItem>
                            <SelectItem value="centered" className="focus:bg-[#D4AF37] focus:text-black font-bold">Sem imagem (formulário centralizado)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="modoFundo" className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Modo de fundo</Label>
                        <Select value={modoFundo} onValueChange={setModoFundo}>
                          <SelectTrigger className="h-14 bg-[#1F2937] border-[#374151] focus:ring-[#D4AF37] rounded-xl font-bold text-base transition-all hover:bg-white/[0.02]">
                            <SelectValue placeholder="Selecione o modo de fundo" />
                          </SelectTrigger>
                          <SelectContent className="bg-[#111827] border-white/5 text-white">
                            <SelectItem value="solid" className="focus:bg-[#D4AF37] focus:text-black font-bold">Cor sólida</SelectItem>
                            <SelectItem value="gradient" className="focus:bg-[#D4AF37] focus:text-black font-bold">Gradiente</SelectItem>
                            <SelectItem value="image" className="focus:bg-[#D4AF37] focus:text-black font-bold">Imagem de fundo</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {/* Preview Box - Professional Simulation */}
                      <div className="pt-4 space-y-4">
                        <div className="flex items-center justify-center gap-2">
                           <div className="h-px flex-1 bg-white/5" />
                           <Label className="text-[10px] font-black uppercase tracking-widest text-slate-600">Simulação Visual</Label>
                           <div className="h-px flex-1 bg-white/5" />
                        </div>
                        <div className={`p-4 rounded-[20px] border border-white/5 h-48 flex items-center justify-center overflow-hidden relative shadow-2xl bg-[#0B1220] group/preview`}>
                            {modoFundo === 'gradient' && <div className="absolute inset-0 bg-gradient-to-br from-[#D4AF37]/20 to-transparent" />}
                            {modoFundo === 'image' && imagemLoginUrl && <img src={imagemLoginUrl} className="absolute inset-0 w-full h-full object-cover opacity-30" />}
                            {layoutLogin === 'centered' ? (
                               <div className="bg-[#111827]/90 p-5 rounded-xl border border-white/10 w-40 space-y-3 z-10 shadow-2xl scale-90 group-hover/preview:scale-100 transition-transform duration-500">
                                  <div className="h-1.5 w-1/2 bg-white/10 rounded-full" />
                                  <div className="h-4 w-full bg-[#1F2937] border border-white/5 rounded-md" />
                                  <div className="h-4 w-full bg-[#1F2937] border border-white/5 rounded-md" />
                                  <div className="h-8 w-full bg-[#D4AF37] rounded-lg shadow-lg shadow-[#D4AF37]/10" />
                               </div>
                            ) : layoutLogin === 'left' ? (
                               <div className="flex w-full h-full gap-3 p-2 z-10">
                                  <div className="w-[45%] bg-[#1F2937]/50 rounded-xl flex items-center justify-center overflow-hidden border border-white/5 relative">
                                     {imagemLoginUrl ? (
                                       <img src={imagemLoginUrl} className="object-cover w-full h-full" alt="Hero" />
                                     ) : (
                                       <ImageIcon className="h-8 w-8 text-slate-700" />
                                     )}
                                     <div className="absolute inset-0 bg-black/20" />
                                  </div>
                                  <div className="flex-1 bg-[#111827]/90 p-4 rounded-xl border border-white/10 space-y-2 flex flex-col justify-center shadow-2xl">
                                     <div className="h-1 w-1/3 bg-white/10 rounded-full" />
                                     <div className="h-3 w-full bg-[#1F2937] border border-white/5 rounded-sm" />
                                     <div className="h-3 w-full bg-[#1F2937] border border-white/5 rounded-sm" />
                                     <div className="h-6 w-full bg-[#D4AF37] rounded-md mt-2" />
                                  </div>
                               </div>
                            ) : (
                               <div className="flex w-full h-full gap-3 p-2 z-10">
                                  <div className="flex-1 bg-[#111827]/90 p-4 rounded-xl border border-white/10 space-y-2 flex flex-col justify-center shadow-2xl">
                                     <div className="h-1 w-1/3 bg-white/10 rounded-full" />
                                     <div className="h-3 w-full bg-[#1F2937] border border-white/5 rounded-sm" />
                                     <div className="h-3 w-full bg-[#1F2937] border border-white/5 rounded-sm" />
                                     <div className="h-6 w-full bg-[#D4AF37] rounded-md mt-2" />
                                  </div>
                                  <div className="w-[45%] bg-[#1F2937]/50 rounded-xl flex items-center justify-center overflow-hidden border border-white/5 relative">
                                     {imagemLoginUrl ? (
                                       <img src={imagemLoginUrl} className="object-cover w-full h-full" alt="Hero" />
                                     ) : (
                                       <ImageIcon className="h-8 w-8 text-slate-700" />
                                     )}
                                     <div className="absolute inset-0 bg-black/20" />
                                  </div>
                               </div>
                            )}
                         </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-10 border-t border-white/5">
                    <Button
                      onClick={handleSubmit}
                      disabled={mutation.isPending || !nome || !produtoId}
                      className="w-full h-16 bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-[#0F172A] font-black text-lg rounded-2xl shadow-[0_20px_40px_rgba(212,175,55,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 group"
                    >
                      {mutation.isPending ? (
                        <Loader2 className="h-7 w-7 animate-spin" />
                      ) : (
                        <div className="flex items-center gap-2">
                           <Save className="h-6 w-6 group-hover:scale-110 transition-transform" />
                           Salvar Configurações de Login
                        </div>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="produtos" className="mt-0 outline-none flex items-center justify-center min-h-[60vh] py-12">
              <div className="max-w-[850px] w-full mx-auto">
                {/* Centralized Card */}
                <div className="bg-[#111827] border border-white/5 rounded-[40px] p-16 md:p-24 flex flex-col items-center text-center space-y-10 shadow-[0_40px_100px_rgba(0,0,0,0.6)] relative overflow-hidden group">
                  {/* Premium Glow Effect */}
                  <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-48 bg-[#D4AF37]/10 blur-[100px] group-hover:bg-[#D4AF37]/15 transition-all duration-700" />
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-transparent via-[#D4AF37]/40 to-transparent" />
                  
                  <div className="h-32 w-32 rounded-[40px] bg-gradient-to-br from-[#1F2937] to-[#111827] flex items-center justify-center text-[#D4AF37] border border-white/5 shadow-2xl relative z-10 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                    <Package className="h-16 w-16" />
                  </div>
                  
                  <div className="space-y-6 max-w-xl relative z-10">
                    <h3 className="text-4xl font-black text-white tracking-tight">Gerenciar conteúdos</h3>
                    <p className="text-slate-400 text-xl font-medium leading-relaxed">
                      Os produtos exibidos para os alunos desta área são definidos no catálogo central e distribuídos através das suas ofertas.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8 w-full relative z-10">
                    <Button 
                      type="button"
                      variant="outline"
                      onClick={() => navigate({ to: "/admin/courses" })}
                      className="h-16 px-10 rounded-2xl border-white/5 bg-white/[0.02] text-white font-black hover:bg-white/5 hover:border-white/10 transition-all flex items-center gap-4 w-full sm:w-auto text-lg shadow-xl"
                    >
                      <Package className="h-7 w-7 text-slate-500" />

                      Ir para o catálogo
                    </Button>
                    <Button 
                      type="button"
                      onClick={() => navigate({ to: "/admin/offers" })}
                      className="h-14 px-10 rounded-xl bg-[#D4AF37] text-[#0F172A] font-black hover:bg-[#D4AF37]/90 transition-all flex items-center gap-3 w-full sm:w-auto text-base shadow-xl shadow-[#D4AF37]/10"
                    >
                      <Star className="h-6 w-6 fill-[#0F172A]" />
                      Ir para ofertas
                    </Button>
                  </div>

                  {/* Quick Selector (Keep functionality but integrated elegantly) */}
                  <div className="pt-10 w-full max-w-md border-t border-white/5">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 mb-4">Vincular produto principal agora</p>
                    <Select value={produtoId} onValueChange={setProdutoId}>
                      <SelectTrigger className="h-14 bg-[#0B1220] border-white/5 focus:ring-[#D4AF37] rounded-xl font-bold text-base transition-all">
                        <SelectValue placeholder={produtoId ? "Trocar produto vinculado" : "Selecionar um produto..."} />
                      </SelectTrigger>
                      <SelectContent className="bg-[#111827] border-white/5 text-white">
                        {products?.map((product) => (
                          <SelectItem key={product.id} value={product.id} className="focus:bg-[#D4AF37] focus:text-black font-bold">
                            {product.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
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
