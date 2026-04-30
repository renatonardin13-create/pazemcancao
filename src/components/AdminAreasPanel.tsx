import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { getAreas, createArea, updateArea, deleteArea, type Area } from "@/lib/areas.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { 
  Loader2, 
  Plus, 
  Edit2, 
  Trash2, 
  Save, 
  X, 
  Globe, 
  Palette, 
  Type, 
  Eye, 
  Shield, 
  ExternalLink, 
  Layout, 
  MoreVertical,
  Link2,
  RefreshCw
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";

export function AdminAreasPanel() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingArea, setEditingArea] = useState<Area | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    short_label: "",
    slug: "",
    description: "",
    primary_color: "#D4A853",
    domain: "",
    status: "draft",
    language: "pt",
  });

  const { data: areas, isLoading, error, refetch } = useQuery({
    queryKey: ["areas"],
    queryFn: getAreas,
    retry: 1,
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => createArea(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["areas"] });
      toast.success("Área criada com sucesso!");
      handleCloseDialog();
    },
    onError: (error: any) => toast.error(`Erro ao criar área: ${error.message}`),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateArea(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["areas"] });
      toast.success("Área atualizada com sucesso!");
      handleCloseDialog();
    },
    onError: (error: any) => toast.error(`Erro ao atualizar área: ${error.message}`),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteArea,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["areas"] });
      toast.success("Área excluída com sucesso!");
    },
    onError: (error: any) => toast.error(`Erro ao excluir área: ${error.message}`),
  });

  const resetForm = () => {
    setFormData({
      name: "",
      short_label: "",
      slug: "",
      description: "",
      primary_color: "#D4A853",
      domain: "",
      status: "draft",
      language: "pt",
    });
  };

  const handleOpenCreate = () => {
    setEditingArea(null);
    resetForm();
    setIsDialogOpen(true);
  };
  const handleOpenEdit = (area: Area) => {
    setEditingArea(area);
    setFormData({
      name: area.name || "",
      short_label: (area as any).short_label || "",
      slug: area.slug || "",
      description: area.description || "",
      primary_color: area.primary_color || "#D4A853",
      domain: area.domain || "",
      status: (area as any).status || "draft",
      language: area.language || "pt",
    });
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingArea(null);
    resetForm();
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: editingArea ? prev.slug : (prev.slug === generateSlug(prev.name) || !prev.slug ? generateSlug(name) : prev.slug)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let finalSlug = formData.slug || generateSlug(formData.name);
    if (!finalSlug) {
      toast.error("Por favor, informe um nome ou slug para a área.");
      return;
    }

    const { data: existingArea } = await supabase
      .from("areas")
      .select("id")
      .eq("slug", finalSlug)
      .neq("id", editingArea?.id || "00000000-0000-0000-0000-000000000000")
      .maybeSingle();

    if (existingArea) {
      toast.error("Este slug já está em uso. Por favor, escolha outro.");
      return;
    }

    const dataToSave = { ...formData, slug: finalSlug };

    if (editingArea) {
      updateMutation.mutate({ id: editingArea.id, data: dataToSave });
    } else {
      createMutation.mutate(dataToSave);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja excluir esta área? Todos os dados vinculados serão afetados.")) {
      deleteMutation.mutate(id);
    }
  };

  const handleViewAsAdmin = (area: Area) => {
    // Navigate to admin view of the area
    window.open(`/${area.slug}/admin`, "_blank");
  };

  const handleViewAsUser = (area: Area) => {
    // Navigate to user view of the area
    window.open(`/${area.slug}`, "_blank");
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-6 bg-card/40 border border-border/20 rounded-[2rem]">
        <div className="h-20 w-20 rounded-full bg-destructive/10 flex items-center justify-center">
          <Globe className="h-10 w-10 text-destructive/50" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Erro ao carregar áreas</h2>
          <p className="text-muted-foreground max-w-sm mx-auto">Não foi possível carregar a lista de áreas de membros.</p>
        </div>
        <Button 
          onClick={() => refetch()} 
          variant="outline"
          className="px-8 h-12 rounded-xl gap-2"
        >
          <RefreshCw className="h-4 w-4" /> Tentar novamente
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-20">
        <div className="relative flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-gold" />
          <p className="text-sm font-medium text-muted-foreground animate-pulse">Carregando áreas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-3xl font-black tracking-tight text-foreground">Gestão de Áreas</h2>
          <p className="text-muted-foreground/60 max-w-lg">
            Controle os diferentes ecossistemas da sua plataforma, configure domínios e personalize a experiência de cada ambiente.
          </p>
        </div>
        <Button 
          onClick={handleOpenCreate} 
          className="bg-gold hover:bg-gold/90 text-black font-bold h-11 px-6 rounded-xl shadow-lg shadow-gold/10 transition-all active:scale-95 gap-2"
        >
          <Plus className="h-5 w-5" /> Nova Área
        </Button>
      </div>

      {/* Areas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {areas?.map((area) => (
          <Card 
            key={area.id} 
            className="group relative overflow-hidden bg-card/40 border-border/20 hover:border-gold/30 hover:bg-card/60 transition-all duration-500 shadow-xl shadow-black/5"
          >
            {/* Background Glow */}
            <div 
              className="absolute -right-12 -top-12 h-32 w-32 rounded-full blur-[80px] opacity-10 group-hover:opacity-20 transition-opacity duration-500"
              style={{ backgroundColor: area.primary_color || "#D4A853" }}
            />
            
            <CardHeader className="pb-4 relative z-10">
              <div className="flex items-start justify-between">
                <div 
                  className="h-12 w-12 rounded-2xl flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-110 duration-500" 
                  style={{ backgroundColor: area.primary_color || "#D4A853" }}
                >
                  <Layout className="h-6 w-6" />
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground/50 hover:text-foreground hover:bg-white/5">
                      <MoreVertical className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 bg-card border-border/40 p-1.5 rounded-xl shadow-2xl">
                    <DropdownMenuItem 
                      onClick={() => handleOpenEdit(area)}
                      className="gap-2 focus:bg-gold/10 focus:text-gold cursor-pointer rounded-lg py-2"
                    >
                      <Edit2 className="h-4 w-4" /> Editar Configurações
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-border/20" />
                    <DropdownMenuItem 
                      onClick={() => handleDelete(area.id)}
                      className="gap-2 text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer rounded-lg py-2"
                    >
                      <Trash2 className="h-4 w-4" /> Excluir Área
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              <div className="mt-4 space-y-1">
                <CardTitle className="text-xl font-bold tracking-tight group-hover:text-gold transition-colors duration-300">
                  {area.name}
                </CardTitle>
                <CardDescription className="line-clamp-2 text-sm text-muted-foreground/70 min-h-[40px]">
                  {area.description || "Nenhuma descrição informada para esta área da plataforma."}
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="pb-6 space-y-5 relative z-10">
              {/* Meta Info */}
              <div className="space-y-2.5 p-3.5 rounded-xl bg-black/20 border border-white/5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground/50 font-medium uppercase tracking-wider">Identificador (Slug)</span>
                  <span className="font-mono text-gold/80 bg-gold/5 px-2 py-0.5 rounded-md border border-gold/10">
                    /{area.slug}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground/50 font-medium uppercase tracking-wider">Domínio</span>
                  <span className="font-medium text-foreground/80 truncate max-w-[140px]">
                    {area.domain || "Subdomínio padrão"}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleOpenEdit(area)}
                  className="h-10 rounded-xl border-border/30 hover:border-gold/30 hover:bg-gold/5 hover:text-gold transition-all gap-2 text-[10px] font-black uppercase tracking-tighter"
                >
                  <Edit2 className="h-3.5 w-3.5" /> Editar
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleViewAsAdmin(area)}
                  className="h-10 rounded-xl border-border/30 hover:border-gold/30 hover:bg-gold/5 hover:text-gold transition-all gap-2 text-[10px] font-black uppercase tracking-tighter"
                >
                  <Shield className="h-3.5 w-3.5" /> Admin
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleViewAsUser(area)}
                  className="col-span-2 h-10 rounded-xl border-border/30 hover:border-white/20 hover:bg-white/5 transition-all gap-2 text-[10px] font-black uppercase tracking-tighter"
                >
                  <Eye className="h-3.5 w-3.5" /> Ver como Aluno
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {areas?.length === 0 && (
        <div className="flex flex-col items-center justify-center py-32 border-2 border-dashed border-border/10 rounded-[2rem] bg-card/20 group">
          <div className="h-20 w-20 rounded-3xl bg-gold/5 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-gold/10 transition-all duration-500">
            <Globe className="h-10 w-10 text-gold/40" />
          </div>
          <h3 className="text-xl font-bold text-foreground/80 mb-2">Nenhuma área encontrada</h3>
          <p className="text-muted-foreground/50 text-center max-w-sm mb-8 font-light">
            Sua plataforma ainda não possui áreas configuradas. Comece criando seu primeiro ecossistema agora.
          </p>
          <Button onClick={handleOpenCreate} className="gap-2 bg-white/5 hover:bg-white/10 text-foreground border border-white/10 px-8 h-12 rounded-xl transition-all">
            <Plus className="h-5 w-5" /> Criar Primeira Área
          </Button>
        </div>
      )}

      {/* Create/Edit Modal */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[700px] bg-[#0A0A0A] border-white/5 shadow-2xl rounded-[2.5rem] p-0 overflow-hidden border">
          <form onSubmit={handleSubmit} className="flex flex-col h-full max-h-[90vh]">
            <DialogHeader className="p-8 pb-4 bg-gradient-to-b from-white/[0.02] to-transparent">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-2xl bg-gold/10 flex items-center justify-center border border-gold/20">
                  <Layout className="h-5 w-5 text-gold" />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-black tracking-tight text-white">
                    {editingArea ? "Editar Configurações" : "Criar Nova Área"}
                  </DialogTitle>
                  <DialogDescription className="text-muted-foreground/50">
                    Configure os detalhes fundamentais para esta área da sua plataforma.
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <ScrollArea className="flex-1 px-8 py-2">
              <div className="space-y-10 py-4">
                {/* Section: Identidade */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2">
                    <div className="h-5 w-1 bg-gold rounded-full" />
                    <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-gold/80">Identidade da área</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2.5">
                      <Label htmlFor="name" className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60 ml-1">
                        Título da Área <span className="text-gold">*</span>
                      </Label>
                      <div className="relative group">
                        <Type className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/30 group-focus-within:text-gold transition-colors" />
                        <Input
                          id="name"
                          placeholder="Ex: Alunos Premium"
                          value={formData.name}
                          onChange={(e) => handleNameChange(e.target.value)}
                          className="pl-12 h-14 bg-white/[0.03] border-white/5 focus:border-gold/50 focus:bg-white/[0.05] rounded-[1.25rem] transition-all text-white placeholder:text-muted-foreground/20"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2.5">
                      <Label htmlFor="short_label" className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60 ml-1">
                        Rótulo Curto
                      </Label>
                      <div className="relative group">
                        <Type className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/30 group-focus-within:text-gold transition-colors" />
                        <Input
                          id="short_label"
                          placeholder="Ex: Alunos"
                          value={formData.short_label}
                          onChange={(e) => setFormData({ ...formData, short_label: e.target.value })}
                          className="pl-12 h-14 bg-white/[0.03] border-white/5 focus:border-gold/50 focus:bg-white/[0.05] rounded-[1.25rem] transition-all text-white placeholder:text-muted-foreground/20"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <Label htmlFor="description" className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60 ml-1">
                      Descrição
                    </Label>
                    <Textarea
                      id="description"
                      placeholder="Descreva o propósito desta área..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="min-h-[100px] bg-white/[0.03] border-white/5 focus:border-gold/50 focus:bg-white/[0.05] rounded-[1.25rem] transition-all text-white placeholder:text-muted-foreground/20 p-4 resize-none"
                    />
                  </div>
                </div>

                <Separator className="bg-white/5" />

                {/* Section: Endereço */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2">
                    <div className="h-5 w-1 bg-gold rounded-full" />
                    <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-gold/80">Endereço da área</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2.5">
                      <Label htmlFor="slug" className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60 ml-1">
                        Subdomínio (Slug) <span className="text-gold">*</span>
                      </Label>
                      <div className="relative group">
                        <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/30 group-focus-within:text-gold transition-colors" />
                        <Input
                          id="slug"
                          placeholder="ex-alunos"
                          value={formData.slug}
                          onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                          className="pl-12 h-14 bg-white/[0.03] border-white/5 focus:border-gold/50 focus:bg-white/[0.05] rounded-[1.25rem] transition-all text-white font-mono text-sm"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2.5">
                      <Label htmlFor="domain" className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60 ml-1">
                        Domínio Root (Opcional)
                      </Label>
                      <div className="relative group">
                        <Globe className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/30 group-focus-within:text-gold transition-colors" />
                        <Input
                          id="domain"
                          placeholder="meusite.com.br"
                          value={formData.domain}
                          onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                          className="pl-12 h-14 bg-white/[0.03] border-white/5 focus:border-gold/50 focus:bg-white/[0.05] rounded-[1.25rem] transition-all text-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* URL Preview */}
                  <div className="p-4 rounded-2xl bg-gold/5 border border-gold/10 space-y-2">
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gold/60">
                      <Eye className="h-3 w-3" /> Preview da URL
                    </div>
                    <p className="text-sm font-mono text-gold truncate">
                      https://<span className="font-bold underline">{formData.slug || "slug"}</span>.{formData.domain || "lovable"}.com
                    </p>
                  </div>
                </div>

                <Separator className="bg-white/5" />

                {/* Section: Configurações & Visual */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-6">
                    <div className="flex items-center gap-2">
                      <div className="h-5 w-1 bg-gold rounded-full" />
                      <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-gold/80">Configurações</h3>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2.5">
                        <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60 ml-1">Status</Label>
                        <Select 
                          value={formData.status} 
                          onValueChange={(value) => setFormData({ ...formData, status: value })}
                        >
                          <SelectTrigger className="h-14 bg-white/[0.03] border-white/5 focus:border-gold/50 rounded-[1.25rem] text-white">
                            <SelectValue placeholder="Selecione o status" />
                          </SelectTrigger>
                          <SelectContent className="bg-[#0A0A0A] border-white/10 text-white rounded-xl">
                            <SelectItem value="draft" className="focus:bg-gold/10 focus:text-gold">Rascunho</SelectItem>
                            <SelectItem value="active" className="focus:bg-gold/10 focus:text-gold">Ativo</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2.5">
                        <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60 ml-1">Idioma Padrão</Label>
                        <Select 
                          value={formData.language} 
                          onValueChange={(value) => setFormData({ ...formData, language: value })}
                        >
                          <SelectTrigger className="h-14 bg-white/[0.03] border-white/5 focus:border-gold/50 rounded-[1.25rem] text-white">
                            <SelectValue placeholder="Selecione o idioma" />
                          </SelectTrigger>
                          <SelectContent className="bg-[#0A0A0A] border-white/10 text-white rounded-xl">
                            <SelectItem value="pt" className="focus:bg-gold/10 focus:text-gold">Português</SelectItem>
                            <SelectItem value="en" className="focus:bg-gold/10 focus:text-gold">English</SelectItem>
                            <SelectItem value="es" className="focus:bg-gold/10 focus:text-gold">Español</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center gap-2">
                      <div className="h-5 w-1 bg-gold rounded-full" />
                      <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-gold/80">Visual</h3>
                    </div>

                    <div className="space-y-2.5">
                      <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60 ml-1">Cor Primária</Label>
                      <div className="flex gap-3">
                        <div className="relative group flex-1">
                          <Palette className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/30 group-focus-within:text-gold transition-colors" />
                          <Input
                            value={formData.primary_color}
                            onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                            className="pl-12 h-14 bg-white/[0.03] border-white/5 focus:border-gold/50 rounded-[1.25rem] transition-all text-white font-mono"
                          />
                        </div>
                        <div className="relative h-14 w-14 rounded-[1.25rem] border border-white/5 bg-white/[0.03] p-1.5 transition-all hover:scale-105 overflow-hidden">
                          <input
                            type="color"
                            value={formData.primary_color}
                            onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                            className="absolute inset-0 h-full w-full cursor-pointer bg-transparent border-none p-0 scale-150"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>

            <DialogFooter className="p-8 pt-4 bg-gradient-to-t from-white/[0.02] to-transparent border-t border-white/5 sm:justify-end gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={handleCloseDialog}
                className="hover:bg-white/5 text-muted-foreground hover:text-white rounded-xl h-14 px-8 font-bold transition-all"
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={createMutation.isPending || updateMutation.isPending}
                className="bg-gold hover:bg-gold/90 text-black font-black h-14 px-10 rounded-xl shadow-lg shadow-gold/20 transition-all active:scale-95 disabled:opacity-50 disabled:scale-100"
              >
                {createMutation.isPending || updateMutation.isPending ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  editingArea ? "Salvar Alterações" : "Criar Área"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}